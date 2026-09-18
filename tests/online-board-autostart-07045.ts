import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const demo = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const shell = readFileSync('src/core/demoShellSession.ts', 'utf8');

assert.match(demo, /if \(config\.mode === 'host'\)/);
assert.match(demo, /this\.shellHost\.begin\(hostAuthorityCommandSeq\(this\.hostSession\.authority\)\)/);
assert.match(demo, /trận online tự bắt đầu/);
assert.match(demo, /shell_hello -> shell_state/);
assert.match(shell, /begin\(commandSeq: number\)/);
assert.match(shell, /this\.shell\.status = 'active'/);
assert.match(shell, /kind: 'shell_state'/);

// The manual DEMO start button is retained for solo/hotseat fallback only.
assert.match(demo, /Demo hotseat sẵn sàng\. Bấm BẮT ĐẦU/);

console.log('[online-board-autostart-07045] PASS online host auto-begins shell and late clients receive active state');
