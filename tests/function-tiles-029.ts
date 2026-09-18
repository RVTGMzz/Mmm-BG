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
const miniNodes = featureNodes.filter((node) => node.feature === 'minigame');
const jobNodes = featureNodes.filter((node) => node.feature === 'job');
assert.equal(featureNodes.length, 6, 'Draft D should expose five Mini Games plus one Job Hub.');
assert.equal(miniNodes.length, 5, 'Draft D must expose exactly five Mini Game spaces.');
assert.equal(jobNodes.length, 1, 'Draft D must keep exactly one Job Hub.');
assert.deepEqual(miniNodes.map((node) => node.id), [8, 16, 25, 34, 43]);
assert.deepEqual(
  miniNodes.map((node) => node.contentId),
  ['MINIGAME_SLOT_01', 'MINIGAME_SLOT_02', 'MINIGAME_SLOT_03', 'MINIGAME_SLOT_04', 'MINIGAME_SLOT_05'],
);
const miniNode = miniNodes[0];
const jobNode = jobNodes[0];
assert(miniNode, 'Mini Game node missing');
assert(jobNode, 'Job node missing');
assert.equal(jobNode.contentId, 'JOB_HUB_01');
assert.equal(jobNode.id, 7, 'Job Hub must sit at the first Draft D branch convergence.');

const catalogIds = new Set(catalog.map((entry) => entry.id));
assert.equal(catalogIds.size, catalog.length, 'function tile content IDs must stay unique');
for (const node of featureNodes) {
  assert(node.contentId && catalogIds.has(node.contentId), `board node ${node.id} references missing function content`);
}
assert.equal(catalog.filter((entry) => entry.kind === 'job').length, 1);
assert.equal(catalog.filter((entry) => entry.kind === 'minigame').length, 5);
assert(catalog.filter((entry) => entry.kind === 'minigame').every((entry) => entry.status === 'rules_locked'));
assert.equal(catalog.find((entry) => entry.kind === 'job')?.status, 'playable');

const probe = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 129,
});
const player = probe.players[0]!;
for (const node of miniNodes) {
  const miniResolution = resolveFunctionTileFoundation(node, player);
  assert.equal(miniResolution?.eventType, 'minigame_tile', `Mini Game node ${node.id} must resolve through the shared MVP Mini Game system.`);
}

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

console.log('[function-tiles-029] PASS 5 Mini Game slots + shared MVP presentation/replay + playable Job hook');
