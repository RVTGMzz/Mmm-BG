import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const demo = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const shell = readFileSync('src/core/demoShellSession.ts', 'utf8');
const mobile = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');

assert.match(demo, /this\.shellHost\.begin\(hostAuthorityCommandSeq\(this\.hostSession\.authority\)\)/);
assert.match(demo, /READY • HOST/);
assert.match(demo, /READY • trận local bắt đầu/);
assert.match(demo, /showReadyFlash\(\)/);
assert.match(demo, /if \(this\.shell\.status !== 'ended'\) return/);
assert.doesNotMatch(demo, /BẮT ĐẦU DEMO/);
assert.doesNotMatch(demo, /MeMeMe DEMO MATCH/);
assert.match(shell, /begin\(commandSeq: number\)/);
assert.match(shell, /this\.shell\.status = 'active'/);
assert.match(shell, /kind: 'shell_state'/);

assert.match(mobile, /copy\.includes\('TỔNG QUAN'\)/);
assert.match(mobile, /copy\.includes\('CHUNG KẾT'\)/);
assert.match(mobile, /copy\.startsWith\('LƯỢT:'\)/);
assert.match(mobile, /object\.setVisible\(false\)/);

console.log('[online-board-autostart-07045] PASS board auto-starts, flashes READY, retires demo gate, and hides legacy top chrome');
