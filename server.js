const http = require('http');
const fs = require('fs');
const path = require('path');

require('./load-local-env.cjs')();

const PORT = process.env.PORT || 4567;
const HOST = process.env.HOST || '127.0.0.1';
const STARS_DIR = path.join(__dirname, 'data');
const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const REELS_ACTORS = [
  {
    id: 'data-slayer~instagram-search-reels',
    input: ({ query }) => ({ query }),
  },
  {
    id: 'patient_discovery~instagram-search-reels',
    input: ({ query, limit }) => ({ query, maxPages: Math.max(1, Math.ceil(limit / 12)) }),
  },
];
const REELS_HAPPY_PATH_MIN = 5;
const APIFY_HEADERS = APIFY_TOKEN
  ? {
      Authorization: `Bearer ${APIFY_TOKEN}`,
      'Content-Type': 'application/json',
    }
  : {
      'Content-Type': 'application/json',
    };

// Create data directory if it doesn't exist
if (!fs.existsSync(STARS_DIR)) fs.mkdirSync(STARS_DIR);

// Per-platform stars files
function starsFile(platform) {
  const safe = platform.replace(/[^a-z]/g, '');
  const file = path.join(STARS_DIR, `stars-${safe}.json`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
  return file;
}

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (!body.trim()) return {};
  return JSON.parse(body);
}

function firstValue(...values) {
  return values.find(value => value !== undefined && value !== null && value !== '');
}

