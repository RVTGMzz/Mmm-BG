import Phaser from 'phaser';
import { CareerMinigameBoardScene065 } from './CareerMinigameBoardScene065';

/**
 * 0.1.65.1 presentation/input hotfix.
 *
 * Gameplay remains inherited verbatim from 0.1.65 -> 0.1.64. This wrapper only
 * exposes the current build label while the actual fixes live in the shared rounded
 * UI proxy lifecycle and global browser gamepad navigation.
 */
export class CareerMinigameBoardScene0651 extends CareerMinigameBoardScene065 {
  create(): void {
    super.create();
    this.updateBuildLabels0651();
  }

  update(): void {
    super.update();
    this.updateBuildLabels0651();
  }

  private updateBuildLabels0651(): void {
    this.visitTextTree0651(this.children.list, (text) => {
      if (text.text.startsWith('CITY • MVP 0.1.65')) {
        text.setText('CITY • MVP 0.1.65.1 • STEAM DECK HOTFIX');
      }
    });
  }

  private visitTextTree0651(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (text: Phaser.GameObjects.Text) => void,
  ): void {
    for (const object of objects) {
      if (object instanceof Phaser.GameObjects.Text) visit(object);
      if (object instanceof Phaser.GameObjects.Container) this.visitTextTree0651(object.list, visit);
    }
  }
}
