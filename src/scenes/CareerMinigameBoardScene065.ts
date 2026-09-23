import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import type { JobDefinition } from '../core/jobs';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { playerHudCareer065 } from '../ui/playerHud065';
import {
  compactHudCopyVf04,
  compactHudPlayerNameVf04,
  drawVisualFoundationHudVf04,
  HUD_SKIN_VF04,
} from '../ui/visualFoundationHudVf04';
import { CareerMinigameBoardScene064 } from './CareerMinigameBoardScene064';

const JOBS = jobsJson as JobDefinition[];
const PLAYER_COLORS_065 = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];
const PROXY_HITBOX_ALPHA_065 = 0.001;

type HudHandle065 = {
  root: Phaser.GameObjects.Container;
  border: Phaser.GameObjects.Rectangle;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

type SceneRuntime065 = {
  match: MatchState;
  hud: Map<number, HudHandle065>;
  currentPlayer(): PlayerState | undefined;
};

type RoundedRectHandle065 = {
  graphic: Phaser.GameObjects.Graphics;
  visualAlpha: number;
};

type RoundedTextHandle065 = {
  graphic: Phaser.GameObjects.Graphics;
  color: number;
  fillAlpha: number;
};

/**
 * 0.1.65 presentation-only polish from human runtime feedback.
 *
 * - Player/CPU cards show the authoritative Job title, level and salary instead of
 *   the vague "Có việc / Chưa việc" label.
 * - Rectangular UI panels/buttons and Text background badges are visually replaced
 *   by rounded equivalents while original interactive objects keep their hit areas.
 * - The red PLAYTEST/debug footer is hidden from normal gameplay.
 *
 * Gameplay, RNG, camera, economy and authority remain inherited from 0.1.64.
 */
export class CareerMinigameBoardScene065 extends CareerMinigameBoardScene064 {
  private readonly hudBackings065 = new Map<number, Phaser.GameObjects.Graphics>();
  private readonly hudBorders065 = new Set<Phaser.GameObjects.Rectangle>();
  private readonly roundedRects065 = new Map<Phaser.GameObjects.Rectangle, RoundedRectHandle065>();
  private readonly roundedTexts065 = new Map<Phaser.GameObjects.Text, RoundedTextHandle065>();

  create(): void {
    super.create();
    this.installRoundedHud065();
    this.syncCareerHud065();
    this.polishUiTree065();
    this.updateBuildLabels065();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.destroyRoundedProxies065();
      this.hudBackings065.clear();
      this.hudBorders065.clear();
    });
  }

  update(): void {
    super.update();
    this.syncCareerHud065();
    this.polishUiTree065();
    this.syncRoundedRectVisuals065();
    this.syncRoundedTextVisuals065();
  }

  private runtime065(): SceneRuntime065 {
    return this as unknown as SceneRuntime065;
  }

  private installRoundedHud065(): void {
    const runtime = this.runtime065();
    for (const [playerId, ui] of runtime.hud) {
      this.hudBorders065.add(ui.border);
      ui.border.setAlpha(PROXY_HITBOX_ALPHA_065);

      const panel = this.add.graphics();
      const parent = ui.root;
      const borderIndex = Math.max(0, parent.getIndex(ui.border));
      parent.addAt(panel, borderIndex);
      this.hudBackings065.set(playerId, panel);

      // Two readable career rows need a little more breathing room than the old
      // one-line metadata string.
      ui.meta
        .setPosition(-58, 13)
        .setFontFamily(HUD_SKIN_VF04.fontFamily)
        .setFontSize(12)
        .setLineSpacing(2)
        .setFixedSize(182, 34)
        .setOrigin(0, 0);
    }
    this.redrawHudBackings065();
  }

  private syncCareerHud065(): void {
    const runtime = this.runtime065();
    const current = runtime.currentPlayer();
    if (!current) return;

    for (const player of runtime.match.players) {
      const ui = runtime.hud.get(player.id);
      if (!ui) continue;
      const active = player.id === current.id;
      const career = playerHudCareer065(player, JOBS);
      const copy = compactHudCopyVf04(career, active, player.handCardIds.length, player.cardBlockTurns);
      ui.name
        .setText(compactHudPlayerNameVf04(player.id, player.name, active))
        .setFontFamily(HUD_SKIN_VF04.fontFamily)
        .setFontSize(active ? 17 : 16);
      ui.money
        .setFontFamily(HUD_SKIN_VF04.fontFamily)
        .setFontSize(active ? 18 : 17);
      ui.meta
        .setFontFamily(HUD_SKIN_VF04.fontFamily)
        .setFontSize(active ? 11 : 12)
        .setText(copy.line2 ? `${copy.line1}\n${copy.line2}` : copy.line1);
    }

    this.redrawHudBackings065();
  }

  private redrawHudBackings065(): void {
    const runtime = this.runtime065();
    const currentId = runtime.currentPlayer()?.id;
    for (const [playerId, graphic] of this.hudBackings065) {
      drawVisualFoundationHudVf04(graphic, playerId, playerId === currentId);
    }
  }

  private polishUiTree065(): void {
    this.visitDisplayTree065(this.children.list, (object) => {
      if (object instanceof Phaser.GameObjects.Text) {
        const text = object.text.trim();
        if (text.startsWith('PLAYTEST ') || text.includes('LOCAL MATCH TELEMETRY')) {
          object.setVisible(false);
          return;
        }
        if (text.startsWith('CITY • MVP 0.1.')) {
          object.setText('CITY • MVP 0.1.65 • JOB HUD + ROUNDED UI');
        }
        if (!this.roundedTexts065.has(object) && this.isUiTextBackground065(object)) {
          this.registerRoundedTextBackground065(object);
        }
        return;
      }

      if (!(object instanceof Phaser.GameObjects.Rectangle)) return;
      if (this.hudBorders065.has(object)) return;
      if (this.roundedRects065.has(object)) return;
      if (!this.isUiRectangle065(object)) return;
      this.registerRoundedRectangle065(object);
    });
  }

  private isUiObject065(object: Phaser.GameObjects.GameObject & { depth: number; parentContainer?: Phaser.GameObjects.Container | null }): boolean {
    if (object.depth >= 500) return true;
    let parent = object.parentContainer ?? null;
    while (parent) {
      if (parent.depth >= 500) return true;
      parent = parent.parentContainer;
    }
    return false;
  }

  private isUiRectangle065(rectangle: Phaser.GameObjects.Rectangle): boolean {
    if (rectangle.fillAlpha <= 0.01) return false;
    // Full-screen dimmers intentionally remain edge-to-edge; rounding them would
    // expose bright corners and is not a visible "panel" to the player.
    if (rectangle.width >= 1200 && rectangle.height >= 680) return false;
    return this.isUiObject065(rectangle);
  }

  private isUiTextBackground065(text: Phaser.GameObjects.Text): boolean {
    const background = text.style.backgroundColor;
    if (!background || background === 'transparent' || background === 'rgba(0,0,0,0)') return false;
    return this.isUiObject065(text);
  }

  private registerRoundedRectangle065(rectangle: Phaser.GameObjects.Rectangle): void {
    const visualAlpha = rectangle.alpha;
    const graphic = this.add.graphics();
    graphic.setPosition(rectangle.x, rectangle.y);
    graphic.setScale(rectangle.scaleX, rectangle.scaleY);
    graphic.setAngle(rectangle.angle);

    const parent = rectangle.parentContainer;
    if (parent) {
      const index = Math.max(0, parent.getIndex(rectangle));
      parent.addAt(graphic, index);
    } else {
      graphic.setDepth(rectangle.depth - 0.01);
    }

    // Keep the original Rectangle alive and interactive. Hover/click handlers still
    // mutate its fill/stroke state; the rounded visual mirrors that state every frame.
    rectangle.setAlpha(PROXY_HITBOX_ALPHA_065);
    this.roundedRects065.set(rectangle, { graphic, visualAlpha });
    this.redrawRoundedRectangle065(rectangle, graphic, visualAlpha);
  }

  private registerRoundedTextBackground065(text: Phaser.GameObjects.Text): void {
    const originalBackground = text.style.backgroundColor;
    if (!originalBackground) return;
    const parsed = Phaser.Display.Color.ValueToColor(originalBackground);
    const graphic = this.add.graphics();
    const parent = text.parentContainer;
    if (parent) {
      const index = Math.max(0, parent.getIndex(text));
      parent.addAt(graphic, index);
    } else {
      graphic.setDepth(text.depth - 0.01);
    }

    // Phaser Text backgrounds are square-cornered. Make the built-in background
    // transparent and keep the text itself untouched over a rounded backing.
    text.setBackgroundColor('rgba(0,0,0,0)');
    this.roundedTexts065.set(text, {
      graphic,
      color: parsed.color,
      fillAlpha: parsed.alpha / 255,
    });
    this.redrawRoundedTextBackground065(text, graphic, parsed.color, parsed.alpha / 255);
  }

  private syncRoundedRectVisuals065(): void {
    for (const [rectangle, handle] of [...this.roundedRects065]) {
      if (!rectangle.active) {
        if (handle.graphic.active) handle.graphic.destroy();
        this.roundedRects065.delete(rectangle);
        continue;
      }
      if (!handle.graphic.active) {
        this.roundedRects065.delete(rectangle);
        continue;
      }

      // The source Rectangle is normally held at a near-transparent alpha only to
      // preserve its hitbox. If the owner later fades/hides that source, capture the
      // new visual alpha instead of leaving a rounded proxy frozen on the board.
      if (Math.abs(rectangle.alpha - PROXY_HITBOX_ALPHA_065) > 0.0001) {
        handle.visualAlpha = rectangle.alpha;
        if (rectangle.alpha > 0.01) rectangle.setAlpha(PROXY_HITBOX_ALPHA_065);
      }

      this.redrawRoundedRectangle065(rectangle, handle.graphic, handle.visualAlpha);
    }
  }

  private syncRoundedTextVisuals065(): void {
    for (const [text, handle] of [...this.roundedTexts065]) {
      if (!text.active) {
        if (handle.graphic.active) handle.graphic.destroy();
        this.roundedTexts065.delete(text);
        continue;
      }
      if (!handle.graphic.active) {
        this.roundedTexts065.delete(text);
        continue;
      }
      this.redrawRoundedTextBackground065(text, handle.graphic, handle.color, handle.fillAlpha);
    }
  }

  private redrawRoundedRectangle065(
    rectangle: Phaser.GameObjects.Rectangle,
    graphic: Phaser.GameObjects.Graphics,
    visualAlpha: number,
  ): void {
    const halfW = rectangle.width * rectangle.originX;
    const halfH = rectangle.height * rectangle.originY;
    const left = -halfW;
    const top = -halfH;
    const radius = Math.max(8, Math.min(24, rectangle.height * 0.18, rectangle.width * 0.12));

    graphic
      .setVisible(rectangle.visible && visualAlpha > 0.01)
      .setAlpha(visualAlpha)
      .setPosition(rectangle.x, rectangle.y)
      .setScale(rectangle.scaleX, rectangle.scaleY)
      .setAngle(rectangle.angle);
    graphic.clear();
    if (rectangle.fillAlpha > 0) {
      graphic.fillStyle(rectangle.fillColor, rectangle.fillAlpha);
      graphic.fillRoundedRect(left, top, rectangle.width, rectangle.height, radius);
    }
    if (rectangle.lineWidth > 0 && rectangle.strokeAlpha > 0) {
      graphic.lineStyle(rectangle.lineWidth, rectangle.strokeColor, rectangle.strokeAlpha);
      graphic.strokeRoundedRect(left, top, rectangle.width, rectangle.height, radius);
    }
  }

  private redrawRoundedTextBackground065(
    text: Phaser.GameObjects.Text,
    graphic: Phaser.GameObjects.Graphics,
    color: number,
    fillAlpha: number,
  ): void {
    const width = text.width;
    const height = text.height;
    const left = -width * text.originX;
    const top = -height * text.originY;
    const radius = Math.max(7, Math.min(16, height * 0.28, width * 0.1));

    graphic
      .setVisible(text.visible && text.alpha > 0.01)
      .setAlpha(text.alpha)
      .setPosition(text.x, text.y)
      .setScale(text.scaleX, text.scaleY)
      .setAngle(text.angle);
    graphic.clear();
    graphic.fillStyle(color, fillAlpha);
    graphic.fillRoundedRect(left, top, width, height, radius);
  }

  private destroyRoundedProxies065(): void {
    for (const handle of this.roundedRects065.values()) {
      if (handle.graphic.active) handle.graphic.destroy();
    }
    for (const handle of this.roundedTexts065.values()) {
      if (handle.graphic.active) handle.graphic.destroy();
    }
    this.roundedRects065.clear();
    this.roundedTexts065.clear();
  }

  private updateBuildLabels065(): void {
    this.polishUiTree065();
  }

  private visitDisplayTree065(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree065(object.list, visit);
      }
    }
  }
}
