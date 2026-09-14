import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  FINAL_MAP_PREVIEW_052,
  canReleaseFrom,
  lotteryRewardForRoll,
} from '../src/core/finalMapPreview052';

assert(FINAL_MAP_PREVIEW_052.normalFollowZoom >= 1.6, '0.1.52 gameplay camera must be materially closer than 0.1.51');
assert(FINAL_MAP_PREVIEW_052.branchDecisionZoom > 1, 'branch decision should remain closer than a full-map view');
assert(FINAL_MAP_PREVIEW_052.overviewZoom <= 0.55, 'overview must fit the Draft D board');
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
const main = await readFile('src/main.ts', 'utf8');
const server = await readFile('public/serve-playtest.ps1', 'utf8');
const launcher = await readFile('public/START_DRAFT_D_PREVIEW.bat', 'utf8');
const fullMapLauncher = await readFile('public/START_DRAFT_D_FULL_MAP.bat', 'utf8');

assert(scene.includes("this.cameras.add(0, 0, VIEW_W, VIEW_H, false, 'ui-052')"), '0.1.52 must use a separate UI camera');
assert(scene.includes('this.uiCamera.ignore(worldObjects)'), 'UI camera must ignore world objects');
assert(scene.includes('this.cameras.main.ignore(this.uiLayer)'), 'world camera must ignore the fixed UI layer');
assert(scene.includes("params.get('overview') === '1'"), 'scene must support direct persistent overview mode');
assert(scene.includes("'↩ TRỞ LẠI LƯỢT'"), 'overview must stay open until the user returns');
assert(scene.includes('this.uiLayer?.add(root)'), 'route-choice popup must live in the fixed UI layer');
assert(main.includes("finalMapMode === '3'") && main.includes('FinalMapPreviewScene052'), 'main must route finalmap=3 to 0.1.52');
assert(server.includes('finalmap=3&overview=1'), 'server must expose persistent full-map review mode');
assert(launcher.includes('-DraftDPreview'), 'normal Draft D launcher must use the 0.1.52 route');
assert(fullMapLauncher.includes('-DraftDFullMap'), 'full-map launcher must open the new Draft D overview');

console.log('[final-map-preview-052] PASS fixed UI camera + closer follow + persistent Draft D full-map review');
