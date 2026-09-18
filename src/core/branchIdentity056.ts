import type { BoardNode } from './types';

export type BranchFlavor056 = 'main' | 'safe' | 'drama' | 'money';

export interface BranchFlavorInfo056 {
  flavor: BranchFlavor056;
  title: string;
  icon: string;
  summary: string;
  riskLabel: string;
}

const SAFE_CONTENT_IDS = new Set(['A1', 'A2', 'A3']);
const DRAMA_CONTENT_IDS = new Set(['B1', 'B2', 'B3']);
const MONEY_CONTENT_IDS = new Set(['C1', 'C2', 'C3']);

const INFO: Record<BranchFlavor056, BranchFlavorInfo056> = {
  main: {
    flavor: 'main',
    title: 'PHỐ CHÍNH',
    icon: '🏙️',
    summary: 'Nhịp hỗn hợp • ô thường, biến cố và tiền',
    riskLabel: 'Rủi ro trung bình',
  },
  safe: {
    flavor: 'safe',
    title: 'AN TOÀN',
    icon: '🛡️',
    summary: '3 ô thường • né tiền và biến cố trực tiếp',
    riskLabel: 'Rủi ro thấp',
  },
  drama: {
    flavor: 'drama',
    title: 'DRAMA',
    icon: '🎭',
    summary: 'TIN TỨC • LÁ BÀI • TIN TỨC',
    riskLabel: 'Biến động cao',
  },
  money: {
    flavor: 'money',
    title: 'TIỀN',
    icon: '💰',
    summary: '+25 / -20 / +25 B$',
    riskLabel: 'Ví tiền lên xuống trực tiếp',
  },
};

export function branchFlavorForNode056(node: BoardNode): BranchFlavor056 {
  const contentId = node.contentId ?? '';
  if (SAFE_CONTENT_IDS.has(contentId)) return 'safe';
  if (DRAMA_CONTENT_IDS.has(contentId)) return 'drama';
  if (MONEY_CONTENT_IDS.has(contentId)) return 'money';
  return 'main';
}

export function branchFlavorInfo056(node: BoardNode): BranchFlavorInfo056 {
  return INFO[branchFlavorForNode056(node)];
}
