import Phaser from 'phaser';
import { PresentationParityBoardScene } from './PresentationParityBoardScene';

/**
 * 0.1.24 keeps the validated 0.1.23 board/presentation implementation intact.
 * This thin wrapper only advances player-facing build labels for the packaged
 * Party Mechanics playtest, avoiding churn in the stable board scene.
 */
export class PartyMechanicsBoardScene extends PresentationParityBoardScene {
  create(): void {
    super.create();

    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      const current = object.text;
      if (current.includes('CITY • MVP 0.1.23 REACTION + ROUTE')) {
        object.setText('CITY • MVP 0.1.24 PARTY MECHANICS');
      } else if (current.includes('PLAYTEST 0.1.23 • REACTION + ROUTE')) {
        object.setText('PLAYTEST 0.1.24 • PARTY MECHANICS');
      }
    }
  }
}
