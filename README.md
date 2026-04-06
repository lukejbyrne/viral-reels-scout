# Viral Reels Scout

A dashboard that finds trending Instagram Reels and lets you browse, filter, and save them for content research.

**How it works:** Pulls trending Instagram Reels across categories (fitness, cooking, tech, etc.) using [Apify](https://apify.com) scrapers, displays them in a browsable dashboard with thumbnails and stats, and lets you star/save your favorites.

## Features

- **Search any niche** -- type "fitness", "cooking", "real estate" or click a preset niche button
- **Customizable niche buttons** -- configure your own in Settings
- **Star/save reels** -- persists to disk via `server.js` or localStorage as fallback
- **Filter and sort** by category, likes, views, comments, or recency
- **Thumbnail previews** -- click through to view on Instagram
- **Copy URL** -- one-click copy for sharing or saving
- **No Instagram account needed** -- browse trends without the app

## Quick Start

### Option A: Just open it (simplest)
1. Clone the repo
2. Open `dashboard.html` in your browser
3. Browse sample trending reels

### Option B: With persistent starred reels (recommended)
1. Clone the repo
2. Run `node server.js`
3. Open `http://localhost:3001`

Option B saves your starred reels to `stars.json` on disk, so they survive browser data clears. Zero dependencies -- just Node.

Both options work with the full feature set: search, star, filter, sort, and copy URL.

## Refreshing the Data

The dashboard ships with sample data. To pull fresh trends, you need an [Apify](https://apify.com) account and API token.

### Using the built-in search

1. Sign up at [apify.com](https://apify.com) (free tier available)
2. Copy your API token from Settings > Integrations
3. Open the dashboard, click **Settings**, paste your token
4. Type a niche in the search bar and hit **Search Reels**
5. The dashboard calls the Apify Instagram Hashtag Scraper and displays results

### Using Apify API directly

```bash
# Run the Instagram hashtag scraper
curl -X POST "https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hashtags": ["fitness"], "resultsLimit": 20}'

# Fetch results (replace DATASET_ID from response)
curl "https://api.apify.com/v2/datasets/DATASET_ID/items?token=YOUR_TOKEN&format=json"
```

### Using Claude Code + Apify MCP

1. Connect Apify to Claude Code:
   ```bash
   claude mcp add --transport http apify https://mcp.apify.com
   ```
2. Ask Claude Code:
   ```
   Search Instagram for trending reels about fitness and cooking.
   Get URLs, view counts, likes, and captions. Save as reels_data.json.
   ```

## Tech Stack

- **Frontend:** Single HTML file, vanilla JS, no build step
- **Server:** `server.js` -- zero-dependency Node.js server for persistent stars
- **Data:** [Apify](https://apify.com) Instagram scraper (free tier available)
- **Embeds:** Thumbnail previews with click-through to Instagram

## License

MIT
