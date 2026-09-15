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
  { seed: 611124, reason: 'longest-match' },
  { seed: 611121, reason: 'largest-money-spread' },
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

const longest = runs.find(({ fixture }) => fixture.seed === 611124)!;
assert.equal(longest.run.report.turnsObserved, 77, 'longest-match sentinel drifted from the 0.1.61.1 baseline');

const widest = runs.find(({ fixture }) => fixture.seed === 611121)!;
assert.equal(widest.run.report.finalMoneySpread, 292, 'largest-money-spread sentinel drifted from the 0.1.61.1 baseline');

for (const { fixture, run } of runs) {
  assert(run.submittedCommands < 1600, `seed ${fixture.seed} reached simulation safety ceiling`);
  assert(run.report.commandCount > 0);
  assert(run.report.movementRolls > 0);
  assert(run.report.players.every((player) => player.lapsCompleted >= 1), `seed ${fixture.seed} must finish one lap for every player`);
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
console.log(`[outlier-replay-0612] PASS seeds=${OUTLIERS.map((fixture) => fixture.seed).join(',')} output=${outputPath || '(stdout only)'}`);
