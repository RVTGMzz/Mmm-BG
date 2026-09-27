import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gameSession } from '../src/core/session';
import { podiumWinnerVoiceCh04e } from '../src/ui/characterPodiumVoiceCh04e';

gameSession.reset();

gameSession.setCharacter(0, 'starter-crybaby');
const cry = podiumWinnerVoiceCh04e(0, 'Ron', 1, 350);
assert.match(cry, /thắng|Hạng nhất|vui/i);

gameSession.setCharacter(0, 'starter-grumpy');
const grumpy = podiumWinnerVoiceCh04e(0, 'Ron', 1, 350);
assert.match(grumpy, /Hạng nhất|Xong|bất ngờ/i);
assert.notEqual(grumpy, cry);

gameSession.setCharacter(0, 'secret-baby');
const baby = podiumWinnerVoiceCh04e(0, 'Bé', 1, 350);
assert.match(baby, /Bé thắng|Hạng nhất|kế hoạch/i);

assert.equal(podiumWinnerVoiceCh04e(0, 'Bé', 2, 350), '');

gameSession.setCharacter(0, undefined);
assert.equal(podiumWinnerVoiceCh04e(0, 'Ron', 1, 350), '');

const scene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const helper = readFileSync('src/ui/characterPodiumVoiceCh04e.ts', 'utf8');

assert.match(scene, /protected decoratePodiumSlot/);
assert.match(scene, /super\.decoratePodiumSlot\(slot, entry, x, faceY\)/);
assert.match(scene, /podiumWinnerVoiceCh04e/);
assert.match(scene, /character-podium-voice-ch04e/);
assert.match(helper, /if \(rank !== 1\) return ''/);
assert.doesNotMatch(helper, /Math\.random\s*\(/);
assert.doesNotMatch(scene, /submitIntent\s*\(/);

gameSession.reset();
console.log('[character-podium-ch04e] PASS rank-1 Character voice stays inside inherited authoritative podium; ties remain independent');
