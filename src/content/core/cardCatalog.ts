import baseCardsJson from './cards_mvp.json';
import partyCardsJson from './cards_party_024.json';
import type { CardDefinition, CardRarity } from '../../core/cards';

const base = baseCardsJson as CardDefinition[];
const extras = partyCardsJson as CardDefinition[];
const reserve: Partial<Record<CardRarity, number>> = { R: 75, SR: 30 };

const totals = base.reduce<Partial<Record<CardRarity, number>>>((acc, card) => {
  acc[card.rarity] = (acc[card.rarity] ?? 0) + card.dropWeight;
  return acc;
}, {});

export const CARD_CATALOG: CardDefinition[] = [
  ...base.map((card) => {
    const held = reserve[card.rarity] ?? 0;
    const total = totals[card.rarity] ?? card.dropWeight;
    return held > 0 && total > 0
      ? { ...card, dropWeight: card.dropWeight * ((total - held) / total) }
      : { ...card };
  }),
  ...extras.map((card) => ({ ...card })),
];
