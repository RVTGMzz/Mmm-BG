import type { PresentationEventModel } from './presentationModel';

/**
 * Presentation is allowed to trail authoritative turn advancement. While a visual
 * event is still playing, keep the camera on that event's actor. Once the visual
 * queue is idle, fall back to the authoritative current-turn player.
 */
export function resolveCameraActor0632(
  currentPlayerId: number | undefined,
  currentModel: PresentationEventModel | undefined,
): number | undefined {
  if (currentModel?.actorId !== undefined) return currentModel.actorId;
  return currentPlayerId;
}
