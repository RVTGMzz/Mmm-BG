export type FinalMapHoldingLocation = 'jail' | 'hospital';

export const FINAL_MAP_PREVIEW_050 = {
  mainNodeCount: 44,
  readyNodeId: 0,
  jailGateNodeId: 11,
  lotteryNodeId: 22,
  hospitalGateNodeId: 33,
  jailNodeId: 100,
  jailExitNodeIds: [101, 102, 103] as const,
  jailRejoinNodeId: 12,
  hospitalNodeId: 110,
  hospitalExitNodeIds: [111, 112, 113] as const,
  hospitalRejoinNodeId: 34,
  lotteryMultiplier: 20,
} as const;

const JAIL_RELEASE_FACES = new Set([1, 3, 5]);
const HOSPITAL_RELEASE_FACES = new Set([2, 4, 5]);

export function isD6Face(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

export function canReleaseFrom(location: FinalMapHoldingLocation, roll: number): boolean {
  if (!isD6Face(roll)) return false;
  return location === 'jail'
    ? JAIL_RELEASE_FACES.has(roll)
    : HOSPITAL_RELEASE_FACES.has(roll);
}

export function releaseFaces(location: FinalMapHoldingLocation): readonly number[] {
  return location === 'jail' ? [1, 3, 5] : [2, 4, 5];
}

export function previewExitRoute(location: FinalMapHoldingLocation): readonly number[] {
  return location === 'jail'
    ? [...FINAL_MAP_PREVIEW_050.jailExitNodeIds, FINAL_MAP_PREVIEW_050.jailRejoinNodeId]
    : [...FINAL_MAP_PREVIEW_050.hospitalExitNodeIds, FINAL_MAP_PREVIEW_050.hospitalRejoinNodeId];
}

export function lotteryRewardForRoll(roll: number): number {
  if (!isD6Face(roll)) {
    throw new Error(`Lottery expects D6 face 1..6, got ${roll}.`);
  }
  return roll * FINAL_MAP_PREVIEW_050.lotteryMultiplier;
}

export function mainNodeKey(nodeId: number): string {
  if (!Number.isInteger(nodeId) || nodeId < 0 || nodeId >= FINAL_MAP_PREVIEW_050.mainNodeCount) {
    throw new Error(`Main node id out of range: ${nodeId}.`);
  }
  return `M${String(nodeId + 1).padStart(2, '0')}`;
}
