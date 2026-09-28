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
    await page.evaluate(()=>window.scrollFixture.scene.cameras.main.setScroll(73, 41).setZoom(0.8));
    await check('camera-scroll-zoom');
    await page.evaluate(()=>window.scrollFixture.scene.cameras.main.setScroll(0, 0).setZoom(1));
    await page.evaluate(()=>{const f=window.scrollFixture;f.viewport.setScroll(0); f.outer.setRotation(0);});
    await frame();
    const point = await page.evaluate(()=>window.scrollFixture.viewport.root.getWorldTransformMatrix().transformPoint(100,70));
    await page.mouse.move(point.x,point.y); await page.mouse.down(); await page.mouse.move(point.x,point.y-40,{steps:4}); await page.mouse.up();
    const dragScroll=await page.evaluate(()=>-window.scrollFixture.viewport.text.y);
    assert.ok(Math.abs(dragScroll - 40 / (1.15 * 0.8)) < 2, `scaled drag: ${dragScroll}`);
    await page.mouse.move(point.x,point.y); await page.mouse.wheel(0,100);
    await page.waitForFunction(v => -window.scrollFixture.viewport.text.y > v, dragScroll); await frame();
    assert.ok(await page.evaluate(()=>-window.scrollFixture.viewport.text.y) > dragScroll);
    const cleanup=await page.evaluate(()=>{const f=window.scrollFixture; const before=f.scene.input.listenerCount('pointermove'); f.viewport.root.destroy(); return before-f.scene.input.listenerCount('pointermove');});
    assert.equal(cleanup,1);
    assert.deepEqual(errors,[]);
    await page.close();
  }
  for (const surface of ['card', 'news', 'job', 'jobhub', 'jobdetail', 'long', 'choice', 'ranking', 'order']) {
    const page=await browser.newPage({viewport:{width:1280,height:800}});
    const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`http://127.0.0.1:5173/tests/runtime/modal-surfaces.html?surface=${surface}`);
    await page.waitForFunction(()=>window.surfaceReady, {timeout:30000});
    await page.waitForTimeout(500);
    await page.screenshot({path:`runtime-ui-evidence/surface-${surface}-1280x800.png`});
    assert.deepEqual(errors, [], surface);
    if(surface==='job') {
      const sizes=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('job-presentation-card');
        const bodyRoot=root?.getByName('job-scroll-body-070429');
        const font=o=>Number.parseFloat(String(o?.style?.fontSize ?? 0));
        return {
          title:font(root?.getByName('job-result-title-070432')),
          body:font(bodyRoot?.getByName('job-scroll-text-070429')),
          hint:font(root?.getByName('job-result-hint-070432')),
        };
      });
      assert.ok(sizes.title>=32 && sizes.body>=23 && sizes.hint>=18,
        `Job result text too small: ${JSON.stringify(sizes)}`);
    }
    if(surface==='jobhub') {
      const sizes=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('job-hub-modal');
        const texts=[];
        const visit=o=>{
          if(o?.type==='Text') texts.push(o);
          if(o?.list) o.list.forEach(visit);
        };
        visit(root);
        const font=o=>Number.parseFloat(String(o?.style?.fontSize ?? 0));
        const salaries=texts.filter(x=>String(x.text).startsWith('Lv1 '));
        const details=texts.filter(x=>x.text==='XEM CHI TIẾT');
        return {
          title:font(texts.find(x=>x.text==='💼 JOB HUB')),
          subtitle:font(texts.find(x=>x.text==='Đổ xúc xắc để chọn nghề')),
          salaryMin:Math.min(...salaries.map(font)),
          detailMin:Math.min(...details.map(font)),
          roll:font(texts.find(x=>String(x.text).includes('ĐỔ XÚC XẮC'))),
        };
      });
      assert.ok(sizes.title>=29 && sizes.subtitle>=19 && sizes.salaryMin>=14 && sizes.detailMin>=13 && sizes.roll>=21,
        `Job Hub text too small: ${JSON.stringify(sizes)}`);
    }
    if(surface==='jobdetail') {
      const sizes=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('job-detail-modal');
        const texts=[];
        const visit=o=>{
          if(o?.type==='Text') texts.push(o);
          if(o?.list) o.list.forEach(visit);
        };
        visit(root);
        const font=o=>Number.parseFloat(String(o?.style?.fontSize ?? 0));
        return {
          salary:font(texts.find(x=>String(x.text).startsWith('LƯƠNG / VÒNG'))),
          close:font(texts.find(x=>x.text==='← ĐÓNG')),
          max:Math.max(...texts.map(font)),
        };
      });
      assert.ok(sizes.salary>=19 && sizes.close>=18 && sizes.max>=30,
        `Job detail text too small: ${JSON.stringify(sizes)}`);
    }
    if(surface==='choice') {
      const gaps=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('minigame-modal');
        const stage=root.getByName('vf07-minigame-stage');
        const prompt=stage.getByName('vf07-minigame-choice-prompt');
        const hint=stage.getByName('vf07-minigame-choice-hint');
        const privacy=stage.getByName('vf07-minigame-choice-privacy-rail');
        const boxes=stage.list.filter(o=>o.name?.startsWith('vf07-minigame-choice-box-'));
        const promptBounds=prompt.getBounds();
        const hintBounds=hint.getBounds();
        const privacyBounds=privacy.getBounds();
        const cardBounds=boxes.map(o=>o.getBounds());
        return {
          promptToHint: hintBounds.top-promptBounds.bottom,
          hintToCards: Math.min(...cardBounds.map(b=>b.top))-hintBounds.bottom,
          cardsToPrivacy: privacyBounds.top-Math.max(...cardBounds.map(b=>b.bottom)),
        };
      });
      assert.ok(gaps.promptToHint>=10, `Mini Game prompt/helper cramped: ${JSON.stringify(gaps)}`);
      assert.ok(gaps.hintToCards>=20, `Mini Game helper/cards cramped: ${JSON.stringify(gaps)}`);
      assert.ok(gaps.cardsToPrivacy>=20, `Mini Game cards/privacy cramped: ${JSON.stringify(gaps)}`);
    }
    if(surface==='choice') {
      const gaps=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const stage=s.children.getByName('minigame-modal')?.getByName('vf07-minigame-stage');
        const prompt=stage?.getByName('vf07-minigame-choice-prompt');
        const hint=stage?.getByName('vf07-minigame-choice-hint');
        const privacy=stage?.getByName('vf07-minigame-choice-privacy-rail');
        const boxes=[0,1]
          .map(i=>stage?.getByName(`vf07-minigame-choice-box-${i}`))
          .filter(Boolean);
        if(!prompt||!hint||!privacy||boxes.length<2) return null;
        const promptB=prompt.getBounds();
        const hintB=hint.getBounds();
        const privacyB=privacy.getBounds();
        const boxBounds=boxes.map(b=>b.getBounds());
        return {
          promptHint: hintB.top-promptB.bottom,
          hintCards: Math.min(...boxBounds.map(b=>b.top))-hintB.bottom,
          cardsPrivacy: privacyB.top-Math.max(...boxBounds.map(b=>b.bottom)),
        };
      });
      assert.ok(gaps, 'Mini Game choice geometry missing');
      assert.ok(gaps.promptHint>=12, `Mini Game prompt/helper cramped: ${JSON.stringify(gaps)}`);
      assert.ok(gaps.hintCards>=36, `Mini Game helper/cards cramped: ${JSON.stringify(gaps)}`);
      assert.ok(gaps.cardsPrivacy>=20, `Mini Game cards/privacy cramped: ${JSON.stringify(gaps)}`);
      const sizes=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const stage=s.children.getByName('minigame-modal')?.getByName('vf07-minigame-stage');
        const font=o=>Number.parseFloat(String(o?.style?.fontSize ?? 0));
        return {
          prompt:font(stage?.getByName('vf07-minigame-choice-prompt')),
          hint:font(stage?.getByName('vf07-minigame-choice-hint')),
          privacy:font(stage?.getByName('vf07-minigame-choice-privacy-hint')),
          labels:[0,1].map(i=>font(stage?.getByName(`vf07-minigame-choice-label-${i}`))),
        };
      });
      assert.ok(sizes.prompt>=25 && sizes.hint>=18 && sizes.privacy>=17 && sizes.labels.every(v=>v>=18),
        `Mini Game choice text too small: ${JSON.stringify(sizes)}`);
    }
    if(surface==='order') {
      const gap=await page.evaluate(()=>{
        const s=window.surfaceScene;
        return s.detailText.getBounds().top-s.promptText.getBounds().bottom;
      });
      assert.ok(gap>=8, `Roll For Order helper overlap: ${gap}`);
    }
    await page.setViewportSize({width:960,height:540});
    await page.waitForTimeout(200);
    await page.screenshot({path:`runtime-ui-evidence/surface-${surface}-960x540.png`});
    console.log('surface rendered',surface);
    await page.close();
  }
} finally { await browser.close(); }
