import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';
import { PRESENTATION_LANES_070422, reactionPlacement070422 } from '../src/ui/presentationLanes070422';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// 0.1.70.4.29: Card/News keeps one readable font scale and scrolls long copy
// behind a hard viewport instead of shrinking typography.
const rebuildStart = active.indexOf('private rebuildCanonicalCinematicText070414');
const fitStart = active.indexOf('private fitWrappedText070418', rebuildStart);
const rebuild = active.slice(rebuildStart, fitStart);
assert.match(rebuild, /createScrollableTextViewport070429/);
assert.match(rebuild, /fontSize: 21/);
assert.match(rebuild, /fontSize: '28px'/);
assert.doesNotMatch(rebuild, /fitWrappedText070418\(/);
assert.match(active, /minAutoCloseMs: built\.scrollable \? 6000 : undefined/);

// The old 328px reaction at x188 entered the canonical modal by 94px.
// Check full rectangular geometry horizontally AND vertically for every seat.
const lanes = PRESENTATION_LANES_070422;
assert.match(presentation, /reactionPlacement070422\(/);
for (const seat of [0, 1, 2, 3]) {
  const reaction = reactionPlacement070422(seat, seat);
  assert.ok(reaction);
  const left = reaction.x - reaction.width / 2;
  const right = reaction.x + reaction.width / 2;
  const top = reaction.y - reaction.height / 2;
  const bottom = reaction.y + reaction.height / 2;
  assert.ok(left >= lanes.margin && right <= 1280 - lanes.margin);
  assert.ok(top >= lanes.margin && bottom <= 720 - lanes.margin);
  assert.ok(
    reaction.side === 'left'
      ? right + lanes.modalGap <= lanes.modalLeft
      : left - lanes.modalGap >= lanes.modalRight,
    'reaction must remain clear of widest canonical card',
  );
  assert.ok(
    seat <= 1
      ? top >= lanes.hudTopBottom + lanes.margin
      : bottom <= lanes.hudBottomTop - lanes.margin,
    'reaction must remain clear of active HUD',
  );
}

// This pass remains presentation-only.
assert.doesNotMatch(active, /submitIntent\(/);
assert.doesNotMatch(active, /Math\.random\(/);

console.log('[presentation-adaptive-safearea-070418] PASS adaptive Card\/News fitting + HUD-safe reaction lanes');
