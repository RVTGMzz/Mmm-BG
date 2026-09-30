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
  jobwait: 'job-scroll-text-070429',
  jobdetail: 'job-detail-salary-levels-070432',
  ranking: 'vf07-minigame-ranking-rows',
  majority: 'vf07-majority-result-copy',
  rules: 'vf07-minigame-result-body',
  rulesplay: 'vf07-minigame-choice-prompt',
  passive: 'character-passive-body-ch05',
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
    if (surface === 'passive') {
      await page.waitForFunction(
        (name) => String(window.fullSceneUi?.inspect(name)?.text ?? '').includes('roll 18.42%'),
        names[surface],
        { timeout: 5000 },
      );
    }

    const result = await page.evaluate((name) => {
      const api = window.fullSceneUi;
      return { canonical: api.canonical, body: api.inspect(name) };
    }, names[surface]);

    assert.equal(result.canonical, true, `${surface}: live scene did not activate canonical ownership`);
    assert.ok(result.body, `${surface}: canonical body object missing after full update chain`);
    assert.equal(result.body.visible, true, `${surface}: canonical body hidden by inherited writer`);
    assert.ok(result.body.alpha > 0.9, `${surface}: canonical body alpha changed by inherited writer`);
    assert.ok(result.body.text.trim().length > 6, `${surface}: canonical body text blank after inherited updates`);

    if (surface === 'card' || surface === 'news') {
      assert.ok(result.body.fontSize >= 20, `${surface}: font shrank to ${result.body.fontSize}`);
      assert.ok(result.body.y >= 0, `${surface}: short body copy should be vertically balanced, got y=${result.body.y}`);
      const chrome = await page.evaluate((rootName) => ({
        texts: window.fullSceneUi?.visibleTexts(rootName) ?? [],
        impact: window.fullSceneUi?.inspect('cinematic-impact-ch13'),
      }), surface === 'card' ? 'card-presentation-card' : 'news-presentation-card');
      assert.equal(chrome.texts.includes('N'), false, `${surface}: rarity badge N must not render`);
      assert.ok(chrome.impact?.visible, `${surface}: impact sticker missing`);
      const kicker = await page.evaluate(() => window.fullSceneUi?.inspect('cinematic-kicker-ch141'));
      assert.equal(kicker?.visible, true, `${surface}: shared kicker missing`);
      assert.equal(kicker?.y, -123, `${surface}: kicker must be vertically centered in shared header`);
    } else if (surface === 'ranking') {
      assert.ok(result.body.fontSize >= 24, `ranking: font shrank to ${result.body.fontSize}`);
      assert.match(result.body.text, /🥇|Hạng 1/u);
      const podiumPaper = await page.evaluate(() => window.fullSceneUi?.inspect('vf07-minigame-podium-paper-ch141'));
      assert.equal(podiumPaper?.type, 'Graphics', 'ranking: podium surface must use rounded Graphics owner');
    } else if (surface === 'job' || surface === 'jobwait') {
      assert.ok(result.body.fontSize >= 23, `${surface}: font shrank to ${result.body.fontSize}`);
      if (surface === 'jobwait') {
        const waitVisual = await page.evaluate(() => ({
          die: window.fullSceneUi?.inspect('job-result-die-chip-070432'),
          icon: window.fullSceneUi?.inspect('job-result-impact-icon-070432'),
        }));
        assert.equal(waitVisual.die?.visible, false, 'jobwait: stale header chip should be hidden');
        assert.equal(waitVisual.icon?.text, '🎲', 'jobwait: body icon must be dice only');
      }
    } else if (surface === 'jobdetail') {
      assert.ok(result.body.fontSize >= 18, `jobdetail: salary font shrank to ${result.body.fontSize}`);
      assert.doesNotMatch(result.body.text, /LƯƠNG \/ VÒNG/u);
      assert.match(result.body.text, /Lv1 .* B\$.*Lv2 .* B\$.*Lv3 .* B\$/u);
      const label = await page.evaluate(() => window.fullSceneUi?.inspect('job-detail-salary-label-070432'));
      assert.equal(label?.text, 'LƯƠNG / VÒNG');
    } else if (surface === 'majority') {
      assert.ok(result.body.fontSize >= 18, `majority: font shrank to ${result.body.fontSize}`);
      assert.match(result.body.text, /KHÔNG CÓ PHE THIỂU SỐ|BỊ LOẠI/u);
      const resultBox = await page.evaluate(() => window.fullSceneUi?.inspect('vf07-majority-result-box-ch141'));
      assert.equal(resultBox?.type, 'Graphics', 'majority: result box must use rounded Graphics owner');
    } else if (surface === 'rules') {
      assert.ok(result.body.fontSize >= 24, `rules: font shrank to ${result.body.fontSize}`);
      assert.match(result.body.text, /Không tính thời gian chọn/u);
      assert.match(result.body.text, /OẲN TÙ XÌ/u);
      const resultPaper = await page.evaluate(() => window.fullSceneUi?.inspect('vf07-minigame-result-paper-ch141'));
      assert.equal(resultPaper?.type, 'Graphics', 'rules: result paper must use rounded Graphics owner');
    } else if (surface === 'rulesplay') {
      assert.ok(result.body.fontSize >= 25, `rulesplay: prompt font shrank to ${result.body.fontSize}`);
      assert.match(result.body.text, /CHỌN KÍN/u);
      const transition = await page.evaluate(() => window.rulesPlayState);
      assert.equal(transition?.choiceCount, 3, 'rulesplay: Three Doors gameplay must expose exactly 3 choices');
      assert.deepEqual(transition?.choiceTypes, ['Graphics', 'Graphics', 'Graphics'],
        'rulesplay: all choice cards must use rounded Graphics owners');
      assert.equal(transition?.staleRules, false, 'rulesplay: rule body must be destroyed before gameplay');
      assert.equal(transition?.subtitleVisible, false, 'rulesplay: repeated subtitle chrome must stay hidden during gameplay');
      assert.match(String(transition?.promptText ?? ''), /CHỌN KÍN/u);
    } else if (surface === 'passive') {
      assert.ok(result.body.fontSize >= 14, `passive: font shrank to ${result.body.fontSize}`);
      assert.match(result.body.text, /Tỷ lệ 40%/u);
      assert.match(result.body.text, /roll 18\.42%/u);
    } else {
      assert.ok(result.body.fontSize >= 20, `${surface}: font shrank to ${result.body.fontSize}`);
    }

    await page.screenshot({ path: `runtime-ui-evidence/full-scene-${surface}-1280x800.png` });
    if (surface === 'passive' || surface === 'jobwait' || surface === 'jobdetail' || surface === 'majority' || surface === 'rules' || surface === 'rulesplay' || surface === 'card' || surface === 'news') {
      await page.setViewportSize({ width: 960, height: 540 });
      await page.waitForTimeout(250);
      await page.screenshot({ path: `runtime-ui-evidence/full-scene-${surface}-960x540.png` });
    }
    assert.deepEqual(errors, [], surface);
    await page.close();
  }
  console.log('[full-scene-ui] PASS canonical bodies survive normal super.create + inherited update chain');
} finally {
  await browser.close();
}
