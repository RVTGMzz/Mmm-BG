import type { CharacterId } from '../../core/characterSystem';

export interface CharacterVisualCanonCh1814 {
  characterId: CharacterId;
  label: string;
  conceptAuthority: {
    driveFileName: string;
    driveFileId: string;
  };
  ageGender: string;
  silhouette: string;
  style: string;
  requiredVisualAnchors: readonly string[];
  forbiddenDrift: readonly string[];
}

/**
 * CH-18.14 visual canon lock.
 *
 * This is an authoring/QA contract, not a gameplay system. It exists so future
 * production strips cannot silently redesign a Character while "improving"
 * animation resolution.
 */
export const CAU_CO_VISUAL_CANON_CH1814: CharacterVisualCanonCh1814 = {
  characterId: 'starter-grumpy',
  label: 'CAU CÓ',
  conceptAuthority: {
    driveFileName: 'cauco.webp',
    driveFileId: '1dZ6Ruav4nnaDy371hrBwTGR-hNkMnUnf',
  },
  ageGender: 'male 40-50',
  silhouette: 'upright-angular; stocky but tailored; stern and hard-edged rather than sloppy',
  style: 'sharp-tailored; neat, formal, restrained palette',
  requiredVisualAnchors: [
    'salt-and-pepper swept-back hair',
    'thin gold rectangular glasses',
    'thick moustache with short chin facial hair',
    'white long-sleeve dress shirt',
    'brown crown-pattern tie',
    'brown suspenders',
    'dark olive pinstripe jacket draped over the shoulders',
    'high-waisted brown tailored trousers',
    'dark brown loafers with gold hardware',
    'structured brown leather work bag',
    'gold watch / formal jewelry accents',
    'green statement ring',
  ],
  forbiddenDrift: [
    'tank top or sleeveless undershirt',
    'shorts',
    'sandals or flip-flops',
    'casual slouch / beach-uncle silhouette',
    'bald or heavily receding redesign',
    'removing the glasses',
    'removing the formal tie/jacket identity',
    'changing age band or gender presentation',
  ],
};

export const CHARACTER_VISUAL_CANON_CH1814:
readonly CharacterVisualCanonCh1814[] = [
  CAU_CO_VISUAL_CANON_CH1814,
];
