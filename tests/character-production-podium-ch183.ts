import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { characterProductionPortraitFrameCh182 } from '../src/ui/characterProductionArtCh181';

assert.equal(characterProductionPortraitFrameCh182('starter-crybaby', 'happy'), 1);
assert.equal(characterProductionPortraitFrameCh182('starter-grumpy', 'angry'), 10);
assert.equal(characterProductionPortraitFrameCh182('secret-baby', 'neutral'), 32);

const source = await readFile('src/scenes/CareerMinigameBoardScene041.ts', 'utf8');
assert(source.includes("setName('character-production-podium-avatar-ch183')"));
assert(source.includes('characterProductionPortraitFrameCh182(characterId, faceExpression)'));
assert(source.includes('CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182'));
assert(
  source.indexOf('faceAsset && this.textures.exists(faceAsset.textureKey)')
    < source.indexOf('const productionFrame = characterProductionPortraitFrameCh182'),
  'uploaded player face must stay higher priority than podium Character portrait',
);
assert(source.includes('podiumFaceExpression(entry)'), 'rank-based face expression must remain authoritative for presentation');
assert(!source.includes('Math.random()'));

console.log('[character-production-podium-ch183] PASS rank expression + custom-face priority + Character portrait fallback');
