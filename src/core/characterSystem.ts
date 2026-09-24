/**
 * CH-01 — Character System foundation.
 *
 * This file is intentionally presentation/data-schema only. It does not apply
 * passives, mutate MatchState, roll RNG or submit intents. Authoritative
 * passive resolution lands in a later character milestone.
 */

export type CharacterId = string;

export type CharacterEmotion =
  | 'neutral'
  | 'happy'
  | 'angry'
  | 'panic'
  | 'smug'
  | 'cry'
  | 'shocked';

/**
 * The current capture flow only asks the human player for three expressions.
 * Richer character pose art may still use more emotions; each emotion maps
 * deterministically to one of these three captured faces until capture expands.
 */
export type CharacterCaptureExpression = 'neutral' | 'happy' | 'angry';

export type CharacterPortraitMode = 'socket' | 'sticker' | 'hero';

export type CharacterPassiveTrigger =
  | 'turn_start'
  | 'money_gain'
  | 'money_loss'
  | 'card_played'
  | 'news_resolved'
  | 'job_assigned'
  | 'jail_enter'
  | 'hospital_enter'
  | 'minigame_start'
  | 'lap_complete';

export interface NormalizedFaceSocket {
  /** Normalized 0..1 position inside the owning pose artwork. */
  x: number;
  y: number;
  /** Relative face scale for this pose. */
  scale: number;
  /** Small art-directed head tilt. */
  rotationDeg?: number;
  /** Optional normalized padding around detected head/hair bounds. */
  padding?: number;
}

export interface CharacterPoseDefinition {
  emotion: CharacterEmotion;
  bodyAssetKey: string;
  faceSocket: NormalizedFaceSocket;
  portraitMode?: CharacterPortraitMode;
}

export interface CharacterPassiveDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  trigger: CharacterPassiveTrigger;
  /**
   * Data key consumed by the future HOST-authoritative passive resolver.
   * CH-01 deliberately does not interpret this field.
   */
  effectKey: string;
  parameters?: Record<string, string | number | boolean>;
}

export interface CharacterDefinition {
  id: CharacterId;
  displayNameKey: string;
  /**
   * Search/art metadata only, e.g. age presentation, fashion, silhouette.
   * Gameplay must not derive passives from gender/age/demographic tags.
   */
  presentationTags: string[];
  reactionProfileId: string;
  passiveIds: string[];
  poseSetId: string;
}

export interface CharacterPoseSet {
  id: string;
  poses: CharacterPoseDefinition[];
}

const CAPTURE_FALLBACK: Record<CharacterEmotion, CharacterCaptureExpression> = {
  neutral: 'neutral',
  happy: 'happy',
  angry: 'angry',
  panic: 'angry',
  smug: 'happy',
  cry: 'angry',
  shocked: 'neutral',
};

export function captureExpressionForCharacterEmotion(
  emotion: CharacterEmotion,
): CharacterCaptureExpression {
  return CAPTURE_FALLBACK[emotion];
}

export function isNormalizedFaceSocket(socket: NormalizedFaceSocket): boolean {
  const finite = [socket.x, socket.y, socket.scale, socket.rotationDeg ?? 0, socket.padding ?? 0]
    .every(Number.isFinite);
  if (!finite) return false;
  if (socket.x < 0 || socket.x > 1 || socket.y < 0 || socket.y > 1) return false;
  if (socket.scale <= 0) return false;
  if ((socket.padding ?? 0) < 0) return false;
  return true;
}

export function findCharacterPose(
  poseSet: CharacterPoseSet,
  emotion: CharacterEmotion,
): CharacterPoseDefinition | undefined {
  return poseSet.poses.find((pose) => pose.emotion === emotion)
    ?? poseSet.poses.find((pose) => pose.emotion === 'neutral')
    ?? poseSet.poses[0];
}
