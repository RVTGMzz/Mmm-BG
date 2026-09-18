import Phaser from 'phaser';
import type { FaceExpression } from '../core/session';
import { podiumFaceExpressionForRank, shouldSpotlightPodiumRank } from '../ui/podiumFaceReaction';
import type { RankedPodiumEntry } from '../ui/podiumRanking';
import { CareerMinigameBoardScene041 } from './CareerMinigameBoardScene041';

/**
 * 0.1.42 presentation-only podium reaction polish.
 *
 * Rank 1 prefers the supplied happy face, rank 4 prefers angry, and middle ranks use
 * neutral. GameSession.getFace still falls back to neutral when a reaction asset is
 * absent. Winners also receive fixed crown/spark decorations with no RNG.
 */
export class CareerMinigameBoardScene042 extends CareerMinigameBoardScene041 {
  create(): void {
    super.create();
    this.updateBuildLabels042();
  }

  protected podiumFaceExpression(entry: RankedPodiumEntry): FaceExpression {
    return podiumFaceExpressionForRank(entry.rank);
  }

  protected decoratePodiumSlot(
    root: Phaser.GameObjects.Container,
    entry: RankedPodiumEntry,
    x: number,
    faceY: number,
  ): void {
    if (!shouldSpotlightPodiumRank(entry.rank)) return;

    const crown = this.add.text(x, faceY - 40, '👑', {
      fontSize: '24px',
    }).setOrigin(0.5);
    const leftSpark = this.add.text(x - 40, faceY - 8, '✦', {
      fontSize: '17px',
      color: '#ffd34d',
    }).setOrigin(0.5);
    const rightSpark = this.add.text(x + 40, faceY - 8, '✦', {
      fontSize: '17px',
      color: '#ffd34d',
    }).setOrigin(0.5);

    root.add([crown, leftSpark, rightSpark]);
  }

  private updateBuildLabels042(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.41 AUTHORITATIVE FINAL PODIUM')) {
        object.setText('CITY • MVP 0.1.42 PODIUM FACE REACTIONS');
      } else if (object.text.includes('PLAYTEST 0.1.41 • PODIUM + TIE CLARITY')) {
        object.setText('PLAYTEST 0.1.42 • WINNER SPOTLIGHT');
      }
    }
  }
}
