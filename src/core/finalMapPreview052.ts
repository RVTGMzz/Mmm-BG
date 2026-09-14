import {
  FINAL_MAP_PREVIEW_051,
  canReleaseFrom,
  isDraftDBranchJunction,
  isDraftDBranchNode,
  lotteryRewardForRoll,
  previewExitRoute,
  type FinalMapHoldingLocation,
} from './finalMapPreview051';

export type { FinalMapHoldingLocation };
export {
  canReleaseFrom,
  isDraftDBranchJunction,
  isDraftDBranchNode,
  lotteryRewardForRoll,
  previewExitRoute,
};

export const FINAL_MAP_PREVIEW_052 = {
  ...FINAL_MAP_PREVIEW_051,
  normalFollowZoom: 1.7,
  branchDecisionZoom: 1.25,
  overviewZoom: 0.5,
} as const;
