# D2 Monument Archive

Destiny 2の最終大型アップデート後も、コミュニティが武器・防具・TTK・PvP/PvE装備情報を参照し続けられるようにするためのローカル開発プロジェクトです。

## 方針

- GitHubに置くのはテキストデータとコードのみ
- 画像はGitHubに置かない
- API KeyやOAuth secretはプロジェクト内に置かない
- Manifest由来の英日データベース（DATABASE）を整備する
- PvPバトルログ（BATTLE LOG）は集計済みテキストデータとして扱う
- Discordサーバーは最終大型アップデート後に新設する

## 呼称

- 旧「静的DB」: データベース / DATABASE
- 旧「動的DB」: バトルログ / BATTLE LOG

## 主要ファイル

- `destiny2_db_plan.html`: 全体計画書
- `docs/bungie_api_key_setup.md`: Bungie API Key取得手順
- `docs/api_key_storage.md`: API Key保管ルール
- `docs/github_discord_policy.md`: GitHub/Discord分担方針
- `docs/manifest_sync.md`: Manifest同期手順
- `docs/damage_update_tracking.md`: PvPダメージ更新追跡方針
- `docs/static_viewer.md`: ローカルDATABASEビューア手順
- `schema/static.sql`: DATABASEスキーマ案
- `schema/dynamic.sql`: BATTLE LOGスキーマ案
- `scripts/sync_manifest.py`: Manifest同期スクリプト
- `scripts/build_site_indexes.py`: サイト用軽量JSON生成
- `site/index.html`: ローカルDATABASEビューア

## Manifest同期

秘密ファイルを読まず、公開Manifestだけで実行する場合:

```powershell
python .\scripts\sync_manifest.py
```

やまひろ先生がローカルでAPI Keyつき実行を行う場合:

```powershell
.\scripts\sync_manifest_local.ps1
```

## 現在の初回抽出

Manifest version:

```text
243523.26.04.28.2000-3-bnet.64859
```

初回抽出件数:

- Weapons: 1837
- Exotic armor: 348
- Plugs: 12120
- Sandbox perks: 3681

## ローカルビューア

```powershell
python .\scripts\build_site_indexes.py
.\scripts\serve_site.ps1
```

```text
http://127.0.0.1:8788
```
