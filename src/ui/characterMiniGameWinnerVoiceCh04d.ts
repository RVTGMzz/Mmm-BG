import { characterReactionLineCh04 } from '../core/characterReactionProfilesCh04';
import { gameSession } from '../core/session';

export function characterWinnerVoiceCh04d(
  playerId: number,
  playerName: string,
  reward: number,
  eventSeq: number,
): string {
  const characterId = gameSession.getCharacterId(playerId);
  const flavor = characterReactionLineCh04(
    characterId,
    'minigame_win',
    {
      amount: Math.max(0, Math.floor(reward)),
      actor: playerName,
      target: playerName,
      speaker: playerName,
    },
    eventSeq + playerId + Math.max(0, Math.floor(reward)),
  );
  return flavor?.text ?? '';
}
