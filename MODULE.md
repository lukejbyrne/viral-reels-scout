# Module: Viral Instagram Reels Scout

## What You'll Build

A single-page dashboard that scrapes trending Instagram Reels using Apify and displays them with engagement stats, thumbnail previews, and star/save functionality -- all in one HTML file with zero dependencies.

## What It Does

- **Search any niche** -- type a keyword like "fitness" or "cooking" and pull live Instagram Reels via the Apify API
- **Star/save favorites** -- click the star on any reel to save it; persists to localStorage or disk via the optional server
- **Sort by engagement** -- sort reels by most liked, most viewed, most commented, or most recent
- **Filter by category** -- filter buttons auto-generate from your search results, plus customizable niche quick-search buttons
- **Thumbnail previews** -- see reel thumbnails inline, click through to Instagram to watch
- **Copy URL** -- one-click copy any reel link for sharing or saving
- **Settings panel** -- save your Apify token, customize niche buttons, and set results count
- **Dark theme** -- clean Instagram-branded dark UI that matches the TikTok Scout aesthetic

## Get It Running (5 minutes)

### Option A: Just open the file

1. Clone or download the repo
2. Open `dashboard.html` in your browser
3. Browse the sample data -- 20 trending reels across 10 categories

### Option B: With persistent star storage

1. Clone or download the repo
2. Run `node server.js`
3. Open `http://localhost:3001`

Option B saves starred reels to `stars.json` on disk. No npm install needed -- zero dependencies.

### To search live Instagram data

1. Sign up at [apify.com](https://apify.com) (free tier: ~30-50 runs/month)
2. Go to Settings > Integrations and copy your API token
3. Open the dashboard, click **Settings**, paste your token, click **Save Token**
4. Type any niche in the search bar and click **Search Reels**

## Make It Yours (15 minutes)

### Change the default niches

Open `dashboard.html` and find the `defaultNiches` array near the top of the `<script>` block:

```js
const defaultNiches = ['Health & Fitness', 'Business', 'Cooking', 'Real Estate', 'Fashion', 'Gaming', 'Beauty', 'Travel', 'Finance', 'Pets', 'Comedy', 'Motivation'];
```

Replace these with your own niches. Or use the Settings panel in the dashboard to save custom niches -- they persist in localStorage.

### Change the sample data

Find the `sampleReels` array at the top of the `<script>` block. Replace with your own data (from an Apify run or manual entry). Each reel object needs:

```js
{
  id: "unique_id",
  category: "Fitness",
  caption: "Your caption here #hashtags",
  likesCount: 50000,
  viewsCount: 500000,
  commentsCount: 1200,
  username: "creator_handle",
  fullName: "Creator Name",
  url: "https://www.instagram.com/reel/XXXXX/",
  displayUrl: "https://thumbnail-url.jpg",
  timestamp: "2026-04-01T12:00:00.000Z",
  videoDuration: 30,
  type: "Reel"
}
```

### Change the color scheme

The Instagram gradient is defined in the CSS. Search for `#e1306c` (Instagram pink) and the gradient colors `#f09433, #e6683c, #dc2743, #cc2366, #bc1888` to customize.

### Change the server port

In `server.js`, change the `PORT` constant:

```js
const PORT = 3001; // Change to any available port
```

## Change It With Claude Code

Here are prompts you can give Claude Code to customize this project:

- "Add a button that exports all starred reels as a CSV file"
- "Add a date range filter so I can see reels from the last 7 days only"
- "Change the grid to show 2 columns on mobile instead of 1"
- "Add a 'Remake with AI' button that copies the caption and opens an AI video tool"
- "Add engagement rate calculation (likes + comments / views) and sort by that"
- "Add a dark/light theme toggle"
- "Connect to a different Apify actor for Instagram scraping"
- "Add pagination so it loads 12 reels at a time with a 'Load More' button"

## Put It Online

### GitHub Pages (free, static only)

1. Push to GitHub
2. Go to Settings > Pages > Deploy from branch > `main`
3. Your dashboard is live at `https://yourusername.github.io/viral-reels-scout/`

Note: GitHub Pages only serves the static HTML -- starred reels save to localStorage only (no `server.js`).

### Railway / Render (free tier, with server)

1. Push to GitHub
2. Connect to [Railway](https://railway.app) or [Render](https://render.com)
3. Set start command: `node server.js`
4. Deploy -- starred reels persist to disk

### Vercel (serverless)

1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. The `dashboard.html` serves as a static site
4. For star persistence, convert `server.js` to a Vercel serverless function

## Video

Record a walkthrough showing:
1. Opening the dashboard and browsing sample data
2. Clicking Settings, pasting an Apify token
3. Searching for a niche (e.g., "cooking")
4. Watching results load with real Instagram Reels
5. Starring a few favorites
6. Filtering by category and sorting by engagement
7. Copying a reel URL
8. Showing the starred filter with saved reels
