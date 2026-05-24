# Bungie API Key Setup

調査時点: 2026-05-24

## 取得手順

1. Bungie.net にログインします。
2. Application Portal を開きます。
   - https://www.bungie.net/en/Application
3. 新しいApplicationを作成します。
4. 最初は開発用として `Private` のままにします。
5. アプリ名は、例として `Destiny2 PvP DB - Local Dev` のようにします。
6. OAuthをまだ使わない場合、Redirect URLは空欄で通るなら空欄で構いません。
   - 入力が必要な場合は、ローカル開発用に `https://localhost:8787/auth/callback` を使います。
   - BungieのApplication Portalは `http://...` のRedirect URLを拒否することがあります。
7. Application作成後、API Keyが発行されます。
8. API Keyをチャットには貼らず、下記のローカル秘密ファイルに保存します。

```text
C:\Users\DrYam\.secrets\destiny2\bungie.env
```

## 保存する内容

```env
BUNGIE_API_KEY=取得したAPIキー
```

OAuthを使う段階になったら、必要に応じて以下も追加します。

```env
BUNGIE_CLIENT_ID=取得したClient ID
BUNGIE_CLIENT_SECRET=取得したClient Secret
BUNGIE_REDIRECT_URI=https://localhost:8787/auth/callback
```

## 初期MVPでの扱い

Manifest、静的定義、公開PGCR取得を中心にする段階では、まずAPI Keyだけで進めます。

Opt-inユーザーの装備、インベントリ、非公開扱いのDestiny 2データを読む段階になったら、OAuth設計を追加します。

ローカルOAuthを実際に動かす段階では、`https://localhost:8787/auth/callback` で受けられるHTTPSローカルサーバー、または一時的なHTTPSトンネルを用意します。

## セキュリティルール

- API Keyをチャットに貼らない。
- API Keyを `H:\マイドライブ\eSport\Destiny2` 内へ保存しない。
- GitHubには `.env`、`.key`、`.secret`、`.secrets` を上げない。
- スクリプトからは環境変数として読み込む。
- 漏洩が疑われる場合はApplication Portalで古いKeyを無効化し、新しいKeyへ切り替える。

## 公式情報

- Bungie.Net API: https://bungie-net.github.io/
- Bungie Application Portal: https://www.bungie.net/en/Application
- Application Portal Wiki: https://github.com/Bungie-net/api/wiki/Bungie.net-Application-Portal
- OAuth Documentation: https://github.com/Bungie-net/api/wiki/OAuth-Documentation
