import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const reactions = readFileSync('src/ui/ReactionSequencer.ts', 'utf8');
const holds = readFileSync('src/scenes/CareerMinigameBoardScene057.ts', 'utf8');

const stripComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert.match(reactions, /reaction-bubble-shadow-ch1712/);
assert.match(reactions, /reaction-bubble-panel-ch1712/);
assert.match(reactions, /reaction-bubble-face-well-ch1712/);
assert.match(reactions, /ROLE_ACCENTS/);
assert.match(reactions, /selectReactionVariant/);
assert.match(reactions, /formatReactionText/);
assert.match(reactions, /gameSession\.getFace/);

assert.match(holds, /special-hold-banner-skin-ch1712/);
assert.match(holds, /special-hold-banner-text-ch1712/);
assert.match(holds, /specialHoldLabel057/);
assert.match(holds, /originalHandleUseCard/);
assert.match(holds, /player\.specialHold === 'jail'/);
assert.match(holds, /ĐỔ 1 \/ 3 \/ 5 ĐỂ THOÁT/);
assert.match(holds, /ĐỔ ĐÚNG 2 \/ 4 \/ 5 ĐỂ XUẤT VIỆN/);

for (const [name, source] of [['ReactionSequencer', reactions], ['CareerMinigameBoardScene057', holds]] as const) {
  const exec = stripComments(source);
  assert.doesNotMatch(exec, /Math\.random\s*\(/, `${name} must not add client gameplay RNG`);
  assert.doesNotMatch(exec, /\.money\s*[+\-*/]?=/, `${name} must not own B$ mutation`);
}

console.log('[visual-refresh-special-reactions-ch1712] PASS reaction bubbles + Jail/Hospital hold banner refresh; reaction and special-location authority retained');
