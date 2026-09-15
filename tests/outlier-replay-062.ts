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
  { seed: 611119, reason: '0.1.62-longest-match' },
  { seed: 611113, reason: '0.1.62-largest-money-spread' },
] as const;

function runTwice(seed: number) {
  const first = runFullMatchSimulation0611(runtime, seed);
  const second = runFullMatchSimulation0611(runtime, seed);
  assert.deepEqual(second.report, first.report, `seed ${seed} report changed across identical replay`);
  assert.equal(second.submittedCommands, first.submittedCommands, `seed ${seed} submitted-command count changed across identical replay`);
  assert.equal(second.miniGameResolutions, first.miniGameResolutions, `seed ${seed} Mini Game resolution count changed across identical replay`);
  assert.equal(first.report.finishOrderPlayerIds.length, 4, `seed ${seed} must finish all four players`);
  assert.equal(new Set(first.report.finishOrderPlayerIds).size, 4, `seed ${seed} finish order must contain four unique players`);
  assert(first.submittedCommands < 1600, `seed ${seed} reached simulation safety ceiling`);
  assert(first.report.players.every((player) => player.lapsCompleted >= 1), `seed ${seed} must finish one lap for every player`);
  return first;
}

const runs = OUTLIERS.map((fixture) => ({ fixture, run: runTwice(fixture.seed) }));

function fingerprintLine(entry: (typeof runs)[number]): string[] {
  const { fixture, run } = entry;
  const { report } = run;
  return [
    `seed=${fixture.seed} reason=${fixture.reason}`,
    `checksum=${report.checksum}`,
    `turns=${report.turnsObserved} commands=${report.commandCount} submitted=${run.submittedCommands}`,
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
  'Intentional gameplay update: movement D6 parity now auto-routes odd LEFT / even RIGHT.',
  'Historical 0.1.61.2 fingerprints remain historical and are not rewritten.',
  ...runs.flatMap((entry) => fingerprintLine(entry)),
  'PROBE: exact fingerprints will be locked after this deterministic candidate is observed once in CI.',
];
const text = lines.join('\n');

const outputPath = process.env.OUTLIER_REPLAY_OUTPUT?.trim();
if (outputPath) writeFileSync(outputPath, `${text}\n`, 'utf8');

console.log(text);
console.log(`[outlier-replay-062] PROBE PASS seeds=${OUTLIERS.map((fixture) => fixture.seed).join(',')} output=${outputPath || '(stdout only)'}`);
