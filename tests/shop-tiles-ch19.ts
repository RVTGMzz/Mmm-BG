import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import { createEmptyHostAuthority, hostAuthorityCommandSeq, submitClientIntent, type HostAuthority } from '../src/core/authority';
import { isBoardNodeLockedForShuffle071 } from '../src/core/lapShuffle071';
import { SHOPS_CH19, pickShopEventCh19, shopForNodeCh19 } from '../src/core/shopTilesCh19';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;

// Six shops, each on exactly one canonical tile, each locked to its building.
assert.equal(SHOPS_CH19.length, 6);
for (const shop of SHOPS_CH19) {
  const nodes = BOARD.nodes.filter((node) => node.contentId === shop.contentId);
  assert.equal(nodes.length, 1, `${shop.contentId} must sit on exactly one tile`);
  assert.equal(isBoardNodeLockedForShuffle071(BOARD, nodes[0]), true, `${shop.contentId} must never shuffle away from its building`);
  assert.ok(shop.events.length >= 3 && shop.events.some((e) => e.amount > 0) && shop.events.some((e) => e.amount < 0), `${shop.contentId} needs good and bad stories`);
}
// weighted pick covers every event and is a pure function of the HOST random number
for (const shop of SHOPS_CH19) {
  const seen = new Set<string>();
  for (let i = 0; i < 200; i++) seen.add(pickShopEventCh19(shop, i / 200).id);
  assert.equal(seen.size, shop.events.length, `${shop.contentId}: every event reachable`);
  assert.equal(pickShopEventCh19(shop, 0.37).id, pickShopEventCh19(shop, 0.37).id);
}

// Landing on a shop tile resolves one shop event through the authoritative host.
const shopBoard: BoardDefinition = {
  id: 'shop-ch19-fixture', name: 'CH-19 shop fixture', startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'ready', contentId: 'READY' },
    ...[1, 2, 3, 4, 5, 6].map((id) => ({ id, x: id * 10, y: 0, type: 'normal' as const, contentId: SHOPS_CH19[id - 1].contentId })),
    { id: 7, x: 70, y: 0, type: 'normal' as const },
  ],
  edges: [0, 1, 2, 3, 4, 5, 6].map((from) => ({ from, to: from + 1, route: 'main' as const })).concat([{ from: 7, to: 0, route: 'main' }]),
};
let serial = 0;
const roll = (authority: HostAuthority) => {
  const actor = authority.state.players[authority.state.turn.currentPlayerIndex]!;
  serial += 1;
  return submitClientIntent(authority, { intentId: `shop-ch19-${serial}`, clientId: 'shop-ch19-test', actorId: actor.id, type: 'roll', observedCommandSeq: hostAuthorityCommandSeq(authority), data: {} });
};
for (const seed of [1, 2, 3, 4, 5]) {
  const authority = createEmptyHostAuthority({ boardId: shopBoard.id, startNodeId: 0, playerNames: ['Ron'], seed }, { board: shopBoard, cards: [], news: [] });
  const before = authority.state.players[0]!.money;
  assert.equal(roll(authority).status, 'accepted');
  const player = authority.state.players[0]!;
  const node = shopBoard.nodes.find((n) => n.id === player.nodeId)!;
  const shop = shopForNodeCh19(node);
  assert.ok(shop, `seed ${seed}: a 1..6 roll lands on a shop`);
  const event = authority.state.eventLog.find((e) => e.type === 'shop_event');
  assert.ok(event, `seed ${seed}: shop event emitted`);
  assert.equal(event!.data.contentId, shop!.contentId);
  const story = shop!.events.find((e) => e.id === event!.data.shopEventId)!;
  assert.ok(story);
  assert.equal(Number(event!.data.amount), story.amount);
  // passives may soften a loss, but the shop amount itself is applied
  assert.equal(Number(event!.data.resultMoney), before + story.amount);
}

console.log('[shop-tiles-ch19] PASS six shop tiles, locked to their buildings, HOST-RNG shop events');
