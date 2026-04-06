# Module: Viral Instagram Reels Scout

[VIDEO EMBED]

---

## What You'll Build

A single-page dashboard that finds trending Instagram Reels in any niche using the Apify API. Search a keyword, see thumbnails and engagement stats, star your favorites, sort by views or likes, and filter by category -- all in one HTML file with zero dependencies.

- **Search any niche** -- type "fitness," "cooking," or anything else and pull live Reels data
- **Star favorites** -- save Reels you want to recreate or reference later, persisted to localStorage
- **Sort by engagement** -- most viewed, most liked, most commented, or most recent
- **Filter by category** -- auto-generated filter buttons based on your search results
- **Thumbnail previews** -- see the Reel thumbnail inline, click through to watch on Instagram
- **Copy URL** -- one-click copy any Reel link for sharing
- **Instagram-branded UI** -- dark theme with the Instagram gradient throughout
- **Works offline** -- sample data loads instantly, no API key required to explore

---

## Source Code

https://github.com/lukejbyrne/viral-reels-scout

---

## Step 1: Get It Running

Download or clone the repo:

```
git clone https://github.com/lukejbyrne/viral-reels-scout.git
```

Open `dashboard.html` in your browser. That's it. You'll see twenty sample Reels across ten categories immediately -- no API key, no terminal commands, no build step.

To search live Instagram data:

1. Sign up at [apify.com](https://apify.com) (free tier gives you ~30-50 runs/month)
2. Go to Settings > Integrations and copy your API token
3. In the dashboard, click **Settings**, paste your token, click **Save Token**
4. Type any niche in the search bar and click **Search Reels**

For persistent star storage, run `node server.js` and open `http://localhost:3001`. Zero dependencies -- no npm install needed.

---

## Step 2: Make It Yours

Open the project in Claude Code and try one of these prompts:

**Change the niches:**
> "Change the default niche buttons to: Street Food, Vintage Fashion, Home Gym, Digital Art, Van Life, Gardening, Sneakers, Coffee, Skincare, Book Reviews."

**Add engagement rate:**
> "Add an engagement rate calculation -- likes plus comments divided by views -- and display it on each card. Add a sort option for engagement rate."

**Export your research:**
> "Add a button that exports all starred Reels as a CSV file with columns for creator, caption, likes, views, comments, and URL."

**Date filtering:**
> "Add a date range filter so I can see only Reels from the last 7 days, 30 days, or all time."

Each of these takes Claude Code seconds. Stack as many as you want.

---

## Step 3: Extend with Claude Code

This is where you go beyond the template. Open Claude Code in the project directory and try a bigger prompt:

> "Add a Compare button next to the search bar that opens a side-by-side view showing top Reels on the left and top TikToks on the right for the same search term, with average engagement stats for each platform."

Claude Code will read the entire HTML file, understand the structure, and build the feature. Since it's a single file with no framework, modifications are fast and predictable.

Other ideas:
- "Add a 'Remake with AI' button that copies the caption to clipboard and opens an AI video tool"
- "Add pagination so it loads 12 Reels at a time with a Load More button"
- "Add a dark/light theme toggle"
- "Connect to a different Apify actor for Instagram scraping"

---

## Step 4: Deploy It

**Netlify (recommended):**

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the entire project folder
3. Your dashboard is live instantly with a free URL and HTTPS

Your Apify token stays in your browser's localStorage -- it's never in the deployed code.

**Custom domain:** Add it in Netlify settings. One click. HTTPS is automatic.

**GitHub Pages (alternative):**

1. Push to GitHub
2. Go to Settings > Pages > Deploy from branch > `main`
3. Live at `https://yourusername.github.io/viral-reels-scout/`

Both options are free.

---

## Challenge

Compare what's trending on Reels vs TikTok in the same niche. Are they the same videos? Are the same creators posting on both platforms? Is engagement higher on one?

1. Open both the Reels Scout and TikTok Scout dashboards
2. Search the same niche on both (e.g., "fitness" or "cooking")
3. Compare the top results -- same trends? Same creators? Different content styles?
4. Star the best-performing content on each platform
5. **Share your findings in the community** -- which platform had higher engagement? Were any videos cross-posted?

Bonus: Use Claude Code to build the side-by-side comparison feature right into the dashboard so you can see both platforms at once.
