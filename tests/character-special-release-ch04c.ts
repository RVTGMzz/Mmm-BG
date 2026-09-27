import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import { gameSession } from '../src/core/session';
import { buildPresentationModel } from '../src/ui/presentationModel';

const match = createInitialMatchState({
  boardId: 'character-special-ch04c',
  startNodeId: 0,
  playerNames: ['Ron', 'Bích', 'Hưng', 'Mây'],
  seed: 40403,
});

function release(seq: number, location: 'hospital' | 'police', success: boolean): MatchEvent {
  return {
    seq,
    type: 'special_release',
    turnNumber: 4,
    playerIndex: 0,
    phase: 'RESOLVING_TILE',
    revision: 11,
    rngCalls: 6,
    actorId: 0,
    data: {
      location,
      result: success ? 6 : 2,
      success,
      affectedPlayerIds: '0',
    },
  };
}

gameSession.reset();
gameSession.setCharacter(0, 'starter-anxious');

const hospitalFail = buildPresentationModel(release(30, 'hospital', false), match.players);
assert(hospitalFail);
assert.equal(hospitalFail.tileType, 'special_release');
assert.equal(hospitalFail.reactions.length, 1);
assert.match(hospitalFail.reactions[0]?.text ?? '', /hồ sơ|Chưa được ra|thiếu bước/i);
assert.equal(hospitalFail.reactions[0]?.expression, 'angry');

const hospitalSuccess = buildPresentationModel(release(31, 'hospital', true), match.players);
assert(hospitalSuccess);
assert.equal(hospitalSuccess.reactions.length, 1);
assert.match(hospitalSuccess.reactions[0]?.text ?? '', /Xuất viện|Được ra|Kế hoạch hồi phục/i);

gameSession.setCharacter(0, 'starter-grumpy');
const jailSuccess = buildPresentationModel(release(32, 'police', true), match.players);
assert(jailSuccess);
assert.equal(jailSuccess.reactions.length, 1);
assert.match(jailSuccess.reactions[0]?.text ?? '', /Mở cửa|Được thả|quay lại/i);

gameSession.setCharacter(0, 'secret-baby');
const jailFail = buildPresentationModel(release(33, 'police', false), match.players);
assert(jailFail);
assert.equal(jailFail.reactions.length, 1);
assert.match(jailFail.reactions[0]?.text ?? '', /bé|đồn|giữ/i);

gameSession.setCharacter(0, undefined);
const legacy = buildPresentationModel(release(34, 'hospital', false), match.players);
assert(legacy);
assert.equal(legacy.reactions.length, 0);

const modelSource = readFileSync('src/ui/presentationModel.ts', 'utf8');
const profileSource = readFileSync('src/core/characterReactionProfilesCh04.ts', 'utf8');
assert.match(modelSource, /specialContextCh04c/);
assert.match(modelSource, /hospital_success/);
assert.match(modelSource, /jail_fail/);
assert.match(modelSource, /characterMomentReactionCh04\(event, players, specialContextCh04c\)/);
assert.doesNotMatch(profileSource, /Math\.random\s*\(/);
assert.doesNotMatch(modelSource, /submitIntent\s*\(/);

gameSession.reset();
console.log('[character-special-release-ch04c] PASS Hospital/Jail Character reactions stay presentation-only and preserve legacy no-Character behavior');
