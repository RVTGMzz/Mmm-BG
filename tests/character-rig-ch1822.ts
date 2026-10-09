import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { CAU_CO_RIG_PILOT_CH1822 } from '../src/content/core/character_rig_manifest_ch1822';

assert.equal(CAU_CO_RIG_PILOT_CH1822.characterId, 'starter-grumpy');
assert.equal(CAU_CO_RIG_PILOT_CH1822.productionApproved, false, 'QA vector draft must never silently replace canon production');
assert.equal(CAU_CO_RIG_PILOT_CH1822.canonPath, 'docs/character-production/canon/cauco.webp');
assert.equal(CAU_CO_RIG_PILOT_CH1822.baseResolution, 192);
assert.equal(CAU_CO_RIG_PILOT_CH1822.displaySize, 104);
assert.equal(CAU_CO_RIG_PILOT_CH1822.partIds.length, 18);
assert.equal(new Set(CAU_CO_RIG_PILOT_CH1822.partIds).size, 18);
for (const part of ['head','hair-front','glasses','torso','coat-back','satchel','leg-upper-left',
  'leg-lower-left','shoe-left','arm-upper-left','arm-lower-left','hand-left',
  'leg-upper-right','leg-lower-right','shoe-right','arm-upper-right','arm-lower-right','hand-right']) {
  assert(CAU_CO_RIG_PILOT_CH1822.partIds.includes(part as never));
}

execFileSync(process.execPath, ['scripts/materialize-cau-co-rig-ch1822.mjs']);
for(const id of CAU_CO_RIG_PILOT_CH1822.partIds) {
  const path = 'public/assets/characters/ch1822/cau-co/' + id + '.svg';
  const svg = await readFile(path, 'utf8');
  assert((await stat(path)).size > 140, id + ' part is empty');
  assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert(svg.includes('viewBox='));
  assert(!svg.includes('<image') && !svg.includes('data:image') && !svg.includes('base64'),
    id + ' cannot hide a pre-flattened or scaled sprite inside SVG');
}

const artSource = await readFile('scripts/materialize-cau-co-rig-ch1822.mjs', 'utf8');
for (const anchor of [
  'linearGradient id="coat"',
  'pattern id="stripe"',
  'linearGradient id="leather"',
  'linearGradient id="skin"',
  'linearGradient id="silver"',
  'linearGradient id="gold"',
  'fill="#25855f"',
  'stop-color="#e8',
  'fill="#d6a64f"',
]) {
  assert(artSource.includes(anchor), 'CAU CÓ rig canon detail missing: ' + anchor);
}

const runtime = await readFile('src/ui/characterRigCh1822.ts', 'utf8');
const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(runtime.includes('scene.add.container('));
assert(runtime.includes('character-rig-knee-ch1822'));
assert(runtime.includes('character-rig-elbow-ch1822'));
assert(runtime.includes('character-rig-shoulder-ch1822'));
assert(runtime.includes('2200'), 'idle breathing cadence missing');
assert(runtime.includes('walkBlend') && runtime.includes('145'),
  'idle-to-walk blended movement is required');
assert(runtime.includes('-61 * resting') && runtime.includes('61 * resting'),
  'CAU CÓ stern folded-arm idle pose missing');
assert(runtime.includes('footLiftL') && runtime.includes('footLiftR'),
  'walk must alternate foot lifts');
assert(board.includes('footRingPulse') && board.includes('Math.min(1.08'),
  'under-foot ring scale must be clamped independent of obsolete halo pulse');
assert(runtime.includes('moving ? 14') || runtime.includes('14 * stride'), 'alternating walk missing');
assert(board.includes('cauCoRigPreviewEnabledCh1822()'));
assert(board.includes('cauCoRigPartsReadyCh1822(this)'));
assert(board.includes('sprite.setVisible(false)'));
assert(board.includes('this.cauCoRigPilotCh1822.set(player.id, rig)'));
assert(board.includes('this.cauCoRigPilotCh1822.clear()'));
assert(board.includes('const inheritedActive = player.id === activeId'),
  'foot ring must not inherit visibility from the hidden legacy halo');
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(rig.root, 1)'));
assert(board.includes('CRYBABY_PROOF_BODY_KEY_CH187'),
  'face socket compositing must retain its current ownership');

console.log('[character-rig-ch1822] PASS separate SVG part assets + 2-bone limbs + opt-in fallback + active-ring contract');
