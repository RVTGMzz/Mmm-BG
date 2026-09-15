import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { computeMatchChecksum } from '../src/core/checksum';
import { createInitialMatchState, configureInitialTargetLaps } from '../src/core/matchState';
import { isPlayerFinished060 } from '../src/core/pacingEconomy060';
import { gameSession } from '../src/core/session';

const names = ['P1', 'P2', 'P3', 'P4'];

configureInitialTargetLaps(1);
const legacy = createInitialMatchState({ boardId: 'test', startNodeId: 1, playerNames: names, seed: 66 });
const explicitOne = createInitialMatchState({ boardId: 'test', startNodeId: 1, playerNames: names, seed: 66, targetLaps: 1 });
const two = createInitialMatchState({ boardId: 'test', startNodeId: 1, playerNames: names, seed: 66, targetLaps: 2 });
const three = createInitialMatchState({ boardId: 'test', startNodeId: 1, playerNames: names, seed: 66, targetLaps: 3 });

assert.equal(computeMatchChecksum(legacy), computeMatchChecksum(explicitOne), 'explicit 1 lap must keep legacy checksum shape');
assert.equal(legacy.players.some((player) => Object.hasOwn(player, 'targetLaps')), false, 'legacy 1-lap player must omit targetLaps');
assert(two.players.every((player) => player.targetLaps === 2));
assert(three.players.every((player) => player.targetLaps === 3));
assert.notEqual(computeMatchChecksum(two), computeMatchChecksum(legacy), '2-lap target must be authoritative/checksummed');
assert.notEqual(computeMatchChecksum(three), computeMatchChecksum(two), '3-lap target must differ from 2 laps');

assert.equal(isPlayerFinished060({ lapsCompleted: 1 }), true);
assert.equal(isPlayerFinished060({ lapsCompleted: 1, targetLaps: 2 }), false);
assert.equal(isPlayerFinished060({ lapsCompleted: 2, targetLaps: 2 }), true);
assert.equal(isPlayerFinished060({ lapsCompleted: 2, targetLaps: 3 }), false);
assert.equal(isPlayerFinished060({ lapsCompleted: 3, targetLaps: 3 }), true);

gameSession.reset();
assert.equal(gameSession.targetLaps, 1);
gameSession.setTargetLaps(2);
assert.equal(gameSession.targetLaps, 2);
gameSession.setTargetLaps(3);
assert.equal(gameSession.targetLaps, 3);

assert.equal(existsSync('public/START_PLAYTEST.bat'), true);
assert.equal(existsSync('public/START_DRAFT_D_PREVIEW.bat'), false);
assert.equal(existsSync('public/START_DRAFT_D_FULL_MAP.bat'), false);

const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const scene066 = readFileSync('src/scenes/CareerMinigameBoardScene066.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const quickstart = readFileSync('public/PLAYTEST.txt', 'utf8');

assert.match(setup, /data-laps="1"/);
assert.match(setup, /data-laps="2"/);
assert.match(setup, /data-laps="3"/);
assert.match(setup, /configureInitialTargetLaps\(gameSession\.targetLaps\)/);
assert.match(scene066, /extends CareerMinigameBoardScene0651/);
assert.match(scene066, /replaceAll\('💼🎲', '💼'\)/);
assert.match(scene066, /HÒA, RA LẠI/);
assert.match(scene066, /setOrigin\(0\.5, 0\)/);
assert.match(scene066, /setLineSpacing\(10\)/);
assert.match(main, /CareerMinigameBoardScene066 as ActiveBoardScene/);
assert.match(quickstart, /Chỉ dùng START_PLAYTEST\.bat/);
assert.match(quickstart, /1 \/ 2 \/ 3 vòng/);

configureInitialTargetLaps(1);
console.log('[unified-flow-match-length-066] PASS one launcher + Job icon cleanup + Mini Game reflow + authoritative 1/2/3 lap target');
