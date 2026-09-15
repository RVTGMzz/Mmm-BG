import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import {
  createEmptyHostAuthority,
  createHostAuthority,
  hostAuthorityChecksum,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntentType,
  type HostAuthority,
} from '../src/core/authority';
import {
  applyCardEffect,
  getValidTargetsForCard,
  type CardDefinition,
} from '../src/core/cards';
import { applyNewsEffect, type NewsDefinition } from '../src/core/news';
import type { MatchEventValue } from '../src/core/matchState';
import type { BoardDefinition, PlayerState } from '../src/core/types';
import { CANONICAL_PRESENTATION_0561 } from '../src/ui/canonicalPresentation0561';

let serial = 0;
function submit(
  authority: HostAuthority,
  type: ClientIntentType,
  data: Record<string, MatchEventValue> = {},
) {
  const actor = authority.state.players[authority.state.turn.currentPlayerIndex]!;
  serial += 1;
  return submitClientIntent(authority, {
    intentId: `depth-058-${serial}`,
    clientId: 'depth-058-test',
    actorId: actor.id,
    type,
    observedCommandSeq: hostAuthorityCommandSeq(authority),
    data,
  });
}

function fixtureBoard(tileType: 'card' | 'news'): BoardDefinition {
  return {
    id: `depth-058-${tileType}`,
    name: `0.1.58 ${tileType} authority fixture`,
    startNodeId: 0,
    nodes: [
      { id: 0, x: 0, y: 0, type: 'normal' },
      { id: 1, x: 20, y: 0, type: tileType },
      { id: 12, x: 60, y: 0, type: 'normal' },
      { id: 34, x: 60, y: 40, type: 'normal' },
      { id: 100, x: 100, y: 0, type: 'normal', contentId: 'SPECIAL_JAIL_HOLD' },
      { id: 101, x: 110, y: 0, type: 'normal' },
      { id: 102, x: 120, y: 0, type: 'normal' },
      { id: 103, x: 130, y: 0, type: 'normal' },
      { id: 110, x: 100, y: 40, type: 'normal', contentId: 'SPECIAL_HOSPITAL_HOLD' },
      { id: 111, x: 110, y: 40, type: 'normal' },
      { id: 112, x: 120, y: 40, type: 'normal' },
      { id: 113, x: 130, y: 40, type: 'normal' },
    ],
    edges: [{ from: 0, to: 1, route: 'main' }],
  };
}

const jailCard: CardDefinition = {
  id: 'TEST_SEND_JAIL',
  title: 'Mời Lên Phường',
  rarity: 'R',
  dropWeight: 1,
  impact: '⭐⭐',
  description: 'Đưa target tới Đồn.',
  targetMode: 'single_other',
  timing: 'before_roll',
  effect: { type: 'send_to_special', location: 'jail' },
  faceSlots: [],
};

const hospitalCard: CardDefinition = {
  ...jailCard,
  id: 'TEST_SEND_HOSPITAL',
  title: 'Giường Bệnh Đã Đặt',
  effect: { type: 'send_to_special', location: 'hospital' },
};

const unitPlayers: PlayerState[] = [
  { id: 0, name: 'P1', nodeId: 4, money: 200, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0 },
  { id: 1, name: 'P2', nodeId: 9, money: 200, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0 },
];
const jailResolution = applyCardEffect(jailCard, unitPlayers[0]!, unitPlayers, unitPlayers[1]);
assert.equal(unitPlayers[1]!.specialHold, 'jail');
assert.equal(unitPlayers[1]!.nodeId, 100);
assert.equal(jailResolution.relocatedPlayerId, 1);
assert.equal(jailResolution.relocatedToNodeId, 100);
assert.throws(
  () => applyCardEffect(hospitalCard, unitPlayers[0]!, unitPlayers, unitPlayers[1]),
  /already held/i,
  'special relocation must not stack Jail/Hospital on an already-held target',
);
assert.equal(
  getValidTargetsForCard(hospitalCard, unitPlayers, 0).length,
  0,
  'special relocation picker must hide already-held targets',
);

const cardBoard = fixtureBoard('card');
const cardRuntime = { board: cardBoard, cards: [jailCard], news: [] as NewsDefinition[] };
const cardAuthority = createEmptyHostAuthority(
  { boardId: cardBoard.id, startNodeId: 0, playerNames: ['P1', 'P2'], seed: 5801 },
  cardRuntime,
);
assert.equal(submit(cardAuthority, 'roll').status, 'accepted');
assert.equal(submit(cardAuthority, 'roll').status, 'accepted');
assert(cardAuthority.state.players[0]!.handCardIds.includes(jailCard.id));
const cardReceipt = submit(cardAuthority, 'play_card', { cardId: jailCard.id, targetId: 1, choice: null });
assert.equal(cardReceipt.status, 'accepted');
assert.equal(cardAuthority.state.players[1]!.specialHold, 'jail');
assert.equal(cardAuthority.state.players[1]!.nodeId, 100);
assert(!cardAuthority.state.players[0]!.handCardIds.includes(jailCard.id), 'resolved card must be consumed once');
const cardReplay = createHostAuthority(cardAuthority.source, cardRuntime);
assert.equal(hostAuthorityChecksum(cardReplay), hostAuthorityChecksum(cardAuthority), 'card relocation must replay to identical checksum');

