import assert from 'node:assert/strict';
import jobsJson from '../src/content/core/jobs_mvp.json';
import { createEmptyHostAuthority, submitClientIntent } from '../src/core/authority';
import {
  applyJobSelection,
  drawUniqueJobOffer,
  resolveCareerCheck,
  type JobDefinition,
} from '../src/core/jobs';
import { createInitialMatchState, type MatchCommand } from '../src/core/matchState';
import {
  minigameModeForActivePlayers,
  resolveMajorityMinorityRound,
  resolveRpsRound,
} from '../src/core/minigames';
import { replayMatchCommands } from '../src/core/replay';
import type { BoardDefinition } from '../src/core/types';

const JOBS = jobsJson as JobDefinition[];
assert.equal(JOBS.length, 10, 'Job pool must contain exactly 10 careers');
assert.equal(new Set(JOBS.map((job) => job.id)).size, 10, 'Job IDs must be unique');
assert(JOBS.some((job) => job.id === 'JOB_THIEF' && job.risk === 'crime' && job.jailChance > 0));

let values = [0.01, 0.51, 0.91];
const offer = drawUniqueJobOffer(JOBS, () => values.shift() ?? 0, 3);
assert.equal(offer.length, 3);
assert.equal(new Set(offer.map((job) => job.id)).size, 3, 'Job offer must contain three unique jobs');

const careerState = createInitialMatchState({
  boardId: 'job-test',
  startNodeId: 0,
  playerNames: ['Ron'],
  seed: 31,
});
const player = careerState.players[0]!;
const office = JOBS.find((job) => job.id === 'JOB_OFFICE')!;
applyJobSelection(player, office);
assert.equal(player.jobId, office.id);
assert.equal(player.jobLevel, 1);
assert.equal(player.jobStatus, 'employed');

const promoted = resolveCareerCheck(player, office, () => 0.01);
assert.equal(promoted.outcome, 'promoted');
assert.equal(player.jobLevel, 2);

player.jobLevel = 2;
const demoteValues = [0.99, 0.99];
const demoted = resolveCareerCheck(player, office, () => demoteValues.shift() ?? 0.99);
assert.equal(demoted.outcome, 'demoted');
assert.equal(player.jobLevel, 1);

player.jobLevel = 2;
const firedValues = [0.99, 0.01];
const fired = resolveCareerCheck(player, office, () => firedValues.shift() ?? 0.01);
assert.equal(fired.outcome, 'fired');
assert.equal(player.jobStatus, 'unemployed');
assert.equal(player.jobId, undefined);

const thief = JOBS.find((job) => job.id === 'JOB_THIEF')!;
applyJobSelection(player, thief);
const jailed = resolveCareerCheck(player, thief, () => 0.01);
assert.equal(jailed.outcome, 'jailed');
assert.equal(player.jobStatus, 'jailed');

assert.equal(minigameModeForActivePlayers([0, 1, 2, 3]), 'majority_minority');
const majority = resolveMajorityMinorityRound([0, 1, 2, 3], {
  0: 'up', 1: 'up', 2: 'up', 3: 'down',
});
assert.deepEqual(majority.eliminatedPlayerIds, [3]);
assert.deepEqual(majority.survivingPlayerIds, [0, 1, 2]);
assert.equal(majority.tied, false);

const tie = resolveMajorityMinorityRound([0, 1, 2, 3], {
  0: 'up', 1: 'up', 2: 'down', 3: 'down',
});
assert.equal(tie.tied, true);
assert.deepEqual(tie.eliminatedPlayerIds, []);

const toFinal = resolveMajorityMinorityRound([0, 1, 2], {
  0: 'up', 1: 'up', 2: 'down',
});
assert.deepEqual(toFinal.survivingPlayerIds, [0, 1]);
assert.equal(minigameModeForActivePlayers(toFinal.survivingPlayerIds), 'rps');
assert.deepEqual(resolveRpsRound(0, 'rock', 1, 'scissors'), { winnerId: 0, loserId: 1, tied: false });
assert.deepEqual(resolveRpsRound(0, 'paper', 1, 'paper'), { tied: true });

const jobBoard: BoardDefinition = {
  id: 'job-stop-test',
  name: 'Job stop test',
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

const source = createInitialMatchState({
  boardId: jobBoard.id,
  startNodeId: 0,
  playerNames: ['P1'],
  seed: 3101,
});
const roll: MatchCommand = { seq: 1, type: 'roll', turnNumber: 1, playerIndex: 0, actorId: 0, data: {} };
source.commandLog = [roll];
source.nextCommandSeq = 2;
const awaiting = replayMatchCommands(source, jobBoard, [], []);
assert.deepEqual(awaiting.errors, []);
assert.equal(awaiting.state.players[0]?.nodeId, 1, 'Job Hub must force-stop movement even if roll has steps left');
assert.equal(awaiting.state.turn.phase, 'JOB_CHOICE');
assert.equal(awaiting.state.pendingJobOfferIds?.length, 3);
assert.equal(awaiting.state.rng.calls, 4, 'job first visit uses 1 dice RNG + 3 unique offer draws');

const chosenId = awaiting.state.pendingJobOfferIds![1]!;
source.commandLog.push({
  seq: 2,
  type: 'choose_job',
  turnNumber: 1,
  playerIndex: 0,
  actorId: 0,
  data: { jobId: chosenId },
});
source.nextCommandSeq = 3;
const selected = replayMatchCommands(source, jobBoard, [], []);
assert.deepEqual(selected.errors, []);
assert.equal(selected.state.players[0]?.jobId, chosenId);
assert.equal(selected.state.players[0]?.jobLevel, 1);
assert.equal(selected.state.turn.phase, 'PRE_ROLL_ACTION');

const authority = createEmptyHostAuthority(
  { boardId: jobBoard.id, startNodeId: 0, playerNames: ['P1'], seed: 3101 },
  { board: jobBoard, cards: [], news: [] },
);
const rollReceipt = submitClientIntent(authority, {
  intentId: 'job-roll', clientId: 'host', actorId: 0, type: 'roll', observedCommandSeq: 0, data: {},
});
assert.equal(rollReceipt.status, 'accepted');
assert.equal(authority.state.turn.phase, 'JOB_CHOICE');
const hostJob = authority.state.pendingJobOfferIds![0]!;
const jobReceipt = submitClientIntent(authority, {
  intentId: 'job-pick', clientId: 'host', actorId: 0, type: 'choose_job', observedCommandSeq: 1, data: { jobId: hostJob },
});
assert.equal(jobReceipt.status, 'accepted');
assert.equal(authority.state.players[0]?.jobId, hostJob);

console.log('[job-minigame-031] PASS 10 Jobs + mandatory Job stop + choose 1/3 + career risks + Nhiều ra ít bị + RPS rules');
