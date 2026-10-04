import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright`)
  : await import('playwright');

mkdirSync('runtime-ui-evidence', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForFunction(() => document.body.classList.contains('mememe-splash-active'), { timeout: 30000 });
  await page.keyboard.press('Enter');
  await page.waitForSelector('.mememe-mode-menu', { timeout: 30000 });
  // CH-17.14: the whole Mini Game card is an entry target, not only its CTA.
  await page.click('.mode-menu-card.mini', { position: { x: 170, y: 150 } });
  await page.waitForSelector('.mememe-minigame-quick', { timeout: 30000 });

  // The explicit CTA must still work after returning to the outer mode menu.
  await page.click('#quick-mini-back');
  await page.waitForSelector('.mememe-mode-menu', { timeout: 30000 });
  await page.click('#mode-mini');
  await page.waitForSelector('.mememe-minigame-quick', { timeout: 30000 });

  const layout = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.quick-mini-card'));
    const rects = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      const style = getComputedStyle(card);
      const title = card.querySelector('strong');
      const titleStyle = title ? getComputedStyle(title) : null;
      return {
        x: rect.x,
        y: rect.y,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        scrollWidth: card.scrollWidth,
        clientWidth: card.clientWidth,
        flexDirection: style.flexDirection,
        whiteSpace: style.whiteSpace,
        titleWhiteSpace: titleStyle?.whiteSpace ?? '',
      };
    });
    const footer = document.querySelector('.quick-mini-footer')?.getBoundingClientRect();
    return {
      cards: rects,
      footer: footer ? { y: footer.y, bottom: footer.bottom } : null,
      viewport: { width: innerWidth, height: innerHeight },
    };
  });

  assert.equal(layout.cards.length, 5, 'Quick Mini Game must show five canonical cards.');
  const [a,b,c,d,e] = layout.cards;
  assert(a && b && c && d && e);

  assert.ok(Math.abs(a.y - b.y) < 3 && Math.abs(b.y - c.y) < 3, 'cards 1-3 must share the first row');
  assert.ok(Math.abs(d.y - e.y) < 3, 'cards 4-5 must share the second row');
  assert.ok(d.y > a.bottom + 5, 'second row must sit below first row instead of overlapping it');
  assert.ok(d.x > a.x + 40, 'bottom row must be inset from the left');
  assert.ok(e.right < c.right - 40, 'bottom row must be inset from the right');

  for (const [index, card] of layout.cards.entries()) {
    assert.ok(card.width >= 250, `card ${index + 1} too narrow: ${card.width}`);
    assert.ok(card.height >= 140, `card ${index + 1} collapsed: ${card.height}`);
    assert.equal(card.flexDirection, 'column', `card ${index + 1} must stack content vertically`);
    assert.equal(card.whiteSpace, 'normal', `card ${index + 1} must allow wrapping`);
    assert.equal(card.titleWhiteSpace, 'normal', `card ${index + 1} title must wrap`);
    assert.ok(card.scrollWidth <= card.clientWidth + 2, `card ${index + 1} overflows horizontally`);
  }

  assert(layout.footer, 'Quick Mini Game footer missing');
  assert.ok(layout.footer.y > d.bottom + 8, 'footer must sit below the two-row card grid');

  // Start the selected Mini Game and prove the selector actually hands off to
  // the canonical Phaser Mini Game overlay instead of becoming a dead entry.
  await page.click('#quick-mini-start');
  await page.waitForFunction(
    () => !document.querySelector('.mememe-minigame-quick'),
    { timeout: 30000 },
  );
  await page.waitForTimeout(250);
  assert.deepEqual(pageErrors, [], `Quick Mini Game emitted page errors: ${pageErrors.join(' | ')}`);

  await page.screenshot({ path: 'runtime-ui-evidence/quick-minigame-menu-3-plus-2.png', fullPage: true });
  console.log('[quick-minigame-menu-ui] PASS card + CTA entry, 3+2 grid, and canonical Mini Game handoff');
} finally {
  await browser.close();
}
