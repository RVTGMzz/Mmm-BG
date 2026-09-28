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

const names = {
  card: 'card-scroll-text-070429',
  news: 'news-scroll-text-070429',
  job: 'job-scroll-text-070429',
  ranking: 'vf07-minigame-ranking-rows',
};

try {
  for (const surface of Object.keys(names)) {
    console.log('[full-scene-ui] waiting', surface);
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    let rejectOnPageError;
    const pageErrorPromise = new Promise((_, reject) => {
      rejectOnPageError = (error) => {
        errors.push(String(error));
        reject(error);
      };
      page.once('pageerror', rejectOnPageError);
    });
    await page.goto(`http://127.0.0.1:5173/tests/runtime/full-scene-ui.html?surface=${surface}`);
    await Promise.race([
      page.waitForFunction(() => window.surfaceReady === true, { timeout: 45000 }),
      pageErrorPromise,
    ]);
    if (rejectOnPageError) page.off('pageerror', rejectOnPageError);
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.waitForTimeout(900);

    const result = await page.evaluate((name) => {
      const api = window.fullSceneUi;
      return { canonical: api.canonical, body: api.inspect(name) };
    }, names[surface]);

    assert.equal(result.canonical, true, `${surface}: live scene did not activate canonical ownership`);
    assert.ok(result.body, `${surface}: canonical body object missing after full update chain`);
    assert.equal(result.body.visible, true, `${surface}: canonical body hidden by inherited writer`);
    assert.ok(result.body.alpha > 0.9, `${surface}: canonical body alpha changed by inherited writer`);
    assert.ok(result.body.text.trim().length > 6, `${surface}: canonical body text blank after inherited updates`);

    if (surface === 'ranking') {
      assert.ok(result.body.fontSize >= 22, `ranking: font shrank to ${result.body.fontSize}`);
      assert.match(result.body.text, /🥇|Hạng 1/u);
    } else if (surface === 'job') {
      assert.ok(result.body.fontSize >= 20, `job: font shrank to ${result.body.fontSize}`);
    } else {
      assert.ok(result.body.fontSize >= 20, `${surface}: font shrank to ${result.body.fontSize}`);
    }

    await page.screenshot({ path: `runtime-ui-evidence/full-scene-${surface}-1280x800.png` });
    assert.deepEqual(errors, [], surface);
    await page.close();
  }
  console.log('[full-scene-ui] PASS canonical bodies survive normal super.create + inherited update chain');
} finally {
  await browser.close();
}
