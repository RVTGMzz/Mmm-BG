import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');
const lobby = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');
const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const orderCore = readFileSync('src/core/turnOrderSession.ts', 'utf8');
const orderScene = readFileSync('src/scenes/TurnOrderScene.ts', 'utf8');
const board = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const playtestBoard = readFileSync('src/scenes/PlaytestDemoBoardScene.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');

assert.match(worker, /milestone: "0\.1\.70\.4\.\d+"/);
assert.match(worker, /const started = await this\.ctx\.storage\.get<boolean>\("started"\)/);
assert.match(worker, /New humans cannot enter after Start/);
assert.match(worker, /if \(started\) return internalJson\(\{ ok: false, error: "match_already_started"/);
assert.match(worker, /text\.length > 1048576/);

assert.match(lobby, /private lobbyDom\?: Phaser\.GameObjects\.DOMElement/);
assert.match(lobby, /private heartbeatTimer\?: Phaser\.Time\.TimerEvent/);
assert.match(lobby, /cleanupLobbyUi07042/);
assert.match(lobby, /Phaser\.Scenes\.Events\.SHUTDOWN/);
assert.match(lobby, /Phaser\.Scenes\.Events\.DESTROY/);
assert.match(lobby, /this\.lobbyDom\?\.destroy\(\)/);
assert.match(lobby, /this\.root\?\.remove\(\)/);
assert.match(lobby, /this\.scene\.start\('SetupScene', \{ preserve: true \}\)/);
assert(!lobby.includes("this.scene.start('TurnOrderScene')"));

assert.match(setup, /const onlineOwnSetup = config\.transport === 'online'/);
assert.match(setup, /\? \[config\.seatId\]/);
assert.match(setup, /online-own-profile/);
assert.match(setup, /CHỈNH AVATAR CỦA BẠN/);
assert.match(setup, /👤 BẠN/);
assert.match(setup, /readonly aria-readonly="true"/);
assert.match(setup, /onlineOwnSetup && config\.mode === 'client'/);
assert.match(setup, /this\.startGame\(\)/);

assert.match(orderCore, /TurnOrderProfileWire07042/);
assert.match(orderCore, /kind: 'profile_update'/);
assert.match(orderCore, /waitForRemoteSeats07042/);
assert.match(orderCore, /profile\?: TurnOrderProfileWire07042/);
assert.match(orderCore, /data:image\//);
assert.match(orderCore, /value\.length > 220_000/);

assert.match(orderScene, /transport !== 'online'/);
assert.match(orderScene, /setInitialProfiles07042/);
assert.match(orderScene, /waitForRemoteSeats07042/);
assert.match(orderScene, /expectedRemoteSeats/);
assert.match(orderScene, /browserSession\.isCpuSeat\(id\)/);
assert.match(orderScene, /CPU tự đổ xúc xắc/);
assert.match(orderScene, /applyWireProfile07042/);
assert.match(orderScene, /faceTextureKey/);

assert.match(playtestBoard, /chooseTestBotIntent/);
assert.match(playtestBoard, /queueCpuActionIfNeeded/);
assert.match(playtestBoard, /browserSession\.isCpuSeat\(current\.id\)/);
assert.match(playtestBoard, /live\.submitIntent\(liveDecision\.type/);
assert(!board.includes('scheduleCpuAutoplay07042'));
assert.match(board, /The old waiting\/demo modal is retired/);
assert.doesNotMatch(board, /ONLINE • trận đã khóa phòng/);

assert.match(styles, /mememe-setup\.online-own-profile/);

console.log('[online-participation-07042] PASS lobby cleanup + reconnect + per-human avatar ownership + CPU autoplay');
