import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  cinematicSemanticLines070423,
  isDetachedCinematicCopy070423,
} from '../src/ui/presentationTextOwnership070423';

const cardDescription = 'Chọn Ăn Chắc +20B$ hoặc Ép Top 1 lấy 15% B$ từ người giàu nhất khác.';
const cardSummary = 'CPU 3 chọn Ép Top 1 và lấy 43B$ (15%) từ CPU 2.';
const cardLoose = `${cardDescription}\n→ ${cardSummary}`;
assert.equal(
  isDetachedCinematicCopy070423(cardLoose, [cardDescription, cardSummary]),
  true,
  'combined Card description + arrow summary must be suppressed as one detached block',
);

const newsDescription = '+25B$.';
const newsSummary = 'CPU 4 nhận 25B$.';
const newsLoose = `${newsDescription}\n→ ${newsSummary}`;
assert.equal(
  isDetachedCinematicCopy070423(newsLoose, [newsDescription, newsSummary]),
  true,
  'combined News description + arrow summary must be suppressed as one detached block',
);

const walletDescription = 'Chuyển 10B$ từ một người chơi ngẫu nhiên sang bạn.';
const walletSummary = 'CPU 4 lấy 10B$ từ CPU 2.';
assert.equal(
  isDetachedCinematicCopy070423(`${walletDescription}\n→ ${walletSummary}`, [walletDescription, walletSummary]),
  true,
  'Ví Ai Nấy Lo runtime screenshot duplicate must be suppressed generically',
);

const twoDoorsDescription = 'Chọn Ăn Chắc +20B$ hoặc Ép Top 1 lấy 15% B$ từ người giàu nhất khác.';
const twoDoorsSummary = 'CPU 3 chọn Ép Top 1 và lấy 32B$ (15%) từ CPU 4.';
assert.equal(
  isDetachedCinematicCopy070423(`${twoDoorsDescription}\n→ ${twoDoorsSummary}`, [twoDoorsDescription, twoDoorsSummary]),
  true,
  'Kéo Hai Cửa runtime screenshot duplicate must be suppressed generically',
);

assert.deepEqual(
  cinematicSemanticLines070423('  → CPU 4 nhận 25B$.\n• +25B$.  '),
  ['cpu 4 nhận 25b$.', '+25b$.'],
);
assert.equal(
  isDetachedCinematicCopy070423('Tin nóng: CPU 4 vừa giàu lên.', [newsDescription, newsSummary]),
  false,
  'reaction copy must not be mistaken for detached cinematic body copy',
);
assert.equal(
  isDetachedCinematicCopy070423('Player 1\nĐánh tiếp đi, đang vui', [cardDescription, cardSummary]),
  false,
  'HUD/reaction copy must stay visible',
);

const scene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
assert.match(scene, /isDetachedCinematicCopy070423\(object\.text, ownedValues\)/);
assert.match(scene, /new Phaser\.GameObjects\.Text\(this, -292, -18, bodyCopy/);
assert.match(scene, /const bodyWidth070426 = 584/);
assert.match(scene, /isNews \? '23px' : '21px'/);
assert.match(scene, /bodyWidth070426, bodyHeight070418, 23, 17/);
assert.match(scene, /bodyWidth070426, bodyHeight070418, 21, 16/);
assert.match(scene, /new Phaser\.GameObjects\.Graphics\(this\)/);
assert.match(scene, /root\.setScrollFactor\(0\)/);
assert.match(scene, /body\.setMaxLines\(5\)/);
assert.match(scene, /title\.setMaxLines\(2\)/);

// Card/News content must be owned by the canonical container, not created as a
// loose scene Text and later reparented after camera routing.
const rebuildStart = scene.indexOf('private rebuildCanonicalCinematicText070414');
const fitStart = scene.indexOf('private fitWrappedText070418', rebuildStart);
const rebuild = scene.slice(rebuildStart, fitStart);
assert.doesNotMatch(rebuild, /this\.add\.text\(-292, -18, bodyCopy/);
assert.doesNotMatch(rebuild, /this\.add\.text\(-322, -88, model\.title/);

console.log('[presentation-content-containment-070423] PASS screenshot regressions + semantic duplicate suppression + container-only modal text');
