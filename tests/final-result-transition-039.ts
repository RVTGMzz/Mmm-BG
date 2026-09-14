import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const scene = await readFile('src/scenes/CareerMinigameBoardScene039.ts', 'utf8');
const main = await readFile('src/main.ts', 'utf8');
const flow = await readFile('src/scenes/PresentationParityBoardScene.ts', 'utf8');
const executableScene = scene
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert(scene.includes("internals.shell.status !== 'ended'"), 'final transition must only arm for ended shell state');
assert(scene.includes('internals.shellOverlay.length === 0'), 'final transition must respect an empty/deferred result overlay');
assert(scene.includes('originalRenderShellOverlay();'), 'final transition must decorate the existing authoritative result overlay');
assert(scene.includes('setInteractive()'), 'final transition needs an input blocker while result buttons are hidden');
assert(scene.includes('demoMatchLapProgress'), 'final transition should report authoritative lap completion progress');
assert(!/submitIntent\s*\(/.test(executableScene), 'final result presentation must not submit gameplay intents');
assert(!/submitSystemIntent\s*\(/.test(executableScene), 'final result presentation must not submit host-system gameplay commands');
assert(!/Math\.random\s*\(/.test(executableScene), 'final result presentation must not call Math.random');
assert(!/\.money\s*\+=/.test(executableScene), 'final result presentation must not mutate wallet state');
assert(main.includes('CareerMinigameBoardScene039'), 'main runtime must use the 0.1.39 scene');
assert(
  flow.includes('shouldDeferResultOverlay') && flow.includes("internals.shell.status === 'ended'"),
  'PresentationParity result defer gate must remain in the inheritance chain',
);

console.log('[final-result-transition-039] PASS ended-only + queue-gated + presentation-only final B$ reveal');
