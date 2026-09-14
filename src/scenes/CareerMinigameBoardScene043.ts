import Phaser from 'phaser';
import {
  PODIUM_REVEAL_TWEEN_MS,
  podiumRevealDelayForRank,
} from '../ui/podiumReveal';
import type { RankedPodiumEntry } from '../ui/podiumRanking';
import { CareerMinigameBoardScene042 } from './CareerMinigameBoardScene042';

/**
 * 0.1.43 presentation-only podium reveal cadence.
 *
 * Podium slots reveal from lower rank to higher rank. Equal displayed ranks use the
 * exact same delay, so tied players appear together. Timings are fixed constants and
 * do not use gameplay RNG or alter authoritative result state.
 */
export class CareerMinigameBoardScene043 extends CareerMinigameBoardScene042 {
  create(): void {
    super.create();
    this.updateBuildLabels043();
  }

  protected decoratePodiumSlot(
    slot: Phaser.GameObjects.Container,
    entry: RankedPodiumEntry,
    x: number,
    faceY: number,
  ): void {
    super.decoratePodiumSlot(slot, entry, x, faceY);

    slot.setAlpha(0).setY(14);
    const delay = podiumRevealDelayForRank(entry.rank);

    this.time.delayedCall(delay, () => {
      if (!slot.active) return;
      this.tweens.add({
        targets: slot,
        alpha: 1,
        y: 0,
        duration: PODIUM_REVEAL_TWEEN_MS,
        ease: 'Back.easeOut',
      });
    });
  }

  private updateBuildLabels043(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.42 PODIUM FACE REACTIONS')) {
        object.setText('CITY • MVP 0.1.43 PODIUM REVEAL CASCADE');
      } else if (object.text.includes('PLAYTEST 0.1.42 • WINNER SPOTLIGHT')) {
        object.setText('PLAYTEST 0.1.43 • LOW → HIGH REVEAL');
      }
    }
  }
}
