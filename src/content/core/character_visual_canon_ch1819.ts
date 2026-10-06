import type { CharacterId } from '../../core/characterSystem';

export interface SecretBabyVisualCanonCh1819 {
  characterId: CharacterId;
  label: string;
  repoAuthority: {
    portraitAtlasPath: string;
    portraitAtlasSha256: string;
    legacyWalkAtlasPath: string;
    legacyWalkAtlasSha256: string;
    legacyWalkRow: number;
  };
  conceptAuthority: {
    driveFileName: string;
    driveFileId: string;
  };
  agePresentation: 'infant';
  silhouette: string;
  style: string;
  requiredVisualAnchors: readonly string[];
  forbiddenDrift: readonly string[];
}

export const SECRET_BABY_VISUAL_CANON_CH1819: SecretBabyVisualCanonCh1819 = {
  characterId: 'secret-baby',
  label: 'EM BÉ BÁ ĐẠO',
  repoAuthority: {
    portraitAtlasPath: 'public/assets/characters/ch181/portrait-atlas-secret-baby.webp',
    portraitAtlasSha256: 'e885da541bdcad8ff2247ff876c26872c73640cb58d1c9a6af5d622018f8f49f',
    legacyWalkAtlasPath: 'public/assets/characters/ch181/walk-atlas.webp',
    legacyWalkAtlasSha256: 'c4aae9babf1baa61f2f9c8c51da19056ce862f5263c5166d58cbb24e8ef9d89c',
    legacyWalkRow: 4,
  },
  conceptAuthority: {
    driveFileName: 'embe.webp',
    driveFileId: '1vJIkKjMhqZSHfQ3hylYF39XxfpBYYGrv',
  },
  agePresentation: 'infant',
  silhouette: 'very low crawling infant; compact body kept close to the floor',
  style: 'tiny royal boss baby in the rounded cozy/chibi MeMeMe world',
  requiredVisualAnchors: [
    'bald infant head',
    'small gold crown',
    'gold pacifier',
    'red cape trailing behind the body',
    'very low crawling silhouette',
    'short infant limbs',
    'bossy narrowed-eye expression',
    'tiny rounded infant body',
  ],
  forbiddenDrift: [
    'toddler / child / teen proportions',
    'upright standing or adult-style walking silhouette',
    'adult hair',
    'oversized staff or weapon',
    'invented necklace / harness / accessories not present in repo standard',
    'removing the pacifier',
    'removing the small crown',
    'removing the trailing red cape',
    'raising the body so high that the infant reads like a starter Character',
  ],
};
