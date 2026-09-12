import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
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
import { stampCommandEnvelopes } from '../src/core/lockstep';
import {
  createInitialMatchState,
  type MatchCommand,
} from '../src/core/matchState';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const RUNTIME: HostClientRuntime = { board: BOARD, cards: CARDS, news: NEWS };
const FIXTURE_SEED = 123456789;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function cloneCommand(command: MatchCommand): MatchCommand {
  return { ...command, data: { ...command.data } };
}

const COMMANDS: MatchCommand[] = [
  { seq: 1, type: 'roll', turnNumber: 1, playerIndex: 0, actorId: 0, data: {} },
  { seq: 2, type: 'roll', turnNumber: 2, playerIndex: 1, actorId: 1, data: {} },
  { seq: 3, type: 'roll', turnNumber: 3, playerIndex: 2, actorId: 2, data: {} },
  { seq: 4, type: 'roll', turnNumber: 4, playerIndex: 3, actorId: 3, data: {} },
  { seq: 5, type: 'choose_branch', turnNumber: 4, playerIndex: 3, actorId: 3, data: { to: 5 } },
  { seq: 6, type: 'roll', turnNumber: 5, playerIndex: 0, actorId: 0, data: {} },
  { seq: 7, type: 'choose_branch', turnNumber: 5, playerIndex: 0, actorId: 0, data: { to: 5 } },
  { seq: 8, type: 'roll', turnNumber: 6, playerIndex: 1, actorId: 1, data: {} },
  { seq: 9, type: 'choose_branch', turnNumber: 6, playerIndex: 1, actorId: 1, data: { to: 5 } },
  { seq: 10, type: 'roll', turnNumber: 7, playerIndex: 2, actorId: 2, data: {} },
  { seq: 11, type: 'choose_branch', turnNumber: 7, playerIndex: 2, actorId: 2, data: { to: 5 } },
  { seq: 12, type: 'roll', turnNumber: 8, playerIndex: 3, actorId: 3, data: {} },
  { seq: 13, type: 'roll', turnNumber: 9, playerIndex: 0, actorId: 0, data: {} },
  { seq: 14, type: 'roll', turnNumber: 10, playerIndex: 1, actorId: 1, data: {} },
  { seq: 15, type: 'roll', turnNumber: 11, playerIndex: 2, actorId: 2, data: {} },
  { seq: 16, type: 'roll', turnNumber: 12, playerIndex: 3, actorId: 3, data: {} },
  { seq: 17, type: 'roll', turnNumber: 13, playerIndex: 0, actorId: 0, data: {} },
  { seq: 18, type: 'roll', turnNumber: 14, playerIndex: 1, actorId: 1, data: {} },
  { seq: 19, type: 'roll', turnNumber: 15, playerIndex: 2, actorId: 2, data: {} },
  { seq: 20, type: 'roll', turnNumber: 16, playerIndex: 3, actorId: 3, data: {} },
  { seq: 21, type: 'roll', turnNumber: 17, playerIndex: 0, actorId: 0, data: {} },
  { seq: 22, type: 'roll', turnNumber: 18, playerIndex: 1, actorId: 1, data: {} },
  { seq: 23, type: 'roll', turnNumber: 19, playerIndex: 2, actorId: 2, data: {} },
  { seq: 24, type: 'roll', turnNumber: 20, playerIndex: 3, actorId: 3, data: {} },
];

const rawAuthority = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  seed: FIXTURE_SEED,
});
rawAuthority.commandLog = COMMANDS.map(cloneCommand);
rawAuthority.nextCommandSeq = rawAuthority.commandLog.length + 1;

