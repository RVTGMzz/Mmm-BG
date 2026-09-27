import assert from 'node:assert/strict';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import { gameSession } from '../src/core/session';
import {
  characterReactionLineCh04,
  reactionProfileIdForCharacterCh04,
} from '../src/core/characterReactionProfilesCh04';
import { buildPresentationModel } from '../src/ui/presentationModel';

const match = createInitialMatchState({
  boardId: 'character-reactions-ch04',
  startNodeId: 0,
  playerNames: ['Ron', 'Bích', 'Hưng', 'Mây'],
  seed: 40401,
});

function news(seq: number, actorId: number, summary: string, reactionEventId: string): MatchEvent {
  return {
    seq,
    type: 'news',
    turnNumber: 2,
    playerIndex: actorId,
    phase: 'RESOLVING_TILE',
    revision: 5,
    rngCalls: 2,
    actorId,
    data: {
      newsId: 'NEWS_CH04',
      title: 'Tin thử Character',
      description: 'Một biến cố vừa xảy ra trong thành phố.',
      summary,
      amount: 25,
      reactionEventId,
      spectatorId: (actorId + 1) % 4,
    },
  };
}

assert.equal(reactionProfileIdForCharacterCh04('starter-crybaby'), 'reaction.starter.crybaby.v01');
assert.equal(reactionProfileIdForCharacterCh04('starter-grumpy'), 'reaction.starter.grumpy.v01');
assert.equal(reactionProfileIdForCharacterCh04('starter-anxious'), 'reaction.starter.anxious.v01');
assert.equal(reactionProfileIdForCharacterCh04('starter-hyper'), 'reaction.starter.hyper.v01');
assert.equal(reactionProfileIdForCharacterCh04('secret-baby'), 'reaction.secret.baby.v01');
assert.equal(reactionProfileIdForCharacterCh04(undefined), undefined);

const baby = characterReactionLineCh04(
  'secret-baby',
  'loss',
  { amount: 25, speaker: 'Bé' },
  0,
);
assert(baby);
assert.equal(baby.expression, 'angry');
assert.match(baby.text, /25B\$|Vũ trụ|quản lý/);

gameSession.reset();
const legacyBaseline = buildPresentationModel(
  news(9, 0, 'Ron mất 25B$.', 'NEWS_NEGATIVE_DEMO'),
  match.players,
);
assert(legacyBaseline);
const legacyBaselineText = legacyBaseline.reactions[0]?.text ?? '';
assert.ok(legacyBaselineText.length > 0);

gameSession.setCharacter(0, 'starter-crybaby');
gameSession.setCharacter(1, 'starter-grumpy');

const loss = buildPresentationModel(
  news(10, 0, 'Ron mất 25B$.', 'NEWS_NEGATIVE_DEMO'),
  match.players,
);
assert(loss);
assert.equal(loss.reactions[0]?.speakerName, 'Ron');
assert.match(loss.reactions[0]?.text ?? '', /25B\$|bi kịch|Trời ơi|ví tui/i);
assert.equal(loss.reactions[0]?.expression, 'angry');
assert.equal(loss.reactions[1]?.speakerName, 'Bích');
assert.match(loss.reactions[1]?.text ?? '', /Tự xử|Biết ngay/i);

gameSession.setCharacter(0, 'starter-hyper');
const hyperLoss = buildPresentationModel(
  news(11, 0, 'Ron mất 25B$.', 'NEWS_NEGATIVE_DEMO'),
  match.players,
);
assert(hyperLoss);
assert.match(hyperLoss.reactions[0]?.text ?? '', /25B\$|quẩy|nguyên trận/i);
assert.notEqual(hyperLoss.reactions[0]?.text, loss.reactions[0]?.text);

gameSession.setCharacter(0, 'secret-baby');
const babyLoss = buildPresentationModel(
  news(12, 0, 'Ron mất 25B$.', 'NEWS_NEGATIVE_DEMO'),
  match.players,
);
assert(babyLoss);
assert.match(babyLoss.reactions[0]?.text ?? '', /Vũ trụ|quản lý|25B\$/i);

// Old sessions/saves without Character IDs retain the existing reaction content.
gameSession.setCharacter(0, undefined);
gameSession.setCharacter(1, undefined);
const legacy = buildPresentationModel(
  news(13, 0, 'Ron mất 25B$.', 'NEWS_NEGATIVE_DEMO'),
  match.players,
);
assert(legacy);
assert.equal(
  legacy.reactions[0]?.text ?? '',
  legacyBaselineText,
  'clearing Character ID must restore the exact legacy reaction resolver for that seat',
);

const moduleSource = await import('node:fs').then(({ readFileSync }) =>
  readFileSync('src/core/characterReactionProfilesCh04.ts', 'utf8')
);
const presentationSource = await import('node:fs').then(({ readFileSync }) =>
  readFileSync('src/ui/presentationModel.ts', 'utf8')
);
assert.doesNotMatch(moduleSource, /Math\.random\s*\(/);
assert.match(presentationSource, /gameSession\.getCharacterId\(speakerId\)/);
assert.match(presentationSource, /characterReactionLineCh04/);
assert.match(presentationSource, /if \(gameSession\.getCharacterId\(actorId\)\) return undefined/);

gameSession.reset();
console.log('[character-reactions-ch04] PASS Character-selected contextual reactions with deterministic legacy fallback and no passive mutation');
