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
import { pickRandomOtherTarget, type CardDefinition } from '../src/core/cards';
import { simulateLockstepPeers, stampCommandEnvelopes } from '../src/core/lockstep';
import { cloneMatchState } from '../src/core/matchState';
import type { NewsDefinition } from '../src/core/news';
import { createRandomSource, createRngState } from '../src/core/rng';
import type { BoardDefinition, PlayerState } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const FIXTURE_SEED = 123456789;
const FIXTURE_TURNS = 20;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function buildAuthoritativeFixture() {
  const authority = createEmptyHostAuthority(
    {
      boardId: BOARD.id,
      startNodeId: BOARD.startNodeId,
      playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
      seed: FIXTURE_SEED,
    },
    { board: BOARD, cards: CARDS, news: NEWS },
  );
  let counter = 0;
  const submit = (type: ClientIntentType, data: Record<string, string | number | boolean | null>) => {
    const player = authority.state.players[authority.state.turn.currentPlayerIndex];
    assert(player, 'Lockstep fixture missing current player.');
    const receipt = submitClientIntent(authority, {
      intentId: `lockstep-${++counter}`,
      clientId: 'lockstep-fixture',
      actorId: player.id,
      type,
      observedCommandSeq: hostAuthorityCommandSeq(authority),
      data,
    });
    assert(receipt.status === 'accepted', `Lockstep fixture ${type} rejected: ${receipt.reason ?? 'unknown'}`);
  };

  while (authority.state.turn.turnNumber <= FIXTURE_TURNS) {
    const player = authority.state.players[authority.state.turn.currentPlayerIndex];
    assert(player, 'Lockstep fixture missing player.');
    if (authority.state.turn.phase === 'PRE_ROLL_ACTION') {
      submit('roll', {});
    } else if (authority.state.turn.phase === 'BRANCH_CHOICE') {
      const edge = pickParityEdge(getOutgoingEdges(BOARD, player.nodeId), authority.state.turn.lastRoll ?? 0);
      assert(edge, `No lockstep parity edge at node ${player.nodeId}.`);
      submit('choose_branch', { to: edge.to });
    } else if (authority.state.turn.phase === 'JOB_CHOICE') {
      const jobId = authority.state.pendingJobOfferIds?.[0];
      assert(jobId, 'Lockstep Job choice missing offer.');
      submit('choose_job', { jobId });
    } else {
      throw new Error(`Lockstep fixture stalled in ${authority.state.turn.phase}.`);
    }
  }
  return cloneMatchState(authority.source);
}

const authoritative = buildAuthoritativeFixture();
const legacySource = cloneMatchState(authoritative);
legacySource.commandLog = legacySource.commandLog.map((command) => ({
  ...command,
  phase: undefined,
  revision: -1,
  preChecksum: '',
  data: { ...command.data },
}));

const stamped = stampCommandEnvelopes(legacySource, BOARD, CARDS, NEWS);
assert(
  stamped.commandLog.every((command) => command.preChecksum && command.revision !== undefined && command.phase),
  'Envelope stamping missed a command checkpoint.',
);

const peers = simulateLockstepPeers(stamped, BOARD, CARDS, NEWS);
assert(peers.pass, `Independent lockstep peers diverged: ${peers.peerA.errors[0] ?? peers.peerB.errors[0] ?? 'state mismatch'}`);
assert(peers.diffs.length === 0, 'Lockstep peers produced final state differences.');
assert(peers.peerA.checkpoints.length === stamped.commandLog.length, 'Peer A did not validate every command envelope.');
assert(peers.peerB.checkpoints.length === stamped.commandLog.length, 'Peer B did not validate every command envelope.');

const checksumProbeIndex = Math.min(7, stamped.commandLog.length - 1);
const checksumProbeSeq = stamped.commandLog[checksumProbeIndex]!.seq;
const badChecksumPeer = cloneMatchState(stamped);
badChecksumPeer.commandLog[checksumProbeIndex]!.preChecksum = '00000000';
const rejectedChecksum = simulateLockstepPeers(stamped, BOARD, CARDS, NEWS, badChecksumPeer);
assert(!rejectedChecksum.pass, 'Peer with a bad pre-command checksum was incorrectly accepted.');
assert(rejectedChecksum.firstDesyncCommandSeq === checksumProbeSeq, `Expected checksum rejection at command #${checksumProbeSeq}, got #${String(rejectedChecksum.firstDesyncCommandSeq)}.`);
assert(rejectedChecksum.peerB.errors[0]?.includes('checksum'), `Checksum rejection did not explain mismatch: ${rejectedChecksum.peerB.errors[0] ?? 'no error'}`);

const actorProbeIndex = stamped.commandLog.findIndex((command, index) => index >= 4 && command.type === 'roll');
assert(actorProbeIndex >= 0, 'Could not find a roll command for wrong-actor probe.');
const actorProbeSeq = stamped.commandLog[actorProbeIndex]!.seq;
const badActorPeer = cloneMatchState(stamped);
badActorPeer.commandLog[actorProbeIndex]!.actorId = (badActorPeer.commandLog[actorProbeIndex]!.actorId + 1) % 4;
const rejectedActor = simulateLockstepPeers(stamped, BOARD, CARDS, NEWS, badActorPeer);
assert(!rejectedActor.pass, 'Peer with a stale/wrong actor was incorrectly accepted.');
assert(rejectedActor.firstDesyncCommandSeq === actorProbeSeq, `Expected actor rejection at command #${actorProbeSeq}, got #${String(rejectedActor.firstDesyncCommandSeq)}.`);
assert(rejectedActor.peerB.errors[0]?.includes('actor'), `Actor rejection did not explain mismatch: ${rejectedActor.peerB.errors[0] ?? 'no error'}`);

const targetPlayers: PlayerState[] = [0, 1, 2, 3].map((id) => ({
  id,
  name: `P${id + 1}`,
  nodeId: 0,
  money: 200,
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

console.log(`[lockstep-ci] PASS commands=${stamped.commandLog.length} checkpoints=${peers.peerA.checkpoints.length} checksum=${peers.peerAChecksum} randomTarget=P${(targetA?.id ?? -1) + 1}`);
console.log(`[lockstep-ci] rejection probes: checksum@#${checksumProbeSeq} PASS • actor@#${actorProbeSeq} PASS`);
