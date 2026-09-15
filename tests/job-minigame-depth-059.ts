import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import boardJson from '../src/content/city/board_city_mvp.json';
import jobsJson from '../src/content/core/jobs_mvp.json';
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
} from '../src/core/authority';
import {
  applyJobSelection,
  jobDepthProfile059,
  resolveCareerCheck,
  type JobDefinition,
} from '../src/core/jobs';
import {
  isMiniGameRewardType,
  miniGameRewardForRank,
  miniGameRewardType059,
} from '../src/core/minigameRewards';
import {
  MINI_GAME_SLOTS_059,
  miniGameRewardForSlot059,
  miniGameRewardTable059,
} from '../src/core/miniGameSlots059';
import { createInitialMatchState } from '../src/core/matchState';
import { ECONOMY_060 } from '../src/core/pacingEconomy060';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const JOBS = jobsJson as JobDefinition[];

assert.equal(MINI_GAME_SLOTS_059.length, 5, '0.1.59 must define exactly five canonical Mini Game arenas.');
assert.equal(new Set(MINI_GAME_SLOTS_059.map((slot) => slot.contentId)).size, 5);
assert.deepEqual(MINI_GAME_SLOTS_059.map((slot) => slot.boardLabel), ['M09', 'M17', 'M26', 'M35', 'M44']);
assert.deepEqual(MINI_GAME_SLOTS_059.map((slot) => slot.nodeId), [8, 16, 25, 34, 43]);

const canonicalMiniNodes = BOARD.nodes.filter((node) => node.feature === 'minigame' && node.id < 44);
assert.equal(canonicalMiniNodes.length, 5);
for (const slot of MINI_GAME_SLOTS_059) {
  const node = BOARD.nodes.find((entry) => entry.id === slot.nodeId);
  assert(node, `${slot.boardLabel} node is missing.`);
  assert.equal(node.feature, 'minigame');
  assert.equal(node.contentId, slot.contentId);
  assert.equal(
    miniGameRewardTable059(slot.contentId, 'majority_minority').reduce((sum, amount) => sum + amount, 0),
    ECONOMY_060.miniGameMajorityTotal,
  );
  assert.equal(
    miniGameRewardTable059(slot.contentId, 'rps').slice(0, 2).reduce((sum, amount) => sum + amount, 0),
    ECONOMY_060.miniGameRpsTotal,
  );
}
assert.equal(
  new Set(MINI_GAME_SLOTS_059.map((slot) => slot.majorityRewards.join(','))).size,
  5,
  'Each canonical Mini Game space must keep a distinct majority/minority stake profile.',
);

const allInType = miniGameRewardType059('majority_minority', 'MINIGAME_SLOT_02');
assert.equal(allInType, 'majority_minority@MINIGAME_SLOT_02');
assert.equal(isMiniGameRewardType(allInType), true);
assert.equal(isMiniGameRewardType('majority_minority@MINIGAME_SLOT_99'), false);
assert.equal(miniGameRewardForRank(allInType, 1), 35);
assert.equal(miniGameRewardForRank(allInType, 2), 10);
assert.equal(miniGameRewardForSlot059('MINIGAME_SLOT_04', 'majority_minority', 3), 0);
assert.equal(miniGameRewardForRank('majority_minority', 1), 30, 'Legacy/default reward type stays backwards-compatible for old fixtures.');

const doctor = JOBS.find((job) => job.id === 'JOB_DOCTOR')!;
const idol = JOBS.find((job) => job.id === 'JOB_IDOL')!;
const thief = JOBS.find((job) => job.id === 'JOB_THIEF')!;
assert.equal(jobDepthProfile059(doctor).riskLabel, 'ỔN ĐỊNH');
assert.equal(jobDepthProfile059(idol).riskLabel, 'BIẾN ĐỘNG');
assert.equal(jobDepthProfile059(thief).riskLabel, 'PHI PHÁP');
assert.equal(jobDepthProfile059(thief).jailPercent, 12);

