import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gameSession } from '../src/core/session';
import { characterWinnerVoiceCh04d } from '../src/ui/MiniGameOverlay';

gameSession.reset();

gameSession.setCharacter(0, 'starter-hyper');
const hyper = characterWinnerVoiceCh04d(0, 'Ron', 35, 500);
assert.match(hyper, /THẮNG|35B\$|chơi tiếp|ván nữa/i);

gameSession.setCharacter(0, 'starter-anxious');
const anxious = characterWinnerVoiceCh04d(0, 'Ron', 35, 500);
assert.match(anxious, /chiến thuật|35B\$|phương án/i);
assert.notEqual(anxious, hyper);

gameSession.setCharacter(0, 'secret-baby');
const baby = characterWinnerVoiceCh04d(0, 'Bé', 35, 500);
assert.match(baby, /Bé thắng|35B\$|quỹ sữa|quy trình/i);

gameSession.setCharacter(0, undefined);
assert.equal(characterWinnerVoiceCh04d(0, 'Ron', 35, 500), '');

const overlay = readFileSync('src/ui/MiniGameOverlay.ts', 'utf8');
const profile = readFileSync('src/core/characterReactionProfilesCh04.ts', 'utf8');

assert.match(overlay, /const winnerVoice = winner/);
assert.match(overlay, /characterWinnerVoiceCh04d\(winner\.id, winner\.name, winnerReward, eventSeq\)/);
assert.match(overlay, /winnerVoiceText/);
assert.match(overlay, /podiumPaper\.setDisplaySize\(700, winnerVoice \? 360 : 330\)/);
assert.match(overlay, /submitSystemIntent\('resolve_minigame'/);
assert.doesNotMatch(profile, /Math\.random\s*\(/);
assert.doesNotMatch(overlay, /submitClientIntent\s*\(/);

gameSession.reset();
console.log('[character-minigame-result-ch04d] PASS canonical ranking winner voice is Character-aware, optional, deterministic and payout-neutral');
