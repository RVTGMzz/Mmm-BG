import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  podiumFaceExpressionForRank,
  shouldSpotlightPodiumRank,
} from '../src/ui/podiumFaceReaction';

const scene = await readFile('src/scenes/CareerMinigameBoardScene042.ts', 'utf8');
const parent = await readFile('src/scenes/CareerMinigameBoardScene041.ts', 'utf8');
const helper = await readFile('src/ui/podiumFaceReaction.ts', 'utf8');
const executableScene = scene
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert.equal(podiumFaceExpressionForRank(1), 'happy', 'rank 1 should prefer happy face');
assert.equal(podiumFaceExpressionForRank(2), 'neutral', 'rank 2 should use neutral face');
assert.equal(podiumFaceExpressionForRank(3), 'neutral', 'rank 3 should use neutral face');
assert.equal(podiumFaceExpressionForRank(4), 'angry', 'rank 4 should prefer angry face');
assert.equal(shouldSpotlightPodiumRank(1), true, 'rank 1 should receive winner spotlight');
assert.equal(shouldSpotlightPodiumRank(2), false, 'rank 2 should not receive winner spotlight');
assert.equal(shouldSpotlightPodiumRank(3), false, 'rank 3 should not receive winner spotlight');
assert.equal(shouldSpotlightPodiumRank(4), false, 'rank 4 should not receive winner spotlight');
assert(
  [1, 1, 3, 4].filter(shouldSpotlightPodiumRank).length === 2,
  'every tied rank-1 entry should independently receive the same winner spotlight',
);

assert(scene.includes('extends CareerMinigameBoardScene041'), '0.1.42 must extend the authoritative 0.1.41 podium');
assert(scene.includes('podiumFaceExpressionForRank(entry.rank)'), '0.1.42 must map podium expression from displayed rank');
assert(scene.includes('shouldSpotlightPodiumRank(entry.rank)'), '0.1.42 spotlight must depend only on displayed rank');
assert(scene.includes("'👑'"), 'winner spotlight must include the fixed crown');
assert(scene.includes("'✦'"), 'winner spotlight must include fixed spark decorations');
assert(parent.includes('gameSession.getFace(entry.playerId, faceExpression)'), 'parent podium must consume the overridable face expression');
assert(parent.includes('decoratePodiumSlot(slot, entry, 0, faceY)'), 'parent podium must expose the decoration hook on a per-slot container');
assert(helper.includes("return 'happy'") && helper.includes("return 'angry'") && helper.includes("return 'neutral'"), 'face helper must contain all deterministic expression mappings');
assert(!/submitIntent\s*\(/.test(executableScene), '0.1.42 podium polish must not submit gameplay intents');
assert(!/submitSystemIntent\s*\(/.test(executableScene), '0.1.42 podium polish must not submit host-system commands');
assert(!/Math\.random\s*\(/.test(executableScene), '0.1.42 podium polish must not introduce presentation RNG');
assert(!/\.money\s*[+\-*/]?=/.test(executableScene), '0.1.42 podium polish must not mutate wallet state');

console.log('[podium-face-reaction-042] PASS deterministic face reactions + tied-winner spotlight + presentation-only invariants');
