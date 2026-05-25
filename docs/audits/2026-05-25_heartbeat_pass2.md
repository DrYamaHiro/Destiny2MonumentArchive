# D2 Monument Archive Audit Pass 2

Date: 2026-05-25 23:09 JST

## High-impact findings

1. PvP Potential provenance is now visible, but shotgun/fusion edge cases needed clearer labeling.
   - Data reference: `site/data/catalog.ja.json` has 1,048/1,837 weapons with PvP Potential values; 256 of those are burst/pellet/0ms edge cases.
   - Risk: PvP players may read `0 ms` as a normal sustained-fire TTK instead of same-trigger or one-shot potential.
   - Fix: `scripts/build_site_indexes.py:1174` now marks those records as `reference_edge_case`, and `site/app.js:593` renders this as `参照値 / 特殊要検証`.

2. Set bonus visibility is structurally correct but currently limited by Manifest socket coverage.
   - Data reference: only 3 armor rows currently expose `set_bonus` sockets in local Manifest-derived data.
   - Relevant generator logic: `scripts/build_site_indexes.py:634`.
   - UI reference: set bonus metadata should be kept in the static armor detail model before any later build tool returns.
   - Remaining risk: non-class armor set membership may require additional Manifest components or curated mapping if Bungie does not expose sockets on those armor pieces.

3. TTK fill strategy is useful but must remain explicitly provisional.
   - Data reference: 792 records are `reference_needs_verification`, 256 are `reference_edge_case`, 786 remain `pending`, 3 are `Verified`.
   - Source: `data/static/ttk/dr_yamahiro_wp_reference.csv` is secondary reference only.
   - Policy: Bungie/API/patch notes remain primary; burst, pellet, and frame-specific exceptions must be promoted only after source review or in-game test.

## 10-role review

- PvP sweat: Stronger with visible TTK values; needs confidence labels and edge-case flags, now improved.
- PvE endgame player: Database navigation is cleaner; PvE damage/build value is still future work.
- Buildcrafter: Public GitHub view should stay static DATABASE-first; set bonus thresholds can be modeled as armor metadata.
- New/returning Guardian: Short armor stat labels reduce clutter but need hover/title help later.
- Data engineer: Provenance is explicit; generated JSON remains reproducible from scripts.
- Destiny API/Manifest maintainer: Release watermark and plug socket handling are correct within current Manifest cache.
- UI/UX reviewer: 2-column breakpoint prevents detail title squeeze; long category labels are compacted.
- Localization reviewer: JP/EN labels exist for new TTK status and armor abbreviations.
- Accessibility reviewer: Icon-only abbreviations should gain `title`/aria descriptors in a later pass.
- Community moderator: `reference_*` status labels reduce misinformation risk for Discord/community sharing.

## Verification

- `python -m py_compile scripts\build_site_indexes.py`
- `python scripts\build_site_indexes.py`
- `node --check site\app.js`

No new PvP workbook was found in `data/fromDrYamaHiro`; only `D2WP_boost_ver1.02.xlsx` is present.
