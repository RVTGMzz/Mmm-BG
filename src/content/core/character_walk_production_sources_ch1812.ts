import type { CharacterId } from '../../core/characterSystem';

export const CHARACTER_WALK_PRODUCTION_FRAME_CH1812 = 192;
export const CHARACTER_WALK_PRODUCTION_FRAMES_CH1812 = 8;

export type CharacterWalkProductionSourceStatusCh1812 =
  | 'runtime-production-strip'
  | 'awaiting-genuine-strip';

export interface CharacterWalkProductionSourceCh1812 {
  characterId: CharacterId;
  canonicalLabel: string;
  fallbackRow: number;
  status: CharacterWalkProductionSourceStatusCh1812;
  /**
   * Runtime production assets are admitted only after a genuine high-resolution
   * strip exists. A remaster/upscale of the legacy 48px walk row is never a
   * production source.
   */
  productionAssetPath?: string;
  frameWidth: typeof CHARACTER_WALK_PRODUCTION_FRAME_CH1812;
  frameHeight: typeof CHARACTER_WALK_PRODUCTION_FRAME_CH1812;
  frameCount: typeof CHARACTER_WALK_PRODUCTION_FRAMES_CH1812;
  genuineHighResolutionSourceRequired: true;
}

export const CHARACTER_WALK_PRODUCTION_SOURCES_CH1812:
readonly CharacterWalkProductionSourceCh1812[] = [
  {
    characterId: 'starter-crybaby',
    canonicalLabel: 'KHÓC NHÈ',
    fallbackRow: 0,
    status: 'runtime-production-strip',
    productionAssetPath: 'assets/characters/ch181/walk-khoc-nhe-production-x4.png',
    frameWidth: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameHeight: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameCount: CHARACTER_WALK_PRODUCTION_FRAMES_CH1812,
    genuineHighResolutionSourceRequired: true,
  },
  {
    characterId: 'starter-grumpy',
    canonicalLabel: 'CAU CÓ',
    fallbackRow: 1,
    status: 'runtime-production-strip',
    productionAssetPath: 'assets/characters/ch181/walk-cau-co-production-x4.png',
    frameWidth: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameHeight: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameCount: CHARACTER_WALK_PRODUCTION_FRAMES_CH1812,
    genuineHighResolutionSourceRequired: true,
  },
  {
    characterId: 'starter-anxious',
    canonicalLabel: 'LO LẮNG',
    fallbackRow: 2,
    status: 'runtime-production-strip',
    productionAssetPath: 'assets/characters/ch181/walk-lo-lang-production-x4.png',
    frameWidth: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameHeight: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameCount: CHARACTER_WALK_PRODUCTION_FRAMES_CH1812,
    genuineHighResolutionSourceRequired: true,
  },
  {
    characterId: 'starter-hyper',
    canonicalLabel: 'TĂNG ĐỘNG',
    fallbackRow: 3,
    status: 'awaiting-genuine-strip',
    frameWidth: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameHeight: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameCount: CHARACTER_WALK_PRODUCTION_FRAMES_CH1812,
    genuineHighResolutionSourceRequired: true,
  },
  {
    characterId: 'secret-baby',
    canonicalLabel: 'SECRET BABY',
    fallbackRow: 4,
    status: 'awaiting-genuine-strip',
    frameWidth: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameHeight: CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
    frameCount: CHARACTER_WALK_PRODUCTION_FRAMES_CH1812,
    genuineHighResolutionSourceRequired: true,
  },
];

export function characterWalkProductionSourceCh1812(
  characterId?: CharacterId,
): CharacterWalkProductionSourceCh1812 | undefined {
  if (!characterId) return undefined;
  return CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find(
    (item) => item.characterId === characterId,
  );
}
