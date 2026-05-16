# Viral Scout / Pollo Go-Live Checklist

## Ship shape

Use `viral-reels-scout` as the single sponsor-demo dashboard for TikTok, Instagram Reels, and YouTube Shorts. The Pollo segment should open on Reels research, copy a structured Pollo AI Seedance prompt, then jump into Pollo with the research context ready.

## Server requirements

- Set `APIFY_TOKEN` on the server. Reels search uses `/api/reels/search` first so the token is not exposed in the browser.
- Local runs automatically load `.env` from the project root when present.
- Keep `HOST=127.0.0.1` for local demos. Use `HOST=0.0.0.0` only inside controlled hosting.
- Rotate the Apify token after sponsor demos or whenever a screen recording exposes the environment.
- Confirm Apify account credits before recording. Live Reels verification spends credits.

## Demo runbook

1. Start the server:

   ```sh
   npm start
   ```

2. Open `http://127.0.0.1:4567`.
3. Search Reels for the sponsor niche, for example `ai video ads`, `ugc product demo`, or `app launch`.
4. Sort by shares when available.
5. Open at least one Instagram link to prove results are real.
6. Click `Pollo prompt`, confirm the clipboard copy, and allow the Pollo tab to open.
7. In Pollo, paste the prompt and create Seedance 2.0 variants for UGC, product promo, and explainer angles.

## Verification

Status on 14 May 2026: live checks passed with the local `.env` token. Direct normalization returned 5 Reels for `ai video ads`; the server endpoint returned 3 raw items via `data-slayer/instagram-search-reels`.

Cheap checks:

```sh
node --check server.js
node --check verify-apify-reels.mjs
node --check verify-reels-server.mjs
npm test
npm run verify:reels:server
npm run test:visual
```

Live check:

```sh
REELS_QUERY="ai video ads" npm run verify:reels
REELS_QUERY="ai video ads" npm run verify:reels:server
```

## Public-hosting blockers

- The star endpoints are local working-state storage, not a public multi-user backend.
- Do not expose this as a public anonymous app without auth/rate limits.
- For a sponsor demo or private video, server-side Apify token handling is enough.
