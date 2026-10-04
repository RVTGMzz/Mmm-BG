import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const scene = readFileSync('src/scenes/TurnOrderSceneCh17.ts', 'utf8');

assert.match(main, /TurnOrderSceneCh17 as TurnOrderScene/);
assert.match(scene, /extends TurnOrderScene07044/);
assert.match(scene, /paintToyTownBackdropCh17\(this, 'butter'/);
assert.match(scene, /roll-order-card-ch17-/);
assert.match(scene, /roll-order-status-panel-ch17/);
assert.match(scene, /roll-order-preview-ch17/);
assert.match(scene, /THỨ TỰ TẠM/);
assert.match(scene, /THỨ TỰ ĐÃ CHỐT/);
assert.match(scene, /activePlayerIdCh17/);
assert.match(scene, /partialOrderCopyCh17/);
assert.match(scene, /VÀO TRẬN/);
assert.doesNotMatch(scene, /Math\.random\s*\(/);
assert.doesNotMatch(scene, /submitClientIntent|resolveHostOwnedPrompt|configureInitialPlayOrder/);

console.log('[visual-refresh-turn-order-ch172] PASS presentation-only Roll For Order refresh + active/status/ranking surfaces');
