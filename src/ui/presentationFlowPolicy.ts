import type { MatchEvent } from '../core/matchState';
import type { BrowserSessionConfig } from '../core/browserSession';
import type { PlayerState } from '../core/types';
import { buildPresentationModel, type PresentationEventModel } from './presentationModel';

export type PresentationShellStatus = 'waiting' | 'active' | 'ended';

export interface PresentationTimingPolicy {
  mode: 'manual' | 'auto';
  skipAfterMs: number;
  autoCloseMs?: number;
}

export function shouldAutoAdvancePresentation(
  cpuSeatIds: readonly number[],
  playerCount = 4,
): boolean {
  if (playerCount <= 0 || cpuSeatIds.length !== playerCount) return false;
  const seats = new Set(cpuSeatIds);
  if (seats.size !== playerCount) return false;
  for (let seat = 0; seat < playerCount; seat += 1) {
    if (!seats.has(seat)) return false;
  }
  return true;
}

export function shouldDeferResultOverlay(
  presentationBlocking: boolean,
  shellStatus: PresentationShellStatus,
): boolean {
  return presentationBlocking && shellStatus === 'ended';
}

function soloHumanSeatIds(session: BrowserSessionConfig, playerCount: number): number[] {
  const cpu = new Set(session.cpuSeatIds);
  const ids: number[] = [];
  for (let seat = 0; seat < playerCount; seat += 1) {
    if (!cpu.has(seat)) ids.push(seat);
  }
  return ids;
}

function isGlobalModel(model: PresentationEventModel, playerCount: number): boolean {
  if (playerCount <= 1) return false;
  return new Set(model.affectedPlayerIds).size >= playerCount;
}

function relatesToAny(model: PresentationEventModel, seatIds: readonly number[]): boolean {
  const affected = new Set(model.affectedPlayerIds);
  return seatIds.some((seat) => affected.has(seat));
}

/**
 * 0.1.19 playfeel policy:
 * - dice/movement are automatic timeline beats;
 * - dedicated 4-CPU stress mode stays fast;
 * - one-human-vs-CPU sessions require acknowledgement only when the event affects that human;
 * - CPU-only and multiplayer/hotseat notices close automatically after at most 6 seconds;
 * - global/long notices may stay up to 10 seconds and become skippable once text reveal is complete.
 */
export function presentationTimingForModel(
  model: PresentationEventModel,
  session: BrowserSessionConfig,
  playerCount: number,
  textRevealMs: number,
): PresentationTimingPolicy {
  if (model.kind === 'dice_roll' || model.kind === 'move_step') {
    return { mode: 'auto', skipAfterMs: Number.POSITIVE_INFINITY, autoCloseMs: model.holdMs };
  }

  if (shouldAutoAdvancePresentation(session.cpuSeatIds, playerCount)) {
    return {
      mode: 'auto',
      skipAfterMs: Number.POSITIVE_INFINITY,
      autoCloseMs: Math.max(380, Math.min(900, model.holdMs)),
    };
  }

  const revealDone = Math.max(450, Math.ceil(textRevealMs));
  const global = isGlobalModel(model, playerCount);

  if (global) {
    return {
      mode: 'auto',
      skipAfterMs: revealDone,
      autoCloseMs: Math.min(10_000, Math.max(6_000, revealDone + 1_800)),
    };
  }

  if (session.mode === 'solo') {
    const humans = soloHumanSeatIds(session, playerCount);
    if (humans.length === 1 && relatesToAny(model, humans)) {
      return {
        mode: 'manual',
        skipAfterMs: revealDone,
      };
    }
  }

  return {
    mode: 'auto',
    skipAfterMs: Math.max(3_000, revealDone),
    autoCloseMs: Math.min(6_000, Math.max(4_200, revealDone + 1_600)),
  };
}

export function countBlockingPresentationEvents(
  events: readonly MatchEvent[],
  players: PlayerState[],
): number {
  let count = 0;
  for (const event of events) {
    if (buildPresentationModel(event, players)) count += 1;
  }
  return count;
}
