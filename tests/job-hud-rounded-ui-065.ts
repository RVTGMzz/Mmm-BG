import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import jobsJson from '../src/content/core/jobs_mvp.json';
import type { JobDefinition } from '../src/core/jobs';
import type { PlayerState } from '../src/core/types';
import { playerHudCareer065 } from '../src/ui/playerHud065';

const jobs = jobsJson as JobDefinition[];
const basePlayer: PlayerState = {
  id: 0,
  name: 'Player 1',
  nodeId: 1,
  money: 250,
  cardBlockTurns: 0,
  handCardIds: [],
  cardsPlayedThisTurn: 0,
  lapsCompleted: 0,
  jobStatus: 'unemployed',
};

const unemployed = playerHudCareer065(basePlayer, jobs);
assert.equal(unemployed.title, 'Chưa có nghề');
assert.equal(unemployed.salary, 0);
assert.match(unemployed.line2, /Lương: 0 B\$\/vòng/);

const doctor = playerHudCareer065(
  { ...basePlayer, jobStatus: 'employed', jobId: 'JOB_DOCTOR', jobLevel: 2 },
  jobs,
);
assert.equal(doctor.title, 'Bác sĩ');
assert.equal(doctor.level, 2);
assert.equal(doctor.salary, 110);
assert.match(doctor.line1, /Bác sĩ Lv\.2/);
assert.match(doctor.line2, /110 B\$\/vòng/);

const streamer = playerHudCareer065(
  { ...basePlayer, jobStatus: 'employed', jobId: 'JOB_STREAMER', jobLevel: 3 },
  jobs,
);
assert.equal(streamer.salary, 150);

const sceneSource = readFileSync('src/scenes/CareerMinigameBoardScene065.ts', 'utf8');
const mainSource = readFileSync('src/main.ts', 'utf8');
assert.match(sceneSource, /extends CareerMinigameBoardScene064/);
assert.match(sceneSource, /fillRoundedRect/);
assert.match(sceneSource, /strokeRoundedRect/);
assert.match(sceneSource, /registerRoundedTextBackground065/);
assert.match(sceneSource, /setBackgroundColor\('rgba\(0,0,0,0\)'\)/);
assert.match(sceneSource, /syncRoundedTextVisuals065/);
assert.match(sceneSource, /text\.startsWith\('PLAYTEST '\)/);
assert.match(sceneSource, /setVisible\(false\)/);
assert.match(sceneSource, /playerHudCareer065/);
assert.match(mainSource, /CareerMinigameBoardScene065 as ActiveBoardScene/);

console.log('[job-hud-rounded-ui-065] PASS real Job salary HUD, rounded Rectangle/Text-background UI, debug footer hidden');
