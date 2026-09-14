import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  PODIUM_REVEAL_TWEEN_MS,
  podiumRevealCompleteMs,
  podiumRevealDelayForRank,
} from '../src/ui/podiumReveal';

const scene = await readFile('src/scenes/CareerMinigameBoardScene044.ts', 'utf8');
const nextWrapper = await readFile('src/scenes/CareerMinigameBoardScene045.ts', 'utf8');
const executableScene = scene
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert(
  podiumRevealCompleteMs() > podiumRevealDelayForRank(1) + PODIUM_REVEAL_TWEEN_MS,
  'result controls must stay blocked slightly beyond the final rank-1 reveal tween',
);
assert(scene.includes('extends CareerMinigameBoardScene043'), '0.1.44 must retain the 0.1.43 reveal cascade');
assert(scene.includes("internals.shell.status !== 'ended'"), 'result gate must reset when the match is no longer ended');
assert(scene.includes('internals.shellOverlay.length === 0'), 'result gate must not arm before a real result overlay exists');
assert(scene.includes('.setDepth(979)'), '0.1.44 blocker must sit above result controls and below the 0.1.39 lock blocker');
assert(scene.includes('.setInteractive()'), '0.1.44 blocker must capture result clicks');
assert(scene.includes('podiumRevealCompleteMs()'), 'result gate release must use the deterministic podium completion helper');
assert(scene.includes('this.resetPodiumRevealInputGate()'), 'result gate must clean up on rematch/shutdown');
assert(!/submitIntent\s*\(/.test(executableScene), '0.1.44 result gate must not submit gameplay intents');
assert(!/submitSystemIntent\s*\(/.test(executableScene), '0.1.44 result gate must not submit host-system commands');
assert(!/Math\.random\s*\(/.test(executableScene), '0.1.44 result gate must not add randomness');
assert(!/\.money\s*[+\-*/]?=/.test(executableScene), '0.1.44 result gate must not mutate wallet state');
assert(nextWrapper.includes('extends CareerMinigameBoardScene044'), 'later builds must retain the 0.1.44 result gate in the inheritance chain');

console.log('[podium-result-gate-044] PASS controls unlock only after final podium reveal completes');
