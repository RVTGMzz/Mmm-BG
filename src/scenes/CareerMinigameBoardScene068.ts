import Phaser from 'phaser';
import { MEMEME_BUILD } from '../buildInfo';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene067 } from './CareerMinigameBoardScene067';

type PresentationRuntime068 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
};

/**
 * 0.1.68 is the vertical-slice stabilization wrapper.
 *
 * It deliberately adds no gameplay rule. It keeps the 0.1.67 authoritative
 * chain intact, owns the visible build label, and prevents legacy board/HUD
 * copy from bleeding through the canonical Job modal.
 */
export class CareerMinigameBoardScene068 extends CareerMinigameBoardScene067 {
  private readonly hiddenDuringCanonicalModal068 = new Map<Phaser.GameObjects.Text, boolean>();

  create(): void {
    super.create();
    this.stabilizeBuildLabels068();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.restoreCanonicalModalTexts068());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.restoreCanonicalModalTexts068());
  }

  update(): void {
    super.update();
    // Run after every inherited presentation/HUD update so legacy text cannot be
    // recreated or made visible again on the next frame while a modal is active.
    this.stabilizeBuildLabels068();
    this.guardCanonicalModal068();
  }

  private presentation068(): PresentationRuntime068 | undefined {
    return (this as unknown as { presentation?: PresentationRuntime068 }).presentation;
  }

  private guardCanonicalModal068(): void {
    const presentation = this.presentation068();
    const root = presentation?.active;
    const model = presentation?.currentModel;
    const activeJob = Boolean(root?.active && model?.kind === 'tile_land' && model.tileType === 'job');

    if (!activeJob || !root || !model) {
      this.restoreCanonicalModalTexts068();
      return;
    }

    if (root.name === 'job-presentation-card') {
      this.restoreCanonicalModalTexts068();
      return;
    }

    const canonicalObjects = new Set<Phaser.GameObjects.GameObject>();
    this.collectObjects068(root, canonicalObjects);
    const normalizedDescription = this.normalizeCopy068(model.description);

    this.visitTexts068((text) => {
      if (canonicalObjects.has(text) || !text.visible) return;

      const copy = this.normalizeCopy068(text.text);
      if (!copy) return;

      const exactDescription = normalizedDescription.length > 12 && copy === normalizedDescription;
      const legacyJobSentence = copy.includes('trúng') && (copy.includes('b$/') || copy.includes('lương'));
      const legacyJobHud = copy.includes('b$/vòng');
      const legacyJobResult = copy.includes('nhận việc') && (copy.includes('🎲') || copy.includes('→'));

      if (!exactDescription && !legacyJobSentence && !legacyJobHud && !legacyJobResult) return;

      if (!this.hiddenDuringCanonicalModal068.has(text)) {
        this.hiddenDuringCanonicalModal068.set(text, text.visible);
      }
      text.setVisible(false);
    });
  }

  private restoreCanonicalModalTexts068(): void {
    for (const [text, wasVisible] of this.hiddenDuringCanonicalModal068) {
      if (text.scene && text.active) text.setVisible(wasVisible);
    }
    this.hiddenDuringCanonicalModal068.clear();
  }

  private stabilizeBuildLabels068(): void {
    this.visitTexts068((text) => {
      if (text.text.startsWith('CITY • MVP 0.1.')) {
        if (text.text !== MEMEME_BUILD.boardHeader) text.setText(MEMEME_BUILD.boardHeader);
        return;
      }

      if (text.text.startsWith('PLAYTEST 0.1.') && text.text.includes('•')) {
        if (text.text !== MEMEME_BUILD.boardBadge) text.setText(MEMEME_BUILD.boardBadge);
      }
    });
  }

  private visitTexts068(visitor: (text: Phaser.GameObjects.Text) => void): void {
    const walk = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) visitor(object);
      if (object instanceof Phaser.GameObjects.Container) {
        for (const child of object.list) walk(child);
      }
    };

    for (const object of this.children.list) walk(object);
  }

  private collectObjects068(
    root: Phaser.GameObjects.Container,
    output: Set<Phaser.GameObjects.GameObject>,
  ): void {
    output.add(root);
    for (const child of root.list) {
      output.add(child);
      if (child instanceof Phaser.GameObjects.Container) this.collectObjects068(child, output);
    }
  }

  private normalizeCopy068(value: string): string {
    return value
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('vi');
  }
}
