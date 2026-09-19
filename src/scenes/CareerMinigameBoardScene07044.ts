import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import {
  MOBILE_UI_FONT_07044,
  isCompactLandscape07044,
} from '../ui/mobileReadability07044';
import { CareerMinigameBoardScene0701 } from './CareerMinigameBoardScene0701';

const BOARD_07044 = boardJson as BoardDefinition;
const NODE_POSITIONS_07044 = new Set(
  BOARD_07044.nodes.map((node) => `${Math.round(node.x)}:${Math.round(node.y)}`),
);

type Hud07044 = {
  root: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

type Presentation07044 = {
  active?: Phaser.GameObjects.Container;
  isBlocking(): boolean;
};

type Runtime07044 = {
  match: MatchState;
  hud: Map<number, Hud07044>;
  turnStatus?: Phaser.GameObjects.Text;
  overviewButton?: Phaser.GameObjects.Text;
  compactCard?: Phaser.GameObjects.Rectangle;
  compactCardText?: Phaser.GameObjects.Text;
  compactCardSkin0701?: Phaser.GameObjects.Graphics;
  directDice?: Phaser.GameObjects.Container;
  presentation?: Presentation07044;
  currentPlayer(): PlayerState | undefined;
};

/**
 * 0.1.70.4.4 — Mobile UI Readability.
 *
 * Presentation-only wrapper. It deliberately does not submit intents, mutate the
 * match, touch RNG, reconnect ownership, WebRTC signaling or Host authority.
 * The goal is to stop rendering a desktop-sized 1280x720 HUD with 9–12px text
 * and then shrinking it into ant-sized copy on a phone.
 */
const HUD_SAFE_MARGIN_07046 = 12;
const HUD_BASE_WIDTH_07046 = 252;
const HUD_BASE_HEIGHT_07046 = 92;
const ACTIVE_HUD_SCALE_07046 = 1.18;
const IDLE_HUD_SCALE_07046 = 0.96;

export class CareerMinigameBoardScene07044 extends CareerMinigameBoardScene0701 {
  private compactLandscape07044 = false;

  create(): void {
    super.create();
    this.compactLandscape07044 = isCompactLandscape07044();
    this.refreshBuildLabels07044();
    if (this.compactLandscape07044) this.applyMobileLandscapeUi07044();
  }

  update(): void {
    super.update();
    this.refreshBuildLabels07044();
    if (this.compactLandscape07044) this.syncMobileLandscapeUi07044();
  }

  private runtime07044(): Runtime07044 {
    return this as unknown as Runtime07044;
  }

  private applyMobileLandscapeUi07044(): void {
    const runtime = this.runtime07044();

    runtime.turnStatus
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(18)
      .setPadding(12, 7, 12, 7);

    runtime.overviewButton
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(18)
      .setPadding(14, 8, 14, 8);

    runtime.compactCard?.setDisplaySize(190, 52);
    runtime.compactCardText
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(18);

    this.visitDisplayTree07044(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;

      const key = `${Math.round(object.x)}:${Math.round(object.y)}`;
      if (NODE_POSITIONS_07044.has(key) && object.depth <= 10) {
        object
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(object.text.includes('\n') ? 16 : 17)
          .setLineSpacing(1);
      }

      if (object.text === 'BẤM XÚC XẮC') {
        object
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(19)
          .setPadding(15, 8, 15, 8);
      }
    });

    this.syncMobileLandscapeUi07044();
  }

  private syncMobileLandscapeUi07044(): void {
    const runtime = this.runtime07044();
    const currentId = runtime.currentPlayer()?.id;

    for (const player of runtime.match.players) {
      const ui = runtime.hud.get(player.id);
      if (!ui) continue;

      const active = player.id === currentId;
      const scale = active ? ACTIVE_HUD_SCALE_07046 : IDLE_HUD_SCALE_07046;
      ui.root.setScale(scale);

      const halfWidth = HUD_BASE_WIDTH_07046 * scale * 0.5;
      const halfHeight = HUD_BASE_HEIGHT_07046 * scale * 0.5;
      ui.root.x = Phaser.Math.Clamp(
        ui.root.x,
        HUD_SAFE_MARGIN_07046 + halfWidth,
        1280 - HUD_SAFE_MARGIN_07046 - halfWidth,
      );
      ui.root.y = Phaser.Math.Clamp(
        ui.root.y,
        HUD_SAFE_MARGIN_07046 + halfHeight,
        720 - HUD_SAFE_MARGIN_07046 - halfHeight,
      );

      ui.name
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setFontSize(active ? 21 : 18)
        .setFixedSize(184, 26);

      ui.money
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setFontSize(active ? 23 : 20)
        .setFixedSize(184, 27);

      for (const child of ui.root.list) {
        if (!(child instanceof Phaser.GameObjects.Text)) continue;
        if (child === ui.name || child === ui.money || child === ui.meta || !child.visible) continue;
        child
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(active ? 15 : 14)
          .setFixedSize(184, 23);
      }
    }

    runtime.turnStatus
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(18);
    runtime.overviewButton
      ?.setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(18);

    const card = runtime.compactCard;
    const cardText = runtime.compactCardText;
    const skin = runtime.compactCardSkin0701;
    if (card && cardText && skin) {
      card.setDisplaySize(190, 52);
      cardText.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(18);
      const visible = card.visible && cardText.visible;
      skin.setVisible(visible);
      if (visible) {
        const player = runtime.currentPlayer();
        const canUse = runtime.match.turn.phase === 'PRE_ROLL_ACTION'
          && Boolean(player && player.handCardIds.length > 0);
        skin.clear();
        skin.fillStyle(canUse ? 0xb997d6 : 0xd8d2c7, 1);
        skin.fillRoundedRect(card.x - 95, card.y - 26, 190, 52, 19);
        skin.lineStyle(4, 0x242424, 1);
        skin.strokeRoundedRect(card.x - 95, card.y - 26, 190, 52, 19);
      }
    }

    const dice = runtime.directDice;
    if (dice) {
      for (const child of dice.list) {
        if (!(child instanceof Phaser.GameObjects.Text) || child.text !== 'BẤM XÚC XẮC') continue;
        child
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(19)
          .setPadding(15, 8, 15, 8);
      }
    }

    if (runtime.presentation?.isBlocking() && runtime.presentation.active) {
      this.visitDisplayTree07044(runtime.presentation.active.list, (object) => {
        if (!(object instanceof Phaser.GameObjects.Text)) return;
        object.setFontFamily(MOBILE_UI_FONT_07044);
      });
    }
  }

  private refreshBuildLabels07044(): void {
    this.visitDisplayTree07044(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;

      const copy = object.text.trim().toUpperCase();
      const legacyTopChrome =
        object.text.startsWith('CITY • MVP 0.1.')
        || (object.text.startsWith('PLAYTEST 0.1.') && object.text.includes('•'))
        || copy.includes('TỔNG QUAN')
        || copy.includes('CHUNG KẾT')
        || copy.startsWith('LƯỢT:');

      if (!legacyTopChrome) return;
      object.setVisible(false);
      if (object.input?.enabled) object.disableInteractive();
    });
  }

  private visitDisplayTree07044(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree07044(object.list, visit);
      }
    }
  }
}
