import type { BrowserSessionConfig } from '../core/browserSession';

/**
 * CH-16 Mini Game seat ownership.
 * - SOLO/HOTSEAT: every non-CPU seat is controlled sequentially on this device.
 * - LOCAL/ONLINE HOST/CLIENT: this device may only control its assigned seat.
 * - CPU seats never receive an interactive choice surface.
 */
export function controlsMiniGameSeatCh16(
  config: BrowserSessionConfig,
  playerId: number,
): boolean {
  if (!Number.isInteger(playerId) || playerId < 0 || playerId > 3) return false;
  if (config.cpuSeatIds.includes(playerId)) return false;
  if (config.mode === 'solo') return true;
  return config.seatId === playerId;
}
