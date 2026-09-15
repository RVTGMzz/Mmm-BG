import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SFX_GAIN_064 } from '../src/audio/sfxController';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type HostAuthority,
} from '../src/core/authority';
import {
  specialCorridorPath064,
  specialReleasePath057,
} from '../src/core/specialLocations057';
import type { BoardDefinition, BoardNode } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const scene064 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene064.ts', import.meta.url), 'utf8');
const scene065 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene065.ts', import.meta.url), 'utf8');
const camera0632 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0632.ts', import.meta.url), 'utf8');

assert(mainSource.includes('CareerMinigameBoardScene065 as ActiveBoardScene'));
assert(mainSource.includes('CareerMinigameBoardScene064'));
assert(scene065.includes('extends CareerMinigameBoardScene064'));
assert(mainSource.includes('CareerMinigameBoardScene0634 as ActiveBoardScene'));
assert(scene064.includes('extends CareerMinigameBoardScene0634'));
assert(scene064.includes('TILE_SCALE_064 = 1.5'));
assert(scene064.includes('OVERVIEW_ZOOM_064 = 0.46'));
assert(scene064.includes('movementStepDisposition'));
assert(camera0632.includes('resolveCameraActor0632'), 'confirmed 0.1.63.2 movement-actor camera lock must remain inherited');
assert(camera0632.includes('centerOn(token.x, token.y)'), 'camera center lock must remain untouched');

// 0.1.64 expanded-board geometry: large world, larger circles, and real air gaps.
const xs = BOARD.nodes.map((node) => node.x);
const ys = BOARD.nodes.map((node) => node.y);
assert(Math.max(...xs) - Math.min(...xs) >= 2300, 'board width must be roughly doubled');
assert(Math.max(...ys) - Math.min(...ys) >= 1000, 'board height must be roughly doubled');

function radius064(node: BoardNode): number {
  const contentId = node.contentId ?? '';
  if (contentId === 'SPECIAL_JAIL_HOLD' || contentId === 'SPECIAL_HOSPITAL_HOLD') return 36 * 1.5;
  if (
    node.type === 'ready' ||
    contentId === 'SPECIAL_JAIL_GATE' ||
    contentId === 'SPECIAL_HOSPITAL_GATE' ||
    contentId === 'SPECIAL_LOTTERY'
  ) return 33 * 1.5;
  if (node.feature) return 31 * 1.5;
  return 27 * 1.5;
}

let minimumGap = Number.POSITIVE_INFINITY;
let minimumPair = '';
for (let leftIndex = 0; leftIndex < BOARD.nodes.length; leftIndex += 1) {
  const left = BOARD.nodes[leftIndex]!;
  for (let rightIndex = leftIndex + 1; rightIndex < BOARD.nodes.length; rightIndex += 1) {
    const right = BOARD.nodes[rightIndex]!;
    const distance = Math.hypot(left.x - right.x, left.y - right.y);
    const gap = distance - radius064(left) - radius064(right);
    if (gap < minimumGap) {
      minimumGap = gap;
      minimumPair = `${left.id}/${right.id}`;
    }
  }
}
assert(minimumGap >= 12, `1.5x round spaces must not touch; closest ${minimumPair} gap=${minimumGap.toFixed(1)}px`);

// All six internal Jail/Hospital spaces are real -20 B$ landing tiles.
const penaltyIds = [101, 102, 103, 111, 112, 113];
for (const id of penaltyIds) {
  const node = BOARD.nodes.find((entry) => entry.id === id);
  assert(node, `missing penalty node ${id}`);
  assert.equal(node.type, 'money', `node ${id} must be a money tile`);
  assert.equal(node.value, -20, `node ${id} must subtract 20 B$`);
}
assert.deepEqual(specialReleasePath057('jail'), [], 'release check must not auto-walk the Jail corridor');
assert.deepEqual(specialReleasePath057('hospital'), [], 'release check must not auto-walk the Hospital corridor');
assert.deepEqual(specialCorridorPath064('jail'), [101, 102, 103, 12]);
assert.deepEqual(specialCorridorPath064('hospital'), [111, 112, 113, 34]);

