import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntentType,
} from '../src/core/authority';
import { getOutgoingEdges, pickParityEdge } from '../src/core/board';
import type { CardDefinition } from '../src/core/cards';
import {
  applyAuthoritativeSnapshot,
  clientGameplayChecksum,
  clientMatchesSnapshot,
  createAuthoritativeSnapshot,
  createHostClientPeer,
  deliverHostPackets,
  receiveHostCommand,
  type HostClientRuntime,
  type HostCommandPacket,
} from '../src/core/hostClient';
import { cloneMatchState, type MatchCommand } from '../src/core/matchState';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const RUNTIME: HostClientRuntime = { board: BOARD, cards: CARDS, news: NEWS };
const FIXTURE_SEED = 123456789;
const FIXTURE_TURNS = 20;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function cloneCommand(command: MatchCommand): MatchCommand {
  return { ...command, data: { ...command.data } };
}

function buildAuthorityFixture() {
  const authority = createEmptyHostAuthority(
    {
      boardId: BOARD.id,
      startNodeId: BOARD.startNodeId,
      playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
      seed: FIXTURE_SEED,
    },
    RUNTIME,
  );
  const turnBoundarySeqs: number[] = [];
  let counter = 0;

  const submit = (type: ClientIntentType, data: Record<string, string | number | boolean | null>) => {
    const beforeTurn = authority.state.turn.turnNumber;
    const player = authority.state.players[authority.state.turn.currentPlayerIndex];
    assert(player, 'Host-client fixture missing current player.');
    const receipt = submitClientIntent(authority, {
      intentId: `queue-${++counter}`,
      clientId: 'queue-fixture',
      actorId: player.id,
      type,
      observedCommandSeq: hostAuthorityCommandSeq(authority),
      data,
    });
    assert(receipt.status === 'accepted', `Host-client fixture ${type} rejected: ${receipt.reason ?? 'unknown'}`);
    if (authority.state.turn.turnNumber > beforeTurn) turnBoundarySeqs.push(hostAuthorityCommandSeq(authority));
  };

  while (authority.state.turn.turnNumber <= FIXTURE_TURNS) {
    const player = authority.state.players[authority.state.turn.currentPlayerIndex];
    assert(player, 'Host-client fixture missing player.');
    if (authority.state.turn.phase === 'PRE_ROLL_ACTION') {
      submit('roll', {});
    } else if (authority.state.turn.phase === 'BRANCH_CHOICE') {
      const edge = pickParityEdge(getOutgoingEdges(BOARD, player.nodeId), authority.state.turn.lastRoll ?? 0);
      assert(edge, `Host-client fixture cannot resolve branch at node ${player.nodeId}.`);
      submit('choose_branch', { to: edge.to });
    } else if (authority.state.turn.phase === 'JOB_CHOICE') {
      const jobId = authority.state.pendingJobOfferIds?.[0];
      assert(jobId, 'Host-client fixture Job offer missing.');
      submit('choose_job', { jobId });
    } else {
      throw new Error(`Host-client fixture stalled in ${authority.state.turn.phase}.`);
    }
  }

  return { source: cloneMatchState(authority.source), turnBoundarySeqs };
}

const fixture = buildAuthorityFixture();
const authority = fixture.source;
const finalSeq = authority.commandLog.at(-1)?.seq ?? 0;
const splitSeq = fixture.turnBoundarySeqs[Math.min(9, fixture.turnBoundarySeqs.length - 1)] ?? Math.floor(finalSeq / 2);
assert(splitSeq > 2 && splitSeq < finalSeq, `Invalid transport split #${splitSeq}/${finalSeq}.`);

const snapshotA = createAuthoritativeSnapshot(authority, splitSeq, RUNTIME);
const snapshotFinal = createAuthoritativeSnapshot(authority, finalSeq, RUNTIME);
const client = createHostClientPeer(authority, BOARD.startNodeId);

