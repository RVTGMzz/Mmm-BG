import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/visualFoundationV01.css', 'utf8');
const helper = readFileSync('src/ui/visualFoundationV01.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const lobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const online = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');
const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const bible = readFileSync('docs/VISUAL_STYLE_BIBLE_V0.1.md', 'utf8');
const plan = readFileSync('docs/VISUAL_FOUNDATION_PASS_0.1.md', 'utf8');

// VF-01 canonical tokens.
for (const token of [
  '--vf-color-bg-cream',
  '--vf-color-panel-cream',
  '--vf-color-outline-cocoa',
  '--vf-color-accent-butter',
  '--vf-color-accent-coral',
  '--vf-color-accent-mint',
  '--vf-color-accent-aqua',
  '--vf-color-accent-lavender',
  '--vf-radius-sm',
  '--vf-radius-md',
  '--vf-radius-lg',
  '--vf-shadow-soft',
  '--vf-font-ui',
  '--vf-space-4',
  '--vf-button-height-lg',
]) {
  assert.match(css, new RegExp(token.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&')));
}
assert.match(css, /--vf-color-outline-cocoa:\s*#4a302a/);
assert.match(css, /--vf-button-height-lg:\s*66px/);
assert.match(css, /--vf-player-p1/);
assert.match(css, /--vf-player-p4/);

// VF-02 complete reusable button family.
for (const variant of ['primary', 'secondary', 'subtle', 'danger', 'success']) {
  assert.match(css, new RegExp(`button\\.vf-button\\.vf-button--${variant}`));
  assert.match(helper, new RegExp(`'${variant}'`));
}
for (const size of ['sm', 'md', 'lg']) {
  assert.match(css, new RegExp(`button\\.vf-button\\.vf-button--${size}`));
}
assert.match(css, /button\.vf-button:focus-visible/);
assert.match(css, /button\.vf-button:active:not\(:disabled\)/);
assert.match(css, /button\.vf-button:disabled/);
assert.match(css, /button\.vf-button\[aria-pressed="true"\]/);
assert.match(css, /@media \(pointer: coarse\) and \(orientation: landscape\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /touch-action:\s*manipulation/);

// VF-01.1: Vietnamese glyph stability + secondary placeholder sizing.
assert.match(css, /--vf-font-ui:\s*system-ui/);
assert.doesNotMatch(css, /--vf-font-ui:[^\n]*Arial Rounded MT Bold/);
assert.match(css, /VF-01\.1 Vietnamese typography stabilization/);
assert.match(css, /\.mememe-lobby-069 input::placeholder/);
assert.match(css, /font-size:\s*14px/);
assert.match(css, /font-synthesis:\s*none/);

// VF-02 depth should be visibly toy-like, not only a colour swap.
assert.match(css, /inset 0 2px 0 rgba\(255,255,255,\.72\)/);
assert.match(css, /0 6px 0 var\(--vf-button-shadow\)/);
assert.match(css, /linear-gradient\(180deg, color-mix/);

// Helper is presentation-only and does not gain game authority.
assert.match(helper, /decorateVisualFoundationButtonV01/);
assert.match(helper, /decorateVisualFoundationButtonsV01/);
assert.match(helper, /button\.dataset\.vfButton/);
assert.doesNotMatch(helper, /submitIntent|MatchState|Math\.random|browserSession|gameSession/);

// CSS must load after prior legacy skins so canonical components win safely.
assert.match(
  main,
  /import '\.\/uiInteraction07046\.css';[\s\S]*import '\.\/visualFoundationV01\.css';/,
);

// Live adoption: mode select, online room, setup/rule flow.
assert.match(lobby, /decorateVisualFoundationButtonsV01\(node/);
assert.match(lobby, /selector: '#lobby-solo', variant: 'primary', size: 'lg'/);
assert.match(lobby, /selector: '#lobby-online-host', variant: 'primary'/);
assert.match(lobby, /selector: '#lobby-online-join', variant: 'secondary'/);

assert.match(online, /selector: '#online-start', variant: 'primary', size: 'lg'/);
assert.match(online, /selector: '#online-leave', variant: 'subtle'/);
assert.match(online, /decorateVisualFoundationButtonV01\(button, 'danger', 'sm'\)/);
assert.match(online, /me\?\.ready \? 'success' : 'secondary'/);

assert.match(setup, /selector: '#start-game', variant: 'primary', size: 'lg'/);
assert.match(setup, /selector: '\.rule-confirm', variant: 'primary', size: 'lg'/);
assert.match(setup, /selector: '#setup-back-mode', variant: 'subtle'/);

// VF-03 shared panel/modal shell and first ownership example.
assert.match(helper, /decorateVisualFoundationPanelV01/);
assert.match(helper, /bindVisualFoundationModalV01/);
assert.match(helper, /root.addEventListener\('keydown', onKey\)/);
assert.match(helper, /event.key === 'Escape'/);
assert.match(helper, /event.key !== 'Tab'/);
assert.match(css, /\.vf-panel\s*\{/);
assert.match(css, /\.vf-panel__header/);
assert.match(css, /\.vf-panel__body/);
assert.match(css, /\.vf-panel__footer/);
assert.match(css, /\.face-choice-panel\.vf-panel/);
assert.match(setup, /decorateVisualFoundationPanelV01\(panel, 'wide'\)/);
assert.match(setup, /bindVisualFoundationModalV01\(choiceMenu, choiceLauncher\)/);
assert.match(setup, /class="face-choice-menu vf-modal"/);
assert.match(setup, /class="vf-panel__footer"/);
const controller = readFileSync('src/ui/steamDeckController070424.ts','utf8');
assert.match(controller, /\.vf-modal:not\(\[hidden\]\)/);
assert.doesNotMatch(helper, /submitIntent|MatchState|Math\.random|browserSession|gameSession/);

// Documentation authority stays wired to implementation.
assert.match(bible, /VISUAL_FOUNDATION_PASS_0\.1\.md/);
assert.match(plan, /VF-01/);
assert.match(plan, /VF-02/);
assert.match(plan, /VF-04 first live player HUD pass/);
assert.match(plan, /VF-05 first canonical TIN TỨC visual sample/);
assert.match(plan, /Component first, screen second/);

console.log('[visual-foundation-v01] PASS VF-01 tokens + VF-02 reusable button family + live adoption');
