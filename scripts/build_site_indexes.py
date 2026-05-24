#!/usr/bin/env python3
"""Build compact JSON indexes for the local static viewer."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEXTDB_DIR = PROJECT_ROOT / "data" / "static" / "textdb"
SITE_DATA_DIR = PROJECT_ROOT / "site" / "data"

LANGUAGES = ("en", "ja")

STAT_ALIASES = {
    "Impact": "impact",
    "Range": "range",
    "Stability": "stability",
    "Handling": "handling",
    "Reload Speed": "reload",
    "Aim Assistance": "aimAssist",
    "Zoom": "zoom",
    "Recoil Direction": "recoil",
    "Rounds Per Minute": "rpm",
    "Magazine": "magazine",
    "Blast Radius": "blastRadius",
    "Velocity": "velocity",
    "Charge Time": "chargeTime",
    "Draw Time": "drawTime",
    "Accuracy": "accuracy",
    "Airborne Effectiveness": "airborne",
    "Defense": "defense",
    "Health": "health",
}

AMMO_LABEL = {
    0: {"en": "", "ja": ""},
    1: {"en": "Primary", "ja": "プライマリ"},
    2: {"en": "Special", "ja": "特殊"},
    3: {"en": "Heavy", "ja": "ヘビー"},
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def stat_map(row: dict[str, Any]) -> dict[str, int | float]:
    stats: dict[str, int | float] = {}
    for stat in row.get("statValues") or []:
        key = STAT_ALIASES.get(stat.get("name") or "")
        value = stat.get("value")
        if key and value is not None:
            stats[key] = value
    return stats


def clean_text(value: str | None, limit: int = 280) -> str:
    if not value:
        return ""
    value = " ".join(str(value).split())
    return value[:limit]


def icon_url(icon_path: str | None) -> str:
    if not icon_path:
        return ""
    if icon_path.startswith("http://") or icon_path.startswith("https://"):
        return icon_path
    return "https://www.bungie.net" + icon_path


def compact_weapon(row: dict[str, Any], lang: str) -> dict[str, Any]:
    ammo_type = row.get("ammoType") or 0
    stats = stat_map(row)
    return {
        "hash": row.get("hash"),
        "name": row.get("name") or "",
        "description": clean_text(row.get("description")),
        "icon": icon_url(row.get("icon")),
        "type": row.get("itemTypeDisplayName") or "",
        "bucket": row.get("bucketName") or "",
        "tier": row.get("tierTypeName") or "",
        "ammoType": ammo_type,
        "ammo": AMMO_LABEL.get(ammo_type, AMMO_LABEL[0]).get(lang, ""),
        "categories": row.get("categoryNames") or [],
        "stats": stats,
        "rpm": stats.get("rpm"),
        "plugSetHashes": row.get("plugSetHashes") or [],
        "search": " ".join(
            [
                row.get("name") or "",
                row.get("itemTypeDisplayName") or "",
                row.get("bucketName") or "",
                row.get("tierTypeName") or "",
                " ".join(row.get("categoryNames") or []),
            ]
        ).lower(),
    }


def compact_armor(row: dict[str, Any], lang: str) -> dict[str, Any]:
    return {
        "hash": row.get("hash"),
        "name": row.get("name") or "",
        "description": clean_text(row.get("description")),
        "icon": icon_url(row.get("icon")),
        "type": row.get("itemTypeDisplayName") or "",
        "bucket": row.get("bucketName") or "",
        "tier": row.get("tierTypeName") or "",
        "class": row.get("className") or "",
        "categories": row.get("categoryNames") or [],
        "stats": stat_map(row),
        "search": " ".join(
            [
                row.get("name") or "",
                row.get("className") or "",
                row.get("itemTypeDisplayName") or "",
                row.get("bucketName") or "",
                " ".join(row.get("categoryNames") or []),
            ]
        ).lower(),
    }


def unique_sorted(rows: list[dict[str, Any]], key: str) -> list[str]:
    return sorted({str(row.get(key) or "") for row in rows if row.get(key)})


def main() -> int:
    manifest = read_json(TEXTDB_DIR / "index.json")
    site_index = {
        "application": "D2 Monument Archive",
        "builtAt": utc_now(),
        "manifestVersion": manifest.get("manifestVersion"),
        "sourceSyncedAt": manifest.get("syncedAt"),
        "languages": list(LANGUAGES),
        "notes": [
            "Site data is compact text JSON generated from data/static/textdb.",
            "Image fields reference Bungie icon URLs; image files are not stored locally.",
        ],
    }
    write_json(SITE_DATA_DIR / "index.json", site_index)

    for lang in LANGUAGES:
        weapons_raw = read_json(TEXTDB_DIR / f"weapons.{lang}.json")
        armor_raw = read_json(TEXTDB_DIR / f"exotic_armor.{lang}.json")

        weapons = [compact_weapon(row, lang) for row in weapons_raw if row.get("name")]
        armor = [compact_armor(row, lang) for row in armor_raw if row.get("name")]

        weapons.sort(key=lambda row: (row["type"], row["name"], row["hash"]))
        armor.sort(key=lambda row: (row["class"], row["type"], row["name"], row["hash"]))

        write_json(SITE_DATA_DIR / f"weapons.{lang}.json", weapons)
        write_json(SITE_DATA_DIR / f"exotic_armor.{lang}.json", armor)

        facets = {
            "weaponTypes": unique_sorted(weapons, "type"),
            "ammo": unique_sorted(weapons, "ammo"),
            "armorClasses": unique_sorted(armor, "class"),
            "armorTypes": unique_sorted(armor, "type"),
        }
        write_json(SITE_DATA_DIR / f"facets.{lang}.json", facets)

    print(json.dumps({"built": str(SITE_DATA_DIR), "manifestVersion": site_index["manifestVersion"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
