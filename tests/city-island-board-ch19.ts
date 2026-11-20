import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import type { BoardDefinition } from '../src/core/types';
import { effectiveBoardNode071 } from '../src/core/lapShuffle071';

const board = boardJson as BoardDefinition;
const main = readFileSync('src/main.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardSceneIslandCh19.ts', 'utf8');
const scenery = readFileSync('src/ui/cityIslandSceneryCh19.ts', 'utf8');

// The island board is the active board and keeps the whole CH-17.3 chain.
assert.match(main, /CareerMinigameBoardSceneIslandCh19 as ActiveBoardScene/);
assert.match(scene, /class CareerMinigameBoardSceneIslandCh19 extends CareerMinigameBoardSceneCh173/);
assert.match(scene, /super\.create\(\)/);
assert.match(scene, /super\.update\(\)/);

// Presentation only: no intents, no gameplay RNG, no authority writes.
for (const source of [scene, scenery]) {
  assert.doesNotMatch(source, /submitIntent\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /core\/(rng|authority|turn)'/);
}

// Tiles are redrawn from the authoritative Lap Shuffle assignment.
assert.match(scene, /effectiveBoardNode071\(BOARD_CH19, target\.id, assignments\)/);
assert.match(scene, /boardContentAssignments/);
// Inherited tile objects stay alive (for lookups/tweens) but are kept invisible.
assert.match(scene, /setAlpha\(0\.001\)/);
assert.match(scene, /city-island-tile-ch19/);
assert.match(scene, /city-island-scenery-ch19/);

// Scenery sits below every tile/token and keeps the board playable if it fails.
assert.match(scene, /SCENERY_DEPTH_CH19 = -45/);
assert.match(scene, /TILE_DEPTH_CH19 = 4\.2/);
assert.match(scene, /console\.warn\('\[CH-19\] island scenery unavailable'/);
// GPU-safe texture size.
assert.match(scenery, /maxSide = 4096/);

// Every board tile resolves to a visual after any shuffle assignment.
const swapped = board.nodes
  .filter((n) => n.type === 'card' || n.type === 'news')
  .slice(0, 2);
const assignments = swapped.length === 2
  ? [{ nodeId: swapped[0].id, sourceNodeId: swapped[1].id }, { nodeId: swapped[1].id, sourceNodeId: swapped[0].id }]
  : [];
for (const node of board.nodes) {
  const effective = effectiveBoardNode071(board, node.id, assignments);
  assert.equal(effective.x, node.x);
  assert.equal(effective.y, node.y);
}

// CH-19 player cards: painted from match state, legacy corner HUD kept but hidden.
const card = readFileSync('src/ui/playerCardCh19.ts', 'utf8');
assert.match(scene, /syncPlayerCardsCh19/);
assert.match(scene, /legacy\.root\.setAlpha\(0\)/);
assert.match(scene, /playerHudCareer065\(player, JOBS_CH19\)/);
assert.match(card, /portrait-atlas-starters\.webp/);
assert.match(card, /passiveConcept\?\.label/);
assert.match(card, /topRightGearClearance: 44/);
assert.doesNotMatch(card, /submitIntent\s*\(|Math\.random\s*\(/);

// Board tokens: seat badges replaced by a player-colour ground shadow; still Characters breathe.
assert.match(scene, /syncCharacterTokensCh19/);
assert.match(scene, /player-ground-ch19/);
assert.match(scene, /IDLE_WALK_FRAME_CH19/);
assert.match(scene, /BREATH_PERIOD_MS_CH19/);

// CH-19 action buttons: inherited hit areas/handlers kept, dice anchored bottom-centre.
assert.match(scene, /syncActionButtonsCh19/);
assert.match(scene, /dice\.setX\(640\)\.setY\(stage\.y \+ stage\.h - 12 - 146\)/);
assert.match(scene, /TUNG XÚC XẮC/);
assert.match(scene, /card-action-ch19/);
const layer = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
assert.match(layer, /fontSize: '19px'/);
assert.match(layer, /TIẾP TỤC  ▶/);
const turnOrder = readFileSync('src/scenes/TurnOrderSceneCh17.ts', 'utf8');
assert.match(turnOrder, /rollSkin0701\?\.setAlpha\(0\)/);

// CH-19 walk strips generated from the concept sheets (8 x 192px, same format as CH-18 strips).
for (const file of ['walk-cau-co-ch19', 'walk-khoc-nhe-ch19', 'walk-lo-lang-ch19', 'walk-tang-dong-ch19', 'crawl-secret-baby-ch19',
  'idle-cau-co-ch19', 'idle-khoc-nhe-ch19', 'idle-lo-lang-ch19', 'idle-tang-dong-ch19', 'idle-secret-baby-ch19']) {
  assert.ok(existsSync(`public/assets/characters/ch19/${file}.png`), `${file} missing`);
  assert.match(scene, new RegExp(`assets/characters/ch19/${file}\.png`));
}
assert.match(scene, /WALK_STRIP_CH19/);
assert.match(scene, /IDLE_STRIP_CH19/);
assert.match(scene, /idleActionDelayCh19/);

// CH-19 live scenery: concept-styled sprites placed clear of every tile, gently animated.
const propsSrc = readFileSync('src/ui/islandPropsCh19.ts', 'utf8');
assert.match(scenery, /PROP_CATALOG_CH19/);
assert.match(scenery, /TILE_CLEAR = 66/);
assert.match(scenery, /Headlands for the Jail and Hospital/);
for (const key of ['tree-oak', 'tree-blossom', 'tree-palm', 'tree-pine', 'tree-autumn', 'house-red', 'cafe', 'tower-glass', 'ferris-wheel', 'ferris-base', 'hospital', 'jail', 'jobs', 'fountain']) {
  assert.ok(existsSync(`public/assets/scenery/ch19/${key}.png`), `${key} sprite missing`);
}
assert.match(propsSrc, /installIslandPropsCh19/);
assert.match(propsSrc, /island-ferris-wheel-ch19/);
assert.doesNotMatch(propsSrc, /Math\.random\s*\(|submitIntent\s*\(/);
assert.match(scene, /installIslandPropsCh19\(this, scenery\.props, scenery\.bounds\)/);

// CH-19 jail / hospital ride: police car or ambulance picks the Character up (presentation only).
const rescue = readFileSync('src/ui/rescueVehiclesCh19.ts', 'utf8');
for (const key of ['police-car', 'police-car-open', 'ambulance', 'ambulance-open']) {
  assert.ok(existsSync(`public/assets/scenery/ch19/${key}.png`), `${key} sprite missing`);
}
assert.match(scene, /syncRescueRidesCh19/);
assert.match(scene, /installRescueMoveCh19/);
assert.match(scene, /onArrive/);
assert.match(rescue, /startSirenCh19/);
assert.match(rescue, /sfxController\.getState\(\)\.muted/);
assert.doesNotMatch(rescue, /Math\.random\s*\(|submitIntent\s*\(|specialHold\s*=/);

// CH-19 painted dice roll: tumbles through all six faces, lands on the event result.
const diceSrc = readFileSync('src/ui/diceRollCh19.ts', 'utf8');
for (const key of ['dice-top-1', 'dice-top-6', 'dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5', 'dice-6', 'dice-tumble-1', 'dice-tumble-4', 'dice-dust', 'dice-burst']) {
  assert.ok(existsSync(`public/assets/scenery/ch19/${key}.png`), `${key} sprite missing`);
}
assert.match(scene, /installDiceRollCh19/);
assert.match(scene, /model\.roll/);
assert.match(diceSrc, /DICE_TOP_KEYS_CH19\[face - 1\]/);
assert.doesNotMatch(diceSrc, /Math\.random\s*\(|submitIntent\s*\(/);

// CH-19 wildlife + beach: rabbits / butterflies at bushes, bird flocks with soft chirps, sprite beach props.
const critters = readFileSync('src/ui/islandCrittersCh19.ts', 'utf8');
for (const key of ['bird-blue-1', 'bird-yellow-4', 'seagull-3', 'butterfly-orange-2', 'butterfly-blue-3', 'rabbit-peek', 'rabbit-peek-blink', 'rabbit-sit', 'rabbit-hop',
  'umbrella-red', 'umbrella-blue', 'beach-towel', 'lounge-chair', 'beach-ball', 'sandcastle']) {
  assert.ok(existsSync(`public/assets/scenery/ch19/${key}.png`), `${key} sprite missing`);
}
assert.match(propsSrc, /installIslandCrittersCh19/);
assert.match(propsSrc, /BUSH_TINTS_CH19/);
assert.match(critters, /chirpCh19/);
assert.match(critters, /sfxController\.getState\(\)\.muted/);
assert.doesNotMatch(critters, /Math\.random\s*\(|submitIntent\s*\(/);
assert.match(scenery, /place\(key, 'beach'/);
assert.doesNotMatch(scenery, /function umbrella\(/);

// CH-19 painted UI kit (concept-matched frames / buttons / icons) over the older flat panels.
const uiKit = readFileSync('src/ui/uiKitCh19.ts', 'utf8');
for (const key of ['panel-coral', 'panel-lilac', 'btn-coral', 'btn-blue', 'btn-slate', 'icon-coin', 'icon-card', 'icon-crown']) {
  assert.ok(existsSync(`public/assets/ui/ch19/${key}.png`), `${key} UI art missing`);
}
assert.match(uiKit, /nineslice/);
assert.match(scene, /syncPopupSkinsCh19/);
assert.match(scene, /presentation-continue-chip-ch1713/);
assert.match(scene, /uiPillCh19\(this, 'btn-coral'/);
assert.doesNotMatch(uiKit, /Math\.random\s*\(|submitIntent\s*\(/);
assert.match(critters, /busy \?/);

// CH-19 party UI: painted busts, starry backdrops, portrait-card select / match info / roll order,
// turn spotlight with menu, responsive stage (any aspect ratio, no letterbox), painted ground textures.
const party = readFileSync('src/ui/partyKitCh19.ts', 'utf8');
const stage = readFileSync('src/ui/responsiveStageCh19.ts', 'utf8');
const setupParty = readFileSync('src/ui/setupPartyCh19.ts', 'utf8');
const orderParty = readFileSync('src/ui/turnOrderPartyCh19.ts', 'utf8');
const spotlight = readFileSync('src/ui/turnSpotlightCh19.ts', 'utf8');
const splash = readFileSync('src/scenes/SplashScene069.ts', 'utf8');
for (const key of ['khoc-nhe', 'cau-co', 'lo-lang', 'tang-dong', 'secret-baby']) {
  assert.ok(existsSync(`public/assets/ui/ch19/bust-${key}.webp`), `${key} bust missing`);
}
for (const key of ['grass', 'water', 'sand']) assert.ok(existsSync(`public/assets/scenery/ch19/tex/${key}.jpg`), `${key} texture missing`);
assert.match(scenery, /inlineIslandTexturesCh19/);
assert.match(main, /installResponsiveStageCh19\(game\)/);
assert.match(stage, /stageSizeForCh19/);
assert.match(splash, /Một tựa game của Votri Valley/);
assert.match(setupParty, /installCharacterSelectPartyCh19/);
assert.match(setupParty, /Thông tin ván/);
assert.match(orderParty, /handlePrimaryButton\(\)/);
assert.match(spotlight, /openRanking/);
assert.match(spotlight, /openLeave/);
assert.match(scene, /syncTurnSpotlightCh19/);
assert.match(scene, /this\.actorCh19 = model\.actorId/);
assert.match(critters, /RABBIT_DEPTH_CH19 = 4\.6/);
assert.match(critters, /BIRD_DEPTH_CH19 = 590/);
for (const src of [party, stage, setupParty, orderParty, spotlight]) assert.doesNotMatch(src, /Math\.random\s*\(|submitIntent\s*\(/);

console.log('PASS CH-19 city island board + player cards: presentation-only layer over CH-17.3');
