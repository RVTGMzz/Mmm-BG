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
): void {
  const c = CARD_SHEET_VF051;
  const left = -c.width / 2;
  const top = -c.height / 2;

  shadow.clear();
  shadow.fillStyle(c.cocoa, 0.2);
  shadow.fillRoundedRect(left - 4, top + 3, c.width + 8, c.height + 3, c.radius + 2);
  shadow.setPosition(0, 7);

  panel.clear();
  panel.fillStyle(c.cream, 0.998);
  panel.fillRoundedRect(left, top, c.width, c.height, c.radius);

  // Kinetic sticker header.
  panel.fillStyle(c.lavender, 1);
  panel.fillRoundedRect(
    left + 3,
    top + 3,
    c.width - 6,
    48,
    { tl: c.radius - 2, tr: c.radius - 2, bl: 10, br: 10 },
  );

  // Quiet body paper so long Vietnamese copy remains readable.
  panel.fillStyle(c.lavenderSoft, 0.98);
  panel.fillRoundedRect(left + 17, -33, c.width - 34, 150, 15);

  // Small sticker tabs, visual only. Keep them inside the canonical frame.
  panel.fillStyle(c.coral, 0.96);
  panel.fillRoundedRect(left + 13, -12, 14, 54, 7);
  panel.fillStyle(c.aqua, 0.96);
  panel.fillRoundedRect(-left - 27, 26, 14, 48, 7);

  // Impact/rarity area reads as a collectible sticker well.
  panel.fillStyle(c.butter, 1);
  panel.fillCircle(292, -98, 29);
  panel.lineStyle(2, c.cocoa, 0.58);
  panel.strokeCircle(292, -98, 29);

  panel.lineStyle(3, c.cocoa, 1);
  panel.strokeRoundedRect(left + 2, top + 2, c.width - 4, c.height - 4, c.radius - 2);
}
