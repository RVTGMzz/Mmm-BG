import type { MatchEvent } from '../core/matchState';
import { PACING_060 } from '../core/pacingEconomy060';
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
 * 0.1.60 pacing policy:
 * - dice/movement remain automatic timeline beats;
 * - special-release results are always automatic because they contain no player choice;
 * - dedicated 4-CPU stress mode stays very fast;
 * - one-human-vs-CPU events that affect the human remain manual/acknowledgeable;
 * - passive multiplayer/CPU notices close ~15–20% sooner than the 0.1.19 policy;
 * - global events still keep enough reading time, but no longer linger up to 10s.
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

  // Jail/Hospital release results are status feedback only. They must never become
  // manual acknowledgement gates, otherwise a stale/misclassified CPU seat can leave
  // the release modal blocking forever and the fresh same-turn D6 never appears.
  if (model.kind === 'tile_land' && model.tileType === 'special_release') {
    return {
      mode: 'auto',
      skipAfterMs: Number.POSITIVE_INFINITY,
      autoCloseMs: Math.max(900, model.holdMs),
    };
  }

  if (shouldAutoAdvancePresentation(session.cpuSeatIds, playerCount)) {
    return {
      mode: 'auto',
      skipAfterMs: Number.POSITIVE_INFINITY,
      autoCloseMs: Math.max(380, Math.min(PACING_060.cpuAutoMaxMs, model.holdMs)),
    };
  }

  const revealDone = Math.max(450, Math.ceil(textRevealMs));
  const global = isGlobalModel(model, playerCount);

  if (global) {
    return {
      mode: 'auto',
      skipAfterMs: revealDone,
      autoCloseMs: Math.min(
        PACING_060.globalAutoMaxMs,
        Math.max(PACING_060.globalAutoMinMs, revealDone + PACING_060.globalTailMs),
      ),
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
    skipAfterMs: Math.max(PACING_060.passiveSkipMinMs, revealDone),
    autoCloseMs: Math.min(
      PACING_060.passiveAutoMaxMs,
      Math.max(PACING_060.passiveAutoMinMs, revealDone + PACING_060.passiveTailMs),
    ),
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
