import Phaser from 'phaser';
import { CareerMinigameBoardScene044 } from './CareerMinigameBoardScene044';

/**
 * 0.1.45 gameplay board behavior is intentionally inherited unchanged from 0.1.44.
 * This wrapper only identifies the packaged build after the pregame Remote Roll For Order pass.
 */
export class CareerMinigameBoardScene045 extends CareerMinigameBoardScene044 {
  create(): void {
    super.create();
    this.updateBuildLabels045();
  }

  private updateBuildLabels045(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.44 RESULT INPUT REVEAL GATE')) {
        object.setText('CITY • MVP 0.1.45 REMOTE ROLL FOR ORDER');
      } else if (object.text.includes('PLAYTEST 0.1.44 • UNLOCK AFTER PODIUM')) {
        object.setText('PLAYTEST 0.1.45 • HOST-AUTH REMOTE D6');
      }
    }
  }
}
