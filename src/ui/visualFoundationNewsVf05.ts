import type Phaser from 'phaser';
import { PRESENTATION_LANES_070422 } from './presentationLanes070422';

/** VF-05 first sample: one warm news-sheet inside the EXISTING event owner.
 * These paint dimensions must fit .22 reaction rails and final modal guards.
 * Do not create new containers, toasts, cameras or input/action owners here.
 */
export const NEWS_SHEET_VF05 = Object.freeze({
  centerX: 640,
  centerY: 330,
  width: 720,
  height: 300,
  radius: 22,
  bodyWidth: 628,
  bodyMaxHeight: 138,
  titleWidth: 540,
  titleMaxHeight: 54,
  cream: 0xfffaf1,
  mint: 0x84d5a1,
  cocoa: 0x4a302a,
  copy: 0x59463d,
});

export function newsSheetBoundsVf05(): {
  left: number; right: number; top: number; bottom: number;
} {
  const n = NEWS_SHEET_VF05;
  return {
    left: n.centerX - n.width / 2,
    right: n.centerX + n.width / 2,
    top: n.centerY - n.height / 2,
    bottom: n.centerY + n.height / 2,
  };
}

/** Internal guard keeps the reusable News sheet within the canonical rails. */
export function newsSheetFitsVf05(): boolean {
  const bounds = newsSheetBoundsVf05();
  return bounds.left >= PRESENTATION_LANES_070422.modalLeft
    && bounds.right <= PRESENTATION_LANES_070422.modalRight
    && bounds.top >= PRESENTATION_LANES_070422.hudTopBottom
    && bounds.bottom <= PRESENTATION_LANES_070422.hudBottomTop;
}

/** Same Graphics children as the legacy cinematic, only the material changes. */
export function paintVisualFoundationNewsVf05(
  shadow: Phaser.GameObjects.Graphics,
  panel: Phaser.GameObjects.Graphics,
  bodyHeight = 120,
  footerHeight = 30,
): void {
  const n = NEWS_SHEET_VF05;
  const left = -n.width / 2;
  const top = -n.height / 2;
  const height = 132 + bodyHeight + footerHeight;
  // CH-17.4: lifted paper-card depth, still inside the exact VF-05 owner.
  shadow.clear();
  shadow.fillStyle(n.cocoa, 0.24);
  shadow.fillRoundedRect(left - 5, top + 6, n.width + 10, height + 4, n.radius + 3);
  shadow.setPosition(0, 8);

  panel.clear();
  panel.fillStyle(n.cream, 0.998);
  panel.fillRoundedRect(left, top, n.width, height, n.radius);

  // Mint masthead + small paper highlight makes News read like a town notice board.
  panel.fillStyle(n.mint, 1);
  panel.fillRoundedRect(left + 3, top + 3, n.width - 6, 52,
    { tl: n.radius - 2, tr: n.radius - 2, bl: 11, br: 11 });
  panel.fillStyle(0xffffff, 0.48);
  panel.fillRoundedRect(left + 15, top + 9, n.width - 30, 10, 5);

  // Quiet inset body sheet for Vietnamese copy.
  panel.fillStyle(0xf3f5e9, 0.99);
  panel.fillRoundedRect(left + 17, -33, n.width - 34, bodyHeight + 30, 17);
  panel.lineStyle(2, n.cocoa, 0.12);
  panel.strokeRoundedRect(left + 17, -33, n.width - 34, bodyHeight + 30, 17);

  // Sticker well for impact icon + two tiny notice-board pins.
  panel.fillStyle(0xfff0bc, 1);
  panel.fillCircle(292, -98, 31);
  panel.lineStyle(3, n.cocoa, 0.62);
  panel.strokeCircle(292, -98, 31);
  panel.fillStyle(0xff8f86, 0.92);
  panel.fillCircle(left + 30, top + 27, 5);
  panel.fillStyle(0xffd86b, 0.95);
  panel.fillCircle(left + 47, top + 27, 5);

  panel.lineStyle(4, n.cocoa, 1);
  panel.strokeRoundedRect(left + 2, top + 2, n.width - 4, height - 4, n.radius - 2);
}
