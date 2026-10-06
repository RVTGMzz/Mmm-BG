import type { CharacterId } from '../../core/characterSystem';

export interface LoLangVisualCanonCh1817 {
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
  ageGender: string;
  silhouette: string;
  style: string;
  requiredVisualAnchors: readonly string[];
  forbiddenDrift: readonly string[];
}

export const LO_LANG_VISUAL_CANON_CH1817: LoLangVisualCanonCh1817 = {
  characterId: 'starter-anxious',
  label: 'LO LẮNG',
  conceptAuthority: {
    driveFileName: 'lolang.webp',
    driveFileId: '1PLBsvV5_d0fvda4K7od9dv_de7M-H8qq',
    repoAssetPath: 'docs/character-production/canon/lolang.webp',
    sha256: 'e1a6ccd8e7586584949b34fb9a227ba2cdfc4f91bb0c88bcce880a2eb8ada964',
    width: 1122,
    height: 1402,
  },
  ageGender: 'male 28-35',
  silhouette: 'slightly hunched, soft and overloaded with planning gear',
  style: 'neat planner-core; prepared for every possible problem',
  requiredVisualAnchors: [
    'messy voluminous brown hair',
    'large dark rectangular glasses',
    'dark teal / forest-green planner-core top',
    'white shirt collar and cuffs',
    'wide cream-beige trousers',
    'green-and-cream sneakers',
    'large brown organizer satchel and backpack system',
    'multiple planners / notebooks / checklists',
    'pens and stationery visible around the bags',
    'smartphone and small utility devices',
    'water bottle',
    'small dangling character keychain',
    'worried brows / lip-biting body language',
  ],
  forbiddenDrift: [
    'removing the large glasses',
    'removing the overloaded organizer / planner silhouette',
    'formal business suit',
    'athletic or confident hero posture',
    'changing age band or gender presentation',
    'replacing wide cream trousers with slim dark pants',
    'removing the anxious / constantly-checking body language',
  ],
};
