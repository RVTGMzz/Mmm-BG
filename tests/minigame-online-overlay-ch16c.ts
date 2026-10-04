import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mini = readFileSync('src/ui/MiniGameOverlay.ts', 'utf8');
const sync = readFileSync('src/core/miniGameChoiceSync.ts', 'utf8');
const protocol = readFileSync('src/core/miniGameChoiceProtocol.ts', 'utf8');
const twoTab = readFileSync('src/core/twoTabSession.ts', 'utf8');

const stripComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');
const miniExec = stripComments(mini);

assert.match(mini, /MiniGameChoiceHostSync/);
assert.match(mini, /MiniGameChoiceClientSync/);
assert.match(mini, /const collectChoices = async <T extends string>/);
assert.match(mini, /networkedChoiceMode = browserSession\.current\.mode !== 'solo'/);
assert.match(mini, /browserSession\.current\.mode === 'solo' && !browserSession\.isCpuSeat\(id\)/);
assert.equal(
  (mini.match(/isInteractiveHuman\(/g) ?? []).length,
  1,
  'Only the solo collector may call isInteractiveHuman; network rounds must use Host sync.',
);

for (const marker of [
  'rps:',
  'all_in:1',
  'three_doors:',
  'solo_buoy:',
  'final_sprint:',
  'majority:',
]) {
  assert.ok(mini.includes(marker), `Missing synced Mini Game prompt key ${marker}`);
}

assert.match(mini, /hostChoiceSync\.openRound\(eventSeq, promptKey, ids, allowedChoices\)/);
assert.match(mini, /hostChoiceSync\.submitSystemChoice/);
assert.match(mini, /hostChoiceSync\.submitHostChoice/);
assert.match(mini, /clientChoiceSync\.submitChoice/);
assert.match(mini, /clientChoiceSync\.waitForComplete/);
assert.match(mini, /hostChoiceSync\.waitForComplete/);
assert.match(mini, /vf07-minigame-network-wait-paper-ch16c/);
assert.match(mini, /\.finally\(closeChoiceSync\)/);

assert.match(mini, /submitSystemIntent\('resolve_minigame'/);
assert.doesNotMatch(mini, /clientSession\.submitIntent\('resolve_minigame'/);
assert.match(twoTab, /Mini Game result is host-system only/);
assert.match(twoTab, /resolve_minigame is host-system only/);

assert.match(protocol, /Secret choices are omitted until every required seat has committed/);
assert.match(sync, /revealedChoices = complete/);
assert.match(sync, /claimedSeatForClient\(submit\.clientId\)/);
assert.match(sync, /claimedSeat !== submit\.playerId/);
assert.match(sync, /đã chốt lựa chọn và không thể đổi/);
assert.match(sync, /minigame_choice_sync_request/);

assert.doesNotMatch(miniExec, /Math\.random\s*\(/);
assert.doesNotMatch(sync, /Math\.random\s*\(/);

console.log('[minigame-online-overlay-ch16c] PASS all interactive Mini Game decisions use secret Host-synced commit/reveal while payout stays Host-only');
