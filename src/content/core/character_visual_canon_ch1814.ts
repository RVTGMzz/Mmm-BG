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
    repoAssetPath: 'docs/character-production/canon/cauco.webp',
    sha256: 'f75435579c1647b07b1a88b3ced312c624c761c54a8ec87c335f5f6093db637e',
    width: 1122,
    height: 1402,
  },
  ageGender: 'male 40-50',
  silhouette: 'upright-angular; stocky but tailored; stern and hard-edged rather than sloppy',
  style: 'sharp-tailored; neat, formal, restrained palette',
  requiredVisualAnchors: [
    'voluminous salt-and-pepper swept-back hair with visible gray streaks',
    'gold rectangular glasses',
    'thick moustache with short chin beard',
    'white long-sleeve dress shirt with rolled cuffs',
    'brown crown-pattern tie',
    'brown leather suspenders with gold hardware',
    'dark olive pinstripe jacket draped over the shoulders',
    'crown lapel pin and red pocket square',
    'high-waisted brown tailored trousers',
    'dark burgundy-brown loafers with gold chain hardware',
    'brown crown-pattern shoulder work bag / satchel',
    'gold-and-black wristwatch',
    'green gemstone statement ring',
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
