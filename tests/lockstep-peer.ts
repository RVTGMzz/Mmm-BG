import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { pickRandomOtherTarget, type CardDefinition } from '../src/core/cards';
import { simulateLockstepPeers, stampCommandEnvelopes } from '../src/core/lockstep';
import {
  cloneMatchState,
  createInitialMatchState,
  type MatchCommand,
} from '../src/core/matchState';
import type { NewsDefinition } from '../src/core/news';
import { createRandomSource, createRngState } from '../src/core/rng';
import type { BoardDefinition, PlayerState } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const FIXTURE_SEED = 123456789;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
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

const source = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  seed: FIXTURE_SEED,
});
source.commandLog = COMMANDS.map((command) => ({ ...command, data: { ...command.data } }));
source.nextCommandSeq = source.commandLog.length + 1;

const stamped = stampCommandEnvelopes(source, BOARD, CARDS, NEWS);
assert(
  stamped.commandLog.every((command) => command.preChecksum && command.revision !== undefined && command.phase),
  'Envelope stamping missed a command checkpoint.',
);

const peers = simulateLockstepPeers(stamped, BOARD, CARDS, NEWS);
assert(peers.pass, `Independent lockstep peers diverged: ${peers.peerA.errors[0] ?? peers.peerB.errors[0] ?? 'state mismatch'}`);
assert(peers.diffs.length === 0, 'Lockstep peers produced final state differences.');
assert(peers.peerA.checkpoints.length === stamped.commandLog.length, 'Peer A did not validate every command envelope.');
assert(peers.peerB.checkpoints.length === stamped.commandLog.length, 'Peer B did not validate every command envelope.');

const badChecksumPeer = cloneMatchState(stamped);
badChecksumPeer.commandLog[7].preChecksum = '00000000';
const rejectedChecksum = simulateLockstepPeers(stamped, BOARD, CARDS, NEWS, badChecksumPeer);
assert(!rejectedChecksum.pass, 'Peer with a bad pre-command checksum was incorrectly accepted.');
assert(rejectedChecksum.firstDesyncCommandSeq === 8, `Expected checksum rejection at command #8, got #${String(rejectedChecksum.firstDesyncCommandSeq)}.`);
assert(
  rejectedChecksum.peerB.errors[0]?.includes('checksum'),
  `Checksum rejection did not explain the mismatch: ${rejectedChecksum.peerB.errors[0] ?? 'no error'}`,
);

const badActorPeer = cloneMatchState(stamped);
badActorPeer.commandLog[5].actorId = 3;
const rejectedActor = simulateLockstepPeers(stamped, BOARD, CARDS, NEWS, badActorPeer);
assert(!rejectedActor.pass, 'Peer with a stale/wrong actor was incorrectly accepted.');
assert(rejectedActor.firstDesyncCommandSeq === 6, `Expected actor rejection at command #6, got #${String(rejectedActor.firstDesyncCommandSeq)}.`);
assert(
  rejectedActor.peerB.errors[0]?.includes('actor'),
  `Actor rejection did not explain the mismatch: ${rejectedActor.peerB.errors[0] ?? 'no error'}`,
);

const targetPlayers: PlayerState[] = [0, 1, 2, 3].map((id) => ({
  id,
  name: `P${id + 1}`,
  nodeId: 0,
  money: 1000,
  cardBlockTurns: 0,
  handCardIds: [],
  cardsPlayedThisTurn: 0,
}));
const randomA = createRandomSource(createRngState(20260912));
const randomB = createRandomSource(createRngState(20260912));
const targetA = pickRandomOtherTarget(targetPlayers, 0, randomA);
const targetB = pickRandomOtherTarget(targetPlayers, 0, randomB);
assert(targetA?.id === targetB?.id, 'random_other target was not reproducible from the same seed.');
assert(targetA?.id !== 0, 'random_other selected the caster as target.');

console.log(
  `[lockstep-ci] PASS commands=${stamped.commandLog.length} checkpoints=${peers.peerA.checkpoints.length} checksum=${peers.peerAChecksum} randomTarget=P${(targetA?.id ?? -1) + 1}`,
);
console.log('[lockstep-ci] rejection probes: checksum@#8 PASS • actor@#6 PASS');
