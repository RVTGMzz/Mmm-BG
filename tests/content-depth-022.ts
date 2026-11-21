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

assert(cards.length >= 15, '0.1.58 should expose the expanded Card pool');
assert(news.length >= 14, '0.1.58 should expose the expanded News pool');
assert.equal(new Set(cards.map((card) => card.id)).size, cards.length, 'Card IDs must stay unique');
assert.equal(new Set(news.map((entry) => entry.id)).size, news.length, 'News IDs must stay unique');

const cardWeightByRarity = cards.reduce<Record<string, number>>((acc, card) => {
  acc[card.rarity] = (acc[card.rarity] ?? 0) + card.dropWeight;
  return acc;
}, {});
assert.deepEqual(cardWeightByRarity, { N: 600, R: 300, SR: 90, SSR: 10 });
assert.equal(cards.reduce((sum, card) => sum + card.dropWeight, 0), 1000);

// CH-19 deck: 20 cards, one effect each, drawn N -> R -> SR -> SSR (probe = middle of each card's weight band)
assert.equal(drawWeightedCard(cards, () => 0.06)?.effect.type, 'steal_money');
assert.equal(drawWeightedCard(cards, () => 0.18)?.effect.type, 'fine_random');
assert.equal(drawWeightedCard(cards, () => 0.3)?.effect.type, 'gift_poorest');
assert.equal(drawWeightedCard(cards, () => 0.42)?.effect.type, 'collect_each');
assert.equal(drawWeightedCard(cards, () => 0.54)?.effect.type, 'bonus_steps');
assert.equal(drawWeightedCard(cards, () => 0.619)?.effect.type, 'block_cards');
assert.equal(drawWeightedCard(cards, () => 0.657)?.effect.type, 'tactical_choice');
assert.equal(drawWeightedCard(cards, () => 0.695)?.effect.type, 'rich_tax');
assert.equal(drawWeightedCard(cards, () => 0.733)?.effect.type, 'send_to_special');
assert.equal((drawWeightedCard(cards, () => 0.733)?.effect as { location?: string }).location, 'jail');
assert.equal(drawWeightedCard(cards, () => 0.7705)?.effect.type, 'send_to_special');
assert.equal((drawWeightedCard(cards, () => 0.7705)?.effect as { location?: string }).location, 'hospital');
assert.equal(drawWeightedCard(cards, () => 0.8075)?.effect.type, 'shield');
assert.equal(drawWeightedCard(cards, () => 0.8445)?.effect.type, 'robin_hood');
assert.equal(drawWeightedCard(cards, () => 0.8815)?.effect.type, 'double_roll');
assert.equal(drawWeightedCard(cards, () => 0.909)?.effect.type, 'percent_loss_all_others');
assert.equal(drawWeightedCard(cards, () => 0.927)?.effect.type, 'catch_up_bonus');
assert.equal(drawWeightedCard(cards, () => 0.945)?.effect.type, 'slow_roll');
assert.equal(drawWeightedCard(cards, () => 0.963)?.effect.type, 'dice_bonus');
assert.equal(drawWeightedCard(cards, () => 0.981)?.effect.type, 'gamble');
assert.equal(drawWeightedCard(cards, () => 0.9925)?.effect.type, 'swap_money');
assert.equal(drawWeightedCard(cards, () => 0.9975)?.effect.type, 'equalize');
assert.equal(new Set(cards.map((card) => `${card.effect.type}:${(card.effect as { location?: string }).location ?? ''}`)).size, cards.length, 'CH-19: every Card has its own effect');

const positiveNewsWeight = news
  .filter((entry) => entry.effect.type === 'money_delta_self' && entry.effect.amount > 0)
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
const negativeNewsWeight = news
  .filter((entry) => entry.effect.type === 'money_delta_self' && entry.effect.amount < 0)
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
const groupNewsWeight = news
  .filter((entry) => entry.effect.type === 'money_delta_all')
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
const specialNewsWeight = news
  .filter((entry) => entry.effect.type === 'send_other_to_special')
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
const averageNewsWeight = news
  .filter((entry) => entry.effect.type === 'normalize_to_average_self')
  .reduce((sum, entry) => sum + entry.dropWeight, 0);
assert.equal(positiveNewsWeight, 450);
assert.equal(negativeNewsWeight, 210);
assert.equal(groupNewsWeight, 160);
assert.equal(specialNewsWeight, 120);
assert.equal(averageNewsWeight, 60);
assert.equal(news.reduce((sum, entry) => sum + entry.dropWeight, 0), 1000);

assert.equal(drawWeightedNews(news, () => 0.10)?.effect.type, 'money_delta_self');
assert.equal((drawWeightedNews(news, () => 0.10)?.effect as { amount: number }).amount, 25);
assert.equal(drawWeightedNews(news, () => 0.50)?.effect.type, 'money_delta_all');
assert.equal((drawWeightedNews(news, () => 0.50)?.effect as { amount: number }).amount, 10);
assert.equal((drawWeightedNews(news, () => 0.60)?.effect as { amount: number }).amount, -30);
assert.equal(drawWeightedNews(news, () => 0.75)?.effect.type, 'money_delta_all');
assert.equal((drawWeightedNews(news, () => 0.75)?.effect as { amount: number }).amount, -10);
assert.equal(drawWeightedNews(news, () => 0.80)?.effect.type, 'send_other_to_special');
assert.equal(drawWeightedNews(news, () => 0.90)?.effect.type, 'money_delta_all');
assert.equal((drawWeightedNews(news, () => 0.90)?.effect as { amount: number }).amount, -15);
assert.equal(drawWeightedNews(news, () => 0.97)?.effect.type, 'normalize_to_average_self');

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

console.log('[content-depth-022] PASS Card/News weights stay 1000 while 0.1.60 tunes economy amplitudes');
