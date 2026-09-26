import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CARD_SHEET_VF051,
  cardSheetBoundsVf051,
  cardSheetFitsVf051,
} from '../src/ui/visualFoundationCardVf051';
import { PRESENTATION_LANES_070422, reactionPlacement070422 } from '../src/ui/presentationLanes070422';

assert.equal(CARD_SHEET_VF051.width, 720);
assert.equal(CARD_SHEET_VF051.height, 300);
assert.ok(cardSheetFitsVf051());

const bounds = cardSheetBoundsVf051();
assert.deepEqual(bounds, { left: 280, right: 1000, top: 180, bottom: 480 });
assert.ok(bounds.left >= PRESENTATION_LANES_070422.modalLeft);
assert.ok(bounds.right <= PRESENTATION_LANES_070422.modalRight);

for (let playerId = 0; playerId < 4; playerId += 1) {
  const bubble = reactionPlacement070422(playerId, 0);
  assert.ok(bubble, `P${playerId + 1} reaction must be supported`);
  const left = bubble.x - bubble.width / 2;
  const right = bubble.x + bubble.width / 2;
  assert.ok(
    right + PRESENTATION_LANES_070422.modalGap <= bounds.left
      || left - PRESENTATION_LANES_070422.modalGap >= bounds.right,
    `P${playerId + 1} reaction must clear the Card sheet`,
  );
}

const painter = readFileSync('src/ui/visualFoundationCardVf051.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');

assert.match(painter, /paintVisualFoundationCardVf051/);
assert.match(painter, /c\.lavender/);
assert.match(painter, /c\.cream/);
assert.match(painter, /c\.cocoa/);
assert.match(painter, /c\.coral/);
assert.match(painter, /c\.aqua/);

assert.match(scene, /paintVisualFoundationCardVf051\(shadow, panel\)/);
assert.match(scene, /paintVisualFoundationNewsVf05\(shadow, panel\)/);
assert.match(scene, /root\.setScrollFactor\(0\)/);
assert.match(scene, /new Phaser\.GameObjects\.Text\(this, -292, -18, bodyCopy/);
assert.match(scene, /body\.setMaxLines\(5\)/);
assert.match(scene, /title\.setMaxLines\(2\)/);
assert.match(scene, /else this\.fitWrappedText070418\(body, bodyWidth070426, bodyHeight070418, 24, 17, 5\)/);
assert.doesNotMatch(painter, /Math\.random|submitIntent\s*\(|MatchState|browserSession/);

console.log('[visual-foundation-card-vf051] PASS warm kinetic Card skin + canonical owner + safe reaction lanes + bounded copy');
