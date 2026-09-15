import Phaser from 'phaser';
import { CareerMinigameBoardScene0651 } from './CareerMinigameBoardScene0651';

/**
 * 0.1.66 presentation wrapper.
 *
 * Gameplay stays in the inherited HOST-authoritative chain. This layer only:
 * - exposes the 0.1.66 build label;
 * - removes the redundant dice emoji from Job presentation when the briefcase is shown;
 * - reflows Mini Game result/ranking text so headings and multiline bodies never collide.
 */
export class CareerMinigameBoardScene066 extends CareerMinigameBoardScene0651 {
  create(): void {
    super.create();
    this.polishPresentation066();
  }

  update(): void {
    super.update();
    this.polishPresentation066();
  }

  private polishPresentation066(): void {
    this.visitTextTree066(this.children.list, (text) => {
      if (text.text.startsWith('CITY • MVP 0.1.65.1')) {
        text.setText('CITY • MVP 0.1.66 • UNIFIED FLOW + MATCH LENGTH');
      }

      if (text.text.includes('💼🎲')) {
        text.setText(text.text.replaceAll('💼🎲', '💼'));
      }

      const value = text.text.trim();
      if (value.startsWith('🤝 HÒA') || value.includes('HÒA, RA LẠI')) {
        text
          .setY(-108)
          .setOrigin(0.5, 0)
          .setFontSize(28)
          .setAlign('center')
          .setFixedSize(760, 56);
        return;
      }

      if (value.startsWith('🏆 BẢNG XẾP HẠNG')) {
        text
          .setY(-112)
          .setOrigin(0.5, 0)
          .setFontSize(27)
          .setAlign('center')
          .setFixedSize(760, 54);
        return;
      }

      const isChoiceSummary = value.includes('\n')
        && /(SẤP|NGỬA|BÚA|BAO|KÉO)/.test(value)
        && /(Player|CPU|P\d)/.test(value);
      if (isChoiceSummary) {
        text
          .setY(-42)
          .setOrigin(0.5, 0)
          .setFontSize(17)
          .setLineSpacing(10)
          .setAlign('left')
          .setFixedSize(720, 190);
        return;
      }

      const isRankingBody = value.includes('\n') && /[🥇🥈🥉4️⃣]/u.test(value) && value.includes('B$');
      if (isRankingBody) {
        text
          .setY(-42)
          .setOrigin(0.5, 0)
          .setFontSize(19)
          .setLineSpacing(12)
          .setAlign('left')
          .setFixedSize(660, 210);
      }
    });
  }

  private visitTextTree066(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (text: Phaser.GameObjects.Text) => void,
  ): void {
    for (const object of objects) {
      if (object instanceof Phaser.GameObjects.Text) visit(object);
      if (object instanceof Phaser.GameObjects.Container) this.visitTextTree066(object.list, visit);
    }
  }
}
