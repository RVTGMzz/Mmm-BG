import Phaser from 'phaser';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { resolveCameraActor0632 } from '../ui/cameraTarget0632';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene0631 } from './CareerMinigameBoardScene0631';

type PlayerVisualRuntime0632 = { token: Phaser.GameObjects.Container };

type CameraInternals0632 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime0632>;
  currentPlayer(): PlayerState | undefined;
  overviewMode: boolean;
};

type PresentationRuntime0632 = {
  currentModel?: PresentationEventModel;
};

/**
 * 0.1.63.2 movement-actor camera lock.
 *
 * Authoritative turn state can advance to the next player before the queued visual
 * move_step sequence finishes. 0.1.63.1 centered the authoritative current player,
 * so the actually moving token could still leave the viewport. This patch gives
 * the active presentation actor priority while any presentation model is running.
 * Once presentation is idle, the camera returns to the authoritative current turn.
 */
export class CareerMinigameBoardScene0632 extends CareerMinigameBoardScene0631 {
  create(): void {
    super.create();
    this.lockCameraToPresentationActor0632();
    this.updateBuildLabels0632();
  }

  update(): void {
    super.update();
    // Run after all inherited camera logic. This is the final camera decision for
    // the frame, immediately before rendering.
    this.lockCameraToPresentationActor0632();
  }

  private lockCameraToPresentationActor0632(): void {
    const internals = this as unknown as CameraInternals0632;
    if (internals.overviewMode) return;

    const presentation = (this as unknown as { presentation?: PresentationRuntime0632 }).presentation;
    const currentPlayerId = internals.currentPlayer()?.id;
    const actorId = resolveCameraActor0632(currentPlayerId, presentation?.currentModel);
    if (actorId === undefined) return;

    const token = internals.visuals.get(actorId)?.token;
    if (!token) return;

    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(token.x, token.y);
  }

  private updateBuildLabels0632(): void {
    this.visitDisplayTree0632(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (object.text.startsWith('CITY • MVP 0.1.63')) {
        object.setText('CITY • MVP 0.1.63.2 • MOVEMENT ACTOR CAMERA LOCK');
      } else if (object.text.startsWith('PLAYTEST 0.1.63')) {
        object.setText('PLAYTEST 0.1.63.2 • CAMERA BÁM TOKEN ĐANG DI CHUYỂN');
      }
    });
  }

  private visitDisplayTree0632(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree0632(object.list, visit);
      }
    }
  }
}
