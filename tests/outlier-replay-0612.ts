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
    seed: 611124,
    reason: 'longest-match',
    checksum: 'adf6c230',
    turns: 77,
    commands: 119,
    moneyTotal: 1042,
    spread: 151,
    movement: 68,
    release: 14,
    cards: 11,
    news: 5,
    mini: 7,
    miniPayout: 290,
    jobs: 4,
    lotteryCount: 0,
    lotteryPayout: 0,
    finishOrderPlayerIds: [1, 3, 0, 2],
    finalMoney: [229, 246, 359, 208],
    finishOrderBySeat: [3, 1, 4, 2],
  },
  {
    seed: 611121,
    reason: 'largest-money-spread',
    checksum: 'a19c5b1d',
    turns: 64,
    commands: 97,
    moneyTotal: 1389,
    spread: 292,
    movement: 62,
    release: 6,
    cards: 7,
    news: 6,
    mini: 3,
    miniPayout: 105,
    jobs: 4,
    lotteryCount: 2,
    lotteryPayout: 160,
    finishOrderPlayerIds: [1, 2, 3, 0],
    finalMoney: [362, 205, 325, 497],
    finishOrderBySeat: [4, 1, 2, 3],
  },
] as const;

function runTwice(seed: number) {
  const first = runFullMatchSimulation0611(runtime, seed);
  const second = runFullMatchSimulation0611(runtime, seed);
  assert.deepEqual(second.report, first.report, `seed ${seed} report changed across identical replay`);
  assert.equal(second.submittedCommands, first.submittedCommands, `seed ${seed} command count changed across identical replay`);
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
  assert.equal(report.commandCount, fixture.commands, `seed ${fixture.seed} command count drifted`);
  assert.equal(run.submittedCommands, fixture.commands, `seed ${fixture.seed} submitted command count drifted`);
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

function playerLine(run: (typeof runs)[number]['run']): string {
  return run.report.players
    .map((player) => `P${player.playerId + 1}=${player.finalMoney}B$/${player.finishOrder ?? '-'}th`)
    .join(' ');
}

const lines = [
  'MeMeMe OUTLIER REPLAY PACK 0.1.61.2',
  'QA-only sentinel pack; runtime/report schema remains 0.1.61.',
  ...runs.map(({ fixture, run }) => [
    `seed=${fixture.seed} reason=${fixture.reason}`,
    `checksum=${run.report.checksum}`,
    `turns=${run.report.turnsObserved} commands=${run.report.commandCount} submitted=${run.submittedCommands}`,
    `moneyTotal=${run.report.finalMoneyTotal} spread=${run.report.finalMoneySpread}`,
    `movement=${run.report.movementRolls} release=${run.report.releaseRolls} cards=${run.report.cardsPlayed} news=${run.report.newsTriggered}`,
    `mini=${run.report.miniGamesTriggered} miniPayout=${run.report.miniGameRewardTotal} jobs=${run.report.jobsSelected} lottery=${run.report.lotteryCount}/${run.report.lotteryRewardTotal}B$`,
    `finish=${run.report.finishOrderPlayerIds.map((id) => `P${id + 1}`).join('>')}`,
    playerLine(run),
  ].join('\n')),
  'NOTE: changing these fingerprints requires an intentional gameplay/balance change backed by human feedback.',
];
const text = lines.join('\n');

const outputPath = process.env.OUTLIER_REPLAY_OUTPUT?.trim();
if (outputPath) writeFileSync(outputPath, `${text}\n`, 'utf8');

console.log(text);
console.log(`[outlier-replay-0612] PASS full fingerprints locked for seeds=${OUTLIERS.map((fixture) => fixture.seed).join(',')} output=${outputPath || '(stdout only)'}`);
