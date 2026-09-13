import assert from 'node:assert/strict';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import { buildPresentationModel } from '../src/ui/presentationModel';

const match = createInitialMatchState({
  boardId: 'presentation-test',
  startNodeId: 0,
  playerNames: ['Ron', 'Bích', 'Hưng', 'Mây'],
  seed: 1701,
});

function event(
  seq: number,
  type: string,
  actorId: number,
  data: MatchEvent['data'],
): MatchEvent {
  return {
    seq,
    type,
    turnNumber: 4,
    playerIndex: actorId,
    phase: 'RESOLVING_TILE',
    revision: 12,
    rngCalls: 8,
    actorId,
    data,
  };
}

const moneyLanding = buildPresentationModel(
  event(5, 'tile_land', 0, { nodeId: 2, tileType: 'money', value: 50 }),
  match.players,
);
assert(moneyLanding, 'money landing should create a compact presentation model');
assert.equal(moneyLanding.kind, 'tile_land');
assert.equal(moneyLanding.tileType, 'money');
assert.equal(moneyLanding.amount, 50);
assert.equal(moneyLanding.title, '+50 B$');

const normalLanding = buildPresentationModel(
  event(6, 'tile_land', 2, { nodeId: 4, tileType: 'normal', value: 0 }),
  match.players,
);
assert(normalLanding, 'normal landing should still create feedback');
assert.equal(normalLanding.title, 'Ô THƯỜNG');
assert.equal(normalLanding.actorName, 'Hưng');

const ready = buildPresentationModel(
  event(7, 'ready_pass', 3, { amount: 100, resultMoney: 1200 }),
  match.players,
);
assert(ready, 'ready pass should create a bonus presentation');
assert.equal(ready.kind, 'ready_bonus');
assert.equal(ready.amount, 100);
assert.equal(ready.title, '+100 B$');

const news = buildPresentationModel(
  event(8, 'news', 1, {
    newsId: 'NEWS_DEMO_002',
    title: 'Ví Bay Màu',
    rarity: 'R',
    impact: '⭐⭐',
    description: 'Một khoản phí không ai nhớ đã đăng ký bỗng dưng trừ tiền.',
    summary: 'Bích mất 80B$.',
    amount: 80,
    reactionEventId: 'NEWS_NEGATIVE_DEMO',
    spectatorId: 3,
  }),
  match.players,
);

assert(news, 'news event should create a presentation model');
assert.equal(news.kind, 'news');
assert.equal(news.actorName, 'Bích');
assert.equal(news.reactions.length, 2);
assert.equal(news.reactions[0]?.speakerName, 'Bích');
assert.equal(news.reactions[1]?.speakerName, 'Mây');
assert.match(news.reactions[0]?.text ?? '', /Biết ngay mà!/);
assert.match(news.reactions[1]?.text ?? '', /Còn tiền là còn gỡ/);

const card = buildPresentationModel(
  event(9, 'card_play', 0, {
    cardId: 'ACT_001',
    title: 'Trượt Tay',
    rarity: 'N',
    impact: '⭐',
    description: 'Lấy 10 vàng từ 1 người chơi ngẫu nhiên.',
    summary: 'Ron lấy 10B$ từ Hưng.',
    amount: 10,
    targetId: 2,
    spectatorId: 1,
    reactionEventId: 'CARD_ATTACK_DEMO',
  }),
  match.players,
);

assert(card, 'card play should create a presentation model');
assert.equal(card.kind, 'card_play');
assert.equal(card.actorName, 'Ron');
assert.equal(card.targetName, 'Hưng');
assert.deepEqual(
  card.reactions.map((line) => line.speakerName),
  ['Ron', 'Hưng', 'Bích'],
);
assert.equal(card.reactions[0]?.sequence, 1);
assert.equal(card.reactions[1]?.sequence, 2);
assert.equal(card.reactions[2]?.sequence, 3);

const amountTemplate = buildPresentationModel(
  event(10, 'news', 0, {
    newsId: 'NEWS_DEMO_002',
    title: 'Ví Bay Màu',
    rarity: 'R',
    impact: '⭐⭐',
    description: 'Một khoản phí không ai nhớ đã đăng ký bỗng dưng trừ tiền.',
    summary: 'Ron mất 80B$.',
    amount: 80,
    reactionEventId: 'NEWS_NEGATIVE_DEMO',
    spectatorId: 2,
  }),
  match.players,
);
assert(amountTemplate, 'amount-template news should create a presentation model');
assert.match(amountTemplate.reactions[0]?.text ?? '', /80B\$/);

const draw = buildPresentationModel(
  event(11, 'card_draw', 3, {
    cardId: 'ACT_012',
    title: 'Chuyển Sinh Đổi Vận',
    rarity: 'SSR',
    impact: '⭐⭐⭐⭐⭐',
    description: 'Hoán đổi toàn bộ số vàng của bản thân với Target.',
  }),
  match.players,
);
assert(draw, 'card draw should create a presentation model');
assert.equal(draw.kind, 'card_draw');
assert.equal(draw.rarity, 'SSR');
assert.equal(draw.reactions.length, 0);

assert.equal(
  buildPresentationModel(event(12, 'money_tile', 0, { amount: 50 }), match.players),
  undefined,
  'raw money delta stays outside cinematic queue because tile_land owns landing feedback',
);

console.log('[presentation-events] PASS landing + Card/News/Reaction models are deterministic and spectator-aware');
