import { miniGameEligiblePlayers060 } from './pacingEconomy060';
import type { BoardNode, PlayerState, SpecialHoldLocation } from './types';

export const SPECIAL_LOCATION_057 = {
  jail: {
    gateContentId: 'SPECIAL_JAIL_GATE',
    holdNodeId: 100,
    // 0.1.64: these nodes are now the real fresh-D6 corridor after release.
    // Release itself no longer auto-traverses them.
    exitPath: [101, 102, 103, 12] as const,
    releaseAutoPath: [] as const,
    releaseFaces: [1, 3, 5] as const,
    title: 'ĐỒN CẢNH SÁT',
    icon: '🚔',
  },
  hospital: {
    gateContentId: 'SPECIAL_HOSPITAL_GATE',
    holdNodeId: 110,
    exitPath: [111, 112, 113, 34] as const,
    releaseAutoPath: [] as const,
    releaseFaces: [2, 4, 5] as const,
    title: 'BỆNH VIỆN',
    icon: '🏥',
  },
  lottery: {
    contentId: 'SPECIAL_LOTTERY',
    multiplier: 20,
    title: 'XỔ SỐ',
    icon: '🎰',
  },
} as const;

export function specialHoldForGate057(node: BoardNode): SpecialHoldLocation | undefined {
  if (node.contentId === SPECIAL_LOCATION_057.jail.gateContentId) return 'jail';
  if (node.contentId === SPECIAL_LOCATION_057.hospital.gateContentId) return 'hospital';
  return undefined;
}

export function isLotteryNode057(node: BoardNode): boolean {
  return node.contentId === SPECIAL_LOCATION_057.lottery.contentId;
}

export function specialHoldNodeId057(location: SpecialHoldLocation): number {
  return SPECIAL_LOCATION_057[location].holdNodeId;
}

/**
 * Automatic movement performed by the release check itself.
 *
 * 0.1.57–0.1.63 traversed the whole corridor here. Human runtime feedback for
 * 0.1.64 changes that rule: a successful release clears the hold while the token
 * stays on the hold node. A fresh movement D6 then walks the normal board edges,
 * including J1/J2/J3 or H1/H2/H3.
 */
export function specialReleasePath057(location: SpecialHoldLocation): readonly number[] {
  return SPECIAL_LOCATION_057[location].releaseAutoPath;
}

/** Authoritative corridor used by fresh movement after a successful release. */
export function specialCorridorPath064(location: SpecialHoldLocation): readonly number[] {
  return SPECIAL_LOCATION_057[location].exitPath;
}

export function specialReleaseSucceeds057(location: SpecialHoldLocation, roll: number): boolean {
  const face = Math.floor(roll);
  return (SPECIAL_LOCATION_057[location].releaseFaces as readonly number[]).includes(face);
}

export function lotteryReward057(roll: number): number {
  const face = Math.max(1, Math.min(6, Math.floor(roll)));
  return face * SPECIAL_LOCATION_057.lottery.multiplier;
}

/**
 * 0.1.60 layers finish-line retirement over the original 0.1.57 hold exclusion.
 * The export name stays stable so older authority/replay call sites keep working.
 */
export function miniGameEligiblePlayers057(players: readonly PlayerState[]): PlayerState[] {
  return miniGameEligiblePlayers060(players);
}

export function specialHoldLabel057(location: SpecialHoldLocation | undefined): string {
  if (location === 'jail') return '🚔 Đang ở Đồn';
  if (location === 'hospital') return '🏥 Đang ở BV';
  return '';
}
