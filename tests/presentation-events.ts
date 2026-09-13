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

const news = buildPresentationModel(
  event(7, 'news', 1, {
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
assert.match(news.reactions[0]?.text ?? '', /80B\$/);

const card = buildPresentationModel(
  event(8, 'card_play', 0, {
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

const draw = buildPresentationModel(
  event(9, 'card_draw', 3, {
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
  buildPresentationModel(event(10, 'money_tile', 0, { amount: 50 }), match.players),
  undefined,
  'non Card/News events should stay outside the cinematic presentation queue',
);

console.log('[presentation-events] PASS Card/News/Reaction models are deterministic and spectator-aware');
