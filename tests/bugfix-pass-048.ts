import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { movementStepDisposition } from '../src/ui/movementVisualPolicy';

assert.equal(
  movementStepDisposition({ x: 10, y: 10 }, { x: 10, y: 10 }, { x: 90, y: 10 }),
  'animate',
  'token at from-node must animate forward',
);
assert.equal(
  movementStepDisposition({ x: 90, y: 10 }, { x: 10, y: 10 }, { x: 90, y: 10 }),
  'duplicate',
  'duplicate move_step must not move a token already at destination',
);
assert.equal(
  movementStepDisposition({ x: 150, y: 10 }, { x: 10, y: 10 }, { x: 90, y: 10 }),
  'stale',
  'late move_step must not drag a newer token position backwards',
);
assert.equal(
  movementStepDisposition({ x: 13, y: 13 }, { x: 10, y: 10 }, { x: 90, y: 10 }),
  'animate',
  'small tween/pixel drift around from-node remains valid',
);

const bgm = await readFile('src/audio/bgmController.ts', 'utf8');
const money = await readFile('src/scenes/TurnStakesBoardScene.ts', 'utf8');
const presentation = await readFile('src/ui/MatchPresentationLayer.ts', 'utf8');
const dice = await readFile('src/scenes/TurnOrderScene048.ts', 'utf8');
const board048 = await readFile('src/scenes/CareerMinigameBoardScene048.ts', 'utf8');
const board056 = await readFile('src/scenes/CareerMinigameBoardScene056.ts', 'utf8');
const board0561 = await readFile('src/scenes/CareerMinigameBoardScene0561.ts', 'utf8');
const board057 = await readFile('src/scenes/CareerMinigameBoardScene057.ts', 'utf8');
const board058 = await readFile('src/scenes/CareerMinigameBoardScene058.ts', 'utf8');
const picker = await readFile('src/ui/CardHandPicker.ts', 'utf8');
const main = await readFile('src/main.ts', 'utf8');
const lobby = await readFile('src/scenes/LocalLobbyScene.ts', 'utf8');
const setup = await readFile('src/scenes/SetupScene.ts', 'utf8');

const playRoundBlock = bgm.slice(bgm.indexOf('playRound('), bgm.indexOf('/** Mini Games'));
assert(!playRoundBlock.includes("'city_silly'"), 'normal board rounds must never select city_silly');
assert(bgm.includes("playMiniGame(): void") && bgm.includes("this.setTrack('city_silly')"), 'city_silly must remain available only through Mini Game playback');

assert(money.includes('presentationOwnsMoneyCue'), 'money packet audio must know when presentation owns the cue');
assert(money.includes('packetMoneyCue'), 'money delta packet must suppress its early cue for presented economy events');
assert(presentation.includes("model.kind === 'tile_land' && model.tileType === 'money'"), 'money landing presentation must retain the event-aligned coin cue');

assert(dice.includes("DICE_FACES") && dice.includes('`${face} ${result}`'), 'Roll For Order settled frame must show the real D6 face');
assert(!dice.includes('`🎲 ${result}`'), '0.1.48 final D6 frame must not use the fixed dice emoji artwork');

assert(board048.includes("extends CareerMinigameBoardScene046"), '0.1.48 must bypass the misunderstood 0.1.47 visual rename while retaining 0.1.46 gameplay');
assert(board048.includes("disposition !== 'animate'"), '0.1.48 must reject duplicate/stale move_step presentation');
assert(!board048.includes('submitIntent('), '0.1.48 bugfix wrapper must not submit gameplay/system intents');
assert(!board048.includes('Math.random'), '0.1.48 bugfix wrapper must not introduce RNG');

assert(board056.includes('extends CareerMinigameBoardScene048'), '0.1.56 must inherit the validated 0.1.48 board bugfix scene');
assert(!board056.includes('submitIntent('), '0.1.56 branch-identity wrapper must remain presentation-only');
assert(!board056.includes('Math.random'), '0.1.56 branch-identity wrapper must not introduce RNG');
assert(board0561.includes('extends CareerMinigameBoardScene056'), '0.1.56.1 presentation wrapper must inherit 0.1.56 and therefore the 0.1.48 stale-token guard');
assert(!board0561.includes('Math.random'), '0.1.56.1 presentation consolidation must not introduce RNG');
assert(board0561.includes('showBranchPicker'), '0.1.56.1 may submit only the player-selected canonical branch through the inherited HOST authority path');
assert(board057.includes('extends CareerMinigameBoardScene0561'), '0.1.57 must inherit the canonical 0.1.56.1 presentation and validated 0.1.48 authority chain');
assert(!board057.includes('Math.random'), '0.1.57 special-location UI wrapper must not introduce client RNG');
assert(board058.includes('extends CareerMinigameBoardScene057'), '0.1.58 must inherit 057 -> 0561 -> 056 -> 048 without bypassing the stale-token guard');
assert(!board058.includes('Math.random'), '0.1.58 depth presentation wrapper must not introduce client RNG');

assert(picker.includes('CHỌN LÁ BÀI') && picker.includes('DÙNG LÁ NÀY'), 'Card hand must restore the original visible vocabulary');
assert(!picker.includes('CHỌN PHÉP THUẬT'), 'legacy reference names must not rename the current Card system');
assert(main.includes('TurnOrderScene048'), 'packaged runtime must retain the 0.1.48 Roll For Order bugfix scene');
assert(main.includes('CareerMinigameBoardScene058 as ActiveBoardScene'), 'packaged runtime must activate 0.1.58 through the validated inheritance chain');
assert(lobby.includes('MVP 0.1.48') && setup.includes('MVP 0.1.48'), 'entry surfaces must preserve the validated 0.1.48 baseline copy until intentionally superseded');
assert(lobby.includes('TIN TỨC / LÁ BÀI giữ nguyên tên cũ'), 'Lobby must document the corrected legacy-card interpretation');

console.log('[bugfix-pass-048] PASS money cue ownership + true D6 face + Mini Game BGM isolation + stale token guard + vocabulary restore through 0.1.58 inheritance');
