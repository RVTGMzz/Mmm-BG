import type { FaceExpression } from '../core/session';

/** Presentation-only face reaction based on final displayed rank. */
export function podiumFaceExpressionForRank(rank: number): FaceExpression {
  if (rank <= 1) return 'happy';
  if (rank >= 4) return 'angry';
  return 'neutral';
}

export function shouldSpotlightPodiumRank(rank: number): boolean {
  return rank === 1;
}
