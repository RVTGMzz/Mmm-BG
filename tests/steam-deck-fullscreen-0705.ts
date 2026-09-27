import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MMM_LOGICAL_HEIGHT_0705,
  MMM_LOGICAL_WIDTH_0705,
  resolveSteamDeckFullscreen0705,
} from '../src/ui/steamDeckFullscreen0705';

const deck = resolveSteamDeckFullscreen0705(1280, 800);
assert.equal(deck.mode, 'steam-deck-fullscreen-shell');
assert.equal(deck.strategy, 'fit-with-ambient-bleed');
assert.equal(deck.fitScale, 1);
assert.equal(deck.fittedWidth, 1280);
assert.equal(deck.fittedHeight, 720);
assert.equal(deck.horizontalInset, 0);
assert.equal(deck.verticalInset, 40);
assert.equal(deck.cropX, 0);
assert.equal(deck.cropY, 0);
assert.deepEqual(deck.safeLogicalRect, {
  x: 0,
  y: 0,
  width: MMM_LOGICAL_WIDTH_0705,
  height: MMM_LOGICAL_HEIGHT_0705,
});

const deckHiDpiShape = resolveSteamDeckFullscreen0705(1920, 1200);
assert.equal(deckHiDpiShape.mode, 'steam-deck-fullscreen-shell');
assert.equal(deckHiDpiShape.horizontalInset, 0);
assert.equal(deckHiDpiShape.verticalInset, 60);
assert.equal(deckHiDpiShape.cropX, 0);
assert.equal(deckHiDpiShape.cropY, 0);

const exact169 = resolveSteamDeckFullscreen0705(1920, 1080);
assert.equal(exact169.mode, 'standard-fit');
assert.equal(exact169.verticalInset, 0);
assert.equal(exact169.horizontalInset, 0);

const phoneLandscape = resolveSteamDeckFullscreen0705(844, 390);
assert.equal(phoneLandscape.mode, 'standard-fit');
assert.ok(phoneLandscape.horizontalInset > 0);
assert.equal(phoneLandscape.verticalInset, 0);

const main = fs.readFileSync('src/main.ts', 'utf8');
assert.match(main, /mode:\s*Phaser\.Scale\.FIT/);
assert.match(main, /syncSteamDeckFullscreenShell0705\(\)/);

const css = fs.readFileSync('src/styles.css', 'utf8');
assert.match(css, /steam-deck-fullscreen-shell/);
assert.match(css, /ambient[\s\S]*No stretch and no overscan crop/);

console.log(
  'steam-deck-fullscreen-0705: PASS - 16:10 gets an ambient fullscreen shell while the complete 1280x720 safe game surface stays FIT, uncropped and unstretched',
);
