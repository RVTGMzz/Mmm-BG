import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
} from '../src/core/authority';
import type { BrowserSessionConfig } from '../src/core/browserSession';
import type { CardDefinition } from '../src/core/cards';
import type { MatchEvent } from '../src/core/matchState';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';
import { presentationTimingForModel } from '../src/ui/presentationFlowPolicy';
import { buildPresentationModel } from '../src/ui/presentationModel';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const players = ['Ron', 'CPU 2', 'CPU 3', 'CPU 4'];

const authority = createEmptyHostAuthority(
  {
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: players,
    seed: 19019,
  },
  { board: BOARD, cards: CARDS, news: NEWS },
);

const receipt = submitClientIntent(authority, {
  intentId: 'board-flow-roll-1',
  clientId: 'solo',
  actorId: 0,
  type: 'roll',
  observedCommandSeq: hostAuthorityCommandSeq(authority),
  data: {},
});
assert.equal(receipt.status, 'accepted');

const diceEvent = authority.state.eventLog.find((event) => event.type === 'dice_roll');
const moveEvents = authority.state.eventLog.filter((event) => event.type === 'move_step');
assert(diceEvent, 'roll must emit a dice_roll presentation event');
assert(moveEvents.length > 0, 'roll must emit at least one move_step presentation event');
assert(moveEvents.every((event) => Number(event.data.toNodeId) >= 0), 'move_step must identify its destination node');
assert(diceEvent.seq < moveEvents[0].seq, 'dice animation must precede step movement');

const diceModel = buildPresentationModel(diceEvent, authority.state.players);
const stepModel = buildPresentationModel(moveEvents[0], authority.state.players);
assert.equal(diceModel?.kind, 'dice_roll');
assert.equal(stepModel?.kind, 'move_step');

function event(
  seq: number,
  actorId: number,
  affectedPlayerIds: string,
  type = 'tile_land',
): MatchEvent {
  return {
    seq,
    type,
    turnNumber: 1,
    playerIndex: actorId,
    phase: 'RESOLVING_TILE',
    revision: 1,
    rngCalls: 1,
    actorId,
    data: type === 'tile_land'
      ? { nodeId: 1, tileType: 'money', value: 50, affectedPlayerIds }
      : {
          newsId: 'NEWS_DEMO_GLOBAL',
          title: 'Cả Bàn Có Biến',
          rarity: 'SR',
          impact: '⭐⭐⭐',
          description: 'Một thông báo dài ảnh hưởng toàn bộ người chơi.',
          summary: 'Tất cả người chơi cùng chịu hiệu ứng.',
          amount: 40,
          affectedPlayerIds,
          reactionEventId: null,
        },
  };
}

const humanModel = buildPresentationModel(event(100, 0, '0'), authority.state.players);
const cpuModel = buildPresentationModel(event(101, 1, '1'), authority.state.players);
const globalModel = buildPresentationModel(event(102, 2, '0,1,2,3', 'news'), authority.state.players);
assert(humanModel && cpuModel && globalModel);

const oneHumanThreeCpu: BrowserSessionConfig = {
  mode: 'solo', roomCode: '', clientId: 'solo', seatId: 0, cpuSeatIds: [1, 2, 3],
};
const hotseat: BrowserSessionConfig = {
  mode: 'solo', roomCode: '', clientId: 'solo', seatId: 0, cpuSeatIds: [],
};
const host: BrowserSessionConfig = {
  mode: 'host', roomCode: 'ME019', clientId: 'host', seatId: 0, cpuSeatIds: [],
};

const humanTiming = presentationTimingForModel(humanModel, oneHumanThreeCpu, 4, 1200);
assert.equal(humanTiming.mode, 'manual', 'single human must acknowledge events that affect them');
assert.equal(humanTiming.autoCloseMs, undefined, 'player-related solo event must not silently disappear');

const cpuTiming = presentationTimingForModel(cpuModel, oneHumanThreeCpu, 4, 1200);
assert.equal(cpuTiming.mode, 'auto', 'CPU-only event should auto-close');
assert(cpuTiming.skipAfterMs >= 3000, 'CPU notice should not be skippable before 3 seconds');
assert((cpuTiming.autoCloseMs ?? Infinity) <= 6000, 'CPU notice must close within 6 seconds');

const hotseatTiming = presentationTimingForModel(humanModel, hotseat, 4, 1200);
assert.equal(hotseatTiming.mode, 'auto', 'human-vs-human/hotseat notice should not block forever');
assert((hotseatTiming.autoCloseMs ?? Infinity) <= 6000, 'multiplayer notice must close within 6 seconds');

const hostTiming = presentationTimingForModel(humanModel, host, 4, 1200);
assert.equal(hostTiming.mode, 'auto');
assert((hostTiming.autoCloseMs ?? Infinity) <= 6000);

const globalTiming = presentationTimingForModel(globalModel, oneHumanThreeCpu, 4, 4200);
assert.equal(globalTiming.mode, 'auto', 'global event uses bounded display even when it includes the human');
assert(globalTiming.skipAfterMs >= 4200, 'global event may only be skipped after its text is revealed');
assert((globalTiming.autoCloseMs ?? Infinity) <= 10000, 'global/long event must stay under the 10 second cap');

console.log('[board-flow-019] PASS dice → step movement + audience-aware 3s/6s/10s timing');
