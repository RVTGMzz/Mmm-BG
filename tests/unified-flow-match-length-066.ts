import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { computeMatchChecksum } from '../src/core/checksum';
import { pendingCpuFreshRollAfterRelease066, pendingFreshRollAfterRelease066 } from '../src/core/cpuReleaseResume066';
import { createInitialMatchState, configureInitialTargetLaps } from '../src/core/matchState';
import { pendingFreshMovementRollAfterRelease0701 } from '../src/core/releaseFlow0701';
import { isPlayerFinished060 } from '../src/core/pacingEconomy060';
import { gameSession } from '../src/core/session';

const names=['P1','P2','P3','P4'];
configureInitialTargetLaps(1);
const legacy=createInitialMatchState({boardId:'test',startNodeId:1,playerNames:names,seed:66});
const explicitOne=createInitialMatchState({boardId:'test',startNodeId:1,playerNames:names,seed:66,targetLaps:1});
const two=createInitialMatchState({boardId:'test',startNodeId:1,playerNames:names,seed:66,targetLaps:2});
const three=createInitialMatchState({boardId:'test',startNodeId:1,playerNames:names,seed:66,targetLaps:3});
assert.equal(computeMatchChecksum(legacy),computeMatchChecksum(explicitOne)); assert.equal(legacy.players.some((player)=>Object.hasOwn(player,'targetLaps')),false); assert(two.players.every((player)=>player.targetLaps===2)); assert(three.players.every((player)=>player.targetLaps===3)); assert.notEqual(computeMatchChecksum(two),computeMatchChecksum(legacy)); assert.notEqual(computeMatchChecksum(three),computeMatchChecksum(two));
assert.equal(isPlayerFinished060({lapsCompleted:1}),true); assert.equal(isPlayerFinished060({lapsCompleted:1,targetLaps:2}),false); assert.equal(isPlayerFinished060({lapsCompleted:2,targetLaps:2}),true); assert.equal(isPlayerFinished060({lapsCompleted:2,targetLaps:3}),false); assert.equal(isPlayerFinished060({lapsCompleted:3,targetLaps:3}),true);
gameSession.reset(); assert.equal(gameSession.targetLaps,1); gameSession.setTargetLaps(2); assert.equal(gameSession.targetLaps,2); gameSession.setTargetLaps(3); assert.equal(gameSession.targetLaps,3);

const releaseResume=createInitialMatchState({boardId:'release-test',startNodeId:1,playerNames:names,seed:66066});
releaseResume.turn.currentPlayerIndex=3; releaseResume.turn.turnNumber=4; releaseResume.turn.phase='PRE_ROLL_ACTION'; releaseResume.turn.revision=9; releaseResume.turn.lastRoll=null; releaseResume.players[3]!.specialHold=undefined;
releaseResume.eventLog.push({seq:1,type:'special_release',turnNumber:4,playerIndex:3,phase:'MOVING',revision:8,rngCalls:4,actorId:3,data:{location:'jail',result:3,success:true,affectedPlayerIds:'3'}});
// A later bookkeeping/presentation-adjacent event must not erase the successful
// release signal. The 0.1.70.1 detector is authority-only; presentation decides
// visibility separately so the release signal cannot be missed during modal close.
releaseResume.eventLog.push({seq:2,type:'release_followup',turnNumber:4,playerIndex:3,phase:'PRE_ROLL_ACTION',revision:9,rngCalls:4,actorId:3,data:{note:'presentation-ready'}}); releaseResume.nextEventSeq=3;
assert.equal(pendingFreshMovementRollAfterRelease0701(releaseResume),1,'authoritative release state must owe one fresh movement D6');
assert.equal(pendingFreshRollAfterRelease066(releaseResume,false,0),1,'historical human/CPU wrapper delegates to the authoritative detector');
assert.equal(pendingFreshRollAfterRelease066(releaseResume,true,0),undefined,'historical wrapper may still delay controls while presentation blocks');
assert.equal(pendingFreshRollAfterRelease066(releaseResume,false,1),undefined,'handled release event must not retrigger historical wrapper');
assert.equal(pendingCpuFreshRollAfterRelease066(releaseResume,[1,2,3],false,0),1); assert.equal(pendingCpuFreshRollAfterRelease066(releaseResume,[1,2,3],true,0),undefined); assert.equal(pendingCpuFreshRollAfterRelease066(releaseResume,[1,2,3],false,1),undefined); assert.equal(pendingCpuFreshRollAfterRelease066(releaseResume,[1,2],false,0),undefined); releaseResume.players[3]!.specialHold='jail'; assert.equal(pendingFreshMovementRollAfterRelease0701(releaseResume),undefined); assert.equal(pendingFreshRollAfterRelease066(releaseResume,false,0),undefined); assert.equal(pendingCpuFreshRollAfterRelease066(releaseResume,[1,2,3],false,0),undefined); delete releaseResume.players[3]!.specialHold;
releaseResume.turn.turnNumber=5; assert.equal(pendingFreshMovementRollAfterRelease0701(releaseResume),undefined,'a release from an older turn must never wake a new turn'); releaseResume.turn.turnNumber=4;
assert.equal(existsSync('public/START_PLAYTEST.bat'),true); assert.equal(existsSync('public/START_DRAFT_D_PREVIEW.bat'),false); assert.equal(existsSync('public/START_DRAFT_D_FULL_MAP.bat'),false);

