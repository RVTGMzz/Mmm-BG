import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// Every Card/News title and body goes through the same adaptive fitter.
assert.match(active, /fitWrappedText070418\(title, 540, 54, 30, 24, 2\)/);
assert.match(active, /fitWrappedText070418\(body, 628, bodyHeight070418, 16, 12, 5\)/);
assert.match(active, /while \(fontSize > minFontSize && text\.height > height\)/);
assert.match(active, /text\.setFixedSize\(width, height\)/);

// Reaction bubbles use HUD-safe lanes rather than magic values hugging the corners.
assert.match(presentation, /const REACTION_TOP_Y_070418 = 190/);
assert.match(presentation, /const REACTION_BOTTOM_Y_070418 = 530/);
assert.match(presentation, /const y = top \? REACTION_TOP_Y_070418 : REACTION_BOTTOM_Y_070418/);

// The compact active HUD uses 92px base height at 1.18x with a 12px safe margin.
// Verify the reaction panel (top=-62, bottom=+54) keeps a visible gap.
const hudHalfHeight = 92 * 1.18 * 0.5;
const topHudCenter = Math.max(62, 12 + hudHalfHeight);
const topHudBottom = topHudCenter + hudHalfHeight;
const bottomHudCenter = Math.min(658, 720 - 12 - hudHalfHeight);
const bottomHudTop = bottomHudCenter - hudHalfHeight;
const topReactionTop = 190 - 62;
const bottomReactionBottom = 530 + 54;

assert.ok(topReactionTop - topHudBottom >= 6, 'top reaction lane must clear an active top HUD');
assert.ok(bottomHudTop - bottomReactionBottom >= 6, 'bottom reaction lane must clear an active bottom HUD');

// This pass remains presentation-only.
assert.doesNotMatch(active, /submitIntent\(/);
assert.doesNotMatch(active, /Math\.random\(/);

console.log('[presentation-adaptive-safearea-070418] PASS adaptive Card\/News fitting + HUD-safe reaction lanes');
