import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const splash = readFileSync('src/scenes/SplashScene069.ts', 'utf8');
const online = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');
const css = readFileSync('src/visualRefreshCh17.css', 'utf8');

assert.match(splash, /paintToyTownBackdropCh17\(this, 'peach'/);
assert.match(splash, /splash-toy-town-backdrop-ch178/);
assert.match(splash, /splash-brand-glow-ch178/);
assert.match(splash, /splash-start-face-ch178/);
assert.match(splash, /A \/ ENTER \/ CHẠM ĐỂ BẮT ĐẦU/);
assert.doesNotMatch(splash, /Math\.random\s*\(/);

assert.match(online, /paintToyTownBackdropCh17\(this, 'mint'/);
assert.match(online, /online-room-backdrop-ch178/);
assert.match(online, /heartbeatOnlineLobby0704/);
assert.match(online, /startOnlineMatch0703/);

assert.match(css, /CH-17\.8 Splash \/ Settings \/ BGM \/ Online Room/);
assert.match(css, /\.settings-panel::before/);
assert.match(css, /\.mememe-bgm-hud \{/);
assert.match(css, /\.online-room-panel::before/);
assert.match(css, /\.online-seat \{/);
assert.match(css, /var\(--ch17-cocoa\)/);
assert.match(css, /var\(--ch17-mint\)/);

console.log('[visual-refresh-shell-ch178] PASS Splash + Settings/BGM + Online Room CH-17.8 refresh; behavior authority retained');
