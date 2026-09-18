import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import {
  formatSimulationBaseline0611,
  runFullMatchSimulation0611,
  summarizeSimulationBatch0611,
} from '../src/core/playtestSimulation0611';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const runtime = { board: BOARD, cards: CARDS, news: NEWS };

const deterministicA = runFullMatchSimulation0611(runtime, 6110611);
const deterministicB = runFullMatchSimulation0611(runtime, 6110611);
assert.deepEqual(deterministicB.report, deterministicA.report, 'same seed must produce identical full-match report');
assert.equal(deterministicB.submittedCommands, deterministicA.submittedCommands);
assert.equal(deterministicB.miniGameResolutions, deterministicA.miniGameResolutions);
assert.equal(deterministicA.report.finishOrderPlayerIds.length, 4);
assert.equal(new Set(deterministicA.report.finishOrderPlayerIds).size, 4);

const MATCHES = 32;
const SEED_START = 611100;
const runs = Array.from({ length: MATCHES }, (_, index) =>
  runFullMatchSimulation0611(runtime, SEED_START + index),
);

for (const run of runs) {
  assert.equal(run.report.playerCount, 4);
  assert.equal(run.report.finishOrderPlayerIds.length, 4, `seed ${run.seed} did not finish all players`);
  assert.equal(new Set(run.report.finishOrderPlayerIds).size, 4, `seed ${run.seed} duplicated finish order`);
  assert(run.report.turnsObserved > 0);
  assert(run.report.commandCount > 0);
  assert(run.report.finalMoneyTotal >= 0);
  assert(run.report.finalMoneySpread >= 0);
  assert(run.submittedCommands < 1600, `seed ${run.seed} reached command safety ceiling`);
}

const summary = summarizeSimulationBatch0611(runs);
assert.equal(summary.version, '0.1.61.1');
assert.equal(summary.matches, MATCHES);
assert.equal(summary.seedStart, SEED_START);
assert.equal(summary.seedEnd, SEED_START + MATCHES - 1);
assert.equal(summary.finishFirstSeatCounts.reduce((sum, value) => sum + value, 0), MATCHES);
assert(summary.moneyLeaderSeatCounts.reduce((sum, value) => sum + value, 0) >= MATCHES, 'money leaders must cover every match, ties may add extra leaders');
assert(summary.turns.max >= summary.turns.p90 && summary.turns.p90 >= summary.turns.p50 && summary.turns.p50 >= summary.turns.min);
assert(summary.finalMoneySpread.max >= summary.finalMoneySpread.p90);
assert(runs.some((run) => run.report.releaseRolls > 0), 'baseline must exercise Jail/Hospital release rolls');
assert(runs.some((run) => run.report.cardsPlayed > 0), 'baseline must exercise Cards');
assert(runs.some((run) => run.report.newsTriggered > 0), 'baseline must exercise News');
assert(runs.some((run) => run.report.miniGamesTriggered > 0), 'baseline must exercise Mini Games');
assert(runs.some((run) => run.report.jobsSelected > 0), 'baseline must exercise Job selection');
assert(runs.some((run) => run.report.lotteryCount > 0), 'baseline must exercise Lottery');

const text = formatSimulationBaseline0611(summary);
assert(text.includes('MeMeMe SIMULATION BASELINE 0.1.61.1'));
assert(text.includes(`matches=${MATCHES}`));
assert(text.includes('deterministic CI bot baseline only'));

const outputPath = process.env.SIMULATION_BASELINE_OUTPUT?.trim();
if (outputPath) writeFileSync(outputPath, `${text}\n`, 'utf8');

console.log(text);
console.log(`[simulation-baseline-0611] PASS fullMatches=${MATCHES} deterministicSeed=${deterministicA.report.checksum} output=${outputPath || '(stdout only)'}`);
