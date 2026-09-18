import Phaser from 'phaser';
import type { ClientIntentType } from '../core/authority';
import type { MatchEventValue } from '../core/matchState';
import { CareerMinigameBoardScene } from './CareerMinigameBoardScene';

type MiniGamePayoutGuardInternals = {
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
};

/**
 * Retained 0.1.37 networking cleanup.
 *
 * MiniGameOverlay commits the deterministic ranking through
 * TwoTabHostSession.submitSystemIntent(). The inherited scene still owns an older
 * completion callback that tries resolve_minigame as a normal seat/player intent.
 * Swallow only that obsolete duplicate path so the host-system remains the single
 * authoritative owner of Mini Game payout.
 */
export class CareerMinigameBoardScene037 extends CareerMinigameBoardScene {
  create(): void {
    super.create();
    this.installHostOwnedMiniGamePayoutGuard();
    this.updateBuildLabels038();
  }

  private installHostOwnedMiniGamePayoutGuard(): void {
    const internals = this as unknown as MiniGamePayoutGuardInternals;
    const originalSubmitIntent = internals.submitIntent.bind(this);

    internals.submitIntent = (
      type: ClientIntentType,
      data: Record<string, MatchEventValue> = {},
    ) => {
      if (type === 'resolve_minigame') return;
      originalSubmitIntent(type, data);
    };
  }

  private updateBuildLabels038(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.36 EVENT AUDIO + ORDER DICE')) {
        object.setText('CITY • MVP 0.1.38 CHOICE SFX + COPY CLEANUP');
      } else if (object.text.includes('PLAYTEST 0.1.36 • EVENT AUDIO + MINI BGM')) {
        object.setText('PLAYTEST 0.1.38 • CHOICE FEEDBACK POLISH');
      }
    }
  }
}
