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
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForFunction(() => document.body.classList.contains('mememe-splash-active'), { timeout: 30000 });
  await page.keyboard.press('Enter');
  await page.waitForSelector('.mememe-mode-menu', { timeout: 30000 });

  const mode = await page.evaluate(() => {
    const card = document.querySelector('.mode-menu-card');
    const icon = document.querySelector('.mode-menu-icon');
    const primary = document.querySelector('#mode-board');
    if (!card || !icon || !primary) return null;
    const cs = getComputedStyle(card);
    const is = getComputedStyle(icon);
    const bs = getComputedStyle(primary);
    const ir = icon.getBoundingClientRect();
    return {
      cardBorder: cs.borderTopColor,
      cardShadow: cs.boxShadow,
      cardRadius: parseFloat(cs.borderRadius),
      iconWidth: ir.width,
      iconHeight: ir.height,
      iconRadius: is.borderRadius,
      buttonShadow: bs.boxShadow,
      buttonBorder: bs.borderTopColor,
    };
  });

  assert(mode, 'CH-17 outer mode menu missing');
  assert.ok(mode.cardRadius >= 24, 'mode cards must use chunky rounded geometry');
  assert.ok(mode.iconWidth >= 56 && mode.iconHeight >= 56, 'mode icon must render as a large bubble');
  assert.notEqual(mode.cardShadow, 'none', 'mode card must have toy-like depth');
  assert.notEqual(mode.buttonShadow, 'none', 'primary CTA must have layered depth');

  await page.screenshot({ path: 'runtime-ui-evidence/ch17-mode-menu.png', fullPage: true });

  await page.click('#mode-mini');
  await page.waitForSelector('.mememe-minigame-quick', { timeout: 30000 });

  const quick = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.quick-mini-card'));
    const rects = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      const style = getComputedStyle(card);
      return {
        x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom,
        width: rect.width, height: rect.height,
        radius: parseFloat(style.borderRadius),
        shadow: style.boxShadow,
        whiteSpace: style.whiteSpace,
      };
    });
    const firstIcon = document.querySelector('.quick-mini-icon');
    const firstIconRect = firstIcon?.getBoundingClientRect();
    const firstIconStyle = firstIcon ? getComputedStyle(firstIcon) : null;
    return {
      rects,
      icon: firstIconRect ? {
        width: firstIconRect.width,
        height: firstIconRect.height,
        radius: firstIconStyle?.borderRadius ?? '',
      } : null,
    };
  });

  assert.equal(quick.rects.length, 5);
  const [a,b,c,d,e] = quick.rects;
  assert(a && b && c && d && e);
  assert.ok(Math.abs(a.y - b.y) < 3 && Math.abs(b.y - c.y) < 3, 'CH-17 keeps 3 cards on row one');
  assert.ok(Math.abs(d.y - e.y) < 3 && d.y > a.bottom + 5, 'CH-17 keeps 2 centered cards on row two');
  for (const [index, card] of quick.rects.entries()) {
    assert.ok(card.radius >= 20, `Mini Game card ${index + 1} lost rounded toy shape`);
    assert.notEqual(card.shadow, 'none', `Mini Game card ${index + 1} lost depth`);
    assert.equal(card.whiteSpace, 'normal', `Mini Game card ${index + 1} must still wrap text`);
  }
  assert(quick.icon && quick.icon.width >= 40 && quick.icon.height >= 40, 'Mini Game icon bubble missing');

  await page.screenshot({ path: 'runtime-ui-evidence/ch17-minigame-menu.png', fullPage: true });
  console.log('[visual-refresh-ch17-ui] PASS cozy toy-town menu material + 3/2 Mini Game layout');
} finally {
  await browser.close();
}
