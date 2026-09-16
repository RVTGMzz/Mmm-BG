import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';
import { configureInitialTargetLaps, createInitialMatchState } from '../src/core/matchState';
import { isPlayerFinished060 } from '../src/core/pacingEconomy060';

const main = readFileSync('src/main.ts', 'utf8');
const lobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const order = readFileSync('src/scenes/TurnOrderScene048.ts', 'utf8');
const scene068 = readFileSync('src/scenes/CareerMinigameBoardScene068.ts', 'utf8');
const scene0681 = readFileSync('src/scenes/CareerMinigameBoardScene0681.ts', 'utf8');
const scene0682 = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const scene069 = readFileSync('src/scenes/CareerMinigameBoardScene069.ts', 'utf8');
const demoBoard = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const settings = readFileSync('src/ui/SettingsPanel.ts', 'utf8');
const settingsCss = readFileSync('src/settings.css', 'utf8');
const mobileCss = readFileSync('src/mobileViewport066.css', 'utf8');
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const packageJson = readFileSync('package.json', 'utf8');

assert.equal(MEMEME_BUILD.version, '0.1.69');
assert.equal(MEMEME_BUILD.phase, 'FIRST IMPRESSION POLISH');
assert.match(main, /CareerMinigameBoardScene069 as ActiveBoardScene/);
assert.match(lobby, /MEMEME_BUILD\.lobbyHeader/);
assert.match(setup, /MEMEME_BUILD\.setupHeader/);
assert.match(order, /MEMEME_BUILD\.rollOrderBadge/);
assert.match(scene068, /MEMEME_BUILD\.boardHeader/);
assert.match(main, /SplashScene069,[\s\S]*LocalLobbyScene,[\s\S]*SetupScene,[\s\S]*TurnOrderScene,[\s\S]*ActiveBoardScene/);
assert.match(setup, /\[1,2,3\]\.map\(\(laps\)/);
assert.match(setup, /configureInitialTargetLaps\(gameSession\.targetLaps\)/);
assert.match(setup, /this\.scene\.start\('TurnOrderScene'\)/);
assert.match(order, /object\.setY\(80\)/);
assert.match(order, /\.setY\(141\)/);

const names = ['P1','P2','P3','P4'];
for (const laps of [1,2,3]) {
  configureInitialTargetLaps(laps);
  const state = createInitialMatchState({ boardId:'vertical-slice-068', startNodeId:1, playerNames:names, seed:168, targetLaps:laps });
  for (const player of state.players) {
    if (laps === 1) assert.equal(player.targetLaps, undefined); else assert.equal(player.targetLaps, laps);
  }
  assert.equal(isPlayerFinished060({ lapsCompleted:laps-1, ...(laps === 1 ? {} : { targetLaps:laps }) }), false);
  assert.equal(isPlayerFinished060({ lapsCompleted:laps, ...(laps === 1 ? {} : { targetLaps:laps }) }), true);
}
configureInitialTargetLaps(1);
assert.match(scene068, /extends CareerMinigameBoardScene067/);
assert.match(scene0681, /extends CareerMinigameBoardScene068/);
assert.match(scene0682, /extends CareerMinigameBoardScene0681/);
assert.match(scene069, /extends CareerMinigameBoardScene0682/);
assert(!scene069.includes('Math.random'));
assert(!scene069.includes('submitIntent('));
assert.match(demoBoard, /CHƠI LẠI 🔁/);
assert.match(demoBoard, /VỀ LOBBY/);
assert.match(main, /installGlobalGamepadUiNavigation0651/);
assert.match(main, /visualViewport\?\.addEventListener\('resize'/);
assert.match(settings, /mobileFullscreenShortcut\.textContent = active \? '↙' : '⛶'/);
assert.match(settingsCss, /flex-direction: column/);
assert.match(mobileCss, /100dvh/);
assert.match(mobileCss, /100dvw/);
assert.match(ci, /Simple CPU autoplay stress[\s\S]*npm run test:bots/);
assert.match(ci, /deterministic full-match simulation harness[\s\S]*npm run test:simulation-baseline-0611/);
assert.match(packageJson, /"test:first-impression-069"/);
console.log('[vertical-slice-068] PASS inherited authoritative flow + 1/2/3 laps + 0.1.69 presentation wrapper + mobile/Steam Deck guards');
