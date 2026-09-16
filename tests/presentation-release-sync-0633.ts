import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import { buildPresentationModel } from '../src/ui/presentationModel';

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const sceneSource = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0633.ts', import.meta.url), 'utf8');
const wrapperSource = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0634.ts', import.meta.url), 'utf8');
const scene069Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene069.ts', import.meta.url), 'utf8');
const replaySource = readFileSync(new URL('../src/core/replay.ts', import.meta.url), 'utf8');

assert(mainSource.includes('CareerMinigameBoardScene069 as ActiveBoardScene'));
assert(scene069Source.includes('extends CareerMinigameBoardScene0682'));
assert(!scene069Source.includes('submitIntent(')); assert(!scene069Source.includes('Math.random'));
assert(wrapperSource.includes('extends CareerMinigameBoardScene0633'));
assert(sceneSource.includes('extends CareerMinigameBoardScene0632'));
assert(sceneSource.includes('runtime.showDeltaToast = () => undefined'));
assert(sceneSource.includes("model.kind === 'dice_roll' || model.kind === 'move_step'"));
assert(sceneSource.includes('if (movementStillPresenting) return;'));
assert(sceneSource.includes('RELEASE_CORRIDOR_FROM_0633'));
assert(sceneSource.includes('RELEASE_GATE_NODE_0633'));
assert(sceneSource.includes('return Promise.resolve()'));
assert(sceneSource.includes('duration: 430'));
assert(sceneSource.includes('releaseFreshRollArmed0633'));
assert(sceneSource.includes('runtime.rollPendingTurn = undefined'));
assert(sceneSource.includes("runtime.match.turn.phase === 'PRE_ROLL_ACTION'"));
assert(sceneSource.includes('runtime.match.turn.lastRoll === null'));
assert(replaySource.includes('// Release D6 is only the escape/recovery check. It must never become movement.'));
assert(replaySource.includes('ctx.state.turn.lastRoll = null;'));
assert(replaySource.includes("transition(ctx, 'PRE_ROLL_ACTION');"));

const match = createInitialMatchState({ boardId: 'release-presentation-0633', startNodeId: 0, playerNames: ['Ron'], seed: 633 });
const releaseEvent: MatchEvent = { seq:10,type:'special_release',turnNumber:2,playerIndex:0,phase:'MOVING',revision:4,rngCalls:2,actorId:0,data:{location:'jail',result:3,success:true,title:'ĐƯỢC THẢ!',impact:'✅',description:'Thoát hành lang xong sẽ đổ một D6 di chuyển MỚI trong cùng lượt.',affectedPlayerIds:'0'} };
const model = buildPresentationModel(releaseEvent, match.players);
assert(model); assert.equal(model.kind,'tile_land'); assert.equal(model.tileType,'special_release'); assert.equal(model.roll,3); assert.match(model.description,/CHỈ dùng để thoát/); assert.match(model.description,/D6 MỚI/);
console.log('[presentation-release-sync-0633] PASS historical release/presentation synchronization retained beneath 0.1.69 wrapper');
