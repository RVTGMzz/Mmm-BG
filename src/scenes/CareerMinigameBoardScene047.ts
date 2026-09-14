import Phaser from 'phaser';
import type { PresentationEventModel } from '../ui/presentationModel';
import {
  legacyDeckFormForKind,
  legacyDeckVisibleText,
} from '../ui/legacyDeckPresentation';
import { CareerMinigameBoardScene046 } from './CareerMinigameBoardScene046';

type PresentationRuntime047 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
};

/**
 * 0.1.47 presentation parity audit + legacy deck vocabulary.
 *
 * Technical gameplay protocol remains card_*/news. This layer only changes what a
 * player sees: old vertical prophecy cards become TIÊN TRI, old horizontal magic
 * cards become PHÉP THUẬT. The same authoritative event stream still drives both
 * HOST and CLIENT presentation queues.
 */
export class CareerMinigameBoardScene047 extends CareerMinigameBoardScene046 {
  private readonly portraitized = new WeakSet<Phaser.GameObjects.Container>();

  create(): void {
    super.create();
    this.updateBuildLabels047();
    this.rewriteVisibleDeckCopy();
  }

  update(): void {
    super.update();
    this.rewriteVisibleDeckCopy();
    this.applyLegacyDeckShape();
  }

  private rewriteVisibleDeckCopy(): void {
    for (const object of this.children.list) this.rewriteGameObject(object);
  }

  private rewriteGameObject(object: Phaser.GameObjects.GameObject): void {
    if (object instanceof Phaser.GameObjects.Text) {
      const next = legacyDeckVisibleText(object.text);
      if (next !== object.text) object.setText(next);
      return;
    }
    if (object instanceof Phaser.GameObjects.Container) {
      for (const child of object.list) this.rewriteGameObject(child);
    }
  }

  private applyLegacyDeckShape(): void {
    const presentation = (this as unknown as { presentation?: PresentationRuntime047 }).presentation;
    const model = presentation?.currentModel;
    const container = presentation?.active;
    if (!model || !container || !container.active) return;
    if (legacyDeckFormForKind(model.kind) !== 'portrait') return;
    if (this.portraitized.has(container)) return;

    this.portraitized.add(container);
    this.reshapeProphecyCard(container);
  }

  /**
   * News used to share the generic horizontal cinematic frame. Prophecy keeps the
   * exact same model/timing/reactions, but receives a portrait card silhouette that
   * matches the old Tiên Tri deck language supplied as visual reference.
   */
  private reshapeProphecyCard(container: Phaser.GameObjects.Container): void {
    const list = container.list;
    const shadow = list[0];
    const panel = list[1];
    const kicker = list[2];
    const title = list[3];
    const impact = list[4];
    const body = list[5];
    const source = list[6];

    container.setPosition(640, 300);

    if (shadow instanceof Phaser.GameObjects.Graphics) {
      shadow.clear();
      shadow.fillStyle(0x000000, 0.28);
      shadow.fillRoundedRect(-190, -230, 380, 460, 22);
      shadow.setPosition(0, 8);
    }
    if (panel instanceof Phaser.GameObjects.Graphics) {
      panel.clear();
      panel.fillStyle(0x173c31, 0.985);
      panel.fillRoundedRect(-190, -230, 380, 460, 22);
      panel.lineStyle(4, 0x9bcf74, 0.95);
      panel.strokeRoundedRect(-190, -230, 380, 460, 22);
      panel.fillStyle(0x9bcf74, 1);
      panel.fillRoundedRect(-190, -230, 380, 9, { tl: 22, tr: 22, bl: 0, br: 0 });
    }
    if (kicker instanceof Phaser.GameObjects.Text) {
      kicker.setPosition(-158, -198).setFontSize(12);
    }
    if (title instanceof Phaser.GameObjects.Text) {
      title.setPosition(-158, -160).setFontSize(25).setWordWrapWidth(316);
    }
    if (impact instanceof Phaser.GameObjects.Text) {
      impact.setPosition(158, -198).setOrigin(1, 0);
    }
    if (body instanceof Phaser.GameObjects.Text) {
      body.setPosition(-158, -78).setFontSize(15).setWordWrapWidth(316);
    }
    if (source instanceof Phaser.GameObjects.Text) {
      source.setPosition(158, 207).setOrigin(1, 0.5);
    }

    for (let index = 7; index < list.length; index += 1) {
      const child = list[index];
      if (!(child instanceof Phaser.GameObjects.Text)) continue;
      const previous = list[index - 1];

      if (child.text.startsWith('ACTOR  ')) {
        if (previous instanceof Phaser.GameObjects.Graphics) previous.setPosition(144, 76);
        child.setPosition(-166, 194);
      } else if (child.text.startsWith('TARGET  ')) {
        if (previous instanceof Phaser.GameObjects.Graphics) previous.setPosition(90, 42);
        child.setPosition(22, 160);
      } else if (['N', 'R', 'SR', 'SSR'].includes(child.text.trim())) {
        if (previous instanceof Phaser.GameObjects.Graphics) previous.setPosition(-133, -91);
        child.setPosition(142, -209);
      }
    }
  }

  private updateBuildLabels047(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.46 JOB HUB MULTIPLAYER POLISH')) {
        object.setText('CITY • MVP 0.1.47 MULTIPLAYER PRESENTATION PARITY');
      } else if (object.text.includes('PLAYTEST 0.1.46 • REMOTE JOB DICE')) {
        object.setText('PLAYTEST 0.1.47 • TIÊN TRI + PHÉP THUẬT');
      }
    }
  }
}
