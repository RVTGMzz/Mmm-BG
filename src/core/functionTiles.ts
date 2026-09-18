import type { BoardNode, FunctionTileType, PlayerState } from './types';

export interface FunctionTileFoundationResolution {
  kind: FunctionTileType;
  eventType: 'minigame_tile' | 'job_tile';
  contentId: string;
  title: string;
  impact: string;
  description: string;
  summary: string;
  affectedPlayerIds: number[];
}

const COPY: Record<FunctionTileType, Omit<FunctionTileFoundationResolution, 'kind' | 'contentId' | 'affectedPlayerIds'>> = {
  minigame: {
    eventType: 'minigame_tile',
    title: 'MINI GAME',
    impact: '🎮',
    description: 'Ô Mini Game đã được nối vào flow trận đấu.',
    summary: 'Foundation 0.1.29: chưa khởi chạy trò chơi con, tự động tiếp tục lượt.',
  },
  job: {
    eventType: 'job_tile',
    title: 'JOB',
    impact: '💼',
    description: 'Ô Job đã được nối vào flow trận đấu.',
    summary: 'Foundation 0.1.29: chưa nhận công việc thật, tự động tiếp tục lượt.',
  },
};

export function resolveFunctionTileFoundation(
  node: BoardNode,
  player: PlayerState,
): FunctionTileFoundationResolution | undefined {
  if (!node.feature) return undefined;
  const copy = COPY[node.feature];
  return {
    kind: node.feature,
    contentId: node.contentId?.trim() || `${node.feature.toUpperCase()}_SLOT_${node.id}`,
    ...copy,
    affectedPlayerIds: [player.id],
  };
}
