import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');

// This is a retained .21 Job-layout regression, not a freeze on future UI patch IDs.
assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// 0.1.71 ownership reset: the final active scene is the canonical owner,
// but it no longer scavenges/hides/restores arbitrary Text every frame.
assert.match(active, /readonly canonicalUiOwner071 = true/);
const updateStart = active.indexOf('  update(): void {');
const runtimeStart = active.indexOf('  private runtime07044()', updateStart);
const activeUpdate = active.slice(updateStart, runtimeStart);
assert.doesNotMatch(activeUpdate, /syncFinalModalOwnership070421/);
assert.doesNotMatch(activeUpdate, /syncCanonicalCinematicOwnership070417/);
assert.doesNotMatch(activeUpdate, /retireLegacyPresentationOverlays070414/);
assert.doesNotMatch(active, /POST_UPDATE, postUpdateOwner/);
assert.match(active, /setCinematicRenderer070427/);
assert.match(active, /showCanonicalJobLanding070411/);

// Job result is a compact centered career card instead of split left/right copy.
assert.match(active, /const displayTitle = isResult \? 'ĐÃ NHẬN VIỆC' : '3 NGHỀ ĐANG CHỜ'/);
assert.match(active, /fillStyle\(0xfff8ec/);
assert.match(active, /fixedWidth: 620/);
assert.match(active, /chạm để tiếp tục/);

// Job Hub carries only one glanceable salary row per card and detail on demand.
assert.match(picker, /JOB_CARD_X_070421 = \[-300, 0, 300\]/);
assert.match(picker, /JOB_HUB_VF06\.cardWidth,\n      JOB_HUB_VF06\.cardHeight/);
assert.ok(
  picker.includes('`Lv1 ${jobSalary(job, 1)}  •  Lv2 ${jobSalary(job, 2)}  •  Lv3 ${jobSalary(job, 3)} B$`'),
  'VF-06 keeps exactly one compact Lv1/Lv2/Lv3 salary row per card',
);
assert.doesNotMatch(picker, /LƯƠNG Lv1 • Lv2 • Lv3/, 'VF-06 replaces the redundant second salary label with one compact salary row');
assert.match(picker, /XEM CHI TIẾT/);
assert.doesNotMatch(picker, /Đổ xúc xắc để chọn nghề/);
assert.doesNotMatch(picker, /LƯƠNG KHỞI ĐIỂM/);
assert.doesNotMatch(picker, /Arial Rounded MT Bold/);
assert.doesNotMatch(picker, /Math\.random\s*\(/);
assert.doesNotMatch(picker, /rollD6\s*\(/);

console.log('[final-modal-career-layout-070421] PASS canonical single-owner modal path + compact Job Hub/result layout');
