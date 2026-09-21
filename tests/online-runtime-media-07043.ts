import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const demo = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const transport = readFileSync('src/core/onlineTransport0702.ts', 'utf8');
const browser = readFileSync('src/core/browserSession.ts', 'utf8');
const lobby = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');
const media = readFileSync('src/ui/OnlineGroupMedia07043.ts', 'utf8');
const runtime = readFileSync('src/scenes/CareerMinigameBoardScene0701.ts', 'utf8');
const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');

assert.match(worker, /milestone: "0\.1\.70\.4\.\d+"/);
assert.match(transport, /'demo-shell' \| 'media'/);
assert.match(demo, /'demo-shell',\s*config\.clientId/);
assert.match(demo, /new DemoShellClientSession\(config\.clientId/);
assert(!demo.includes('shell-' + 'clientId'));

assert.match(browser, /cameraAllowed: boolean/);
assert.match(browser, /voiceAllowed: boolean/);
assert.match(browser, /setOnlineMediaPolicy/);
assert.match(lobby, /setOnlineMediaPolicy\(state\.settings\.cameraAllowed, state\.settings\.voiceAllowed\)/);

assert.match(media, /RTCPeerConnection/);
assert.match(media, /stun:stun\.l\.google\.com:19302/);
assert.match(media, /kind: 'media_roster'/);
assert.match(media, /kind: 'media_signal'/);
assert.match(media, /createBrowserSessionTransport<MediaMessage07043>\('media'/);
assert.match(media, /navigator\.mediaDevices\?\.getUserMedia/);
assert.match(media, /replaceTrack/);
assert.match(media, /config\.cameraAllowed/);
assert.match(media, /config\.voiceAllowed/);
assert.match(media, /CAMERA OFF/);
assert.match(media, /MIC OFF/);

assert.match(runtime, /onlineGroupMedia07043\.start\(\)/);
assert.match(runtime, /onlineGroupMedia07043\.stop\(\)/);
assert.match(runtime, /0\.1\.70\.4\.3/);

console.log('[online-runtime-media-07043] PASS authenticated shell sync + opt-in group WebRTC signaling');
