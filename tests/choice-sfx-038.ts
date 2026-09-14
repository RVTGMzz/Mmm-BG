import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const choiceSources = [
  'src/ui/BranchPicker.ts',
  'src/ui/TargetPicker.ts',
  'src/ui/CardHandPicker.ts',
  'src/ui/TacticalChoicePicker.ts',
  'src/ui/JobChoicePicker.ts',
  'src/ui/MiniGameOverlay.ts',
  'src/scenes/LocalLobbyScene.ts',
  'src/scenes/SetupScene.ts',
  'src/ui/SettingsPanel.ts',
];

for (const path of choiceSources) {
  const source = await readFile(path, 'utf8');
  assert(
    source.includes("sfxController.play('ui_confirm')"),
    `${path} must retain supplied choice/ui_confirm feedback for user confirmation actions`,
  );
}

for (const path of ['src/scenes/LocalLobbyScene.ts', 'src/scenes/SetupScene.ts']) {
  const source = await readFile(path, 'utf8');
  assert(!source.includes('demo 3 vòng'), `${path} must not advertise the obsolete 3-round end rule`);
  assert(!source.includes('MVP 0.1.31'), `${path} must not expose the obsolete 0.1.31 build badge`);
  assert(
    source.includes('0.1.39'),
    `${path} should identify the current 0.1.39 presentation build`,
  );
}

console.log(`[choice-sfx-038] PASS choice feedback sources=${choiceSources.length} legacy3RoundCopy=ABSENT currentBuild=0.1.39`);
