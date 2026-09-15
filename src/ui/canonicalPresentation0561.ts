export const CANONICAL_PRESENTATION_0561 = {
  version: '0.1.57',
  header: 'CITY • MVP 0.1.57 • SPECIAL LOCATIONS',
  badge: 'PLAYTEST 0.1.57 • JAIL + HOSPITAL + LOTTERY',
  normalFollowZoom: 1.75,
  branchDecisionZoom: 1.3,
  overviewZoom: 0.88,
  worldWidth: 1280,
  worldHeight: 720,
  uiDepthThreshold: 600,
} as const;

export const CANONICAL_HUD_POSITIONS_0561 = [
  { x: 140, y: 62, corner: 'top-left' },
  { x: 1140, y: 62, corner: 'top-right' },
  { x: 140, y: 658, corner: 'bottom-left' },
  { x: 1140, y: 658, corner: 'bottom-right' },
] as const;

export function canonicalHudPosition0561(playerId: number): (typeof CANONICAL_HUD_POSITIONS_0561)[number] {
  return CANONICAL_HUD_POSITIONS_0561[playerId] ?? CANONICAL_HUD_POSITIONS_0561[0];
}

export function isCanonicalUiDepth0561(depth: number): boolean {
  return depth >= CANONICAL_PRESENTATION_0561.uiDepthThreshold;
}
