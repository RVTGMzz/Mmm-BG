import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');

// This is a retained .21 Job-layout regression, not a freeze on future UI patch IDs.
assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// Final active scene, not an old inherited wrapper, owns the last visible frame.
assert.match(active, /hiddenFinalModalText070421/);
assert.match(active, /this\.syncFinalModalOwnership070421\(\);/);
assert.match(
  active,
  /if \(this\.compactLandscape07044\) this\.syncMobileLandscapeUi07044\(\);[\s\S]*this\.syncFinalModalOwnership070421\(\);/,
);
assert.match(active, /findNamedTopLevelContainer070421\('job-detail-modal'\)/);
assert.match(active, /findNamedTopLevelContainer070421\('job-hub-modal'\)/);
assert.match(active, /canonical\.has\(object\) \|\| protectedObjects\.has\(object\)/);
assert.match(active, /root\.name !== 'presentation-reaction-bubble-070422'/);
assert.match(active, /restoreFinalModalText070421/);

// Job result is a compact centered career card instead of split left/right copy.
assert.match(active, /const displayTitle = isResult \? 'ĐÃ NHẬN VIỆC' : '3 NGHỀ ĐANG CHỜ'/);
assert.match(active, /fillStyle\(0xfff8ec/);
assert.match(active, /fixedWidth: 540/);
assert.match(active, /chạm để tiếp tục/);

// Job Hub carries only one glanceable salary row per card and detail on demand.
assert.match(picker, /JOB_CARD_X_070421 = \[-286, 0, 286\]/);
assert.match(picker, /250,\n      230/);
assert.ok(
  picker.includes('`Lv1 ${jobSalary(job, 1)}  •  Lv2 ${jobSalary(job, 2)}  •  Lv3 ${jobSalary(job, 3)} B$`'),
  'VF-06 keeps exactly one compact Lv1/Lv2/Lv3 salary row per card',
);
assert.doesNotMatch(picker, /LƯƠNG Lv1 • Lv2 • Lv3/, 'VF-06 replaces the redundant second salary label with one compact salary row');
assert.match(picker, /XEM CHI TIẾT/);
assert.match(picker, /Đổ xúc xắc để chọn nghề/);
assert.doesNotMatch(picker, /LƯƠNG KHỞI ĐIỂM/);
assert.doesNotMatch(picker, /Arial Rounded MT Bold/);
assert.doesNotMatch(picker, /Math\.random\s*\(/);
assert.doesNotMatch(picker, /rollD6\s*\(/);

console.log('[final-modal-career-layout-070421] PASS no loose modal bleed + compact Job Hub/result layout');
