import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  JOB_HUB_VF06,
  jobCardPaletteVf06,
  jobHubBoundsVf06,
  jobHubFitsLogicalViewportVf06,
} from '../src/ui/visualFoundationJobVf06';

assert.equal(JOB_HUB_VF06.width, 950);
assert.equal(JOB_HUB_VF06.height, 516);
assert.equal(JOB_HUB_VF06.cardWidth, 250);
assert.equal(JOB_HUB_VF06.cardHeight, 230);
assert.equal(jobHubFitsLogicalViewportVf06(), true);
assert.deepEqual(jobHubBoundsVf06(), { left: 165, right: 1115, top: 102, bottom: 618 });

const a = jobCardPaletteVf06(0, false);
const b = jobCardPaletteVf06(1, false);
const c = jobCardPaletteVf06(2, false);
const risky = jobCardPaletteVf06(1, true);
assert.notEqual(a.accent, b.accent);
assert.notEqual(b.accent, c.accent);
assert.equal(risky.accent, JOB_HUB_VF06.coral);

const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
assert.match(picker, /JOB_HUB_VF06/);
assert.match(picker, /jobCardPaletteVf06\(index, risky\)/);
assert.match(picker, /fontSize: '50px'/);
assert.match(picker, /Lv1 \$\{jobSalary\(job, 1\)\}/);
assert.doesNotMatch(picker, /\$\{job\.icon\}  \$\{job\.title\}/, 'detail title must not repeat the small icon beside the name');
assert.match(picker, /const detailIcon = scene\.add\.text/);
assert.match(picker, /Đổ xúc xắc để chọn nghề/);
assert.match(picker, /XEM CHI TIẾT/);
assert.match(picker, /let focused: JobHubFocus = canRoll \? 'roll' : 0/);
assert.match(picker, /if \(focused === 'roll'\) submitRoll\(\)/);
assert.match(picker, /setName\('job-hub-modal'\)/);
assert.match(picker, /setName\('job-detail-modal'\)/);
assert.doesNotMatch(
  readFileSync('src/ui/visualFoundationJobVf06.ts', 'utf8'),
  /Math\.random|submitIntent\s*\(|MatchState|browserSession/,
);

console.log('[visual-foundation-job-vf06] PASS toy-like Job Hub sample + large icons + concise salary + preserved input ownership');
