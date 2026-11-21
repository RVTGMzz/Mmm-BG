import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import { applyCardEffect, type CardDefinition } from '../src/core/cards';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import type { NewsDefinition } from '../src/core/news';
import { runFullMatchSimulation0611 } from '../src/core/playtestSimulation0611';
import type { BoardDefinition, PlayerState } from '../src/core/types';

const CARDS = cardsJson as CardDefinition[];
const card = (id: string) => CARDS.find((c) => c.id === id)!;

// 20 cards, one effect each, each with its own painted illustration.
assert.equal(CARDS.length, 20);
assert.equal(new Set(CARDS.map((c) => `${c.effect.type}:${(c.effect as { location?: string }).location ?? ''}`)).size, 20);
for (const c of CARDS) assert.ok(existsSync(`public/assets/ui/ch19/cards/${c.id}.webp`), `${c.id} illustration missing`);

const players = (): PlayerState[] => [0, 1, 2, 3].map((id) => ({
  id, name: `P${id + 1}`, nodeId: 0, money: [100, 200, 300, 50][id], cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0,
}));

{ // Phạt Nguội: the target loses 15, nobody gains
  const ps = players();
  applyCardEffect(card('ACT_003'), ps[0], ps, ps[2]);
  assert.deepEqual(ps.map((p) => p.money), [100, 200, 285, 50]);
}
{ // Lì Xì: +15 to the caster, +10 to the poorest opponent
  const ps = players();
  applyCardEffect(card('ACT_101'), ps[0], ps);
  assert.deepEqual(ps.map((p) => p.money), [115, 200, 300, 60]);
}
{ // Chia Bill: each opponent pays 5
  const ps = players();
  applyCardEffect(card('ACT_102'), ps[0], ps);
  assert.deepEqual(ps.map((p) => p.money), [115, 195, 295, 45]);
}
{ // Bảo Kê blocks the next harmful card, once
  const ps = players();
  applyCardEffect(card('ACT_104'), ps[1], ps);
  assert.equal(ps[1].cardShield, 1);
  const r = applyCardEffect(card('ACT_001'), ps[0], ps, ps[1]);
  assert.match(r.summary, /BẢO KÊ/);
  assert.deepEqual(ps.map((p) => p.money), [100, 200, 300, 50]);
  assert.equal(ps[1].cardShield, undefined);
  applyCardEffect(card('ACT_001'), ps[0], ps, ps[1]);
  assert.deepEqual(ps.map((p) => p.money), [110, 190, 300, 50]);
}
{ // Robin Hood: richest opponent -> poorest opponent
  const ps = players();
  applyCardEffect(card('ACT_105'), ps[0], ps);
  assert.deepEqual(ps.map((p) => p.money), [100, 200, 285, 65]);
}
{ // Vé Cào / Phong Bì use the HOST random number
  const ps = players();
  applyCardEffect(card('ACT_108'), ps[0], ps, undefined, undefined, () => 0.99);
  assert.equal(ps[0].money, 148);
  applyCardEffect(card('ACT_109'), ps[0], ps, undefined, undefined, () => 0.2);
  assert.equal(ps[0].money, 188);
  applyCardEffect(card('ACT_109'), ps[0], ps, undefined, undefined, () => 0.8);
  assert.equal(ps[0].money, 173);
}
{ // Cân Bằng Xã Hội: below average -> lifted to the average; above -> +20
  const ps = players();
  applyCardEffect(card('ACT_110'), ps[3], ps);
  assert.equal(ps[3].money, 162);
  applyCardEffect(card('ACT_110'), ps[2], ps);
  assert.equal(ps[2].money, 320);
}
{ // movement cards set their flags
  const ps = players();
  applyCardEffect(card('ACT_103'), ps[0], ps);
  applyCardEffect(card('ACT_106'), ps[0], ps);
  applyCardEffect(card('ACT_107'), ps[0], ps, ps[1]);
  assert.equal(ps[0].cardBonusSteps, 2);
  assert.equal(ps[0].cardDoubleRoll, true);
  assert.equal(ps[1].cardSlowRoll, true);
}

// Full CPU matches through the HOST replay engine with a deck of just one new card:
// every new effect is accepted, deterministic, and actually played.
const runtimeFor = (id: string) => ({ board: boardJson as BoardDefinition, cards: [{ ...card(id), dropWeight: 1 }], news: newsJson as NewsDefinition[] });
for (const id of ['ACT_003', 'ACT_101', 'ACT_102', 'ACT_103', 'ACT_104', 'ACT_105', 'ACT_106', 'ACT_107', 'ACT_108', 'ACT_109', 'ACT_110']) {
  const a = runFullMatchSimulation0611(runtimeFor(id), 7);
  const b = runFullMatchSimulation0611(runtimeFor(id), 7);
  assert.equal(a.report.checksum, b.report.checksum, `${id}: deterministic`);
  assert.ok(a.report.cardsPlayed > 0, `${id}: played at least once`);
  assert.equal(a.report.finishOrderPlayerIds.length, 4, `${id}: match finishes`);
}

console.log('[cards-deck-ch19] PASS 20 distinct painted cards, shield / movement / RNG card effects');
