#!/usr/bin/env python3
"""Build compact JSON indexes for the local static viewer."""

from __future__ import annotations

import csv
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEXTDB_DIR = PROJECT_ROOT / "data" / "static" / "textdb"
TTK_DIR = PROJECT_ROOT / "data" / "static" / "ttk"
SITE_DATA_DIR = PROJECT_ROOT / "site" / "data"
MANIFEST_CACHE_DIR = PROJECT_ROOT / "data" / "local_cache" / "manifest"

LANGUAGES = ("en", "ja")
DEFAULT_PVP_TARGET_HP = 230
DEFAULT_WEAPON_PARAMETER = 100
DEFAULT_WP_MAX_BONUS_PCT = 0.05
MAX_PLUG_OPTIONS_PER_SOCKET = 240

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
    2996146975: "weaponStat",
    4244567218: "melee",
    1735777505: "grenade",
    144602215: "super",
    1943323491: "classAbility",
    3493869314: "melee",
    2135857333: "classAbility",
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
    "Weapons": "weaponStat",
    "Melee": "melee",
    "Grenade": "grenade",
    "Super": "super",
    "Class": "classAbility",
}

PLUG_EXCLUDE_TOKENS = (
    "shader",
    "memento",
    "keepsake",
    "ornament",
    "tracker",
    "projection",
    "transmat",
    "spawnfx",
    "emblem",
)

PLUG_INCLUDE_TOKENS = (
    "barrel",
    "barrels",
    "magazine",
    "magazines",
    "battery",
    "batteries",
    "trait",
    "origin",
    "intrinsic",
    "masterwork",
    "masterworks",
    "mod",
    "mods",
    "enhancements",
    "artifice",
    "armor_archetypes",
    "armor_tiering",
    "item_sets",
    "set bonus",
    "セットボーナス",
    "tuning",
    "scope",
    "sight",
    "stock",
    "grip",
    "frame",
    "bowstring",
    "arrow",
    "blade",
    "guard",
    "haft",
    "launcher_tube",
)

PLUG_GROUP_LABELS = {
    "barrel": {"en": "Barrel / Sight", "ja": "バレル / サイト"},
    "magazine": {"en": "Magazine / Battery", "ja": "マガジン / バッテリー"},
    "trait": {"en": "Trait", "ja": "パーク"},
    "origin": {"en": "Origin Trait", "ja": "起源特性"},
    "mod": {"en": "Mod", "ja": "Mod"},
    "masterwork": {"en": "Masterwork", "ja": "マスターワーク"},
    "armor_tuning": {"en": "Armor Tuning", "ja": "防具チューニング"},
    "armor_archetype": {"en": "Armor Archetype", "ja": "防具アーキタイプ"},
    "set_bonus": {"en": "Set Bonus", "ja": "セットボーナス"},
    "intrinsic": {"en": "Intrinsic", "ja": "内在特性"},
    "socket": {"en": "Socket", "ja": "ソケット"},
}

MASTERWORK_STAT_TOKENS = {
    "stat.stability": "stability",
    "stat.range": "range",
    "stat.handling": "handling",
    "stat.reload": "reload",
    "stat.damage": "impact",
    "stat.blast_radius": "blastRadius",
    "stat.projectile_speed": "velocity",
    "stat.accuracy": "accuracy",
    "stat.charge_time": "chargeTime",
    "stat.draw_time": "drawTime",
    "stat.shield_duration": "shieldDuration",
}

WEAPON_MASTERWORK_BASE_STATS = {"range", "stability", "handling", "reload"}
WEAPON_MASTERWORK_EXTRA_STATS = {
    "bow": {"accuracy", "drawTime"},
    "fusion_rifle": {"chargeTime"},
    "grenade_launcher": {"blastRadius", "velocity"},
    "glaive": {"range", "handling", "reload", "shieldDuration"},
    "linear_fusion_rifle": {"chargeTime"},
    "rocket_launcher": {"blastRadius", "velocity"},
    "sword": {"impact"},
}

DR_TTK_FAMILY_BY_WEAPON_TYPE = {
    "auto_rifle": "Auto Rifles",
    "hand_cannon": "Hand Cannons",
    "pulse_rifle": "Pulse Rifles",
    "scout_rifle": "Scout Rifles",
    "fusion_rifle": "Fusion Rifles",
    "shotgun": "Shotguns",
    "sidearm": "Sidearms",
    "submachine_gun": "SMGs",
}

