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
  for (const surface of ['card', 'news', 'job', 'jobhub', 'jobdetail', 'long', 'choice', 'doors', 'buoys', 'topdice', 'ranking', 'order']) {
    const page=await browser.newPage({viewport:{width:1280,height:800}});
    const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`http://127.0.0.1:5173/tests/runtime/modal-surfaces.html?surface=${surface}`);
    if(surface==='choice' || surface==='doors' || surface==='buoys') {
      await page.waitForFunction(()=>window.rulesReadyToAdvance===true, {timeout:30000});
      await page.keyboard.press('Enter');
    }
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
          hasRemovedSubtitle:texts.some(x=>x.text==='Đổ xúc xắc để chọn nghề'),
          salaryMin:Math.min(...salaries.map(font)),
          detailMin:Math.min(...details.map(font)),
          roll:font(texts.find(x=>String(x.text).includes('ĐỔ XÚC XẮC'))),
        };
      });
      assert.equal(sizes.hasRemovedSubtitle,false,'Job Hub must not restore the removed instruction subtitle');
      assert.ok(sizes.title>=29 && sizes.salaryMin>=14 && sizes.detailMin>=13 && sizes.roll>=21,
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
    if(surface==='choice' || surface==='doors' || surface==='buoys') {
      const gaps=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('minigame-modal');
        const stage=root.getByName('vf07-minigame-stage');
        const prompt=stage.getByName('vf07-minigame-choice-prompt');
        const hint=stage.getByName('vf07-minigame-choice-hint');
        const privacy=stage.getByName('vf07-minigame-choice-privacy-rail');
        const boxes=stage.list.filter(o=>o.name?.startsWith('vf07-minigame-choice-box-'));
        const boundsOf=o=>{
          if(typeof o?.getBounds==='function') return o.getBounds();
          if(typeof o?.getLocalBounds==='function'){
            const local=o.getLocalBounds();
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x+local.x,right:x+local.x+local.width,top:y+local.y,bottom:y+local.y+local.height};
          }
          const width=Number(o?.getData?.('ch141Width')??0)*Math.abs(Number(o?.scaleX??1));
          const height=Number(o?.getData?.('ch141Height')??0)*Math.abs(Number(o?.scaleY??1));
          if(width>0&&height>0){
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x-width/2,right:x+width/2,top:y-height/2,bottom:y+height/2};
          }
          return null;
        };
        const promptBounds=boundsOf(prompt);
        const hintBounds=boundsOf(hint);
        const privacyBounds=boundsOf(privacy);
        const cardBounds=boxes.map(boundsOf);
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
    if(surface==='choice' || surface==='doors' || surface==='buoys') {
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
        const boundsOf=o=>{
          if(typeof o?.getBounds==='function') return o.getBounds();
          if(typeof o?.getLocalBounds==='function'){
            const local=o.getLocalBounds();
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x+local.x,right:x+local.x+local.width,top:y+local.y,bottom:y+local.y+local.height};
          }
          const width=Number(o?.getData?.('ch141Width')??0)*Math.abs(Number(o?.scaleX??1));
          const height=Number(o?.getData?.('ch141Height')??0)*Math.abs(Number(o?.scaleY??1));
          if(width>0&&height>0){
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x-width/2,right:x+width/2,top:y-height/2,bottom:y+height/2};
          }
          return null;
        };
        const promptB=boundsOf(prompt);
        const hintB=boundsOf(hint);
        const privacyB=boundsOf(privacy);
        const boxBounds=boxes.map(boundsOf);
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
    if(surface==='doors') {
      // Retained surface key for M17; canonical M17 is CH-16 KÈO ALL-IN.
      const allIn=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('minigame-modal');
        const stage=root?.getByName('vf07-minigame-stage');
        const boxes=[0,1]
          .map(i=>stage?.getByName(`vf07-minigame-choice-box-${i}`))
          .filter(Boolean);
        const labels=[0,1]
          .map(i=>stage?.getByName(`vf07-minigame-choice-label-${i}`))
          .filter(Boolean);
        const panel=root?.getByName('vf07-minigame-shell-ch141');
        const boundsOf=o=>{
          if(typeof o?.getBounds==='function') return o.getBounds();
          if(typeof o?.getLocalBounds==='function'){
            const local=o.getLocalBounds();
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x+local.x,right:x+local.x+local.width,top:y+local.y,bottom:y+local.y+local.height};
          }
          const width=Number(o?.getData?.('ch141Width')??0)*Math.abs(Number(o?.scaleX??1));
          const height=Number(o?.getData?.('ch141Height')??0)*Math.abs(Number(o?.scaleY??1));
          if(width>0&&height>0){
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x-width/2,right:x+width/2,top:y-height/2,bottom:y+height/2};
          }
          return null;
        };
        const panelB=boundsOf(panel);
        return {
          count:boxes.length,
          labels:labels.map(x=>x.text),
          inside:Boolean(panelB) && boxes.every(box=>{
            const b=boundsOf(box);
            return Boolean(b) && b.left>=panelB.left && b.right<=panelB.right && b.top>=panelB.top && b.bottom<=panelB.bottom;
          }),
        };
      });
      assert.equal(allIn.count,2,'KÈO ALL-IN must render CHỐT and ALL-IN');
      assert.match(String(allIn.labels[0] ?? ''),/^CHỐT 🎲[1-6]$/u);
      assert.equal(allIn.labels[1],'ALL-IN');
      assert.equal(allIn.inside,true,'KÈO ALL-IN choice cards must remain inside the Mini Game shell');
    }
    if(surface==='buoys') {
      const buoys=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('minigame-modal');
        const stage=root?.getByName('vf07-minigame-stage');
        const boxes=[0,1,2]
          .map(i=>stage?.getByName(`vf07-minigame-choice-box-${i}`))
          .filter(Boolean);
        const labels=[0,1,2]
          .map(i=>stage?.getByName(`vf07-minigame-choice-label-${i}`))
          .filter(Boolean);
        const panel=root?.getByName('vf07-minigame-shell-ch141');
        const boundsOf=o=>{
          if(typeof o?.getBounds==='function') return o.getBounds();
          if(typeof o?.getLocalBounds==='function'){
            const local=o.getLocalBounds();
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x+local.x,right:x+local.x+local.width,top:y+local.y,bottom:y+local.y+local.height};
          }
          const width=Number(o?.getData?.('ch141Width')??0)*Math.abs(Number(o?.scaleX??1));
          const height=Number(o?.getData?.('ch141Height')??0)*Math.abs(Number(o?.scaleY??1));
          if(width>0&&height>0){
            let x=0,y=0,node=o;
            while(node){ x+=Number(node.x??0); y+=Number(node.y??0); node=node.parentContainer; }
            return {left:x-width/2,right:x+width/2,top:y-height/2,bottom:y+height/2};
          }
          return null;
        };
        const panelB=boundsOf(panel);
        return {
          count:boxes.length,
          labels:labels.map(x=>x.text),
          inside:Boolean(panelB) && boxes.every(box=>{
            const b=boundsOf(box);
            return Boolean(b) && b.left>=panelB.left && b.right<=panelB.right && b.top>=panelB.top && b.bottom<=panelB.bottom;
          }),
        };
      });
      assert.equal(buoys.count,3,'PHAO ĐƠN must render exactly three choice cards');
      assert.deepEqual(buoys.labels,['PHAO 1','PHAO 2','PHAO 3']);
      assert.equal(buoys.inside,true,'PHAO ĐƠN cards must remain inside the Mini Game shell');
    }
    if(surface==='topdice') {
      const dice=await page.evaluate(()=>{
        const s=window.surfaceScene;
        const root=s.children.getByName('minigame-modal');
        const stage=root?.getByName('vf07-minigame-stage');
        const heading=stage?.getByName('vf07-round-flow-heading-ch142');
        const result=stage?.getByName('vf07-round-flow-result-copy-ch142');
        const resultBox=stage?.getByName('vf07-round-flow-result-box-ch142');
        const leftRows=[0,1,2,3]
          .map(i=>stage?.getByName(`vf07-round-flow-left-row-${i}-ch142`))
          .filter(Boolean);
        const leftText=leftRows.map(row=>String(row.text ?? ''));
        return {
          heading:String(heading?.text ?? ''),
          result:String(result?.text ?? ''),
          rollCount:leftText.filter(copy=>/🎲\s*[1-6]/.test(copy)).length,
          leftXs:leftRows.map(row=>Number(row.x)),
          resultX:Number(result?.x ?? 0),
          resultBoxType:String(resultBox?.type ?? ''),
          hasLegacyScroll:Boolean(stage?.getByName('vf07-minigame-result-scroll')),
        };
      });
      assert.ok(/CẮT TOP|HÒA Ở RANH TOP/.test(dice.heading),
        `M35 horizontal heading missing: ${JSON.stringify(dice)}`);
      assert.ok(dice.rollCount>=3,
        `M35 must visibly reveal contestant D6 rolls on the left: ${JSON.stringify(dice)}`);
      assert.ok(dice.leftXs.every(x=>x<0) && dice.resultX>0,
        `M35 must keep players left and result right: ${JSON.stringify(dice)}`);
      assert.equal(dice.resultBoxType,'Graphics');
      assert.equal(dice.hasLegacyScroll,false,
        `M35 horizontal result must not require the legacy scroll viewport: ${JSON.stringify(dice)}`);
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
