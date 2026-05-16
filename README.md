# Viral Scout

Local dashboard for scouting viral TikTok, Instagram Reels, and YouTube Shorts ideas.

For the Pollo / Seedance sponsor workflow, start with the Reels tab and use the focused categories: `UGC`, `Product Promo`, `Ads`, `Reviews`, `Unboxing`, `Explainers`, and `AI Creator`. See [`VIDEO_IDEAS.md`](VIDEO_IDEAS.md) for tested reference links and prompt starters.

## Run locally

```sh
npm install
npm start
```

The server binds to `http://127.0.0.1:4567` by default. Override with `PORT` or `HOST` when needed:

```sh
PORT=4568 npm start
```

The dashboard is served from `dashboard.html`. Starred videos are saved through the local server under `data/stars-*.json`; those files are intentionally ignored as local working state.

For a sponsor demo or hosted version, set `APIFY_TOKEN` on the server. Instagram Reels search will then run through `/api/reels/search`, so the token is not exposed in the browser. If `APIFY_TOKEN` is not set, Reels still works locally by saving a browser token in Settings.

Local runs automatically load `.env` from the project root when present. Keep `.env` private; `.env.example` shows the supported keys.

## Checks

```sh
npm test
npm run test:visual
```

- `npm test` runs the cheap Apify Reels fixture check and skips the live API check unless `APIFY_TOKEN` is set.
- `npm run test:visual` starts the local server when one is not already reachable, exercises the dashboard with Playwright, and writes screenshots to `screenshots/`.

If this runs inside a sandbox that cannot bind local ports, `npm run test:visual` may fail with `listen EPERM`; run it from a normal local shell/browser session instead.

## Environment

- `APIFY_TOKEN`: optional for local Reels verification, required for server-side Instagram Reels search in a hosted/sponsor demo.
- `REELS_QUERY`: optional live Reels search query for `npm test`; quote values that contain spaces.
- `VIRAL_SCOUT_BASE`: optional existing dashboard URL for visual smoke checks.
- `PORT` / `HOST`: optional local server binding overrides.
