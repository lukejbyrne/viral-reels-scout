# Viral Instagram Reels Scout

A dashboard that finds trending Instagram Reels in any niche. Search, preview thumbnails, star your favorites, sort by engagement — all from a single HTML file.

![HTML](https://img.shields.io/badge/HTML-Single_File-E34F26?logo=html5&logoColor=white) ![Apify](https://img.shields.io/badge/Apify-Powered-00C896) ![Zero Deps](https://img.shields.io/badge/Dependencies-Zero-333)

## Features

- **Search any niche** — pull live Instagram Reels data via Apify
- **Thumbnail previews** — see the Reel thumbnail, click through to Instagram
- **Star/save favorites** — persisted to localStorage or disk via optional server
- **Sort by engagement** — views, likes, comments, or most recent
- **Category filters** — auto-generated from search results
- **Customizable niche buttons** — set your go-to niches in Settings
- **Copy URL** — one-click copy any Reel link
- **Instagram-branded UI** — dark theme with the Instagram gradient
- **Sample data included** — 20 Reels across 10 categories load instantly

Part of the **Scout Trifecta**: [TikTok](https://github.com/lukejbyrne/viral-tiktok-scout) · [Instagram Reels](https://github.com/lukejbyrne/viral-reels-scout) · [YouTube Shorts](https://github.com/lukejbyrne/viral-shorts-scout)

## Quick Start

```bash
git clone https://github.com/lukejbyrne/viral-reels-scout.git
```

Open `dashboard.html` in your browser. Sample data loads immediately.

### Live Search

1. Sign up at [apify.com](https://apify.com) (free tier works)
2. Copy your API token
3. Dashboard → **Settings** → paste token → **Save**
4. Search any niche

### Persistent Favorites (Optional)

```bash
node server.js
```

Open `http://localhost:3001`. Stars save to `stars.json` on disk.

## Modify With Claude Code

- `"Add engagement rate — likes + comments divided by views"`
- `"Export starred Reels as CSV"`
- `"Add side-by-side comparison with TikTok for the same niche"`
- `"Add date range filter"`

See [LESSON.md](LESSON.md) for the full guide.

## Deploy

Drag the folder to [app.netlify.com/drop](https://app.netlify.com/drop). Your Apify token stays in localStorage — never in deployed code.

## Part of Build with Luke

This is one of 22 apps inside [Build with Luke](https://www.skool.com/luke). Clone it, customize it, ship it.
