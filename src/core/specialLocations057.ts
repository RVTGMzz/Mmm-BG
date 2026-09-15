import type { BoardNode, PlayerState, SpecialHoldLocation } from './types';

export const SPECIAL_LOCATION_057 = {
  jail: {
    gateContentId: 'SPECIAL_JAIL_GATE',
    holdNodeId: 100,
    exitPath: [101, 102, 103, 12] as const,
    releaseFaces: [1, 3, 5] as const,
    title: 'ĐỒN CẢNH SÁT',
    icon: '🚔',
  },
  hospital: {
    gateContentId: 'SPECIAL_HOSPITAL_GATE',
    holdNodeId: 110,
    exitPath: [111, 112, 113, 34] as const,
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

export function specialReleasePath057(location: SpecialHoldLocation): readonly number[] {
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

export function miniGameEligiblePlayers057(players: readonly PlayerState[]): PlayerState[] {
  return players.filter((player) => player.specialHold === undefined);
}

export function specialHoldLabel057(location: SpecialHoldLocation | undefined): string {
  if (location === 'jail') return '🚔 Đang ở Đồn';
  if (location === 'hospital') return '🏥 Đang ở BV';
  return '';
}