const setup=readFileSync('src/scenes/SetupScene.ts','utf8');
const scene066=readFileSync('src/scenes/CareerMinigameBoardScene066.ts','utf8');
const scene069=readFileSync('src/scenes/CareerMinigameBoardScene069.ts','utf8');
const scene0701=readFileSync('src/scenes/CareerMinigameBoardScene0701.ts','utf8');
const directDice=readFileSync('src/scenes/DirectDiceBoardScene.ts','utf8');
const releaseFlow=readFileSync('src/core/releaseFlow0701.ts','utf8');
const main=readFileSync('src/main.ts','utf8');
const settings=readFileSync('src/ui/SettingsPanel.ts','utf8');
const mobileCss=readFileSync('src/mobileViewport066.css','utf8');
const html=readFileSync('index.html','utf8');
const quickstart=readFileSync('public/PLAYTEST.txt','utf8');
assert.match(setup,/\[1,\s*2,\s*3\]\.map\(\(laps\)/); assert(setup.includes('data-laps="${laps}"')); assert(setup.includes('${laps} VÒNG / NGƯỜI')); assert.match(setup,/configureInitialTargetLaps\(gameSession\.targetLaps\)/);
assert.match(scene066,/extends CareerMinigameBoardScene0651/); assert.match(scene066,/replaceAll\('💼🎲', '💼'\)/); assert.match(scene066,/HÒA, RA LẠI/); assert.match(scene066,/setOrigin\(0\.5, 0\)/); assert.match(scene066,/setLineSpacing\(10\)/); assert.match(scene066,/pendingCpuFreshRollAfterRelease066/); assert.match(scene066,/internals\.submitIntent\('roll', \{\}\)/); assert.match(scene066,/now - this\.cpuReleaseAttemptAt066 < 900/);
assert.match(directDice,/pendingFreshMovementRollAfterRelease0701/); assert.match(directDice,/this\.rollPendingTurn = undefined/); assert.match(directDice,/presentationBlocking/); assert(!directDice.includes('handledFreshReleaseEventSeq'));
assert.match(releaseFlow,/event\.actorId === actor\.id/); assert.match(releaseFlow,/match\.turn\.lastRoll !== null/); assert.match(releaseFlow,/actor\.specialHold !== undefined/);
assert.match(main,/CareerMinigameBoardScene0701 as ActiveBoardScene/); assert.match(scene0701,/extends CareerMinigameBoardScene069/); assert(!scene0701.includes('Math.random')); assert.match(scene069,/extends CareerMinigameBoardScene0682/); assert(!scene069.includes('Math.random')); assert(!scene069.includes('submitIntent('));
assert.match(main,/mobileViewport066\.css/); assert.match(main,/visualViewport\?\.addEventListener\('resize'/); assert.match(main,/game\.scale\.refresh\(\)/); assert.match(html,/viewport-fit=cover/); assert.match(html,/user-scalable=no/); assert.match(mobileCss,/100dvh/); assert.match(mobileCss,/100dvw/); assert.match(settings,/requestFullscreen/); assert.match(settings,/TOÀN MÀN HÌNH/); assert.match(quickstart,/Chỉ dùng START_PLAYTEST\.bat/); assert.match(quickstart,/1 \/ 2 \/ 3 vòng/);
configureInitialTargetLaps(1);
console.log('[unified-flow-match-length-066] PASS 1/2/3 laps + mobile/fullscreen + authoritative release detector + retry-safe CPU fresh D6 under 0.1.70.1');