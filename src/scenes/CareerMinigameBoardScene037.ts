import Phaser from 'phaser';
import type { ClientIntentType } from '../core/authority';
import type { MatchEventValue } from '../core/matchState';
import { CareerMinigameBoardScene } from './CareerMinigameBoardScene';

type MiniGamePayoutGuardInternals = {
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
};

/**
 * 0.1.37 networking cleanup.
 *
 * MiniGameOverlay already commits the deterministic ranking through
 * TwoTabHostSession.submitSystemIntent(). The inherited 0.1.36 scene also had a
 * presentation completion callback that attempted to submit resolve_minigame as a
 * normal seat/player intent. TwoTabHostSession correctly rejects that path because
 * Mini Game payout is host-system owned, but the redundant rejection creates noisy
 * receipts and makes the ownership model harder to reason about.
 *
 * Keep every normal player intent untouched and swallow only that obsolete duplicate
 * resolve_minigame path. The authoritative payout still comes exclusively from the
 * host-system submission inside MiniGameOverlay.
 */
export class CareerMinigameBoardScene037 extends CareerMinigameBoardScene {
  create(): void {
    super.create();
    this.installHostOwnedMiniGamePayoutGuard();
    this.updateBuildLabels037();
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

  private updateBuildLabels037(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.36 EVENT AUDIO + ORDER DICE')) {
        object.setText('CITY • MVP 0.1.37 MINI GAME AUTHORITY CLEANUP');
      } else if (object.text.includes('PLAYTEST 0.1.36 • EVENT AUDIO + MINI BGM')) {
        object.setText('PLAYTEST 0.1.37 • SINGLE HOST PAYOUT PATH');
      }
    }
  }
}
