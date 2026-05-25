# GitHub Data Operations

作成日: 2026-05-25

## 目的

GitHubを、D2 Monument Archiveの静的テキストDB、ビューア、公開履歴の正本として扱う。

画像や動画などのバイナリ資産はGitHubへ入れず、Manifest由来のアイコンURL、Bungie CDN URL、将来のDiscord添付ID、外部ストレージURLなどの参照情報だけを保存する。

## 公開構成

- `data/static/`: DATABASEの元データ
- `data/static/textdb/`: Manifest由来の英日テキストDB
- `data/static/ttk/`: PvP POTENTIALの根拠CSV
- `schema/`: DATABASEのスキーマ
- `scripts/`: 同期、抽出、サイト用JSON生成
- `site/`: GitHub Pagesで公開する静的ビューア

## デプロイ

`main` へpushすると `.github/workflows/deploy-pages.yml` が `site/` をGitHub Pagesへデプロイする。

GitHub側のPages設定は `Build and deployment: GitHub Actions` を使う。

想定URL:

```text
https://dryamahiro.github.io/Destiny2MonumentArchive/
```

## DATABASE

DATABASEは変更履歴をGitで追跡する。

- 英語と日本語の表示名・説明を分けて保存する
- Manifest同期は再実行可能なスクリプトにする
- 武器、防具、プラグ、カテゴリ、リリース情報をテキスト化する
- PvP POTENTIALはフレーム/アーキタイプ単位を基準にし、武器固有例外だけ個別上書きにする
- PvP POTENTIALは一次情報、Manifest、検証シートの順に根拠を残す

## BATTLE LOG

BATTLE LOGは後工程で扱う。今回のGitHub Pages公開版には、動的DBのデータ導線やUIを含めない。

将来扱う場合も、プレイヤー個人を追跡するためではなく、コミュニティが環境傾向を読むための集計DBとして扱う。

- raw API responseはGitHubに置かない
- 個人識別に近い高粒度データは置かない
- 武器、パーク、防具、クラス、モード、期間ごとの集計にする
- パーティションは `sandbox_version/mode/date` または `season/mode/week` を基本にする

## 画像方針

GitHubへ画像を置くこと自体は可能だが、このプロジェクトでは原則禁止する。

理由:

- 通常のGitHubリポジトリは単一ファイル100MiB超がブロックされる
- 50MiB超のファイルは警告対象になる
- GitHub Pagesの公開サイトは1GB、月間帯域は100GBのソフトリミットがある
- Git LFSは無料枠を超えると帯域・保存容量の課金または停止リスクがある
- 画像を履歴に入れると、削除しても`.git`履歴が重くなりやすい

参照:

- https://docs.github.com/articles/what-is-the-size-limit-for-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/repositories/working-with-files/managing-large-files/about-storage-and-bandwidth-usage

## 容量管理

大きいJSONは、公開ビューアが重くなった時点で分割する。

優先分割:

- 言語別
- section別
- 武器カテゴリ別
- hash範囲別

目安:

- 1ファイル50MiB未満を目標にする
- 100MiBに近づくファイルは必ず分割する
- サイト初期ロード用の `index.json` は小さく保つ

## Discord連携予定

Discord開始後は、画像、検証スクリーンショット、コミュニティ評価をDiscord側で扱う。

GitHubには以下だけを保存する。

- Discord channel ID
- message ID
- attachment URLまたはattachment ID
- 検証ステータス
- 採用した数値と根拠
