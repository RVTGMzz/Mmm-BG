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
const board = await readFile('src/scenes/CareerMinigameBoardScene048.ts', 'utf8');
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

assert(board.includes("extends CareerMinigameBoardScene046"), '0.1.48 must bypass the misunderstood 0.1.47 visual rename while retaining 0.1.46 gameplay');
assert(board.includes("disposition !== 'animate'"), '0.1.48 must reject duplicate/stale move_step presentation');
assert(!board.includes('submitIntent('), 'bugfix wrapper must not submit gameplay/system intents');
assert(!board.includes('Math.random'), 'bugfix wrapper must not introduce RNG');

assert(picker.includes('CHỌN LÁ BÀI') && picker.includes('DÙNG LÁ NÀY'), 'Card hand must restore the original visible vocabulary');
assert(!picker.includes('CHỌN PHÉP THUẬT'), 'legacy reference names must not rename the current Card system');
assert(main.includes('TurnOrderScene048') && main.includes('CareerMinigameBoardScene048'), 'packaged runtime must activate both 0.1.48 bugfix scenes');
assert(lobby.includes('MVP 0.1.48') && setup.includes('MVP 0.1.48'), 'entry surfaces must identify 0.1.48');
assert(lobby.includes('TIN TỨC / LÁ BÀI giữ nguyên tên cũ'), 'Lobby must document the corrected legacy-card interpretation');

console.log('[bugfix-pass-048] PASS money cue ownership + true D6 face + Mini Game BGM isolation + stale token guard + vocabulary restore');
