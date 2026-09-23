import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const css = readFileSync('src/uiInteraction07046.css', 'utf8');
const board = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const job = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');

assert.match(setup, /face-picker-launch/);
assert.match(setup, /CHỌN CÁCH TẠO AVATAR/);
assert.match(setup, /face-library-3-\$\{playerId\}/);
assert.match(setup, /face-library-one-\$\{playerId\}/);
assert.match(setup, /face-camera-3-\$\{playerId\}/);
assert.match(setup, /face-camera-one-\$\{playerId\}/);
assert.match(css, /face-choice-grid/);
assert.match(css, /grid-template-columns: 1fr 1fr/);

assert.match(board, /ACTIVE_HUD_SCALE_07046 = 1\.18/);
assert.match(board, /HUD_SAFE_MARGIN_07046 = 12/);
assert.match(board, /Phaser\.Math\.Clamp/);
assert.match(board, /1280 - HUD_SAFE_MARGIN_07046 - halfWidth/);
assert.match(board, /720 - HUD_SAFE_MARGIN_07046 - halfHeight/);

assert.match(job, /Đổ xúc xắc để chọn nghề/);
assert.match(job, /XEM CHI TIẾT/);
assert.match(job, /XEM NGHỀ/);
assert.match(job, /LƯƠNG \/ VÒNG/);
assert.doesNotMatch(job, /Controller B/);
assert.doesNotMatch(main, /installGlobalGamepadUiNavigation0651\(game\)/);

assert.match(worker, /private async roomCanRecycle07046/);
assert.match(worker, /const noLiveSockets = this\.pruneStaleSockets070420\(now\) === 0/);
assert.match(worker, /lastSocketActivityAt/);
assert.match(worker, /reconnectGraceExpired/);
assert.match(worker, /now - latestHumanActivityAt > RECONNECT_GRACE_MS_0704/);
assert.match(worker, /if \(!await this\.roomCanRecycle07046\(existingPlayers, started, closed\)\)/);
assert.match(worker, /https:\/\/mwp-test\.pages\.dev/);

console.log('[ui-interaction-07046] PASS avatar popup + clamped active HUD + concise Job preview + controller-off + stale room recycle');
