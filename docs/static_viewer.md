# DATABASE Viewer

作成日: 2026-05-25

## 目的

Manifestから抽出したDATABASEを、ローカルで検索・確認できるようにするためのビューアです。

現時点では以下を表示します。

- キャラクター、装備、外観/コレクション、所持品/進行、改造/パーク、全データの階層ナビ
- 武器、防具、ゴースト、船、スパロー、エンブレムなどを含む全カタログ検索
- 武器種、弾薬、属性、スロットによる武器フィルタ
- クラス、防具部位、レアリティによる防具フィルタ
- 英語/日本語切替
- 名前/説明/カテゴリ/Hash検索
- Manifest icon URL参照
- 各武器詳細内のPvP POTENTIAL枠

## 生成方法

Manifest同期後に、サイト用の軽量JSONを生成します。

```powershell
cd H:\マイドライブ\eSport\Destiny2
python .\scripts\build_site_indexes.py
```

出力先:

```text
site/data/
```

## 起動方法

```powershell
cd H:\マイドライブ\eSport\Destiny2
.\scripts\serve_site.ps1
```

既定URL:

```text
http://127.0.0.1:8788
```

`site/index.html` を直接ダブルクリックして `file://` で開くと、ブラウザの制限でJSONを読み込めません。必ず上記のローカルサーバー経由で開いてください。

## 注意

- 画像ファイルは保存しません。
- アイコンはBungieのManifest icon URLを参照します。
- `site/data/*.json` はGitHubに置いてよいテキストデータです。
- PvP POTENTIALはManifestだけでは確定できないため、`data/static/ttk/` の台帳から各武器へ順次反映します。
