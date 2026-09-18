import type { PlayerState } from '../core/types';

export interface MoneyRankEntry {
  playerId: number;
  rank: number;
  money: number;
  marker: '' | '👑' | '🛟';
}

export interface MoneyDeltaEntry {
  playerId: number;
  amount: number;
}

export function moneyRanks(players: PlayerState[]): MoneyRankEntry[] {
  const ordered = [...players].sort((left, right) => right.money - left.money || left.id - right.id);
  if (ordered.length === 0) return [];

  const spread = (ordered[0]?.money ?? 0) - (ordered[ordered.length - 1]?.money ?? 0);
  return ordered.map((player, index) => ({
    playerId: player.id,
    rank: index + 1,
    money: player.money,
    marker: spread <= 0 ? '' : index === 0 ? '👑' : index === ordered.length - 1 ? '🛟' : '',
  }));
}

export function moneyRankForPlayer(players: PlayerState[], playerId: number): MoneyRankEntry | undefined {
  return moneyRanks(players).find((entry) => entry.playerId === playerId);
}

export function formatMoneyLeaderboardRow(
  player: PlayerState,
  players: PlayerState[],
  currentPlayerId: number,
  isCpu: boolean,
): string {
  const rank = moneyRankForPlayer(players, player.id);
  const turn = player.id === currentPlayerId ? '▶' : ' ';
  const marker = rank?.marker ? `${rank.marker} ` : '';
  const cpu = isCpu ? '🤖 ' : '';
  const lock = player.cardBlockTurns > 0 ? ` 🔒${player.cardBlockTurns}` : '';
  return `${turn}${rank?.rank ?? '-'}  ${marker}${cpu}${player.name}  ${player.money}B$  🃏${player.handCardIds.length}/3${lock}`;
}

export function moneyDeltas(before: PlayerState[], after: PlayerState[]): MoneyDeltaEntry[] {
  const beforeMoney = new Map(before.map((player) => [player.id, player.money]));
  return after
    .map((player) => ({ playerId: player.id, amount: player.money - (beforeMoney.get(player.id) ?? player.money) }))
    .filter((entry) => entry.amount !== 0)
    .sort((left, right) => left.playerId - right.playerId);
}
