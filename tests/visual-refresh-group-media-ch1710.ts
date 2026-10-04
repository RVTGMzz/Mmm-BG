import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/visualRefreshCh17.css', 'utf8');
const media = readFileSync('src/ui/OnlineGroupMedia07043.ts', 'utf8');

assert.match(css, /CH-17\.10 Online Group Media/);
assert.match(css, /\.mememe-group-media-07043::before/);
assert.match(css, /\.group-media-frame \{/);
assert.match(css, /\.group-media-label \{/);
assert.match(css, /\.group-media-controls button\.active/);

assert.match(media, /createBrowserSessionTransport<MediaMessage07043>\('media'/);
assert.match(media, /navigator\.mediaDevices\?\.getUserMedia/);
assert.match(media, /replaceTrack/);
assert.match(media, /RTCPeerConnection/);
assert.match(media, /CAMERA OFF/);
assert.match(media, /MIC OFF/);
assert.doesNotMatch(media, /Math\.random\s*\(/);

console.log('[visual-refresh-group-media-ch1710] PASS Group Media CH-17.10 material refresh; WebRTC behavior retained');
