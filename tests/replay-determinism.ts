import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { computeMatchChecksum } from '../src/core/checksum';
import { diffMatchStates, summarizeMatchStateDiffs } from '../src/core/desync';
import {
  cloneMatchState,
  createInitialMatchState,
  type MatchCommand,
} from '../src/core/matchState';
import { replayMatchCommands } from '../src/core/replay';
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const FIXTURE_SEED = 123456789;
const EXPECTED_CHECKSUM = '9eabc37c';

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

function createFixtureSource() {
  const source = createInitialMatchState({
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
    seed: FIXTURE_SEED,
  });
  source.commandLog = COMMANDS.map((command) => ({ ...command, data: { ...command.data } }));
  source.nextCommandSeq = source.commandLog.length + 1;
  return source;
}

function replayFixture() {
  const source = createFixtureSource();
  const replay = replayMatchCommands(source, BOARD, CARDS, NEWS);
  assert(replay.errors.length === 0, `Replay error: ${replay.errors.join(' | ')}`);
  assert(
    replay.consumedCommands === source.commandLog.length,
    `Replay consumed ${replay.consumedCommands}/${source.commandLog.length} commands.`,
  );
  return replay.state;
}

const first = replayFixture();
const second = replayFixture();
const firstChecksum = computeMatchChecksum(first);
const secondChecksum = computeMatchChecksum(second);

assert(firstChecksum === secondChecksum, `Repeated replay diverged: ${firstChecksum} vs ${secondChecksum}.`);
assert(
  firstChecksum === EXPECTED_CHECKSUM,
  `Golden checksum changed: expected ${EXPECTED_CHECKSUM}, got ${firstChecksum}. If this is intentional, inspect the state diff and update the fixture deliberately.`,
);
assert(diffMatchStates(first, second).length === 0, 'Repeated replay produced a state diff.');

const syntheticPeer = cloneMatchState(first);
syntheticPeer.players[1].money += 20;
syntheticPeer.players[1].nodeId = 18;
syntheticPeer.rng.calls += 1;
const diagnosticPaths = new Set(diffMatchStates(first, syntheticPeer).map((entry) => entry.path));
assert(diagnosticPaths.has('players.1.money'), 'Desync diagnostics missed P2 money drift.');
assert(diagnosticPaths.has('players.1.nodeId'), 'Desync diagnostics missed P2 node drift.');
assert(diagnosticPaths.has('rng.calls'), 'Desync diagnostics missed RNG call drift.');

console.log(
  `[replay-ci] PASS seed=${FIXTURE_SEED} commands=${COMMANDS.length} checksum=${firstChecksum} rngCalls=${first.rng.calls}`,
);
console.log(`[replay-ci] desync sample: ${summarizeMatchStateDiffs(first, syntheticPeer, 4).join(' | ')}`);
