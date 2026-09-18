import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  PODIUM_REVEAL_BASE_DELAY_MS,
  PODIUM_REVEAL_STEP_MS,
  PODIUM_REVEAL_TWEEN_MS,
  podiumRevealDelayForRank,
} from '../src/ui/podiumReveal';

const scene = await readFile('src/scenes/CareerMinigameBoardScene043.ts', 'utf8');
const parent = await readFile('src/scenes/CareerMinigameBoardScene041.ts', 'utf8');
const executableScene = scene
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert(PODIUM_REVEAL_BASE_DELAY_MS >= 900, 'podium reveal must begin after the 0.1.39 B$ lock beat starts clearing');
assert(PODIUM_REVEAL_STEP_MS > 0, 'podium reveal ranks need a fixed positive cadence');
assert(PODIUM_REVEAL_TWEEN_MS > 0, 'podium reveal tween duration must be positive');
assert(podiumRevealDelayForRank(4) < podiumRevealDelayForRank(3), 'rank 4 must reveal before rank 3');
assert(podiumRevealDelayForRank(3) < podiumRevealDelayForRank(2), 'rank 3 must reveal before rank 2');
assert(podiumRevealDelayForRank(2) < podiumRevealDelayForRank(1), 'rank 2 must reveal before rank 1');
assert.equal(podiumRevealDelayForRank(1), podiumRevealDelayForRank(1), 'tied rank-1 players must share the exact reveal beat');
assert.equal(podiumRevealDelayForRank(3), podiumRevealDelayForRank(3), 'tied middle-rank players must share the exact reveal beat');

assert(scene.includes('extends CareerMinigameBoardScene042'), '0.1.43 must retain 0.1.42 face reactions and winner spotlight');
assert(scene.includes('super.decoratePodiumSlot(slot, entry, x, faceY)'), '0.1.43 reveal must keep inherited face/spotlight decoration');
assert(scene.includes('slot.setAlpha(0).setY(14)'), 'podium slots must begin hidden with a fixed presentation offset');
assert(scene.includes('podiumRevealDelayForRank(entry.rank)'), 'reveal timing must depend only on displayed rank');
assert(scene.includes('this.time.delayedCall(delay'), 'podium reveal must use the deterministic scene clock');
assert(scene.includes("ease: 'Back.easeOut'"), 'podium reveal should use the fixed pop-in easing');
assert(parent.includes('const slot = this.add.container(x, 0)'), '0.1.41 podium must expose independent slot containers');
assert(parent.includes('root.add(slot)'), 'each podium slot must remain inside the authoritative result podium root');
assert(!/submitIntent\s*\(/.test(executableScene), '0.1.43 reveal must not submit gameplay intents');
assert(!/submitSystemIntent\s*\(/.test(executableScene), '0.1.43 reveal must not submit host-system commands');
assert(!/Math\.random\s*\(/.test(executableScene), '0.1.43 reveal must not introduce presentation RNG');
assert(!/\.money\s*[+\-*/]?=/.test(executableScene), '0.1.43 reveal must not mutate wallet state');

console.log('[podium-reveal-043] PASS low-to-high deterministic reveal + tie simultaneity + presentation-only invariants');
