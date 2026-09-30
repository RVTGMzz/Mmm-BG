import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright`)
  : await import('playwright');
mkdirSync('runtime-ui-evidence',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const viewport of [{width:1280,height:800,name:'1280x800'},{width:960,height:540,name:'960x540'}]){
  const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
  const errors=[]; page.on('pageerror',(e)=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/tests/runtime/match-recap-ui.html');
  await page.waitForFunction(()=>Boolean(window.matchRecapCh14?.inspect('match-recap-title-ch14')),{timeout:30000});
  await page.evaluate(()=>window.matchRecapCh14.select(2));
  await page.waitForTimeout(250);
  const state=await page.evaluate(()=>({
    title:window.matchRecapCh14.inspect('match-recap-title-ch14'),
    name:window.matchRecapCh14.inspect('match-recap-player-name-ch14'),
    stats:window.matchRecapCh14.inspect('match-recap-player-stats-ch14'),
    moments:window.matchRecapCh14.inspect('match-recap-moments-ch14'),
    close:window.matchRecapCh14.inspect('match-recap-close-ch14'),
    tabs:[0,1,2,3].map(id=>window.matchRecapCh14.inspect(`match-recap-player-tab-${id}-ch14`)),
  }));
  assert.match(state.title.text,/VÁN NÀY ĐÃ XẢY RA GÌ/u);
  assert.match(state.name.text,/P3/u);
  assert.match(state.stats.text,/Bệnh viện: 1/u);
  assert.match(state.moments.text,/BA CỬA/u);
  assert.equal(state.tabs.filter(Boolean).length,4);
  assert.ok(state.title.fontSize>=30);
  assert.ok(state.stats.fontSize>=16);
  assert.ok(state.moments.fontSize>=15);
  assert.ok(state.close?.visible);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:`runtime-ui-evidence/match-recap-${viewport.name}.png`});
  await page.close();
 }
 console.log('[match-recap-ui] PASS 4-player recap + moments at 1280x800 and 960x540');
}finally{await browser.close();}
