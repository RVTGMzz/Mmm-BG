export type MiniGameBaseMode059 = 'majority_minority' | 'rps';
export type MiniGameRewardTable059 = readonly [number, number, number, number];

export interface MiniGameSlot059 {
  contentId: string;
  nodeId: number;
  boardLabel: string;
  title: string;
  icon: string;
  identity: string;
  description: string;
  majorityRewards: MiniGameRewardTable059;
  rpsRewards: MiniGameRewardTable059;
}

/**
 * 0.1.59 gives the five Draft D Mini Game spaces distinct stakes while keeping the
 * existing hidden-choice tournament engine and HOST-owned payout path intact.
 *
 * Economy guardrail: every 3+/4-player table still distributes exactly 60 B$ total,
 * and every direct 1v1 table still distributes exactly 40 B$ total. 0.1.60 remains
 * the dedicated global pacing/economy tuning milestone.
 */
export const MINI_GAME_SLOTS_059: readonly MiniGameSlot059[] = [
  {
    contentId: 'MINIGAME_SLOT_01',
    nodeId: 8,
    boardLabel: 'M09',
    title: 'PHỐ ĐÔNG NGƯỜI',
    icon: '⚖️',
    identity: 'CÂN BẰNG',
    description: 'Kèo nhập môn: tiền thưởng trải đều theo thứ hạng.',
    majorityRewards: [30, 20, 10, 0],
    rpsRewards: [25, 15, 0, 0],
  },
  {
    contentId: 'MINIGAME_SLOT_02',
    nodeId: 16,
    boardLabel: 'M17',
    title: 'KÈO ALL-IN',
    icon: '🔥',
    identity: 'HẠNG 1 ĂN DÀY',
    description: 'Top 1 bứt mạnh, hạng dưới nhận ít hơn.',
    majorityRewards: [40, 15, 5, 0],
    rpsRewards: [30, 10, 0, 0],
  },
  {
    contentId: 'MINIGAME_SLOT_03',
    nodeId: 25,
    boardLabel: 'M26',
    title: 'CÒN THỞ CÒN TIỀN',
    icon: '🛟',
    identity: 'CỨU VỚT',
    description: 'Cả bốn hạng đều có phần, giảm cảm giác trắng tay.',
    majorityRewards: [25, 20, 10, 5],
    rpsRewards: [22, 18, 0, 0],
  },
  {
    contentId: 'MINIGAME_SLOT_04',
    nodeId: 34,
    boardLabel: 'M35',
    title: 'TOP 2 HOẶC VỀ KHÔNG',
    icon: '⚔️',
    identity: 'CẮT TOP',
    description: 'Chỉ hai vị trí dẫn đầu có thưởng.',
    majorityRewards: [35, 25, 0, 0],
    rpsRewards: [28, 12, 0, 0],
  },
  {
    contentId: 'MINIGAME_SLOT_05',
    nodeId: 43,
    boardLabel: 'M44',
    title: 'NƯỚC RÚT CUỐI VÒNG',
    icon: '🏁',
    identity: 'CHUNG KẾT',
    description: 'Ô cuối vòng chia thưởng cho mọi hạng nhưng vẫn ưu tiên top 1.',
    majorityRewards: [30, 15, 10, 5],
    rpsRewards: [24, 16, 0, 0],
  },
] as const;

const FALLBACK_SLOT_059 = MINI_GAME_SLOTS_059[0]!;

export function miniGameSlot059(contentId: string | undefined): MiniGameSlot059 {
  if (!contentId) return FALLBACK_SLOT_059;
  return MINI_GAME_SLOTS_059.find((slot) => slot.contentId === contentId) ?? FALLBACK_SLOT_059;
}

export function miniGameRewardTable059(
  contentId: string | undefined,
  gameType: MiniGameBaseMode059,
): MiniGameRewardTable059 {
  const slot = miniGameSlot059(contentId);
  return gameType === 'rps' ? slot.rpsRewards : slot.majorityRewards;
}

export function miniGameRewardForSlot059(
  contentId: string | undefined,
  gameType: MiniGameBaseMode059,
  rank: number,
): number {
  if (!Number.isInteger(rank) || rank < 1) return 0;
  return miniGameRewardTable059(contentId, gameType)[rank - 1] ?? 0;
}

export function miniGameRewardCopy059(contentId: string | undefined, gameType: MiniGameBaseMode059): string {
  const rewards = miniGameRewardTable059(contentId, gameType);
  const visibleCount = gameType === 'rps' ? 2 : 4;
  return rewards
    .slice(0, visibleCount)
    .map((amount, index) => `#${index + 1} ${amount > 0 ? `+${amount}` : '0'}B$`)
    .join(' • ');
}
