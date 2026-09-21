import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const localTransport = readFileSync('src/core/localTransport.ts', 'utf8');
const onlineTransport = readFileSync('src/core/onlineTransport0702.ts', 'utf8');
const twoTab = readFileSync('src/core/twoTabSession.ts', 'utf8');
const shell = readFileSync('src/core/demoShellSession.ts', 'utf8');
const demo = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const bot = readFileSync('src/scenes/PlaytestDemoBoardScene.ts', 'utf8');
const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const board = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const media = readFileSync('src/ui/OnlineGroupMedia07043.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const handoff = readFileSync('docs/LATEST_HANDOFF.md', 'utf8');

assert.equal(MEMEME_BUILD.version, '0.1.70.4.19');
assert.match(MEMEME_BUILD.phase, /RUNTIME RELIABILITY \+ RELEASE GUARD/);

// Online seat/reconnect ownership remains authoritative.
assert.match(localTransport, /subscribeConnection\?/);
assert.match(onlineTransport, /emitConnection07047\('open'\)/);
assert.match(
  onlineTransport,
  /emitConnection07047\('open'\);[\s\S]*while \(this\.pending\.length > 0/,
  'reconnect handshake must happen before queued gameplay intents flush',
);
assert.match(twoTab, /state === 'open'[\s\S]*this\.joined = false;[\s\S]*this\.requestJoin07047\(\)/);
assert.match(twoTab, /controlsActor\(actorId: number\): boolean \{[\s\S]*this\.joined && actorId === this\.seatId/);
assert.match(shell, /state === 'open'\) this\.requestState\(\)/);
assert.match(demo, /this\.clientSession\.requestJoin07047\(\)/);
assert.match(demo, /createDemoMatchShell\(this\.players\.length, DEMO_ROUNDS, 'active'\)/);

// CPU ownership stays autonomous and never falls back to host clicking for bots.
assert.match(bot, /queueCpuActionIfNeeded/);
assert.match(bot, /browserSession\.isCpuSeat\(livePlayer\.id\)/);
assert.match(bot, /live\.submitIntent\(liveDecision\.type, liveDecision\.data\)/);

// Group media keeps authenticated signaling and peer self-heal.
assert.match(media, /createBrowserSessionTransport<MediaMessage07043>\('media'/);
assert.match(media, /schedulePeerRepair07047/);
assert.match(media, /connectionState === 'failed' \|\| pc\.connectionState === 'closed'/);
assert.match(media, /connectionState === 'disconnected'/);
assert.match(media, /stun:stun\.l\.google\.com:19302/);

// Avatar setup remains player-owned and uses the large four-choice launcher.
assert.match(setup, /face-picker-launch/);
assert.match(setup, /CHỌN CÁCH TẠO AVATAR/);
assert.match(setup, /face-library-3-\$\{playerId\}/);
assert.match(setup, /face-camera-one-\$\{playerId\}/);
assert.match(setup, /onlineOwnSetup/);

// Presentation invariants from .17/.18 stay locked while future layout can evolve.
assert.match(board, /ACTIVE_HUD_SCALE_07046 = 1\.18/);
assert.match(board, /HUD_SAFE_MARGIN_07046 = 12/);
assert.match(board, /Phaser\.Math\.Clamp/);
assert.match(board, /ensurePlayerTokenBadges070417\(\)/);
assert.match(board, /fitWrappedText070418\(title, 540, 54, 30, 24, 2\)/);
assert.match(board, /fitWrappedText070418\(body, 628, bodyHeight070418, 16, 12, 5\)/);
assert.match(presentation, /const REACTION_TOP_Y_070418 = 190/);
assert.match(presentation, /const REACTION_BOTTOM_Y_070418 = 530/);

// Controller remains intentionally unsupported in this checkpoint.
assert.doesNotMatch(main, /installGlobalGamepadUiNavigation0651\(game\)/);

// Release pipeline must preserve the public repo's own Pages workflow.
assert.match(workflow, /! -name '\.github'/);
assert.match(workflow, /test -f public-mirror\/\.github\/workflows\/pages\.yml/);
assert.match(workflow, /test -f public-mirror\/index\.html/);
assert.match(workflow, /test -f public-mirror\/manifest\.webmanifest/);
assert.match(workflow, /test -d public-mirror\/assets/);

// Canonical public URL must never regress to the old duplicated repo path.
assert.match(handoff, /https:\/\/ronvotri\.github\.io\/MeMeMe-Web-Playtest\//);
assert.doesNotMatch(handoff, /ronvotri-MeMeMe-Web-Playtest/);

console.log('[runtime-release-guard-070419] PASS reconnect + CPU + media + UI + Pages release invariants');
