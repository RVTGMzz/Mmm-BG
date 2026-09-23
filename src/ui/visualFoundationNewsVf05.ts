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
): void {
  const n = NEWS_SHEET_VF05;
  const left = -n.width / 2;
  const top = -n.height / 2;
  shadow.clear();
  shadow.fillStyle(n.cocoa, 0.18);
  shadow.fillRoundedRect(left - 4, top + 3, n.width + 8, n.height + 3, n.radius + 2);
  shadow.setPosition(0, 7);
  panel.clear();
  panel.fillStyle(n.cream, 0.995);
  panel.fillRoundedRect(left, top, n.width, n.height, n.radius);
  // Icon-first pastel header and a quiet paper inset for long descriptions.
  panel.fillStyle(n.mint, 1);
  panel.fillRoundedRect(left + 3, top + 3, n.width - 6, 46,
    { tl: n.radius - 2, tr: n.radius - 2, bl: 9, br: 9 });
  panel.fillStyle(0xf3f5e9, 0.97);
  panel.fillRoundedRect(left + 17, -33, n.width - 34, 150, 15);
  // Keep the event's emoji in a distinct sticker well.
  panel.fillStyle(0xfff6dc, 1);
  panel.fillCircle(292, -98, 29);
  panel.lineStyle(2, n.cocoa, 0.6);
  panel.strokeCircle(292, -98, 29);
  panel.lineStyle(3, n.cocoa, 1);
  panel.strokeRoundedRect(left + 2, top + 2, n.width - 4, n.height - 4, n.radius - 2);
}
