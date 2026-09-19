import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { friendlyVisibleCopy0701 } from '../src/ui/friendlyVisibleCopy0701';

const cardHand = readFileSync('src/ui/CardHandPicker.ts', 'utf8');
const tactical = readFileSync('src/ui/TacticalChoicePicker.ts', 'utf8');
const cardOverlay = readFileSync('src/ui/CardOverlay.ts', 'utf8');
const newsOverlay = readFileSync('src/ui/NewsOverlay.ts', 'utf8');
const layer = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const model = readFileSync('src/ui/presentationModel.ts', 'utf8');
const job = readFileSync('src/scenes/CareerMinigameBoardScene069.ts', 'utf8');
const modal = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const canonical = readFileSync('src/scenes/CareerMinigameBoardScene0561.ts', 'utf8');

assert.equal(
  friendlyVisibleCopy0701('Chọn 1 đối thủ. TARGET: đối thủ ngẫu nhiên.'),
  'Chọn 1 người chơi khác. NGƯỜI CHƠI ĐƯỢC CHỌN: người chơi khác ngẫu nhiên.',
);

assert.match(cardHand, /NGƯỜI CHƠI NGẪU NHIÊN/);
assert.match(cardHand, /TẤT CẢ NGƯỜI CHƠI KHÁC/);
assert.match(cardHand, /friendlyVisibleCopy0701\(card\.description\)/);
assert(!cardHand.includes('ĐỐI THỦ'));
assert(!cardHand.includes('effect resolve'));
assert(!cardHand.includes('maxLines: 4'));

assert.match(tactical, /Không có người chơi khác hợp lệ/);
assert(!tactical.toLocaleLowerCase('vi').includes('đối thủ'));
assert(!tactical.includes('deterministic'));
assert(!tactical.includes('host mới resolve'));

assert.match(cardOverlay, /friendlyVisibleCopy0701\(card\.description\)/);
assert.match(cardOverlay, /friendlyVisibleCopy0701\(resolutionSummary\)/);
assert.match(cardOverlay, /fixedHeight: 62/);
assert(!cardOverlay.includes('Card overlay'));

assert.match(newsOverlay, /friendlyVisibleCopy0701\(news\.description\)/);
assert.match(newsOverlay, /friendlyVisibleCopy0701\(summary\)/);
assert(!newsOverlay.includes('maxLines: 2'));

assert.match(model, /friendlyVisibleCopy0701/);
assert(!model.includes('function friendlyVisibleCopy('));

assert.match(layer, /addNaturalActionLine/);
assert.match(layer, /model\.kind === 'card_play' && amount > 0/);
assert(!layer.includes('addPlayerChip('));
assert(!layer.includes("'ACTOR'"));
assert(!layer.includes("'TARGET'"));

assert.match(layer, /const bodyWidth = isJobCard \? 500 : 410/);
assert.match(layer, /fixedHeight: 58/);
assert.match(job, /MatchPresentationLayer owns the canonical Job card/);
assert.match(modal, /restoreCanonicalModalText0682/);
assert.match(modal, /isAllowedModalAuxiliary0682/);
assert(!modal.includes('rootContainerDepth0682'));
assert.match(canonical, /text\.startsWith\('SPACE roll'\)/);

console.log('[ui-copy-overflow-0701] PASS natural visible copy + no technical chips + no legacy truncation paths');
