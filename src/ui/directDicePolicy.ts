import type { TurnPhase } from '../core/turnPhase';

export interface DirectDiceVisibilityInput {
  phase: TurnPhase;
  canControl: boolean;
  isCpu: boolean;
  shellActive: boolean;
  cardPickerOpen?: boolean;
  presentationBlocking?: boolean;
}

export function shouldShowDirectTurnDice(input: DirectDiceVisibilityInput): boolean {
  return (
    input.shellActive &&
    input.canControl &&
    !input.isCpu &&
    !input.cardPickerOpen &&
    !input.presentationBlocking &&
    input.phase === 'PRE_ROLL_ACTION'
  );
}
