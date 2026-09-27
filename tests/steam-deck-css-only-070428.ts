import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const css = readFileSync('src/styles.css', 'utf8');

assert.match(main, /width:\s*1280/);
assert.match(main, /height:\s*720/);
assert.match(main, /mode:\s*Phaser\.Scale\.FIT/);
assert.match(main, /autoCenter:\s*Phaser\.Scale\.CENTER_BOTH/);

// The failed 0705 approach must stay gone.
assert.doesNotMatch(main, /steamDeckFullscreen0705|syncSteamDeckFullscreenShell0705|data-mmm-viewport-shell/);
assert.doesNotMatch(main, /Phaser\.Scale\.ENVELOP/);

// 070428 is CSS-only and scoped to handheld/desktop 16:10-ish viewports.
assert.match(css, /0\.1\.70\.4\.28 Steam Deck 16:10 CSS-only presentation bleed/);
assert.match(css, /\(min-width:\s*900px\)/);
assert.match(css, /\(min-height:\s*600px\)/);
assert.match(css, /\(min-aspect-ratio:\s*3\/2\)/);
assert.match(css, /\(max-aspect-ratio:\s*7\/4\)/);
assert.match(css, /radial-gradient/);
assert.match(css, /linear-gradient/);

// Never fake fullscreen by stretching/cropping the authored game surface.
const passStart = css.indexOf('0.1.70.4.28 Steam Deck 16:10 CSS-only presentation bleed');
const pass = css.slice(passStart);
assert.doesNotMatch(pass, /transform\s*:\s*scale|scaleX|scaleY/);
assert.doesNotMatch(pass, /object-fit\s*:\s*cover/);
assert.doesNotMatch(pass, /position\s*:\s*fixed/);
assert.doesNotMatch(pass, /pointer-events\s*:/);
assert.doesNotMatch(pass, /width\s*:\s*100vw|height\s*:\s*100vh/);

console.log('[steam-deck-css-070428] PASS CSS-only 16:10 bleed; Phaser FIT remains uncropped, unstretched and input-neutral');
