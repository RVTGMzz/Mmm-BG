import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  compactHudCopyVf04,
  compactHudPlayerNameVf04,
  clampHudCenterVf04,
  HUD_SKIN_VF04,
  HUD_PLAYER_ACCENTS_VF04,
  hudFramePaletteVf041,
} from '../src/ui/visualFoundationHudVf04';
import { CANONICAL_HUD_POSITIONS_0561 } from '../src/ui/canonicalPresentation0561';
import { playerHudCareer065 } from '../src/ui/playerHud065';
import jobsJson from '../src/content/core/jobs_mvp.json';
import type { JobDefinition } from '../src/core/jobs';
import type { PlayerState } from '../src/core/types';

const jobs = jobsJson as JobDefinition[];
const player = {
  id: 0, name: 'Người chơi kiểm tra', money: 250,
  jobStatus: 'employed', jobId: 'JOB_DOCTOR', jobLevel: 2,
  handCardIds: ['card-a'], cardBlockTurns: 0, lapsCompleted: 0,
} as PlayerState;
const career = playerHudCareer065(player, jobs);
const idle = compactHudCopyVf04(career, false, 1, 0);
const active = compactHudCopyVf04(career, true, 1, 0);
assert.equal(idle.line2, '', 'inactive HUD must not dump salary/card counters');
assert.match(idle.line1, /Bác sĩ/);
assert.match(active.line1, /Lv\.2/);
assert.match(active.line2, /110 B\$\/vòng/);
assert.match(active.line2, /🃏1/);
assert.match(compactHudCopyVf04(career, true, 1, 3).line2, /🔒3/);
assert.equal(compactHudCopyVf04({employed:false, title:'Chưa có nghề', icon:'💼',level:0,salary:0},false,0,0).line1, '💼 Chưa có nghề');
assert.ok(Array.from(compactHudCopyVf04({employed:true,title:'Nhân viên văn phòng và nhiều trách nhiệm',icon:'💼',level:3,salary:100},true,0,0).line1).length < 30);
assert.ok(compactHudPlayerNameVf04(0, 'Nguyễn Hồng Minh Siêu Dài', true).includes('…'));
assert.match(compactHudPlayerNameVf04(3, 'Linh', true), /^▶ P4 • Linh$/);
assert.equal(HUD_SKIN_VF04.width, 268);
assert.equal(HUD_SKIN_VF04.height, 104);
assert.equal(HUD_PLAYER_ACCENTS_VF04.length, 4);
for (let playerId = 0; playerId < 4; playerId += 1) {
  const idle = hudFramePaletteVf041(playerId, false);
  const active = hudFramePaletteVf041(playerId, true);
  assert.equal(idle.outer, HUD_PLAYER_ACCENTS_VF04[playerId]);
  assert.equal(active.outer, HUD_SKIN_VF04.turnGold, `P${playerId + 1} active gets outer gold`);
  assert.equal(active.inner, HUD_PLAYER_ACCENTS_VF04[playerId], `P${playerId + 1} retains inner identity`);
  assert.equal(idle.showTurnMarker, false);
  assert.equal(active.showTurnMarker, true);
}
assert.equal(HUD_SKIN_VF04.identityRingInset - HUD_SKIN_VF04.activeRingInset -
  (HUD_SKIN_VF04.activeRingWidth + HUD_SKIN_VF04.identityRingWidth) / 2, 4,
  'cream gutter between gold and player-colour rings must stay visible');

for (const scale of [0.94, 0.96, 1, 1.18]) {
  for (const point of CANONICAL_HUD_POSITIONS_0561) {
    const pos = clampHudCenterVf04(point.x, point.y, scale);
    const margin = HUD_SKIN_VF04.safeMargin;
    assert.ok(pos.x - HUD_SKIN_VF04.width * scale / 2 >= margin - 1e-6);
    assert.ok(pos.x + HUD_SKIN_VF04.width * scale / 2 <= 1280 - margin + 1e-6);
    assert.ok(pos.y - HUD_SKIN_VF04.height * scale / 2 >= margin - 1e-6);
    assert.ok(pos.y + HUD_SKIN_VF04.height * scale / 2 <= 720 - margin + 1e-6);
  }
}
const scene65 = readFileSync('src/scenes/CareerMinigameBoardScene065.ts', 'utf8');
const scene44 = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const helper = readFileSync('src/ui/visualFoundationHudVf04.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
assert.match(scene65, /drawVisualFoundationHudVf04\(/);
assert.match(scene65, /turnEntryVf041/);
assert.match(scene65, /duration: 220/);
assert.match(scene65, /compactHudCopyVf04\(career, active/);
assert.match(scene65, /compactHudPlayerNameVf04\(player.id, player.name, active\)/);
assert.match(scene44, /this\.syncFoundationHudSafeAreaVf04\(\)/);
assert.match(scene44, /clampHudCenterVf04\(anchor.x, anchor.y, hud.root.scaleX\)/);
assert.match(scene44, /HUD_BASE_WIDTH_07046 = HUD_SKIN_VF04.width/);
assert.match(scene44, /HUD_BASE_HEIGHT_07046 = HUD_SKIN_VF04.height/);
assert.match(scene44, /ACTIVE_HUD_SCALE_07046 = 1\.18/);
assert.match(main, /CareerMinigameBoardScene07044 as ActiveBoardScene/);
assert.match(helper, /fillRoundedRect/);
assert.match(helper, /strokeRoundedRect/);
assert.match(helper, /if \(active\)/);
assert.match(helper, /c.identityRingInset/);
assert.match(helper, /palette.inner/);
assert.match(helper, /palette.showTurnMarker/);
assert.doesNotMatch(helper, /Math\.random|submitIntent\s*\(|MatchState|browserSession/);
console.log('[visual-foundation-hud-vf04] PASS four-corner painted-bounds clamp + idle/active HUD + preserved authority');
