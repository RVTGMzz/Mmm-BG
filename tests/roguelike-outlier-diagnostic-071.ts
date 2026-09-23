import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import { runFullMatchSimulation0611 } from '../src/core/playtestSimulation0611';
import type { BoardDefinition } from '../src/core/types';

const runtime = {
  board: boardJson as BoardDefinition,
  cards: cardsJson as CardDefinition[],
  news: newsJson as NewsDefinition[],
};

for (const seed of [611102, 611112]) {
  const run = runFullMatchSimulation0611(runtime, seed);
  const report = run.report;
  console.log(JSON.stringify({
    seed,
    checksum: report.checksum,
    turns: report.turnsObserved,
    commands: report.commandCount,
    submitted: run.submittedCommands,
    moneyTotal: report.finalMoneyTotal,
    spread: report.finalMoneySpread,
    movement: report.movementRolls,
    release: report.releaseRolls,
    cards: report.cardsPlayed,
    news: report.newsTriggered,
    mini: report.miniGamesTriggered,
    miniResolved: run.miniGameResolutions,
    miniPayout: report.miniGameRewardTotal,
    jobs: report.jobsSelected,
    lotteryCount: report.lotteryCount,
    lotteryPayout: report.lotteryRewardTotal,
    finishOrderPlayerIds: report.finishOrderPlayerIds,
    finalMoney: report.players.map((player) => player.finalMoney),
    finishOrderBySeat: report.players.map((player) => player.finishOrder),
  }));
}
