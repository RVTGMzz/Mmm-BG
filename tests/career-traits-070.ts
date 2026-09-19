import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import jobsJson from '../src/content/core/jobs_mvp.json';
import { MEMEME_BUILD } from '../src/buildInfo';
import {
  DEFAULT_RELEASE_FACES_070,
  allCareerTraits070,
  careerReleaseFaces070,
  careerReleaseRuleLabel070,
  careerReleaseSucceeds070,
  careerTraitForJob070,
} from '../src/core/careerTraits070';
import { pendingCpuFreshRollAfterRelease066 } from '../src/core/cpuReleaseResume066';
import { pendingFreshMovementRollAfterRelease0701 } from '../src/core/releaseFlow0701';
import { createInitialMatchState, appendMatchEvent } from '../src/core/matchState';
import { resolveCareerCheck, type JobDefinition } from '../src/core/jobs';
import type { PlayerState } from '../src/core/types';

const jobs = jobsJson as JobDefinition[];
const replaySource = readFileSync('src/core/replay.ts', 'utf8');
const traitSource = readFileSync('src/core/careerTraits070.ts', 'utf8');
const activeSceneSource = readFileSync('src/scenes/CareerMinigameBoardScene0701.ts', 'utf8');
const cpuReleaseSource = readFileSync('src/core/cpuReleaseResume066.ts', 'utf8');
const board066Source = readFileSync('src/scenes/CareerMinigameBoardScene066.ts', 'utf8');
const turnOrderSource = readFileSync('src/scenes/TurnOrderScene0701.ts', 'utf8');

function player(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: 1,
    name: 'P1',
    nodeId: 0,
    money: 200,
    cardBlockTurns: 0,
    handCardIds: [],
    cardsPlayedThisTurn: 0,
    jobStatus: 'unemployed',
    ...overrides,
  };
}

assert.equal(MEMEME_BUILD.version, '0.1.70.4.16');
assert.match(MEMEME_BUILD.phase, /SEMANTIC CARD FOOTER \+ REACTION SPLIT/);
assert.deepEqual(DEFAULT_RELEASE_FACES_070.jail, [1, 3, 5]);
assert.deepEqual(DEFAULT_RELEASE_FACES_070.hospital, [2, 4, 6]);

const normal = player();
assert.deepEqual([...careerReleaseFaces070('jail', normal)], [1, 3, 5]);
assert.deepEqual([...careerReleaseFaces070('hospital', normal)], [2, 4, 6]);
assert(careerReleaseSucceeds070('hospital', 6, normal));
assert(!careerReleaseSucceeds070('hospital', 5, normal));

const police = player({ jobId: 'JOB_POLICE', jobLevel: 1, jobStatus: 'employed' });
assert.deepEqual([...careerReleaseFaces070('jail', police)], [1, 3, 4, 5]);
assert(careerReleaseSucceeds070('jail', 4, police));
assert.match(careerReleaseRuleLabel070('jail', police), /Nghiệp vụ.*1 \/ 3 \/ 4 \/ 5/);

const doctor = player({ jobId: 'JOB_DOCTOR', jobLevel: 1, jobStatus: 'employed' });
assert.deepEqual([...careerReleaseFaces070('hospital', doctor)], [2, 4, 5, 6]);
assert(careerReleaseSucceeds070('hospital', 5, doctor));
assert.match(careerReleaseRuleLabel070('hospital', doctor), /Trực cấp cứu.*2 \/ 4 \/ 5 \/ 6/);

const stunt = player({ jobId: 'JOB_STUNT', jobLevel: 1, jobStatus: 'employed' });
assert.deepEqual([...careerReleaseFaces070('hospital', stunt)], [2, 6]);
assert(!careerReleaseSucceeds070('hospital', 4, stunt));
assert(careerReleaseSucceeds070('hospital', 6, stunt));

