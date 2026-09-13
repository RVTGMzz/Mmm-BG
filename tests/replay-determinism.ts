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
import { computeMatchChecksum } from '../src/core/checksum';
import { diffMatchStates, summarizeMatchStateDiffs } from '../src/core/desync';
import { cloneMatchState, createInitialMatchState } from '../src/core/matchState';
import { replayMatchCommands } from '../src/core/replay';
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const FIXTURE_SEED = 123456789;
const FIXTURE_TURNS = 20;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const defaultProbe = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 200,
});
assert(defaultProbe.startingMoney === 200, `Default starting money drifted: ${defaultProbe.startingMoney}B$.`);
assert(defaultProbe.players.every((player) => player.money === 200), 'New players must all start with 200B$.');
assert(defaultProbe.players.every((player) => player.lapsCompleted === 0), 'New players must start at 0 completed laps.');

function createFixtureSource() {
  const authority = createEmptyHostAuthority(
    {
      boardId: BOARD.id,
      startNodeId: BOARD.startNodeId,
      playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
      seed: FIXTURE_SEED,
    },
    { board: BOARD, cards: CARDS, news: NEWS },
  );
  let intentCounter = 0;

  const submit = (type: ClientIntentType, data: Record<string, string | number | boolean | null>) => {
    const actor = authority.state.players[authority.state.turn.currentPlayerIndex];
    assert(actor, 'Fixture authority lost current player.');
    const receipt = submitClientIntent(authority, {
      intentId: `golden-${++intentCounter}`,
      clientId: 'golden-fixture',
      actorId: actor.id,
      type,
      observedCommandSeq: hostAuthorityCommandSeq(authority),
      data,
    });
    assert(receipt.status === 'accepted', `Fixture intent ${type} rejected: ${receipt.reason ?? 'unknown'}`);
  };

  while (authority.state.turn.turnNumber <= FIXTURE_TURNS) {
    const actor = authority.state.players[authority.state.turn.currentPlayerIndex];
    assert(actor, 'Missing current player during fixture generation.');

    if (authority.state.turn.phase === 'PRE_ROLL_ACTION') {
      submit('roll', {});
      continue;
    }

    if (authority.state.turn.phase === 'BRANCH_CHOICE') {
      const outgoing = getOutgoingEdges(BOARD, actor.nodeId);
      const edge = pickParityEdge(outgoing, authority.state.turn.lastRoll ?? 0);
      assert(edge, `No parity edge from node ${actor.nodeId}.`);
      submit('choose_branch', { to: edge.to });
      continue;
    }

    if (authority.state.turn.phase === 'JOB_CHOICE') {
      assert(authority.state.pendingJobOfferIds?.length === 3, 'JOB_CHOICE must expose exactly three offers.');
      submit('choose_job', {});
      continue;
    }

    throw new Error(`Golden fixture stalled at ${authority.state.turn.phase} on turn ${authority.state.turn.turnNumber}.`);
  }

  return cloneMatchState(authority.source);
}

function replayFixture() {
  const source = createFixtureSource();
  const replay = replayMatchCommands(source, BOARD, CARDS, NEWS);
  assert(replay.errors.length === 0, `Replay error: ${replay.errors.join(' | ')}`);
  assert(replay.consumedCommands === source.commandLog.length, `Replay consumed ${replay.consumedCommands}/${source.commandLog.length} commands.`);
  return replay.state;
}

const first = replayFixture();
const second = replayFixture();
const firstChecksum = computeMatchChecksum(first);
const secondChecksum = computeMatchChecksum(second);

assert(firstChecksum === secondChecksum, `Repeated replay diverged: ${firstChecksum} vs ${secondChecksum}.`);
assert(diffMatchStates(first, second).length === 0, 'Repeated replay produced a state diff.');

const lapPeer = cloneMatchState(first);
lapPeer.players[0].lapsCompleted = (lapPeer.players[0].lapsCompleted ?? 0) + 1;
assert(
  computeMatchChecksum(lapPeer) !== firstChecksum,
  'Completed-lap progress must be gameplay-critical and checksum-covered.',
);

const syntheticPeer = cloneMatchState(first);
syntheticPeer.players[1].money += 20;
syntheticPeer.players[1].nodeId = first.players[1].nodeId === 18 ? 17 : 18;
syntheticPeer.rng.calls += 1;
const diagnosticPaths = new Set(diffMatchStates(first, syntheticPeer).map((entry) => entry.path));
assert(diagnosticPaths.has('players.1.money'), 'Desync diagnostics missed P2 money drift.');
assert(diagnosticPaths.has('players.1.nodeId'), 'Desync diagnostics missed P2 node drift.');
assert(diagnosticPaths.has('rng.calls'), 'Desync diagnostics missed RNG call drift.');

console.log(`[replay-ci] PASS seed=${FIXTURE_SEED} commands=${first.commandLog.length} checksum=${firstChecksum} rngCalls=${first.rng.calls}`);
console.log(`[replay-ci] lap checksum coverage PASS laps=${first.players.map((player) => player.lapsCompleted ?? 0).join(',')}`);
console.log(`[replay-ci] desync sample: ${summarizeMatchStateDiffs(first, syntheticPeer, 4).join(' | ')}`);