import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp.json' with { type: 'json' };
import { CANONICAL_PRESENTATION_0561 } from '../src/ui/canonicalPresentation0561';
import { applyNewsEffect, type NewsDefinition } from '../src/core/news';
import type { CardDefinition } from '../src/core/cards';
import type { PlayerState } from '../src/core/types';

const globalNews: NewsDefinition = {
  id: 'NEWS_TEST_GLOBAL_POSITIVE',
  title: 'Global',
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
const scene069Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene069.ts', import.meta.url), 'utf8');
const scene0701Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0701.ts', import.meta.url), 'utf8');
assert(mainSource.includes('CareerMinigameBoardScene0701 as ActiveBoardScene'), 'later presentation wrappers may advance the launcher while retaining 0.1.58 beneath them');
assert(scene0701Source.includes('extends CareerMinigameBoardScene069'), '0.1.70.1 must preserve the validated chain through 0.1.69');
assert(!scene0701Source.includes('Math.random'));
assert(scene069Source.includes('extends CareerMinigameBoardScene0682'), '0.1.69 must remain above the retained authority/presentation chain');
assert(!scene069Source.includes('Math.random'));
assert(!scene069Source.includes('submitIntent('));
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

console.log('[news-card-depth-058] PASS held-card special relocation + immediate global News + replay/checksum + vocabulary retained through 0.1.70.1');