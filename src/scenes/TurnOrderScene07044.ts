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

  create(): void {
    super.create();
    this.compactLandscape07044 = isCompactLandscape07044();
    this.refreshBuildLabel07044();
    if (this.compactLandscape07044) this.applyMobileReadability07044();
  }

  update(): void {
    super.update();
    this.refreshBuildLabel07044();
  }

  private applyMobileReadability07044(): void {
    const runtime = this as unknown as TurnOrderRuntime07044;

    for (const text of runtime.nameTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(23).setFixedSize(205, 30);
    }
    for (const text of runtime.ownerTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(15);
    }
    for (const text of runtime.valueTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(54);
    }
    for (const text of runtime.rankTexts.values()) {
      text.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(17);
    }

    runtime.promptText
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(30);
    runtime.detailText
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(18)
      .setFixedSize(980, 54);
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
        object.setFontSize(18);
      } else if (/^P[1-4]$/.test(copy)) {
        object.setFontSize(17);
      } else if (copy.startsWith('MVP 0.1.')) {
        object.setVisible(false);
      }
    }
  }

  private refreshBuildLabel07044(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (!object.text.startsWith('MVP 0.1.')) continue;
      object.setText(`MVP ${MOBILE_UI_BUILD_07044} • ROLL FOR ORDER`);
      if (this.compactLandscape07044) object.setVisible(false);
    }
  }
}
