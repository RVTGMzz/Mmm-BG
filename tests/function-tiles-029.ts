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
  status: 'foundation' | 'rules_locked' | 'playable';
}>;

const featureNodes = BOARD.nodes.filter((node) => node.feature);
assert.equal(featureNodes.length, 2, 'board should expose exactly two function nodes');
const miniNode = featureNodes.find((node) => node.feature === 'minigame');
const jobNode = featureNodes.find((node) => node.feature === 'job');
assert(miniNode, 'Mini Game node missing');
assert(jobNode, 'Job node missing');
assert.equal(miniNode.contentId, 'MINIGAME_SLOT_01');
assert.equal(jobNode.contentId, 'JOB_HUB_01');
assert.equal(jobNode.id, 7, 'Job Hub must sit at the main/shortcut convergence');

const catalogIds = new Set(catalog.map((entry) => entry.id));
assert.equal(catalogIds.size, catalog.length, 'function tile content IDs must stay unique');
for (const node of featureNodes) {
  assert(node.contentId && catalogIds.has(node.contentId), `board node ${node.id} references missing function content`);
}
assert.equal(catalog.find((entry) => entry.kind === 'job')?.status, 'playable');
assert.equal(catalog.find((entry) => entry.kind === 'minigame')?.status, 'rules_locked');

const probe = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 129,
});
const player = probe.players[0]!;
const miniResolution = resolveFunctionTileFoundation(miniNode, player);
assert.equal(miniResolution?.eventType, 'minigame_tile');

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
    title: 'MINI GAME',
    impact: '🎮',
    description: '3+ người: Nhiều ra ít bị.',
    summary: '1v1 tự chuyển sang Oẳn Tù Xì.',
    affectedPlayerIds: '0,1,2,3',
  }),
  probe.players,
);
assert(miniPresentation, 'Mini Game event should have a visible presentation hook');
assert.equal(miniPresentation.tileType, 'minigame');

const jobPresentation = buildPresentationModel(
  presentationEvent('job_offer', 0, {
    title: 'CHỌN 1 TRONG 3 JOB',
    impact: '💼',
    description: 'Chọn nghề.',
    summary: 'Pool 10 nghề.',
    affectedPlayerIds: '0',
  }),
  probe.players,
);
assert(jobPresentation, 'Job offer should have a visible presentation hook');
assert.equal(jobPresentation.tileType, 'job');

function miniRing(): BoardDefinition {
  const nodes: BoardNode[] = Array.from({ length: 6 }, (_, id) => ({
    id,
    x: id * 10,
    y: 0,
    type: 'normal',
    feature: 'minigame',
    contentId: 'MINIGAME_SLOT_01',
  }));
  return {
    id: 'test-minigame-ring',
    name: 'Test minigame ring',
    startNodeId: 0,
    nodes,
    edges: nodes.map((node) => ({ from: node.id, to: (node.id + 1) % nodes.length, route: 'main' as const })),
  };
}

const miniBoard = miniRing();
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
assert(replay.state.eventLog.some((entry) => entry.type === 'minigame_tile'));
assert.equal(replay.state.turn.phase, 'PRE_ROLL_ACTION');
assert.equal(replay.state.rng.calls, 1, 'minigame rules presentation must add zero RNG for now');

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
assert.equal(authority.state.turn.phase, 'PRE_ROLL_ACTION');

console.log('[function-tiles-029] PASS function schema + Mini Game presentation/replay + playable Job hook');
