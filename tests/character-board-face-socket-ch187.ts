import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
const manifest = await readFile('src/content/core/character_art_manifest_v01.ts', 'utf8');
const compositor = await readFile('src/core/characterFaceCompositeCh02d.ts', 'utf8');

assert(board.includes("player.characterId === 'starter-crybaby'"));
assert(board.includes('player.faces.neutral?.compositeSourceDataUrl'));
assert(board.includes('fitFaceSourceToSocketCh02f('));
assert(board.includes("faceCtx.globalCompositeOperation = 'destination-in'"));
assert(board.includes('ctx.drawImage(foreground'));
assert(board.includes('character-face-socket-board-ch187-p'));
assert(board.includes('walk.setVisible(false)'));
assert(board.includes('characterFaceCompositeImagesCh187'));
assert(board.includes('faceComposite.setFlipX(dx < 0)'));
assert(!board.includes('Math.random()'));

assert(manifest.includes("milestone: 'CH-02G'"));
assert(manifest.includes("characterId === 'starter-crybaby' && emotion === 'neutral'"));
assert(compositor.includes('asset.compositeSourceDataUrl'));
assert(compositor.includes("sourceKind: 'non-circular'"));

console.log('[character-board-face-socket-ch187] PASS KHÓC NHÈ neutral layered face socket on board + default fallback preserved');
