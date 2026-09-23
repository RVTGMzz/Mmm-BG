import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const model = readFileSync('src/ui/presentationModel.ts', 'utf8');
const base = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const finalScene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const cards = JSON.parse(readFileSync('src/content/core/cards_mvp.json', 'utf8')) as Array<{ id: string; effect: { type: string } }>;

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

const block = cards.find((card) => card.id === 'ACT_006');
assert.equal(block?.effect.type, 'block_cards');

assert.match(model, /cardEffectType\?: CardDefinition\['effect'\]\['type'\]/);
assert.match(model, /cardEffectType: card\?\.effect\.type/);

for (const source of [base, finalScene]) {
  assert.match(source, /const directMoneyTransfer/);
  assert.match(source, /cardEffectType === 'steal_money'/);
  assert.match(source, /cardEffectType === 'rich_tax'/);
  assert.match(source, /cardEffectType === 'tactical_choice'/);
}
assert.match(base, /if \(!directMoneyTransfer \|\| amount <= 0\) return/);
assert.doesNotMatch(base, /model\.summary \|\|/);
assert.match(finalScene, /model\.targetName && directMoneyTransfer && amount > 0/);

assert.match(base, /fillRoundedRect\(-106, -58, 212, 116, 18\)/);
assert.match(base, /const speaker = this\.scene\.add\.text\(/);
assert.match(base, /const quote = this\.scene\.add\.text\(textX, -13/);
assert.match(base, /fixedWidth: 144/);
assert.match(base, /fixedHeight: 62/);
assert.match(base, /lineSpacing: 2/);
assert.match(base, /maxLines: 3/);
assert.match(base, /reactionPlacement070422\(/);

console.log('[presentation-semantic-footer-070416] PASS semantic card footer + separated reaction lanes');
