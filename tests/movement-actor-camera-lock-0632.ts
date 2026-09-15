import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveCameraActor0632 } from '../src/ui/cameraTarget0632';
import type { PresentationEventModel } from '../src/ui/presentationModel';

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const scene0632Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0632.ts', import.meta.url), 'utf8');
const scene0631Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0631.ts', import.meta.url), 'utf8');
const authoritySource = readFileSync(new URL('../src/core/authority.ts', import.meta.url), 'utf8');

const movingP1 = { kind: 'move_step', actorId: 0 } as PresentationEventModel;
const landingP1 = { kind: 'tile_land', actorId: 0 } as PresentationEventModel;

assert.equal(
  resolveCameraActor0632(1, movingP1),
  0,
  'camera must stay on the moving presentation actor even after authoritative turn advances to P2.',
);
assert.equal(
  resolveCameraActor0632(1, landingP1),
  0,
  'camera must keep the just-moved actor framed through landing presentation.',
);
assert.equal(
  resolveCameraActor0632(1, undefined),
  1,
  'once presentation is idle, camera must return to the authoritative current-turn player.',
);
assert.equal(resolveCameraActor0632(undefined, movingP1), 0);
assert.equal(resolveCameraActor0632(undefined, undefined), undefined);

assert(mainSource.includes('CareerMinigameBoardScene0632 as ActiveBoardScene'), '0.1.63.2 must be active.');
assert(scene0632Source.includes('extends CareerMinigameBoardScene0631'), '0.1.63.2 must retain the 0.1.63.1 edge-bounds hotfix.');
assert(scene0632Source.includes('presentation?.currentModel'), 'camera target must use the queued presentation actor.');
assert(scene0632Source.includes('this.lockCameraToPresentationActor0632();'));
assert(scene0632Source.includes('this.cameras.main.centerOn(token.x, token.y)'));
assert(scene0632Source.includes('if (internals.overviewMode) return;'), 'Overview remains the intentional exception.');
assert(scene0631Source.includes('camera.setBounds(left, top, right - left, bottom - top)'), 'expanded edge bounds must remain inherited.');
assert(!scene0632Source.includes('submitIntent('), 'camera patch must remain presentation-only.');
assert(!scene0632Source.includes('Math.random'), 'camera patch must not introduce RNG.');
assert(authoritySource.includes('autoResolveParityBranches062'), '0.1.62 HOST branch authority must remain intact.');

console.log('[movement-actor-camera-lock-0632] PASS visual mover wins over advanced turn state • landing remains framed • idle returns to current turn • Overview retained');
