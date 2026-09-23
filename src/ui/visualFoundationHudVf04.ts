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

  // Soft shadow stays *inside* measured 268x104 art bounds.
  graphics.fillStyle(0x4a302a, active ? 0.17 : 0.10);
  graphics.fillRoundedRect(-halfW + 4, -halfH + 6, c.width - 8, c.height - 9, c.radius);
  graphics.fillStyle(0xfffaf1, active ? 1 : 0.96);
  graphics.fillRoundedRect(-halfW, -halfH, c.width, c.height, c.radius);
  graphics.fillStyle(0xffffff, active ? 0.60 : 0.42);
  graphics.fillRoundedRect(-halfW + 8, -halfH + 7, c.width - 16, 25, 14);
  graphics.fillStyle(accent, active ? 1 : 0.86);
  graphics.fillRoundedRect(-halfW + 11, -halfH + 6, c.width - 22, 5, 3);

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

  // Shape + label (▶ in player name) communicates the current player beyond colour.
  if (palette.showTurnMarker) {
    const pop = Math.max(0, Math.min(1, turnEntryStrength));
    const markerRadius = 6 + 2 * pop;
    graphics.fillStyle(c.turnGold, 1);
    graphics.fillCircle(116, -38, markerRadius);
    graphics.lineStyle(2, 0x4a302a, 0.95);
    graphics.strokeCircle(116, -38, markerRadius);
  }
}
