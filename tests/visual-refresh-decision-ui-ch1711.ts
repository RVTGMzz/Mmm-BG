import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const branch = readFileSync('src/ui/BranchPicker.ts', 'utf8');
const tactical = readFileSync('src/ui/TacticalChoicePicker.ts', 'utf8');
const target = readFileSync('src/ui/TargetPicker.ts', 'utf8');
const hand = readFileSync('src/ui/CardHandPicker.ts', 'utf8');
const map = readFileSync('src/scenes/FullMapReviewScene053.ts', 'utf8');

const stripComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

assert.match(branch, /branch-picker-panel-ch1711/);
assert.match(branch, /branch-picker-header-ch1711/);
assert.match(branch, /branch-option-skin-/);
assert.match(branch, /resolve\(option\.edge\)/);
assert.match(branch, /branchFlavorInfo056/);

assert.match(tactical, /tactical-choice-panel-ch1711/);
assert.match(tactical, /tactical-choice-header-ch1711/);
assert.match(tactical, /tactical-choice-skin-/);
assert.match(tactical, /pickRichestOtherTarget/);
assert.match(tactical, /finish\(choice\)/);

assert.match(target, /target-picker-panel-ch1711/);
assert.match(target, /target-picker-header-ch1711/);
assert.match(target, /target-picker-skin-/);
assert.match(target, /gameSession\.getFace/);
assert.match(target, /resolve\(target\)/);

assert.match(hand, /card-hand-panel-ch1711/);
assert.match(hand, /card-hand-header-ch1711/);
assert.match(hand, /card-hand-skin-/);
assert.match(hand, /card-hand-rarity-/);
assert.match(hand, /friendlyVisibleCopy0701/);
assert.match(hand, /finish\(\{ card, handIndex \}\)/);

assert.match(map, /full-map-header-ch1711/);
assert.match(map, /full-map-branch-label-ch1711/);
assert.match(map, /full-map-node-ch1711/);
assert.match(map, /validateBoardDefinition\(BOARD\)/);
assert.match(map, /fitWholeBoard\(\)/);

for (const [name, source] of [
  ['BranchPicker', branch],
  ['TacticalChoicePicker', tactical],
  ['TargetPicker', target],
  ['CardHandPicker', hand],
  ['FullMapReviewScene053', map],
] as const) {
  const exec = stripComments(source);
  assert.doesNotMatch(exec, /Math\.random\s*\(/, `${name} must not add client gameplay RNG`);
  assert.doesNotMatch(exec, /\.money\s*[+\-*/]?=/, `${name} must not own B$ mutation`);
}

console.log('[visual-refresh-decision-ui-ch1711] PASS Branch/Tactical/Target/Card Hand/Full Map CH-17.11 presentation refresh; decision authority retained');