// Exact human-reported flow: enter Jail -> next turn release succeeds -> remain at
// TÙ -> NEW movement D6=1 -> walk onto J1 -> only then lose 20 B$.
const releaseFixture: BoardDefinition = {
  id: 'release-064-fixture',
  name: '0.1.64 release-in-place fixture',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'normal' },
    { id: 1, x: 10, y: 0, type: 'normal', contentId: 'SPECIAL_JAIL_GATE' },
    { id: 100, x: 20, y: 0, type: 'normal', contentId: 'SPECIAL_JAIL_HOLD' },
    { id: 101, x: 30, y: 0, type: 'money', contentId: 'JAIL_EXIT_1', value: -20 },
    { id: 102, x: 40, y: 0, type: 'money', contentId: 'JAIL_EXIT_2', value: -20 },
    { id: 103, x: 50, y: 0, type: 'money', contentId: 'JAIL_EXIT_3', value: -20 },
    { id: 12, x: 60, y: 0, type: 'normal' },
  ],
  edges: [
    { from: 0, to: 1, route: 'main' },
    { from: 100, to: 101, route: 'branch' },
    { from: 101, to: 102, route: 'branch' },
    { from: 102, to: 103, route: 'branch' },
    { from: 103, to: 12, route: 'branch' },
  ],
};

let serial = 0;
function roll(authority: HostAuthority) {
  const actor = authority.state.players[authority.state.turn.currentPlayerIndex]!;
  serial += 1;
  return submitClientIntent(authority, {
    intentId: `release-064-${serial}`,
    clientId: 'release-064-test',
    actorId: actor.id,
    type: 'roll',
    observedCommandSeq: hostAuthorityCommandSeq(authority),
    data: {},
  });
}

// xorshift seed 2 begins 1,1,1: enter Jail, release success, fresh movement 1.
const authority = createEmptyHostAuthority(
  { boardId: releaseFixture.id, startNodeId: 0, playerNames: ['Ron'], seed: 2 },
  { board: releaseFixture, cards: [], news: [] },
);
assert.equal(roll(authority).status, 'accepted');
assert.equal(authority.state.players[0]!.nodeId, 100);
assert.equal(authority.state.players[0]!.specialHold, 'jail');
assert.equal(authority.state.players[0]!.money, 200);

assert.equal(roll(authority).status, 'accepted');
assert.equal(authority.state.players[0]!.nodeId, 100, 'release success must remain standing at TÙ');
assert.equal(authority.state.players[0]!.specialHold, undefined);
assert.equal(authority.state.players[0]!.money, 200, 'release itself must not charge corridor money');
assert.equal(authority.state.turn.phase, 'PRE_ROLL_ACTION');
assert.equal(authority.state.turn.lastRoll, null, 'release D6 must be discarded');

assert.equal(roll(authority).status, 'accepted');
assert.equal(authority.state.players[0]!.nodeId, 101, 'fresh D6=1 must move from TÙ to J1');
assert.equal(authority.state.players[0]!.money, 180, 'J1 penalty must apply only after landing');
assert(authority.state.eventLog.some((event) => event.type === 'money_tile' && event.data.nodeId === 101 && event.data.amount === -20));

// Audio mix requested by human playtest.
assert.equal(SFX_GAIN_064.card_draw, 0.8);
assert.equal(SFX_GAIN_064.card_play, 0.8);
assert.equal(SFX_GAIN_064.step, 1.3);

console.log(`[expanded-board-release-audio-064] PASS inherited under 0.1.65 width=${Math.round(Math.max(...xs) - Math.min(...xs))} height=${Math.round(Math.max(...ys) - Math.min(...ys))} minGap=${minimumGap.toFixed(1)}px • release-in-place • J/H=-20 • card=0.8 step=1.3`);
