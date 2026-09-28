import { drawWeightedCard, type CardDefinition } from './cards';
import { appendMatchEvent, type MatchState } from './matchState';
import { MVP_CARD_HAND_LIMIT } from './rules';
import type { PlayerState } from './types';

export const CHARACTER_PASSIVE_BALANCE_CH05 = {
  crybabyChance: 0.40,
  crybabyLossThreshold: 20,
  crybabyRefund: 10,
  grumpyChance: 0.50,
  grumpyCounter: 5,
  anxiousChance: 0.20,
  hyperChance: 0.45,
  hyperMiniGameBonus: 5,
  secretBabyChance: 0.60,
  secretBabyLossThreshold: 20,
  secretBabyRefund: 15,
} as const;

export type CharacterPassiveSourceCh05 = 'money_tile' | 'news' | 'card';

function rollChance(random: () => number, chance: number): { hit: boolean; roll: number } {
  const roll = Math.max(0, Math.min(0.999999999, random()));
  return { hit: roll < chance, roll };
}

function percent(value: number): number {
  return Math.round(value * 10000) / 100;
}

function emit(
  match: MatchState,
  player: PlayerState,
  passiveId: string,
  title: string,
  description: string,
  amount: number,
  affectedPlayerIds: number[],
  chance: number,
  roll: number,
  extra: Record<string, string | number | boolean | null> = {},
): void {
  appendMatchEvent(match, 'character_passive', {
    passiveId,
    characterId: player.characterId ?? '',
    title,
    impact: '✨',
    description,
    summary: `Tỷ lệ ${percent(chance)}% • roll ${percent(roll)}%.`,
    amount,
    chancePercent: percent(chance),
    rollPercent: percent(roll),
    affectedPlayerIds: affectedPlayerIds.join(','),
    ...extra,
  }, player.id);
}

export function applyMoneyLossPassivesCh05(
  match: MatchState,
  losses: readonly { player: PlayerState; loss: number }[],
  source: CharacterPassiveSourceCh05,
  random: () => number,
): void {
  for (const { player, loss } of losses) {
    if (loss <= 0) continue;

    if (player.characterId === 'starter-crybaby' && loss >= CHARACTER_PASSIVE_BALANCE_CH05.crybabyLossThreshold) {
      const chance = CHARACTER_PASSIVE_BALANCE_CH05.crybabyChance;
      const attempt = rollChance(random, chance);
      if (!attempt.hit) continue;
      const amount = Math.min(loss, CHARACTER_PASSIVE_BALANCE_CH05.crybabyRefund);
      player.money += amount;
      emit(match, player, 'passive.starter.crybaby.comfort-aftershock', 'ĐƯỢC DỖ', `Cú mất ${loss}B$ được dỗ lại +${amount}B$.`, amount, [player.id], chance, attempt.roll, { source });
      continue;
    }

    if (player.characterId === 'secret-baby' && loss >= CHARACTER_PASSIVE_BALANCE_CH05.secretBabyLossThreshold) {
      const chance = CHARACTER_PASSIVE_BALANCE_CH05.secretBabyChance;
      const attempt = rollChance(random, chance);
      if (!attempt.hit) continue;
      const amount = Math.min(loss, CHARACTER_PASSIVE_BALANCE_CH05.secretBabyRefund);
      player.money += amount;
      emit(match, player, 'passive.secret.baby.cosmic-darling', 'BÉ CƯNG CỦA VŨ TRỤ', `Vũ trụ đỡ cú mất ${loss}B$: hoàn lại +${amount}B$.`, amount, [player.id], chance, attempt.roll, { source });
    }
  }
}

export function applyDirectCardTargetPassiveCh05(
  match: MatchState,
  caster: PlayerState,
  target: PlayerState,
  cardTitle: string,
  random: () => number,
): void {
  if (target.characterId !== 'starter-grumpy' || caster.id === target.id) return;
  const chance = CHARACTER_PASSIVE_BALANCE_CH05.grumpyChance;
  const attempt = rollChance(random, chance);
  if (!attempt.hit) return;
  const amount = Math.min(CHARACTER_PASSIVE_BALANCE_CH05.grumpyCounter, Math.max(0, caster.money));
  if (amount <= 0) return;
  caster.money -= amount;
  target.money += amount;
  emit(match, target, 'passive.starter.grumpy.push-back', 'ĐỪNG CHỌC TUI', `${caster.name} dùng “${cardTitle}” và bị giật lại ${amount}B$.`, amount, [target.id, caster.id], chance, attempt.roll, { targetId: caster.id, cardTitle });
}

export function applyTurnStartPassiveCh05(
  match: MatchState,
  player: PlayerState,
  cards: CardDefinition[],
  random: () => number,
): void {
  if (player.characterId !== 'starter-anxious' || player.specialHold) return;
  if (player.handCardIds.length >= MVP_CARD_HAND_LIMIT) return;
  const chance = CHARACTER_PASSIVE_BALANCE_CH05.anxiousChance;
  const attempt = rollChance(random, chance);
  if (!attempt.hit) return;
  const card = drawWeightedCard(cards, random);
  if (!card) return;
  player.handCardIds.push(card.id);
  emit(match, player, 'passive.starter.anxious.plan-ahead', 'LO XA', `Linh cảm trúng: chuẩn bị trước 1 Lá Bài “${card.title}”.`, 0, [player.id], chance, attempt.roll, { cardId: card.id, cardTitle: card.title });
}

export function applyMiniGameStartPassivesCh05(
  match: MatchState,
  participantIds: readonly number[],
  random: () => number,
): void {
  const participants = new Set(participantIds);
  for (const player of match.players) {
    if (!participants.has(player.id) || player.characterId !== 'starter-hyper') continue;
    const chance = CHARACTER_PASSIVE_BALANCE_CH05.hyperChance;
    const attempt = rollChance(random, chance);
    if (!attempt.hit) continue;
    const amount = CHARACTER_PASSIVE_BALANCE_CH05.hyperMiniGameBonus;
    player.money += amount;
    emit(match, player, 'passive.starter.hyper.keep-moving', 'KHÔNG NGỒI YÊN', `Vừa thấy Mini Game là lên mood: +${amount}B$.`, amount, [player.id], chance, attempt.roll);
  }
}
