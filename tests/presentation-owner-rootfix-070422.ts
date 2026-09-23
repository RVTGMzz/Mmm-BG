import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRESENTATION_LANES_070422, reactionPlacement070422 } from '../src/ui/presentationLanes070422';

const layout = PRESENTATION_LANES_070422;
const source = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const parity = readFileSync('src/scenes/PresentationParityBoardScene.ts', 'utf8');
const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');

// This is the assertion older gates MISSED: the old 328px reaction bubble at
// x=188 physically crossed a card whose left edge was x=258, regardless of
// whether the vertical bounds happened to clear the corner HUD.
const oldRight = 188 + 328 / 2;
assert.ok(oldRight > layout.modalLeft, 'historical overlapping bubble must be caught');

// All 4 seats, all 12 fallback reaction indices and both viewport edges must
// fit the *whole* panel outside the widest canonical modal and active HUDs.
for (const speakerId of [0, 1, 2, 3] as const) {
  for (let index = 0; index < 12; index++) {
    const lane = reactionPlacement070422(speakerId, index);
    assert.ok(lane, `P${speakerId + 1} reaction ${index} needs a safe lane`);
    const left = lane.x - lane.width / 2;
    const right = lane.x + lane.width / 2;
    const top = lane.y - lane.height / 2;
    const bottom = lane.y + lane.height / 2;
    assert.ok(left >= layout.margin && right <= layout.viewportWidth - layout.margin);
    assert.ok(top >= layout.margin && bottom <= layout.viewportHeight - layout.margin);
    if (lane.side === 'left') {
      assert.ok(right + layout.modalGap <= layout.modalLeft, 'left bubble may not enter modal text');
    } else {
      assert.ok(left - layout.modalGap >= layout.modalRight, 'right bubble may not enter modal text');
    }
    if (speakerId < 2) assert.ok(top >= layout.hudTopBottom + layout.margin);
    else assert.ok(bottom <= layout.hudBottomTop - layout.margin);
  }
}

// Fallback speakers still have safe alternating rails.
for (let i = 0; i < 12; i++) {
  assert.ok(reactionPlacement070422(undefined, i), `fallback ${i} unsafe`);
}
// When a viewport cannot fit the canonical rails, skip the bubble rather
// than moving it onto the modal or letting it clip.
assert.equal(reactionPlacement070422(0, 0, 100, 720), null);
assert.equal(reactionPlacement070422(1, 1, 1000, 720), null);
assert.equal(reactionPlacement070422(2, 2, 1280, 450), null);

// Kill the duplicate UI pipeline at the source. The inherited event/delta
// telemetry stays in the log but can never spawn a second on-screen toast.
assert.match(parity, /legacyToast\.showEventToast = \(\) => undefined/);
assert.match(parity, /legacyToast\.showDeltaToast = \(\) => undefined/);
const createStart = parity.indexOf('  create(): void {');
const superCreate = parity.indexOf('    super.create();', createStart);
const disableEventToast = parity.indexOf('legacyToast.showEventToast = () => undefined;', createStart);
const disableDeltaToast = parity.indexOf('legacyToast.showDeltaToast = () => undefined;', createStart);
assert.ok(createStart >= 0 && superCreate > createStart, 'create() / super.create() must exist');
assert.ok(disableEventToast > createStart && disableEventToast < superCreate, 'event toast must be disabled before super.create()');
assert.ok(disableDeltaToast > createStart && disableDeltaToast < superCreate, 'delta toast must be disabled before super.create()');

// Late callbacks MUST retain the originating model, never reuse a reaction
// from a skipped Card on the next News. The previous implementation checked
// only that *some* current model existed and allowed that race.
assert.match(source, /if \(this\.destroyed \|\| this\.currentModel !== model \|\| !this\.active\?\.active\) return/);
assert.match(source, /this\.showReaction\(model, line, index\)/);
assert.match(source, /this\.currentModel !== model/);
assert.match(source, /setName\('presentation-reaction-bubble-070422'\)/);
assert.match(source, /reactionPlacement070422\(/);

// No Text/emoji/depth heuristic is allowed to give arbitrary legacy overlays
// passage over a real modal. Only the actual continue hint and registered
// side-rail reaction containers are permitted.
const finalWhitelist = active.slice(
  active.indexOf('private isAllowedFinalModalAuxiliary070421'),
  active.indexOf('private findNamedTopLevelContainer070421'),
);
assert.match(finalWhitelist, /text === this\.runtime07044\(\)\.presentation\?\.continueHint/);
assert.match(finalWhitelist, /root\.name !== 'presentation-reaction-bubble-070422'/);
assert.match(finalWhitelist, /reactionPlacement070422\(seat, seat\)/);
assert.doesNotMatch(finalWhitelist, /copy\.startsWith|reactionMarker|\[😐😄😤\]/);
assert.match(active, /Phaser\.Scenes\.Events\.POST_UPDATE/);
assert.match(active, /this\.retireLegacyPresentationOverlays070414\(\)/);

for (const text of [parity, source, active]) {
  assert.doesNotMatch(text, /Math\.random\s*\(/);
}
console.log('[presentation-owner-070422] PASS duplicate producer off, event-owned reactions, all seat rails + last-frame ownership');
