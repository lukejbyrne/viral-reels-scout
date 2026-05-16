import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("./load-local-env.cjs")();

const token = process.env.APIFY_TOKEN || "";
const query = process.env.REELS_QUERY || "marketing tips";
const actorIds = ["data-slayer~instagram-search-reels", "patient_discovery~instagram-search-reels"];
const apifyHeaders = token
  ? {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    }
  : {
      "content-type": "application/json",
    };

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function numberValue(...values) {
  const value = firstValue(...values);
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function textValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.text || value.caption || "";
  return String(value);
}

function extractInstagramCode(item) {
  const direct = firstValue(item.code, item.shortcode, item.shortCode);
  if (direct) return String(direct);
  const url = firstValue(item.url, item.reel_url, item.reelUrl, item.permalink);
  const match = String(url || "").match(/instagram\.com\/(?:reel|p)\/([^/?#]+)/i);
  return match?.[1] || "";
}

function instagramUrlFromItem(item) {
  const url = firstValue(item.url, item.reel_url, item.reelUrl, item.permalink);
  if (url) return String(url);
  const code = extractInstagramCode(item);
  return code ? `https://www.instagram.com/reel/${code}/` : "";
}

function normalizeReelItem(item, category, index = 0) {
  const code = extractInstagramCode(item);
  const url = instagramUrlFromItem(item);
  const id = String(firstValue(item.id, item.pk, code, `ig_${index}`));
  const user = item.user || item.owner || item.author || {};
  const caption = textValue(firstValue(item.caption, item.caption_text, item.captionText, item.description, item.text));
  const takenAt = firstValue(item.taken_at, item.takenAt, item.timestamp, item.taken_at_timestamp);

  return {
    id,
    category,
    caption: caption.slice(0, 300),
    likesCount: numberValue(item.like_count, item.likes_count, item.likesCount, item.likes),
    viewsCount: numberValue(item.ig_play_count, item.play_count, item.views_count, item.viewsCount, item.video_view_count, item.plays),
    commentsCount: numberValue(item.comment_count, item.comments_count, item.commentsCount, item.comments),
    shareCount: numberValue(item.share_count, item.shares_count, item.shareCount, item.shares),
    username: firstValue(user.username, item.username, item.ownerUsername, item.owner_username, ""),
    fullName: firstValue(user.full_name, user.fullName, item.fullName, item.ownerFullName, ""),
    url,
    displayUrl: firstValue(item.thumbnail_url, item.thumbnailUrl, item.display_url, item.displayUrl, item.image_url, ""),
    timestamp: typeof takenAt === "number" ? new Date(takenAt * 1000).toISOString() : firstValue(takenAt, item.taken_at_date, item.date, new Date().toISOString()),
    videoDuration: Math.round(numberValue(item.video_duration, item.videoDuration, item.duration)),
    type: "Reel",
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyFixture() {
  const fixture = {
    id: "3575393669538547061",
    code: "DGeWZllBoV1",
    caption: { text: "For more tips and insights #instagrammarketingtips" },
    user: { username: "iamishachopra", full_name: "Isha Chopra" },
    ig_play_count: 7169443,
    like_count: 39008,
    comment_count: 284,
    share_count: 95428,
    video_duration: 24.3,
    thumbnail_url: "https://example.com/thumb.jpg",
    taken_at: 1740440232,
  };

  const normalized = normalizeReelItem(fixture, "Marketing", 0);
  assert(normalized.url === "https://www.instagram.com/reel/DGeWZllBoV1/", "Fixture URL did not normalize");
  assert(normalized.viewsCount === 7169443, "Fixture views did not normalize");
  assert(normalized.shareCount === 95428, "Fixture shares did not normalize");
  assert(normalized.caption.includes("tips"), "Fixture caption did not normalize");
  assert(normalized.username === "iamishachopra", "Fixture username did not normalize");
  console.log("Fixture mapping: OK");
}

async function pollDataset(datasetId, limit = 5) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=${limit}&format=json`, {
      headers: apifyHeaders,
    });
    if (!response.ok) throw new Error(`Dataset fetch failed: ${response.status}`);
    const items = await response.json();
    if (items.length > 0) return items;
  }
  return [];
}

async function verifyLive() {
  if (!token) {
    console.log("Live Apify check: SKIPPED (APIFY_TOKEN not set)");
    return;
  }

  let lastError = "";
  let normalized = [];
  let usedActor = "";

  for (const actorId of actorIds) {
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: "POST",
      headers: apifyHeaders,
      body: JSON.stringify(actorId.includes("patient_discovery") ? { query, maxPages: 1 } : { query }),
    });

    if (!response.ok) {
      const body = await response.text();
      lastError = `Actor start failed for ${actorId}: ${response.status} ${body.slice(0, 240)}`;
      continue;
    }

    const run = await response.json();
    const datasetId = run.data?.defaultDatasetId;
    if (!datasetId) {
      lastError = `${actorId} did not return defaultDatasetId`;
      continue;
    }

    const items = await pollDataset(datasetId);
    if (items.length === 0) {
      lastError = `${actorId} returned no Reels`;
      continue;
    }

    normalized = items.map((item, index) => normalizeReelItem(item, query, index)).filter((item) => item.id && item.url);
    usedActor = actorId;
    if (normalized.length > 0) break;
    lastError = `${actorId} returned no usable normalized Reels`;
  }

  assert(normalized.length > 0, lastError || "No live Reels normalized into usable cards");
  assert(normalized.every((item) => item.url.includes("instagram.com/")), "At least one live URL is not an Instagram URL");
  console.log(`Live Apify check: OK (${normalized.length} normalized Reels for "${query}" via ${usedActor})`);
}

verifyFixture();
await verifyLive();
