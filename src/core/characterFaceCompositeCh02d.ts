import type { FaceAsset, FaceExpression } from './session';
import {
  captureExpressionForCharacterEmotion,
  type CharacterEmotion,
} from './characterSystem';

export type CharacterFaceCompositeSourceKindCh02d = 'non-circular' | 'legacy-avatar';

export interface CharacterFaceCompositeModelCh02d {
  expression: FaceExpression;
  sourceDataUrl: string;
  sourceKind: CharacterFaceCompositeSourceKindCh02d;
}

/**
 * CH-02D chooses the face source for a Character pose.
 *
 * Critical rule: prefer the retained non-circular source. The circular HUD
 * derivative is compatibility fallback only and must never become the new
 * Character-art authority.
 */
export function resolveCharacterFaceCompositeCh02d(
  faces: Partial<Record<FaceExpression, FaceAsset>>,
  emotion: CharacterEmotion = 'neutral',
): CharacterFaceCompositeModelCh02d | undefined {
  const expression = captureExpressionForCharacterEmotion(emotion);
  const asset = faces[expression] ?? faces.neutral;
  if (!asset) return undefined;

  if (asset.compositeSourceDataUrl) {
    return {
      expression,
      sourceDataUrl: asset.compositeSourceDataUrl,
      sourceKind: 'non-circular',
    };
  }

  return {
    expression,
    sourceDataUrl: asset.dataUrl,
    sourceKind: 'legacy-avatar',
  };
}
