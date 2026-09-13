import assert from 'node:assert/strict';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import { buildPresentationModel } from '../src/ui/presentationModel';
import { routeFeedbackCopy } from '../src/ui/routeFeedback';

const match = createInitialMatchState({
  boardId: 'reaction-route-023',
  startNodeId: 0,
  playerNames: ['Ron', 'Bích', 'Hưng', 'Mây'],
  seed: 2301,
});

function cardEvent(seq: number, cardId: string, title: string, actorId = 0): MatchEvent {
  return {
    seq,
    type: 'card_play',
    turnNumber: 3,
    playerIndex: actorId,
    phase: 'CARD_ACTION',
    revision: 9,
    rngCalls: 6,
    actorId,
    data: {
      cardId,
      title,
      rarity: 'R',
      impact: '⭐⭐',
      description: '0.1.23 reaction probe',
      summary: 'probe',
      amount: 10,
      targetId: 1,
      spectatorId: 2,
      reactionEventId: 'CARD_ATTACK_DEMO',
      affectedPlayerIds: '0,1',
    },
  };
}

const steal = buildPresentationModel(cardEvent(1, 'ACT_001', 'Trượt Tay'), match.players);
assert(steal);
assert.equal(steal.reactionEventId, 'CARD_STEAL_023');
assert.equal(steal.reactions.length, 3);
assert.deepEqual(steal.reactions.map((line) => line.speakerRole), ['caster', 'target', 'spectator']);
assert.match(steal.reactions[0]?.text ?? '', /Bích|10B\$/);

const block = buildPresentationModel(cardEvent(2, 'ACT_006', 'Khóa Mõm'), match.players);
assert(block);
assert.equal(block.reactionEventId, 'CARD_BLOCK_023');
assert.equal(block.reactions.length, 3);
assert.match(block.reactions[1]?.text ?? '', /khóa|cấm|kiểm duyệt|Một lượt/i);

const group = buildPresentationModel(cardEvent(3, 'ACT_010', 'Triệu Hồi Hắc Ín'), match.players);
assert(group);
assert.equal(group.reactionEventId, 'CARD_GROUP_CURSE_023');
assert.equal(group.reactions.length, 2);
assert.deepEqual(group.reactions.map((line) => line.speakerRole), ['caster', 'spectator']);

const swap = buildPresentationModel(cardEvent(4, 'ACT_012', 'Chuyển Sinh Đổi Vận'), match.players);
assert(swap);
assert.equal(swap.reactionEventId, 'CARD_SWAP_023');
assert.equal(swap.reactions.length, 3);
assert.match(swap.reactions[0]?.text ?? '', /Bích|đổi|ví/i);

const oddRoute = routeFeedbackCopy(5, 'PHỐ CHÍNH');
assert.equal(oddRoute.parityLabel, 'LẺ');
assert.equal(oddRoute.title, 'PHỐ CHÍNH');
assert.match(oddRoute.detail, /5.*LẺ.*tự động rẽ/);

const evenRoute = routeFeedbackCopy(4, 'HẺM TẮT');
assert.equal(evenRoute.parityLabel, 'CHẴN');
assert.equal(evenRoute.title, 'HẺM TẮT');
assert.match(evenRoute.detail, /4.*CHẴN.*tự động rẽ/);

console.log('[reaction-route-023] PASS effect-specific Card banter + deterministic odd/even route feedback');
