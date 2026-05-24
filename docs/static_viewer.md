# Static Viewer

作成日: 2026-05-25

## 目的

Manifestから抽出した静的DBを、ローカルで検索・確認できるようにするためのビューアです。

現時点では以下を表示します。

- 武器一覧
- エキゾチック防具一覧
- 英語/日本語切替
- 名前/タイプ/Hash検索
- タイプ、弾薬、クラス、部位フィルタ
- Manifest icon URL参照
- TTK未反映状態の表示

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

## 注意

- 画像ファイルは保存しません。
- アイコンはBungieのManifest icon URLを参照します。
- `site/data/*.json` はGitHubに置いてよいテキストデータです。
- TTKはManifestだけでは確定できないため、`data/static/ttk/` の台帳から順次反映します。
