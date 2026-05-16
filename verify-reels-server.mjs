import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { setTimeout as wait } from "node:timers/promises";

const require = createRequire(import.meta.url);
require("./load-local-env.cjs")();

const token = process.env.APIFY_TOKEN || "";
const query = process.env.REELS_QUERY || "marketing tips";
const port = Number(process.env.PORT || 4577);
const base = `http://127.0.0.1:${port}`;
const sourceOnly = process.argv.includes("--source-only");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyServerSource() {
  const source = readFileSync(new URL("./server.js", import.meta.url), "utf8");
  const forbiddenParallelStarts = [
    /Promise\.all\s*\(\s*REELS_ACTORS/,
    /REELS_ACTORS\.map\s*\(\s*async/,
    /searches\.map\s*\(\s*async/,
  ];

  assert(source.includes("async function runReelsSearch"), "server.js should define runReelsSearch");
  assert(source.includes("for (const searchQuery of searches)"), "Reels search should iterate search queries sequentially");
  assert(source.includes("for (const actor of REELS_ACTORS)"), "Reels search should iterate Apify actors sequentially");
  assert(!forbiddenParallelStarts.some(pattern => pattern.test(source)), "Reels search should not start Apify actors in parallel");
  assert(source.includes("Apify is still running a previous Instagram search"), "Memory-limit errors should use the retry-friendly Apify message");
  console.log("Server source guard: OK (Reels actor starts stay sequential)");
}

function startServer() {
  const child = spawn(process.execPath, ["server.js"], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return response.json();
    } catch {
      await wait(250);
    }
  }
  throw new Error("Server did not become reachable.");
}

verifyServerSource();

if (sourceOnly) process.exit(0);

const server = startServer();

try {
  const health = await waitForServer();
  assert(health.ok === true, "Health endpoint did not return ok=true");
  assert(Array.isArray(health.reelsActors) && health.reelsActors.length >= 2, "Health endpoint did not list Reels actors");

  const response = await fetch(`${base}/api/reels/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, limit: 3 }),
  });
  const body = await response.json().catch(() => ({}));

  if (!token) {
    assert(response.status === 501, "Server should return 501 when APIFY_TOKEN is missing");
    assert(String(body.error || "").includes("APIFY_TOKEN"), "Missing-token response should mention APIFY_TOKEN");
    console.log("Server Reels check: OK (missing APIFY_TOKEN path)");
  } else {
    assert(response.ok, body.error || `Server Reels search failed with ${response.status}`);
    assert(Array.isArray(body.items) && body.items.length > 0, "Server Reels search returned no items");
    assert(body.actor, "Server Reels response did not include actor");
    console.log(`Server Reels check: OK (${body.items.length} raw items via ${body.actor})`);
  }
} finally {
  server.kill("SIGTERM");
}
