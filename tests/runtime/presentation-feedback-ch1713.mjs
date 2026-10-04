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

const cases = [
  {
    surface: 'dice',
    root: 'presentation-dice-card-ch1713',
    required: ['presentation-dice-panel-ch1713', 'presentation-dice-well-ch1713', 'presentation-dice-ribbon-ch1713'],
    text: /Player 1 đổ xúc xắc/u,
  },
  {
    surface: 'landing',
    root: 'presentation-landing-card-ch1713',
    required: ['presentation-landing-panel-ch1713', 'presentation-landing-icon-well-ch1713', 'presentation-money-chip-ch1713'],
    text: /LỘC VỈA HÈ \+35 B\$/u,
  },
  {
    surface: 'ready',
    root: 'presentation-landing-card-ch1713',
    required: ['presentation-landing-panel-ch1713', 'presentation-landing-icon-well-ch1713', 'presentation-money-chip-ch1713'],
    text: /\+70 B\$/u,
  },
  {
    surface: 'cinematic',
    root: 'presentation-cinematic-card-ch1713',
    required: ['presentation-cinematic-panel-ch1713', 'presentation-cinematic-impact-ch1713'],
    text: /BÀN CỜ ĐÃ BIẾN ĐỔI!/u,
  },
  {
    surface: 'continue',
    root: 'presentation-continue-chip-ch1713',
    required: [],
    text: /TIẾP TỤC/u,
  },
];

try {
  for (const entry of cases) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));

    await page.goto(`http://127.0.0.1:5173/tests/runtime/presentation-feedback-ch1713.html?surface=${entry.surface}`);
    await page.waitForFunction(() => window.surfaceReady === true, { timeout: 30000 });

    const state = await page.evaluate(({ root, required }) => {
      const api = window.feedbackCh1713;
      return {
        root: api?.inspect(root),
        texts: api?.texts(root) ?? [],
        required: required.map((name) => api?.inspect(name)),
      };
    }, entry);

    assert(state.root, `${entry.surface}: root missing`);
    assert.equal(state.root.active, true, `${entry.surface}: root inactive`);
    assert.equal(state.root.visible, true, `${entry.surface}: root hidden`);
    assert.ok(Number(state.root.alpha) > 0.45, `${entry.surface}: root alpha too low`);
    assert.ok((state.root.bounds?.width ?? 0) > 80, `${entry.surface}: root width collapsed`);
    assert.ok((state.root.bounds?.height ?? 0) > 25, `${entry.surface}: root height collapsed`);
    assert.match(state.texts.join(' | '), entry.text, `${entry.surface}: visible copy missing`);

    for (const [index, required] of state.required.entries()) {
      assert(required, `${entry.surface}: required CH-17.13 object ${entry.required[index]} missing`);
      assert.equal(required.visible, true, `${entry.surface}: ${entry.required[index]} hidden`);
    }

    assert.deepEqual(errors, [], entry.surface);
    await page.screenshot({ path: `runtime-ui-evidence/ch1713-${entry.surface}-1280x800.png`, fullPage: true });

    await page.setViewportSize({ width: 960, height: 540 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `runtime-ui-evidence/ch1713-${entry.surface}-960x540.png`, fullPage: true });
    await page.close();
  }

  console.log('[presentation-feedback-ch1713-runtime] PASS dice/landing/ready/cinematic/continue feedback renders in Chromium at desktop + compact landscape');
} finally {
  await browser.close();
}
