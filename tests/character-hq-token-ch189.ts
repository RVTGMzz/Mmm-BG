import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');

assert(source.includes("const CHARACTER_HQ_ATLAS_KEY_CH189 = 'character-walk-atlas-hq-ch189';"));
assert(source.includes('const CHARACTER_HQ_SOURCE_FRAME_CH189 = 48;'));
assert(source.includes('const CHARACTER_HQ_FRAME_CH189 = 192;'));
assert(source.includes('const CHARACTER_HQ_COLUMNS_CH189 = 8;'));
assert(source.includes('const CHARACTER_HQ_ROWS_CH189 = 5;'));
assert(source.includes("publicAssetUrl('assets/characters/ch181/walk-atlas-hq-x4.svg')"));
assert(source.includes('setFilter(Phaser.Textures.FilterMode.LINEAR)'));
assert(source.includes("CHARACTER_HQ_ATLAS_KEY_CH189, row * 8"));
assert(source.includes('setDisplaySize(CHARACTER_TOKEN_DISPLAY_CH189, CHARACTER_TOKEN_DISPLAY_CH189)'));

assert(source.includes('character-foot-ring-ch189-p'));
assert(source.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(source.includes('CHARACTER_FOOT_RING_WIDTH_CH189 = 78'));
assert(source.includes('CHARACTER_FOOT_RING_HEIGHT_CH189 = 18'));
assert(source.includes('visual.token.addAt(footRing, 0)'));
assert(source.includes('visual.token.addAt(sprite, 1)'));
assert(source.includes('legacyHalo?.setVisible(false)'));

assert(source.includes('visual.token.setScale(1)'));
assert(source.includes('runtime.tokenHalos?.get(player.id)'));
assert(source.includes('Math.floor(this.time.now / 90) % 8'));
assert(source.includes('sprite.setFlipX(dx < 0)'));
assert(!source.includes('Math.random()'));

console.log('[character-hq-token-ch189] PASS x4 frame remaster + foot-only active ring + Character scale normalization');
