import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const setup=readFileSync('src/scenes/SetupScene.ts','utf8');
const css=readFileSync('src/characterSelectCh02c.css','utf8');
const scene=readFileSync('src/scenes/CareerMinigameBoardScene07044.ts','utf8');
const job=readFileSync('src/ui/JobChoicePicker.ts','utf8');
const mini=readFileSync('src/ui/MiniGameOverlay.ts','utf8');

assert.match(css,/font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif/);
assert.doesNotMatch(css,/var\(--vf-font-family, "Arial Rounded MT Bold"/);
assert.match(setup,/setupHeader,\s*\{[\s\S]*?fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'/);
assert.doesNotMatch(css,/font-weight: 950/);

assert.match(scene,/object\.text\.startsWith\('MMM CITY •'\)/);
assert.match(scene,/cinematic-impact-ch13/);
assert.match(scene,/new Phaser\.GameObjects\.Text\(this, 292, -98/);
assert.match(scene,/minHeight: bodyHeight070429/);
assert.match(scene,/body\.setY\(Math\.max\(0, Math\.round\(\(bodyViewport\.height - body\.height\) \/ 2\)\)\)/);
assert.doesNotMatch(scene,/if \(model\.rarity\)/);
assert.doesNotMatch(scene,/rarityText/);

assert.doesNotMatch(job,/job\.special/);
assert.match(job,/job-detail-salary-label-070432/);
assert.match(job,/820,\n      330,/);

assert.match(mini,/const showRulesIntro = async/);
assert.match(mini,/subtitle\.setVisible\(false\)/);
assert.match(mini,/stake\.setVisible\(false\)/);
assert.match(mini,/headerSticker\.setVisible\(false\)/);
assert.match(mini,/await showRulesIntro\(baseType, activeIds\)/);
assert.match(mini,/🎯 MỤC TIÊU/);
assert.match(mini,/💰 THƯỞNG/);
assert.doesNotMatch(mini,/Không tính thời gian chọn\./);
assert.match(mini,/rankTiedIdsByDiceLowToHigh/);
assert.match(mini,/runDiceDuel/);
assert.doesNotMatch(mini,/performance\.now\(\)|Date\.now\(\)/);
assert.match(mini,/rowsViewport\.isScrollable \? 10000 : 5200/);

console.log('[ux-simplify-ch13] PASS font + Card/News + Job + compact Mini Game intro + deterministic tie ranking');
