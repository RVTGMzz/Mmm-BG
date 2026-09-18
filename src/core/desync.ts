import type { MatchState } from './matchState';

export interface MatchStateDiff {
  path: string;
  left: string;
  right: string;
}

function printable(value: unknown): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function pushDiff(
  diffs: MatchStateDiff[],
  path: string,
  left: unknown,
  right: unknown,
): void {
  if (JSON.stringify(left) === JSON.stringify(right)) return;
  diffs.push({ path, left: printable(left), right: printable(right) });
}

/**
 * Compare gameplay-critical state only. Presentation/event/command history is intentionally excluded,
 * matching the checksum contract used by deterministic replay verification.
 */
export function diffMatchStates(left: MatchState, right: MatchState): MatchStateDiff[] {
  const diffs: MatchStateDiff[] = [];

  pushDiff(diffs, 'schemaVersion', left.schemaVersion, right.schemaVersion);
  pushDiff(diffs, 'boardId', left.boardId, right.boardId);
  pushDiff(diffs, 'seed', left.seed, right.seed);
  pushDiff(diffs, 'startingMoney', left.startingMoney, right.startingMoney);

  pushDiff(diffs, 'rng.seed', left.rng.seed, right.rng.seed);
  pushDiff(diffs, 'rng.state', left.rng.state, right.rng.state);
  pushDiff(diffs, 'rng.calls', left.rng.calls, right.rng.calls);

  pushDiff(
    diffs,
    'turn.currentPlayerIndex',
    left.turn.currentPlayerIndex,
    right.turn.currentPlayerIndex,
  );
  pushDiff(diffs, 'turn.turnNumber', left.turn.turnNumber, right.turn.turnNumber);
  pushDiff(diffs, 'turn.lastRoll', left.turn.lastRoll, right.turn.lastRoll);
  pushDiff(diffs, 'turn.phase', left.turn.phase, right.turn.phase);
  pushDiff(diffs, 'turn.revision', left.turn.revision, right.turn.revision);

  const playerIds = new Set([
    ...left.players.map((player) => player.id),
    ...right.players.map((player) => player.id),
  ]);

  for (const playerId of [...playerIds].sort((a, b) => a - b)) {
    const leftPlayer = left.players.find((player) => player.id === playerId);
    const rightPlayer = right.players.find((player) => player.id === playerId);

    if (!leftPlayer || !rightPlayer) {
      pushDiff(diffs, `players.${playerId}`, leftPlayer ?? null, rightPlayer ?? null);
      continue;
    }

    const prefix = `players.${playerId}`;
    pushDiff(diffs, `${prefix}.name`, leftPlayer.name, rightPlayer.name);
    pushDiff(diffs, `${prefix}.nodeId`, leftPlayer.nodeId, rightPlayer.nodeId);
    pushDiff(diffs, `${prefix}.money`, leftPlayer.money, rightPlayer.money);
    pushDiff(
      diffs,
      `${prefix}.cardBlockTurns`,
      leftPlayer.cardBlockTurns,
      rightPlayer.cardBlockTurns,
    );
    pushDiff(diffs, `${prefix}.handCardIds`, leftPlayer.handCardIds, rightPlayer.handCardIds);
    pushDiff(
      diffs,
      `${prefix}.cardsPlayedThisTurn`,
      leftPlayer.cardsPlayedThisTurn,
      rightPlayer.cardsPlayedThisTurn,
    );
  }

  return diffs;
}

export function formatMatchStateDiff(diff: MatchStateDiff): string {
  return `${diff.path}: ${diff.left} → ${diff.right}`;
}

export function summarizeMatchStateDiffs(
  left: MatchState,
  right: MatchState,
  limit = 6,
): string[] {
  const diffs = diffMatchStates(left, right);
  if (diffs.length === 0) return ['No gameplay-state differences found.'];

  const visible = diffs.slice(0, Math.max(1, limit)).map(formatMatchStateDiff);
  const hidden = diffs.length - visible.length;
  if (hidden > 0) visible.push(`… +${hidden} more difference(s)`);
  return visible;
}
