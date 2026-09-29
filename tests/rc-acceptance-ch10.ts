import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';
import { CHARACTER_PASSIVE_BALANCE_CH05 } from '../src/core/characterPassivesCh05';

const read=(path:string)=>readFileSync(path,'utf8');
const main=read('src/main.ts');
const css=read('src/styles.css');
const worker=read('cloudflare/mememe-online/src/index.ts');
const packageVerifier=read('scripts/verify-playtest-package.mjs');
const playtest=read('public/PLAYTEST.txt');
const workflow=read('.github/workflows/ci.yml');
const fullMatch=read('tests/full-match-audit-0715.ts');
const ch06=read('tests/character-balance-ch06.ts');
const ch07=read('tests/economy-pacing-ch07.ts');
const ch08=read('tests/online-reconnect-stress-ch08.ts');
const ch09=read('tests/feedback-polish-ch09.ts');

const matrix:{gate:string;pass:boolean}[]=[];
const gate=(name:string,condition:unknown)=>{const pass=Boolean(condition); matrix.push({gate:name,pass}); assert(pass,name);};

// Identity / release packaging.
gate('RC build identity',/^0\.1\.70\.4\.33$/.test(MEMEME_BUILD.version)&&/RELEASE CANDIDATE/.test(MEMEME_BUILD.phase));
gate('MMM visible branding',MEMEME_BUILD.lobbyHeader.startsWith('MMM •')&&!MEMEME_BUILD.boardHeader.includes('MeMeMe'));
gate('single public tester launcher',/Unexpected tester launcher set/.test(packageVerifier)&&/START_PLAYTEST\.bat/.test(packageVerifier));
gate('audio checksum guard',/bgmTracks/.test(packageVerifier)&&/eventSfx/.test(packageVerifier)&&/checksum mismatch/i.test(packageVerifier));

// Steam Deck / input.
gate('Steam Deck controller owner',/installSteamDeckController070424\(game\)/.test(main));
gate('legacy global gamepad owner absent',!/installGlobalGamepadUiNavigation0651\(game\)/.test(main));
gate('16:10 remains CSS-only FIT',/Steam Deck 16:10 CSS-only presentation bleed/.test(css)&&!/Phaser\.Scale\.ENVELOP/.test(main));

// Character authority + audited percentages.
gate('Character probability contract',
  CHARACTER_PASSIVE_BALANCE_CH05.crybabyChance===0.40
  && CHARACTER_PASSIVE_BALANCE_CH05.grumpyChance===0.50
  && CHARACTER_PASSIVE_BALANCE_CH05.anxiousChance===0.20
  && CHARACTER_PASSIVE_BALANCE_CH05.hyperChance===0.45
  && CHARACTER_PASSIVE_BALANCE_CH05.secretBabyChance===0.60
);
gate('Character probability audit present',/5000/.test(ch06)&&/starterRuns/.test(ch06)&&/babyRuns/.test(ch06));

// Full match / pacing.
gate('two-lap full match audit',/boardShuffleLaps/.test(fullMatch)&&/MINIGAME_SLOT_05/.test(fullMatch));
gate('1-2-3 lap economy audit',/runsFor\(1/.test(ch07)&&/runsFor\(2/.test(ch07)&&/runsFor\(3/.test(ch07));
gate('deterministic 3-lap repeat',/3-lap Character match must remain deterministic/.test(ch07));

// Online ownership.
gate('logical socket authority',/logicalSockets070421/.test(worker)&&/newestReplacedJoinedAt070421/.test(worker));
gate('CH-08 repeated reconnect live stress',/cycle<=5/.test(ch08)&&/obsolete socket leaked a relay/.test(ch08)&&/no ghost seat/.test(ch08));
gate('invalid-token + active-device guards',/reconnect_token_invalid/.test(ch08)&&/duplicate_device_active/.test(ch08)&&/match_already_started/.test(ch08));

// Final presentation / polish.
gate('CH-09 feedback policy gate',/landingFeedbackCh09/.test(ch09)&&/diceSettleFeedbackCh09/.test(ch09));
gate('public playtest documents reconnect',/CH-08|reconnect/i.test(playtest));
gate('public playtest documents Character odds',/KHÓC NHÈ[\s\S]*40%/.test(playtest)&&/SECRET BABY[\s\S]*60%/.test(playtest));

// CI wiring: the RC matrix is meaningful only if all prerequisite gates are still wired.
for(const label of [
  'CH-05 HOST-authoritative Character signature passives',
  'CH-06 Character probability and economy balance audit',
  'CH-07 Character-enabled 1/2/3-lap economy and pacing audit',
  'CH-08 live repeated reconnect ownership and ghost-seat stress',
  'CH-09 final feedback polish policy and Character passive juice',
  'Verify public Pages release guard',
]){
  gate('CI: '+label,workflow.includes(label));
}

assert(matrix.every((entry)=>entry.pass));
console.log('[rc-acceptance-ch10] PASS '+matrix.map((entry)=>entry.gate).join(' | '));
