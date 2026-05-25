# D2 Monument Archive Heartbeat Audit Pass 1

Date: 2026-05-25 21:36 JST
Scope: local viewer and generated static data in `H:\マイドライブ\eSport\Destiny2`

## High-Impact Findings

1. PvP Potential still has no numeric per-weapon values in the generated viewer data.
   - Evidence: `site/data/catalog.ja.json` has 1,837 weapon rows, but 0 rows with numeric damage, shots-to-kill, or TTK fields populated.
   - Impact: PvP players cannot yet use the database for the core TTK comparison workflow.
   - Action this pass: extracted Dr.YamaHiro workbook values to `data/static/ttk/dr_yamahiro_wp_reference.csv` as secondary reference only. These are not applied to DB because burst weapons and historical sandbox assumptions need primary-source confirmation.

2. Character taxonomy duplication has been resolved and should stay protected.
   - Evidence: generated summary now has `character: 35`, `subclasses: 35`, and `character + armor: 0`.
   - Impact: Character now means subclass/class setup, not armor inventory.
   - Action this pass: verified generated data after `scripts/build_site_indexes.py` changes.

3. Perk/Mod selection density improved, but build crafting still needs persistence and slot-aware filters.
   - Evidence: plug options are now collapsed by default and duplicate visual options are deduped for non-masterwork/non-archetype sockets.
   - Impact: Static DB readers can inspect perk and mod deltas without the page becoming extremely tall.

## 10-Role Evaluation

- PvP sweat: Wants sortable numeric TTK and damage provenance immediately. Current blocker is source-verified PvP Potential.
- PvE endgame player: Set bonus data should remain visible as static armor metadata; threshold behavior can wait for a later build tool.
- Buildcrafter: Public GitHub view should stay DATABASE-first; full loadout comparison belongs in a later local or dynamic tool.
- New/returning Guardian: Collapsed sockets reduce intimidation. Character category is now much clearer.
- Data engineer: Dr.YamaHiro workbook extraction is auditable and isolated. Next step should be a merge queue with source confidence columns.
- Destiny API/manifest maintainer: Manifest-derived plug sets are usable; ensure generation rules, not only app-layer filters, own stable classification.
- UI/UX reviewer: Toggle model is the right direction. Remaining risk is long option grids for armor mods.
- Localization reviewer: Japanese labels are readable. Some Manifest item duplicates remain by design; dedupe helps but should be documented.
- Accessibility reviewer: Toggle buttons expose `aria-expanded`; next pass should add keyboard focus visibility checks after expanded grids.
- Community moderator: Provenance warnings are critical before public Discord use; keep secondary workbook data clearly labeled.

## Low-Risk Fixes Implemented

- Deduped visually identical non-masterwork/non-archetype plug options in `site/app.js`.
- Verified character category is subclass-only after data rebuild.
- Verified local viewer loads without console errors.

## Verification

- `node --check site/app.js`: pass
- Local browser: `http://127.0.0.1:8788/`
- Console errors: 0
- Character category: 35 rows, 0 armor rows
- PvP Potential numeric coverage: 0 / 1,837 weapon rows
