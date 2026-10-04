import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { createEmptyHostAuthority } from '../src/core/authority';
import type { CardDefinition } from '../src/core/cards';
import { InMemoryTransportHub } from '../src/core/localTransport';
import {
  MiniGameChoiceClientSync,
  MiniGameChoiceHostSync,
} from '../src/core/miniGameChoiceSync';
import type { NewsDefinition } from '../src/core/news';
import {
  TwoTabClientSession,
  TwoTabHostSession,
  type TwoTabMessage,
} from '../src/core/twoTabSession';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const authority = createEmptyHostAuthority(
  {
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: ['Host P1', 'Client P2', 'CPU P3', 'CPU P4'],
    seed: 20261004,
  },
  { board: BOARD, cards: CARDS, news: NEWS },
);

const hub = new InMemoryTransportHub<TwoTabMessage>();
const hostTransport = hub.createEndpoint('host');
const clientTransport = hub.createEndpoint('client-p2-minigame');
const hostSession = new TwoTabHostSession('MG16C', authority, hostTransport);
const clientSession = new TwoTabClientSession('MG16C', 'client-p2-minigame', 1, clientTransport);
hostSession.start();
clientSession.start();

assert(clientSession.joined, 'P2 must join before Mini Game choice sync starts.');
assert(hostSession.claimedSeatForClient(clientSession.clientId) === 1, 'P2 seat claim missing.');

const hostSync = new MiniGameChoiceHostSync(hostSession);
let clientSync = new MiniGameChoiceClientSync(clientSession);
const EVENT = 417;
const PROMPT = 'majority:1';

hostSync.openRound(EVENT, PROMPT, [0, 1, 2, 3], ['up', 'down']);
let state = await clientSync.waitForRound(EVENT, PROMPT);
assert(state.complete === false, 'Fresh Mini Game choice round must be incomplete.');
assert(state.submittedPlayerIds.length === 0, 'Fresh round must not expose submitted seats.');
assert(state.revealedChoices === undefined, 'Secret choices must stay hidden before completion.');

assert(hostSync.submitHostChoice(EVENT, PROMPT, 0, 'up').status === 'accepted', 'Host P1 choice rejected.');
state = clientSync.state(EVENT, PROMPT)!;
assert(state.submittedPlayerIds.join(',') === '0', 'P1 submission marker did not sync.');
assert(state.revealedChoices === undefined, 'P1 secret choice leaked before everyone committed.');

// A client may only submit its claimed seat. Forging P3 must not mutate Host choice state.
clientTransport.send({
  kind: 'minigame_choice_submit',
  sourceEventSeq: EVENT,
  promptKey: PROMPT,
  clientId: clientSession.clientId,
  playerId: 2,
  choice: 'down',
}, 'host');
state = hostSync.state(EVENT, PROMPT)!;
assert(!state.submittedPlayerIds.includes(2), 'Forged P3 Mini Game choice was accepted.');

assert(hostSync.submitSystemChoice(EVENT, PROMPT, 2, 'down').status === 'accepted', 'Host CPU P3 choice rejected.');
assert(hostSync.submitSystemChoice(EVENT, PROMPT, 3, 'up').status === 'accepted', 'Host CPU P4 choice rejected.');
state = clientSync.state(EVENT, PROMPT)!;
assert(state.complete === false, 'Round completed before remote P2 submitted.');
assert(state.revealedChoices === undefined, 'CPU/Host choices leaked while P2 was pending.');

const receipt = await clientSync.submitChoice(EVENT, PROMPT, 1, 'down');
assert(receipt.status === 'accepted', `P2 choice rejected: ${receipt.reason ?? 'unknown'}`);

const hostChoices = await hostSync.waitForComplete(EVENT, PROMPT);
assert(hostChoices[0] === 'up', 'Host P1 reveal mismatch.');
assert(hostChoices[1] === 'down', 'Remote P2 reveal mismatch.');
assert(hostChoices[2] === 'down', 'CPU P3 reveal mismatch.');
assert(hostChoices[3] === 'up', 'CPU P4 reveal mismatch.');

state = await clientSync.waitForComplete(EVENT, PROMPT).then(() => clientSync.state(EVENT, PROMPT)!);
assert(state.complete, 'Client never received completed choice state.');
assert(state.revealedChoices?.['0'] === 'up', 'Client reveal missing Host P1 choice.');
assert(state.revealedChoices?.['1'] === 'down', 'Client reveal missing its own P2 choice.');
assert(state.revealedChoices?.['2'] === 'down', 'Client reveal missing CPU P3 choice.');
assert(state.revealedChoices?.['3'] === 'up', 'Client reveal missing CPU P4 choice.');

// Recreate only the Mini Game sync listener to model a socket/UI resubscribe.
// Host retains the ephemeral round and answers the sync request with the final reveal.
clientSync.close();
clientSync = new MiniGameChoiceClientSync(clientSession);
const restored = await clientSync.waitForComplete(EVENT, PROMPT);
assert(restored[1] === 'down' && restored[3] === 'up', 'Reconnect did not restore Mini Game choice state.');

clientSync.close();
hostSync.close();
hostSession.close();
clientSession.close();

console.log('[minigame-online-choice-sync-ch16c] PASS secret commit/reveal + seat ownership + CPU Host choice + reconnect state');