FRAME_ARCHETYPE_TOKENS = (
    ("rapid-fire slug", "Rapid Fire Slug"),
    ("rapid fire slug", "Rapid Fire Slug"),
    ("速射スラグ", "Rapid Fire Slug"),
    ("pinpoint slug", "Pinpoint Slug"),
    ("precision slug", "Pinpoint Slug"),
    ("精密スラグ", "Pinpoint Slug"),
    ("aggressive burst", "Aggressive Burst"),
    ("アグレッシブバースト", "Aggressive Burst"),
    ("adaptive burst", "Adaptive Burst"),
    ("順応バースト", "Adaptive Burst"),
    ("heavy burst", "Heavy Burst"),
    ("ヘビーバースト", "Heavy Burst"),
    ("spread shot", "Spread Shot"),
    ("散弾", "Spread Shot"),
    ("shot package", "Shot Package"),
    ("mida synergy", "MIDA Synergy"),
    ("midaシナジー", "MIDA Synergy"),
    ("legacy pr-55", "Legacy PR-55"),
    ("rapid-fire", "Rapid Fire"),
    ("rapid fire", "Rapid Fire"),
    ("速射", "Rapid Fire"),
    ("high-impact", "High Impact"),
    ("high impact", "High Impact"),
    ("高威力", "High Impact"),
    ("lightweight", "Lightweight"),
    ("軽量", "Lightweight"),
    ("precision", "Precision"),
    ("精密", "Precision"),
    ("aggressive", "Aggressive"),
    ("好戦", "Aggressive"),
    ("adaptive", "Adaptive"),
    ("順応", "Adaptive"),
)

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


def latest_manifest_definition_path(lang: str, filename: str) -> Path | None:
    if not MANIFEST_CACHE_DIR.exists():
        return None
    candidates = [
        path / lang / filename
        for path in sorted(MANIFEST_CACHE_DIR.iterdir(), key=lambda item: item.stat().st_mtime, reverse=True)
        if path.is_dir()
    ]
    return next((path for path in candidates if path.exists()), None)


def load_release_lookup(lang: str) -> dict[int, dict[str, Any]]:
    path = latest_manifest_definition_path(lang, "DestinyInventoryItemDefinition.json")
    if not path:
        return {}
    output: dict[int, dict[str, Any]] = {}
    for hash_key, item in read_json(path).items():
        icon_watermark = item.get("iconWatermark") or ""
        icon_watermark_shelved = item.get("iconWatermarkShelved") or ""
        display_watermarks = item.get("displayVersionWatermarkIcons") or []
        collectible_hash = item.get("collectibleHash")
        if not icon_watermark and not icon_watermark_shelved and not display_watermarks and not collectible_hash:
            continue
        output[int(hash_key)] = {
            "iconWatermark": icon_watermark,
            "iconWatermarkShelved": icon_watermark_shelved,
            "displayVersionWatermarkIcons": display_watermarks,
            "collectibleHash": collectible_hash,
        }
    return output


def release_info_for(row: dict[str, Any], release_lookup: dict[int, dict[str, Any]]) -> dict[str, Any]:
    release = release_lookup.get(int(row.get("hash") or 0), {})
    watermark = release.get("iconWatermark") or row.get("iconWatermark") or ""
    shelved = release.get("iconWatermarkShelved") or row.get("iconWatermarkShelved") or ""
    version_icons = release.get("displayVersionWatermarkIcons") or row.get("displayVersionWatermarkIcons") or []
    if not isinstance(version_icons, list):
        version_icons = []
    collectible_hash = release.get("collectibleHash") or row.get("collectibleHash") or ""
    compact = {
        "watermarkIcon": icon_url(watermark),
        "watermarkShelvedIcon": icon_url(shelved),
        "versionWatermarkIcons": [icon_url(icon) for icon in version_icons if icon],
        "collectibleHash": collectible_hash,
    }
    return {key: value for key, value in compact.items() if value}


def stat_map(row: dict[str, Any]) -> dict[str, int | float]:
    stats: dict[str, int | float] = {}
    for stat in row.get("statValues") or []:
        stat_hash = stat.get("statHash")
        key = STAT_HASH_ALIASES.get(stat_hash) or STAT_NAME_ALIASES.get(stat.get("name") or "")
        value = stat.get("value")
        if key and value is not None:
            stats[key] = value
    return stats


def stat_delta_map(row: dict[str, Any]) -> dict[str, int | float]:
    deltas: dict[str, int | float] = {}
    for stat in row.get("investmentStats") or []:
        stat_hash = stat.get("statHash")
        key = STAT_HASH_ALIASES.get(stat_hash) or STAT_NAME_ALIASES.get(stat.get("name") or "")
        value = stat.get("value")
        if not key or value in (None, 0):
            continue
        deltas[key] = deltas.get(key, 0) + value
    return deltas


def has_japanese_text(value: str) -> bool:
    return bool(re.search(r"[\u3040-\u30ff\u3400-\u9fff]", value or ""))


def plug_row_search_text(row: dict[str, Any]) -> str:
    return " ".join(
        [
            row.get("name") or "",
            row.get("itemTypeDisplayName") or "",
            row.get("plugCategoryIdentifier") or "",
            row.get("description") or "",
        ]
    ).lower()


def masterwork_level_from_name(name: str) -> int | None:
    match = re.search(r"\bTier\s+(\d+)", name or "", re.IGNORECASE)
    if match:
        return int(match.group(1))
    match = re.search(r"(?:レベル|ティア)\s*(\d+)", name or "")
    if match:
        return int(match.group(1))
    return None


