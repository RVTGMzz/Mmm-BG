import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import { runFullMatchSimulation0611 } from '../src/core/playtestSimulation0611';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const runtime = { board: BOARD, cards: CARDS, news: NEWS };

// Same two seeds previously locked by 0.1.62. 0.1.63.4 intentionally changes
// movement semantics: Job Hub pauses/resolves then spends the remaining pips from
// the original movement D6. Therefore these fingerprints are deliberately rebased
// instead of rewriting the historical 0.1.62 sentinel file.
const OUTLIERS = [
  {
    seed: 611119,
    reason: 'historical-0.1.62-longest-match-replayed-under-0.1.63.4',
    checksum: 'cb3d9c1b',
    turns: 53,
    commands: 87,
    submitted: 74,
    moneyTotal: 730,
    spread: 60,
    movement: 53,
    release: 2,
    cards: 14,
    news: 6,
    mini: 1,
    miniPayout: 50,
    jobs: 4,
    lotteryCount: 0,
    lotteryPayout: 0,
    finishOrderPlayerIds: [2, 3, 1, 0],
    finalMoney: [183, 160, 167, 220],
    finishOrderBySeat: [4, 3, 1, 2],
  },
  {
    seed: 611113,
    reason: 'historical-0.1.62-largest-money-spread-replayed-under-0.1.63.4',
    checksum: '93aa3912',
    turns: 49,
    commands: 81,
    submitted: 69,
    moneyTotal: 1302,
    spread: 277,
    movement: 48,
    release: 5,
    cards: 10,
    news: 5,
    mini: 3,
    miniPayout: 130,
    jobs: 3,
    lotteryCount: 2,
    lotteryPayout: 160,
    finishOrderPlayerIds: [3, 2, 1, 0],
    finalMoney: [447, 365, 320, 170],
    finishOrderBySeat: [4, 3, 2, 1],
  },
] as const;

function runTwice(seed: number) {
  const first = runFullMatchSimulation0611(runtime, seed);
  const second = runFullMatchSimulation0611(runtime, seed);
  assert.deepEqual(second.report, first.report, `seed ${seed} report changed across identical replay`);
  assert.equal(second.submittedCommands, first.submittedCommands, `seed ${seed} submitted-command count changed across identical replay`);
  assert.equal(second.miniGameResolutions, first.miniGameResolutions, `seed ${seed} Mini Game resolution count changed across identical replay`);
  assert.equal(first.report.finishOrderPlayerIds.length, 4, `seed ${seed} must finish all four players`);
  assert.equal(new Set(first.report.finishOrderPlayerIds).size, 4, `seed ${seed} finish order must contain four unique players`);
  return first;
}

const runs = OUTLIERS.map((fixture) => ({ fixture, run: runTwice(fixture.seed) }));

for (const { fixture, run } of runs) {
  const { report } = run;
  assert.equal(report.checksum, fixture.checksum, `seed ${fixture.seed} checksum drifted`);
  assert.equal(report.turnsObserved, fixture.turns, `seed ${fixture.seed} turn count drifted`);
  assert.equal(report.commandCount, fixture.commands, `seed ${fixture.seed} authoritative command count drifted`);
  assert.equal(run.submittedCommands, fixture.submitted, `seed ${fixture.seed} client/system submitted command count drifted`);
  assert(report.commandCount > run.submittedCommands, `seed ${fixture.seed} must include HOST-generated parity branch commands`);
  assert.equal(report.finalMoneyTotal, fixture.moneyTotal, `seed ${fixture.seed} final money total drifted`);
  assert.equal(report.finalMoneySpread, fixture.spread, `seed ${fixture.seed} final money spread drifted`);
  assert.equal(report.movementRolls, fixture.movement, `seed ${fixture.seed} movement roll count drifted`);
  assert.equal(report.releaseRolls, fixture.release, `seed ${fixture.seed} release roll count drifted`);
  assert.equal(report.cardsPlayed, fixture.cards, `seed ${fixture.seed} Card count drifted`);
  assert.equal(report.newsTriggered, fixture.news, `seed ${fixture.seed} News count drifted`);
  assert.equal(report.miniGamesTriggered, fixture.mini, `seed ${fixture.seed} Mini Game count drifted`);
  assert.equal(run.miniGameResolutions, fixture.mini, `seed ${fixture.seed} Mini Game resolution count drifted`);
  assert.equal(report.miniGameRewardTotal, fixture.miniPayout, `seed ${fixture.seed} Mini payout drifted`);
  assert.equal(report.jobsSelected, fixture.jobs, `seed ${fixture.seed} Job selection count drifted`);
  assert.equal(report.lotteryCount, fixture.lotteryCount, `seed ${fixture.seed} Lottery count drifted`);
  assert.equal(report.lotteryRewardTotal, fixture.lotteryPayout, `seed ${fixture.seed} Lottery payout drifted`);
  assert.deepEqual(report.finishOrderPlayerIds, [...fixture.finishOrderPlayerIds], `seed ${fixture.seed} finish order drifted`);
  assert.deepEqual(report.players.map((player) => player.finalMoney), [...fixture.finalMoney], `seed ${fixture.seed} per-seat final money drifted`);
  assert.deepEqual(report.players.map((player) => player.finishOrder), [...fixture.finishOrderBySeat], `seed ${fixture.seed} per-seat finish place drifted`);
  assert(run.submittedCommands < 1600, `seed ${fixture.seed} reached simulation safety ceiling`);
  assert(report.players.every((player) => player.lapsCompleted >= 1), `seed ${fixture.seed} must finish one lap for every player`);
}

function fingerprintLine(entry: (typeof runs)[number]): string[] {
  const { fixture, run } = entry;
  const { report } = run;
  return [
    `seed=${fixture.seed} reason=${fixture.reason}`,
    `checksum=${report.checksum}`,
    `turns=${report.turnsObserved} commands=${report.commandCount} submitted=${run.submittedCommands} hostAuto=${report.commandCount - run.submittedCommands}`,
    `moneyTotal=${report.finalMoneyTotal} spread=${report.finalMoneySpread}`,
    `movement=${report.movementRolls} release=${report.releaseRolls} cards=${report.cardsPlayed} news=${report.newsTriggered}`,
    `mini=${report.miniGamesTriggered} miniResolved=${run.miniGameResolutions} miniPayout=${report.miniGameRewardTotal}`,
    `jobs=${report.jobsSelected} lottery=${report.lotteryCount}/${report.lotteryRewardTotal}B$`,
    `finishIds=${report.finishOrderPlayerIds.join(',')}`,
    `finalMoney=${report.players.map((player) => player.finalMoney).join(',')}`,
    `finishPlaces=${report.players.map((player) => player.finishOrder ?? 0).join(',')}`,
  ];
}

const lines = [
  'MeMeMe OUTLIER REPLAY PACK 0.1.63.4',
  'Intentional gameplay update: Job Hub resolves mid-roll, then movement spends all remaining pips.',
  'Historical 0.1.62 fingerprints remain in tests/outlier-replay-062.ts and are not rewritten.',
  ...runs.flatMap((entry) => fingerprintLine(entry)),
  'LOCKED: exact post-Job-continuation regression fingerprints for the same historical sentinel seeds.',
];
const text = lines.join('\n');

const outputPath = process.env.OUTLIER_REPLAY_OUTPUT?.trim();
if (outputPath) writeFileSync(outputPath, `${text}\n`, 'utf8');

console.log(text);
console.log(`[outlier-replay-0634] PASS exact fingerprints locked for seeds=${OUTLIERS.map((fixture) => fixture.seed).join(',')} output=${outputPath || '(stdout only)'}`);
