import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { characterProductionPortraitFrameCh182 } from '../src/ui/characterProductionArtCh181';

assert.equal(characterProductionPortraitFrameCh182('starter-crybaby', 'panic'), 3);
assert.equal(characterProductionPortraitFrameCh182('starter-grumpy', 'angry'), 10);
assert.equal(characterProductionPortraitFrameCh182('secret-baby', 'panic'), 35);

const source = await readFile('src/scenes/CareerMinigameBoardScene057.ts', 'utf8');
assert(source.includes('syncHoldPortraitCh185(player)'));
assert(source.includes("player.specialHold === 'hospital' ? 'panic' : 'angry'"));
assert(source.includes("setName('special-hold-character-portrait-ch185')"));
assert(source.includes("'special-hold-production-portrait-ch185'"));
assert(source.includes("'special-hold-custom-face-ch185'"));
assert(
  source.indexOf("gameSession.getFace(player.id, 'angry')")
    < source.indexOf('characterProductionPortraitFrameCh182'),
  'uploaded player face must stay first priority on the hold banner',
);
assert(source.includes("player.specialHold === 'jail'"));
assert(source.includes('ĐỔ 1 / 3 / 5 ĐỂ THOÁT'));
assert(source.includes('ĐỔ ĐÚNG 2 / 4 / 5 ĐỂ XUẤT VIỆN'));
assert(!source.includes('Math.random()'));

console.log('[character-production-hold-ch185] PASS Jail/Hospital contextual portrait banner + authority lock');
