# PvP Damage Update Tracking

作成日: 2026-05-25

## 方針

Bungieの更新情報を最新から順に遡り、PvP武器ダメージ、武器アーキタイプ、TTKに関係する記述を台帳化します。

この台帳は、TTK DBの空欄を埋めるための「出典管理」と「反映状況管理」を兼ねます。

GitHubにはテキストのみを置く方針のため、CSVを正本、Excel workbookをローカル作業用ビューとして扱います。

## 管理対象

- Bungie公式ニュース
- TWID / This Week in Destiny
- Patch notes
- Ability / weapon sandbox update
- PvP固有の補正
- 武器アーキタイプ別のダメージ変更
- perkやtraitによるPvPダメージ補正

## テキスト正本

```text
data/static/ttk/source_patch_notes.csv
data/static/ttk/damage_extraction.csv
data/static/ttk/ttk_candidates.csv
```

## ローカル作業用Workbook

```text
docs/D2_Monument_Archive_Damage_Update_Tracker.xlsx
```

この `.xlsx` は見やすく入力するための作業ファイルです。GitHubへは含めません。

## ステータス

- `Backlog`: 未確認
- `Needs Extraction`: 記事は見つけたが、ダメージ記述の抽出前
- `Extracted`: ダメージ変更を抽出済み
- `Needs Verification`: TTK計算/実測確認待ち
- `Verified`: TTK DBへ反映可能
- `Applied`: `data/static/ttk/` へ反映済み
- `Skipped`: TTK DB対象外

## 注意

更新記事の表現だけでは、PvP実ダメージやTTKが完全に決まらない場合があります。

特に以下は別途検証が必要です。

- バースト武器
- チャージ武器
- 距離減衰
- 精密倍率
- 耐久Tier別のkill requirement
- 条件付きperk
- バフ/デバフが絡むケース
