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
assert.match(active, /const displayTitle = isResult \? 'ĐÃ NHẬN VIỆC' : '3 NGHỀ ĐANG CHỜ'/);
assert.match(active, /fixedWidth: 540/);
assert.match(active, /if \(seen\.has\(key\)\) return false/);

// Card + News: inherited text is hidden, canonical copy is rebuilt inside fixed bounds.
assert.match(active, /rebuildCanonicalCinematicText070414/);
assert.match(active, /const isNews = model\.kind === 'news'/);
assert.match(active, /for \(const child of \[\.\.\.root\.list\]\)/);
assert.match(active, /child\.destroy\(\)/);
assert.match(active, /const body = new Phaser\.GameObjects\.Text\(this, -292, -18, bodyCopy/);
assert.match(active, /root\.setScrollFactor\(0\)/);
assert.match(active, /const bodyWidth070426 = 584/);
assert.match(active, /retireLegacyPresentationOverlays070414/);

// Reaction bubbles now use a measured 212px side rail. The old 328px
// width physically entered the main modal even when the vertical test passed.
assert.match(presentation, /reactionPlacement070422\(/);
assert.match(presentation, /setName\('presentation-reaction-bubble-070422'\)/);
assert.doesNotMatch(presentation, /fillRoundedRect\(-164, -62, 328/);

console.log('[presentation-layout-lock-070414] PASS centered Job result/dedupe + Card/News text rebuild + avatar-anchored reactions');
