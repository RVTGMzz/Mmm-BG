import Phaser from 'phaser';
import { TurnOrderScene048 } from './TurnOrderScene048';

type TurnOrderRuntime0701 = {
  promptText?: Phaser.GameObjects.Text;
  detailText?: Phaser.GameObjects.Text;
  rollButton?: Phaser.GameObjects.Rectangle;
  rollButtonText?: Phaser.GameObjects.Text;
  nameTexts: Map<number, Phaser.GameObjects.Text>;
  ownerTexts: Map<number, Phaser.GameObjects.Text>;
  valueTexts: Map<number, Phaser.GameObjects.Text>;
  rankTexts: Map<number, Phaser.GameObjects.Text>;
};

type CardSkin0701 = {
  x: number;
  source: Phaser.GameObjects.Rectangle;
  skin: Phaser.GameObjects.Graphics;
};

/** 0.1.70.1 presentation-only density/rounding pass for Roll For Order. */
export class TurnOrderScene0701 extends TurnOrderScene048 {
  private readonly cardSkins0701: CardSkin0701[] = [];
  private rollSkin0701?: Phaser.GameObjects.Graphics;

  create(): void {
    super.create();
    const runtime = this as unknown as TurnOrderRuntime0701;

    const outer = this.children.list.find((object): object is Phaser.GameObjects.Rectangle =>
      object instanceof Phaser.GameObjects.Rectangle && object.width >= 1100 && object.height >= 600,
    );
    if (outer) {
      outer.setVisible(false);
      const frame = this.add.graphics().setDepth(-2);
      frame.fillStyle(0xfffbf3, 1);
      frame.fillRoundedRect(75, 42, 1130, 630, 30);
      frame.lineStyle(5, 0x202020, 1);
      frame.strokeRoundedRect(75, 42, 1130, 630, 30);
    }

    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Rectangle)) continue;
      if (object.width < 220 || object.width > 240 || object.height < 200 || object.height > 220) continue;
      const x = object.x;
      object.setVisible(false);
      const skin = this.add.graphics().setDepth(1);
      this.cardSkins0701.push({ x, source: object, skin });
    }

    for (const object of this.children.list) {
      if (object instanceof Phaser.GameObjects.Circle && Math.abs(object.y - 218) < 4) {
        object.setY(224).setDepth(3);
      }
      if (object instanceof Phaser.GameObjects.Text && /^P[1-4]$/.test(object.text.trim()) && Math.abs(object.y - 218) < 4) {
        object.setY(224).setDepth(4);
      }
    }

    for (const text of runtime.nameTexts.values()) text.setY(276).setDepth(4).setFontSize(19);
    for (const text of runtime.ownerTexts.values()) text.setY(314).setDepth(4).setFontSize(12);
    for (const text of runtime.valueTexts.values()) text.setY(365).setDepth(4).setFontSize(48);
    for (const text of runtime.rankTexts.values()) text.setY(420).setDepth(4).setFontSize(13);

    runtime.promptText?.setY(474).setFontSize(24);
    runtime.detailText?.setY(512).setFontSize(14).setFixedSize(900, 44);

    if (runtime.rollButton) {
      runtime.rollButton.setY(594).setDisplaySize(320, 68).setAlpha(0.001);
      this.rollSkin0701 = this.add.graphics().setDepth(3);
    }
    runtime.rollButtonText?.setY(594).setDepth(4);

    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text === '🎲 ROLL FOR ORDER') object.setY(78);
      else if (object.text.startsWith('Mỗi người tự đổ D6')) object.setY(112);
      else if (object.text.startsWith('MVP 0.1.70')) object.setY(143);
    }

    this.redrawSkins0701();
  }

  update(): void {
    this.redrawSkins0701();
  }

  private redrawSkins0701(): void {
    for (const entry of this.cardSkins0701) {
      const stroke = entry.source.strokeColor || 0x242424;
      entry.skin.clear();
      entry.skin.fillStyle(0xffffff, 1);
      entry.skin.fillRoundedRect(entry.x - 115, 182, 230, 248, 26);
      entry.skin.lineStyle(5, stroke, 1);
      entry.skin.strokeRoundedRect(entry.x - 115, 182, 230, 248, 26);
    }

    const runtime = this as unknown as TurnOrderRuntime0701;
    const button = runtime.rollButton;
    const skin = this.rollSkin0701;
    if (!button || !skin) return;
    skin.setVisible(button.visible);
    if (!button.visible) return;
    skin.clear();
    skin.fillStyle(button.fillColor || 0xef4545, 1);
    skin.fillRoundedRect(480, 560, 320, 68, 24);
    skin.lineStyle(4, 0x202020, 1);
    skin.strokeRoundedRect(480, 560, 320, 68, 24);
  }
}
