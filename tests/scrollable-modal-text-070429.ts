import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const helper = readFileSync('src/ui/scrollableTextViewport070429.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const mini = readFileSync('src/ui/MiniGameOverlay.ts', 'utf8');
const legacy066 = readFileSync('src/scenes/CareerMinigameBoardScene066.ts', 'utf8');
const legacy0701 = readFileSync('src/scenes/CareerMinigameBoardScene0701.ts', 'utf8');
const layer = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');

assert.doesNotMatch(helper, /worldX|worldY|createGeometryMask\(\)/);
assert.match(helper, /text\.setCrop\(0, scroll, options.width, height\)/);
assert.match(helper, /text\.setY\(-scroll\)/);
assert.match(helper, /scene\.input\.on\('wheel'/);
assert.match(helper, /event\.stopPropagation\(\)/);
assert.doesNotMatch(helper, /setScale\(/);

const rebuildStart = scene.indexOf('private rebuildCanonicalCinematicText070414');
const fitStart = scene.indexOf('private fitWrappedText070418', rebuildStart);
const rebuild = scene.slice(rebuildStart, fitStart);
assert.match(rebuild, /fontSize: 21/);
assert.match(rebuild, /fontSize: '28px'/);
assert.match(rebuild, /createScrollableTextViewport070429/);
assert.doesNotMatch(rebuild, /fitWrappedText070418\(/);
assert.doesNotMatch(rebuild, /setFontSize\(fontSize\)/);

const jobStart = scene.indexOf('private showCanonicalJobLanding070411');
const ownerStart = scene.indexOf('private syncFinalModalOwnership070421', jobStart);
const job = scene.slice(jobStart, ownerStart);
assert.match(job, /jobBodyViewport070429/);
assert.match(job, /createScrollableTextViewport070429/);
assert.match(job, /5000/);

assert.match(mini, /vf07-minigame-result-scroll/);
assert.match(mini, /vf07-minigame-ranking-scroll/);
assert.match(mini, /fontSize: 23/);
assert.doesNotMatch(mini, /denseResult \?/);
assert.match(legacy066, /text\.name\.startsWith\('vf07-minigame-'\)/);
assert.match(legacy0701, /heading\.name\.startsWith\('vf07-minigame-'\)/);

assert.match(layer, /minAutoCloseMs\?: number/);
assert.match(layer, /Math\.max\(model\.holdMs, revealMs \+ 600, minAutoCloseMs\)/);

console.log('[scrollable-modal-text-070429] PASS fixed readable type + hard clip + drag/wheel scroll + legacy Mini Game reflow lock');
