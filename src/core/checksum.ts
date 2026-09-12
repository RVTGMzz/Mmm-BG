import type { MatchState } from './matchState';

function canonicalMatchPayload(match: MatchState): string {
  return JSON.stringify({
    schemaVersion: match.schemaVersion,
    boardId: match.boardId,
    seed: match.seed,
    startingMoney: match.startingMoney,
    rng: {
      seed: match.rng.seed,
      state: match.rng.state,
      calls: match.rng.calls,
    },
    turn: {
      currentPlayerIndex: match.turn.currentPlayerIndex,
      turnNumber: match.turn.turnNumber,
      lastRoll: match.turn.lastRoll,
      phase: match.turn.phase,
      revision: match.turn.revision,
    },
    players: [...match.players]
      .sort((a, b) => a.id - b.id)
      .map((player) => ({
        id: player.id,
        name: player.name,
        nodeId: player.nodeId,
        money: player.money,
        cardBlockTurns: player.cardBlockTurns,
        handCardIds: [...player.handCardIds],
        cardsPlayedThisTurn: player.cardsPlayedThisTurn,
      })),
  });
}

/**
 * FNV-1a 32-bit checksum over gameplay-critical serializable state.
 * Presentation event/command logs are intentionally excluded.
 */
export function computeMatchChecksum(match: MatchState): string {
  const input = canonicalMatchPayload(match);
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
}
