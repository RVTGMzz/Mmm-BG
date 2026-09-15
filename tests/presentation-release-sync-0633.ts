import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import { buildPresentationModel } from '../src/ui/presentationModel';

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const sceneSource = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0633.ts', import.meta.url), 'utf8');
const replaySource = readFileSync(new URL('../src/core/replay.ts', import.meta.url), 'utf8');

assert(mainSource.includes('CareerMinigameBoardScene0633 as ActiveBoardScene'));
assert(sceneSource.includes('extends CareerMinigameBoardScene0632'));

// Human report: authoritative landing effects must not visually beat movement.
assert(sceneSource.includes('runtime.showDeltaToast = () => undefined'));
assert(sceneSource.includes("model.kind === 'dice_roll' || model.kind === 'move_step'"));
assert(sceneSource.includes('if (movementStillPresenting) return;'));

// Release corridor is topology, not 3 fake normal board steps.
assert(sceneSource.includes('RELEASE_CORRIDOR_FROM_0633'));
assert(sceneSource.includes('RELEASE_GATE_NODE_0633'));
assert(sceneSource.includes('return Promise.resolve()'));
assert(sceneSource.includes('duration: 430'));

// Same-turn fresh human D6 must become clickable only after release presentation ends.
assert(sceneSource.includes('releaseFreshRollArmed0633'));
assert(sceneSource.includes('runtime.rollPendingTurn = undefined'));
assert(sceneSource.includes("runtime.match.turn.phase === 'PRE_ROLL_ACTION'"));
assert(sceneSource.includes('runtime.match.turn.lastRoll === null'));

// Core invariant remains authoritative: release D6 is discarded, then a NEW roll is required.
assert(replaySource.includes('// Release D6 is only the escape/recovery check. It must never become movement.'));
assert(replaySource.includes('ctx.state.turn.lastRoll = null;'));
assert(replaySource.includes("transition(ctx, 'PRE_ROLL_ACTION');"));

const match = createInitialMatchState({
  boardId: 'release-presentation-0633',
  startNodeId: 0,
  playerNames: ['Ron'],
  seed: 633,
});

const releaseEvent: MatchEvent = {
  seq: 10,
  type: 'special_release',
  turnNumber: 2,
  playerIndex: 0,
  phase: 'MOVING',
  revision: 4,
  rngCalls: 2,
  actorId: 0,
  data: {
    location: 'jail',
    result: 3,
    success: true,
    title: 'ĐƯỢC THẢ!',
    impact: '✅',
    description: 'Thoát hành lang xong sẽ đổ một D6 di chuyển MỚI trong cùng lượt.',
    affectedPlayerIds: '0',
  },
};

const model = buildPresentationModel(releaseEvent, match.players);
assert(model, 'successful special_release must have a visible presentation model');
assert.equal(model.kind, 'tile_land');
assert.equal(model.tileType, 'special_release');
assert.equal(model.roll, 3);
assert.match(model.description, /CHỈ dùng để thoát/);
assert.match(model.description, /D6 MỚI/);

console.log('[presentation-release-sync-0633] PASS movement-before-effect • release D6 explicit • corridor collapsed visually • fresh same-turn D6 re-enabled');
