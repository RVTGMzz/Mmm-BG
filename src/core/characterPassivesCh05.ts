import { drawWeightedCard, type CardDefinition } from './cards';
import { appendMatchEvent, type MatchState } from './matchState';
import { MVP_CARD_HAND_LIMIT } from './rules';
import type { PlayerState } from './types';

export const CHARACTER_PASSIVE_BALANCE_CH05 = {
  crybabyLossThreshold: 20,
  crybabyRefund: 10,
  grumpyCounter: 5,
  hyperMiniGameBonus: 5,
  secretBabyLossThreshold: 20,
  secretBabyRefund: 15,
} as const;

export type CharacterPassiveSourceCh05 = 'money_tile' | 'news' | 'card';

function lapKey(player: PlayerState): number {
  return Math.max(0, Math.floor(player.lapsCompleted ?? 0));
}

function passiveReady(player: PlayerState): boolean {
  return player.characterPassiveLastLap !== lapKey(player);
}

function consume(player: PlayerState): void {
  player.characterPassiveLastLap = lapKey(player);
}

function emit(
  match: MatchState,
  player: PlayerState,
  passiveId: string,
  title: string,
  description: string,
  amount: number,
  affectedPlayerIds: number[],
  extra: Record<string, string | number | boolean | null> = {},
): void {
  appendMatchEvent(match, 'character_passive', {
    passiveId,
    characterId: player.characterId ?? '',
    title,
    impact: '✨',
    description,
    summary: `Mỗi vòng tối đa 1 lần • vòng hiện tại ${lapKey(player) + 1}.`,
    amount,
    affectedPlayerIds: affectedPlayerIds.join(','),
    ...extra,
  }, player.id);
}

export function applyMoneyLossPassivesCh05(
  match: MatchState,
  losses: readonly { player: PlayerState; loss: number }[],
  source: CharacterPassiveSourceCh05,
): void {
  for (const { player, loss } of losses) {
    if (!passiveReady(player) || loss <= 0) continue;
    if (player.characterId === 'starter-crybaby' && loss >= CHARACTER_PASSIVE_BALANCE_CH05.crybabyLossThreshold) {
      const amount = Math.min(loss, CHARACTER_PASSIVE_BALANCE_CH05.crybabyRefund);
      player.money += amount;
      consume(player);
      emit(match, player, 'passive.starter.crybaby.comfort-aftershock', 'ĐƯỢC DỖ', `Cú mất ${loss}B$ được dỗ lại +${amount}B$.`, amount, [player.id], { source });
      continue;
    }
    if (player.characterId === 'secret-baby' && loss >= CHARACTER_PASSIVE_BALANCE_CH05.secretBabyLossThreshold) {
      const amount = Math.min(loss, CHARACTER_PASSIVE_BALANCE_CH05.secretBabyRefund);
      player.money += amount;
      consume(player);
      emit(match, player, 'passive.secret.baby.cosmic-darling', 'BÉ CƯNG CỦA VŨ TRỤ', `Vũ trụ đỡ cú mất ${loss}B$: hoàn lại +${amount}B$.`, amount, [player.id], { source });
    }
  }
}

export function applyDirectCardTargetPassiveCh05(
  match: MatchState,
  caster: PlayerState,
  target: PlayerState,
  cardTitle: string,
): void {
  if (target.characterId !== 'starter-grumpy' || !passiveReady(target) || caster.id === target.id) return;
  const amount = Math.min(CHARACTER_PASSIVE_BALANCE_CH05.grumpyCounter, Math.max(0, caster.money));
  if (amount <= 0) return;
  caster.money -= amount;
  target.money += amount;
  consume(target);
  emit(match, target, 'passive.starter.grumpy.push-back', 'ĐỪNG CHỌC TUI', `${caster.name} dùng “${cardTitle}” và bị giật lại ${amount}B$.`, amount, [target.id, caster.id], { targetId: caster.id, cardTitle });
}

export function applyTurnStartPassiveCh05(
  match: MatchState,
  player: PlayerState,
  cards: CardDefinition[],
  random: () => number,
): void {
  if (player.characterId !== 'starter-anxious' || !passiveReady(player) || player.specialHold) return;
  if (player.handCardIds.length >= MVP_CARD_HAND_LIMIT) return;
  const card = drawWeightedCard(cards, random);
  if (!card) return;
  player.handCardIds.push(card.id);
  consume(player);
  emit(match, player, 'passive.starter.anxious.plan-ahead', 'LO XA', `Chuẩn bị trước 1 Lá Bài: ${card.title}.`, 0, [player.id], { cardId: card.id, cardTitle: card.title });
}

export function applyMiniGameStartPassivesCh05(match: MatchState, participantIds: readonly number[]): void {
  const participants = new Set(participantIds);
  for (const player of match.players) {
    if (!participants.has(player.id) || player.characterId !== 'starter-hyper' || !passiveReady(player)) continue;
    const amount = CHARACTER_PASSIVE_BALANCE_CH05.hyperMiniGameBonus;
    player.money += amount;
    consume(player);
    emit(match, player, 'passive.starter.hyper.keep-moving', 'KHÔNG NGỒI YÊN', `Vừa thấy Mini Game là lên mood: +${amount}B$.`, amount, [player.id]);
  }
}