function makePackets(startSeq: number, endSeq: number, tickOffset: number): HostCommandPacket[] {
  const packets = authority.commandLog
    .filter((command) => command.seq >= startSeq && command.seq <= endSeq)
    .map((command) => ({
      packetId: `main-${command.seq}`,
      deliverAt: tickOffset + command.seq * 10,
      command: cloneCommand(command),
    }));

  const bySeq = new Map(packets.map((packet) => [packet.command.seq, packet]));
  const reorderPair = (firstSeq: number, secondSeq: number) => {
    const first = bySeq.get(firstSeq);
    const second = bySeq.get(secondSeq);
    if (!first || !second) return;
    second.deliverAt = first.deliverAt - 3;
  };

  if (endSeq - startSeq >= 3) reorderPair(startSeq + 1, startSeq + 2);
  if (endSeq - startSeq >= 7) reorderPair(startSeq + 5, startSeq + 6);

  const duplicateSeq = Math.min(endSeq, startSeq + 1);
  const duplicate = authority.commandLog.find((command) => command.seq === duplicateSeq);
  if (duplicate) {
    packets.push({
      packetId: `dup-${duplicateSeq}`,
      deliverAt: tickOffset + duplicateSeq * 10 + 45,
      command: cloneCommand(duplicate),
    });
  }
  return packets;
}

const firstReceipts = deliverHostPackets(client, makePackets(1, splitSeq, 0), RUNTIME);
assert(client.ackSeq === splitSeq, `Expected ACK #${splitSeq}, got #${client.ackSeq}.`);
assert(client.appliedSeq === splitSeq, `Expected applied #${splitSeq}, got #${client.appliedSeq}.`);
assert(clientMatchesSnapshot(client, snapshotA), `Client did not converge to authoritative snapshot #${splitSeq}.`);
assert(client.outOfOrderPackets > 0, 'Out-of-order delivery probe did not buffer any packet.');
assert(client.duplicatePackets > 0, 'Duplicate delivery probe did not ignore a duplicate.');
assert(
  firstReceipts.some((receipt) => receipt.status === 'waiting_dependency') ||
    authority.commandLog.slice(0, splitSeq).every((command, index, commands) => command.type !== 'roll' || commands[index + 1]?.type !== 'choose_branch'),
  'Branch dependency wait was expected but never exercised.',
);

client.state.players[2]!.money += 77;
assert(!clientMatchesSnapshot(client, snapshotA), 'Synthetic client drift did not change gameplay checksum.');

const staleSource = authority.commandLog.find((command) => command.seq <= splitSeq && command.actorId < 3) ?? authority.commandLog[0];
assert(staleSource, 'Missing stale conflict source command.');
const staleConflict = cloneCommand(staleSource);
staleConflict.actorId = (staleConflict.actorId + 1) % 4;
const staleReceipt = receiveHostCommand(
  client,
  { packetId: `stale-conflict-${staleConflict.seq}`, deliverAt: 999, command: staleConflict },
  RUNTIME,
);
assert(staleReceipt.status === 'rejected', 'Stale conflicting ACKed command was not rejected.');
assert(client.staleRejected === 1, `Expected one stale rejection, got ${client.staleRejected}.`);
assert(client.resyncRequested, 'Client did not request resync after stale/conflicting command.');

applyAuthoritativeSnapshot(client, snapshotA);
assert(client.resyncCount === 1, `Expected one snapshot resync, got ${client.resyncCount}.`);
assert(!client.resyncRequested, 'Resync request flag stayed set after authoritative snapshot apply.');
assert(clientMatchesSnapshot(client, snapshotA), 'Snapshot resync failed to repair client gameplay state.');

const secondReceipts = deliverHostPackets(client, makePackets(splitSeq + 1, finalSeq, 2000), RUNTIME);
assert(client.ackSeq === finalSeq, `Expected final ACK #${finalSeq}, got #${client.ackSeq}.`);
assert(client.appliedSeq === finalSeq, `Expected final applied #${finalSeq}, got #${client.appliedSeq}.`);
assert(clientMatchesSnapshot(client, snapshotFinal), 'Client did not converge to final host snapshot.');
assert(clientGameplayChecksum(client) === snapshotFinal.checksum, 'Final host/client checksum mismatch.');
assert(client.pending.size === 0, `Client still has ${client.pending.size} buffered packet(s).`);
assert(secondReceipts.some((receipt) => receipt.status === 'buffered'), 'Second transport phase did not exercise out-of-order buffering.');

console.log(`[host-client-ci] PASS ack=${client.ackSeq} applied=${client.appliedSeq} checksum=${snapshotFinal.checksum} split=#${splitSeq} outOfOrder=${client.outOfOrderPackets} duplicates=${client.duplicatePackets} staleRejected=${client.staleRejected} resyncs=${client.resyncCount}`);
console.log('[host-client-ci] probes: Job-aware queue PASS • latency/out-of-order PASS • duplicate PASS • stale reject PASS • snapshot resync PASS');
