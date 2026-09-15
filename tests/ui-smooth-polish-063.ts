import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const scene063Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene063.ts', import.meta.url), 'utf8');
const scene062Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene062.ts', import.meta.url), 'utf8');
const authoritySource = readFileSync(new URL('../src/core/authority.ts', import.meta.url), 'utf8');

assert(mainSource.includes('CareerMinigameBoardScene063 as ActiveBoardScene'), '0.1.63 must be the active playtest scene.');
assert(scene063Source.includes('extends CareerMinigameBoardScene062'), '0.1.63 must inherit 0.1.62 gameplay unchanged.');

// User feedback: tokens slightly smaller, round movement spaces slightly larger.
assert(scene063Source.includes('const TOKEN_SCALE_063 = 0.82'));
assert(scene063Source.includes('return 27'), 'normal round spaces should grow from the 0.1.62 radius 23 baseline to 27.');
assert(scene063Source.includes('return 31'), 'feature spaces should also grow proportionally.');
assert(scene063Source.includes('circle.setRadius(this.tileRadius063(node))'));
assert(scene063Source.includes('visual.token.setScale(TOKEN_SCALE_063)'));

// User feedback: camera should glide after the moving token instead of stepping.
assert(scene063Source.includes('const FOLLOW_LERP_063 = 0.075'));
assert(scene063Source.includes('startFollow(token, false, FOLLOW_LERP_063, FOLLOW_LERP_063)'), 'roundPixels must be disabled and low lerp used for smooth following.');

// User feedback: central event/chat presentation should be visibly larger.
assert(scene063Source.includes('const LANDING_CONTENT_SCALE_063 = 1.18'));
assert(scene063Source.includes('const CINEMATIC_CONTENT_SCALE_063 = 1.14'));
assert(scene063Source.includes('inflatePresentationContents063'));

// The 0.1.62 screenshot exposed stale 0.1.61 build labels because those labels live
// inside nested containers. 0.1.63 must recursively update nested UI objects.
assert(scene063Source.includes('visitDisplayTree063'));
assert(scene063Source.includes('CITY • MVP 0.1.63 • UI READABILITY + SMOOTH FOLLOW'));
assert(scene063Source.includes('PLAYTEST 0.1.63 • LẺ ← TRÁI • CHẴN → PHẢI'));

// This milestone is presentation-only. Gameplay authority and RNG rules stay in 0.1.62.
assert(!scene063Source.includes('submitIntent('), '0.1.63 scene must not submit gameplay intents.');
assert(!scene063Source.includes('Math.random'), '0.1.63 scene must not add client RNG.');
assert(scene062Source.includes('LẺ ← TRÁI • CHẴN → PHẢI'), 'odd/even routing copy must remain inherited.');
assert(authoritySource.includes('autoResolveParityBranches062'), 'HOST parity-routing authority must remain intact.');

console.log('[ui-smooth-polish-063] PASS larger event UI • smooth camera lerp • smaller tokens • larger round spaces • nested build labels fixed');
