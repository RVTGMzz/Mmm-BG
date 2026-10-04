import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');

const stripComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert.match(presentation, /presentation-dice-card-ch1713/);
assert.match(presentation, /presentation-landing-card-ch1713/);
assert.match(presentation, /presentation-cinematic-card-ch1713/);
assert.match(presentation, /presentation-continue-chip-ch1713/);
assert.match(presentation, /presentation-money-chip-ch1713/);
assert.match(presentation, /presentation-action-line-ch1713/);
assert.match(presentation, /presentation-rarity-badge-ch1713/);

assert.match(presentation, /diceSettleFeedbackCh09\(result\)/);
assert.match(presentation, /landingFeedbackCh09\(model\)/);
assert.match(presentation, /this\.armTiming\(model,/);
assert.match(presentation, /this\.showReaction\(model, line, index\)/);
assert.match(presentation, /sfxController\.play\('dice_roll'\)/);
assert.match(presentation, /presentation-reaction-bubble-070422/);

const exec = stripComments(presentation);
assert.doesNotMatch(exec, /Math\.random\s*\(/, 'CH-17.13 presentation must not add client gameplay RNG');
assert.doesNotMatch(exec, /\.money\s*[+\-*/]?=/, 'CH-17.13 presentation must not own B$ mutation');

console.log('[visual-refresh-presentation-feedback-ch1713] PASS dice/landing/cinematic/continue/money feedback refresh; timing, reaction and gameplay authority retained');
