import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?require(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright`):await import('playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:960,height:540}});
 await page.goto('http://127.0.0.1:5173/tests/runtime/settings-space-ui.html');
 await page.waitForFunction(()=>Boolean(window.settingsSpaceCh141?.trigger));
 await page.evaluate(()=>window.settingsSpaceCh141.trigger.focus());
 await page.keyboard.press('Space');
 await page.waitForTimeout(120);
 const a=await page.evaluate(()=>({open:window.settingsSpaceCh141.root.classList.contains('is-open'),hidden:window.settingsSpaceCh141.panel.hidden,seen:window.settingsSpaceCh141.spaceSeen,active:document.activeElement?.className??''}));
 assert.equal(a.open,false); assert.equal(a.hidden,true); assert.equal(a.seen,true);
 assert.equal(String(a.active).includes('settings-trigger'),false);
 await page.evaluate(()=>window.settingsSpaceCh141.trigger.focus());
 await page.keyboard.press('Enter'); await page.waitForTimeout(80);
 const b=await page.evaluate(()=>({open:window.settingsSpaceCh141.root.classList.contains('is-open'),hidden:window.settingsSpaceCh141.panel.hidden}));
 assert.equal(b.open,true); assert.equal(b.hidden,false);
 console.log('[settings-space-ui] PASS Space remains gameplay input while Enter keeps Settings keyboard access');
}finally{await browser.close();}
