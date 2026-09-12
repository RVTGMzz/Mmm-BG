import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { getOutgoingEdges } from '../src/core/board';
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
const GOLDEN_CHECKSUM = '0e7e9947';

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
const fixtureActions: Array<{ type: 'roll' | 'choose_branch'; actorId: number; to?: number }> = [
  { type: 'roll', actorId: 0 },
  { type: 'roll', actorId: 1 },
  { type: 'roll', actorId: 2 },
  { type: 'roll', actorId: 3 },
  { type: 'choose_branch', actorId: 3, to: 5 },
  { type: 'roll', actorId: 0 },
  { type: 'choose_branch', actorId: 0, to: 5 },
  { type: 'roll', actorId: 1 },
  { type: 'choose_branch', actorId: 1, to: 5 },
  { type: 'roll', actorId: 2 },
  { type: 'choose_branch', actorId: 2, to: 5 },
  { type: 'roll', actorId: 3 },
  { type: 'roll', actorId: 0 },
  { type: 'roll', actorId: 1 },
  { type: 'roll', actorId: 2 },
  { type: 'roll', actorId: 3 },
  { type: 'roll', actorId: 0 },
  { type: 'roll', actorId: 1 },
  { type: 'roll', actorId: 2 },
  { type: 'roll', actorId: 3 },
  { type: 'roll', actorId: 0 },
  { type: 'roll', actorId: 1 },
  { type: 'roll', actorId: 2 },
  { type: 'roll', actorId: 3 },
];

let firstAcceptedIntent: ClientIntent | undefined;
for (let index = 0; index < fixtureActions.length; index += 1) {
  const action = fixtureActions[index];
  const nextIntent = intent(
    authority,
    `fixture-${index + 1}`,
    action.actorId,
    action.type,
    action.type === 'choose_branch' ? { to: action.to ?? 5 } : {},
  );
  const result = submitClientIntent(authority, nextIntent);
  assert(result.status === 'accepted', `Fixture intent ${nextIntent.intentId} rejected: ${result.reason ?? 'unknown'}`);
  firstAcceptedIntent ??= nextIntent;
}

assert(hostAuthorityCommandSeq(authority) === 24, 'Host did not stamp all 24 authoritative commands.');
assert(
  hostAuthorityChecksum(authority) === GOLDEN_CHECKSUM,
  `Authority checksum changed: expected ${GOLDEN_CHECKSUM}, got ${hostAuthorityChecksum(authority)}.`,
);

assert(firstAcceptedIntent, 'Missing accepted intent for duplicate probe.');
const duplicate = submitClientIntent(authority, firstAcceptedIntent);
assert(duplicate.status === 'duplicate', 'Repeated intentId was not treated as duplicate.');
assert(hostAuthorityCommandSeq(authority) === 24, 'Duplicate intent changed host command sequence.');

const current = authority.state.players[authority.state.turn.currentPlayerIndex];
assert(current, 'Missing current authority player.');
const wrongActor = submitClientIntent(
  authority,
  intent(authority, 'wrong-actor', (current.id + 1) % authority.state.players.length, 'roll'),
);
assert(wrongActor.status === 'rejected' && wrongActor.reason?.includes('actor'), 'Wrong actor intent was not rejected.');

const stale = intent(authority, 'stale-view', current.id, 'roll');
stale.observedCommandSeq -= 1;
const staleReceipt = submitClientIntent(authority, stale);
assert(staleReceipt.status === 'rejected' && staleReceipt.reason?.includes('stale'), 'Stale client view was not rejected.');

// Exercise play_card intent separately. Host derives random target itself and stamps the resulting command.
const cardAuthority = createAuthority(20260913);
let cardReceipt: HostIntentReceipt | undefined;
for (let guard = 0; guard < 120 && !cardReceipt; guard += 1) {
  const player = cardAuthority.state.players[cardAuthority.state.turn.currentPlayerIndex];
  assert(player, 'Card probe missing current player.');

  if (cardAuthority.state.turn.phase === 'BRANCH_CHOICE') {
    const outgoing = getOutgoingEdges(BOARD, player.nodeId);
    assert(outgoing.length > 0, 'Branch probe found no outgoing edge.');
    const branch = submitClientIntent(
      cardAuthority,
      intent(cardAuthority, `card-branch-${guard}`, player.id, 'choose_branch', { to: outgoing[0].to }),
    );
    assert(branch.status === 'accepted', `Card probe branch rejected: ${branch.reason ?? 'unknown'}`);
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

// Local transport roundtrip: client sends intent only, host returns authority receipt.
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
  `[authority-ci] PASS commands=${hostAuthorityCommandSeq(authority)} checksum=${hostAuthorityChecksum(authority)} duplicate=PASS wrongActor=PASS stale=PASS cardIntent=PASS`,
);
console.log('[authority-ci] local transport roundtrip PASS • host stamps authority envelope/outcomes');
