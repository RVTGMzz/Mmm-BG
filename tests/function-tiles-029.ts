import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json';
import functionTilesJson from '../src/content/core/function_tiles_mvp.json';
import { createEmptyHostAuthority, submitClientIntent } from '../src/core/authority';
import { resolveFunctionTileFoundation } from '../src/core/functionTiles';
import { createInitialMatchState, type MatchCommand, type MatchEvent } from '../src/core/matchState';
import { replayMatchCommands } from '../src/core/replay';
import type { BoardDefinition, BoardNode } from '../src/core/types';
import { buildPresentationModel } from '../src/ui/presentationModel';

const BOARD = boardJson as BoardDefinition;
const catalog = functionTilesJson as Array<{
  id: string;
  kind: 'minigame' | 'job';
  status: 'foundation';
}>;

const featureNodes = BOARD.nodes.filter((node) => node.feature);
assert.equal(featureNodes.length, 2, '0.1.29 board should expose exactly two function foundation nodes');
const miniNode = featureNodes.find((node) => node.feature === 'minigame');
const jobNode = featureNodes.find((node) => node.feature === 'job');
assert(miniNode, 'Mini Game foundation node missing');
assert(jobNode, 'Job foundation node missing');
assert.equal(miniNode.contentId, 'MINIGAME_SLOT_01');
assert.equal(jobNode.contentId, 'JOB_SLOT_01');

const catalogIds = new Set(catalog.map((entry) => entry.id));
assert.equal(catalogIds.size, catalog.length, 'function tile content IDs must stay unique');
for (const node of featureNodes) {
  assert(node.contentId && catalogIds.has(node.contentId), `board node ${node.id} references missing function content`);
}
assert(catalog.every((entry) => entry.status === 'foundation'), '0.1.29 must not pretend function content is playable yet');

const probe = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 129,
});
const player = probe.players[0]!;
const beforePlayer = JSON.stringify(player);
const rngBefore = probe.rng.calls;
const miniResolution = resolveFunctionTileFoundation(miniNode, player);
const jobResolution = resolveFunctionTileFoundation(jobNode, player);
assert.equal(miniResolution?.eventType, 'minigame_tile');
assert.equal(jobResolution?.eventType, 'job_tile');
assert.equal(JSON.stringify(player), beforePlayer, 'foundation resolver must not mutate player gameplay state');
assert.equal(probe.rng.calls, rngBefore, 'foundation resolver must consume zero gameplay RNG');

function presentationEvent(type: string, actorId: number, data: MatchEvent['data']): MatchEvent {
  return {
    seq: 1,
    type,
    turnNumber: 1,
    playerIndex: actorId,
    phase: 'RESOLVING_TILE',
    revision: 1,
    rngCalls: 1,
    actorId,
    data,
  };
}

const miniPresentation = buildPresentationModel(
  presentationEvent('minigame_tile', 0, {
    title: miniResolution!.title,
    impact: miniResolution!.impact,
    description: miniResolution!.description,
    summary: miniResolution!.summary,
    affectedPlayerIds: '0',
  }),
  probe.players,
);
assert(miniPresentation, 'Mini Game foundation event should have a visible presentation hook');
assert.equal(miniPresentation.kind, 'tile_land');
assert.equal(miniPresentation.tileType, 'minigame');
assert.match(miniPresentation.description, /tự động tiếp tục lượt/i);

const jobPresentation = buildPresentationModel(
  presentationEvent('job_tile', 0, {
    title: jobResolution!.title,
    impact: jobResolution!.impact,
    description: jobResolution!.description,
    summary: jobResolution!.summary,
    affectedPlayerIds: '0',
  }),
  probe.players,
);
assert(jobPresentation, 'Job foundation event should have a visible presentation hook');
assert.equal(jobPresentation.tileType, 'job');

function featureRing(kind: 'minigame' | 'job', contentId: string): BoardDefinition {
  const nodes: BoardNode[] = Array.from({ length: 6 }, (_, id) => ({
    id,
    x: id * 10,
    y: 0,
    type: 'normal',
    feature: kind,
    contentId,
  }));
  return {
    id: `test-${kind}-ring`,
    name: `Test ${kind} ring`,
    startNodeId: 0,
    nodes,
    edges: nodes.map((node) => ({ from: node.id, to: (node.id + 1) % nodes.length, route: 'main' as const })),
  };
}

const miniBoard = featureRing('minigame', 'MINIGAME_SLOT_01');
const source = createInitialMatchState({
  boardId: miniBoard.id,
  startNodeId: 0,
  playerNames: ['CPU'],
  seed: 2901,
});
const command: MatchCommand = {
  seq: 1,
  type: 'roll',
  turnNumber: 1,
  playerIndex: 0,
  actorId: 0,
  data: {},
};
source.commandLog = [command];
source.nextCommandSeq = 2;
const replay = replayMatchCommands(source, miniBoard, [], []);
assert.deepEqual(replay.errors, []);
assert.equal(replay.consumedCommands, 1);
assert(replay.state.eventLog.some((entry) => entry.type === 'minigame_tile'), 'replay must emit Mini Game foundation event');
assert.equal(replay.state.turn.phase, 'PRE_ROLL_ACTION', 'foundation tile must auto-return to the next safe turn window');
assert.equal(replay.state.rng.calls, 1, 'function foundation must add zero RNG beyond the authoritative dice roll');

const authority = createEmptyHostAuthority(
  { boardId: miniBoard.id, startNodeId: 0, playerNames: ['CPU'], seed: 2901 },
  { board: miniBoard, cards: [], news: [] },
);
const receipt = submitClientIntent(authority, {
  intentId: 'function-tile-roll-1',
  clientId: 'host-test',
  actorId: 0,
  type: 'roll',
  observedCommandSeq: 0,
  data: {},
});
assert.equal(receipt.status, 'accepted');
assert(authority.state.eventLog.some((entry) => entry.type === 'minigame_tile'), 'host authority must preserve function tile event');
assert.equal(authority.state.turn.phase, 'PRE_ROLL_ACTION', 'authority must not deadlock on foundation function tile');

console.log('[function-tiles-029] PASS Mini Game + Job schema, presentation, replay and authority auto-pass');
