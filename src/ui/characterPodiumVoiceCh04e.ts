import { characterReactionLineCh04 } from '../core/characterReactionProfilesCh04';
import { gameSession } from '../core/session';

export function podiumWinnerVoiceCh04e(
  playerId: number,
  playerName: string,
  rank: number,
  money: number,
): string {
  if (rank !== 1) return '';
  const characterId = gameSession.getCharacterId(playerId);
  const flavor = characterReactionLineCh04(
    characterId,
    'match_win',
    {
      amount: Math.max(0, Math.floor(money)),
      actor: playerName,
      target: playerName,
      speaker: playerName,
    },
    playerId + Math.max(0, Math.floor(money)),
  );
  return flavor?.text ?? '';
}
