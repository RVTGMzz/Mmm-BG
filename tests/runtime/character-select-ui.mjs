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

const viewports = [
  { width: 1280, height: 800, name: '1280x800' },
  { width: 960, height: 540, name: '960x540' },
];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto('http://127.0.0.1:5173/tests/runtime/character-select-ui.html');
    await page.locator('#start-game').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#start-game').click();
    await page.locator('.character-select-panel-ch02c').waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => {
      const root = document.querySelector('.mememe-character-select-ch02c');
      const panel = document.querySelector('.character-select-panel-ch02c');
      const cards = [...document.querySelectorAll('.character-card-ch02c')];
      const random = document.querySelector('.character-random-ch02c');
      const strong = cards[0]?.querySelector('strong');
      const small = cards[0]?.querySelector('small');
      const passive = cards[0]?.querySelector('.character-passive-ch02c');
      const rect = (node) => {
        const r = node?.getBoundingClientRect();
        return r ? { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height } : null;
      };
      return {
        viewport: { width: innerWidth, height: innerHeight },
        fontFamily: root ? getComputedStyle(root).fontFamily : '',
        panel: rect(panel),
        cards: cards.map(rect),
        count: cards.length,
        randomText: random?.textContent ?? '',
        strongFont: strong ? Number.parseFloat(getComputedStyle(strong).fontSize) : 0,
        smallFont: small ? Number.parseFloat(getComputedStyle(small).fontSize) : 0,
        passiveFont: passive ? Number.parseFloat(getComputedStyle(passive).fontSize) : 0,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      };
    });

    assert.equal(state.count, 5, `${viewport.name}: Character Select must show four starters + RANDOM`);
    assert.match(state.randomText, /RANDOM \(\?\)/u);
    assert.match(state.fontFamily, /system-ui/i, `${viewport.name}: Character Select must retain the Vietnamese-safe system font stack`);
    assert.doesNotMatch(state.fontFamily, /Arial Rounded/i, `${viewport.name}: rounded fallback must not return`);
    assert.ok(state.panel, `${viewport.name}: Character Select panel missing`);
    assert.ok(state.panel.left >= -1 && state.panel.top >= -1, `${viewport.name}: panel escaped top/left viewport`);
    assert.ok(state.panel.right <= state.viewport.width + 1 && state.panel.bottom <= state.viewport.height + 1,
      `${viewport.name}: panel escaped viewport bounds: ${JSON.stringify(state.panel)}`);
    for (const [index, card] of state.cards.entries()) {
      assert.ok(card, `${viewport.name}: card ${index + 1} missing bounds`);
      assert.ok(card.left >= state.panel.left - 1 && card.right <= state.panel.right + 1,
        `${viewport.name}: card ${index + 1} escaped panel horizontally`);
      assert.ok(card.top >= state.panel.top - 1 && card.bottom <= state.panel.bottom + 1,
        `${viewport.name}: card ${index + 1} escaped panel vertically`);
    }
    assert.ok(state.strongFont >= 15, `${viewport.name}: character title font shrank to ${state.strongFont}px`);
    assert.ok(state.smallFont >= 10, `${viewport.name}: character metadata font shrank to ${state.smallFont}px`);
    assert.ok(state.passiveFont >= 10, `${viewport.name}: passive font shrank to ${state.passiveFont}px`);
    assert.ok(state.scrollWidth <= state.viewport.width + 1, `${viewport.name}: horizontal document overflow detected`);
    assert.ok(state.scrollHeight <= state.viewport.height + 1, `${viewport.name}: vertical document overflow detected`);
    assert.deepEqual(errors, [], viewport.name);

    await page.screenshot({ path: `runtime-ui-evidence/character-select-${viewport.name}.png` });
    await page.close();
  }

  console.log('[character-select-ui] PASS Vietnamese-safe typography + 5-card containment at 1280x800 and 960x540');
} finally {
  await browser.close();
}