def plug_variant_label(row: dict[str, Any], deltas: dict[str, int | float]) -> str:
    folded = plug_row_search_text(row)
    if "masterwork" not in folded and "masterworks" not in folded and "マスターワーク" not in folded:
        return ""
    if masterwork_level_from_name(row.get("name") or "") is not None:
        return ""
    if not deltas:
        return ""

    is_ja = has_japanese_text(" ".join([row.get("name") or "", row.get("description") or ""]))
    nonzero = [value for value in deltas.values() if NumberLike(value) != 0]
    if len(nonzero) > 1:
        return "+3全体" if is_ja else "+3 all"
    if "weapon's tier" in folded or "equal to the weapon" in folded or "武器のレベル" in folded or "武器のティア" in folded:
        return "Tier連動" if is_ja else "Tier-scaled"
    if max([abs(float(value)) for value in deltas.values()] or [0]) >= 10:
        return "単独+10" if is_ja else "Solo +10"
    return ""


def NumberLike(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def compact_plug(row: dict[str, Any]) -> dict[str, Any]:
    deltas = stat_delta_map(row)
    variant_label = plug_variant_label(row, deltas)
    name = row.get("name") or ""
    if variant_label:
        name = f"{name} [{variant_label}]"
    return {
        "hash": row.get("hash"),
        "name": name,
        "description": clean_text(row.get("description"), 180),
        "icon": icon_url(row.get("icon")),
        "category": row.get("itemTypeDisplayName") or "",
        "identifier": row.get("plugCategoryIdentifier") or "",
        "variantLabel": variant_label,
        "statDeltas": deltas,
    }


def load_plug_resources(lang: str) -> tuple[dict[int, dict[str, Any]], dict[int, list[dict[str, Any]]]]:
    plugs_path = TEXTDB_DIR / f"plugs.{lang}.json"
    plug_sets_path = TEXTDB_DIR / f"plug_sets.{lang}.json"
    plugs_by_hash: dict[int, dict[str, Any]] = {}
    plug_sets: dict[int, list[dict[str, Any]]] = {}

    if plugs_path.exists():
        for row in read_json(plugs_path):
            plug_hash = row.get("hash")
            if plug_hash is None:
                continue
            plugs_by_hash[int(plug_hash)] = compact_plug(row)

    if plug_sets_path.exists():
        for row in read_json(plug_sets_path):
            plug_set_hash = row.get("hash")
            if plug_set_hash is None:
                continue
            if row.get("plugItems"):
                plug_sets[int(plug_set_hash)] = [
                    {
                        "hash": int(item.get("hash")),
                        "currentlyCanRoll": item.get("currentlyCanRoll"),
                    }
                    for item in row.get("plugItems") or []
                    if item.get("hash")
                ]
            else:
                plug_sets[int(plug_set_hash)] = [
                    {"hash": int(value), "currentlyCanRoll": True}
                    for value in row.get("plugItemHashes") or []
                    if value
                ]

    return plugs_by_hash, plug_sets


def socket_plug_hashes(socket: dict[str, Any], plug_sets: dict[int, list[dict[str, Any]]]) -> list[int]:
    hashes: list[int] = []

    def add(value: Any) -> None:
        if value in (None, 0, "0", ""):
            return
        try:
            plug_hash = int(value)
        except (TypeError, ValueError):
            return
        if plug_hash not in hashes:
            hashes.append(plug_hash)

    randomized_set = socket.get("randomizedPlugSetHash")
    if randomized_set:
        for plug in plug_sets.get(int(randomized_set), []):
            if plug.get("currentlyCanRoll") is False:
                continue
            add(plug.get("hash"))
        return hashes

    add(socket.get("singleInitialItemHash"))
    reusable_hashes = socket.get("reusablePlugItemHashes") or []
    for plug_hash in reusable_hashes:
        add(plug_hash)
    reusable_set = socket.get("reusablePlugSetHash")
    if reusable_set and not reusable_hashes:
        for plug in plug_sets.get(int(reusable_set), []):
            if plug.get("currentlyCanRoll") is False:
                continue
            add(plug.get("hash"))
    return hashes


def plug_search_text(plug: dict[str, Any]) -> str:
    return " ".join(
        [
            plug.get("name") or "",
            plug.get("category") or "",
            plug.get("identifier") or "",
            plug.get("description") or "",
        ]
    ).lower()


def is_excluded_plug(plug: dict[str, Any]) -> bool:
    folded = plug_search_text(plug)
    return any(token in folded for token in PLUG_EXCLUDE_TOKENS)


def is_relevant_plug(plug: dict[str, Any]) -> bool:
    if plug.get("statDeltas"):
        return True
    folded = plug_search_text(plug)
    return any(token in folded for token in PLUG_INCLUDE_TOKENS)


def plug_group_kind(options: list[dict[str, Any]]) -> str:
    folded = " ".join(plug_search_text(option) for option in options)
    identifiers = " ".join((option.get("identifier") or "").lower() for option in options)
    categories = " ".join((option.get("category") or "").lower() for option in options)
    if "item_sets.selectors" in identifiers or "item_sets" in identifiers or "set bonus" in folded or "セットボーナス" in folded:
        return "set_bonus"
    if "armor_archetypes" in folded:
        return "armor_archetype"
    if "armor_tiering" in folded or "tuning" in folded:
        return "armor_tuning"
    if "masterwork" in identifiers or "masterworks" in identifiers or "masterwork" in folded:
        return "masterwork"
    if "origin" in identifiers or "origin trait" in categories:
        return "origin"
    if "frames" in identifiers or "random_perk" in identifiers:
        return "trait"
    if "intrinsic" in identifiers or "intrinsic" in categories or "frame" in categories:
        return "intrinsic"
    if "trait" in categories or "perk" in categories:
        return "trait"
    if "mod" in categories or ".mod_" in identifiers or "mods" in identifiers or "enhancements" in identifiers or "artifice" in identifiers:
        return "mod"
    if any(token in identifiers or token in categories for token in ("barrel", "scope", "sight")):
        return "barrel"
    if any(token in identifiers or token in categories for token in ("magazine", "battery", "batteries")):
        return "magazine"
    if "trait" in folded or "perk" in folded:
        return "trait"
    if any(token in folded for token in ("barrel", "scope", "sight")):
        return "barrel"
    if any(token in folded for token in ("magazine", "battery", "batteries")):
        return "magazine"
    if "mod" in folded:
        return "mod"
    return "socket"


def trim_plug_options(options: list[dict[str, Any]], kind: str) -> list[dict[str, Any]]:
    if kind == "masterwork":
        return options[:MAX_PLUG_OPTIONS_PER_SOCKET]
    if len(options) > MAX_PLUG_OPTIONS_PER_SOCKET:
        statful = [option for option in options if option.get("statDeltas")]
        if len(statful) >= 2:
            return statful[:MAX_PLUG_OPTIONS_PER_SOCKET]
    return options[:MAX_PLUG_OPTIONS_PER_SOCKET]


def weapon_type_id_for(row: dict[str, Any]) -> str:
    for category_hash in row.get("itemCategoryHashes") or []:
        if category_hash in WEAPON_TYPE_CATEGORIES:
            return WEAPON_TYPE_CATEGORIES[category_hash]
    return ""


def is_adept_weapon(row: dict[str, Any]) -> bool:
    folded = " ".join(
        [
            row.get("name") or "",
            row.get("itemTypeDisplayName") or "",
            row.get("tierTypeName") or "",
            " ".join(row.get("categoryNames") or []),
        ]
    ).lower()
    return "adept" in folded or "熟練" in folded


def is_adept_plug(option: dict[str, Any]) -> bool:
    folded = plug_search_text(option)
    return "adept" in folded or "熟練" in folded


def is_hidden_weapon_system_plug(option: dict[str, Any]) -> bool:
    identifier = (option.get("identifier") or "").lower()
    name = (option.get("name") or "").lower()
    hidden_tokens = (
        "crafting.plugs.weapons.mods.enhancers",
        "crafting.plugs.weapons.mods.transfusers",
        "deepsight",
        "weapon level",
        "level boost",
    )
    return any(token in identifier or token in name for token in hidden_tokens)


def masterwork_target_stat(option: dict[str, Any]) -> str:
    identifier = (option.get("identifier") or "").lower()
    for token, stat_key in MASTERWORK_STAT_TOKENS.items():
        if token in identifier:
            return stat_key

    folded = plug_search_text(option)
    name_targets = {
        "stability": "stability",
        "安定": "stability",
        "range": "range",
        "射程": "range",
        "handling": "handling",
        "ハンドリング": "handling",
        "reload": "reload",
        "リロード": "reload",
        "impact": "impact",
        "威力": "impact",
        "blast radius": "blastRadius",
        "爆発範囲": "blastRadius",
        "velocity": "velocity",
        "速度": "velocity",
        "accuracy": "accuracy",
        "命中": "accuracy",
        "charge time": "chargeTime",
        "チャージ": "chargeTime",
        "draw time": "drawTime",
        "ドロー": "drawTime",
    }
    for token, stat_key in name_targets.items():
        if token in folded:
            return stat_key
    return ""


def allowed_weapon_masterwork_stats(row: dict[str, Any]) -> set[str]:
    allowed = set(WEAPON_MASTERWORK_BASE_STATS)
    weapon_type_id = weapon_type_id_for(row)
    allowed.update(WEAPON_MASTERWORK_EXTRA_STATS.get(weapon_type_id, set()))
    available = set(stat_map(row))
    return {stat for stat in allowed if stat in available or stat in WEAPON_MASTERWORK_BASE_STATS}


def prefer_masterwork_levels(options: list[dict[str, Any]]) -> list[dict[str, Any]]:
    def sort_key(option: dict[str, Any]) -> tuple[str, int, int, str]:
        level = masterwork_level_from_name(option.get("name") or "")
        deltas = option.get("statDeltas") or {}
        stat = masterwork_target_stat(option)
        if level is not None:
            family = 0
            level_key = level
        elif len([value for value in deltas.values() if NumberLike(value) != 0]) > 1:
            family = 2
            level_key = 10
        else:
            family = 1
            level_key = 10
        return (stat, family, level_key, option.get("name") or "")

    return sorted(options, key=sort_key)


def filter_socket_options(row: dict[str, Any], options: list[dict[str, Any]], kind: str) -> list[dict[str, Any]]:
    if row.get("itemType") != 3:
        return options

    if kind == "mod":
        filtered = [option for option in options if not is_hidden_weapon_system_plug(option)]
        if not is_adept_weapon(row):
            filtered = [option for option in filtered if not is_adept_plug(option)]
        return filtered

    if kind == "masterwork":
        allowed = allowed_weapon_masterwork_stats(row)
        filtered = [
            option
            for option in options
            if masterwork_target_stat(option) in allowed
        ]
        return prefer_masterwork_levels(filtered)

    return options


def compact_socket_entries(
    row: dict[str, Any],
    lang: str,
    plugs_by_hash: dict[int, dict[str, Any]],
    plug_sets: dict[int, list[dict[str, Any]]],
    used_plug_hashes: set[int],
) -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = []
    for socket in row.get("socketEntries") or []:
        raw_options = [
            plugs_by_hash[plug_hash]
            for plug_hash in socket_plug_hashes(socket, plug_sets)
            if plug_hash in plugs_by_hash
        ]
        options = [option for option in raw_options if is_relevant_plug(option) and not is_excluded_plug(option)]
        options = [option for option in options if option.get("name")]
        if len(options) < 2:
            continue
        kind = plug_group_kind(options)
        options = filter_socket_options(row, options, kind)
        if len(options) < 2:
            continue
        kind = plug_group_kind(options)
        options = trim_plug_options(options, kind)
        if len(options) < 2:
            continue
        plug_hashes = [int(option["hash"]) for option in options if option.get("hash") is not None]
        used_plug_hashes.update(plug_hashes)
        plug_set_hash = socket.get("randomizedPlugSetHash") or socket.get("reusablePlugSetHash") or ""
        groups.append(
            {
                "index": socket.get("index"),
                "label": PLUG_GROUP_LABELS.get(kind, PLUG_GROUP_LABELS["socket"]).get(lang, kind),
                "kind": kind,
                "plugSetHash": plug_set_hash,
                "initialPlugHash": socket.get("singleInitialItemHash") or "",
                "plugHashes": plug_hashes,
            }
        )
    return groups


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
    if 50 in category_hashes:
        if not class_ids:
            if contains_any(type_name, ("Hunter", "ハンター")):
                class_ids.append("hunter")
            elif contains_any(type_name, ("Warlock", "ウォーロック")):
                class_ids.append("warlock")
            elif contains_any(type_name, ("Titan", "タイタン")):
                class_ids.append("titan")
        groups.add("character")
        sections.add("subclasses")
        sections.update(class_ids)

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


def csv_value(row: dict[str, Any], key: str) -> str:
    return str(row.get(key) or "").strip()


def csv_number(row: dict[str, Any], key: str) -> float | None:
    raw = csv_value(row, key)
    if not raw:
        return None
    try:
        return float(raw.rstrip("%"))
    except ValueError:
        return None


def csv_percent(row: dict[str, Any], key: str) -> float | None:
    raw = csv_value(row, key)
    if not raw:
        return None
    try:
        value = float(raw.rstrip("%"))
    except ValueError:
        return None
    return value / 100 if raw.endswith("%") else value


def display_number(value: float | int | None) -> str:
    if value is None:
        return ""
    if float(value).is_integer():
        return str(int(value))
    return f"{value:.3f}".rstrip("0").rstrip(".")


def target_hp(row: dict[str, Any]) -> float:
    return csv_number(row, "target_hp") or DEFAULT_PVP_TARGET_HP


def weapon_parameter(row: dict[str, Any]) -> float:
    return csv_number(row, "weapon_parameter") or DEFAULT_WEAPON_PARAMETER


def wp_max_bonus_pct(row: dict[str, Any]) -> float:
    return csv_percent(row, "wp_max_bonus_pct") or DEFAULT_WP_MAX_BONUS_PCT


def calculate_wp_bonus_pct(row: dict[str, Any]) -> float:
    explicit = csv_percent(row, "wp_bonus_pct")
    if explicit is not None:
        return explicit
    wp = weapon_parameter(row)
    bonus_range = max(0, min(wp, 200) - 100)
    return (bonus_range / 100) * wp_max_bonus_pct(row)


def effective_damage(row: dict[str, Any], base_key: str, effective_key: str) -> str:
    explicit = csv_number(row, effective_key)
    if explicit is not None:
        return display_number(explicit)
    base = csv_number(row, base_key)
    if base is None:
        return ""
    return display_number(base * (1 + calculate_wp_bonus_pct(row)))


def kill_requirement(row: dict[str, Any], required_key: str, damage_key: str) -> str:
    explicit = csv_number(row, required_key)
    if explicit is not None:
        return display_number(explicit)
    damage = csv_number(row, damage_key)
    if damage is None:
        return ""
    effective = float(effective_damage(row, damage_key, f"effective_{damage_key}") or 0)
    if effective <= 0:
        return ""
    return str(math.ceil(target_hp(row) / effective))


def calculate_body_forgiveness(row: dict[str, Any]) -> tuple[str | int, str | float]:
    explicit_count = csv_value(row, "body_forgiveness_count")
    explicit_pct = csv_value(row, "body_forgiveness_pct")
    if explicit_count or explicit_pct:
        return explicit_count, explicit_pct

    crit_damage = csv_number({"damage": effective_damage(row, "crit_damage", "effective_crit_damage")}, "damage")
    body_damage = csv_number({"damage": effective_damage(row, "body_damage", "effective_body_damage")}, "damage")
    crit_required_raw = kill_requirement(row, "crit_required", "crit_damage")
    crit_required = float(crit_required_raw) if crit_required_raw else None
    if (
        crit_damage is None
        or body_damage is None
        or crit_required is None
        or crit_required <= 0
        or crit_damage <= body_damage
    ):
        return "", ""

    forgiveness = math.floor(((crit_required * crit_damage) - target_hp(row)) / (crit_damage - body_damage))
    forgiveness = max(0, min(int(crit_required), forgiveness))
    return forgiveness, round(forgiveness / crit_required, 4)


def ttk_rows_by_hash() -> dict[int, dict[str, Any]]:
    path = TTK_DIR / "ttk_candidates.csv"
    if not path.exists():
        return {}
    output: dict[int, dict[str, Any]] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            db_apply = csv_value(row, "db_apply").lower()
            if db_apply not in {"ready", "applied"}:
                continue
            has_candidate_value = any(
                csv_value(row, key)
                for key in (
                    "crit_damage",
                    "body_damage",
                    "effective_crit_damage",
                    "effective_body_damage",
                    "optimal_ttk_ms",
                    "body_ttk_ms",
                    "crit_required",
                    "body_required",
                )
            )
            if not has_candidate_value:
                continue
            weapon_hash = csv_value(row, "weapon_hash")
            if not weapon_hash:
                continue
            try:
                weapon_hash_int = int(weapon_hash)
            except ValueError:
                continue
            body_forgiveness_count, body_forgiveness_pct = calculate_body_forgiveness(row)
            wp_bonus = calculate_wp_bonus_pct(row)
            effective_crit_damage = effective_damage(row, "crit_damage", "effective_crit_damage")
            effective_body_damage = effective_damage(row, "body_damage", "effective_body_damage")
            output[weapon_hash_int] = {
                "sourceScope": "weapon_override",
                "status": csv_value(row, "formula_confidence") or "Needs Verification",
                "mode": csv_value(row, "mode") or "PvP",
                "sandboxVersion": csv_value(row, "sandbox_version"),
                "resilienceTier": csv_value(row, "resilience_tier"),
                "targetHp": display_number(target_hp(row)),
                "weaponParameter": display_number(weapon_parameter(row)),
                "wpMaxBonusPct": display_number(wp_max_bonus_pct(row)),
                "wpBonusPct": display_number(wp_bonus),
                "basePrecisionDamage": csv_value(row, "crit_damage"),
                "baseBodyDamage": csv_value(row, "body_damage"),
                "precisionDamage": effective_crit_damage,
                "bodyDamage": effective_body_damage,
                "optimalTtkMs": csv_value(row, "optimal_ttk_ms"),
                "bodyTtkMs": csv_value(row, "body_ttk_ms"),
                "critShots": kill_requirement(row, "crit_required", "crit_damage"),
                "bodyShots": kill_requirement(row, "body_required", "body_damage"),
                "bodyForgivenessShots": body_forgiveness_count,
                "bodyForgivenessPct": body_forgiveness_pct,
                "conditions": csv_value(row, "conditions"),
                "sourceExtractionId": csv_value(row, "source_extraction_id"),
            }
    return output


def default_ttk() -> dict[str, Any]:
    return {
        "status": "pending",
        "mode": "PvP",
        "sandboxVersion": "",
        "resilienceTier": "",
        "targetHp": str(DEFAULT_PVP_TARGET_HP),
        "weaponParameter": str(DEFAULT_WEAPON_PARAMETER),
        "wpMaxBonusPct": display_number(DEFAULT_WP_MAX_BONUS_PCT),
        "wpBonusPct": "0",
        "basePrecisionDamage": "",
        "baseBodyDamage": "",
        "precisionDamage": "",
        "bodyDamage": "",
        "optimalTtkMs": "",
        "bodyTtkMs": "",
        "critShots": "",
        "bodyShots": "",
        "bodyForgivenessShots": "",
        "bodyForgivenessPct": "",
        "conditions": "",
        "sourceExtractionId": "",
        "sourceScope": "pending",
    }


def reference_ttk_record(row: dict[str, Any]) -> dict[str, Any]:
    candidate = {
        "target_hp": str(DEFAULT_PVP_TARGET_HP),
        "weapon_parameter": str(DEFAULT_WEAPON_PARAMETER),
        "wp_max_bonus_pct": str(DEFAULT_WP_MAX_BONUS_PCT),
        "wp_bonus_pct": "0",
        "crit_damage": csv_value(row, "crit_damage"),
        "body_damage": csv_value(row, "body_damage"),
        "crit_required": csv_value(row, "crit_shots"),
        "body_required": csv_value(row, "body_shots"),
    }
    body_forgiveness_count, body_forgiveness_pct = calculate_body_forgiveness(candidate)
    source_id = f"DrYamaHiro:{csv_value(row, 'source_sheet')}:{csv_value(row, 'source_row')}"
    archetype_label = f"{csv_value(row, 'weapon_family')} / {csv_value(row, 'archetype')}"
    edge_notes: list[str] = []
    if csv_value(row, "optimal_ttk_ms") == "0" or csv_value(row, "body_ttk_ms") == "0":
        edge_notes.append("0ms means same-trigger/one-shot potential; do not read it as sustained-fire cadence.")
    if csv_value(row, "weapon_family") in {"Shotguns", "Fusion Rifles"}:
        edge_notes.append("Burst, bolt, or pellet behavior needs primary-source or in-game confirmation.")
    conditions = f"{archetype_label}; HP {DEFAULT_PVP_TARGET_HP}; WP {DEFAULT_WEAPON_PARAMETER}; secondary reference, verify burst/pellet edge cases."
    if edge_notes:
        conditions = f"{conditions} {' '.join(edge_notes)}"
    return {
        "sourceScope": "frame_baseline",
        "status": "reference_edge_case" if edge_notes else "reference_needs_verification",
        "mode": "PvP",
        "sandboxVersion": "DrYamaHiro WP reference v1.02",
        "resilienceTier": "",
        "targetHp": str(DEFAULT_PVP_TARGET_HP),
        "weaponParameter": str(DEFAULT_WEAPON_PARAMETER),
        "wpMaxBonusPct": display_number(DEFAULT_WP_MAX_BONUS_PCT),
        "wpBonusPct": "0",
        "basePrecisionDamage": csv_value(row, "crit_damage"),
        "baseBodyDamage": csv_value(row, "body_damage"),
        "precisionDamage": effective_damage(candidate, "crit_damage", "effective_crit_damage"),
        "bodyDamage": effective_damage(candidate, "body_damage", "effective_body_damage"),
        "optimalTtkMs": csv_value(row, "optimal_ttk_ms"),
        "bodyTtkMs": csv_value(row, "body_ttk_ms"),
        "critShots": kill_requirement(candidate, "crit_required", "crit_damage"),
        "bodyShots": kill_requirement(candidate, "body_required", "body_damage"),
        "bodyForgivenessShots": body_forgiveness_count,
        "bodyForgivenessPct": body_forgiveness_pct,
        "conditions": conditions,
        "sourceExtractionId": source_id,
    }


def reference_ttk_by_archetype() -> dict[tuple[str, str], dict[str, Any]]:
    path = TTK_DIR / "dr_yamahiro_wp_reference.csv"
    if not path.exists():
        return {}
    output: dict[tuple[str, str], dict[str, Any]] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if csv_value(row, "source_sheet") not in {"PrimaryWeapons", "SpecialWeapons"}:
                continue
            family = csv_value(row, "weapon_family")
            archetype = csv_value(row, "archetype")
            if not family or not archetype or archetype == "Archetype":
                continue
            if not csv_value(row, "crit_damage") and not csv_value(row, "body_damage"):
                continue
            output[(family, archetype)] = reference_ttk_record(row)
    return output


def ttk_has_damage(record: dict[str, Any]) -> bool:
    return any(
        record.get(key)
        for key in (
            "basePrecisionDamage",
            "baseBodyDamage",
            "precisionDamage",
            "bodyDamage",
            "optimalTtkMs",
            "bodyTtkMs",
            "critShots",
            "bodyShots",
        )
    )


def weapon_frame_plug(row: dict[str, Any], plugs_by_hash: dict[int, dict[str, Any]]) -> dict[str, Any] | None:
    for socket in row.get("socketEntries") or []:
        plug_hash = socket.get("singleInitialItemHash")
        if not plug_hash:
            continue
        plug = plugs_by_hash.get(int(plug_hash))
        if not plug:
            continue
        category = (plug.get("category") or "").lower()
        identifier = (plug.get("identifier") or "").lower()
        if "intrinsic" in category or "内在" in category or "intrinsic" in identifier or identifier == "intrinsics":
            return plug
    return None


def canonical_archetype_from_frame(frame_name: str) -> str:
    folded = (frame_name or "").lower()
    for token, archetype in FRAME_ARCHETYPE_TOKENS:
        if token in folded:
            return archetype
    return ""


def ttk_for_weapon(
    row: dict[str, Any],
    ttk_by_hash: dict[int, dict[str, Any]],
    ttk_by_archetype: dict[tuple[str, str], dict[str, Any]],
    plugs_by_hash: dict[int, dict[str, Any]],
) -> tuple[dict[str, Any] | None, str, str]:
    exact = ttk_by_hash.get(int(row.get("hash") or 0))
    frame_plug = weapon_frame_plug(row, plugs_by_hash)
    frame_name = frame_plug.get("name") if frame_plug else ""
    archetype = canonical_archetype_from_frame(frame_name)
    if exact and ttk_has_damage(exact):
        weapon_record = dict(exact)
        weapon_record.setdefault("sourceScope", "weapon_override")
        return weapon_record, frame_name, archetype
    family = DR_TTK_FAMILY_BY_WEAPON_TYPE.get(weapon_type_id_for(row), "")
    if family and archetype:
        record = ttk_by_archetype.get((family, archetype))
        if record:
            frame_record = dict(record)
            frame_record["sourceScope"] = "frame_baseline"
            return frame_record, frame_name, archetype
    if exact:
        exact_record = dict(exact)
        exact_record.setdefault("sourceScope", "pending")
        return exact_record, frame_name, archetype
    return None, frame_name, archetype


def compact_catalog_item(
    row: dict[str, Any],
    lang: str,
    ttk_by_hash: dict[int, dict[str, Any]],
    ttk_by_archetype: dict[tuple[str, str], dict[str, Any]],
    plugs_by_hash: dict[int, dict[str, Any]],
    plug_sets: dict[int, list[int]],
    release_lookup: dict[int, dict[str, Any]],
    used_plug_hashes: set[int],
) -> dict[str, Any]:
    stats = stat_map(row)
    classification = classify(row)
    plug_sockets = (
        compact_socket_entries(row, lang, plugs_by_hash, plug_sets, used_plug_hashes)
        if classification["isWeapon"] or classification["isArmor"]
        else []
    )
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
    ttk: dict[str, Any] | None = None
    weapon_frame = ""
    weapon_archetype = ""
    if classification["isWeapon"]:
        ttk, weapon_frame, weapon_archetype = ttk_for_weapon(row, ttk_by_hash, ttk_by_archetype, plugs_by_hash)
    release = release_info_for(row, release_lookup)

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
            weapon_frame,
            weapon_archetype,
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
        "weaponFrame": weapon_frame if classification["isWeapon"] else "",
        "weaponArchetype": weapon_archetype if classification["isWeapon"] else "",
        "weaponSlot": weapon_slot if classification["isWeapon"] else "",
        "ammoType": ammo_type,
        "ammo": AMMO_LABEL.get(ammo_type, AMMO_LABEL[0]).get(lang, ""),
        "damageTypes": damage_types,
        "damageType": damage_type,
        "armorSlot": armor_slot if classification["isArmor"] else "",
        "stats": stats,
        "rpm": stats.get("rpm"),
        "plugSetHashes": row.get("plugSetHashes") or [],
        "plugSockets": plug_sockets,
        "release": release,
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
            "PvP Potential is modeled as per-weapon PvP data and is filled from curated text tables.",
        ],
    }
    write_json(SITE_DATA_DIR / "index.json", site_index)
    ttk_by_hash = ttk_rows_by_hash()
    ttk_by_archetype = reference_ttk_by_archetype()

    for lang in LANGUAGES:
        raw_rows = load_catalog_raw(lang)
        plugs_by_hash, plug_sets = load_plug_resources(lang)
        release_lookup = load_release_lookup(lang)
        used_plug_hashes: set[int] = set()
        catalog = [
            compact_catalog_item(row, lang, ttk_by_hash, ttk_by_archetype, plugs_by_hash, plug_sets, release_lookup, used_plug_hashes)
            for row in raw_rows
            if row.get("name")
        ]
        catalog.sort(key=lambda row: (row["primaryGroup"], row["primarySection"], row["type"], row["name"], row["hash"]))
        weapons = [row for row in catalog if "weapons" in row.get("sections", [])]
        armor = [row for row in catalog if "armor" in row.get("sections", [])]
        exotic_armor = [row for row in armor if row.get("tier") in {"Exotic", "エキゾチック"}]
        plug_options = {
            str(plug_hash): plugs_by_hash[plug_hash]
            for plug_hash in sorted(used_plug_hashes)
            if plug_hash in plugs_by_hash
        }

        write_json(SITE_DATA_DIR / f"catalog.{lang}.json", catalog)
        write_json(SITE_DATA_DIR / f"weapons.{lang}.json", weapons)
        write_json(SITE_DATA_DIR / f"armor.{lang}.json", armor)
        write_json(SITE_DATA_DIR / f"exotic_armor.{lang}.json", exotic_armor)
        write_json(SITE_DATA_DIR / f"plug_options.{lang}.json", plug_options)

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
