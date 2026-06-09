#!/usr/bin/env python3
"""Sync selected Destiny 2 Manifest components and build compact text DB files.

This script is intentionally text-first:
- raw Bungie component JSON is cached under data/local_cache/ and ignored by git
- curated JSON outputs are written under data/static/textdb/
- images are not downloaded

The script does not read any .secrets file unless --env-file is explicitly passed.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


BUNGIE_ROOT = "https://www.bungie.net"
MANIFEST_ENDPOINT = f"{BUNGIE_ROOT}/Platform/Destiny2/Manifest/"

DEFAULT_LANGUAGES = ("en", "ja")
DEFAULT_COMPONENTS = (
    "DestinyInventoryItemDefinition",
    "DestinyItemCategoryDefinition",
    "DestinyInventoryBucketDefinition",
    "DestinyStatDefinition",
    "DestinySandboxPerkDefinition",
    "DestinyPlugSetDefinition",
    "DestinyDamageTypeDefinition",
    "DestinyClassDefinition",
    "DestinyCollectibleDefinition",
    "DestinySeasonDefinition",
)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
LOCAL_CACHE_DIR = PROJECT_ROOT / "data" / "local_cache" / "manifest"
STATIC_DIR = PROJECT_ROOT / "data" / "static"
TEXTDB_DIR = STATIC_DIR / "textdb"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def safe_version(version: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", version)


def load_env_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"env file not found: {path}")

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def request_json(url: str, api_key: str | None = None, timeout: int = 60, retries: int = 3) -> Any:
    headers = {
        "Accept": "application/json",
        "User-Agent": "D2MonumentArchiveLocalDev/0.1",
    }
    if api_key:
        headers["X-API-Key"] = api_key

    req = Request(url, headers=headers)
    for attempt in range(retries + 1):
        try:
            with urlopen(req, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            if exc.code >= 500 and attempt < retries:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {exc.code} for {url}: {detail[:500]}") from exc
        except URLError as exc:
            if attempt < retries:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"network error for {url}: {exc}") from exc
    raise RuntimeError(f"request failed after retries: {url}")


def request_bytes(url: str, api_key: str | None = None, timeout: int = 180, retries: int = 3) -> bytes:
    headers = {
        "Accept": "application/json",
        "User-Agent": "D2MonumentArchiveLocalDev/0.1",
    }
    if api_key:
        headers["X-API-Key"] = api_key

    req = Request(url, headers=headers)
    for attempt in range(retries + 1):
        try:
            with urlopen(req, timeout=timeout) as response:
                return response.read()
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            if exc.code >= 500 and attempt < retries:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {exc.code} for {url}: {detail[:500]}") from exc
        except URLError as exc:
            if attempt < retries:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"network error for {url}: {exc}") from exc
    raise RuntimeError(f"request failed after retries: {url}")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_bungie_path(path: str) -> str:
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return BUNGIE_ROOT + path


def download_component(
    manifest: dict[str, Any],
    version: str,
    language: str,
    component: str,
    api_key: str | None,
    force: bool,
) -> dict[str, Any]:
    paths = manifest["Response"]["jsonWorldComponentContentPaths"]
    try:
        component_path = paths[language][component]
    except KeyError as exc:
        raise KeyError(f"component not found for {language}: {component}") from exc

    cache_path = LOCAL_CACHE_DIR / safe_version(version) / language / f"{component}.json"
    if cache_path.exists() and not force:
        return read_json(cache_path)

    print(f"download {language}/{component}")
    url = resolve_bungie_path(component_path)
    payload = request_bytes(url, api_key=api_key)
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_bytes(payload)
    return json.loads(payload.decode("utf-8"))


def display(defn: dict[str, Any]) -> dict[str, str]:
    props = defn.get("displayProperties") or {}
    return {
        "name": props.get("name") or "",
        "description": props.get("description") or "",
        "icon": props.get("icon") or "",
    }


def category_names(item: dict[str, Any], category_defs: dict[str, Any]) -> list[str]:
    names: list[str] = []
    for category_hash in item.get("itemCategoryHashes") or []:
        category = category_defs.get(str(category_hash)) or {}
        name = display(category).get("name") or ""
        if name:
            names.append(name)
    return names


def stat_values(item: dict[str, Any], stat_defs: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    stats = ((item.get("stats") or {}).get("stats") or {})
    for stat_hash, stat in stats.items():
        stat_def = stat_defs.get(str(stat_hash)) or {}
        output.append(
            {
                "statHash": int(stat_hash),
                "name": display(stat_def).get("name") or "",
                "value": stat.get("value"),
                "minimum": stat.get("minimum"),
                "maximum": stat.get("maximum"),
            }
        )
    output.sort(key=lambda row: (row["name"], row["statHash"]))
    return output


def investment_stats(item: dict[str, Any], stat_defs: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for stat in item.get("investmentStats") or []:
        stat_hash = stat.get("statTypeHash")
        if not stat_hash:
            continue
        stat_def = stat_defs.get(str(stat_hash)) or {}
        output.append(
            {
                "statHash": int(stat_hash),
                "name": display(stat_def).get("name") or "",
                "value": stat.get("value"),
                "isConditionallyActive": bool(stat.get("isConditionallyActive")),
            }
        )
    output.sort(key=lambda row: (row["name"], row["statHash"]))
    return output


def bucket_name(item: dict[str, Any], bucket_defs: dict[str, Any]) -> str:
    bucket_hash = ((item.get("inventory") or {}).get("bucketTypeHash"))
    bucket = bucket_defs.get(str(bucket_hash)) or {}
    return display(bucket).get("name") or ""


def class_name(item: dict[str, Any], class_defs: dict[str, Any]) -> str:
    class_type = item.get("classType")
    for class_def in class_defs.values():
        if class_def.get("classType") == class_type:
            return display(class_def).get("name") or ""
    return ""


def damage_type_names(item: dict[str, Any], damage_defs: dict[str, Any]) -> list[str]:
    names: list[str] = []
    for damage_hash in item.get("damageTypeHashes") or []:
        damage_def = damage_defs.get(str(damage_hash)) or {}
        name = display(damage_def).get("name") or ""
        if name:
            names.append(name)
    return names


def socket_entries(item: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    sockets = item.get("sockets") or {}
    for index, socket in enumerate(sockets.get("socketEntries") or []):
        reusable_hashes = [
            plug.get("plugItemHash")
            for plug in socket.get("reusablePlugItems") or []
            if plug.get("plugItemHash")
        ]
        reusable_set = socket.get("reusablePlugSetHash")
        randomized_set = socket.get("randomizedPlugSetHash")
        initial_hash = socket.get("singleInitialItemHash")
        if not reusable_hashes and not reusable_set and not randomized_set and not initial_hash:
            continue
        output.append(
            {
                "index": index,
                "socketTypeHash": socket.get("socketTypeHash"),
                "singleInitialItemHash": initial_hash,
                "reusablePlugSetHash": reusable_set,
                "randomizedPlugSetHash": randomized_set,
                "reusablePlugItemHashes": reusable_hashes,
                "defaultVisible": bool(socket.get("defaultVisible")),
            }
        )
    return output


def compact_item_base(
    hash_key: str,
    item: dict[str, Any],
    category_defs: dict[str, Any],
    bucket_defs: dict[str, Any],
    stat_defs: dict[str, Any],
    class_defs: dict[str, Any],
    damage_defs: dict[str, Any],
) -> dict[str, Any]:
    shown = display(item)
    inventory = item.get("inventory") or {}
    equipping = item.get("equippingBlock") or {}
    sockets = item.get("sockets") or {}
    plug_set_hashes: list[int] = []
    compact_sockets = socket_entries(item)
    for socket in sockets.get("socketEntries") or []:
        for key in ("randomizedPlugSetHash", "reusablePlugSetHash"):
            value = socket.get(key)
            if value:
                plug_set_hashes.append(value)

    return {
        "hash": int(item.get("hash", int(hash_key))),
        "name": shown["name"],
        "description": shown["description"],
        "icon": shown["icon"],
        "iconWatermark": item.get("iconWatermark") or "",
        "iconWatermarkShelved": item.get("iconWatermarkShelved") or "",
        "displayVersionWatermarkIcons": item.get("displayVersionWatermarkIcons") or [],
        "collectibleHash": item.get("collectibleHash"),
        "itemType": item.get("itemType"),
        "itemSubType": item.get("itemSubType"),
        "itemTypeDisplayName": item.get("itemTypeDisplayName") or "",
        "itemCategoryHashes": item.get("itemCategoryHashes") or [],
        "categoryNames": category_names(item, category_defs),
        "bucketTypeHash": inventory.get("bucketTypeHash"),
        "bucketName": bucket_name(item, bucket_defs),
        "tierType": inventory.get("tierType"),
        "tierTypeName": inventory.get("tierTypeName") or "",
        "classType": item.get("classType"),
        "className": class_name(item, class_defs),
        "equipmentSlotTypeHash": equipping.get("equipmentSlotTypeHash"),
        "ammoType": equipping.get("ammoType"),
        "damageTypes": item.get("damageTypes") or [],
        "damageTypeHashes": item.get("damageTypeHashes") or [],
        "damageTypeNames": damage_type_names(item, damage_defs),
        "statValues": stat_values(item, stat_defs),
        "investmentStats": investment_stats(item, stat_defs),
        "plugSetHashes": sorted(set(plug_set_hashes)),
        "socketEntries": compact_sockets,
    }


CATALOG_ITEM_TYPES = {
    2,   # Armor
    3,   # Weapons
    8,   # Engrams
    9,   # Consumables
    12,  # Quest steps
    14,  # Emblems
    19,  # Mods, perks, cosmetics
    20,  # Lore and records
    21,  # Ships
    22,  # Vehicles/Sparrows
    24,  # Ghost shells
    25,  # Packages
    26,  # Bounties
}

CATALOG_CATEGORY_HASHES = {
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,  # weapons and weapon types
    18, 19, 20, 21, 22, 23,  # currency, emblems, armor, classes
    35, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56, 58, 59,
    153950757,    # Grenade Launchers
    2489664120,   # Trace Rifles
    3317538576,   # Bows
    3871742104,   # Glaives
    3954685534,   # Submachine Guns
    1504945536,   # Linear Fusion Rifles
    610365472,    # Weapon Mods
    979,          # Armor Mods
    1449602859,   # Ghost Mods
    4176831154,   # Ghost Mod Perks
    1404791674,   # Ghost Projections
    177260082,    # Ship Mods
    203,          # Transmat Effects
    598,          # Weapon Mod Ornaments
    3124752623,   # Weapon Mod Ornaments
    1378222069,   # Seasonal Artifacts
    1112488720,   # Finishers
}


def include_catalog_item(item: dict[str, Any]) -> bool:
    shown = display(item)
    if not shown["name"]:
        return False

    category_hashes = set(item.get("itemCategoryHashes") or [])
    if item.get("equippingBlock") or item.get("plug"):
        return True
    if item.get("itemType") in CATALOG_ITEM_TYPES:
        return True
    return bool(category_hashes & CATALOG_CATEGORY_HASHES)


def extract_textdb(version: str, language: str, components: dict[str, dict[str, Any]]) -> dict[str, int]:
    inventory = components.get("DestinyInventoryItemDefinition") or {}
    categories = components.get("DestinyItemCategoryDefinition") or {}
    buckets = components.get("DestinyInventoryBucketDefinition") or {}
    stats = components.get("DestinyStatDefinition") or {}
    classes = components.get("DestinyClassDefinition") or {}
    damage_types = components.get("DestinyDamageTypeDefinition") or {}
    sandbox_perks = components.get("DestinySandboxPerkDefinition") or {}
    plug_sets = components.get("DestinyPlugSetDefinition") or {}

    catalog_items: list[dict[str, Any]] = []
    weapons: list[dict[str, Any]] = []
    armor: list[dict[str, Any]] = []
    exotic_armor: list[dict[str, Any]] = []
    plugs: list[dict[str, Any]] = []
    referenced_plug_sets: set[int] = set()

    for hash_key, item in inventory.items():
        shown = display(item)
        if not shown["name"]:
            continue

        item_type = item.get("itemType")
        tier_type = (item.get("inventory") or {}).get("tierType")
        base = compact_item_base(hash_key, item, categories, buckets, stats, classes, damage_types)
        referenced_plug_sets.update(base["plugSetHashes"])

        if include_catalog_item(item):
            catalog_items.append(base)

        if item_type == 3 and item.get("equippingBlock"):
            weapons.append(base)

        if item_type == 2 and item.get("equippingBlock"):
            armor.append(base)

        if item_type == 2 and tier_type == 6 and item.get("equippingBlock"):
            exotic_armor.append(base)

        if item.get("plug"):
            perks = item.get("perks") or []
            plugs.append(
                {
                    "hash": base["hash"],
                    "name": base["name"],
                    "description": base["description"],
                    "icon": base["icon"],
                    "itemTypeDisplayName": base["itemTypeDisplayName"],
                    "itemCategoryHashes": base["itemCategoryHashes"],
                    "categoryNames": base["categoryNames"],
                    "plugCategoryHash": (item.get("plug") or {}).get("plugCategoryHash"),
                    "plugCategoryIdentifier": (item.get("plug") or {}).get("plugCategoryIdentifier") or "",
                    "investmentStats": base["investmentStats"],
                    "perkHashes": [perk.get("perkHash") for perk in perks if perk.get("perkHash")],
                }
            )

    sandbox_rows: list[dict[str, Any]] = []
    for hash_key, perk in sandbox_perks.items():
        shown = display(perk)
        if not shown["name"]:
            continue
        sandbox_rows.append(
            {
                "hash": int(perk.get("hash", int(hash_key))),
                "name": shown["name"],
                "description": shown["description"],
                "icon": shown["icon"],
                "isDisplayable": perk.get("isDisplayable"),
            }
        )

    plug_set_rows: list[dict[str, Any]] = []
    for hash_key, plug_set in plug_sets.items():
        try:
            plug_set_hash = int(plug_set.get("hash", int(hash_key)))
        except (TypeError, ValueError):
            continue
        if plug_set_hash not in referenced_plug_sets:
            continue
        plug_items: list[dict[str, Any]] = []
        seen_plug_hashes: set[int] = set()
        for key in ("reusablePlugItems", "randomizedPlugItems"):
            for plug in plug_set.get(key) or []:
                plug_hash = plug.get("plugItemHash")
                if plug_hash and plug_hash not in seen_plug_hashes:
                    seen_plug_hashes.add(plug_hash)
                    plug_items.append(
                        {
                            "hash": plug_hash,
                            "currentlyCanRoll": plug.get("currentlyCanRoll"),
                        }
                    )
        if not plug_items:
            continue
        plug_set_rows.append(
            {
                "hash": plug_set_hash,
                "plugItems": plug_items,
                "plugItemHashes": [plug["hash"] for plug in plug_items],
            }
        )

    for rows in (catalog_items, weapons, armor, exotic_armor, plugs, sandbox_rows):
        rows.sort(key=lambda row: (row.get("name") or "", row.get("hash") or 0))
    plug_set_rows.sort(key=lambda row: row["hash"])

    write_json(TEXTDB_DIR / f"catalog_items.{language}.json", catalog_items)
    write_json(TEXTDB_DIR / f"weapons.{language}.json", weapons)
    write_json(TEXTDB_DIR / f"armor.{language}.json", armor)
    write_json(TEXTDB_DIR / f"exotic_armor.{language}.json", exotic_armor)
    write_json(TEXTDB_DIR / f"plugs.{language}.json", plugs)
    write_json(TEXTDB_DIR / f"plug_sets.{language}.json", plug_set_rows)
    write_json(TEXTDB_DIR / f"sandbox_perks.{language}.json", sandbox_rows)

    return {
        "catalogItems": len(catalog_items),
        "weapons": len(weapons),
        "armor": len(armor),
        "exoticArmor": len(exotic_armor),
        "plugs": len(plugs),
        "plugSets": len(plug_set_rows),
        "sandboxPerks": len(sandbox_rows),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync Destiny 2 Manifest text DB files.")
    parser.add_argument("--env-file", type=Path, help="Optional env file containing BUNGIE_API_KEY.")
    parser.add_argument("--force", action="store_true", help="Redownload cached component JSON.")
    parser.add_argument("--metadata-only", action="store_true", help="Only fetch manifest metadata.")
    parser.add_argument(
        "--languages",
        nargs="+",
        default=list(DEFAULT_LANGUAGES),
        help="Manifest languages to fetch. Default: en ja",
    )
    parser.add_argument(
        "--components",
        nargs="+",
        default=list(DEFAULT_COMPONENTS),
        help="Manifest components to fetch.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.env_file:
        load_env_file(args.env_file)

    api_key = os.environ.get("BUNGIE_API_KEY")
    print("fetch manifest metadata")
    manifest = request_json(MANIFEST_ENDPOINT, api_key=api_key)
    if manifest.get("ErrorCode") != 1:
        print(json.dumps(manifest, ensure_ascii=False, indent=2)[:2000], file=sys.stderr)
        raise RuntimeError(f"Bungie manifest request failed: ErrorCode={manifest.get('ErrorCode')}")

    response = manifest["Response"]
    version = response["version"]
    summary = {
        "application": "D2 Monument Archive - Local Dev",
        "syncedAt": utc_now(),
        "manifestVersion": version,
        "languages": args.languages,
        "components": args.components,
        "metadataEndpoint": MANIFEST_ENDPOINT,
        "apiKeyProvided": bool(api_key),
    }
    write_json(STATIC_DIR / "manifest_summary.json", summary)

    if args.metadata_only:
        print(f"metadata only: {version}")
        return 0

    counts: dict[str, dict[str, int]] = {}
    for language in args.languages:
        loaded: dict[str, dict[str, Any]] = {}
        for component in args.components:
            loaded[component] = download_component(
                manifest=manifest,
                version=version,
                language=language,
                component=component,
                api_key=api_key,
                force=args.force,
            )
            time.sleep(0.1)

        counts[language] = extract_textdb(version, language, loaded)

    index = {
        **summary,
        "counts": counts,
        "outputs": {
            "catalogItems": [f"catalog_items.{lang}.json" for lang in args.languages],
            "weapons": [f"weapons.{lang}.json" for lang in args.languages],
            "armor": [f"armor.{lang}.json" for lang in args.languages],
            "exoticArmor": [f"exotic_armor.{lang}.json" for lang in args.languages],
            "plugs": [f"plugs.{lang}.json" for lang in args.languages],
            "plugSets": [f"plug_sets.{lang}.json" for lang in args.languages],
            "sandboxPerks": [f"sandbox_perks.{lang}.json" for lang in args.languages],
        },
        "notes": [
            "Raw component JSON is cached under data/local_cache/manifest and should not be committed.",
            "Image files are not downloaded; icon fields keep Bungie manifest paths only.",
            "TTK tables are not derived from manifest data and must be maintained separately.",
        ],
    }
    write_json(TEXTDB_DIR / "index.json", index)
    print(json.dumps({"manifestVersion": version, "counts": counts}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
