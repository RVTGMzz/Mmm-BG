import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import {
  chooseAutoBranchEdge,
  DEFAULT_PREVIEW_BRANCH_MODE,
  DEFAULT_PREVIEW_SEED,
  derivePreviewBranchSeed,
  resolvePreviewBranchMode,
  resolvePreviewSeed,
} from '../src/core/previewBranchMode054';
import { createRandomSource, createRngState } from '../src/core/rng';

assert.equal(DEFAULT_PREVIEW_BRANCH_MODE, 'auto');
assert.equal(resolvePreviewBranchMode(null), 'auto');
assert.equal(resolvePreviewBranchMode('AUTO'), 'auto');
assert.equal(resolvePreviewBranchMode('manual'), 'manual');
assert.equal(resolvePreviewBranchMode('anything-else'), 'auto');
assert.equal(resolvePreviewSeed(null), DEFAULT_PREVIEW_SEED);
assert.equal(resolvePreviewSeed('5454'), 5454);
assert.equal(resolvePreviewSeed('not-a-number'), DEFAULT_PREVIEW_SEED);

const edges = ['LEFT', 'RIGHT'] as const;
assert.equal(chooseAutoBranchEdge(edges, () => 0), 'LEFT');
assert.equal(chooseAutoBranchEdge(edges, () => 0.999999), 'RIGHT');

const seed = derivePreviewBranchSeed(5454);
const a = createRandomSource(createRngState(seed));
const b = createRandomSource(createRngState(seed));
const sequenceA = Array.from({ length: 12 }, () => chooseAutoBranchEdge(edges, a));
const sequenceB = Array.from({ length: 12 }, () => chooseAutoBranchEdge(edges, b));
assert.deepEqual(sequenceA, sequenceB, 'same seed must reproduce the same AUTO branch sequence');

const adapter = await readFile('src/scenes/installPreviewBranchMode054.ts', 'utf8');
const main = await readFile('src/main.ts', 'utf8');
const server = await readFile('public/serve-playtest.ps1', 'utf8');
const previewLauncher = await readFile('public/START_DRAFT_D_PREVIEW.bat', 'utf8');
const playtestLauncher = await readFile('public/START_PLAYTEST.bat', 'utf8');
const fullMapLauncher = await readFile('public/START_DRAFT_D_FULL_MAP.bat', 'utf8');

assert(adapter.includes("runtime.__branchMode054 === 'manual'"), 'preview adapter must preserve manual route selection');
assert(adapter.includes('chooseAutoBranchEdge'), 'preview adapter must support automatic route selection');
assert(adapter.includes('NHÁNH: AUTO'), 'preview must expose AUTO/MANUAL toggle in fixed UI');
assert(main.includes('installPreviewBranchMode054'), 'finalmap=3 must install the 0.1.54 preview adapter');
assert(server.includes('finalmap=3&seed=5454&branch=auto'), 'Draft D launcher must default to deterministic AUTO mode');
assert(previewLauncher.includes('AUTO BRANCH'), 'preview launcher must explain AUTO mode');
assert(playtestLauncher.includes('serve-playtest.ps1'), 'START_PLAYTEST remains the standard gameplay launcher');
assert(fullMapLauncher.includes('-DraftDFullMap'), 'full-map review launcher must remain available');

let legacyExists = true;
try {
  await access('public/START_FINAL_MAP_PREVIEW.bat');
} catch {
  legacyExists = false;
}
assert.equal(legacyExists, false, 'legacy 0.1.50 launcher must not be shipped from public/');

console.log('[preview-branch-mode-054] PASS AUTO default + seed reproducibility + MANUAL toggle + 3-role launcher policy');
