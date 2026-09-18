import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { createEmptyHostAuthority, hostAuthorityChecksum, hostAuthorityCommandSeq } from '../src/core/authority';
import { getOutgoingEdges } from '../src/core/board';
import type { CardDefinition } from '../src/core/cards';
import { InMemoryTransportHub } from '../src/core/localTransport';
import type { NewsDefinition } from '../src/core/news';
import {
  TwoTabClientSession,
  TwoTabHostSession,
  type TwoTabMessage,
  type TwoTabSessionEvent,
} from '../src/core/twoTabSession';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const ROOM = 'MEQA14';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const authority = createEmptyHostAuthority(
  {
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: ['Host P1', 'Client P2', 'Host P3', 'Host P4'],
    seed: 20260913,
  },
  { board: BOARD, cards: CARDS, news: NEWS },
);

const hub = new InMemoryTransportHub<TwoTabMessage>();
const hostTransport = hub.createEndpoint('host');
const clientTransport = hub.createEndpoint('client-p2-test');
const host = new TwoTabHostSession(ROOM, authority, hostTransport);
const client = new TwoTabClientSession(ROOM, 'client-p2-test', 1, clientTransport);

const hostEvents: TwoTabSessionEvent[] = [];
const clientEvents: TwoTabSessionEvent[] = [];
host.subscribe((event) => hostEvents.push(event));
client.subscribe((event) => clientEvents.push(event));

host.start();
client.start();

assert(client.joined, 'Client did not join the host room synchronously in the in-memory fixture.');
assert(host.claimedSeatForClient(client.clientId) === 1, 'Host did not bind client to P2.');
assert(client.state, 'Client did not receive initial authoritative state.');
assert(client.observedCommandSeq === 0, 'Initial client command sequence should be zero.');
assert(
  clientEvents.some((event) => event.kind === 'state' && event.source === 'snapshot'),
  'Client did not receive initial safe snapshot.',
);

const hostRoll = host.submitLocalIntent('roll', 0);
assert(hostRoll.status === 'accepted', `Host P1 roll failed: ${hostRoll.reason ?? 'unknown'}`);

if (authority.state.turn.phase === 'BRANCH_CHOICE') {
  const current = authority.state.players[authority.state.turn.currentPlayerIndex];
  const edge = getOutgoingEdges(BOARD, current.nodeId)[0];
  assert(edge, 'Host P1 reached branch without outgoing edge.');
  const branch = host.submitLocalIntent('choose_branch', 0, { to: edge.to });
  assert(branch.status === 'accepted', `Host P1 branch failed: ${branch.reason ?? 'unknown'}`);
}

assert(authority.state.turn.currentPlayerIndex === 1, 'Authority did not advance to client-owned P2.');
assert(client.state?.turn.currentPlayerIndex === 1, 'Client did not observe P2 turn.');
assert(client.observedCommandSeq === hostAuthorityCommandSeq(authority), 'Client command seq lagged after host P1 turn.');

client.submitIntent('roll');
assert(
  clientEvents.some((event) => event.kind === 'receipt' && event.receipt.status === 'accepted'),
  'Client P2 roll did not receive accepted host receipt.',
);

if (authority.state.turn.phase === 'BRANCH_CHOICE') {
  const current = authority.state.players[authority.state.turn.currentPlayerIndex];
  const edge = getOutgoingEdges(BOARD, current.nodeId)[0];
  assert(edge, 'Client P2 reached branch without outgoing edge.');
  client.submitIntent('choose_branch', { to: edge.to });
}

assert(authority.state.turn.currentPlayerIndex === 2, 'Authority did not advance past client P2 turn.');
assert(client.state?.turn.currentPlayerIndex === 2, 'Client did not receive post-P2 state.');
assert(client.state, 'Client lost authoritative state.');
assert(
  hostAuthorityChecksum(authority) === clientEvents.filter((event) => event.kind === 'state').at(-1)?.checksum,
  'Latest client state checksum does not match host authority.',
);

const seqBeforeForgery = hostAuthorityCommandSeq(authority);
clientTransport.send(
  {
    kind: 'intent',
    intent: {
      intentId: 'forged-seat-intent',
      clientId: client.clientId,
      actorId: 2,
      type: 'roll',
      observedCommandSeq: seqBeforeForgery,
      data: {},
    },
  },
  'host',
);
assert(hostAuthorityCommandSeq(authority) === seqBeforeForgery, 'Forged client seat intent mutated host command stream.');
assert(
  clientEvents.some(
    (event) => event.kind === 'receipt' && event.receipt.intentId === 'forged-seat-intent' && event.receipt.status === 'rejected',
  ),
  'Forged client seat intent was not rejected.',
);

const snapshotCount = clientEvents.filter((event) => event.kind === 'state' && event.source === 'snapshot').length;
assert(snapshotCount >= 2, `Expected at least 2 safe snapshots, got ${snapshotCount}.`);

console.log(
  `[two-tab-ci] PASS room=${ROOM} commands=${hostAuthorityCommandSeq(authority)} checksum=${hostAuthorityChecksum(authority)} snapshots=${snapshotCount} seat=P2`,
);
console.log('[two-tab-ci] probes: join PASS • host turn PASS • client intent PASS • seat-forgery reject PASS • snapshot sync PASS');

host.close();
client.close();
