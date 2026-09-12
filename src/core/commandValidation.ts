import { computeMatchChecksum } from './checksum';
import type { MatchCommand, MatchState } from './matchState';

export interface CommandEnvelopeValidation {
  ok: boolean;
  actualChecksum: string;
  errors: string[];
}

/**
 * Validate a gameplay command against the exact deterministic state that must
 * exist immediately before the command is accepted.
 *
 * Legacy migrated commands may use revision < 0 and an empty preChecksum;
 * those two checks are skipped so old snapshots can still replay.
 */
export function validateMatchCommandEnvelope(
  state: MatchState,
  command: MatchCommand,
): CommandEnvelopeValidation {
  const errors: string[] = [];
  const currentPlayer = state.players[state.turn.currentPlayerIndex];
  const actualChecksum = computeMatchChecksum(state);

  if (command.turnNumber !== state.turn.turnNumber) {
    errors.push(`turn ${command.turnNumber} != ${state.turn.turnNumber}`);
  }
  if (command.playerIndex !== state.turn.currentPlayerIndex) {
    errors.push(`playerIndex ${command.playerIndex} != ${state.turn.currentPlayerIndex}`);
  }
  if (!currentPlayer) {
    errors.push(`missing current player index ${state.turn.currentPlayerIndex}`);
  } else if (command.actorId !== currentPlayer.id) {
    errors.push(`actor P${command.actorId} != current P${currentPlayer.id}`);
  }
  if (command.phase && command.phase !== state.turn.phase) {
    errors.push(`phase ${command.phase} != ${state.turn.phase}`);
  }
  if (
    typeof command.revision === 'number' &&
    command.revision >= 0 &&
    command.revision !== state.turn.revision
  ) {
    errors.push(`revision ${command.revision} != ${state.turn.revision}`);
  }
  if (command.preChecksum && command.preChecksum !== actualChecksum) {
    errors.push(`checksum ${command.preChecksum} != ${actualChecksum}`);
  }

  return {
    ok: errors.length === 0,
    actualChecksum,
    errors,
  };
}

export function formatCommandValidationError(
  command: MatchCommand,
  validation: CommandEnvelopeValidation,
): string {
  return `Command #${command.seq} ${command.type} rejected: ${validation.errors.join(', ')}.`;
}
