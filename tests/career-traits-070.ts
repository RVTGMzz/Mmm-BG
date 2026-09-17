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
import { resolveCareerCheck, type JobDefinition } from '../src/core/jobs';
import type { PlayerState } from '../src/core/types';

const jobs = jobsJson as JobDefinition[];
const replaySource = readFileSync('src/core/replay.ts', 'utf8');
const traitSource = readFileSync('src/core/careerTraits070.ts', 'utf8');

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

assert.equal(MEMEME_BUILD.version, '0.1.70');
assert.equal(MEMEME_BUILD.phase, 'CAREER TRAITS');
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
for (const job of jobs) {
  assert(careerTraitForJob070(job.id), `missing Career Trait registry entry for ${job.id}`);
}

assert.match(replaySource, /careerReleaseSucceeds070\(location, result, player\)/);
assert.match(replaySource, /careerReleaseFaces070\(location, player\)/);
assert.match(replaySource, /specialHoldSourceJobId/);
assert(!replaySource.includes('specialReleaseSucceeds057(location, result)'), '0.1.70 runtime authority must use Career Trait release policy');
assert(!traitSource.includes('Math.random'), 'Career Trait policy must not introduce client-side RNG');

console.log('[career-traits-070] PASS baseline + Police + Doctor + Thief + Cascader authoritative release rules');
