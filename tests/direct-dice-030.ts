import assert from 'node:assert/strict';
import { shouldShowDirectTurnDice } from '../src/ui/directDicePolicy';

assert.equal(
  shouldShowDirectTurnDice({ phase: 'PRE_ROLL_ACTION', canControl: true, isCpu: false, shellActive: true }),
  true,
  'human controller should get the direct dice during PRE_ROLL_ACTION',
);

assert.equal(
  shouldShowDirectTurnDice({ phase: 'PRE_ROLL_ACTION', canControl: true, isCpu: true, shellActive: true }),
  false,
  'CPU seats must not show a clickable direct dice',
);

assert.equal(
  shouldShowDirectTurnDice({ phase: 'ROLLING', canControl: true, isCpu: false, shellActive: true }),
  false,
  'direct dice must disappear as soon as authoritative rolling begins',
);

assert.equal(
  shouldShowDirectTurnDice({ phase: 'MOVING', canControl: true, isCpu: false, shellActive: true }),
  false,
  'direct dice must stay hidden during movement',
);

assert.equal(
  shouldShowDirectTurnDice({ phase: 'PRE_ROLL_ACTION', canControl: false, isCpu: false, shellActive: true }),
  false,
  'remote/non-controlling clients must not get a clickable dice',
);

assert.equal(
  shouldShowDirectTurnDice({ phase: 'PRE_ROLL_ACTION', canControl: true, isCpu: false, shellActive: false }),
  false,
  'waiting/ended match shells must not show the direct dice',
);

assert.equal(
  shouldShowDirectTurnDice({
    phase: 'PRE_ROLL_ACTION',
    canControl: true,
    isCpu: false,
    shellActive: true,
    cardPickerOpen: true,
  }),
  false,
  'direct dice must stay hidden while Card hand/target/tactical picker is open',
);

assert.equal(
  shouldShowDirectTurnDice({
    phase: 'PRE_ROLL_ACTION',
    canControl: true,
    isCpu: false,
    shellActive: true,
    presentationBlocking: true,
  }),
  false,
  'release/result modal must block the fresh direct D6 until presentation closes',
);

assert.equal(
  shouldShowDirectTurnDice({
    phase: 'PRE_ROLL_ACTION',
    canControl: true,
    isCpu: false,
    shellActive: true,
    presentationBlocking: false,
  }),
  true,
  'fresh direct D6 may return after the blocking release presentation closes',
);

console.log('[direct-dice-030] PASS direct dice is local-human only, presentation-safe and can return after release');
