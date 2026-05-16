import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || '4567';
const HOST = process.env.HOST || '127.0.0.1';
const BROWSER_HOST = HOST === '0.0.0.0' || HOST === '::' ? '127.0.0.1' : HOST;
const BASE = process.env.VIRAL_SCOUT_BASE || `http://${BROWSER_HOST}:${PORT}`;
const SCREENSHOTS = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOTS)) fs.mkdirSync(SCREENSHOTS);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function canReachServer() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);

  try {
    const response = await fetch(BASE, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureServer() {
  if (await canReachServer()) {
    console.log(`Using existing Viral Scout server at ${BASE}`);
    return null;
  }

  console.log(`Starting Viral Scout server at ${BASE}...`);
  const child = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT, HOST },
    stdio: 'inherit',
  });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    await wait(250);
    if (child.exitCode !== null) {
      throw new Error(`Viral Scout server exited early with code ${child.exitCode}`);
    }
    if (await canReachServer()) return child;
  }

  child.kill();
  throw new Error(`Viral Scout server did not become reachable at ${BASE}`);
}

async function run() {
  const ownedServer = await ensureServer();
  let browser;

  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Suppress external resource errors (TikTok/YouTube embeds will fail)
    page.on('pageerror', () => {});

    console.log('1. Loading dashboard...');
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => page.goto(BASE, { waitUntil: 'domcontentloaded' }));
    await page.waitForTimeout(1000);

  // ── DEFAULT REELS TAB ──
  console.log('2. Testing default Reels tab...');
  const defaultReelsActive = await page.locator('.platform-tab[data-platform="reels"]').evaluate(el => el.classList.contains('active'));
  console.log(`   Reels active on load: ${defaultReelsActive}`);

  const defaultReelsIframes = await page.locator('.card-embed iframe[src*="instagram.com/reel"]').count();
  console.log(`   Preloaded Reel embeds: ${defaultReelsIframes}`);

  const oldReelsPlaceholders = await page.locator('.placeholder-text:has-text("Click to view on Instagram")').count();
  console.log(`   Old Instagram placeholders: ${oldReelsPlaceholders}`);

  const defaultReelsChips = await page.locator('.filter-btn').evaluateAll(buttons => buttons.map(button => button.textContent.trim()));
  const hasAiCreatorChip = defaultReelsChips.includes('AI Creator');
  const hasAdsChip = defaultReelsChips.includes('Ads');
  const useCaseChips = ['UGC', 'Product Promo', 'Reviews', 'Unboxing', 'Explainers', 'AI Creator'];
  const missingUseCaseChips = useCaseChips.filter(chip => !defaultReelsChips.includes(chip));
  const headerBriefVisible = await page.locator('#brief-btn').isVisible();
  console.log(`   Reels AI Creator chip: ${hasAiCreatorChip}`);
  console.log(`   Reels Ads chip: ${hasAdsChip}`);
  console.log(`   Reels use-case chips: ${missingUseCaseChips.length === 0}`);
  console.log(`   Header video brief action: ${headerBriefVisible}`);

  await page.screenshot({ path: path.join(SCREENSHOTS, '00-reels-default.png'), fullPage: false });
  console.log('   Screenshot: 00-reels-default.png');

  // ── TIKTOK TAB ──
  console.log('3. Testing TikTok tab...');
  await page.click('.platform-tab[data-platform="tiktok"]');
  await page.waitForFunction(() => document.body.dataset.readyPlatform === 'tiktok' && document.querySelectorAll('.card').length > 0);

  const tiktokTitle = await page.textContent('#page-title');
  console.log(`   Title: "${tiktokTitle}"`);

  const tiktokCards = await page.locator('.card').count();
  console.log(`   Cards rendered: ${tiktokCards}`);

  const tiktokFilters = await page.locator('.filter-btn').count();
  console.log(`   Filter buttons: ${tiktokFilters}`);

  await page.screenshot({ path: path.join(SCREENSHOTS, '01-tiktok-tab.png'), fullPage: false });
  console.log('   Screenshot: 01-tiktok-tab.png');

  // Test sort dropdown
  const sortOptions = await page.locator('#sort-select option').count();
  console.log(`   Sort options: ${sortOptions}`);

  // Test star button exists
  const starBtns = await page.locator('.star-btn').count();
  console.log(`   Star buttons: ${starBtns}`);

  // Scroll down to see more cards
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS, '02-tiktok-scrolled.png'), fullPage: false });
  console.log('   Screenshot: 02-tiktok-scrolled.png');

  // Scroll back up for tab switching
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // ── REELS TAB ──
  console.log('4. Testing Reels tab...');
  await page.click('.platform-tab[data-platform="reels"]');
  await page.waitForTimeout(800);

  const reelsActive = await page.locator('.platform-tab[data-platform="reels"]').evaluate(el => el.classList.contains('active'));
  console.log(`   Tab active: ${reelsActive}`);

  const reelsCards = await page.locator('.card').count();
  console.log(`   Cards rendered: ${reelsCards}`);

  const bodyClass = await page.evaluate(() => document.body.className);
  console.log(`   Body class: "${bodyClass}"`);

  await page.screenshot({ path: path.join(SCREENSHOTS, '03-reels-tab.png'), fullPage: false });
  console.log('   Screenshot: 03-reels-tab.png');

  // Check reels-specific elements (Instagram link buttons)
  const igLinks = await page.locator('a.btn-open:has-text("Instagram")').count();
  console.log(`   Instagram links: ${igLinks}`);
  const polloButtons = await page.locator('.btn-pollo:has-text("Pollo")').count();
  console.log(`   Pollo buttons: ${polloButtons}`);
  const reelsSortOptions = await page.locator('#sort-select option').evaluateAll(options => options.map(option => option.value));
  console.log(`   Reels sort options: ${reelsSortOptions.join(', ')}`);

  // ── SHORTS TAB ──
  console.log('5. Testing Shorts tab...');
  await page.click('.platform-tab[data-platform="shorts"]');
  await page.waitForTimeout(800);

  const shortsActive = await page.locator('.platform-tab[data-platform="shorts"]').evaluate(el => el.classList.contains('active'));
  console.log(`   Tab active: ${shortsActive}`);

  const shortsCards = await page.locator('.card').count();
  console.log(`   Cards rendered: ${shortsCards}`);

  await page.screenshot({ path: path.join(SCREENSHOTS, '04-shorts-tab.png'), fullPage: false });
  console.log('   Screenshot: 04-shorts-tab.png');

  // Check YouTube links
  const ytLinks = await page.locator('a.btn-open:has-text("YouTube")').count();
  console.log(`   YouTube links: ${ytLinks}`);

  // ── SETTINGS PANEL ──
  console.log('6. Testing settings panel...');
  await page.click('#settings-btn');
  await page.waitForTimeout(400);
  const settingsVisible = await page.locator('#settings-panel').evaluate(el => el.classList.contains('open'));
  console.log(`   Settings panel open: ${settingsVisible}`);
  await page.screenshot({ path: path.join(SCREENSHOTS, '05-settings-open.png'), fullPage: false });
  console.log('   Screenshot: 05-settings-open.png');

  // ── STAR A VIDEO ──
  console.log('7. Testing star functionality...');
  if (settingsVisible) {
    await page.click('#settings-btn');
    await page.waitForTimeout(250);
  }
  // Switch back to TikTok which has more cards
  await page.click('.platform-tab[data-platform="tiktok"]');
  await page.waitForFunction(() => document.body.dataset.readyPlatform === 'tiktok' && document.querySelectorAll('.star-btn').length > 0);

  const firstStar = page.locator('.star-btn').first();
  const wasStarred = await firstStar.evaluate(el => el.classList.contains('starred'));
  if (wasStarred) {
    await firstStar.click({ force: true });
    await page.waitForFunction(() => !document.querySelector('.star-btn')?.classList.contains('starred'));
  }
  await firstStar.click({ force: true });
  await page.waitForFunction(() => document.querySelector('.star-btn')?.classList.contains('starred'));
  const isStarred = await firstStar.evaluate(el => el.classList.contains('starred'));
  console.log(`   First video starred: ${isStarred}`);

  // Click Starred filter
  await page.click('.filter-btn:has-text("Starred")');
  await page.waitForTimeout(500);
  const starredCards = await page.locator('.card').count();
  console.log(`   Starred view cards: ${starredCards}`);
  await page.screenshot({ path: path.join(SCREENSHOTS, '06-starred-filter.png'), fullPage: false });
  console.log('   Screenshot: 06-starred-filter.png');

  await page.evaluate(async () => {
    localStorage.setItem('tiktok_stars_ids', '[]');
    localStorage.setItem('tiktok_stars_videos', '[]');
    await fetch('/api/stars/tiktok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '[]',
    });
  });
  console.log('   Star test cleanup: PASS');

  // ── SWITCH BACK TO ALL ──
  await page.click('.filter-btn:has-text("All")');
  await page.waitForTimeout(300);

  // ── COPY URL ──
  console.log('8. Testing copy URL...');
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const copyBtn = page.locator('.btn-copy').first();
  await copyBtn.click();
  await page.waitForTimeout(300);
  const copyText = await copyBtn.textContent();
  console.log(`   Copy button text after click: "${copyText}"`);

  // ── MOBILE VIEWPORT ──
  console.log('9. Testing mobile viewport...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS, '07-mobile-tiktok.png'), fullPage: false });
  console.log('   Screenshot: 07-mobile-tiktok.png');

  await page.click('.platform-tab[data-platform="reels"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS, '08-mobile-reels.png'), fullPage: false });
  console.log('   Screenshot: 08-mobile-reels.png');

  // ── FULL PAGE SCREENSHOTS ──
  console.log('10. Full page screenshots...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);

  await page.click('.platform-tab[data-platform="tiktok"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS, '09-full-tiktok.png'), fullPage: true });

  await page.click('.platform-tab[data-platform="reels"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS, '10-full-reels.png'), fullPage: true });

  await page.click('.platform-tab[data-platform="shorts"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS, '11-full-shorts.png'), fullPage: true });

  console.log('\n=== SUMMARY ===');
  console.log(`TikTok cards: ${tiktokCards}`);
  console.log(`Reels cards: ${reelsCards}`);
  console.log(`Shorts cards: ${shortsCards}`);
  console.log(`Reels Instagram links: ${igLinks > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`Default Reels active: ${defaultReelsActive ? 'PASS' : 'FAIL'}`);
  console.log(`Default Reels preloaded: ${defaultReelsIframes > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`Old Reels placeholder removed: ${oldReelsPlaceholders === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`Reels AI Creator chip: ${hasAiCreatorChip ? 'PASS' : 'FAIL'}`);
  console.log(`Reels Ads chip: ${hasAdsChip ? 'PASS' : 'FAIL'}`);
  console.log(`Reels use-case chips: ${missingUseCaseChips.length === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`Header video brief action: ${headerBriefVisible ? 'PASS' : 'FAIL'}`);
  console.log(`Reels Pollo handoff buttons: ${polloButtons > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`Reels share sort: ${reelsSortOptions.includes('shares') ? 'PASS' : 'FAIL'}`);
  console.log(`Star functionality: ${isStarred ? 'PASS' : 'FAIL'}`);
  console.log(`Tab switching: ${reelsActive && shortsActive ? 'PASS' : 'FAIL'}`);
  console.log(`Settings panel: ${settingsVisible ? 'PASS' : 'FAIL'}`);
  console.log(`Copy URL: ${copyText === 'Copied!' ? 'PASS' : 'FAIL'}`);
  console.log(`Sort options: ${sortOptions > 0 ? 'PASS' : 'FAIL'}`);
  console.log('Screenshots saved to ./screenshots/');

  if (!defaultReelsActive || defaultReelsIframes === 0 || oldReelsPlaceholders !== 0 || !hasAiCreatorChip || !hasAdsChip || missingUseCaseChips.length > 0 || !headerBriefVisible || !reelsActive || !shortsActive || !settingsVisible || !isStarred || copyText !== 'Copied!' || !igLinks || !polloButtons || !reelsSortOptions.includes('shares')) {
    throw new Error('One or more visual smoke checks failed.');
  }

  } finally {
    if (browser) await browser.close();
    if (ownedServer) ownedServer.kill();
  }
}

run().catch(err => { console.error('TEST FAILED:', err); process.exit(1); });
