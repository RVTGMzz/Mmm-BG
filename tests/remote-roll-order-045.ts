import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { InMemoryTransportHub } from '../src/core/localTransport';
import {
  TurnOrderClientSession,
  TurnOrderHostSession,
  type TurnOrderEvent,
  type TurnOrderMessage,
} from '../src/core/turnOrderSession';

const protocolSource = await readFile('src/core/turnOrderSession.ts', 'utf8');
const sceneSource = await readFile('src/scenes/TurnOrderScene.ts', 'utf8');
const lobbySource = await readFile('src/scenes/LocalLobbyScene.ts', 'utf8');
const setupSource = await readFile('src/scenes/SetupScene.ts', 'utf8');
const mainSource = await readFile('src/main.ts', 'utf8');
const wrapperSource = await readFile('src/scenes/CareerMinigameBoardScene045.ts', 'utf8');

const hub = new InMemoryTransportHub<TurnOrderMessage>();
const authoritativeRolls = [6, 2, 5];
let rollCalls = 0;
const hostEvents: TurnOrderEvent[] = [];
const clientEvents: TurnOrderEvent[] = [];

const host = new TurnOrderHostSession(
  'ME4545',
  ['Host Ron', 'Remote P2', 'Host P3', 'Host P4'],
  hub.createEndpoint('host'),
  () => authoritativeRolls[rollCalls++] ?? 1,
);
const client = new TurnOrderClientSession(
  'ME4545',
  'client-p2-test',
  1,
  hub.createEndpoint('client-p2-test'),
);

host.subscribe((event) => hostEvents.push(event));
client.subscribe((event) => clientEvents.push(event));
host.start();
client.start();

assert.equal(client.joined, true, 'client should claim its remote turn-order seat');
assert.deepEqual(host.claimedSeatIds, [1], 'host should record P2 as remote-owned');
assert(
  clientEvents.some((event) => event.kind === 'profile_sync' && event.playerNames[0] === 'Host Ron'),
  'host should sync player names into the remote ceremony without syncing face files',
);

host.lockClaims();
const remotePrompt = host.beginPrompt(1, 1, false);
assert.equal(remotePrompt.remote, true, 'claimed P2 prompt must be remote-owned');
assert(remotePrompt.result, 'remote prompt must expose a host-resolved result promise');
assert(client.activePrompt?.promptId === remotePrompt.prompt.promptId, 'client should receive the host prompt');
assert(client.canRoll(remotePrompt.prompt.promptId), 'only the claimed client should be able to press this prompt');

client.submitRoll(remotePrompt.prompt.promptId);
const remoteValue = await remotePrompt.result!;
assert.equal(remoteValue, 6, 'remote click must resolve to the host-generated D6 value');
assert.equal(rollCalls, 1, 'remote client must not generate an extra D6 locally');
assert(
  clientEvents.some((event) => event.kind === 'result' && event.playerId === 1 && event.value === 6),
  'host-generated remote D6 result must be broadcast back to the client',
);
assert.throws(
  () => client.submitRoll(remotePrompt.prompt.promptId),
  /Remote Roll chưa tới lượt|prompt đã được gửi/,
  'duplicate/stale remote clicks must not roll again',
);
assert.equal(rollCalls, 1, 'duplicate remote click must not consume host D6');

const hostPrompt = host.beginPrompt(0, 1, false);
assert.equal(hostPrompt.remote, false, 'unclaimed P1 must remain host-owned');
assert.equal(client.canRoll(hostPrompt.prompt.promptId), false, 'remote P2 must not roll a host-owned P1 prompt');
const hostValue = host.resolveHostOwnedPrompt(hostPrompt.prompt.promptId);
assert.equal(hostValue, 2, 'host-owned prompt must also use the host D6 source');
assert.equal(rollCalls, 2, 'host-owned roll should consume exactly one authoritative D6');

host.announceTie([0, 1], 2);
host.finalizeOrder([1, 0, 2, 3]);
host.startMatch();
assert(
  clientEvents.some((event) => event.kind === 'tie_group' && event.playerIds.join(',') === '0,1'),
  'tie group must be announced to the remote client',
);
assert(
  clientEvents.some((event) => event.kind === 'final_order' && event.order.join(',') === '1,0,2,3'),
  'client must receive the exact host-finalized play order',
);
assert(clientEvents.some((event) => event.kind === 'start_match'), 'host must explicitly release clients into the match');

const lateClient = new TurnOrderClientSession(
  'ME4545',
  'late-client-p3',
  2,
  hub.createEndpoint('late-client-p3'),
);
const lateEvents: TurnOrderEvent[] = [];
lateClient.subscribe((event) => lateEvents.push(event));
lateClient.start();
assert.equal(lateClient.joined, false, 'late seat claims must stay rejected after the ceremony locks');
assert(
  lateEvents.some((event) => event.kind === 'status' && event.level === 'error' && event.message.includes('đã bắt đầu')),
  'late client should receive a clear locked-ceremony rejection',
);

assert(
  protocolSource.includes("| { kind: 'roll_request'; roomCode: string; clientId: string; seatId: number; promptId: string }"),
  'remote roll request must carry intent identity only, never a client-chosen D6 value',
);
assert(protocolSource.includes('const value = this.nextD6();'), 'host must generate the D6 after validating the remote prompt');
assert(sceneSource.includes('session.beginPrompt(id, depth, depth > 1)'), 'host scene must prompt each seat through the authority session');
assert(sceneSource.includes('result = await handle.result!'), 'remote seat result must wait for the host-resolved promise');
assert(sceneSource.includes('this.clientOrderSession.submitRoll(promptId)'), 'client button must submit a roll request rather than resolve localD6');
assert(sceneSource.includes('session.announceTie(tied, value)'), 'tie rerolls must be broadcast by host authority');
assert(lobbySource.includes("this.scene.start('TurnOrderScene')"), 'JOIN flow must enter Remote Roll For Order before DemoBoardScene');
assert(lobbySource.includes('MVP 0.1.45') && setupSource.includes('MVP 0.1.45'), 'entry surfaces must identify 0.1.45');
assert(mainSource.includes('CareerMinigameBoardScene045'), 'packaged runtime must use the 0.1.45 build wrapper');
assert(wrapperSource.includes('extends CareerMinigameBoardScene044'), '0.1.45 must retain all validated 0.1.44 board behavior');

lateClient.close();
client.close();
host.close();

console.log('[remote-roll-order-045] PASS host-generated D6 + seat claim + remote click + tie/final/start sync');