const hospitalNews: NewsDefinition = {
  id: 'TEST_NEWS_HOSPITAL',
  title: 'Xe Cứu Thương Bắt Nhầm Người',
  rarity: 'R',
  dropWeight: 1,
  impact: '⭐⭐',
  description: 'Một đối thủ bị đưa tới Bệnh Viện.',
  targetMode: 'other_player',
  effect: { type: 'send_other_to_special', location: 'hospital', targetOffset: 1 },
};
const newsBoard = fixtureBoard('news');
const newsRuntime = { board: newsBoard, cards: [] as CardDefinition[], news: [hospitalNews] };
const newsAuthority = createEmptyHostAuthority(
  { boardId: newsBoard.id, startNodeId: 0, playerNames: ['P1', 'P2', 'P3', 'P4'], seed: 5802 },
  newsRuntime,
);
assert.equal(submit(newsAuthority, 'roll').status, 'accepted');
assert.equal(newsAuthority.state.players[2]!.specialHold, 'hospital');
assert.equal(newsAuthority.state.players[2]!.nodeId, 110);
const newsEvent = newsAuthority.state.eventLog.find((event) => event.type === 'news');
assert(newsEvent);
assert.match(String(newsEvent.data.summary), /P3.*Bệnh Viện/);
const newsReplay = createHostAuthority(newsAuthority.source, newsRuntime);
assert.equal(hostAuthorityChecksum(newsReplay), hostAuthorityChecksum(newsAuthority), 'News relocation must replay to identical checksum');

const globalNews: NewsDefinition = {
  id: 'TEST_GLOBAL_GAIN',
  title: 'Ngày Hội Hoàn Tiền',
  rarity: 'N',
  dropWeight: 1,
  impact: '⭐',
  description: 'Cả bàn +15B$.',
  targetMode: 'all_players',
  effect: { type: 'money_delta_all', amount: 15 },
};
const globalPlayers: PlayerState[] = [
  { id: 0, name: 'P1', nodeId: 0, money: 200, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0 },
  { id: 1, name: 'P2', nodeId: 0, money: 180, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0 },
];
const globalResolution = applyNewsEffect(globalNews, globalPlayers[0]!, globalPlayers);
assert.deepEqual(globalPlayers.map((player) => player.money), [215, 195]);
assert.deepEqual(globalResolution.affectedPlayerIds, [0, 1]);

const runtimeCards = cardsJson as CardDefinition[];
const runtimeNews = newsJson as NewsDefinition[];
assert(runtimeCards.some((card) => card.id === 'ACT_017' && card.effect.type === 'send_to_special'));
assert(runtimeCards.some((card) => card.id === 'ACT_018' && card.effect.type === 'send_to_special'));
assert(runtimeNews.filter((news) => news.effect.type === 'send_other_to_special').length >= 3);
assert(runtimeNews.some((news) => news.effect.type === 'money_delta_all' && Number((news.effect as { amount?: number }).amount) > 0));

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const sceneSource = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene058.ts', import.meta.url), 'utf8');
const scene059Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene059.ts', import.meta.url), 'utf8');
const scene060Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene060.ts', import.meta.url), 'utf8');
const scene061Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene061.ts', import.meta.url), 'utf8');
assert(mainSource.includes('CareerMinigameBoardScene061 as ActiveBoardScene'), 'later runtime wrappers may advance the launcher while retaining 0.1.58 beneath them');
assert(scene061Source.includes('extends CareerMinigameBoardScene060'), '0.1.61 must retain the 0.1.60 pacing layer');
assert(scene060Source.includes('extends CareerMinigameBoardScene059'), '0.1.60 must retain 0.1.59 beneath the pacing layer');
assert(scene059Source.includes('extends CareerMinigameBoardScene058'), '0.1.59 must retain the 0.1.58 relocation layer');
assert(sceneSource.includes('extends CareerMinigameBoardScene057'));
assert(sceneSource.includes("event.type === 'card_play' || event.type === 'news'"));
assert(!sceneSource.includes('Math.random'));
assert(!CANONICAL_PRESENTATION_0561.header.includes('0.1.25'));
assert.equal(CANONICAL_PRESENTATION_0561.version, '0.1.61');

const newCopy = JSON.stringify([runtimeCards.slice(-6), runtimeNews.slice(-8)]);
assert(!newCopy.includes('Tiên Tri'));
assert(!newCopy.includes('Phép Thuật'));

console.log('[news-card-depth-058] PASS held-card special relocation + immediate global News + replay/checksum + vocabulary retained beneath 0.1.61');
