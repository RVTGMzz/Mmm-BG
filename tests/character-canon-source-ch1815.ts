import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { CAU_CO_VISUAL_CANON_CH1814 } from '../src/content/core/character_visual_canon_ch1814';
import { CHARACTER_WALK_PRODUCTION_SOURCES_CH1812 } from '../src/content/core/character_walk_production_sources_ch1812';

const authority = CAU_CO_VISUAL_CANON_CH1814.conceptAuthority;
assert.equal(authority.repoAssetPath, 'docs/character-production/canon/cauco.webp');
assert.equal(authority.driveFileName, 'cauco.webp');
assert.equal(authority.driveFileId, '1dZ6Ruav4nnaDy371hrBwTGR-hNkMnUnf');
assert.equal(authority.width, 1122);
assert.equal(authority.height, 1402);
assert.equal(
  authority.sha256,
  'f75435579c1647b07b1a88b3ced312c624c761c54a8ec87c335f5f6093db637e',
);

const source = await readFile(authority.repoAssetPath);
assert.equal(source.subarray(0, 4).toString('ascii'), 'RIFF');
assert.equal(source.subarray(8, 12).toString('ascii'), 'WEBP');
assert.equal(source.length, 168_340, 'pinned CAU CÓ authority bytes changed unexpectedly');
assert.equal(
  createHash('sha256').update(source).digest('hex'),
  authority.sha256,
  'repo CAU CÓ authority must be byte-identical to the approved concept source',
);

for (const anchor of [
  'gold rectangular glasses',
  'brown crown-pattern tie',
  'brown leather suspenders with gold hardware',
  'dark olive pinstripe jacket draped over the shoulders',
  'crown lapel pin and red pocket square',
  'high-waisted brown tailored trousers',
  'dark burgundy-brown loafers with gold chain hardware',
  'brown crown-pattern shoulder work bag / satchel',
  'green gemstone statement ring',
]) {
  assert(CAU_CO_VISUAL_CANON_CH1814.requiredVisualAnchors.includes(anchor), anchor);
}

const grumpyWalk = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find(
  (item) => item.characterId === 'starter-grumpy',
);
assert(grumpyWalk);
assert.equal(grumpyWalk.status, 'awaiting-genuine-strip');
assert.equal(grumpyWalk.productionAssetPath, undefined);

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(!board.includes('docs/character-production/canon/cauco.webp'));
assert(!board.includes('walk-cau-co-production'));
assert(!board.includes('character-walk-grumpy-production'));

console.log('[character-canon-source-ch1815] PASS exact CAU CÓ authority pinned; runtime remains fallback-only');
