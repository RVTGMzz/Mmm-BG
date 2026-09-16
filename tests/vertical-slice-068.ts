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
const demoBoard = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const settings = readFileSync('src/ui/SettingsPanel.ts', 'utf8');
const settingsCss = readFileSync('src/settings.css', 'utf8');
const mobileCss = readFileSync('src/mobileViewport066.css', 'utf8');
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const packageJson = readFileSync('package.json', 'utf8');

// One visible build identity for the whole vertical slice.
assert.equal(MEMEME_BUILD.version, '0.1.68.1');
assert.equal(MEMEME_BUILD.phase, 'MOBILE READABILITY + MODAL CLEANUP');
assert.match(main, /CareerMinigameBoardScene0681 as ActiveBoardScene/);
assert.match(lobby, /MEMEME_BUILD\.lobbyHeader/);
assert.match(setup, /MEMEME_BUILD\.setupHeader/);
assert.match(order, /MEMEME_BUILD\.rollOrderBadge/);
assert.match(scene068, /MEMEME_BUILD\.boardHeader/);
assert(!lobby.includes("FIRST PLAYTEST • MVP 0.1.48"), 'Lobby must not expose the old 0.1.48 label.');
assert(!setup.includes("FACE SETUP • PLAYTEST MVP 0.1.67"), 'Setup must not hard-code the 0.1.67 label.');
assert(!order.includes("setText('MVP 0.1.66.2"), 'Roll For Order must not hard-code the 0.1.66.2 label.');

// Menu → Setup → dedicated rules → Roll For Order remains the canonical entry chain.
assert.match(main, /LocalLobbyScene,[\s\S]*SetupScene,[\s\S]*TurnOrderScene,[\s\S]*ActiveBoardScene/);
assert.match(setup, /\[1, 2, 3\]\.map\(\(laps\)/);
assert.match(setup, /CHỌN LUẬT CHƠI/);
assert.match(setup, /configureInitialTargetLaps\(gameSession\.targetLaps\)/);
assert.match(setup, /this\.scene\.start\('TurnOrderScene'\)/);
assert.match(order, /object\.setY\(80\)/);
assert.match(order, /\.setY\(141\)/);

// 1 / 2 / 3-lap authoritative finish semantics must stay intact.
const names = ['P1', 'P2', 'P3', 'P4'];
for (const laps of [1, 2, 3]) {
  configureInitialTargetLaps(laps);
  const state = createInitialMatchState({ boardId: 'vertical-slice-068', startNodeId: 1, playerNames: names, seed: 168, targetLaps: laps });
  for (const player of state.players) {
    if (laps === 1) assert.equal(player.targetLaps, undefined, '1-lap compatibility must preserve legacy state shape.');
    else assert.equal(player.targetLaps, laps);
  }
  assert.equal(isPlayerFinished060({ lapsCompleted: laps - 1, ...(laps === 1 ? {} : { targetLaps: laps }) }), false);
  assert.equal(isPlayerFinished060({ lapsCompleted: laps, ...(laps === 1 ? {} : { targetLaps: laps }) }), true);
}
configureInitialTargetLaps(1);

// 0.1.68 canonical Job modal guard remains inherited and 0.1.68.1 adds readable HUD/modal ownership.
assert.match(scene068, /extends CareerMinigameBoardScene067/);
assert.match(scene068, /super\.update\(\);[\s\S]*guardCanonicalModal068\(\)/);
assert.match(scene068, /copy\.includes\('trúng'\)/);
assert.match(scene068, /copy\.includes\('b\$\/vòng'\)/);
assert.match(scene068, /text\.setVisible\(false\)/);
assert.match(scene068, /restoreCanonicalModalTexts068/);
assert.match(scene0681, /extends CareerMinigameBoardScene068/);
assert.match(scene0681, /setFontSize\(16\)/);
assert.match(scene0681, /setFontSize\(18\)/);
assert.match(scene0681, /setText\(`\$\{job\.icon\} \$\{job\.title\} L\$\{level\} • \$\{salary\}\/vòng/);
assert.match(scene0681, /copy\.startsWith\('lượt:'\)/);
assert.match(scene0681, /copy === 'tổng quan'/);
assert.match(scene0681, /copy\.includes\('thu nhập'\)/);
assert.match(scene0681, /copy\.includes\('xác di chuyển tiếp tục'\)/);

// Podium/result controls and rematch/lobby exits remain wired in the inherited authoritative shell.
assert.match(demoBoard, /CHƠI LẠI 🔁/);
assert.match(demoBoard, /VỀ LOBBY/);
assert.match(demoBoard, /rematchDemo\(\)/);
assert.match(demoBoard, /resetAndBegin/);

// Mobile + Steam Deck input/display conveniences remain part of the playable slice.
assert.match(main, /installGlobalGamepadUiNavigation0651/);
assert.match(main, /visualViewport\?\.addEventListener\('resize'/);
assert.match(settings, /mobileFullscreenShortcut\.textContent = active \? '↙' : '⛶'/);
assert.match(settingsCss, /flex-direction: column/);
assert.match(settingsCss, /\.mememe-settings\.is-open \.mobile-fullscreen-shortcut/);
assert.match(mobileCss, /100dvh/);
assert.match(mobileCss, /100dvw/);

// CI must exercise CPU stress, long-match simulation, endgame/rematch and this integration guard.
assert.match(ci, /Simple CPU autoplay stress[\s\S]*npm run test:bots/);
assert.match(ci, /deterministic full-match simulation harness[\s\S]*npm run test:simulation-baseline-0611/);
assert.match(ci, /Demo match shell and rematch[\s\S]*npm run test:demo-shell/);
assert.match(ci, /Authoritative final podium and tie ranking[\s\S]*npm run test:final-podium/);
assert.match(packageJson, /"test:vertical-slice-068"/);
assert.match(ci, /0\.1\.68\.1 mobile readability and modal cleanup[\s\S]*npm run test:vertical-slice-068/);

console.log('[vertical-slice-068] PASS canonical 0.1.68.1 + full flow + 1/2/3 laps + readable HUD + modal cleanup + mobile/Steam Deck + CPU/long-match CI guards');
