import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  FINAL_MAP_PREVIEW_052,
  canReleaseFrom,
  lotteryRewardForRoll,
} from '../src/core/finalMapPreview052';

assert(FINAL_MAP_PREVIEW_052.normalFollowZoom >= 1.6, '0.1.52 gameplay camera must be materially closer than 0.1.51');
assert(FINAL_MAP_PREVIEW_052.branchDecisionZoom > 1, 'branch decision should remain closer than a full-map view');
assert(FINAL_MAP_PREVIEW_052.overviewZoom <= 0.55, 'legacy in-scene overview must still fit Draft D');
assert.equal(FINAL_MAP_PREVIEW_052.branchJunctionNodeIds.length, 3, 'Draft D keeps exactly three decision junctions');
assert.deepEqual(FINAL_MAP_PREVIEW_052.branchJunctionNodeIds, [3, 16, 34]);

assert(canReleaseFrom('jail', 1));
assert(canReleaseFrom('jail', 3));
assert(canReleaseFrom('jail', 5));
assert(!canReleaseFrom('jail', 2));
assert(canReleaseFrom('hospital', 2));
assert(canReleaseFrom('hospital', 4));
assert(canReleaseFrom('hospital', 5));
assert(!canReleaseFrom('hospital', 6));
assert.equal(lotteryRewardForRoll(6), 120);

const scene = await readFile('src/scenes/FinalMapPreviewScene052.ts', 'utf8');
const fullMapScene = await readFile('src/scenes/FullMapReviewScene053.ts', 'utf8');
const main = await readFile('src/main.ts', 'utf8');
const server = await readFile('public/serve-playtest.ps1', 'utf8');

assert(scene.includes("this.cameras.add(0, 0, VIEW_W, VIEW_H, false, 'ui-052')"), '0.1.52 must use a separate UI camera');
assert(scene.includes('this.uiCamera.ignore(worldObjects)'), 'UI camera must ignore world objects');
assert(scene.includes('this.cameras.main.ignore(this.uiLayer)'), 'world camera must ignore the fixed UI layer');
assert(scene.includes("params.get('overview') === '1'"), '0.1.52 scene keeps its legacy direct overview capability');
assert(scene.includes("'↩ TRỞ LẠI LƯỢT'"), 'in-scene overview must stay open until the user returns');
assert(scene.includes('this.uiLayer?.add(root)'), 'route-choice popup must live in the fixed UI layer');
assert(main.includes("finalMapMode === '3'") && main.includes('FinalMapPreviewScene052'), 'legacy query route remains available for source-level QA');
assert(main.includes("finalMapMode === '4'") && main.includes('FullMapReviewScene053'), 'legacy full-map source route remains regression-testable');
assert(server.includes('?finalmap=4'), 'server may retain the legacy QA route even though tester BATs are retired');
assert(fullMapScene.includes('fitWholeBoard()'), 'dedicated full-map scene must fit the complete board');
assert(!existsSync('public/START_DRAFT_D_PREVIEW.bat'), '0.1.66 intentionally removes the old Draft D preview launcher');
assert(!existsSync('public/START_DRAFT_D_FULL_MAP.bat'), '0.1.66 intentionally removes the old Draft D full-map launcher');

console.log('[final-map-preview-052] PASS fixed UI camera/source QA retained while 0.1.66 ships one unified launcher');
