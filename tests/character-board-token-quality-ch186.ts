import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
const setup = await readFile('src/scenes/SetupScene.ts', 'utf8');
const composite = await readFile('src/core/characterFaceCompositeCh02d.ts', 'utf8');
const manifest = await readFile('src/content/core/character_art_manifest_v01.ts', 'utf8');
const camera = await readFile('src/ui/FaceCameraCapture07033.ts', 'utf8');

assert(board.includes('const CHARACTER_TOKEN_SIZE_CH186 = 96;'));
assert(board.includes("setFilter(Phaser.Textures.FilterMode.NEAREST)"));
assert(board.includes('character-walk-token-ch186-p'));
assert(board.includes('.setOrigin(0.5, CHARACTER_TOKEN_ORIGIN_Y_CH186)'));
assert(board.includes('const CHARACTER_BADGE_X_CH186 = 38;'));
assert(board.includes('Math.floor(this.time.now / 90) % 8'));
assert(board.includes('sprite.setFlipX(dx < 0)'));
assert(!board.includes('Math.random()'));

assert(setup.includes('resolveCharacterFaceCompositeCh02d(player.faces'));
assert(composite.includes("sourceKind: 'non-circular'"));
assert(manifest.includes('Prefer a generous irregular head-safe mask over a'));
assert(camera.includes('navigator.mediaDevices.getUserMedia'));
assert(camera.includes('frameToFile'));

console.log('[character-board-token-quality-ch186] PASS crisp 96px board token + existing face-socket contract retained');