function reelKey(item, index) {
  const direct = firstValue(item.code, item.shortcode, item.shortCode);
  if (direct) return `code:${direct}`;

  const url = firstValue(item.url, item.reel_url, item.reelUrl, item.permalink);
  const match = String(url || '').match(/instagram\.com\/(?:reel|p)\/([^/?#]+)/i);
  if (match?.[1]) return `code:${match[1]}`;

  return `id:${firstValue(item.id, item.pk, `${index}`)}`;
}

function uniqueReels(items) {
  const seen = new Set();
  return items.filter((item, index) => {
    const key = reelKey(item, index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function reelsSearchQueries(query) {
  const clean = String(query || '').trim().replace(/\s+/g, ' ');
  const queries = [clean];
  const isShortBroadQuery = clean.split(' ').length <= 2 && !clean.includes('#') && !/\breels?\b/i.test(clean);
  if (isShortBroadQuery) queries.push(`${clean} reels`);
  return [...new Set(queries)];
}

function cleanApifyError(message) {
  if (/exceed the memory limit/i.test(message)) {
    return 'Apify is still running a previous Instagram search. Wait about a minute, then try again.';
  }
  return message;
}

async function pollDataset(datasetId, limit, maxAttempts = 30) {
  let items = [];
  let lastLength = 0;
  let stableAttempts = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const resp = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=${limit}&format=json`, {
      headers: APIFY_HEADERS,
    });
    if (!resp.ok) {
      const error = await resp.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to read Apify dataset.');
    }
    items = await resp.json();
    if (Array.isArray(items) && items.length >= limit) break;
    if (Array.isArray(items) && items.length > 0) {
      if (items.length === lastLength) stableAttempts += 1;
      else stableAttempts = 0;
      lastLength = items.length;
      if (stableAttempts >= 1) break;
    }
  }
  return Array.isArray(items) ? items : [];
}

async function waitForRunFinish(runId, maxAttempts = 20) {
  if (!runId) return '';
  const finished = new Set(['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT']);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const resp = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: APIFY_HEADERS,
    });
    if (!resp.ok) return '';

    const run = await resp.json().catch(() => ({}));
    const status = run.data?.status || '';
    if (finished.has(status)) return status;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return '';
}

async function runReelsSearch(query, limit) {
  const searches = reelsSearchQueries(query);
  const results = [];
  const errors = [];
  let items = [];

  for (const searchQuery of searches) {
    for (const actor of REELS_ACTORS) {
      try {
        const runResp = await fetch(`https://api.apify.com/v2/acts/${actor.id}/runs`, {
          method: 'POST',
          headers: APIFY_HEADERS,
          body: JSON.stringify(actor.input({ query: searchQuery, limit })),
        });

        if (!runResp.ok) {
          const errBody = await runResp.json().catch(() => ({}));
          throw new Error(cleanApifyError(errBody.error?.message || `Failed to start ${actor.id} for "${searchQuery}"`));
        }

        const runData = await runResp.json();
        const runId = runData.data?.id || '';
        const datasetId = runData.data?.defaultDatasetId || '';
        if (!datasetId) throw new Error(`No dataset returned from ${actor.id} for "${searchQuery}"`);

        const runItems = await pollDataset(datasetId, Math.min(limit * 2, 100), 8);
        await waitForRunFinish(runId);
        results.push({ actor: actor.id, query: searchQuery, datasetId, items: runItems });
        items = uniqueReels(results.flatMap(result => result.items)).slice(0, limit);
        if (items.length >= Math.min(limit, REELS_HAPPY_PATH_MIN)) break;
      } catch (error) {
        errors.push(error.message);
        if (/Apify is still running a previous Instagram search/.test(error.message)) {
          throw error;
        }
      }
    }
    if (items.length >= Math.min(limit, REELS_HAPPY_PATH_MIN)) break;
  }

  if (items.length > 0) {
    return {
      actor: [...new Set(results.map(result => result.actor))].join(', '),
      actors: [...new Set(results.map(result => result.actor))],
      queries: searches,
      sources: results.map(result => ({
        actor: result.actor,
        query: result.query,
        count: result.items.length,
      })),
      datasetIds: results.map(result => result.datasetId),
      requested: limit,
      returned: items.length,
      items,
    };
  }

  throw new Error(errors.join('; ') || results.map(result => `${result.actor} returned no Reels`).join('; ') || 'No Instagram Reels returned');
}

const server = http.createServer((req, res) => {
  // CORS headers
  const origin = req.headers.origin || '';
  const allowedOrigin = origin.startsWith(`http://${HOST}:${PORT}`) || origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://localhost:')
    ? origin
    : '';
  if (allowedOrigin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: GET /api/health
  if (req.url === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      apifyConfigured: Boolean(APIFY_TOKEN),
      reelsActors: REELS_ACTORS.map(actor => actor.id),
    });
    return;
  }

  // API: POST /api/reels/search
  if (req.url === '/api/reels/search' && req.method === 'POST') {
    if (!APIFY_TOKEN) {
      sendJson(res, 501, { error: 'Server APIFY_TOKEN is not configured. Add APIFY_TOKEN or use a local browser token.' });
      return;
    }

    readJsonBody(req)
      .then(async (body) => {
        const query = String(body.query || '').trim();
        const limit = Math.min(Math.max(Number(body.limit) || 12, 1), 50);
        if (!query) {
          sendJson(res, 400, { error: 'Missing Reels search query.' });
          return;
        }
        const result = await runReelsSearch(query, limit);
        sendJson(res, 200, result);
      })
      .catch((error) => {
        sendJson(res, 500, { error: error.message || 'Reels search failed.' });
      });
    return;
  }

  // API: GET /api/stars/:platform
  const starsMatch = req.url.match(/^\/api\/stars\/(\w+)$/);
  if (starsMatch && req.method === 'GET') {
    const data = fs.readFileSync(starsFile(starsMatch[1]), 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
    return;
  }

  // API: POST /api/stars/:platform
  if (starsMatch && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        JSON.parse(body);
        fs.writeFileSync(starsFile(starsMatch[1]), body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch {
        res.writeHead(400);
        res.end('{"error":"Invalid JSON"}');
      }
    });
    return;
  }

  // Serve static files
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  let requestPath = url.pathname === '/' ? '/dashboard.html' : url.pathname;
  let filePath = path.resolve(__dirname, `.${requestPath}`);

  // Prevent directory traversal
  if (!filePath.startsWith(`${__dirname}${path.sep}`)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.on('error', (error) => {
  console.error(`Viral Scout server failed to listen on http://${HOST}:${PORT}: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Viral Scout running at http://${HOST}:${PORT}`);
});
