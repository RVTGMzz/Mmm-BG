import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const scene = await readFile('src/scenes/CareerMinigameBoardScene040.ts', 'utf8');
const main = await readFile('src/main.ts', 'utf8');
const lobby = await readFile('src/scenes/LocalLobbyScene.ts', 'utf8');
const setup = await readFile('src/scenes/SetupScene.ts', 'utf8');

assert(scene.includes('demoMatchLapProgress'), '0.1.40 must derive visible progress from authoritative lap state');
assert(scene.includes('originalRefreshHud'), '0.1.40 must wrap the inherited HUD refresh');
assert(scene.includes('originalRenderShellOverlay'), '0.1.40 must wrap inherited shell overlays');
assert(scene.includes('originalWriteLog'), '0.1.40 must normalize inherited shell logs');
assert(scene.includes('ĐỦ VÒNG'), '0.1.40 HUD must expose lap completion instead of round progress');
assert(scene.includes('metadata') || scene.includes('compatibility'), '0.1.40 should explicitly preserve legacy shell compatibility');
assert(!scene.includes("submitIntent('"), '0.1.40 copy guard must not submit gameplay intents');
assert(!scene.includes('submitSystemIntent('), '0.1.40 copy guard must not submit host-system commands');
assert(!/Math\.random\s*\(/.test(scene.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), '0.1.40 copy guard must not add randomness');
assert(main.includes('CareerMinigameBoardScene040'), 'main runtime must use the 0.1.40 scene');
assert(lobby.includes('MVP 0.1.40') && setup.includes('MVP 0.1.40'), 'entry screens must identify 0.1.40');
assert(!lobby.includes('demo 3 vòng') && !setup.includes('demo 3 vòng'), 'entry screens must not advertise obsolete three-round rules');

console.log('[legacy-shell-copy-040] PASS inherited HUD/shell/log copy stays lap-native without gameplay changes');
