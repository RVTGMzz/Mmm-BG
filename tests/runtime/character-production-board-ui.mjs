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
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173/tests/runtime/character-production-board-ui.html');
  await page.waitForFunction(() => window.characterProductionQaReady === true, { timeout: 45000 });
  await page.waitForTimeout(120);

  const state = await page.evaluate(() => ({
    idle: window.characterProductionQaIdle,
    right: window.characterProductionQaRight,
    left: window.characterProductionQaLeft,
  }));

  assert.deepEqual(errors, []);
  assert.deepEqual(
    state.idle.players.map((entry) => entry.characterId),
    ['secret-baby', 'starter-grumpy', 'starter-anxious', 'starter-hyper'],
  );

  const expectedTextures = [
    'character-crawl-secret-baby-production-ch1819',
    'character-walk-grumpy-production-ch1816',
    'character-walk-anxious-production-ch1817',
    'character-walk-hyper-production-ch1818',
  ];

  state.idle.players.forEach((entry, index) => {
    assert.ok(entry.sprite?.visible, `P${index + 1} Character sprite missing`);
    assert.equal(entry.sprite.textureKey, expectedTextures[index], `P${index + 1} wrong production texture`);
    assert.ok(entry.sprite.displayWidth >= 100 && entry.sprite.displayWidth <= 106, `P${index + 1} display width drifted`);
    assert.ok(entry.sprite.displayHeight >= 100 && entry.sprite.displayHeight <= 106, `P${index + 1} display height drifted`);
    assert.ok(entry.sprite.originY > 0.75, `P${index + 1} feet/crawl origin must stay bottom-biased`);
  });

  const baby = state.idle.players[0];
  assert.equal(baby.ring?.visible, true, 'active SECRET BABY foot ring must be visible');
  assert.equal(baby.ring?.y, 31, 'SECRET BABY ring local Y changed');
  assert.ok(baby.ring?.width >= 70 && baby.ring?.width <= 86, 'SECRET BABY ring width drifted');
  assert.ok(baby.ring?.height >= 16 && baby.ring?.height <= 24, 'SECRET BABY ring height drifted');

  assert.notEqual(String(state.right.sprite?.frame), String(baby.sprite?.frame), 'SECRET BABY crawl frame did not advance while moving');
  assert.equal(state.right.sprite?.flipX, false, 'SECRET BABY moving right should not flip');
  assert.equal(state.left.sprite?.flipX, true, 'SECRET BABY moving left should flip');
  assert.equal(state.right.sprite?.textureKey, expectedTextures[0]);
  assert.equal(state.left.sprite?.textureKey, expectedTextures[0]);

  await page.screenshot({ path: 'runtime-ui-evidence/character-production-board-qa-1280x720.png' });
  console.log('[character-production-board-ui] PASS 4 production Characters + forced test-only SECRET BABY crawl/ring/flip at runtime');
  await page.close();
} finally {
  await browser.close();
}
