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
  const active = state.idle.players.find(entry => entry.id === state.idle.activePlayerId);
  assert(active, 'board must expose an active turn owner');
  assert.equal(active.ring?.visible, true, "current player foot ring must be visible");
  for (const entry of state.idle.players) {
    if (entry.id !== state.idle.activePlayerId) {
      assert.equal(entry.ring?.visible, false, 'non-active ring must stay hidden');
    }
  }
  assert.equal(baby.ring?.y, 31, 'SECRET BABY ring local Y changed');
  assert.ok(baby.ring?.width >= 70 && baby.ring?.width <= 86, 'SECRET BABY ring width drifted');
  assert.ok(baby.ring?.height >= 16 && baby.ring?.height <= 24, 'SECRET BABY ring height drifted');

  assert.ok(new Set(state.right.sampleFrames ?? []).size >= 2,
    'SECRET BABY crawl must cycle through multiple real sprite frames under test-only motion');
  assert.equal(state.right.sprite?.flipX, false, 'SECRET BABY moving right should not flip');
  assert.equal(state.left.sprite?.flipX, true, 'SECRET BABY moving left should flip');
  assert.equal(state.right.sprite?.textureKey, expectedTextures[0]);
  assert.equal(state.left.sprite?.textureKey, expectedTextures[0]);

  await page.screenshot({ path: 'runtime-ui-evidence/character-production-board-qa-1280x720.png' });
  console.log('[character-production-board-ui] PASS 4 production Characters + forced test-only SECRET BABY crawl/ring/flip at runtime');
  await page.close();

  // CH-18.22: separate browser run opts into puppet art. The public route
  // without the query parameter above continues to use the approved strip.
  const pilot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const rigErrors = [];
  pilot.on('pageerror', error => rigErrors.push(String(error)));
  await pilot.goto('http://127.0.0.1:5173/tests/runtime/character-production-board-ui.html?cauCoRigPreview=1');
  await pilot.waitForFunction(() => window.characterProductionQaReady === true, { timeout: 45000 });
  const rigState = await pilot.evaluate(() => ({
    idle: window.characterProductionQaIdle,
    right: window.characterProductionQaRight,
    left: window.characterProductionQaLeft,
  }));
  assert.deepEqual(rigErrors, []);
  assert.equal(rigState.idle.players[1].sprite.visible, false,
    'CAU CÓ strip must be hidden only when all QA rig parts load');
  assert.equal(rigState.idle.rig?.visible, true, 'CAU CÓ independent-part rig did not load');
  assert.ok(rigState.idle.rig?.imageParts >= 2, 'rig has no independently rendered parts');
  assert.ok(Math.abs(rigState.idle.rig.scaleX) > 0, 'rig missing source-to-board transform');
  assert.notEqual(rigState.right.rig?.hipAngle, rigState.idle.rig.hipAngle,
    'hip pivot does not move independently');
  assert.notEqual(rigState.right.rig?.shoulderAngle, rigState.idle.rig.shoulderAngle,
    'shoulder counter-swing does not animate');
  assert.ok(rigState.right.rig.scaleX > 0 && rigState.left.rig.scaleX < 0,
    'rig must preserve right/left facing');
  await pilot.screenshot({ path: 'runtime-ui-evidence/cau-co-rig-ch1822-qa.png' });
  await pilot.close();
  console.log('[character-rig-ch1822-runtime] PASS gated independent-part rig + hip/shoulder motion + facing');
} finally {
  await browser.close();
}
