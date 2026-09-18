import Phaser from 'phaser';
import { podiumRevealCompleteMs } from '../ui/podiumReveal';
import { CareerMinigameBoardScene043 } from './CareerMinigameBoardScene043';

type PodiumRevealGateInternals = {
  shell: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay: Phaser.GameObjects.GameObject[];
  renderShellOverlay(): void;
};

/**
 * 0.1.44 presentation-only result input gate.
 *
 * 0.1.39 already blocks result controls during the B$ lock beat. 0.1.44 extends that
 * protection through the final milliseconds of the 0.1.43 podium cascade so users
 * cannot rematch or leave while the winner slot is still revealing.
 */
export class CareerMinigameBoardScene044 extends CareerMinigameBoardScene043 {
  private podiumRevealGateArmed = false;
  private podiumRevealBlocker?: Phaser.GameObjects.Rectangle;

  create(): void {
    super.create();
    this.installPodiumRevealInputGate();
    this.updateBuildLabels044();

    this.events.once('shutdown', () => this.resetPodiumRevealInputGate());
  }

  private installPodiumRevealInputGate(): void {
    const internals = this as unknown as PodiumRevealGateInternals;
    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);

    internals.renderShellOverlay = () => {
      originalRenderShellOverlay();

      if (internals.shell.status !== 'ended') {
        this.resetPodiumRevealInputGate();
        return;
      }

      if (internals.shellOverlay.length === 0 || this.podiumRevealGateArmed) return;
      this.podiumRevealGateArmed = true;

      const blocker = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.001)
        .setDepth(979)
        .setInteractive();
      this.podiumRevealBlocker = blocker;

      this.time.delayedCall(podiumRevealCompleteMs(), () => {
        if (!blocker.active) return;
        if (this.podiumRevealBlocker === blocker) this.podiumRevealBlocker = undefined;
        blocker.destroy();
      });
    };
  }

  private resetPodiumRevealInputGate(): void {
    this.podiumRevealGateArmed = false;
    this.podiumRevealBlocker?.destroy();
    this.podiumRevealBlocker = undefined;
  }

  private updateBuildLabels044(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.43 PODIUM REVEAL CASCADE')) {
        object.setText('CITY • MVP 0.1.44 RESULT INPUT REVEAL GATE');
      } else if (object.text.includes('PLAYTEST 0.1.43 • LOW → HIGH REVEAL')) {
        object.setText('PLAYTEST 0.1.44 • UNLOCK AFTER PODIUM');
      }
    }
  }
}
