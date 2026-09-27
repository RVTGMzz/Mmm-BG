import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import { gameSession } from '../src/core/session';
import { buildPresentationModel } from '../src/ui/presentationModel';

const match = createInitialMatchState({
  boardId: 'character-moments-ch04b',
  startNodeId: 0,
  playerNames: ['Ron', 'Bích', 'Hưng', 'Mây'],
  seed: 40402,
});

function event(seq: number, type: string, data: MatchEvent['data']): MatchEvent {
  return {
    seq,
    type,
    turnNumber: 3,
    playerIndex: 0,
    phase: 'RESOLVING_TILE',
    revision: 9,
    rngCalls: 4,
    actorId: 0,
    data,
  };
}

gameSession.reset();
gameSession.setCharacter(0, 'starter-hyper');

const minigame = buildPresentationModel(
  event(20, 'minigame_tile', {
    title: 'MINI GAME!',
    description: 'Chuẩn bị thi.',
    impact: '🎮',
  }),
  match.players,
);
assert(minigame);
assert.equal(minigame.tileType, 'minigame');
assert.equal(minigame.reactions.length, 1);
assert.match(minigame.reactions[0]?.text ?? '', /MINI GAME|phần tui thích/i);
assert.equal(minigame.reactions[0]?.expression, 'happy');

const job = buildPresentationModel(
  event(21, 'job_offer', {
    title: '3 nghề đang chờ',
    description: 'Đổ D6 để nhận việc.',
    impact: '💼',
  }),
  match.players,
);
assert(job);
assert.equal(job.tileType, 'job');
assert.equal(job.reactions.length, 1);
assert.match(job.reactions[0]?.text ?? '', /Job|Đi làm/i);

const salary = buildPresentationModel(
  event(22, 'ready_pass', {
    amount: 80,
    jobTitle: 'Streamer',
    jobIcon: '📱',
    jobLevel: 1,
  }),
  match.players,
);
assert(salary);
assert.equal(salary.kind, 'ready_bonus');
assert.equal(salary.reactions.length, 1);
assert.match(salary.reactions[0]?.text ?? '', /80B\$|Tiền về/i);

const shuffle = buildPresentationModel(
  event(23, 'board_shuffle', {
    lap: 2,
    changedCount: 18,
  }),
  match.players,
);
assert(shuffle);
assert.equal(shuffle.kind, 'board_shuffle');
assert.equal(shuffle.reactions.length, 1);
assert.match(shuffle.reactions[0]?.text ?? '', /Đổi bàn|loạn|Tới đi/i);

// Character-less compatibility: these new moment reactions simply disappear.
gameSession.setCharacter(0, undefined);
const legacyJob = buildPresentationModel(
  event(24, 'job_offer', {
    title: '3 nghề đang chờ',
    description: 'Đổ D6 để nhận việc.',
  }),
  match.players,
);
assert(legacyJob);
assert.equal(legacyJob.reactions.length, 0);

const layer = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const profile = readFileSync('src/core/characterReactionProfilesCh04.ts', 'utf8');
const model = readFileSync('src/ui/presentationModel.ts', 'utf8');

assert.match(layer, /landingReactionEnd0704/);
assert.match(layer, /this\.showReaction\(model, line, index\)/);
assert.match(model, /characterMomentReactionCh04/);
assert.match(model, /isMiniGame \? 'minigame' : 'job'/);
assert.match(model, /characterMomentReactionCh04\(event, players, 'salary', amount\)/);
assert.match(model, /characterMomentReactionCh04\(event, players, 'shuffle'\)/);
assert.doesNotMatch(profile, /Math\.random\s*\(/);

gameSession.reset();
console.log('[character-reaction-moments-ch04b] PASS Job/Mini Game/salary/shuffle Character moments with safe landing reactions and no gameplay mutation');
