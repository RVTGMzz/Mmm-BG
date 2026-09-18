import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { browserSession } from '../src/core/browserSession';
import { appendMatchEvent, createInitialMatchState } from '../src/core/matchState';
import { buildPresentationModel, type PresentationEventModel } from '../src/ui/presentationModel';
import { presentationParityFingerprint } from '../src/ui/legacyDeckPresentation';

const state = createInitialMatchState({
  boardId: 'parity-047',
  startNodeId: 0,
  playerNames: ['Ron', 'P2', 'P3', 'P4'],
  seed: 470047,
});

appendMatchEvent(state, 'card_draw', {
  cardId: 'CARD_TEST',
  title: 'Thôi miên',
  rarity: 'R',
  impact: '✨',
  description: 'Một lá bài thử nghiệm.',
  affectedPlayerIds: '0',
}, 0);
appendMatchEvent(state, 'card_play', {
  cardId: 'CARD_TEST',
  title: 'Thôi miên',
  rarity: 'R',
  impact: '✨',
  description: 'Kích hoạt lên mục tiêu.',
  summary: 'Hiệu ứng đã resolve.',
  targetId: 1,
  affectedPlayerIds: '0,1',
}, 0);
appendMatchEvent(state, 'news', {
  newsId: 'NEWS_TEST',
  title: 'Mùa Xuân',
  rarity: 'SR',
  impact: '📰',
  description: 'Một Tin Tức thử nghiệm.',
  summary: 'Cả bàn nhận cùng sự kiện.',
  affectedPlayerIds: '0,1,2,3',
}, 2);
appendMatchEvent(state, 'ready_pass', {
  amount: 35,
  jobTitle: 'Ca Sỹ',
  jobIcon: '🎤',
  jobLevel: 1,
  affectedPlayerIds: '3',
}, 3);

function buildModels(): PresentationEventModel[] {
  return state.eventLog
    .map((event) => buildPresentationModel(event, state.players))
    .filter((model): model is PresentationEventModel => Boolean(model));
}

browserSession.configureHost('ME047');
const hostModels = buildModels();
const hostFingerprint = presentationParityFingerprint(hostModels);

browserSession.configureClient('ME047', 1);
const clientModels = buildModels();
const clientFingerprint = presentationParityFingerprint(clientModels);

assert.equal(
  clientFingerprint,
  hostFingerprint,
  'HOST and CLIENT must derive the same presentation fingerprint from one authoritative event stream',
);

assert(hostModels.some((model) => model.kind === 'news'), 'news technical event must build a presentation model');
assert(hostModels.some((model) => model.kind === 'card_draw'), 'card_draw technical event must build a presentation model');
assert(hostModels.some((model) => model.kind === 'card_play'), 'card_play technical event must build a presentation model');
assert(state.eventLog.some((event) => event.type === 'news'), 'technical news event name must remain unchanged');
assert(state.eventLog.some((event) => event.type === 'card_draw'), 'technical card_draw event name must remain unchanged');
assert(state.eventLog.some((event) => event.type === 'card_play'), 'technical card_play event name must remain unchanged');

const paritySceneSource = await readFile('src/scenes/PresentationParityBoardScene.ts', 'utf8');
const wrapperSource = await readFile('src/scenes/CareerMinigameBoardScene047.ts', 'utf8');
assert(
  paritySceneSource.includes("if (source !== 'snapshot')") &&
  paritySceneSource.includes('event.seq >= beforeEventSeq'),
  'snapshot resync must not replay stale presentation and normal state packets must enqueue only fresh events',
);
assert(wrapperSource.includes('extends CareerMinigameBoardScene046'), 'archived 0.1.47 wrapper must retain the validated 0.1.46 chain');
assert(!wrapperSource.includes('submitIntent('), '0.1.47 presentation wrapper must not submit gameplay/system intents');
assert(!wrapperSource.includes('Math.random'), '0.1.47 presentation wrapper must not introduce presentation randomness');

console.log('[multiplayer-presentation-parity-047] PASS host/client fingerprint + stale snapshot guard');
