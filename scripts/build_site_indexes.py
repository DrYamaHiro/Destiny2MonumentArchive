#!/usr/bin/env python3
"""Build compact JSON indexes for the local static viewer."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEXTDB_DIR = PROJECT_ROOT / "data" / "static" / "textdb"
TTK_DIR = PROJECT_ROOT / "data" / "static" / "ttk"
SITE_DATA_DIR = PROJECT_ROOT / "site" / "data"

LANGUAGES = ("en", "ja")

STAT_HASH_ALIASES = {
    4043523819: "impact",
    1240592695: "range",
    155624089: "stability",
    943549884: "handling",
    4188031367: "reload",
    1345609583: "aimAssist",
    3555269338: "zoom",
    2715839340: "recoil",
    4284893193: "rpm",
    3871231066: "magazine",
    3614673599: "blastRadius",
    2523465841: "velocity",
    2961396640: "chargeTime",
    447667954: "drawTime",
    1591432999: "accuracy",
    2714457168: "airborne",
    3897883278: "defense",
    392767087: "health",
}

STAT_NAME_ALIASES = {
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

GROUP_ORDER = ("character", "equipment", "appearance", "inventory", "mods", "all")
SECTION_ORDER = (
    "hunter",
    "warlock",
    "titan",
    "subclasses",
    "weapons",
    "armor",
    "ghosts",
    "ships",
    "sparrows",
    "emblems",
    "artifacts",
    "clan_banners",
    "emotes",
    "finishers",
    "shaders",
    "weapon_ornaments",
    "armor_ornaments",
    "ghost_projections",
    "transmat_effects",
    "quests",
    "bounties",
    "lore",
    "engrams",
    "packages",
    "consumables",
    "materials",
    "currencies",
    "weapon_mods",
    "armor_mods",
    "ghost_mods",
    "perks",
    "traits",
    "intrinsics",
    "enhanced_traits",
    "other",
)

WEAPON_TYPE_CATEGORIES = {
    5: "auto_rifle",
    6: "hand_cannon",
    7: "pulse_rifle",
    8: "scout_rifle",
    9: "fusion_rifle",
    10: "sniper_rifle",
    11: "shotgun",
    12: "machine_gun",
    13: "rocket_launcher",
    14: "sidearm",
    54: "sword",
    153950757: "grenade_launcher",
    2489664120: "trace_rifle",
    3317538576: "bow",
    3871742104: "glaive",
    3954685534: "submachine_gun",
    1504945536: "linear_fusion_rifle",
}

WEAPON_SLOT_CATEGORIES = {2, 3, 4}
ARMOR_SLOT_CATEGORIES = {45, 46, 47, 48, 49, 55}
CLASS_CATEGORIES = {
    21: "warlock",
    22: "titan",
    23: "hunter",
}

SECTION_LABELS = {
    "en": {
        "hunter": "Hunter",
        "warlock": "Warlock",
        "titan": "Titan",
        "subclasses": "Subclasses",
        "weapons": "Weapons",
        "armor": "Armor",
        "ghosts": "Ghosts",
        "ships": "Ships",
        "sparrows": "Sparrows",
        "emblems": "Emblems",
        "artifacts": "Seasonal Artifacts",
        "clan_banners": "Clan Banners",
        "emotes": "Emotes",
        "finishers": "Finishers",
        "shaders": "Shaders",
        "weapon_ornaments": "Weapon Ornaments",
        "armor_ornaments": "Armor Ornaments",
        "ghost_projections": "Ghost Projections",
        "transmat_effects": "Transmat Effects",
        "quests": "Quests",
        "bounties": "Bounties",
        "lore": "Lore",
        "engrams": "Engrams",
        "packages": "Packages",
        "consumables": "Consumables",
        "materials": "Materials",
        "currencies": "Currencies",
        "weapon_mods": "Weapon Mods",
        "armor_mods": "Armor Mods",
        "ghost_mods": "Ghost Mods",
        "perks": "Perks",
        "traits": "Traits",
        "intrinsics": "Intrinsics",
        "enhanced_traits": "Enhanced Traits",
        "other": "Other",
    },
    "ja": {
        "hunter": "ハンター",
        "warlock": "ウォーロック",
        "titan": "タイタン",
        "subclasses": "サブクラス",
        "weapons": "武器",
        "armor": "防具",
        "ghosts": "ゴースト",
        "ships": "船",
        "sparrows": "スパロー",
        "emblems": "エンブレム",
        "artifacts": "シーズンアーティファクト",
        "clan_banners": "クランバナー",
        "emotes": "感情表現",
        "finishers": "フィニッシャー",
        "shaders": "シェーダー",
        "weapon_ornaments": "武器装飾",
        "armor_ornaments": "防具装飾",
        "ghost_projections": "ゴーストのプロジェクション",
        "transmat_effects": "トランスマット効果",
        "quests": "クエスト",
        "bounties": "バウンティ",
        "lore": "伝承",
        "engrams": "エングラム",
        "packages": "パッケージ",
        "consumables": "消費アイテム",
        "materials": "材料",
        "currencies": "通貨",
        "weapon_mods": "武器改造パーツ",
        "armor_mods": "防具改造パーツ",
        "ghost_mods": "ゴースト改造パーツ",
        "perks": "パーク",
        "traits": "特性",
        "intrinsics": "内在効果",
        "enhanced_traits": "強化特性",
        "other": "その他",
    },
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


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


def stat_map(row: dict[str, Any]) -> dict[str, int | float]:
    stats: dict[str, int | float] = {}
    for stat in row.get("statValues") or []:
        stat_hash = stat.get("statHash")
        key = STAT_HASH_ALIASES.get(stat_hash) or STAT_NAME_ALIASES.get(stat.get("name") or "")
        value = stat.get("value")
        if key and value is not None:
            stats[key] = value
    return stats


def label_for_category(row: dict[str, Any], category_hash: int) -> str:
    hashes = row.get("itemCategoryHashes") or []
    names = row.get("categoryNames") or []
    for index, current_hash in enumerate(hashes):
        if current_hash == category_hash and index < len(names):
            return names[index] or ""
    return ""


def category_labels(row: dict[str, Any], category_hashes: set[int]) -> list[str]:
    labels: list[str] = []
    for category_hash in row.get("itemCategoryHashes") or []:
        if category_hash in category_hashes:
            label = label_for_category(row, category_hash)
            if label:
                labels.append(label)
    return labels


def contains_any(text: str, tokens: tuple[str, ...]) -> bool:
    folded = text.lower()
    return any(token.lower() in folded for token in tokens)


def classify(row: dict[str, Any]) -> dict[str, Any]:
    category_hashes = set(row.get("itemCategoryHashes") or [])
    item_type = row.get("itemType")
    type_name = row.get("itemTypeDisplayName") or ""
    type_name_folded = type_name.lower()
    groups: set[str] = set()
    sections: set[str] = set()

    is_weapon = item_type == 3
    is_armor = item_type == 2
    if is_weapon:
        groups.add("equipment")
        sections.add("weapons")
    if is_armor:
        groups.add("equipment")
        sections.add("armor")

    class_ids = [class_id for hash_value, class_id in CLASS_CATEGORIES.items() if hash_value in category_hashes]
    if class_ids:
        groups.add("character")
        sections.update(class_ids)
    if 50 in category_hashes:
        groups.add("character")
        groups.add("equipment")
        sections.add("subclasses")

    if item_type == 24 or 39 in category_hashes:
        groups.add("equipment")
        sections.add("ghosts")
    if item_type == 21 or 42 in category_hashes:
        groups.add("equipment")
        sections.add("ships")
    if item_type == 22 or 43 in category_hashes:
        groups.add("equipment")
        sections.add("sparrows")
    if item_type == 14 or 19 in category_hashes:
        groups.add("equipment")
        sections.add("emblems")
    if 1378222069 in category_hashes or contains_any(type_name, ("Seasonal Artifact", "シーズンアーティファクト")):
        groups.add("equipment")
        groups.add("inventory")
        sections.add("artifacts")
    if 58 in category_hashes:
        groups.add("equipment")
        sections.add("clan_banners")

    if 44 in category_hashes or contains_any(type_name, ("Emote", "感情表現")):
        groups.add("appearance")
        sections.add("emotes")
    if contains_any(type_name, ("Finisher", "フィニッシャー")) or 1112488720 in category_hashes:
        groups.add("appearance")
        sections.add("finishers")
    if 41 in category_hashes or contains_any(type_name, ("Shader", "シェーダー")):
        groups.add("appearance")
        sections.add("shaders")
    if contains_any(type_name, ("Weapon Ornament", "武器装飾", "武器の装飾")) or 3124752623 in category_hashes:
        groups.add("appearance")
        sections.add("weapon_ornaments")
    if contains_any(type_name, ("Armor Ornament", "Universal Ornament", "アーマーの装飾", "万能装飾")):
        groups.add("appearance")
        sections.add("armor_ornaments")
    if 1404791674 in category_hashes or contains_any(type_name, ("Ghost Projection", "ゴーストのプロジェクション")):
        groups.add("appearance")
        sections.add("ghost_projections")
    if 203 in category_hashes or contains_any(type_name, ("Transmat", "トランスマット")):
        groups.add("appearance")
        sections.add("transmat_effects")

    if item_type == 12 or 53 in category_hashes:
        groups.add("inventory")
        sections.add("quests")
    if item_type == 26 or contains_any(type_name, ("Bounty", "バウンティ")):
        groups.add("inventory")
        sections.add("bounties")
    if item_type == 20 or contains_any(type_name, ("Lore", "伝承")):
        groups.add("inventory")
        sections.add("lore")
    if item_type == 8 or 34 in category_hashes or contains_any(type_name, ("Engram", "エングラム")):
        groups.add("inventory")
        sections.add("engrams")
    if item_type == 25 or 268598612 in category_hashes:
        groups.add("inventory")
        sections.add("packages")
    if item_type == 9 or 35 in category_hashes:
        groups.add("inventory")
        sections.add("consumables")
    if 40 in category_hashes:
        groups.add("inventory")
        sections.add("materials")
    if 18 in category_hashes:
        groups.add("inventory")
        sections.add("currencies")

    if 610365472 in category_hashes or contains_any(type_name, ("Weapon Mod", "武器の改造パーツ", "武器改造パーツ")):
        groups.add("mods")
        sections.add("weapon_mods")
    if 979 in category_hashes or contains_any(type_name, ("Armor Mod", "アーマーの改造パーツ", "一般アーマー改造パーツ")):
        groups.add("mods")
        sections.add("armor_mods")
    if 1449602859 in category_hashes or 4176831154 in category_hashes or contains_any(type_name, ("Ghost Mod", "ゴーストのモジュール", "ゴーストの改造パーツ")):
        groups.add("mods")
        sections.add("ghost_mods")
    if row.get("plugSetHashes") or item_type == 19:
        groups.add("mods")
    if contains_any(type_name, ("Trait", "特性", "Origin Trait", "起源特性")):
        sections.add("traits")
    if contains_any(type_name, ("Intrinsic", "内在効果")):
        sections.add("intrinsics")
    if contains_any(type_name, ("Enhanced Trait", "Enhanced Intrinsic", "強化特性", "強化内在効果")):
        sections.add("enhanced_traits")
    if "mods" in groups and not sections.intersection({"weapon_mods", "armor_mods", "ghost_mods", "traits", "intrinsics", "enhanced_traits"}):
        sections.add("perks")

    if not groups:
        groups.add("all")
    if not sections:
        sections.add("other")

    ordered_groups = [group for group in GROUP_ORDER if group in groups and group != "all"]
    if "all" in groups and not ordered_groups:
        ordered_groups.append("all")
    ordered_sections = [section for section in SECTION_ORDER if section in sections]
    return {
        "groups": ordered_groups,
        "sections": ordered_sections,
        "primaryGroup": ordered_groups[0] if ordered_groups else "all",
        "primarySection": ordered_sections[0] if ordered_sections else "other",
        "isWeapon": is_weapon,
        "isArmor": is_armor,
        "classIds": class_ids,
    }


def first_label(row: dict[str, Any], category_hashes: set[int], fallback: str = "") -> str:
    labels = category_labels(row, category_hashes)
    return labels[0] if labels else fallback


def ttk_rows_by_hash() -> dict[int, dict[str, Any]]:
    path = TTK_DIR / "ttk_candidates.csv"
    if not path.exists():
        return {}
    output: dict[int, dict[str, Any]] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            weapon_hash = (row.get("weapon_hash") or "").strip()
            if not weapon_hash:
                continue
            output[int(weapon_hash)] = {
                "status": row.get("formula_confidence") or "Needs Verification",
                "mode": row.get("mode") or "PvP",
                "sandboxVersion": row.get("sandbox_version") or "",
                "resilienceTier": row.get("resilience_tier") or "",
                "optimalTtkMs": row.get("optimal_ttk_ms") or "",
                "bodyTtkMs": row.get("body_ttk_ms") or "",
                "conditions": row.get("conditions") or "",
                "sourceExtractionId": row.get("source_extraction_id") or "",
            }
    return output


def default_ttk() -> dict[str, Any]:
    return {
        "status": "pending",
        "mode": "PvP",
        "sandboxVersion": "",
        "resilienceTier": "",
        "optimalTtkMs": "",
        "bodyTtkMs": "",
        "conditions": "",
        "sourceExtractionId": "",
    }


def compact_catalog_item(row: dict[str, Any], lang: str, ttk_by_hash: dict[int, dict[str, Any]]) -> dict[str, Any]:
    stats = stat_map(row)
    classification = classify(row)
    weapon_type = first_label(row, set(WEAPON_TYPE_CATEGORIES), row.get("itemTypeDisplayName") or "")
    weapon_type_id = ""
    for category_hash in row.get("itemCategoryHashes") or []:
        if category_hash in WEAPON_TYPE_CATEGORIES:
            weapon_type_id = WEAPON_TYPE_CATEGORIES[category_hash]
            break
    weapon_slot = first_label(row, WEAPON_SLOT_CATEGORIES, row.get("bucketName") or "")
    armor_slot = first_label(row, ARMOR_SLOT_CATEGORIES, row.get("itemTypeDisplayName") or "")
    damage_types = [name for name in row.get("damageTypeNames") or [] if name]
    damage_type = next((name for name in damage_types if name.lower() != "raid" and name != "レイド"), "")
    ammo_type = row.get("ammoType") or 0
    class_label = row.get("className") or first_label(row, set(CLASS_CATEGORIES))
    section_label = SECTION_LABELS[lang].get(classification["primarySection"], classification["primarySection"])
    ttk = ttk_by_hash.get(row.get("hash")) if classification["isWeapon"] else None

    search = " ".join(
        [
            row.get("name") or "",
            row.get("description") or "",
            row.get("itemTypeDisplayName") or "",
            row.get("bucketName") or "",
            row.get("tierTypeName") or "",
            class_label,
            weapon_type,
            weapon_slot,
            damage_type,
            AMMO_LABEL.get(ammo_type, AMMO_LABEL[0]).get(lang, ""),
            armor_slot,
            " ".join(row.get("categoryNames") or []),
            " ".join(SECTION_LABELS[lang].get(section, section) for section in classification["sections"]),
        ]
    ).lower()

    return {
        "hash": row.get("hash"),
        "name": row.get("name") or "",
        "description": clean_text(row.get("description")),
        "icon": icon_url(row.get("icon")),
        "type": row.get("itemTypeDisplayName") or section_label,
        "bucket": row.get("bucketName") or "",
        "tier": row.get("tierTypeName") or "",
        "itemType": row.get("itemType"),
        "itemSubType": row.get("itemSubType"),
        "groups": classification["groups"],
        "sections": classification["sections"],
        "primaryGroup": classification["primaryGroup"],
        "primarySection": classification["primarySection"],
        "sectionLabel": section_label,
        "class": class_label,
        "classIds": classification["classIds"],
        "categories": row.get("categoryNames") or [],
        "categoryHashes": row.get("itemCategoryHashes") or [],
        "weaponType": weapon_type if classification["isWeapon"] else "",
        "weaponTypeId": weapon_type_id,
        "weaponSlot": weapon_slot if classification["isWeapon"] else "",
        "ammoType": ammo_type,
        "ammo": AMMO_LABEL.get(ammo_type, AMMO_LABEL[0]).get(lang, ""),
        "damageTypes": damage_types,
        "damageType": damage_type,
        "armorSlot": armor_slot if classification["isArmor"] else "",
        "stats": stats,
        "rpm": stats.get("rpm"),
        "plugSetHashes": row.get("plugSetHashes") or [],
        "ttk": ttk or (default_ttk() if classification["isWeapon"] else None),
        "search": search,
    }


def unique_sorted(rows: list[dict[str, Any]], key: str) -> list[str]:
    return sorted({str(row.get(key) or "") for row in rows if row.get(key)})


def unique_from_list(rows: list[dict[str, Any]], key: str) -> list[str]:
    values: set[str] = set()
    for row in rows:
        for value in row.get(key) or []:
            if value:
                values.add(str(value))
    return sorted(values)


def counts(rows: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    bucket: dict[str, int] = {}
    for row in rows:
        label = str(row.get(key) or "")
        if not label:
            continue
        bucket[label] = bucket.get(label, 0) + 1
    return [
        {"label": label, "count": count}
        for label, count in sorted(bucket.items(), key=lambda item: (-item[1], item[0]))
    ]


def counts_from_list(rows: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    bucket: dict[str, int] = {}
    for row in rows:
        for label in row.get(key) or []:
            if not label:
                continue
            bucket[str(label)] = bucket.get(str(label), 0) + 1
    return [
        {"label": label, "count": count}
        for label, count in sorted(bucket.items(), key=lambda item: (-item[1], item[0]))
    ]


def load_catalog_raw(lang: str) -> list[dict[str, Any]]:
    catalog_path = TEXTDB_DIR / f"catalog_items.{lang}.json"
    if catalog_path.exists():
        return read_json(catalog_path)
    rows: list[dict[str, Any]] = []
    for name in ("weapons", "exotic_armor", "plugs", "sandbox_perks"):
        path = TEXTDB_DIR / f"{name}.{lang}.json"
        if path.exists():
            rows.extend(read_json(path))
    return rows


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
            "TTK is modeled as a per-weapon PvP field and is filled from curated text tables.",
        ],
    }
    write_json(SITE_DATA_DIR / "index.json", site_index)
    ttk_by_hash = ttk_rows_by_hash()

    for lang in LANGUAGES:
        raw_rows = load_catalog_raw(lang)
        catalog = [compact_catalog_item(row, lang, ttk_by_hash) for row in raw_rows if row.get("name")]
        catalog.sort(key=lambda row: (row["primaryGroup"], row["primarySection"], row["type"], row["name"], row["hash"]))
        weapons = [row for row in catalog if "weapons" in row.get("sections", [])]
        armor = [row for row in catalog if "armor" in row.get("sections", [])]
        exotic_armor = [row for row in armor if row.get("tier") in {"Exotic", "エキゾチック"}]

        write_json(SITE_DATA_DIR / f"catalog.{lang}.json", catalog)
        write_json(SITE_DATA_DIR / f"weapons.{lang}.json", weapons)
        write_json(SITE_DATA_DIR / f"armor.{lang}.json", armor)
        write_json(SITE_DATA_DIR / f"exotic_armor.{lang}.json", exotic_armor)

        facets = {
            "groups": unique_from_list(catalog, "groups"),
            "sections": unique_from_list(catalog, "sections"),
            "itemTypes": unique_sorted(catalog, "type"),
            "buckets": unique_sorted(catalog, "bucket"),
            "weaponTypes": unique_sorted(weapons, "weaponType"),
            "weaponSlots": unique_sorted(weapons, "weaponSlot"),
            "ammo": unique_sorted(weapons, "ammo"),
            "damageTypes": unique_sorted(weapons, "damageType"),
            "armorClasses": unique_sorted(armor, "class"),
            "armorSlots": unique_sorted(armor, "armorSlot"),
        }
        write_json(SITE_DATA_DIR / f"facets.{lang}.json", facets)

        summary = {
            "manifestVersion": manifest.get("manifestVersion"),
            "builtAt": site_index["builtAt"],
            "catalogCount": len(catalog),
            "weaponCount": len(weapons),
            "armorCount": len(armor),
            "exoticArmorCount": len(exotic_armor),
            "groupCounts": counts_from_list(catalog, "groups"),
            "sectionCounts": counts_from_list(catalog, "sections"),
            "weaponTypes": counts(weapons, "weaponType"),
            "weaponSlots": counts(weapons, "weaponSlot"),
            "ammo": counts(weapons, "ammo"),
            "damageTypes": counts(weapons, "damageType"),
            "armorClasses": counts(armor, "class"),
            "armorSlots": counts(armor, "armorSlot"),
            "itemTypes": counts(catalog, "type"),
        }
        write_json(SITE_DATA_DIR / f"summary.{lang}.json", summary)

    print(json.dumps({"built": str(SITE_DATA_DIR), "manifestVersion": site_index["manifestVersion"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
