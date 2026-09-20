import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// Job: one large icon, body is a separate centered column, repeated lines are deduped.
assert.match(active, /canonicalJobBody070414/);
assert.match(active, /if \(impact && copy\.includes\(impact\)\) copy = copy\.replace\(impact, ''\)\.trim\(\)/);
assert.match(active, /canonicalJobBody070414/);
assert.match(active, /fixedWidth: isResult \? 260 : 570/);
assert.match(active, /if \(seen\.has\(key\)\) return false/);

// Card + News: inherited text is hidden, canonical copy is rebuilt inside fixed bounds.
assert.match(active, /rebuildCanonicalCinematicText070414/);
assert.match(active, /const isNews = model\.kind === 'news'/);
assert.match(active, /for \(const child of \[\.\.\.root\.list\]\)/);
assert.match(active, /child\.destroy\(\)/);
assert.match(active, /const body = this\.add\.text\(-322, -24, bodyCopy/);
assert.match(active, /fixedWidth: 628/);
assert.match(active, /retireLegacyPresentationOverlays070414/);

// Reaction bubbles: deterministic avatar-corner anchors.
assert.match(presentation, /const anchorId = speakerId === undefined \? fallbackId/);
assert.match(presentation, /const x = left \? 188 : 1092/);
assert.match(presentation, /const REACTION_TOP_Y_070418 = 190/);
assert.match(presentation, /const REACTION_BOTTOM_Y_070418 = 530/);
assert.match(presentation, /const y = top \? REACTION_TOP_Y_070418 : REACTION_BOTTOM_Y_070418/);
assert.doesNotMatch(presentation, /const y = 195 \+ \(index % 3\) \* 112/);

console.log('[presentation-layout-lock-070414] PASS Job column/dedupe + Card/News text rebuild + avatar-anchored reactions');
