import Phaser from 'phaser';
import {
  MOBILE_UI_BUILD_07044,
  MOBILE_UI_FONT_07044,
  isCompactLandscape07044,
} from '../ui/mobileReadability07044';
import { TurnOrderScene0701 } from './TurnOrderScene0701';

type TurnOrderRuntime07044 = {
  promptText?: Phaser.GameObjects.Text;
  detailText?: Phaser.GameObjects.Text;
  rollButton?: Phaser.GameObjects.Rectangle;
  rollButtonText?: Phaser.GameObjects.Text;
  nameTexts: Map<number, Phaser.GameObjects.Text>;
  ownerTexts: Map<number, Phaser.GameObjects.Text>;
  valueTexts: Map<number, Phaser.GameObjects.Text>;
  rankTexts: Map<number, Phaser.GameObjects.Text>;
};

/**
 * 0.1.70.4.4 presentation-only readability layer for Roll For Order.
 * Network prompt ownership remains entirely inherited from TurnOrderScene048/0701.
 */
export class TurnOrderScene07044 extends TurnOrderScene0701 {
  private compactLandscape07044 = false;
  private frameBottom070430 = 0;

  create(): void {
    super.create();
    this.compactLandscape07044 = isCompactLandscape07044();
    this.refreshBuildLabel07044();
    this.applyMobileReadability07044();
    this.syncDensity070430();
  }

  update(): void {
    super.update();
    this.refreshBuildLabel07044();
    this.syncDensity070430();
  }

  private applyMobileReadability07044(): void {
    const runtime = this as unknown as TurnOrderRuntime07044;

    for (const text of runtime.nameTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(23).setFixedSize(205, 30);
    }
    for (const text of runtime.ownerTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(18);
    }
    for (const text of runtime.valueTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(54);
    }
    for (const text of runtime.rankTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(20);
    }

    runtime.promptText
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(30);
    runtime.detailText
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(21)
      .setWordWrapWidth(980, true)
      .setFixedSize(980, 64)
      .setOrigin(0.5, 0)
      .setY(508)
      .setMaxLines(2);
    runtime.rollButton?.setY(610);
    runtime.rollButtonText?.setY(610);
    runtime.rollButtonText
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(24);

    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      object.setFontFamily(MOBILE_UI_FONT_07044);

      const copy = object.text.trim();
      if (copy === '🎲 ROLL FOR ORDER') {
        object.setFontSize(44);
      } else if (copy.startsWith('Mỗi người tự đổ D6')) {
        object.setFontSize(21);
      } else if (/^P[1-4]$/.test(copy)) {
        object.setFontSize(20);
      } else if (copy.startsWith('MVP 0.1.')) {
        object.setVisible(false);
      }
    }
  }

  private syncDensity070430(): void {
    const runtime = this as unknown as TurnOrderRuntime07044;
    const bottom = runtime.rollButton?.visible ? 672 : 594;
    if (bottom === this.frameBottom070430) return;
    const frame = this.children.getByName('roll-order-frame');
    if (!(frame instanceof Phaser.GameObjects.Graphics)) return;
    this.frameBottom070430 = bottom;
    frame.clear().fillStyle(0xfffbf3, 1).fillRoundedRect(75, 42, 1130, bottom - 42, 30);
    frame.lineStyle(5, 0x202020, 1).strokeRoundedRect(75, 42, 1130, bottom - 42, 30);
  }

  private refreshBuildLabel07044(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (!object.text.startsWith('MVP 0.1.')) continue;
      object.setText(`MVP ${MOBILE_UI_BUILD_07044} • ROLL FOR ORDER`);
      object.setVisible(false);
    }
  }
}
