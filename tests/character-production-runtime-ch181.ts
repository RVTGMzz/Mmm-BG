import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const setup = await readFile('src/scenes/SetupScene.ts', 'utf8');
const css = await readFile('src/characterSelectCh02c.css', 'utf8');
const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');

const assets = [
  ['starter portrait atlas', 'public/assets/characters/ch181/portrait-atlas-starters.webp', 20_000],
  ['Secret Baby portrait atlas', 'public/assets/characters/ch181/portrait-atlas-secret-baby.webp', 5_000],
  ['walk atlas', 'public/assets/characters/ch181/walk-atlas.webp', 20_000],
] as const;

for (const [label, path, minimum] of assets) {
  const data = await readFile(path);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', `${label} must be RIFF/WebP`);
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', `${label} must be WebP`);
  assert.ok(data.length > minimum, `${label} is suspiciously small`);
}

assert(setup.includes('character-production-portrait-ch181'));
assert(setup.includes('portrait-atlas-starters.webp'));
assert(!setup.includes('portrait-atlas-secret-baby.webp'), 'normal Character Select must not preload Secret Baby portrait art');
assert(css.includes('background-size: 800% 400%'));
assert(css.includes('character-production-portrait-starter-hyper'));

assert(board.includes("'character-walk-atlas-ch181'"));
assert(board.includes('{ frameWidth: 48, frameHeight: 48 }'));
assert(board.includes("if (characterId === 'secret-baby') return 4;"));
assert(board.includes('Math.floor(this.time.now / 90) % 8'));
assert(board.includes('sprite.setFlipX(dx < 0)'));
assert(!board.includes('Math.random()'), 'CH-18.1 presentation runtime must not introduce client RNG');

console.log('[character-production-runtime-ch181] PASS approved portraits + 8-frame board walk atlas + Secret-safe select');
