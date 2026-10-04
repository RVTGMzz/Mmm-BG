import type Phaser from 'phaser';
import { PRESENTATION_LANES_070422 } from './presentationLanes070422';

/**
 * VF-05.1 canonical LÁ BÀI skin.
 *
 * Card keeps the same canonical owner/bounds as News, but shifts the material
 * language toward sticker/cutout energy: warm cream base, lavender header,
 * cocoa outline and small candy accents. No new gameplay or overlay owner.
 */
export const CARD_SHEET_VF051 = Object.freeze({
  centerX: 640,
  centerY: 330,
  width: 720,
  height: 300,
  radius: 22,
  bodyWidth: 628,
  bodyMaxHeight: 138,
  titleWidth: 540,
  titleMaxHeight: 54,
  cream: 0xfff8ea,
  lavender: 0xb9a6e8,
  lavenderSoft: 0xf4eefb,
  butter: 0xffd86b,
  coral: 0xff8f86,
  aqua: 0x77d9e7,
  cocoa: 0x4a302a,
  copy: 0x59463d,
});

export function cardSheetBoundsVf051(): {
  left: number; right: number; top: number; bottom: number;
} {
  const c = CARD_SHEET_VF051;
  return {
    left: c.centerX - c.width / 2,
    right: c.centerX + c.width / 2,
    top: c.centerY - c.height / 2,
    bottom: c.centerY + c.height / 2,
  };
}

export function cardSheetFitsVf051(): boolean {
  const bounds = cardSheetBoundsVf051();
  return bounds.left >= PRESENTATION_LANES_070422.modalLeft
    && bounds.right <= PRESENTATION_LANES_070422.modalRight
    && bounds.top >= PRESENTATION_LANES_070422.hudTopBottom
    && bounds.bottom <= PRESENTATION_LANES_070422.hudBottomTop;
}

/**
 * Paint inside the existing canonical Card container only.
 * Keep the exact geometry used by .22 presentation ownership/reaction lanes.
 */
export function paintVisualFoundationCardVf051(
  shadow: Phaser.GameObjects.Graphics,
  panel: Phaser.GameObjects.Graphics,
  bodyHeight = 120,
  footerHeight = 30,
): void {
  const c = CARD_SHEET_VF051;
  const left = -c.width / 2;
  const top = -c.height / 2;
  const height = 132 + bodyHeight + footerHeight;

  shadow.clear();
  shadow.fillStyle(c.cocoa, 0.24);
  shadow.fillRoundedRect(left - 5, top + 6, c.width + 10, height + 4, c.radius + 3);
  shadow.setPosition(0, 8);

  panel.clear();
  panel.fillStyle(c.cream, 0.998);
  panel.fillRoundedRect(left, top, c.width, height, c.radius);

  // CH-17.4 collectible-card header with glossy sticker highlight.
  panel.fillStyle(c.lavender, 1);
  panel.fillRoundedRect(
    left + 3,
    top + 3,
    c.width - 6,
    54,
    { tl: c.radius - 2, tr: c.radius - 2, bl: 11, br: 11 },
  );
  panel.fillStyle(0xffffff, 0.46);
  panel.fillRoundedRect(left + 15, top + 9, c.width - 30, 10, 5);

  // Quiet inset body paper so long Vietnamese copy stays the visual priority.
  panel.fillStyle(c.lavenderSoft, 0.995);
  panel.fillRoundedRect(left + 17, -33, c.width - 34, bodyHeight + 30, 17);
  panel.lineStyle(2, c.cocoa, 0.12);
  panel.strokeRoundedRect(left + 17, -33, c.width - 34, bodyHeight + 30, 17);

  // Candy sticker tabs, visual only.
  panel.fillStyle(c.coral, 0.98);
  panel.fillRoundedRect(left + 13, -12, 14, Math.min(58, bodyHeight - 6), 7);
  panel.fillStyle(c.aqua, 0.98);
  panel.fillRoundedRect(-left - 27, -5, 14, Math.min(52, bodyHeight - 6), 7);

  // Impact/rarity icon becomes a chunky collectible badge.
  panel.fillStyle(0xd49b32, 0.22);
  panel.fillCircle(294, -95, 33);
  panel.fillStyle(c.butter, 1);
  panel.fillCircle(292, -99, 31);
  panel.lineStyle(3, c.cocoa, 0.62);
  panel.strokeCircle(292, -99, 31);

  panel.lineStyle(4, c.cocoa, 1);
  panel.strokeRoundedRect(left + 2, top + 2, c.width - 4, height - 4, c.radius - 2);
}
