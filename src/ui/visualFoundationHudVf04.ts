import type Phaser from 'phaser';

/** VF-04: one card geometry for drawing, four-corner clamp and layout tests. */
export const HUD_SKIN_VF04 = Object.freeze({
  width: 268,
  height: 104,
  radius: 23,
  avatarX: -96,
  avatarFrameWidth: 68,
  avatarFrameHeight: 68,
  safeMargin: 12,
  activeScaleMobile: 1.18,
  idleScaleMobile: 0.96,
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  activeRingInset: 2,
  identityRingInset: 9,
  turnGold: 0xffd86b,
  activeRingWidth: 4,
  identityRingWidth: 2,
});

export const HUD_PLAYER_ACCENTS_VF04 = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b] as const;

/** Colour is player identity. Gold is transient turn state, never a replacement identity. */
export function hudFramePaletteVf041(playerId: number, active: boolean): {
  identity: number;
  outer: number;
  inner: number;
  showTurnMarker: boolean;
} {
  const identity = HUD_PLAYER_ACCENTS_VF04[playerId] ?? 0x765047;
  return { identity, outer: active ? HUD_SKIN_VF04.turnGold : identity,
    inner: identity, showTurnMarker: active };
}

export interface HudCareerCopyVf04 {
  employed: boolean;
  icon: string;
  title: string;
  level: number;
  salary: number;
}
export interface HudCompactCopyVf04 {
  line1: string;
  line2: string;
}

/** Presentation-only copy: short lines fit the physical HUD; full detail stays elsewhere. */
export function compactHudCopyVf04(
  career: HudCareerCopyVf04,
  active: boolean,
  handCount: number,
  lockTurns: number,
): HudCompactCopyVf04 {
  const title = Array.from(career.title);
  const limit = active ? 14 : 20;
  const shortTitle = title.length > limit ? title.slice(0, limit - 1).join('') + '…' : career.title;
  const line1 = career.employed
    ? `${career.icon} ${shortTitle}${active ? ` Lv.${career.level}` : ''}`
    : '💼 Chưa có nghề';
  const line2 = active
    ? `💰 ${career.salary} B$/vòng • ${lockTurns > 0 ? `🔒${lockTurns}` : `🃏${handCount}`}`
    : '';
  return { line1, line2 };
}

export function compactHudPlayerNameVf04(playerId: number, name: string, active: boolean): string {
  const glyphs = Array.from(name.trim());
  const limit = active ? 13 : 15;
  const shortName = glyphs.length > limit ? glyphs.slice(0, limit - 1).join('') + '…' : name.trim();
  return `${active ? '▶ ' : ''}P${playerId + 1} • ${shortName}`;
}

/** Clamp based on the ACTUAL painted dimensions, not the smaller legacy hitbox. */
export function clampHudCenterVf04(
  x: number,
  y: number,
  scale: number,
  viewportWidth = 1280,
  viewportHeight = 720,
  margin = HUD_SKIN_VF04.safeMargin,
): { x: number; y: number } {
  const halfWidth = HUD_SKIN_VF04.width * scale / 2;
  const halfHeight = HUD_SKIN_VF04.height * scale / 2;
  return {
    x: Math.max(margin + halfWidth, Math.min(viewportWidth - margin - halfWidth, x)),
    y: Math.max(margin + halfHeight, Math.min(viewportHeight - margin - halfHeight, y)),
  };
}

/**
 * Reuse this exact paint pass for all four existing corner HUDs.
 * The original photo/face, money and hitbox are preserved above this graphic.
 */
