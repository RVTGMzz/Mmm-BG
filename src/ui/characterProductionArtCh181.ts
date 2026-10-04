export const CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181 = './assets/characters/ch181/portraits.webp' as const;
export const CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181 = 48 as const;

export type CharacterProductionEmotionCh181 =
  | 'neutral'
  | 'happy'
  | 'angry'
  | 'panic'
  | 'smug'
  | 'cry'
  | 'shocked'
  | 'passive';

const ROW_BY_CHARACTER_CH181: Readonly<Record<string, number>> = {
  'starter-crybaby': 0,
  'starter-grumpy': 1,
  'starter-anxious': 2,
  'starter-hyper': 3,
  'secret-baby': 4,
};

const COLUMN_BY_EMOTION_CH181: Readonly<Record<CharacterProductionEmotionCh181, number>> = {
  neutral: 0,
  happy: 1,
  angry: 2,
  panic: 3,
  smug: 4,
  cry: 5,
  shocked: 6,
  passive: 7,
};

export function characterProductionPortraitCh181(
  characterId: string,
  emotion: CharacterProductionEmotionCh181 = 'neutral',
): { src: string; style: string; row: number; column: number } | undefined {
  const row = ROW_BY_CHARACTER_CH181[characterId];
  if (row === undefined) return undefined;
  const column = COLUMN_BY_EMOTION_CH181[emotion];
  return {
    src: CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181,
    style: `--ch181-x:-${column * 100}%;--ch181-y:-${row * 100}%;`,
    row,
    column,
  };
}
