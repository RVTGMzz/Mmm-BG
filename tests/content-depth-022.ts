import assert from 'node:assert/strict';
import cardsJson from '../src/content/core/cards_mvp.json';
import newsJson from '../src/content/core/news_mvp_demo.json';
import reactionsJson from '../src/content/core/reactions_mvp_demo.json';
import { drawWeightedCard, type CardDefinition } from '../src/core/cards';
import { drawWeightedNews, type NewsDefinition } from '../src/core/news';
import type { ReactionEventDefinition } from '../src/core/reactions';
import { tileIdentityCopy } from '../src/ui/tileIdentity';

const cards = cardsJson as CardDefinition[];
const news = newsJson as NewsDefinition[];
const reactions = reactionsJson as ReactionEventDefinition[];

assert(cards.length >= 13, '0.1.24 should expose the expanded Card pool');
assert(news.length >= 9, '0.1.24 should expose the expanded News pool');
assert.equal(new Set(cards.map((card) => card.id)).size, cards.length, 'Card IDs must stay unique');
assert.equal(new Set(news.map((entry) => entry.id)).size, news.length, 'News IDs must stay unique');

const cardWeightByRarity = cards.reduce<Record<string, number>>((acc, card) => {
  acc[card.rarity] = (acc[card.rarity] ?? 0) + card.dropWeight;
  return acc;
}, {});
assert.deepEqual(cardWeightByRarity, { N: 600, R: 300, SR: 90, SSR: 10 });
assert.equal(cards.reduce((sum, card) => sum + card.dropWeight, 0), 1000);

assert.equal(drawWeightedCard(cards, () => 0.10)?.effect.type, 'steal_money');
assert.equal(drawWeightedCard(cards, () => 0.65)?.effect.type, 'block_cards');
assert.equal(drawWeightedCard(cards, () => 0.85)?.effect.type, 'rich_tax');
assert.equal(drawWeightedCard(cards, () => 0.93)?.effect.type, 'percent_loss_all_others');
assert.equal(drawWeightedCard(cards, () => 0.97)?.effect.type, 'catch_up_bonus');
assert.equal(drawWeightedCard(cards, () => 0.999)?.effect.type, 'swap_money');

const positiveNewsWeight = news
  .filter((entry) => entry.effect.type === 'money_delta_self' && entry.effect.amount > 0)
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
const negativeNewsWeight = news
  .filter((entry) => entry.effect.type === 'money_delta_self' && entry.effect.amount < 0)
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
const groupNewsWeight = news
  .filter((entry) => entry.effect.type === 'money_delta_all')
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
const averageNewsWeight = news
  .filter((entry) => entry.effect.type === 'normalize_to_average_self')
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
assert.equal(positiveNewsWeight, 600);
assert.equal(negativeNewsWeight, 300);
assert.equal(groupNewsWeight, 50);
assert.equal(averageNewsWeight, 50);
assert.equal(news.reduce((sum, entry) => sum + entry.dropWeight, 0), 1000);

assert.equal(drawWeightedNews(news, () => 0.10)?.effect.type, 'money_delta_self');
assert.equal((drawWeightedNews(news, () => 0.10)?.effect as { amount: number }).amount, 60);
assert.equal((drawWeightedNews(news, () => 0.65)?.effect as { amount: number }).amount, -80);
assert.equal(drawWeightedNews(news, () => 0.925)?.effect.type, 'money_delta_all');
assert.equal(drawWeightedNews(news, () => 0.975)?.effect.type, 'normalize_to_average_self');

const reactionIds = new Set(reactions.map((entry) => entry.id));
for (const entry of news) {
  if (entry.reactionEventId) {
    assert(reactionIds.has(entry.reactionEventId), `News ${entry.id} references missing reaction ${entry.reactionEventId}`);
  }
}

const node1 = tileIdentityCopy('normal', 1, 0);
const node4 = tileIdentityCopy('normal', 4, 0);
const node18 = tileIdentityCopy('normal', 18, 0);
assert.equal(node1.title, 'HẺM CÀ PHÊ');
assert.equal(node4.title, 'NGÃ TƯ ĐÔNG NGHẸT');
assert.equal(node18.title, 'HẺM TẮT');
assert.notEqual(node1.description, node4.description, 'normal tiles should not all read as generic clones');

console.log('[content-depth-022] PASS expanded Card/News pools keep 1000 total weight and include 0.1.24 mechanics');
