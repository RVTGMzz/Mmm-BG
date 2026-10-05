import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
const media = await readFile('src/ui/OnlineGroupMedia07043.ts', 'utf8');

assert(media.includes('getLiveVideoStreamCh188(seatId: number)'));
assert(media.includes('this.cameraOn ? this.localStream : undefined'));
assert(media.includes("track.readyState === 'live' && !track.muted"));

assert(board.includes('onlineGroupMedia07043.getLiveVideoStreamCh188(player.id)'));
assert(board.includes("player.characterId !== 'starter-crybaby'"));
assert(board.includes('character-live-face-socket-board-ch188-p'));
assert(board.includes('const cropSize = Math.min(sourceWidth, sourceHeight)'));
assert(board.includes('fitFaceSourceToSocketCh02f('));
assert(board.includes("faceCtx.globalCompositeOperation = 'destination-in'"));
assert(board.includes('ctx.drawImage(foreground'));
assert(board.includes('this.time.now - lastPaint < 66'));
assert(board.includes('if (this.textures.exists(staticTextureKey))'));
assert(board.includes('walk.setVisible(true)'));
assert(board.includes('video.srcObject = null'));
assert(!board.includes('Math.random()'));
assert(!media.includes('Math.random()'));

console.log('[character-live-face-socket-ch188] PASS explicit camera-on stream -> live socket -> static face -> default Character fallback');
