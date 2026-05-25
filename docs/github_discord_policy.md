# GitHub / Discord Policy

調査・方針確定日: 2026-05-24

## 基本方針

このプロジェクトでは、GitHubはテキストデータとコードの保管に限定します。

Discordサーバーは、Destiny 2の最終大型アップデート後に新設し、コミュニティ運用、画像参照、装備データ参照、検証募集、更新告知の基盤として使います。

## GitHubに置くもの

- スキーマ
- ETLコード
- データベース（DATABASE）のテキストデータ
- バトルログ（BATTLE LOG）の集計済みテキストデータ
- JSON / CSV / Markdown / SQL
- 画像への参照情報
- Discord投稿やチャンネルへの参照ID

## GitHubに置かないもの

- API Key
- OAuth secret
- 画像ファイル
- 動画ファイル
- 生ログ
- プレイヤー単位の非公開・高粒度データ
- Discord bot token

## 画像ファイルについて

GitHubに画像を置くことは技術的には可能です。ただし、このプロジェクトでは長期運用コストと公開速度を優先し、画像の実体はGitHubに置きません。

理由:

- GitHub通常リポジトリは単一ファイル100MiB超をブロックする
- 50MiB超のファイルは警告対象になる
- GitHub Pagesの公開サイトは1GB、月間帯域は100GBのソフトリミットがある
- Git LFSは無料枠を超えると帯域・保存容量の課金または停止リスクがある
- 画像をGit履歴に入れると、削除後も履歴が重くなりやすい

保存するのは画像そのものではなく、以下の参照情報に限定します。

- Bungie CDNのicon URL
- Bungie.netページURL
- 将来のDiscord attachment ID
- 外部ストレージURL
- 検証スクリーンショットの出典メモ

参照:

- https://docs.github.com/articles/what-is-the-size-limit-for-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/repositories/working-with-files/managing-large-files/about-storage-and-bandwidth-usage

## Discordで扱うもの

- 武器画像、防具画像、検証スクリーンショット
- 武器ページ/装備ページへの参照
- コミュニティ検証依頼
- PvP POTENTIAL検証結果の議論
- パーク差分の解釈
- 更新告知

## Discord開始タイミング

Discordサーバー新設は、2026年6月9日の最終大型アップデート後に行います。

理由:

- 6月アップデートで武器、防具、PvPモード、報酬体系が変わる可能性がある
- アップデート前にチャンネル設計を固めると、すぐ作り直しになる可能性がある
- 最終環境が見えた後に、コミュニティが使いやすい参照構造を作る方がよい

## AI運用の考え方

AIには、DATABASEの整備、BATTLE LOGの集計、差分検出、Discord投稿文の下書き、更新ログ生成を委ねます。

ただし、以下はDr.YamaHiroが最終判断します。

- 公開する指標の定義
- コミュニティ向けの断定表現
- API/OAuthの権限範囲
- Discordサーバーの公開タイミング
- bot導入や外部連携
