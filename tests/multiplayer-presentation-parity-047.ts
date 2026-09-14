import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { browserSession } from '../src/core/browserSession';
import { appendMatchEvent, createInitialMatchState } from '../src/core/matchState';
import { buildPresentationModel, type PresentationEventModel } from '../src/ui/presentationModel';
import {
  legacyDeckFamilyForKind,
  legacyDeckFormForKind,
  legacyDeckVisibleText,
  presentationParityFingerprint,
} from '../src/ui/legacyDeckPresentation';

const state = createInitialMatchState({
  boardId: 'parity-047',
  startNodeId: 0,
  playerNames: ['Ron', 'P2', 'P3', 'P4'],
  seed: 470047,
});

appendMatchEvent(state, 'card_draw', {
  cardId: 'SPELL_TEST',
  title: 'Thôi miên',
  rarity: 'R',
  impact: '✨',
  description: 'Một Phép Thuật thử nghiệm.',
  affectedPlayerIds: '0',
}, 0);
appendMatchEvent(state, 'card_play', {
  cardId: 'SPELL_TEST',
  title: 'Thôi miên',
  rarity: 'R',
  impact: '✨',
  description: 'Kích hoạt lên mục tiêu.',
  summary: 'Hiệu ứng đã resolve.',
  targetId: 1,
  affectedPlayerIds: '0,1',
}, 0);
appendMatchEvent(state, 'news', {
  newsId: 'PROPHECY_TEST',
  title: 'Mùa Xuân',
  rarity: 'SR',
  impact: '🔮',
  description: 'Một lời Tiên Tri thử nghiệm.',
  summary: 'Cả bàn nhận cùng lời sấm.',
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
  'HOST and CLIENT must derive the same visible presentation fingerprint from one authoritative event stream',
);

const prophecy = hostModels.find((model) => model.kind === 'news');
assert(prophecy, 'news technical event must still build a presentation model');
assert.equal(legacyDeckFamilyForKind(prophecy.kind), 'prophecy');
assert.equal(legacyDeckFormForKind(prophecy.kind), 'portrait', 'old Tiên Tri deck must use portrait form');
assert.equal(legacyDeckVisibleText(prophecy.eyebrow), 'TIÊN TRI • LỜI SẤM');

const spellDraw = hostModels.find((model) => model.kind === 'card_draw');
const spellPlay = hostModels.find((model) => model.kind === 'card_play');
assert(spellDraw && spellPlay, 'card technical events must still build presentation models');
assert.equal(legacyDeckFamilyForKind(spellDraw.kind), 'spell');
assert.equal(legacyDeckFormForKind(spellDraw.kind), 'landscape', 'old Phép Thuật deck must use landscape form');
assert.equal(legacyDeckFormForKind(spellPlay.kind), 'landscape');
assert.equal(legacyDeckVisibleText(spellDraw.eyebrow), 'PHÉP THUẬT • RÚT ĐƯỢC');
assert.equal(legacyDeckVisibleText(spellPlay.eyebrow), 'PHÉP THUẬT • KÍCH HOẠT');

assert(state.eventLog.some((event) => event.type === 'news'), 'technical news event name must remain unchanged');
assert(state.eventLog.some((event) => event.type === 'card_draw'), 'technical card_draw event name must remain unchanged');
assert(state.eventLog.some((event) => event.type === 'card_play'), 'technical card_play event name must remain unchanged');

const paritySceneSource = await readFile('src/scenes/PresentationParityBoardScene.ts', 'utf8');
const wrapperSource = await readFile('src/scenes/CareerMinigameBoardScene047.ts', 'utf8');
const pickerSource = await readFile('src/ui/CardHandPicker.ts', 'utf8');
const helperSource = await readFile('src/ui/legacyDeckPresentation.ts', 'utf8');
const mainSource = await readFile('src/main.ts', 'utf8');
const lobbySource = await readFile('src/scenes/LocalLobbyScene.ts', 'utf8');
const setupSource = await readFile('src/scenes/SetupScene.ts', 'utf8');

assert(
  paritySceneSource.includes("if (source !== 'snapshot')") &&
  paritySceneSource.includes('event.seq >= beforeEventSeq'),
  'snapshot resync must not replay stale presentation and normal state packets must enqueue only fresh events',
);
assert(wrapperSource.includes('extends CareerMinigameBoardScene046'), '0.1.47 must retain the validated 0.1.46 runtime chain');
assert(wrapperSource.includes("legacyDeckFormForKind(model.kind) !== 'portrait'"), 'runtime must apply portrait form only to the prophecy family');
assert(wrapperSource.includes('reshapeProphecyCard'), 'runtime must visibly reshape Tiên Tri into a portrait card');
assert(pickerSource.includes('CHỌN PHÉP THUẬT') && pickerSource.includes('286, 190'), 'Phép Thuật hand picker must use the new horizontal card treatment');
assert(helperSource.includes("if (kind === 'news') return 'prophecy'"), 'visible taxonomy must map technical news to Tiên Tri');
assert(helperSource.includes("kind === 'card_draw' || kind === 'card_play'"), 'visible taxonomy must map technical card events to Phép Thuật');
assert(!wrapperSource.includes('submitIntent('), '0.1.47 presentation wrapper must not submit gameplay/system intents');
assert(!wrapperSource.includes('Math.random'), '0.1.47 presentation wrapper must not introduce presentation randomness');
assert(mainSource.includes('CareerMinigameBoardScene047'), 'packaged runtime must use the 0.1.47 wrapper');
assert(lobbySource.includes('MVP 0.1.47') && setupSource.includes('MVP 0.1.47'), 'entry surfaces must identify 0.1.47');

console.log('[multiplayer-presentation-parity-047] PASS host/client fingerprint + prophecy portrait + spell landscape + stale snapshot guard');
