import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import jobsJson from '../src/content/core/jobs_mvp.json';
import { createEmptyHostAuthority } from '../src/core/authority';
import { jobOfferIndexForRoll, type JobDefinition } from '../src/core/jobs';
import { InMemoryTransportHub } from '../src/core/localTransport';
import { TwoTabClientSession, TwoTabHostSession, type TwoTabMessage, type TwoTabSessionEvent } from '../src/core/twoTabSession';
import type { BoardDefinition } from '../src/core/types';
import { buildPresentationModel } from '../src/ui/presentationModel';

const JOBS = jobsJson as JobDefinition[];
const board: BoardDefinition = {
  id: 'job-multiplayer-046',
  name: 'Job multiplayer 046',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'normal' },
    { id: 1, x: 10, y: 0, type: 'normal', feature: 'job', contentId: 'JOB_HUB_01' },
    { id: 2, x: 20, y: 0, type: 'normal' },
  ],
  edges: [
    { from: 0, to: 1, route: 'main' },
    { from: 1, to: 2, route: 'main' },
    { from: 2, to: 0, route: 'main' },
  ],
};

const authority = createEmptyHostAuthority(
  {
    boardId: board.id,
    startNodeId: 0,
    playerNames: ['Host P1', 'Remote P2', 'Host P3', 'Host P4'],
    seed: 4601,
    playOrder: [1, 0, 2, 3],
  },
  { board, cards: [], news: [] },
);
assert.equal(authority.state.turn.currentPlayerIndex, 1, 'P2 must be current actor for remote Job Hub probe');

const hub = new InMemoryTransportHub<TwoTabMessage>();
const host = new TwoTabHostSession('MEJOB46', authority, hub.createEndpoint('host'));
const client = new TwoTabClientSession('MEJOB46', 'client-p2-job46', 1, hub.createEndpoint('client-p2-job46'));
const clientEvents: TwoTabSessionEvent[] = [];
client.subscribe((event) => clientEvents.push(event));
host.start();
client.start();
assert.equal(client.joined, true, 'P2 client must own the remote seat');
assert.equal(host.controlsActor(1), false, 'host must not control the claimed P2 seat');

client.submitIntent('roll');
assert.equal(authority.state.turn.phase, 'JOB_CHOICE', 'remote P2 must stop at Job Hub and enter JOB_CHOICE');
assert.equal(authority.state.pendingJobPlayerId, 1, 'Job offer must belong to remote P2');
assert.equal(authority.state.pendingJobOfferIds?.length, 3, 'host must expose exactly three authoritative Job offers');
const offers = [...authority.state.pendingJobOfferIds!];

client.submitIntent('choose_job', {
  jobId: 'FORGED_CLIENT_JOB',
  result: 6,
  offerIndex: 2,
});
const jobCommand = authority.source.commandLog.at(-1);
assert.equal(jobCommand?.type, 'choose_job');
assert.deepEqual(jobCommand?.data, {}, 'client-supplied Job/result fields must be discarded by host authority');

const jobDice = authority.state.eventLog.find((event) => event.type === 'job_dice_roll' && event.actorId === 1);
const jobSelected = authority.state.eventLog.find((event) => event.type === 'job_selected' && event.actorId === 1);
assert(jobDice, 'host authority must emit an authoritative job_dice_roll event');
assert(jobSelected, 'host authority must emit an authoritative job_selected event');
const roll = Number(jobDice.data.result);
assert(roll >= 1 && roll <= 6, 'authoritative Job roll must be D6');
const expectedJobId = offers[jobOfferIndexForRoll(roll)]!;
assert.equal(authority.state.players[1]?.jobId, expectedJobId, 'host D6 must resolve A/B/C from the offered Jobs');
assert.equal(jobSelected.data.jobId, expectedJobId, 'selected Job event must match the host-resolved D6');
assert.equal(jobSelected.data.salary, JOBS.find((job) => job.id === expectedJobId)?.salaryByLevel[0], 'selected Job event must expose Lv.1 salary');

const clientJobState = [...clientEvents].reverse().find(
  (event): event is Extract<TwoTabSessionEvent, { kind: 'state' }> =>
    event.kind === 'state' && event.state.eventLog.some((entry) => entry.type === 'job_selected' && entry.actorId === 1),
);
assert(clientJobState, 'remote client must receive the same authoritative Job result state');
const clientDice = clientJobState.state.eventLog.find((event) => event.type === 'job_dice_roll' && event.actorId === 1);
assert.equal(clientDice?.data.result, jobDice.data.result, 'host and client must consume the same Job D6 value');
assert.equal(clientJobState.state.players[1]?.jobId, expectedJobId, 'host and client must agree on the assigned Job');

const diceModel = buildPresentationModel(jobDice, authority.state.players);
assert.equal(diceModel?.kind, 'dice_roll', 'authoritative job_dice_roll must use the shared dice presentation');
assert.equal(diceModel?.roll, roll, 'shared Job dice animation must end on the authoritative result');
const selectedModel = buildPresentationModel(jobSelected, authority.state.players);
assert.equal(selectedModel?.tileType, 'job', 'Job selection must remain a Job presentation');
assert(selectedModel?.description.includes(String(jobSelected.data.jobTitle)), 'Job result presentation must name the assigned Job');
assert(selectedModel?.description.includes(String(jobSelected.data.salary)), 'Job result presentation must show the authoritative salary');

const scene = await readFile('src/scenes/CareerMinigameBoardScene046.ts', 'utf8');
const picker = await readFile('src/ui/JobChoicePicker.ts', 'utf8');
const baseScene = await readFile('src/scenes/CareerMinigameBoardScene.ts', 'utf8');
const presentation = await readFile('src/ui/presentationModel.ts', 'utf8');

assert(scene.includes('extends CareerMinigameBoardScene045'), '0.1.46 must retain validated 0.1.45 behavior');
assert(scene.includes('internals.canControlCurrentPlayer()'), '0.1.46 must distinguish controller from spectator');
assert(scene.includes('canRoll: false'), 'non-controlling peers must get a spectator-only Job Hub');
assert(scene.includes('state.turn.phase !== \'JOB_CHOICE\''), 'spectator Job Hub must close after authoritative resolution');
assert(baseScene.includes("internals.submitIntent('choose_job', {})"), 'controlling peer must submit the existing empty choose_job intent');
assert(presentation.includes("event.type === 'dice_roll' || event.type === 'job_dice_roll'"), 'Job D6 must use authoritative shared dice presentation');
assert(picker.includes('HOST quyết định kết quả D6'), 'Compact Job Hub UI must retain the host-authority boundary without verbose tiny copy');
assert(!/Math\.random\s*\(/.test(picker), 'Job Hub picker must never generate its own random Job result');
assert(!/rollD6\s*\(/.test(picker), 'Job Hub picker must not roll gameplay D6 locally');

client.close();
host.close();

console.log(`[job-hub-multiplayer-046] PASS remote=P2 roll=${roll} job=${expectedJobId} host/client parity + spectator Job Hub`);
