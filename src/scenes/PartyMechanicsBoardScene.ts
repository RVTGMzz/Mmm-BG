import Phaser from 'phaser';
import { PresentationParityBoardScene } from './PresentationParityBoardScene';

/**
 * Keep the validated board/presentation implementation intact while advancing
 * only the player-facing build labels for the 0.1.25 economy playtest.
 */
export class PartyMechanicsBoardScene extends PresentationParityBoardScene {
  create(): void {
    super.create();

    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      const current = object.text;
      if (current.includes('CITY • MVP 0.1.23 REACTION + ROUTE')) {
        object.setText('CITY • MVP 0.1.25 • 200B$ ECONOMY');
      } else if (current.includes('PLAYTEST 0.1.23 • REACTION + ROUTE')) {
        object.setText('PLAYTEST 0.1.25 • ECONOMY');
      }
    }
  }
}
