# PvP Damage Update Tracking

作成日: 2026-05-25

最終確認: 2026-05-25

## 方針

Bungieの更新情報を最新から順に遡り、PvP武器ダメージ、武器アーキタイプ、PvP POTENTIALに関係する記述を台帳化します。

この台帳は、PvP POTENTIAL DBの空欄を埋めるための「出典管理」と「反映状況管理」を兼ねます。

GitHubにはテキストのみを置く方針のため、CSVを正本、Excel workbookをローカル作業用ビューとして扱います。

## 管理対象

- Bungie公式ニュース
- TWID / This Week in Destiny
- Patch notes
- Ability / weapon sandbox update
- PvP固有の補正
- 武器アーキタイプ別のダメージ変更
- perkやtraitによるPvPダメージ補正
- WPによるPvP武器ダメージ補正

## テキスト正本

```text
data/static/ttk/source_patch_notes.csv
data/static/ttk/damage_extraction.csv
data/static/ttk/ttk_candidates.csv
```

## 現在のスキャン範囲

2026-05-25時点で、Bungie公式更新情報を最新側から以下まで確認済みです。

- 2026-05-21: `Destiny 2: Every End is a New Beginning`
- 2026-05-05: `Destiny 2 Update 9.5.6.3`
- 2026-01-27: `Destiny 2 Update 9.5.5`
- 2025-12-02: `Destiny 2 Update 9.5.0`
- 2025-07-29: `Destiny 2 Update 9.0.0.4`
- 2025-07-15: `Destiny 2 Update 9.0.0.1`
- 2025-05-06: `Destiny 2 Update 8.2.6`
- 2024-10-08: `Destiny 2 Update 8.1.0`
- 2024-08-06: `Destiny 2 Update 8.0.5`
- 2024-06-04: `Destiny 2 Update 8.0.0.1`
- 2024-03-05: `Destiny 2 Update 7.3.5`
- 2023-12-19: `Destiny 2 Update 7.3.0.5`
- 2023-08-22: `Destiny 2 Update 7.2.0.1`
- 2022-08-23: `Destiny 2 Update 6.2.0`

PvPダメージ値として確定登録した主な項目:

- `All-Star`: PvPで15%の武器ダメージボーナス
- `Weapons stat / WP`: 対プレイヤー最大ダメージボーナスは6%から5%へ修正
- `The Navigator`: Woven Mail中のPvP武器ダメージボーナス5%
- `Ace of Spades`: 精密キル爆発の対プレイヤーダメージ+15%
- `Choir of One`: 腰だめ投射物の対プレイヤーダメージ+10%
- `Update 8.2.6`: High-Impact Auto Rifle、Rapid-Fire Pulse Rifle、Heavy Burst Hand Cannon、Heavy Burst ShotgunのPvP tuning
- `Update 8.1.0` のPvP Weapon Tuning表にある武器アーキタイプ別ダメージ
- `Update 8.0.5`: Precision BowのPvP base/crit damage変更
- `Update 7.3.5`: Crucible体力+30HP、Trace Rifle、Shotgun、Fusion Rifle、Glaive、Machine Gun、Heavy Grenade Launcher、Fighting Lion、Devil's Ruin、ForerunnerのPvP補正
- `Update 7.3.0`: Glaive projectileの対Guardianダメージ
- `Update 7.0.5`: Rapid-Fire Fusion Rifle、Trace RifleのPvP補正
- `Update 6.2.5`: Precision Auto Rifle、Adaptive Pulse Rifle、High-Impact Scout Rifle、SMG、Lord of WolvesのPvP補正
- `Update 6.2.0`: Fighting Lion、Lord of Wolves、Dead Man's TaleのPvP補正

一部の値は「Bungie公式の変更値」としては登録済みですが、TTK計算にはバースト間隔、ペレット数、ドロータイム、実ゲーム内の丸め処理が必要です。該当行は `Needs Calculation` または `Needs In-Game Test` として残しています。

特殊弾・ヘビー弾の多くは「実ダメージ表」ではなく「PvP倍率変更」として告知されるため、現時点ではDB上で次のように分けています。

- `Verified`: Bungie公式がPvP対象として明記した変更
- `Needs Calculation`: 倍率は確定しているが、ペレット数・ボルト数・爆発/着弾分離・チャージ時間の計算が未確定
- `Needs Verification`: PvP限定か、通常Crucibleにも適用するか、または現在サンドボックスで上書き済みかの確認待ち

## ローカル作業用Workbook

```text
docs/D2_Monument_Archive_Damage_Update_Tracker.xlsx
```

この `.xlsx` は見やすく入力するための作業ファイルです。GitHubへは含めません。

## ステータス

- `Backlog`: 未確認
- `Needs Extraction`: 記事は見つけたが、ダメージ記述の抽出前
- `Extracted`: ダメージ変更を抽出済み
- `Needs Verification`: PvP POTENTIAL計算/実測確認待ち
- `Verified`: PvP POTENTIAL DBへ反映可能
- `Applied`: `data/static/ttk/` へ反映済み
- `Skipped`: PvP POTENTIAL DB対象外

## 注意

更新記事の表現だけでは、PvP実ダメージやPvP POTENTIALが完全に決まらない場合があります。

特に以下は別途検証が必要です。

- バースト武器
- チャージ武器
- 距離減衰
- 精密倍率
- 耐久Tier別のkill requirement
- WP 100-200帯のPvP補正値
- 条件付きperk
- バフ/デバフが絡むケース
