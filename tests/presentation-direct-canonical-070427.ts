import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layer = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');

assert.match(layer, /setCinematicRenderer070427/);
assert.match(layer, /const owned = this\.cinematicRenderer070427\?\.\(model\)/);
assert.match(layer, /if \(owned\)[\s\S]*this\.active = container;[\s\S]*minAutoCloseMs = Math\.max/);

const showStart = layer.indexOf('private showCinematic');
const playSfx = layer.indexOf('this.playModelSfx(model)', showStart);
const reaction = layer.indexOf('model.reactions.forEach', playSfx);
const timing = layer.indexOf('this.armTiming(model', reaction);
assert.ok(showStart >= 0 && playSfx > showStart && reaction > playSfx && timing > reaction,
  'direct renderer must still flow through shared SFX, reaction and timing lifecycle');

const installStart = scene.indexOf('private installFinalCardLayout070412');
const installEnd = scene.indexOf('Apply the new board layout', installStart);
const install = scene.slice(installStart, installEnd);
assert.match(install, /presentation\.setCinematicRenderer070427/);
assert.match(install, /model\.kind === 'news'/);
assert.match(install, /model\.kind === 'card_draw'/);
assert.match(install, /this\.add\.container\(640, 330\)/);
assert.match(install, /minAutoCloseMs: built\.scrollable \? 6000 : undefined/);
assert.doesNotMatch(install, /revealTarget:/);
assert.doesNotMatch(install, /originalShowCinematic/);

const rebuildStart = scene.indexOf('private rebuildCanonicalCinematicText070414');
const rebuildEnd = scene.indexOf('private fitWrappedText070418', rebuildStart);
const rebuild = scene.slice(rebuildStart, rebuildEnd);
assert.match(rebuild, /return \{ body, bodyCopy \};/);
assert.match(rebuild, /createScrollableTextViewport070429\(this, root/);
assert.doesNotMatch(rebuild, /this\.add\.text\(-292, -18/);

console.log('[presentation-direct-canonical-070427] PASS Card/News bypass legacy visual creation while shared lifecycle remains authoritative');
