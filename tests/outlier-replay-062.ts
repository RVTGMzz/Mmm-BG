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

const OUTLIERS = [
  {
    seed: 611119,
    reason: '0.1.62-longest-match',
    checksum: '9d83fad4',
    turns: 73,
    commands: 123,
    submitted: 107,
    moneyTotal: 1765,
    spread: 175,
    movement: 66,
    release: 16,
    cards: 12,
    news: 4,
    mini: 9,
    miniPayout: 415,
    jobs: 4,
    lotteryCount: 3,
    lotteryPayout: 340,
    finishOrderPlayerIds: [1, 3, 0, 2],
    finalMoney: [433, 403, 552, 377],
    finishOrderBySeat: [3, 1, 4, 2],
  },
  {
    seed: 611113,
    reason: '0.1.62-largest-money-spread',
    checksum: '1074ba94',
    turns: 53,
    commands: 79,
    submitted: 68,
    moneyTotal: 1465,
    spread: 253,
    movement: 44,
    release: 13,
    cards: 4,
    news: 7,
    mini: 4,
    miniPayout: 175,
    jobs: 3,
    lotteryCount: 2,
    lotteryPayout: 160,
    finishOrderPlayerIds: [3, 2, 0, 1],
    finalMoney: [488, 390, 352, 235],
    finishOrderBySeat: [3, 4, 2, 1],
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
  'MeMeMe OUTLIER REPLAY PACK 0.1.62',
  'Intentional gameplay update: movement D6 parity auto-routes odd LEFT / even RIGHT.',
  'Historical 0.1.61.2 fingerprints remain historical and are not rewritten.',
  ...runs.flatMap((entry) => fingerprintLine(entry)),
  'LOCKED: these are exact 0.1.62 parity-routing regression sentinels selected from the 32-match batch.',
];
const text = lines.join('\n');

const outputPath = process.env.OUTLIER_REPLAY_OUTPUT?.trim();
if (outputPath) writeFileSync(outputPath, `${text}\n`, 'utf8');

console.log(text);
console.log(`[outlier-replay-062] PASS exact fingerprints locked for seeds=${OUTLIERS.map((fixture) => fixture.seed).join(',')} output=${outputPath || '(stdout only)'}`);
