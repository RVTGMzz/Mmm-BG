import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const legacy = [
  'src/scenes/CareerMinigameBoardScene065.ts',
  'src/scenes/CareerMinigameBoardScene066.ts',
  'src/scenes/CareerMinigameBoardScene067.ts',
  'src/scenes/CareerMinigameBoardScene068.ts',
  'src/scenes/CareerMinigameBoardScene0681.ts',
  'src/scenes/CareerMinigameBoardScene0682.ts',
  'src/scenes/CareerMinigameBoardScene069.ts',
  'src/scenes/CareerMinigameBoardScene0701.ts',
].map((path) => [path, readFileSync(path, 'utf8')] as const);

assert.match(active, /readonly canonicalUiOwner071 = true/);

const updateStart = active.indexOf('  update(): void {');
const runtimeStart = active.indexOf('  private runtime07044()', updateStart);
const activeUpdate = active.slice(updateStart, runtimeStart);
assert.doesNotMatch(activeUpdate, /syncFinalModalOwnership070421/);
assert.doesNotMatch(activeUpdate, /syncCanonicalCinematicOwnership070417/);
assert.doesNotMatch(activeUpdate, /retireLegacyPresentationOverlays070414/);
assert.doesNotMatch(active, /POST_UPDATE, postUpdateOwner/);

for (const [path, source] of legacy) {
  assert.match(source, /isCanonicalUiOwner071/, `${path} must recognize the canonical owner cut-over`);
}

assert.match(legacy.find(([p]) => p.endsWith('066.ts'))![1], /if \(isCanonicalUiOwner071\(this\)\) return;[\s\S]*visitTextTree066/);
assert.match(legacy.find(([p]) => p.endsWith('067.ts'))![1], /if \(isCanonicalUiOwner071\(this\)\)[\s\S]*restoreLegacyJobText067/);
assert.match(legacy.find(([p]) => p.endsWith('0682.ts'))![1], /if \(isCanonicalUiOwner071\(this\)\)[\s\S]*restoreLooseText0682/);
assert.match(legacy.find(([p]) => p.endsWith('069.ts'))![1], /if \(!isCanonicalUiOwner071\(this\)\)/);
assert.match(legacy.find(([p]) => p.endsWith('0701.ts'))![1], /polishMiniGameRanking0701\(\): void \{\s*if \(isCanonicalUiOwner071\(this\)\) return;/);

console.log('[ui-single-owner-071] PASS legacy presentation writers no-op under the live canonical owner');
