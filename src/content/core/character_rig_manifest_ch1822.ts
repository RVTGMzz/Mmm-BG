import type { CharacterId } from '../../core/characterSystem';

export const CAU_CO_RIG_PILOT_CH1822 = {
  characterId: 'starter-grumpy' as CharacterId,
  canonPath: 'docs/character-production/canon/cauco.webp',
  canonAgeBand: { min: 40, max: 50 },
  canonPresentation: 'male',
  visualLocks: [
    'salt-and-pepper swept-back hair',
    'stern heavy eyebrows, moustache and chin beard',
    'thin gold rectangular glasses',
    'dark olive jacket draped over shoulders with gold crown pin',
    'white shirt with brown suspenders',
    'dark brown tie with gold crown motifs',
    'wide brown formal trousers and polished brown loafers',
    'structured leather briefcase with small gold crown motifs',
    'gold wristwatch and emerald ring',
  ] as const,
  previewParam: 'cauCoRigPreview',
  productionApproved: false,
  partsPath: 'assets/characters/ch1822/cau-co/',
  baseResolution: 192,
  displaySize: 104,
  partIds: [
    'coat-back', 'satchel', 'leg-upper-left', 'leg-upper-right',
    'leg-lower-left', 'leg-lower-right', 'shoe-left', 'shoe-right',
    'torso', 'arm-upper-left', 'arm-upper-right',
    'arm-lower-left', 'arm-lower-right', 'hand-left', 'hand-right',
    'head', 'hair-front', 'glasses',
  ] as const,
} as const;

export function cauCoRigPreviewEnabledCh1822(): boolean {
  return typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get(CAU_CO_RIG_PILOT_CH1822.previewParam) === '1';
}
