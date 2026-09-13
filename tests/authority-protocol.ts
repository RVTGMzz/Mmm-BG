import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { getOutgoingEdges, pickParityEdge } from '../src/core/board';
import type { CardDefinition } from '../src/core/cards';
import {
  createEmptyHostAuthority,
  hostAuthorityChecksum,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntent,
  type HostAuthority,
  type HostIntentReceipt,
} from '../src/core/authority';
import { InMemoryTransportHub } from '../src/core/localTransport';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const FIXTURE_SEED = 123456789;
const FIXTURE_TURNS = 20;
const GOLDEN_CHECKSUM = 'fad794e3';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function createAuthority(seed = FIXTURE_SEED): HostAuthority {
  return createEmptyHostAuthority(
    {
      boardId: BOARD.id,
      startNodeId: BOARD.startNodeId,
      playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
      seed,
    },
    { board: BOARD, cards: CARDS, news: NEWS },
  );
}

function intent(
  authority: HostAuthority,
  intentId: string,
  actorId: number,
  type: ClientIntent['type'],
  data: ClientIntent['data'] = {},
): ClientIntent {
  return {
    intentId,
    clientId: `client-p${actorId}`,
    actorId,
    type,
    observedCommandSeq: hostAuthorityCommandSeq(authority),
    data,
  };
}

const authority = createAuthority();
let firstAcceptedIntent: ClientIntent | undefined;
let fixtureIntentCounter = 0;
while (authority.state.turn.turnNumber <= FIXTURE_TURNS) {
  const player = authority.state.players[authority.state.turn.currentPlayerIndex];
  assert(player, 'Authority fixture missing current player.');
  let nextIntent: ClientIntent;

  if (authority.state.turn.phase === 'PRE_ROLL_ACTION') {
    nextIntent = intent(authority, `fixture-${++fixtureIntentCounter}`, player.id, 'roll');
  } else if (authority.state.turn.phase === 'BRANCH_CHOICE') {
    const outgoing = getOutgoingEdges(BOARD, player.nodeId);
    const edge = pickParityEdge(outgoing, authority.state.turn.lastRoll ?? 0);
    assert(edge, `Authority fixture cannot resolve parity branch at node ${player.nodeId}.`);
    nextIntent = intent(authority, `fixture-${++fixtureIntentCounter}`, player.id, 'choose_branch', { to: edge.to });
  } else if (authority.state.turn.phase === 'JOB_CHOICE') {
    const jobId = authority.state.pendingJobOfferIds?.[0];
    assert(jobId, 'Authority fixture JOB_CHOICE missing offer.');
    nextIntent = intent(authority, `fixture-${++fixtureIntentCounter}`, player.id, 'choose_job', { jobId });
  } else {
    throw new Error(`Authority fixture stalled in ${authority.state.turn.phase}.`);
  }

  const result = submitClientIntent(authority, nextIntent);
  assert(result.status === 'accepted', `Fixture intent ${nextIntent.intentId} rejected: ${result.reason ?? 'unknown'}`);
  firstAcceptedIntent ??= nextIntent;
}

const goldenCommandCount = hostAuthorityCommandSeq(authority);
assert(goldenCommandCount > FIXTURE_TURNS, 'Job/branch fixture should contain extra authoritative commands.');
assert(
  hostAuthorityChecksum(authority) === GOLDEN_CHECKSUM,
  `Authority checksum changed: expected ${GOLDEN_CHECKSUM}, got ${hostAuthorityChecksum(authority)}.`,
);

assert(firstAcceptedIntent, 'Missing accepted intent for duplicate probe.');
const duplicate = submitClientIntent(authority, firstAcceptedIntent);
assert(duplicate.status === 'duplicate', 'Repeated intentId was not treated as duplicate.');
assert(hostAuthorityCommandSeq(authority) === goldenCommandCount, 'Duplicate intent changed host command sequence.');

const current = authority.state.players[authority.state.turn.currentPlayerIndex];
assert(current, 'Missing current authority player.');
const wrongActor = submitClientIntent(
  authority,
  intent(authority, 'wrong-actor', (current.id + 1) % authority.state.players.length, authority.state.turn.phase === 'JOB_CHOICE' ? 'choose_job' : 'roll', authority.state.turn.phase === 'JOB_CHOICE' ? { jobId: authority.state.pendingJobOfferIds?.[0] ?? '' } : {}),
);
assert(wrongActor.status === 'rejected' && wrongActor.reason?.includes('actor'), 'Wrong actor intent was not rejected.');

const staleType: ClientIntent['type'] = authority.state.turn.phase === 'JOB_CHOICE' ? 'choose_job' : 'roll';
const staleData = staleType === 'choose_job' ? { jobId: authority.state.pendingJobOfferIds?.[0] ?? '' } : {};
const stale = intent(authority, 'stale-view', current.id, staleType, staleData);
stale.observedCommandSeq -= 1;
const staleReceipt = submitClientIntent(authority, stale);
assert(staleReceipt.status === 'rejected' && staleReceipt.reason?.includes('stale'), 'Stale client view was not rejected.');

