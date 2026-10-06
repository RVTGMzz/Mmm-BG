import type { CharacterId } from '../../core/characterSystem';

export interface SecretBabyVisualCanonCh1819 {
  characterId: CharacterId;
  label: string;
  conceptAuthority: {
    driveFileName: string;
    driveFileId: string;
    repoAssetPath: string;
    sha256: string;
    width: number;
    height: number;
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
  conceptAuthority: {
    driveFileName: 'embe.webp',
    driveFileId: '1vJIkKjMhqZSHfQ3hylYF39XxfpBYYGrv',
    repoAssetPath: 'docs/character-production/canon/embe.webp',
    sha256: 'f5cd53cb3eacb8f1c9da6af5ff3dc09b5dcb562235bca51e1a8f612ef7f40713',
    width: 1122,
    height: 1402,
  },
  agePresentation: 'infant',
  silhouette: 'tiny crawling infant with oversized boss attitude',
  style: 'royal baby-chaos; toy-like, rounded and absurdly authoritative',
  requiredVisualAnchors: [
    'bald infant head',
    'gold pacifier with crown emblem',
    'small gold crown',
    'red royal cape with white-and-black spotted fur trim',
    'gold chain / crown pendant',
    'white diaper / baby romper with small crown motifs',
    'crawling / one-hand-down body language',
    'bossy narrowed-eye expression',
    'tiny body contrasted with oversized royal authority',
  ],
  forbiddenDrift: [
    'turning the infant into a toddler / child / teen',
    'upright adult-style walking silhouette',
    'adding adult hair or changing the bald infant identity',
    'removing the pacifier',
    'removing the red royal cape / fur-trim identity',
    'removing crown / gold-chain royal cues',
    'changing the crawling infant silhouette into a starter-character body',
  ],
};
