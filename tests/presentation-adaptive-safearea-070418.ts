import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';
import { PRESENTATION_LANES_070422, reactionPlacement070422 } from '../src/ui/presentationLanes070422';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// Every Card/News title and body goes through the same adaptive fitter.
// Runtime readability floor stays >=16px for Card copy; News uses an even larger 26/18 range.
assert.match(active, /fitWrappedText070418\(title, 540, 54, 30, 24, 2\)/);
assert.match(active, /fitWrappedText070418\(body, bodyWidth070426, bodyHeight070418, 24, 17, 5\)/);
assert.match(active, /while \(fontSize > minFontSize && text\.height > height\)/);
assert.match(active, /text\.setFixedSize\(width, height\)/);

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
