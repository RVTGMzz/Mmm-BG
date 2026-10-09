import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CAU_CO_RIG_PILOT_CH1822 as rig } from '../src/content/core/character_rig_manifest_ch1822';

// Visual proportions are pinned to the repo's original CAU CÓ concept sheet;
// string matching costume colors alone was NOT enough to catch a distorted rig.
assert.equal(rig.canonPath, 'docs/character-production/canon/cauco.webp');
assert.equal(rig.canonPresentation, 'male');
assert.deepEqual(rig.canonAgeBand, { min: 40, max: 50 });
assert.equal(rig.productionApproved, false);
const concept = await readFile(rig.canonPath);
assert.equal(concept.subarray(0, 4).toString('ascii'), 'RIFF');
assert.equal(concept.subarray(8, 12).toString('ascii'), 'WEBP');
assert(concept.length > 40_000, 'canon authority image is absent or unexpectedly tiny');

const { coat, satchel, soleY, headTopY, shoulderY, hipY, torsoY } = rig.geometryLock;
const coatHalfWidth = 112 * coat.scaleX / 2;
const coatBottom = coat.y + 112 * coat.scaleY;
const satchelHalfWidth = 48 * satchel.scaleX / 2;
const satchelRightEdge = satchel.x + satchelHalfWidth;
const satchelBottom = satchel.y + 66 * satchel.scaleY;

assert.equal(coat.x, 0, 'coat must stay centered over shoulders');
assert(coatHalfWidth >= 48 && coatHalfWidth <= 52, 'jacket width drifts away from shoulder silhouette');
assert(coatBottom >= 135 && coatBottom <= 153, 'coat must end above knee/shoe area');
assert(satchelRightEdge <= -25, 'CAU CÓ must carry the briefcase on viewer-left in canon facing');
assert(satchelBottom <= coatBottom + 8, 'briefcase must not hang as low as the feet');
assert(satchelBottom < soleY - 30, 'briefcase is too large or too low');
assert(soleY >= 185 && soleY <= 190, 'sole baseline must remain near the board ground line');
assert(headTopY < shoulderY && shoulderY < hipY, 'head/shoulder/hip anchors are upside down');
assert(torsoY < hipY, 'torso anchor cannot sag below the hip');

const runtime = await readFile('src/ui/characterRigCh1822.ts', 'utf8');
assert(runtime.includes('CAU_CO_RIG_PILOT_CH1822.geometryLock'));
assert(runtime.includes('geometry.coat.scaleX, geometry.coat.scaleY'));
assert(runtime.includes('geometry.satchel.scaleX, geometry.satchel.scaleY'));
assert(runtime.includes("const bag = part('satchel', geometry.satchel.x, geometry.satchel.y"));
assert(runtime.includes('root.add(coat);'));
assert(runtime.includes('root.add(bag);'));
assert(runtime.indexOf('root.add(bag);') > runtime.indexOf('root.add(torso);'),
  'briefcase needs a foreground position rather than being painted under the legs');
assert(runtime.includes('bag.y = geometry.satchel.y'));
assert(!runtime.includes("part('satchel', 51, 95"), 'the oversized right-side briefcase must stay removed');

const source = await readFile('scripts/materialize-cau-co-rig-ch1822.mjs', 'utf8');
assert(source.includes("add('satchel',48,66"), 'satchel source part is missing');
assert(source.includes("add('coat-back',112,112"), 'coat source part is missing');
assert(rig.visualLocks.includes('structured leather briefcase with small gold crown motifs'));

console.log('[character-rig-silhouette-ch1824] PASS canonical left-briefcase pose, cropped coat, footwear baseline and separate rig layering');
