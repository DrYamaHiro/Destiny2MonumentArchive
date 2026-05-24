# Manifest Sync Runbook

調査・作成日: 2026-05-25

## 目的

Bungie Manifestから、D2 Monument Archiveで使う英語/日本語のテキストDBを生成します。

画像はダウンロードしません。Manifest内の `icon` パスだけを保持します。

## 出力

追跡対象にしてよい小さめのテキストDB:

```text
data/static/manifest_summary.json
data/static/textdb/index.json
data/static/textdb/weapons.en.json
data/static/textdb/weapons.ja.json
data/static/textdb/exotic_armor.en.json
data/static/textdb/exotic_armor.ja.json
data/static/textdb/plugs.en.json
data/static/textdb/plugs.ja.json
data/static/textdb/sandbox_perks.en.json
data/static/textdb/sandbox_perks.ja.json
```

GitHubへ上げないローカルキャッシュ:

```text
data/local_cache/manifest/
```

## 実行方法

API Keyを使ってローカルで実行する場合:

```powershell
cd H:\マイドライブ\eSport\Destiny2
.\scripts\sync_manifest_local.ps1
```

Manifestメタデータだけ確認する場合:

```powershell
cd H:\マイドライブ\eSport\Destiny2
python .\scripts\sync_manifest.py --metadata-only
```

## 注意

- `scripts/sync_manifest.py` は、`--env-file` を明示した時だけ秘密ファイルを読みます。
- 生のManifest component JSONは大きいので、`data/local_cache/` に置き、GitHubには含めません。
- TTKはManifestから完全自動生成できません。別途 `data/static/ttk/` に検証済みテーブルとして整備します。

## 公式情報

- Bungie API: https://bungie-net.github.io/
- GetDestinyManifest: https://bungie-net.github.io/multi/operation_get_Destiny2-GetDestinyManifest.html
- Manifest Wiki: https://github.com/Bungie-net/api/wiki/Obtaining-Destiny-Definitions-%22The-Manifest%22
