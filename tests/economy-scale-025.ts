import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json';
import cardsJson from '../src/content/core/cards_mvp.json';
import newsJson from '../src/content/core/news_mvp_demo.json';
import { createInitialMatchState } from '../src/core/matchState';
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';

const board = boardJson as BoardDefinition;
const cards = cardsJson as CardDefinition[];
const news = newsJson as NewsDefinition[];

const match = createInitialMatchState({
  boardId: board.id,
  startNodeId: board.startNodeId,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 2501,
});

assert.equal(match.startingMoney, 200, 'New matches must default to 200B$.');
assert.deepEqual(match.players.map((player) => player.money), [200, 200, 200, 200]);

// 0.1.55 Draft D intentionally replaces the old compact-board money pattern.
// Protect the approved 200B$ scale without forcing +15/+50 tiles to survive a map redesign.
const mainMoneyTiles = board.nodes
  .filter((node) => node.id >= 0 && node.id < 44 && node.type === 'money')
  .map((node) => node.value ?? 0)
  .sort((a, b) => a - b);
assert.deepEqual(
  mainMoneyTiles,
  [-20, -20, -20, -20, 25, 25, 25, 25],
  'Draft D main loop must keep four -20B$ and four +25B$ money spaces.',
);

const allMoneyTiles = board.nodes
  .filter((node) => node.type === 'money')
  .map((node) => node.value ?? 0);
assert(
  allMoneyTiles.every((amount) => amount === -20 || amount === 25),
  'Draft D money tiles must stay on the approved compact -20/+25 scale before 0.1.60 economy tuning.',
);

const selfNewsAmounts = news
  .filter((entry) => entry.effect.type === 'money_delta_self')
  .map((entry) => entry.effect.amount);
assert(selfNewsAmounts.filter((amount) => amount === 30).length === 3, 'Positive News should be +30B$.');
assert(selfNewsAmounts.filter((amount) => amount === -40).length === 3, 'Negative News should be -40B$.');

const groupNews = news.filter((entry) => entry.effect.type === 'money_delta_all');
assert.equal(groupNews.length, 2);
assert(groupNews.every((entry) => entry.effect.type === 'money_delta_all' && entry.effect.amount === -20));

const catchUp = cards.find((card) => card.id === 'ACT_016');
assert(catchUp && catchUp.effect.type === 'catch_up_bonus');
if (catchUp.effect.type === 'catch_up_bonus') {
  assert.equal(catchUp.effect.poorAmount, 60);
  assert.equal(catchUp.effect.baseAmount, 15);
}

const stealCards = cards.filter((card) => card.effect.type === 'steal_money');
assert(stealCards.every((card) => card.effect.type === 'steal_money' && card.effect.amount === 10));

const richTax = cards.find((card) => card.id === 'ACT_015');
assert(richTax && richTax.effect.type === 'rich_tax' && richTax.effect.percent === 0.18);

const groupLoss = cards.filter((card) => card.effect.type === 'percent_loss_all_others');
assert(groupLoss.every((card) => card.effect.type === 'percent_loss_all_others' && card.effect.percent === 0.3));

console.log('[economy-scale-025] PASS start=200B$ + Draft D -20/+25 tiles + News/Card economy scale');
