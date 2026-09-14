import Phaser from 'phaser';
import { CareerMinigameBoardScene048 } from './CareerMinigameBoardScene048';

/**
 * 0.1.56 branch-identity pass.
 *
 * Gameplay authority stays in the validated 0.1.48+ chain. This wrapper only
 * updates visible build copy for the canonical Draft D map now that the three
 * alternate corridors have SAFE / DRAMA / MONEY identities.
 */
export class CareerMinigameBoardScene056 extends CareerMinigameBoardScene048 {
  create(): void {
    super.create();
    this.updateBuildLabels056();
  }

  private updateBuildLabels056(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;

      if (object.text.includes('CITY • MVP 0.1.48 BUGFIX PASS')) {
        object.setText('CITY • MVP 0.1.56 BRANCH IDENTITY');
      } else if (object.text.includes('PLAYTEST 0.1.48 • AUDIO + DICE + TOKEN SYNC')) {
        object.setText('PLAYTEST 0.1.56 • AN TOÀN / DRAMA / TIỀN');
      } else if (object.text.includes('CITY GRAPH\n20 NODES • 1 BRANCH')) {
        object.setText('DRAFT D\n44 Ô • 3 NHÁNH CÓ BẢN SẮC');
      }
    }
  }
}
