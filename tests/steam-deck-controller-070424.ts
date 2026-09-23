import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  EMPTY_PAD_STATE_070424,
  axisDirection070424,
  padEdges070424,
  nextSpatialIndex070424,
} from '../src/ui/steamDeckPadPolicy070424';

const pad = (pressed: number[] = [], x = 0, y = 0) => ({
  buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: pressed.includes(i) })),
  axes: [x, y],
});
assert.equal(axisDirection070424(0.4, 0), 0);
assert.equal(axisDirection070424(0.4, 1), 1);
assert.equal(axisDirection070424(0.1, 1), 0);
assert.deepEqual(padEdges070424(pad([0]), EMPTY_PAD_STATE_070424).actions, ['confirm']);
assert.deepEqual(padEdges070424(pad([1])).actions, ['back']);
assert.deepEqual(padEdges070424(pad([2])).actions, ['overview']);
assert.deepEqual(padEdges070424(pad([3])).actions, ['card']);
assert.deepEqual(padEdges070424(pad([9])).actions, ['settings']);
for (const [index, action] of [[12, 'up'], [13, 'down'], [14, 'left'], [15, 'right']] as const) {
  const first = padEdges070424(pad([index]));
  assert.deepEqual(first.actions, [action]);
  assert.deepEqual(padEdges070424(pad([index]), first.next).actions, [], 'held button must not repeat');
  const release = padEdges070424(pad(), first.next);
  assert.deepEqual(padEdges070424(pad([index]), release.next).actions, [action]);
}
const stick = padEdges070424(pad([], -0.95));
assert.deepEqual(stick.actions, ['left']);
assert.deepEqual(padEdges070424(pad([], -0.95), stick.next).actions, []);
const centered = padEdges070424(pad([], 0), stick.next);
assert.deepEqual(padEdges070424(pad([], -0.95), centered.next).actions, ['left']);
// Simultaneous stick + D-pad only navigates once, before confirm.
assert.deepEqual(padEdges070424(pad([14, 0], -0.9)).actions, ['left', 'confirm']);
const points = [{ x: 100, y: 0 }, { x: 200, y: 0 }, { x: 300, y: 0 }];
assert.equal(nextSpatialIndex070424(1, points, 'left'), 0);
assert.equal(nextSpatialIndex070424(1, points, 'right'), 2);
assert.equal(nextSpatialIndex070424(2, points, 'right'), 0);
assert.equal(nextSpatialIndex070424(0, points, 'left'), 2);
assert.equal(nextSpatialIndex070424(0, [], 'right'), -1);

const main = readFileSync('src/main.ts', 'utf8');
const owner = readFileSync('src/ui/steamDeckController070424.ts', 'utf8');
const job = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const mini = readFileSync('src/ui/MiniGameOverlay.ts', 'utf8');
const dice = readFileSync('src/scenes/DirectDiceBoardScene.ts', 'utf8');
const flow = readFileSync('src/ui/jobHubFocus070423.ts', 'utf8');
assert.match(main, /installSteamDeckController070424\(game\)/);
assert.doesNotMatch(main, /installGlobalGamepadUiNavigation0651\(game\)/);
assert.match(owner, /navigator\.getGamepads\(\)/);
assert.match(owner, /connectedPad !== pad\.index/);
assert.match(owner, /document\.hidden/);
assert.match(owner, /scene\.events\.emit\(PAD_EVENT_070424, action\)/);
assert.match(owner, /if \(minigame\) \{/);
assert.match(owner, /const dom = activeDom070424\(scene\)/);
assert.match(owner, /runtime\.presentation\?\.isBlocking\(\)/);
assert.match(owner, /dice\.list\.find/);
assert.match(owner, /roll\.input\?\.enabled/);
assert.match(owner, /runtime\.canControlCurrentPlayer\?\.\(\)/);
assert.match(job, /scene\.events\.on\(PAD_EVENT_070424, padHandler\)/);
assert.match(job, /scene\.events\.off\(PAD_EVENT_070424, padHandler\)/);
assert.match(job, /let focused: JobHubFocus = canRoll \? 'roll' : 0/);
assert.match(job, /if \(focused === 'roll'\) submitRoll\(\)/);
assert.match(job, /if \(detailRoot\?\.active\)/);
assert.match(flow, /Spectators can browse details/);
assert.match(mini, /navigator\.getGamepads/);
assert.match(dice, /setName\('direct-turn-dice'\)/);
for (const path of [
  'src/ui/CardHandPicker.ts', 'src/ui/TargetPicker.ts',
  'src/ui/TacticalChoicePicker.ts', 'src/ui/BranchPicker.ts',
]) assert.match(readFileSync(path, 'utf8'), /setName\('[a-z-]+-modal'\)/);
for (const src of [owner, job]) {
  assert.doesNotMatch(src, /Math\.random\s*\(/);
  assert.doesNotMatch(src, /submitIntent\s*\(/);
}
console.log('[steam-deck-070424] PASS Gamepad edges, standard ABXY, D-pad/stick, DOM menu, single modal owner, Job keyboard focus, guarded D6');
