# Destiny 2 API Key Storage

## Storage Location

Store real API credentials only here:

```text
C:\Users\DrYam\.secrets\destiny2\bungie.env
```

This file is intentionally outside `H:\マイドライブ\eSport\Destiny2` because the project folder may later be synced, shared, or committed to GitHub.

## File Contents

Create `bungie.env` manually after obtaining the Bungie API key:

```env
BUNGIE_API_KEY=your_real_bungie_api_key_here
```

If OAuth is needed later for opt-in user/account data, add these too:

```env
BUNGIE_CLIENT_ID=your_client_id_here
BUNGIE_CLIENT_SECRET=your_client_secret_here
BUNGIE_REDIRECT_URI=https://localhost:8787/auth/callback
```

## Rules

- Do not paste API keys into chat.
- Do not save real API keys under `H:\マイドライブ\eSport\Destiny2`.
- Do not commit `.env`, `.key`, `.secret`, or `.secrets` files to GitHub.
- Keep `config/bungie.env.example` as a public template only.
- Use the API key through an environment loader in scripts, never by hardcoding it.

## Bungie API Usage

Bungie API requests use the API key in the `X-API-Key` request header.

For the first MVP, the API key should be enough for public Manifest and PGCR-style reads. OAuth credentials should be added only if the project starts handling opt-in user/account data.
