import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { withCompetitionRanks } from '../src/ui/podiumRanking';

const scene = await readFile('src/scenes/CareerMinigameBoardScene041.ts', 'utf8');
const parent = await readFile('src/scenes/CareerMinigameBoardScene040.ts', 'utf8');
const finalGate = await readFile('src/scenes/CareerMinigameBoardScene039.ts', 'utf8');
const rankingHelper = await readFile('src/ui/podiumRanking.ts', 'utf8');
const executableScene = scene
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert.deepEqual(
  withCompetitionRanks([
    { playerId: 0, money: 300 },
    { playerId: 1, money: 300 },
    { playerId: 2, money: 250 },
    { playerId: 3, money: 200 },
  ]).map((entry) => entry.rank),
  [1, 1, 3, 4],
  'first-place tie must use competition ranks 1,1,3,4',
);

assert.deepEqual(
  withCompetitionRanks([
    { playerId: 0, money: 300 },
    { playerId: 1, money: 250 },
    { playerId: 2, money: 250 },
    { playerId: 3, money: 200 },
  ]).map((entry) => entry.rank),
  [1, 2, 2, 4],
  'second-place tie must use competition ranks 1,2,2,4',
);

assert(scene.includes('demoMatchResult(internals.match)'), 'podium must source ranking from the authoritative match result');
assert(scene.includes('match.players.find'), 'podium names must come from authoritative MatchState players');
assert(scene.includes('gameSession.getFace(entry.playerId, faceExpression)'), 'podium face source must stay presentation-only');
assert(scene.includes("protected podiumFaceExpression") && scene.includes("return 'neutral'"), '0.1.41 default podium face must remain neutral');
assert(scene.includes("1: '🥇'") && scene.includes("2: '🥈'") && scene.includes("3: '🥉'"), 'podium must expose medal ranks');
assert(scene.includes('PODIUM_HEIGHT_BY_RANK'), 'same displayed rank must map to the same podium height');
assert(scene.includes('root.setAlpha(inheritedAlpha)'), 'podium must inherit the 0.1.39 lock/reveal alpha');
assert(scene.includes('internals.shellOverlay.push(root)'), 'podium must join the real result overlay reveal list');
assert(scene.includes("internals.shell.status !== 'ended'"), 'podium must only decorate ended matches');
assert(rankingHelper.includes('previous.money === entry.money ? previous.rank : index + 1'), 'tie ranking helper must preserve competition ranking');
assert(!/submitIntent\s*\(/.test(executableScene), 'podium must not submit gameplay intents');
assert(!/submitSystemIntent\s*\(/.test(executableScene), 'podium must not submit host-system gameplay commands');
assert(!/Math\.random\s*\(/.test(executableScene), 'podium must not add presentation randomness');
assert(!/\.money\s*[+\-*/]?=/.test(executableScene), 'podium must not mutate wallet state');
assert(parent.includes('extends CareerMinigameBoardScene039'), '0.1.41 must retain the 0.1.39 final-result gate through 0.1.40');
assert(finalGate.includes('shouldDeferResultOverlay') || finalGate.includes('shellOverlay.length === 0'), 'final result defer chain must remain present');

console.log('[final-podium-041] PASS authoritative result + competition ties + presentation-only podium');
