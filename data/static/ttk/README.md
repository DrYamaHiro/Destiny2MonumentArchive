# PvP Potential and PvP Damage Data

This folder is for curated text data derived from Bungie patch notes, community verification, and local calculations.

PvP Potential is not fully available from the Manifest. Treat these files as curated research outputs.

The canonical PvP Potential grain is frame/archetype first, weapon second. Individual weapons inherit their frame baseline, and weapon-specific overrides are used only for exotic behavior, named Bungie changes, or unique firing modes.

Text source-of-truth files:

- `source_patch_notes.csv`
- `damage_extraction.csv`
- `ttk_candidates.csv`
- `weaponstat_community_reference.csv`

Future generated DB files:

- `sandbox_versions.json`
- `weapon_damage_pvp.json`
- `ttk_profiles.json`

Core PvP Potential fields:

- Target HP
- WP
- WP Bonus
- Precision Damage
- Body Damage
- Optimal TTK
- BS TTK
- Crits to Kill
- Body Shots to Kill
- Body Shot Forgiveness

Application scope:

- `frame_baseline`: weapon type + frame/archetype + RPM bucket baseline
- `weapon_override`: weapon-specific exception
- `pending`: not enough evidence to apply

Project defaults:

- `target_hp`: `230`
- `weapon_parameter`: `100`
- `wp_max_bonus_pct`: `0.05`

WP is treated as the armor Weapons parameter. In this project profile, values from 0 to 100 apply `0%` PvP weapon damage bonus, then scale linearly from 100 to 200 up to the configured max bonus.

Older public references may still show `0.06`, but the current local project baseline is `0.05`. Bungie also documented this PvP cap correction in Update 9.0.0.4. If Bungie changes the value again, update `wp_max_bonus_pct` per sandbox row instead of changing historical rows.

```text
wp_bonus_pct = max(0, min(WP, 200) - 100) / 100 * wp_max_bonus_pct
effective_damage = base_damage * (1 + wp_bonus_pct)
```

Body Shot Forgiveness requires the target HP baseline for that sandbox. Use `230` as the default PvP Guardian health+shield baseline unless a sandbox version explicitly overrides it.

Current community damage reference:

```text
https://docs.google.com/spreadsheets/d/1FWMC-Vd_bGEoRkkrn3drWIORCFYyWQVMNlMasa4OE6I/edit
```

The generated `weaponstat_community_reference.csv` is now preferred over the older local `D2WP_boost_ver1.02.xlsx` export for frame-baseline PvP Potential values. Keep Bungie patch notes as primary evidence for official changes, but use this shared WeaponStat sheet as the higher-confidence community numeric reference.

The companion local spreadsheet tracker is:

```text
docs/D2_Monument_Archive_Damage_Update_Tracker.xlsx
```

The workbook is for local editing/readability and should not be committed to GitHub.

Current extraction checkpoint:

- Latest-to-oldest official Bungie scan completed from 2026-05-21 through 2022-08-23 for the first PvP damage batch.
- Exact PvP damage rows from Update 8.1.0 are stored as frame/archetype candidates and inherited by matching weapons when promoted.
- WeaponStat community rows now provide the default frame/archetype reference for primary, special, and heavy weapons where matching frame data exists.
- Special and heavy weapon research rows still include official scalar notes for Trace Rifles, Shotguns, Fusion Rifles, Glaives, Machine Guns, Heavy Grenade Launchers, Fighting Lion, Devil's Ruin beam, Forerunner, Swords, and Chain Reaction ammo-class behavior.
- Weapon-specific conditional rows currently include The Navigator, Ace of Spades, The Chaperone, and Choir of One where their manifest hashes are known.
- Special/heavy coverage is now populated where the WeaponStat frame row matches, but unmatched frames, burst/pellet/projectile edge cases, and exotic-specific behavior still need explicit verification before they become `Ready`.
