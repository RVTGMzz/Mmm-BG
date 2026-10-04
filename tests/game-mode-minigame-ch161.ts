import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MINI_GAME_SLOTS_059 } from '../src/core/miniGameSlots059';

const splash = readFileSync('src/scenes/SplashScene069.ts', 'utf8');
const modeMenu = readFileSync('src/scenes/GameModeMenuScene.ts', 'utf8');
const quick = readFileSync('src/scenes/MiniGameQuickScene.ts', 'utf8');
const lobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');

assert.equal(MINI_GAME_SLOTS_059.length, 5, 'Quick Play must expose the five canonical Mini Games.');

assert.match(splash, /scene\.start\(inviteRoom \? 'LocalLobbyScene' : 'GameModeMenuScene'\)/);
assert.match(modeMenu, />BOARD GAME</);
assert.match(modeMenu, />MINI GAME</);
assert.match(modeMenu, /scene\.start\('LocalLobbyScene'\)/);
assert.match(modeMenu, /MiniGameQuickScene/);
assert.match(modeMenu, /data-mode-entry="mini"/);
assert.match(modeMenu, /bindModeEntry\('\.mode-menu-card\.mini', '#mode-mini', 'MiniGameQuickScene'\)/);
assert.match(modeMenu, /card\.addEventListener\('keydown'/);

assert.match(quick, /MINI_GAME_SLOTS_059\.map/);
assert.match(quick, /browserSession\.configureSolo\(cpuSeatsForQuickMode\(this\.selectedMode\)\)/);
assert.match(quick, /startMiniGameOverlay\(/);
assert.match(quick, /this\.selectedContentId/);
assert.match(quick, /1 người \+ 3 CPU/);
assert.match(quick, /2 người \+ 2 CPU/);
assert.match(quick, /4 người HOTSEAT/);
assert.match(quick, /4 CPU AUTOPLAY/);
assert.match(quick, /CHƠI LẠI/);
assert.match(quick, /ĐỔI MINI GAME/);
assert.doesNotMatch(quick, /Math\.random\s*\(/);

assert.match(lobby, /id="lobby-back-main"/);
assert.match(lobby, /scene\.start\('GameModeMenuScene'\)/);
assert.match(main, /GameModeMenuScene/);
assert.match(main, /MiniGameQuickScene/);

console.log('[game-mode-minigame-ch161] PASS outer Board/Mini menu + five-game deterministic Quick Play + invite bypass');