export function drawVisualFoundationHudVf04(
  graphics: Phaser.GameObjects.Graphics,
  playerId: number,
  active: boolean,
  turnEntryStrength = 0,
): void {
  const c = HUD_SKIN_VF04;
  const palette = hudFramePaletteVf041(playerId, active);
  const accent = palette.identity;
  const halfW = c.width / 2;
  const halfH = c.height / 2;
  graphics.clear();

  // CH-17.3 cozy sticker card: cocoa depth, warm paper and a player-colour tab.
  graphics.fillStyle(0x4b302a, active ? 0.22 : 0.15);
  graphics.fillRoundedRect(-halfW + 5, -halfH + 7, c.width - 10, c.height - 10, c.radius);
  graphics.fillStyle(0xfff7e8, active ? 1 : 0.97);
  graphics.fillRoundedRect(-halfW, -halfH, c.width, c.height, c.radius);
  graphics.fillStyle(0xffffff, active ? 0.72 : 0.52);
  graphics.fillRoundedRect(-halfW + 8, -halfH + 7, c.width - 16, 21, 13);

  // Short coloured nameplate tab keeps seat identity visible without painting the whole card.
  graphics.fillStyle(accent, 1);
  graphics.fillRoundedRect(-halfW + 68, -halfH + 5, 124, 10, 5);
  graphics.lineStyle(2, 0x4b302a, 0.26);
  graphics.lineBetween(-halfW + 68, -halfH + 17, -halfW + 68 + 124, -halfH + 17);

  // Dedicated money and career/material lanes. Text ownership remains inherited.
  graphics.fillStyle(0xffe8a6, active ? 0.98 : 0.88);
  graphics.fillRoundedRect(-62, -13, 118, 25, 13);
  graphics.lineStyle(2, 0x4b302a, 0.25);
  graphics.strokeRoundedRect(-62, -13, 118, 25, 13);

  graphics.fillStyle(0xf2e2cf, active ? 0.98 : 0.90);
  graphics.fillRoundedRect(-62, 14, 184, 31, 14);
  graphics.lineStyle(2, 0x4b302a, 0.16);
  graphics.strokeRoundedRect(-62, 14, 184, 31, 14);

  if (active) {
    // Two distinct jobs: gold OUTER turn indicator, coloured INNER seat identity.
    // Separated by a real cream gutter, never a stacked five-pixel gold/blue band.
    const outer = c.activeRingInset;
    const inner = c.identityRingInset;
    graphics.lineStyle(c.activeRingWidth, palette.outer, 0.96);
    graphics.strokeRoundedRect(
      -halfW + outer, -halfH + outer, c.width - outer * 2, c.height - outer * 2, c.radius - outer,
    );
    graphics.lineStyle(c.identityRingWidth, palette.inner, 0.94);
    graphics.strokeRoundedRect(
      -halfW + inner, -halfH + inner, c.width - inner * 2, c.height - inner * 2, c.radius - inner,
    );
  } else {
    const rim = c.activeRingInset + 1;
    graphics.lineStyle(3, palette.outer, 0.86);
    graphics.strokeRoundedRect(
      -halfW + rim, -halfH + rim, c.width - rim * 2, c.height - rim * 2, c.radius - rim,
    );
  }

  // Sticker frame remains behind the original user photo/avatar, not over it.
  graphics.fillStyle(0x4a302a, 0.16);
  graphics.fillRoundedRect(-131, -33, c.avatarFrameWidth + 2, c.avatarFrameHeight + 2, 19);
  graphics.fillStyle(0xfffdf8, 1);
  graphics.fillRoundedRect(-130, -35, c.avatarFrameWidth, c.avatarFrameHeight, 18);
  graphics.lineStyle(active ? 4 : 3, accent, 1);
  graphics.strokeRoundedRect(-130, -35, c.avatarFrameWidth, c.avatarFrameHeight, 18);

  // Active turn uses a toy-like ribbon tab in addition to the text ▶ marker.
  if (palette.showTurnMarker) {
    const pop = Math.max(0, Math.min(1, turnEntryStrength));
    const tabLift = 2 * pop;
    graphics.fillStyle(0xc99a36, 1);
    graphics.fillRoundedRect(82, -49 - tabLift, 45, 24, 10);
    graphics.fillStyle(c.turnGold, 1);
    graphics.fillRoundedRect(80, -52 - tabLift, 45, 24, 10);
    graphics.lineStyle(2, 0x4b302a, 0.92);
    graphics.strokeRoundedRect(80, -52 - tabLift, 45, 24, 10);
    graphics.fillStyle(0xffffff, 0.72);
    graphics.fillCircle(92, -43 - tabLift, 3);
    graphics.fillCircle(102, -43 - tabLift, 3);
    graphics.fillCircle(112, -43 - tabLift, 3);
  }
}