const authority = stampCommandEnvelopes(rawAuthority, BOARD, CARDS, NEWS);
const snapshot11 = createAuthoritativeSnapshot(authority, 11, RUNTIME);
const snapshot24 = createAuthoritativeSnapshot(authority, 24, RUNTIME);
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
  const forceBefore = (earlySeq: number, delayedSeq: number) => {
    const early = bySeq.get(earlySeq);
    const delayed = bySeq.get(delayedSeq);
    if (early && delayed) {
      early.deliverAt = delayed.deliverAt - 5;
      delayed.deliverAt += 10;
    }
  };

  forceBefore(4, 3);
  forceBefore(9, 8);
  forceBefore(15, 14);
  forceBefore(21, 20);

  const duplicateSeq = startSeq === 1 ? 2 : 13;
  const duplicate = authority.commandLog.find((command) => command.seq === duplicateSeq);
  if (duplicate && duplicateSeq >= startSeq && duplicateSeq <= endSeq) {
    packets.push({
      packetId: `dup-${duplicateSeq}`,
      deliverAt: tickOffset + duplicateSeq * 10 + 45,
      command: cloneCommand(duplicate),
    });
  }

  return packets;
}

const firstReceipts = deliverHostPackets(client, makePackets(1, 11, 0), RUNTIME);
assert(client.ackSeq === 11, `Expected ACK #11, got #${client.ackSeq}.`);
assert(client.appliedSeq === 11, `Expected applied #11, got #${client.appliedSeq}.`);
assert(clientMatchesSnapshot(client, snapshot11), 'Client did not converge to authoritative snapshot #11.');
assert(client.outOfOrderPackets > 0, 'Out-of-order delivery probe did not buffer any packet.');
assert(client.duplicatePackets > 0, 'Duplicate delivery probe did not ignore a duplicate.');
assert(
  firstReceipts.some((receipt) => receipt.status === 'waiting_dependency'),
  'Branch dependency wait was not exercised by the queued roll/branch packet split.',
);

client.state.players[2].money += 77;
assert(!clientMatchesSnapshot(client, snapshot11), 'Synthetic client drift did not change gameplay checksum.');

const staleConflict = cloneCommand(authority.commandLog[5]);
staleConflict.actorId = 3;
const staleReceipt = receiveHostCommand(
  client,
  { packetId: 'stale-conflict-6', deliverAt: 999, command: staleConflict },
  RUNTIME,
);
assert(staleReceipt.status === 'rejected', 'Stale conflicting ACKed command was not rejected.');
assert(client.staleRejected === 1, `Expected one stale rejection, got ${client.staleRejected}.`);
assert(client.resyncRequested, 'Client did not request resync after stale/conflicting command.');

applyAuthoritativeSnapshot(client, snapshot11);
assert(client.resyncCount === 1, `Expected one snapshot resync, got ${client.resyncCount}.`);
assert(!client.resyncRequested, 'Resync request flag stayed set after authoritative snapshot apply.');
assert(clientMatchesSnapshot(client, snapshot11), 'Snapshot resync failed to repair client gameplay state.');

const secondReceipts = deliverHostPackets(client, makePackets(12, 24, 2000), RUNTIME);
assert(client.ackSeq === 24, `Expected final ACK #24, got #${client.ackSeq}.`);
assert(client.appliedSeq === 24, `Expected final applied #24, got #${client.appliedSeq}.`);
assert(clientMatchesSnapshot(client, snapshot24), 'Client did not converge to final host snapshot.');
assert(clientGameplayChecksum(client) === snapshot24.checksum, 'Final host/client checksum mismatch.');
assert(client.pending.size === 0, `Client still has ${client.pending.size} buffered packet(s).`);
assert(
  secondReceipts.some((receipt) => receipt.status === 'buffered'),
  'Second transport phase did not exercise out-of-order buffering.',
);

console.log(
  `[host-client-ci] PASS ack=${client.ackSeq} applied=${client.appliedSeq} checksum=${snapshot24.checksum} outOfOrder=${client.outOfOrderPackets} duplicates=${client.duplicatePackets} staleRejected=${client.staleRejected} resyncs=${client.resyncCount}`,
);
console.log('[host-client-ci] probes: latency/out-of-order PASS • duplicate PASS • stale reject PASS • snapshot resync PASS');
