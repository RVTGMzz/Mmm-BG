import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import type { BoardDefinition } from '../src/core/types';
import {
  CANONICAL_HUD_POSITIONS_0561,
  CANONICAL_PRESENTATION_0561,
  canonicalHudPosition0561,
} from '../src/ui/canonicalPresentation0561';

const BOARD = boardJson as BoardDefinition;
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const sceneSource = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0561.ts', import.meta.url), 'utf8');
const scene057Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene057.ts', import.meta.url), 'utf8');
const scene058Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene058.ts', import.meta.url), 'utf8');
const scene059Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene059.ts', import.meta.url), 'utf8');
const scene060Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene060.ts', import.meta.url), 'utf8');
const scene061Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene061.ts', import.meta.url), 'utf8');
const pickerSource = readFileSync(new URL('../src/ui/BranchPicker.ts', import.meta.url), 'utf8');

assert(!CANONICAL_PRESENTATION_0561.header.includes('0.1.25'));
assert(!CANONICAL_PRESENTATION_0561.badge.includes('0.1.25'));
assert.equal(CANONICAL_PRESENTATION_0561.version, '0.1.61');
assert(CANONICAL_PRESENTATION_0561.normalFollowZoom > CANONICAL_PRESENTATION_0561.branchDecisionZoom);
assert(CANONICAL_PRESENTATION_0561.branchDecisionZoom > CANONICAL_PRESENTATION_0561.overviewZoom);

assert.deepEqual(
  CANONICAL_HUD_POSITIONS_0561.map((position) => position.corner),
  ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  'P1/P2/P3/P4 must stay locked to the four canonical screen corners.',
);
assert.equal(canonicalHudPosition0561(0).corner, 'top-left');
assert.equal(canonicalHudPosition0561(1).corner, 'top-right');
assert.equal(canonicalHudPosition0561(2).corner, 'bottom-left');
assert.equal(canonicalHudPosition0561(3).corner, 'bottom-right');

assert.equal(BOARD.id, 'city-mvp-graph-01', 'Presentation pass must not fork authoritative board identity.');
assert.equal(BOARD.nodes.filter((node) => node.id >= 0 && node.id < 44).length, 44);
assert.equal(BOARD.nodes.filter((node) => node.feature === 'minigame' && node.id < 44).length, 5);

assert(
  mainSource.includes("CareerMinigameBoardScene061 as ActiveBoardScene"),
  'Canonical START_PLAYTEST runtime may advance presentation-only wrappers but must keep the 0.1.56.1 presentation architecture.',
);
assert(
  scene061Source.includes('extends CareerMinigameBoardScene060'),
  '0.1.61 local report wrapper must preserve 0.1.60 and the full validated presentation chain.',
);
assert(
  scene060Source.includes('extends CareerMinigameBoardScene059'),
  '0.1.60 pacing/economy wrapper must retain 0.1.59 and the full validated presentation chain.',
);
assert(
  scene059Source.includes('extends CareerMinigameBoardScene058'),
  '0.1.59 Job/Mini wrapper must preserve 0.1.58 and the full validated presentation chain.',
);
assert(
  scene058Source.includes('extends CareerMinigameBoardScene057'),
  '0.1.58 depth wrapper must preserve 0.1.57 authority and the canonical presentation chain.',
);
assert(
  scene057Source.includes('extends CareerMinigameBoardScene0561'),
  '0.1.57 must preserve the canonical 0.1.56.1 presentation wrapper.',
);
assert(
  sceneSource.includes('extends CareerMinigameBoardScene056'),
  '0.1.56.1 must inherit the validated 0.1.56 gameplay/authority chain.',
);
assert(sceneSource.includes("'canonical-ui-0561'"), 'Canonical runtime needs a separate fixed UI camera.');
assert(sceneSource.includes('startFollow(token'), 'Normal gameplay camera must follow the active token.');
assert(sceneSource.includes('setOverviewMode'), 'Full-map view must be an explicit Overview mode.');
assert(sceneSource.includes('showBranchPicker'), 'Canonical human branch choice must use the manual branch picker.');
assert(sceneSource.includes("phase !== 'BRANCH_CHOICE'"));
assert(!sceneSource.includes('pickParityEdge'), 'Parity AUTO routing must not be restored in canonical human gameplay.');
assert(!sceneSource.includes('0.1.25'), 'Canonical presentation must not encode the leaked 0.1.25 label.');
assert(!scene059Source.includes('Math.random'), '0.1.59 must not add presentation RNG.');
assert(!scene059Source.includes('submitIntent('), '0.1.59 scene must keep gameplay authority outside presentation.');
assert(!scene060Source.includes('Math.random'), '0.1.60 must not add presentation RNG.');
assert(!scene060Source.includes('submitIntent('), '0.1.60 scene must keep gameplay authority outside presentation.');
assert(!scene061Source.includes('Math.random'), '0.1.61 must not add presentation RNG.');
assert(!scene061Source.includes('submitIntent('), '0.1.61 scene must keep gameplay authority outside presentation.');

assert(
  !pickerSource.includes('1280, 720'),
  'Branch picker must not restore a full-screen dim surface that hides route context.',
);
assert(pickerSource.includes('CHỌN HƯỚNG'));
assert(pickerSource.includes('branchFlavorInfo056'));
assert(!pickerSource.includes('Node 200'));

console.log('[canonical-presentation-0561] PASS close follow + branch framing + explicit overview + four-corner HUD retained through 0.1.61');
