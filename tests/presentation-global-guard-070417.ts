import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const strictModal = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const finalScene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// Invisible move_step blocker is flow state, not a visual modal.
assert.match(strictModal, /!blockingRoot\?\.active \|\| !blockingRoot\.visible/);
assert.match(strictModal, /move_step owns an invisible flow blocker/);

// Final Card/News ownership is semantic and content-agnostic.
assert.match(finalScene, /syncCanonicalCinematicOwnership070417\(\)/);
assert.match(finalScene, /model\.kind === 'card_draw'/);
assert.match(finalScene, /model\.kind === 'card_play'/);
assert.match(finalScene, /model\.kind === 'card_blocked'/);
assert.match(finalScene, /model\.kind === 'news'/);
assert.match(finalScene, /const ownedValues = \[/);
assert.match(finalScene, /model\.description/);
assert.match(finalScene, /model\.summary/);
assert.match(finalScene, /isDetachedCinematicCopy070423\(object\.text, ownedValues\)/);
assert.match(finalScene, /hiddenDetachedCinematicText070417/);
assert.doesNotMatch(finalScene, /Phí Thành Phố Đồng Loạt/);

// Token seat badge is an invariant, not a one-off movement patch.
assert.match(finalScene, /ensurePlayerTokenBadges070417\(\)/);
assert.match(finalScene, /runtime\.visuals\.get\(player\.id\)\?\.token/);
assert.match(finalScene, /child\.text\.trim\(\) === expected/);
assert.match(finalScene, /Math\.abs\(child\.x - 21\) <= 4/);
assert.match(finalScene, /setColor\('#ffffff'\)/);
assert.match(finalScene, /setAlpha\(1\)/);
assert.match(finalScene, /setVisible\(true\)/);

console.log('[presentation-global-guard-070417] PASS generic cinematic single-owner + invisible move blocker + token badge invariant');
