import type {
  CharacterEmotion,
  CharacterId,
  NormalizedFaceSocket,
} from '../../core/characterSystem';

export const CHARACTER_ART_MASTER_SIZE_V01 = {
  width: 1024,
  height: 1536,
} as const;

export const CHARACTER_ART_EMOTIONS_V01: readonly CharacterEmotion[] = [
  'neutral',
  'happy',
  'angry',
  'panic',
  'smug',
  'cry',
  'shocked',
];

export type CharacterArtProductionStatusV01 =
  | 'layer-export-pending'
  | 'runtime-ready';

export interface CharacterConceptAuthorityV01 {
  driveFileName: string;
  driveFileId: string;
  approved: true;
}

export interface CharacterArtPoseManifestV01 {
  emotion: CharacterEmotion;
  /** Transparent art behind the player's head source. */
  bodyBackAsset: string;
  /**
   * Transparent art drawn above the player's head: hair fringe, glasses,
   * tears, pacifier, hands crossing the face, etc.
   */
  foregroundAsset: string;
  /**
   * Optional alpha mask. Prefer a generous irregular head-safe mask over a
   * hard circle. The exact mask is authored with the final layered pose.
   */
  faceMaskAsset?: string;
  /**
   * Measured only after the approved pose layers exist. Pending manifests
   * deliberately leave this undefined instead of inventing coordinates.
   */
  faceSocket?: NormalizedFaceSocket;
  /**
   * Preview-sized runtime proof. This is deliberately separate from the final
   * production faceSocket so a low-resolution validation asset cannot become
   * the permanent authoring authority by accident.
   */
  runtimeProof?: {
    width: number;
    height: number;
    faceSocket: NormalizedFaceSocket;
    milestone: 'CH-02G';
  };
}

export interface CharacterArtManifestV01 {
  characterId: CharacterId;
  poseSetId: string;
  status: CharacterArtProductionStatusV01;
  concept: CharacterConceptAuthorityV01;
  masterSize: typeof CHARACTER_ART_MASTER_SIZE_V01;
  poses: readonly CharacterArtPoseManifestV01[];
}

function posePath(characterId: string, emotion: CharacterEmotion, file: string): string {
  return `/assets/characters/${characterId}/${emotion}/${file}`;
}

function plannedPoses(characterId: string): CharacterArtPoseManifestV01[] {
  return CHARACTER_ART_EMOTIONS_V01.map((emotion) => {
    const base: CharacterArtPoseManifestV01 = {
      emotion,
      bodyBackAsset: posePath(characterId, emotion, 'body-back.webp'),
      foregroundAsset: posePath(characterId, emotion, 'foreground.webp'),
      faceMaskAsset: posePath(characterId, emotion, 'face-mask.webp'),
    };
    if (characterId === 'starter-crybaby' && emotion === 'neutral') {
      return {
        ...base,
        runtimeProof: {
          width: 128,
          height: 192,
          faceSocket: {
            x: 0.5,
            y: 0.2734375,
            scale: 0.359375,
            rotationDeg: 0,
            padding: 0.08,
          },
          milestone: 'CH-02G',
        },
      };
    }
    return base;
  });
}

function manifest(
  characterId: CharacterId,
  poseSetId: string,
  driveFileName: string,
  driveFileId: string,
): CharacterArtManifestV01 {
  return {
    characterId,
    poseSetId,
    status: 'layer-export-pending',
    concept: { driveFileName, driveFileId, approved: true },
    masterSize: CHARACTER_ART_MASTER_SIZE_V01,
    poses: plannedPoses(characterId),
  };
}

/**
 * CH-02E production-art contract.
 *
 * These manifests are intentionally NOT imported by Character Select yet.
 * They describe the exact runtime paths the final layered exports must occupy.
 * Concept sheets remain on Drive and are never treated as runtime body assets.
 */
export const CHARACTER_ART_MANIFESTS_V01: readonly CharacterArtManifestV01[] = [
  manifest('starter-crybaby', 'pose.starter.crybaby.v01', 'khocnhe.webp', '1jZTUH6RM0_KgoAERIWzDlsz0bJntO7-B'),
  manifest('starter-grumpy', 'pose.starter.grumpy.v01', 'cauco.webp', '1dZ6Ruav4nnaDy371hrBwTGR-hNkMnUnf'),
  manifest('starter-anxious', 'pose.starter.anxious.v01', 'lolang.webp', '1PLBsvV5_d0fvda4K7od9dv_de7M-H8qq'),
  manifest('starter-hyper', 'pose.starter.hyper.v01', 'tangdong.webp', '1zjtCwUM3oh2_wsa9M7Ys7Msif9i2XYv5'),
  manifest('secret-baby', 'pose.secret.baby.v01', 'embe.webp', '1vJIkKjMhqZSHfQ3hylYF39XxfpBYYGrv'),
];

export function characterArtManifestV01(
  characterId: CharacterId,
): CharacterArtManifestV01 | undefined {
  return CHARACTER_ART_MANIFESTS_V01.find((item) => item.characterId === characterId);
}

export function isRuntimeReadyCharacterArtV01(
  item: CharacterArtManifestV01,
): boolean {
  if (item.status !== 'runtime-ready') return false;
  if (item.poses.length !== CHARACTER_ART_EMOTIONS_V01.length) return false;
  return item.poses.every((pose) => Boolean(
    pose.bodyBackAsset
    && pose.foregroundAsset
    && pose.faceMaskAsset
    && pose.faceSocket,
  ));
}
