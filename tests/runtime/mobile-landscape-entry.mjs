import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright`)
  : await import('playwright');

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/154.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/tests/runtime/mobile-landscape-entry.html');
  await page.waitForFunction(() => Boolean(window.mobileLandscapeEntryFixture));

  const before = await page.evaluate(() => window.mobileLandscapeEntryFixture.snapshot());
  assert.equal(before.portrait, true, 'fixture must stay physically portrait');
  assert.equal(before.visible, true, 'portrait phone must show the rotate gate before tap');
  assert.equal(before.resolved, false, 'boot must initially wait for explicit user activation');

  await page.locator('.mememe-landscape-card-simple').click();
  await page.waitForFunction(() => window.mobileLandscapeEntryFixture.state.resolved === true, { timeout: 3500 });

  const after = await page.evaluate(() => window.mobileLandscapeEntryFixture.snapshot());
  assert.equal(after.error, '');
  assert.equal(after.portrait, true, 'fallback proof must resolve even when hardware never rotates');
  assert.equal(after.resolved, true, 'explicit tap must release the boot gate');
  assert.equal(after.visible, false, 'blocking rotate overlay must leave after fallback');
  assert.equal(after.entryMode, 'manual-fallback');
  assert.equal(after.buttonDisabled, false);

  console.log('[mobile-landscape-entry] PASS unsupported orientation lock cannot trap mobile boot');
  await context.close();
} finally {
  await browser.close();
}
