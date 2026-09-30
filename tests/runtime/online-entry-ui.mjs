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

  await page.addInitScript(() => {
    sessionStorage.setItem('mememe-online-resume-0705', JSON.stringify({
      mode: 'host',
      transport: 'online',
      roomCode: 'RSUM15',
      clientId: 'host',
      seatId: 0,
      cpuSeatIds: [],
      onlineBaseUrl: 'https://mememe-online.lengochung28191.workers.dev',
      hostToken: 'host-token-ci',
      reconnectToken: '',
      cameraAllowed: false,
      voiceAllowed: false,
      savedAt: Date.now(),
    }));
  });

  await page.route('https://mememe-online.lengochung28191.workers.dev/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/health') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, transport: 'websocket-durable-object' }),
      });
      return;
    }
    if (url.pathname === '/api/rooms/RSUM15/heartbeat') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          roomCode: 'RSUM15',
          settings: { cameraAllowed: false, voiceAllowed: false, cpuFill: true },
          players: [{
            clientId: 'host',
            seatId: 0,
            name: 'Host',
            ready: false,
            role: 'host',
            presence: 'online',
          }],
          started: false,
          cpuSeatIds: [],
          canStart: false,
          closed: false,
          reconnectGraceMs: 60000,
        }),
      });
      return;
    }
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'fixture_unhandled' }),
    });
  });

  await page.goto('http://127.0.0.1:5173/?room=JOIN15');
  await page.waitForFunction(() => document.body.classList.contains('mememe-splash-active'), { timeout: 30000 });
  await page.keyboard.press('Enter');
  await page.waitForSelector('.mememe-lobby-069', { timeout: 30000 });
  await page.waitForFunction(
    () => document.querySelector('#online-service-state')?.textContent?.includes('SẴN SÀNG'),
    { timeout: 10000 },
  );

  assert.equal(await page.inputValue('#online-room'), 'JOIN15');
  assert.equal(await page.isVisible('#lobby-online-resume'), true);
  assert.match(String(await page.textContent('#lobby-online-resume')), /RSUM15/);
  await page.screenshot({ path: 'runtime-ui-evidence/online-entry-1280x800.png' });

  await page.click('#lobby-online-resume');
  await page.waitForSelector('.online-room-lobby', { timeout: 15000 });
  await page.waitForFunction(
    () => document.querySelector('#online-room-code')?.textContent === 'RSUM15',
    { timeout: 10000 },
  );

  assert.equal(await page.isVisible('#online-copy-link'), true);
  await page.waitForFunction(
    () => /1\/4 người/i.test(document.querySelector('#online-room-status')?.textContent ?? ''),
    { timeout: 10000 },
  );
  await page.screenshot({ path: 'runtime-ui-evidence/online-resume-room-1280x800.png' });

  console.log('[online-entry-ui] PASS invite prefill + Worker health + saved host resume into online room');
} finally {
  await browser.close();
}