const arrestState = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['Career Risk'],
  seed: 5901,
});
const criminal = arrestState.players[0]!;
criminal.nodeId = 7;
applyJobSelection(criminal, thief);
const arrest = resolveCareerCheck(criminal, thief, () => 0.01);
assert.equal(arrest.outcome, 'jailed');
assert.equal(criminal.specialHold, 'jail', 'Criminal Job arrest must use the same authoritative Jail hold as 0.1.57.');
assert.equal(criminal.nodeId, 100, 'Criminal Job arrest must relocate state to the canonical Jail hold node.');
assert.equal(criminal.jobStatus, 'unemployed', 'Getting arrested must cost the illegal Job.');
assert.equal(criminal.jobId, undefined);
assert.equal(criminal.jobLevel, undefined);

const slot2Board: BoardDefinition = {
  id: 'minigame-slot2-059',
  name: '0.1.59 slot 2 authority fixture',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'normal' },
    { id: 1, x: 10, y: 0, type: 'normal', feature: 'minigame', contentId: 'MINIGAME_SLOT_02' },
  ],
  edges: [{ from: 0, to: 1, route: 'main' }],
};
const authority = createEmptyHostAuthority(
  { boardId: slot2Board.id, startNodeId: 0, playerNames: ['P1', 'P2', 'P3', 'P4'], seed: 5902 },
  { board: slot2Board, cards: [], news: [] },
);
const rollReceipt = submitClientIntent(authority, {
  intentId: '059-mini-roll',
  clientId: '059-test',
  actorId: 0,
  type: 'roll',
  observedCommandSeq: hostAuthorityCommandSeq(authority),
  data: {},
});
assert.equal(rollReceipt.status, 'accepted');
const sourceEvent = authority.state.eventLog.find((event) => event.type === 'minigame_tile');
assert(sourceEvent);
const payoutReceipt = submitClientIntent(authority, {
  intentId: '059-mini-payout',
  clientId: 'host-system',
  actorId: authority.state.players[authority.state.turn.currentPlayerIndex]!.id,
  type: 'resolve_minigame',
  observedCommandSeq: hostAuthorityCommandSeq(authority),
  data: {
    sourceEventSeq: sourceEvent.seq,
    gameType: allInType,
    rankingPlayerIds: '0,1,2,3',
  },
});
assert.equal(payoutReceipt.status, 'accepted');
assert.deepEqual(
  authority.state.players.map((player) => player.money),
  [235, 210, 205, 200],
  'Slot 2 host-owned payout must use the tuned winner-heavy 35/10/5/0 profile.',
);

const scene059 = await readFile('src/scenes/CareerMinigameBoardScene059.ts', 'utf8');
const scene060 = await readFile('src/scenes/CareerMinigameBoardScene060.ts', 'utf8');
const scene061 = await readFile('src/scenes/CareerMinigameBoardScene061.ts', 'utf8');
const main = await readFile('src/main.ts', 'utf8');
const canonical = await readFile('src/ui/canonicalPresentation0561.ts', 'utf8');
assert(scene059.includes('extends CareerMinigameBoardScene058'));
assert(scene059.includes('startMiniGameOverlay'));
assert(scene059.includes('installJobArrestReconciliation'));
assert(!scene059.includes('Math.random'), '0.1.59 presentation wrapper must not add client RNG.');
assert(!scene059.includes('submitIntent('), '0.1.59 scene must not become a second gameplay authority.');
assert(scene060.includes('extends CareerMinigameBoardScene059'));
assert(scene061.includes('extends CareerMinigameBoardScene060'));
assert(main.includes('CareerMinigameBoardScene061 as ActiveBoardScene'));
assert(canonical.includes("version: '0.1.61'"));

console.log('[job-minigame-depth-059] PASS 0.1.59 Job/arena identity retained under 0.1.60 tuned payouts and 0.1.61 telemetry wrapper');