const thiefJob = jobs.find((job) => job.id === 'JOB_THIEF');
assert(thiefJob, 'JOB_THIEF must remain in the canonical pool');
const thief = player({ jobId: 'JOB_THIEF', jobLevel: 2, jobStatus: 'employed' });
const arrest = resolveCareerCheck(thief, thiefJob, () => 0);
assert.equal(arrest.outcome, 'jailed');
assert.equal(thief.jobStatus, 'unemployed');
assert.equal(thief.jobId, undefined, 'arrest still clears the illegal Job');
assert.equal(thief.specialHold, 'jail');
assert.equal(thief.specialHoldSourceJobId, 'JOB_THIEF', 'hold must remember the career trait after Job clear');
assert.deepEqual([...careerReleaseFaces070('jail', thief)], [1, 5]);
assert(careerReleaseSucceeds070('jail', 1, thief));
assert(!careerReleaseSucceeds070('jail', 3, thief));
assert(careerReleaseSucceeds070('jail', 5, thief));

assert(jobs.some((job) => job.id === 'JOB_POLICE' && job.title === 'Cảnh sát'));
assert(jobs.some((job) => job.id === 'JOB_STUNT' && job.title === 'Cascader'));
assert.equal(jobs.length, 12, '0.1.70 canonical Job pool should contain 12 Jobs');
assert.equal(allCareerTraits070().length, jobs.length, 'every canonical Job needs a registered Career Trait identity');
for (const job of jobs) assert(careerTraitForJob070(job.id), `missing Career Trait registry entry for ${job.id}`);

assert.match(replaySource, /careerReleaseSucceeds070\(location, result, player\)/);
assert.match(replaySource, /ctx\.state\.turn\.lastRoll = null/);
assert.match(replaySource, /transition\(ctx, 'PRE_ROLL_ACTION'\)/);
assert.match(replaySource, /Đổ một D6 di chuyển MỚI trong cùng lượt/);
assert.match(replaySource, /specialHoldSourceJobId/);
assert(!replaySource.includes('specialReleaseSucceeds057(location, result)'), 'runtime authority must use Career Trait release policy');
assert(!traitSource.includes('Math.random'), 'Career Trait policy must not introduce client-side RNG');

// 0.1.70.1: authoritative fresh-roll state must be detectable independently from presentation.
const releaseMatch = createInitialMatchState({ boardId: 'release-0701', startNodeId: 0, playerNames: ['P1', 'CPU2'], seed: 701 });
releaseMatch.turn.phase = 'PRE_ROLL_ACTION';
releaseMatch.turn.lastRoll = null;
releaseMatch.turn.currentPlayerIndex = 1;
releaseMatch.turn.turnNumber = 7;
appendMatchEvent(releaseMatch, 'special_release', { location: 'jail', result: 3, success: true }, 1);
const releaseSeq = pendingFreshMovementRollAfterRelease0701(releaseMatch);
assert.equal(releaseSeq, releaseMatch.eventLog.at(-1)?.seq);
assert.equal(
  pendingCpuFreshRollAfterRelease066(releaseMatch, [1], true, 0),
  releaseSeq,
  'CPU fresh movement D6 must not be vetoed by presentationBlocking',
);
releaseMatch.turn.lastRoll = 4;
assert.equal(pendingFreshMovementRollAfterRelease0701(releaseMatch), undefined, 'fresh movement roll consumes the pending release state');

assert.match(activeSceneSource, /presentation\.finishCurrent\(false\)/, 'release modal needs a bounded non-authoritative close');
assert(!activeSceneSource.includes("submitIntent('roll'"), '0.1.70.1 scene must not create a second CPU release-roll owner');
assert.match(cpuReleaseSource, /pendingFreshMovementRollAfterRelease0701\(match\)/);
assert.match(board066Source, /internals\.submitIntent\('roll', \{\}\)/, 'single CPU resume owner must submit the normal HOST roll intent');
assert.match(activeSceneSource, /compactCard.*setVisible\(visible\)/s, 'legacy Card rectangle must disappear outside human turns');
assert.match(activeSceneSource, /fillRoundedRect\(card\.x - 75/, 'visible Card control must use a rounded skin');
assert.match(turnOrderSource, /fillRoundedRect/, 'Roll For Order cards must use rounded presentation');
assert.match(turnOrderSource, /valueTexts.*setY\(365\)/s, 'Roll For Order D6 results must be enlarged and reflowed');

console.log('[career-traits-070] PASS traits + 0.1.70.1 fresh-release single-owner flow + rounded dense UI guards');