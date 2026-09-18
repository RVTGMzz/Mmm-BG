import { canReleaseFrom, lotteryRewardForRoll, previewExitRoute, type FinalMapHoldingLocation } from './finalMapPreview050';

export type { FinalMapHoldingLocation };
export { canReleaseFrom, lotteryRewardForRoll, previewExitRoute };

export const FINAL_MAP_PREVIEW_051 = {
  mainNodeCount: 44,
  readyNodeId: 0,
  jailGateNodeId: 11,
  lotteryNodeId: 22,
  hospitalGateNodeId: 33,
  jailNodeId: 100,
  hospitalNodeId: 110,
  branchJunctionNodeIds: [3, 16, 34] as const,
  branchRouteNodeIds: [200, 201, 202, 210, 211, 212, 220, 221, 222] as const,
  normalFollowZoom: 1.38,
  branchDecisionZoom: 1.1,
  overviewZoom: 0.55,
} as const;

export function isDraftDBranchJunction(nodeId: number): boolean {
  return FINAL_MAP_PREVIEW_051.branchJunctionNodeIds.includes(nodeId as 3 | 16 | 34);
}

export function isDraftDBranchNode(nodeId: number): boolean {
  return FINAL_MAP_PREVIEW_051.branchRouteNodeIds.includes(
    nodeId as 200 | 201 | 202 | 210 | 211 | 212 | 220 | 221 | 222,
  );
}
