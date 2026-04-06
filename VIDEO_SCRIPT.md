# Video Script: Find Viral Instagram Reels in Any Niche

**Target length:** 4-6 minutes (shorter variant -- assumes viewers know the TikTok Scout pattern)
**Tone:** Conversational, direct, practical. Faster pace than TikTok Scout since this is the variant.
**Presentation slides:** presentation/index.html

---

## Hook (0:00 - 0:25)

[FACE CAM]

Remember the TikTok Scout I built? Same idea -- but this time it's Instagram Reels. Type any niche, pull what's going viral right now, star your favorites, sort by engagement. One HTML file, no frameworks. Let me show you how it works.

[CUT TO: Presentation slide 1 -- "Find Viral Instagram Reels in Any Niche"]

---

## Presentation Slides (0:25 - 1:30)

[SCREEN: presentation/index.html]

[Slide 2 -- Same power, now for Reels]

So if you built the TikTok Scout, you already know the pattern. This is the same architecture -- one HTML file, Apify API, zero dependencies -- but wired up to Instagram Reels instead. Same workflow, different platform.

[Slide 3 -- Search, Preview, Star, Analyse]

The flow is identical. Search a niche, preview the trending Reels with thumbnails and engagement stats, star the ones worth studying, and analyse what's working. Four steps, all inside one dashboard.

[Slide 4 -- The Trifecta]

And now you've got the full trifecta. TikTok Scout, Reels Scout, and Shorts Scout coming next. Three platforms, same pattern. You can compare what's trending across all of them.

---

## Screen Share Demo (1:30 - 3:30)

[SCREEN: Dashboard, full screen, cursor moving naturally]

Here's the dashboard. Search bar up top, niche quick-buttons below -- fitness, cooking, business, whatever you care about. Let me click one.

[SCREEN: Click "Cooking" niche button, results load]

Trending cooking Reels. You can see the thumbnail, the creator, the caption, likes, views, comments -- everything you need to decide if this is a trend worth hopping on.

[SCREEN: Hover over a card, click the star icon]

I'll star a couple that look interesting. These save to your browser so they're there next time. Click the star filter up here and you only see your saved ones.

[SCREEN: Click star filter, show starred reels only, then click back to "All"]

Now let's sort. Most viewed first.

[SCREEN: Click sort dropdown, select "Most Viewed", grid reorders]

Instantly reordered. You can also sort by likes, comments, or most recent. And the filter buttons auto-generate based on categories in your results.

[SCREEN: Type "fitness" in search bar, click Search Reels, new results load]

New results, new filters. The whole thing is styled with the Instagram gradient -- pinks, oranges, purples. And you can copy any Reel URL with one click.

[SCREEN: Click copy button, show "Copied!" tooltip]

Setup is the same as TikTok Scout. Clone the repo, open the HTML file, you've got sample data immediately. For live data, paste your Apify token in Settings.

---

## Claude Code Extension (3:30 - 4:30)

[SCREEN: Terminal with Claude Code open in viral-reels-scout directory]

Here's where it gets interesting. Open Claude Code and ask it to add something.

[SCREEN: Type prompt into Claude Code]

"Add a button that exports all starred Reels as a CSV file with columns for creator, caption, likes, views, comments, and URL."

[SCREEN: Claude Code working, generating changes]

It reads the HTML, understands the card structure, the API calls, the layout. Builds the export feature.

[SCREEN: Claude Code finishes, browser shows new Export button, click it, CSV downloads]

Done. You could also ask for engagement rate calculations, date range filtering, a comparison view with TikTok -- whatever you need. One file, so Claude Code handles the whole thing in seconds.

---

## CTA (4:30 - 5:00)

[SCREEN: Presentation slide 5 -- CTA]

So now you've got the trifecta -- TikTok, Reels, and Shorts. Three platforms, same pattern. Search a niche, find what's trending, star your favorites, sort by engagement. All inside Build with Luke. Every project follows the same flow: clone it, customize it, extend it with Claude Code, deploy it. Link in the description. I'll see you in the next one.

[SCREEN: End screen with subscribe button and Build with Luke link]
