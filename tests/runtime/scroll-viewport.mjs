import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright`)
  : await import('playwright');
mkdirSync('runtime-ui-evidence', {recursive:true});
const browser = await chromium.launch({headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
try {
  for (const renderer of ['webgl', 'canvas']) {
    const page = await browser.newPage({viewport:{width:1280,height:800}});
    const errors=[]; page.on('pageerror', e=>errors.push(String(e)));
    await page.goto(`http://127.0.0.1:5173/tests/runtime/scroll-viewport.html?renderer=${renderer}`);
    await page.waitForFunction(()=>window.scrollFixture);
    const frame = async()=>page.evaluate(()=>new Promise(r=>window.scrollFixture.scene.game.events.once('postrender',()=>r())));
    const check = async(label)=> {
      await frame();
      const result = await page.evaluate(()=>window.scrollFixture.check());
      await page.screenshot({path:`runtime-ui-evidence/${renderer}-${label}.png`});
      assert.ok(result.inside > 500, `${renderer}/${label}: blank text ${JSON.stringify(result)}`);
      assert.equal(result.outside, 0, `${renderer}/${label}: text outside viewport`);
      assert.ok(result.leftGlyph > 20, `${renderer}/${label}: left glyph clipped`);
      console.log(renderer, label, result);
    };
    await check('nested');
    await page.evaluate(()=>{const f=window.scrollFixture; f.outer.setPosition(360,210).setScale(1.15,0.8).setRotation(0.12);});
    await check('moved-scaled-rotated');
    await page.evaluate(()=>window.scrollFixture.viewport.setScroll(10000));
    await check('bottom');
    await page.evaluate(()=>{const f=window.scrollFixture;f.viewport.setScroll(0); f.outer.setRotation(0);});
    await frame();
    const point = await page.evaluate(()=>window.scrollFixture.viewport.root.getWorldTransformMatrix().transformPoint(100,70));
    await page.mouse.move(point.x,point.y); await page.mouse.down(); await page.mouse.move(point.x,point.y-40,{steps:4}); await page.mouse.up();
    const dragScroll=await page.evaluate(()=>-window.scrollFixture.viewport.text.y);
    assert.ok(Math.abs(dragScroll - 40 / (1.15 * 0.8)) < 2, `scaled drag: ${dragScroll}`);
    await page.mouse.move(point.x,point.y); await page.mouse.wheel(0,100); await frame();
    assert.ok(await page.evaluate(()=>-window.scrollFixture.viewport.text.y) > dragScroll);
    const cleanup=await page.evaluate(()=>{const f=window.scrollFixture; const before=f.scene.input.listenerCount('pointermove'); f.viewport.root.destroy(); return before-f.scene.input.listenerCount('pointermove');});
    assert.equal(cleanup,1);
    assert.deepEqual(errors,[]);
    await page.close();
  }
  for (const surface of ['card', 'news', 'job', 'long', 'ranking', 'order']) {
    const page=await browser.newPage({viewport:{width:1280,height:800}});
    const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`http://127.0.0.1:5173/tests/runtime/modal-surfaces.html?surface=${surface}`);
    await page.waitForFunction(()=>window.surfaceReady, {timeout:30000});
    await page.waitForTimeout(500);
    await page.screenshot({path:`runtime-ui-evidence/surface-${surface}-1280x800.png`});
    assert.deepEqual(errors, [], surface);
    await page.setViewportSize({width:960,height:540});
    await page.waitForTimeout(200);
    await page.screenshot({path:`runtime-ui-evidence/surface-${surface}-960x540.png`});
    console.log('surface rendered',surface);
    await page.close();
  }
} finally { await browser.close(); }
