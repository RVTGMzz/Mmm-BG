import type { CharacterId } from '../../core/characterSystem';

export const CAU_CO_RIG_PILOT_CH1822 = {
  characterId: 'starter-grumpy' as CharacterId,
  canonPath: 'docs/character-production/canon/cauco.webp',
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
