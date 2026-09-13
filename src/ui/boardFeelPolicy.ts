import type { PlayerState } from '../core/types';

const MIN_STEP_MS = 170;
const MAX_STEP_MS = 310;

export function movementStepDurationMs(distancePx: number): number {
  if (!Number.isFinite(distancePx) || distancePx <= 0) return MIN_STEP_MS;
  return Math.round(Math.max(MIN_STEP_MS, Math.min(MAX_STEP_MS, 145 + distancePx * 0.72)));
}

export function compactPlayerStatus(
  player: PlayerState,
  currentPlayerId: number,
  isCpu: boolean,
): string {
  const marker = player.id === currentPlayerId ? '▶' : '•';
  const cpu = isCpu ? ' 🤖' : '';
  const lock = player.cardBlockTurns > 0 ? ` 🔒${player.cardBlockTurns}` : '';
  return `${marker} P${player.id + 1}${cpu} ${player.name}  ${player.money}B$  🃏${player.handCardIds.length}/3${lock}`;
}

export function clampDiceFace(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(6, Math.floor(value)));
}
