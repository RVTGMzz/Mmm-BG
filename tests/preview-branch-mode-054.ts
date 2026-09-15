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
const playtestLauncher = await readFile('public/START_PLAYTEST.bat', 'utf8');

assert(adapter.includes("runtime.__branchMode054 === 'manual'"), 'preview adapter must preserve manual route selection');
assert(adapter.includes('chooseAutoBranchEdge'), 'preview adapter must support automatic route selection');
assert(adapter.includes('NHÁNH: AUTO'), 'preview source must retain the historical AUTO/MANUAL QA toggle');
assert(main.includes('installPreviewBranchMode054'), 'finalmap=3 source route must retain the 0.1.54 preview adapter');
assert(server.includes('finalmap=3&seed=5454&branch=auto'), 'historical preview server route must remain deterministic when explicitly invoked');
assert(playtestLauncher.includes('serve-playtest.ps1'), 'START_PLAYTEST remains the single standard gameplay launcher');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

assert.equal(await exists('public/START_DRAFT_D_PREVIEW.bat'), false, '0.1.66 retires the Draft D preview launcher');
assert.equal(await exists('public/START_DRAFT_D_FULL_MAP.bat'), false, '0.1.66 retires the Draft D full-map launcher');
assert.equal(await exists('public/START_FINAL_MAP_PREVIEW.bat'), false, 'legacy 0.1.50 launcher must stay retired');

console.log('[preview-branch-mode-054] PASS deterministic AUTO/MANUAL preview engine retained in source + 0.1.66 single-launcher shipping policy');
