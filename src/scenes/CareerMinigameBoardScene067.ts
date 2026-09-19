import Phaser from 'phaser';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene066 } from './CareerMinigameBoardScene066';

type PresentationRuntime067 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
};

/**
 * 0.1.67 presentation-only guard.
 *
 * The Job result already has one canonical MatchPresentationLayer card. A legacy
 * result/status line can still survive in the world layer and, once the camera is
 * zoomed on mobile, reads as giant white copy behind/through that card. Keep the
 * canonical card, suppress only the redundant Job sentence while it is active,
 * then restore the legacy text object after the presentation finishes so later HUD
 * updates remain available.
 */
export class CareerMinigameBoardScene067 extends CareerMinigameBoardScene066 {
  private readonly suppressedLegacyJobText067 = new Map<Phaser.GameObjects.Text, boolean>();
  private polishedJobRoot067?: Phaser.GameObjects.Container;

  create(): void {
    super.create();
    this.updateBuildLabels067();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.restoreLegacyJobText067();
      this.polishedJobRoot067 = undefined;
    });
  }

  update(): void {
    super.update();
    this.polishJobPresentation067();
  }

  private presentation067(): PresentationRuntime067 | undefined {
    return (this as unknown as { presentation?: PresentationRuntime067 }).presentation;
  }

  private polishJobPresentation067(): void {
    const presentation = this.presentation067();
    const root = presentation?.active;
    const model = presentation?.currentModel;
    const activeJob = Boolean(root?.active && model?.kind === 'tile_land' && model.tileType === 'job');

    if (!activeJob || !root || !model) {
      this.polishedJobRoot067 = undefined;
      this.restoreLegacyJobText067();
      return;
    }

    if (root.name === 'job-presentation-card') {
      this.polishedJobRoot067 = undefined;
      this.restoreLegacyJobText067();
      return;
    }

    const canonicalObjects = new Set<Phaser.GameObjects.GameObject>();
    this.collectContainerObjects067(root, canonicalObjects);

    if (this.polishedJobRoot067 !== root) {
      this.polishedJobRoot067 = root;
      for (const object of canonicalObjects) {
        if (!(object instanceof Phaser.GameObjects.Text)) continue;
        // MatchPresentationLayer landing body is created at (-178, 20). Give it a
        // hard text box so even the longest Job description cannot escape the card.
        if (object.x <= -150 && object.y >= 8) {
          object.setWordWrapWidth(500, true);
          object.setFixedSize(500, 58);
          object.setLineSpacing(3);
        }
      }
    }

    const normalizedDescription = this.normalizeCopy067(model.description);
    this.visitAllTexts067((text) => {
      if (canonicalObjects.has(text)) return;
      if (!text.visible) return;
      const copy = this.normalizeCopy067(text.text);
      if (!copy) return;

      const exactLegacyDuplicate = normalizedDescription.length > 16 && copy === normalizedDescription;
      const jobResultSentence = copy.includes('trúng') && copy.includes('B$/');
      if (!exactLegacyDuplicate && !jobResultSentence) return;

      this.suppressedLegacyJobText067.set(text, text.visible);
      text.setVisible(false);
    });
  }

  private collectContainerObjects067(
    container: Phaser.GameObjects.Container,
    output: Set<Phaser.GameObjects.GameObject>,
  ): void {
    output.add(container);
    for (const child of container.list) {
      output.add(child);
      if (child instanceof Phaser.GameObjects.Container) this.collectContainerObjects067(child, output);
    }
  }

  private visitAllTexts067(callback: (text: Phaser.GameObjects.Text) => void): void {
    const visit = (object: Phaser.GameObjects.GameObject) => {
      if (object instanceof Phaser.GameObjects.Text) callback(object);
      if (object instanceof Phaser.GameObjects.Container) {
        for (const child of object.list) visit(child);
      }
    };
    for (const object of this.children.list) visit(object);
  }

  private restoreLegacyJobText067(): void {
    for (const [text, wasVisible] of this.suppressedLegacyJobText067) {
      if (text.active) text.setVisible(wasVisible);
    }
    this.suppressedLegacyJobText067.clear();
  }

  private normalizeCopy067(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private updateBuildLabels067(): void {
    this.visitAllTexts067((text) => {
      if (text.text.includes('CITY • MVP 0.1.66')) {
        text.setText(text.text.replace('CITY • MVP 0.1.66', 'CITY • MVP 0.1.67'));
      }
    });
  }
}
