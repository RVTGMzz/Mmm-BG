import { readFileSync } from 'node:fs';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const bgm = readFileSync(new URL('../src/audio/bgmController.ts', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../src/ui/SettingsPanel.ts', import.meta.url), 'utf8');

const startIndex = main.indexOf('bgmController.start();');
const gameIndex = main.indexOf('new Phaser.Game(config);');
assert(startIndex >= 0, 'main.ts must arm BGM startup.');
assert(gameIndex >= 0, 'main.ts must create the Phaser game.');
assert(startIndex < gameIndex, 'BGM startup must happen before Phaser scene creation.');

assert(
  bgm.includes("this.prepareTrack('menu_mememe');") && bgm.includes("this.setTrack('menu_mememe');"),
  'BgmController.start() must preload/select the Menu track early.',
);
assert(
  bgm.includes('INITIAL_FADE_IN_MS'),
  'Initial Menu BGM should use a dedicated short fade-in path.',
);

assert(settings.includes('settings-trigger'), 'Settings must expose a compact gear trigger.');
assert(settings.includes('settings-bgm-toggle'), 'Settings must contain BGM on/off.');
assert(settings.includes('settings-bgm-volume'), 'Settings must contain BGM volume.');
assert(settings.includes('settings-sfx-toggle'), 'Settings must contain FX on/off.');
assert(!main.includes('installBgmControls'), 'Legacy exposed BGM HUD must not be installed from main.ts.');

console.log('✓ 0.1.21 Settings + early Menu BGM startup regression passed.');
