import assert from 'node:assert/strict';
import { clampDiceFace, compactPlayerStatus, movementStepDurationMs } from '../src/ui/boardFeelPolicy';
import type { PlayerState } from '../src/core/types';

assert.equal(movementStepDurationMs(0), 170, 'zero-distance step should use minimum duration');
assert.equal(movementStepDurationMs(40), 174, 'short edges should remain snappy');
assert.equal(movementStepDurationMs(120), 231, 'medium edges should get visibly more travel time');
assert.equal(movementStepDurationMs(1000), 310, 'long edges must stay capped');

const player: PlayerState = {
  id: 1,
  name: 'Bích',
  nodeId: 4,
  money: 875,
  cardBlockTurns: 1,
  handCardIds: ['ACT_001', 'ACT_006'],
  cardsPlayedThisTurn: 0,
};

assert.equal(
  compactPlayerStatus(player, 1, true),
  '▶ P2 🤖 Bích  875B$  🃏2/3 🔒1',
  'current CPU status should be readable without debug node/checksum data',
);
assert.equal(
  compactPlayerStatus(player, 0, false),
  '• P2 Bích  875B$  🃏2/3 🔒1',
  'non-current human status should stay compact',
);

assert.equal(clampDiceFace(-8), 1);
assert.equal(clampDiceFace(4.9), 4);
assert.equal(clampDiceFace(99), 6);

console.log('[board-feel-020] PASS movement pacing + compact HUD + dice clamp');