const cardAuthority = createAuthority(20260913);
let cardReceipt: HostIntentReceipt | undefined;
for (let guard = 0; guard < 180 && !cardReceipt; guard += 1) {
  const player = cardAuthority.state.players[cardAuthority.state.turn.currentPlayerIndex];
  assert(player, 'Card probe missing current player.');

  if (cardAuthority.state.turn.phase === 'BRANCH_CHOICE') {
    const outgoing = getOutgoingEdges(BOARD, player.nodeId);
    const edge = pickParityEdge(outgoing, cardAuthority.state.turn.lastRoll ?? 0) ?? outgoing[0];
    assert(edge, 'Branch probe found no outgoing edge.');
    const branch = submitClientIntent(
      cardAuthority,
      intent(cardAuthority, `card-branch-${guard}`, player.id, 'choose_branch', { to: edge.to }),
    );
    assert(branch.status === 'accepted', `Card probe branch rejected: ${branch.reason ?? 'unknown'}`);
    continue;
  }

  if (cardAuthority.state.turn.phase === 'JOB_CHOICE') {
    const jobId = cardAuthority.state.pendingJobOfferIds?.[0];
    assert(jobId, 'Card probe Job choice missing offer.');
    const job = submitClientIntent(
      cardAuthority,
      intent(cardAuthority, `card-job-${guard}`, player.id, 'choose_job', { jobId }),
    );
    assert(job.status === 'accepted', `Card probe Job choice rejected: ${job.reason ?? 'unknown'}`);
    continue;
  }

  assert(cardAuthority.state.turn.phase === 'PRE_ROLL_ACTION', `Unexpected card probe phase ${cardAuthority.state.turn.phase}.`);

  if (player.handCardIds.length > 0) {
    const cardId = player.handCardIds[0];
    const card = CARDS.find((entry) => entry.id === cardId);
    assert(card, `Card probe cannot find ${cardId}.`);
    const target = card.targetMode === 'single_other'
      ? cardAuthority.state.players.find((candidate) => candidate.id !== player.id)?.id
      : undefined;
    cardReceipt = submitClientIntent(
      cardAuthority,
      intent(cardAuthority, 'card-play', player.id, 'play_card', {
        cardId,
        ...(target !== undefined ? { targetId: target } : {}),
        ...(card.effect.type === 'tactical_choice' ? { choice: 'safe' } : {}),
      }),
    );
    break;
  }

  const roll = submitClientIntent(
    cardAuthority,
    intent(cardAuthority, `card-roll-${guard}`, player.id, 'roll'),
  );
  assert(roll.status === 'accepted', `Card probe roll rejected: ${roll.reason ?? 'unknown'}`);
}

assert(cardReceipt, 'Could not reach a playable card intent within guard limit.');
assert(cardReceipt.status === 'accepted', `play_card intent rejected: ${cardReceipt.reason ?? 'unknown'}`);
assert(cardReceipt.command?.type === 'play_card', 'Host did not stamp play_card command.');
const playedCard = CARDS.find((entry) => entry.id === String(cardReceipt.command?.data.cardId));
if (playedCard?.targetMode === 'random_other') {
  assert(Number(cardReceipt.command?.data.targetId) >= 0, 'Host did not resolve random_other targetId.');
}

type ProtocolMessage =
  | { kind: 'intent'; intent: ClientIntent }
  | { kind: 'receipt'; receipt: HostIntentReceipt };

const transportAuthority = createAuthority(987654321);
const hub = new InMemoryTransportHub<ProtocolMessage>();
const hostEndpoint = hub.createEndpoint('host');
const clientEndpoint = hub.createEndpoint('client-p0');
let transportReceipt: HostIntentReceipt | undefined;

hostEndpoint.subscribe((message) => {
  if (message.payload.kind !== 'intent') return;
  const result = submitClientIntent(transportAuthority, message.payload.intent);
  hostEndpoint.send({ kind: 'receipt', receipt: result }, message.from);
});
clientEndpoint.subscribe((message) => {
  if (message.payload.kind === 'receipt') transportReceipt = message.payload.receipt;
});

clientEndpoint.send(
  {
    kind: 'intent',
    intent: intent(transportAuthority, 'transport-roll', 0, 'roll'),
  },
  'host',
);

assert(transportReceipt?.status === 'accepted', 'Local transport did not return accepted host receipt.');
assert(hostAuthorityCommandSeq(transportAuthority) === 1, 'Local transport host did not stamp command #1.');
hostEndpoint.close();
clientEndpoint.close();

console.log(
  `[authority-ci] PASS commands=${goldenCommandCount} checksum=${hostAuthorityChecksum(authority)} duplicate=PASS wrongActor=PASS stale=PASS cardIntent=PASS`,
);
console.log('[authority-ci] local transport roundtrip PASS • host stamps authority envelope/outcomes');
