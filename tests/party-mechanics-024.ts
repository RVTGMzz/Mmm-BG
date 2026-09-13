import assert from 'node:assert/strict';
import cardsJson from '../src/content/core/cards_mvp.json';
import newsJson from '../src/content/core/news_mvp_demo.json';
import { applyCardEffect, pickRichestOtherTarget, type CardDefinition } from '../src/core/cards';
import { createInitialMatchState } from '../src/core/matchState';
import { applyNewsEffect, type NewsDefinition } from '../src/core/news';

const cards = cardsJson as CardDefinition[];
const news = newsJson as NewsDefinition[];

function makePlayers(values: number[]) {
  const match = createInitialMatchState({
    boardId: 'mechanics-024',
    startNodeId: 0,
    playerNames: ['P1', 'P2', 'P3', 'P4'],
    seed: 2401,
  });
  match.players.forEach((player, index) => { player.money = values[index] ?? 0; });
  return match.players;
}

const card15 = cards.find((card) => card.id === 'ACT_015');
assert(card15);
const a = makePlayers([500, 900, 900, 300]);
assert.equal(pickRichestOtherTarget(a, 0)?.id, 1);
const r15 = applyCardEffect(card15, a[0]!, a);
assert.equal(r15.amount, 162);
assert.equal(a[0]?.money, 662);
assert.equal(a[1]?.money, 738);
assert.deepEqual(r15.affectedPlayerIds, [0, 1]);

const card16 = cards.find((card) => card.id === 'ACT_016');
assert(card16);
const b = makePlayers([700, 650, 500, 200]);
const r16a = applyCardEffect(card16, b[3]!, b);
assert.equal(r16a.amount, 140);
assert.equal(b[3]?.money, 340);
const r16b = applyCardEffect(card16, b[0]!, b);
assert.equal(r16b.amount, 20);
assert.equal(b[0]?.money, 720);

const news9 = news.find((entry) => entry.id === 'NEWS_DEMO_009');
assert(news9);
const c = makePlayers([100, 300, 500, 700]);
const n1 = applyNewsEffect(news9, c[0]!, c);
assert.equal(c[0]?.money, 400);
assert.equal(n1.amount, 300);
assert.deepEqual(n1.deltas, { 0: 300 });

const d = makePlayers([100, 300, 500, 700]);
const n2 = applyNewsEffect(news9, d[3]!, d);
assert.equal(d[3]?.money, 400);
assert.equal(n2.amount, 300);
assert.deepEqual(n2.deltas, { 3: -300 });

console.log('[party-mechanics-024] PASS');
