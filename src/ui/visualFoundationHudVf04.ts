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
});

export const HUD_PLAYER_ACCENTS_VF04 = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b] as const;

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
): void {
  const c = HUD_SKIN_VF04;
  const accent = HUD_PLAYER_ACCENTS_VF04[playerId] ?? 0x765047;
  const halfW = c.width / 2;
  const halfH = c.height / 2;
  const stroke = active ? 5 : 3;
  graphics.clear();

  // Single soft cast shadow and a subtle upper edge, no competing outer rings.
  graphics.fillStyle(0x4a302a, active ? 0.20 : 0.11);
  graphics.fillRoundedRect(-halfW + 3, -halfH + 6, c.width - 6, c.height - 3, c.radius);
  graphics.fillStyle(0xfffaf1, active ? 1 : 0.96);
  graphics.fillRoundedRect(-halfW, -halfH, c.width, c.height, c.radius);
  graphics.fillStyle(0xffffff, active ? 0.64 : 0.45);
  graphics.fillRoundedRect(-halfW + 8, -halfH + 7, c.width - 16, 25, 14);
  graphics.fillStyle(accent, active ? 1 : 0.86);
  graphics.fillRoundedRect(-halfW + 11, -halfH + 6, c.width - 22, 5, 3);
  graphics.lineStyle(stroke, active ? 0xffd86b : accent, 1);
  graphics.strokeRoundedRect(-halfW, -halfH, c.width, c.height, c.radius);

  // Sticker frame remains behind the original user photo/avatar, not over it.
  graphics.fillStyle(0x4a302a, 0.16);
  graphics.fillRoundedRect(-131, -33, c.avatarFrameWidth + 2, c.avatarFrameHeight + 2, 19);
  graphics.fillStyle(0xfffdf8, 1);
  graphics.fillRoundedRect(-130, -35, c.avatarFrameWidth, c.avatarFrameHeight, 18);
  graphics.lineStyle(active ? 4 : 3, accent, 1);
  graphics.strokeRoundedRect(-130, -35, c.avatarFrameWidth, c.avatarFrameHeight, 18);

  // Shape + label (▶ in player name) communicates the current player beyond colour.
  if (active) {
    graphics.fillStyle(0xffd86b, 1);
    graphics.fillCircle(116, -38, 6);
    graphics.lineStyle(2, 0x4a302a, 0.95);
    graphics.strokeCircle(116, -38, 6);
  }
}
