import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeMatchChecksum } from '../src/core/checksum';
import { appendMatchEvent, createInitialMatchState, type MatchCommand } from '../src/core/matchState';
import { buildPlaytestMatchReport061, formatPlaytestMatchReport061 } from '../src/core/playtestTelemetry061';
import { CANONICAL_PRESENTATION_0561 } from '../src/ui/canonicalPresentation0561';

const match = createInitialMatchState({
  boardId: 'telemetry-061-fixture',
  startNodeId: 0,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 6101,
});
match.players[0]!.money = 260;
match.players[1]!.money = 220;
match.players[2]!.money = 180;
match.players[3]!.money = 240;
match.players.forEach((player) => { player.lapsCompleted = 1; });
match.rng.calls = 17;

const commands: MatchCommand[] = [
  { seq: 1, type: 'roll', turnNumber: 1, playerIndex: 0, actorId: 0, data: {} },
  { seq: 2, type: 'play_card', turnNumber: 1, playerIndex: 0, actorId: 0, data: { cardId: 'ACT_001' } },
  { seq: 3, type: 'roll', turnNumber: 2, playerIndex: 1, actorId: 1, data: {} },
  { seq: 4, type: 'roll', turnNumber: 3, playerIndex: 2, actorId: 2, data: {} },
  { seq: 5, type: 'resolve_minigame', turnNumber: 4, playerIndex: 3, actorId: 3, data: {} },
  { seq: 6, type: 'choose_job', turnNumber: 5, playerIndex: 0, actorId: 0, data: {} },
];
match.commandLog = commands;
match.nextCommandSeq = 7;

match.turn.turnNumber = 1;
appendMatchEvent(match, 'dice_roll', { result: 4, affectedPlayerIds: '0' }, 0);
appendMatchEvent(match, 'card_play', { cardId: 'ACT_001', amount: 10, affectedPlayerIds: '0,1' }, 0);

match.turn.turnNumber = 2;
appendMatchEvent(match, 'dice_roll', { result: 1, rollKind: 'jail_release', affectedPlayerIds: '1' }, 1);
appendMatchEvent(match, 'special_release', { location: 'jail', result: 1, success: true, affectedPlayerIds: '1' }, 1);

match.turn.turnNumber = 3;
appendMatchEvent(match, 'dice_roll', { result: 3, rollKind: 'lottery', affectedPlayerIds: '2' }, 2);
appendMatchEvent(match, 'lottery', { roll: 3, amount: 60, affectedPlayerIds: '2' }, 2);
appendMatchEvent(match, 'news', { newsId: 'NEWS_DEMO_001', amount: 25, affectedPlayerIds: '2' }, 2);

match.turn.turnNumber = 4;
appendMatchEvent(match, 'minigame_tile', { contentId: 'MINIGAME_SLOT_01', affectedPlayerIds: '0,1,2,3' }, 3);
[25, 15, 10, 0].forEach((amount, index) => {
  appendMatchEvent(match, 'minigame_reward', { amount, rank: index + 1, affectedPlayerIds: String(index) }, index);
});

match.turn.turnNumber = 5;
appendMatchEvent(match, 'job_offer', { affectedPlayerIds: '0' }, 0);
appendMatchEvent(match, 'job_selected', { jobId: 'JOB_DOCTOR', affectedPlayerIds: '0' }, 0);
appendMatchEvent(match, 'job_progress', { jobId: 'JOB_DOCTOR', outcome: 'promoted', affectedPlayerIds: '0' }, 0);

match.turn.turnNumber = 6;
for (const actorId of [2, 0, 3, 1]) {
  appendMatchEvent(match, 'ready_pass', { finishLocked: true, lapsCompleted: 1, affectedPlayerIds: String(actorId) }, actorId);
}

const checksumBefore = computeMatchChecksum(match);
const report = buildPlaytestMatchReport061(match);
const checksumAfter = computeMatchChecksum(match);
assert.equal(checksumAfter, checksumBefore, 'building telemetry must not mutate authoritative state');
assert.deepEqual(buildPlaytestMatchReport061(match), report, 'same state must produce identical report');

assert.equal(report.version, '0.1.61');
assert.equal(report.seed, 6101);
assert.equal(report.checksum, checksumBefore);
assert.equal(report.playerCount, 4);
assert.equal(report.startingMoney, 200);
assert.equal(report.turnsObserved, 6);
assert.equal(report.commandCount, 6);
assert.equal(report.rngCalls, 17);
assert.equal(report.movementRolls, 1);
assert.equal(report.releaseRolls, 1);
assert.equal(report.lotteryRolls, 1);
assert.equal(report.cardsPlayed, 1);
assert.equal(report.newsTriggered, 1);
assert.equal(report.miniGamesTriggered, 1);
assert.equal(report.miniGamesSkipped, 0);
assert.equal(report.miniGameRewardTotal, 50);
assert.equal(report.jobOffers, 1);
assert.equal(report.jobsSelected, 1);
assert.equal(report.jobProgressChecks, 1);
assert.equal(report.jailReleaseAttempts, 1);
assert.equal(report.hospitalReleaseAttempts, 0);
assert.equal(report.lotteryCount, 1);
assert.equal(report.lotteryRewardTotal, 60);
assert.equal(report.finalMoneyTotal, 900);
assert.equal(report.finalMoneyAverage, 225);
assert.equal(report.finalMoneySpread, 80);
assert.deepEqual(report.finishOrderPlayerIds, [2, 0, 3, 1]);
assert.deepEqual(report.players.map((player) => player.moneyDelta), [60, 20, -20, 40]);
assert.deepEqual(report.players.map((player) => player.finishOrder), [2, 4, 1, 3]);

const text = formatPlaytestMatchReport061(report);
assert(text.includes('MeMeMe PLAYTEST REPORT 0.1.61'));
assert(text.includes('seed=6101'));
assert(text.includes(`checksum=${checksumBefore}`));
assert(text.includes('mini=+50B$'));
assert(text.includes('spread=80B$'));
assert(text.includes('finish: #1 P3 > #2 P1 > #3 P4 > #4 P2'));
assert(text.includes('P1 P1: 260 B$ (+60)'));

const scene061 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene061.ts', import.meta.url), 'utf8');
const scene060 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene060.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
assert(scene061.includes('extends CareerMinigameBoardScene060'));
assert(scene060.includes('extends CareerMinigameBoardScene059'));
assert(scene061.includes('BÁO CÁO PLAYTEST'));
assert(scene061.includes('LOCAL ONLY'));
assert(scene061.includes('navigator.clipboard'));
assert(!scene061.includes('Math.random'));
assert(!scene061.includes('submitIntent('));
assert(!scene061.includes('fetch('));
assert(main.includes('CareerMinigameBoardScene061 as ActiveBoardScene'));
assert.equal(CANONICAL_PRESENTATION_0561.version, '0.1.61');

console.log('[playtest-telemetry-061] PASS deterministic local-only match report + copy surface + zero gameplay authority');
