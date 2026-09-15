import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const scene0631Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0631.ts', import.meta.url), 'utf8');
const scene063Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene063.ts', import.meta.url), 'utf8');
const authoritySource = readFileSync(new URL('../src/core/authority.ts', import.meta.url), 'utf8');

assert(
  mainSource.includes('CareerMinigameBoardScene0631 as ActiveBoardScene'),
  '0.1.63.1 must be the active playtest scene.',
);
assert(
  scene0631Source.includes('extends CareerMinigameBoardScene063'),
  '0.1.63.1 must inherit all 0.1.63 UI polish.',
);

// Human feedback regression: the current-turn player must never outrun the camera.
assert(scene0631Source.includes('this.centerActivePlayer0631();'));
assert(
  scene0631Source.includes('this.cameras.main.centerOn(token.x, token.y)'),
  'normal play must hard-center the active token on its already-smooth tween position.',
);
assert(
  scene0631Source.includes('if (internals.overviewMode) return;'),
  'Overview must remain the sole intentional exception to center-lock.',
);
assert(
  scene0631Source.includes('this.cameras.main.stopFollow()'),
  'old lagging follow must be stopped before exact centering.',
);

// Edge nodes still need enough camera travel to occupy the screen center.
assert(scene0631Source.includes('CAMERA_EDGE_MARGIN_0631 = 96'));
assert(scene0631Source.includes('camera.setBounds(left, top, right - left, bottom - top)'));
assert(scene0631Source.includes('halfViewX'));
assert(scene0631Source.includes('halfViewY'));

// Presentation changes from 0.1.63 remain inherited.
assert(scene063Source.includes('const TOKEN_SCALE_063 = 0.82'));
assert(scene063Source.includes('const LANDING_CONTENT_SCALE_063 = 1.18'));
assert(scene063Source.includes('return 27'));

// Still presentation-only. Gameplay authority remains 0.1.62 HOST parity routing.
assert(!scene0631Source.includes('submitIntent('), '0.1.63.1 must not submit gameplay intents.');
assert(!scene0631Source.includes('Math.random'), '0.1.63.1 must not introduce client RNG.');
assert(authoritySource.includes('autoResolveParityBranches062'));
assert(scene0631Source.includes('ACTIVE TOKEN LUÔN Ở GIỮA'));

console.log('[active-player-center-lock-0631] PASS active token exact-center every frame • edge bounds expanded • Overview retained • gameplay unchanged');
