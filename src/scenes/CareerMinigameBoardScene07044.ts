import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { PresentationEventModel } from '../ui/presentationModel';
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
  currentModel?: PresentationEventModel;
  isBlocking(): boolean;
  showLanding(model: PresentationEventModel): void;
  showCinematic(model: PresentationEventModel): void;
  finishCurrent(animate?: boolean): void;
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
    this.installCanonicalJobPresentation070411();
    this.installFinalCardLayout070412();
    this.compactLandscape07044 = isCompactLandscape07044();
    this.refreshBuildLabels07044();
    if (this.compactLandscape07044) this.applyMobileLandscapeUi07044();
  }

  update(): void {
    super.update();
    this.retireLegacyPresentationOverlays070414();
    this.refreshBuildLabels07044();
    if (this.compactLandscape07044) this.syncMobileLandscapeUi07044();
  }

  private runtime07044(): Runtime07044 {
    return this as unknown as Runtime07044;
  }

  /**
   * 0.1.70.4.11: one renderer owns every Job landing card.
   *
   * This wrapper is installed after every inherited showLanding wrapper. Job models
   * intentionally do NOT call the legacy chain, so 0.1.63/0.1.67/0.1.68/0.1.68.1
   * can no longer scale, rewrite, hide or restore pieces of the same Job card.
   */
  private installCanonicalJobPresentation070411(): void {
    const presentation = this.runtime07044().presentation;
    if (!presentation) return;
    const originalShowLanding = presentation.showLanding.bind(presentation);

    presentation.showLanding = (model: PresentationEventModel) => {
      if (model.tileType !== 'job') {
        originalShowLanding(model);
        return;
      }
      this.showCanonicalJobLanding070411(presentation, model);
    };
  }

  /**
   * 0.1.70.4.12: card text must remain inside its cinematic panel after every
   * inherited presentation wrapper has run. 0.1.63 scales child transforms for
   * generic cinematics; later card layouts inherited those transformed positions.
   * Normalize only Card-family roots here, at the final active scene.
   */
  private installFinalCardLayout070412(): void {
    const presentation = this.runtime07044().presentation;
    if (!presentation) return;

    const originalShowCinematic = (presentation as Presentation07044 & {
      showCinematic?: (model: PresentationEventModel) => void;
    }).showCinematic?.bind(presentation);
    if (!originalShowCinematic) return;

    (presentation as Presentation07044 & {
      showCinematic: (model: PresentationEventModel) => void;
    }).showCinematic = (model: PresentationEventModel) => {
      const isCard =
        model.kind === 'card_draw'
        || model.kind === 'card_play'
        || model.kind === 'card_blocked';
      const isNews = model.kind === 'news';

      if (isCard) this.destroyNamedTopLevelContainers070413('legacy-card-overlay');
      if (isNews) this.destroyNamedTopLevelContainers070413('legacy-news-overlay');

      originalShowCinematic(model);

      if (!isCard && !isNews) return;
      this.rebuildCanonicalCinematicText070414(presentation.active, model);
    };
  }

  private retireLegacyPresentationOverlays070414(): void {
    this.destroyNamedTopLevelContainers070413('legacy-card-overlay');
    this.destroyNamedTopLevelContainers070413('legacy-news-overlay');
  }

  private rebuildCanonicalCinematicText070414(
    root: Phaser.GameObjects.Container | undefined,
    model: PresentationEventModel,
  ): void {
    if (!root?.active) return;

    const isNews = model.kind === 'news';
    root.setName(isNews ? 'news-presentation-card' : 'card-presentation-card');

    // Final layout lock: destroy every inherited child, including legacy footer
    // graphics and rarity/action strips. Keeping only hidden text was not enough
    // because old Graphics objects still looked like a second frame.
    for (const child of [...root.list]) {
      this.tweens.killTweensOf(child);
      child.destroy();
    }

    const accent = isNews ? 0x9bcf74 : 0xd4a8ff;
    const panelColor = isNews ? 0x173c31 : 0x2d203f;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.28);
    shadow.fillRoundedRect(-366, -145, 732, 306, 24);
    shadow.setPosition(0, 9);

    const panel = this.add.graphics();
    panel.fillStyle(panelColor, 0.985);
    panel.fillRoundedRect(-360, -150, 720, 300, 22);
    panel.lineStyle(3, accent, 0.92);
    panel.strokeRoundedRect(-360, -150, 720, 300, 22);
    panel.fillStyle(accent, 1);
    panel.fillRoundedRect(-360, -150, 10, 300, { tl: 22, bl: 22, tr: 0, br: 0 });

    const kicker = this.add.text(-322, -118, model.eyebrow, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f8f4ec',
      fixedWidth: 500,
    });

    const title = this.add.text(-322, -88, model.title, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#ffffff',
      fixedWidth: 540,
      fixedHeight: 52,
      wordWrap: { width: 540, useAdvancedWrap: true },
    });

    const impact = this.add.text(314, -108, model.impact || '•', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    const bodyCopy = this.canonicalCinematicBody070414(model);
    const body = this.add.text(-322, -24, bodyCopy, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: '16px',
      color: '#f4ede4',
      fixedWidth: 628,
      fixedHeight: model.targetId === undefined ? 138 : 116,
      wordWrap: { width: 628, useAdvancedWrap: true },
      lineSpacing: 5,
      maxLines: model.targetId === undefined ? 6 : 5,
    });

    const source = this.add.text(316, 126, `${isNews ? 'CITY NEWS' : 'CARD ACTION'} • #${model.eventSeq}`, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: '9px',
      color: '#d8d0c6',
    }).setOrigin(1, 0.5);

    root.add([shadow, panel, kicker, title, impact, body, source]);

    if (model.rarity) {
      const rarityText = this.add.text(275, -118, model.rarity, {
        fontFamily: MOBILE_UI_FONT_07044,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#24211d',
        backgroundColor: '#eee8dc',
        padding: { x: 18, y: 4 },
      }).setOrigin(0.5);
      root.add(rarityText);
    }

    const amount = Math.abs(model.amount ?? 0);
    const directMoneyTransfer =
      model.cardEffectType === 'steal_money'
      || model.cardEffectType === 'rich_tax'
      || model.cardEffectType === 'tactical_choice';
    if (model.kind === 'card_play' && model.targetName && directMoneyTransfer && amount > 0) {
      const action = `${model.targetName} • ${amount} B$ • ${model.actorName}`;
      const actionText = this.add.text(0, 112, action, {
        fontFamily: MOBILE_UI_FONT_07044,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#4a433c',
        fixedWidth: 596,
        align: 'center',
        padding: { x: 8, y: 7 },
      }).setOrigin(0.5);
      root.add(actionText);
    }
  }

  private canonicalCinematicBody070414(model: PresentationEventModel): string {
    const lines = [
      ...model.description.split(/\n+/),
      ...(model.summary && model.summary !== model.description ? [`→ ${model.summary}`] : []),
    ];
    const seen = new Set<string>();
    return lines
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => {
        const key = this.normalizePresentationCopy070412(line);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join('\n');
  }

  private destroyNamedTopLevelContainers070413(name: string): void {
    for (const object of [...this.children.list]) {
      if (
        object instanceof Phaser.GameObjects.Container
        && object.active
        && object.name === name
      ) {
        this.tweens.killTweensOf(object);
        object.destroy(true);
      }
    }
  }

  private normalizeCardPresentation070412(
    root: Phaser.GameObjects.Container | undefined,
    model: PresentationEventModel,
  ): void {
    if (!root?.active) return;
    root.setName('card-presentation-card');

    // Undo legacy child scaling while preserving the root entrance animation.
    for (const child of root.list) {
      const transform = child as Phaser.GameObjects.GameObject & {
        setScale?: (x: number, y?: number) => unknown;
      };
      transform.setScale?.(1, 1);
    }

    const [shadow, panel, kicker, title, impact, body, source] = root.list;
    if (shadow instanceof Phaser.GameObjects.Graphics) shadow.setPosition(0, 9);
    if (panel instanceof Phaser.GameObjects.Graphics) panel.setPosition(0, 0);
    if (kicker instanceof Phaser.GameObjects.Text) {
      kicker.setPosition(-322, -118).setFixedSize(520, 24);
    }
    if (title instanceof Phaser.GameObjects.Text) {
      title
        .setPosition(-322, -88)
        .setFixedSize(540, 54)
        .setWordWrapWidth(540, true);
    }
    if (impact instanceof Phaser.GameObjects.Text) impact.setPosition(314, -108);
    if (body instanceof Phaser.GameObjects.Text) {
      body
        .setPosition(-322, -28)
        .setFixedSize(628, 128)
        .setWordWrapWidth(628, true)
        .setLineSpacing(5);
    }
    if (source instanceof Phaser.GameObjects.Text) source.setPosition(316, 126);

    for (const child of root.list.slice(7)) {
      if (!(child instanceof Phaser.GameObjects.Text)) continue;
      const copy = child.text.trim();
      if (['N', 'R', 'SR', 'SSR'].includes(copy)) {
        child.setPosition(275, -118);
        continue;
      }
      if (child.style.fixedWidth === 596) {
        child.setPosition(-306, 119).setFixedSize(596, child.height);
      }
    }

    // A second legacy copy of the same description/summary must never remain
    // elsewhere on the board while this canonical card owns presentation.
    const canonical = new Set<Phaser.GameObjects.GameObject>(root.list);
    canonical.add(root);
    const description = this.normalizePresentationCopy070412(model.description);
    const summary = this.normalizePresentationCopy070412(model.summary);
    this.visitDisplayTree07044(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text) || canonical.has(object) || !object.visible) return;
      const copy = this.normalizePresentationCopy070412(object.text);
      if (
        (description.length > 8 && copy === description)
        || (summary.length > 8 && (copy === summary || copy === `→ ${summary}`))
      ) object.setVisible(false);
    });
  }

  private normalizePresentationCopy070412(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
  }

  private canonicalJobBody070414(model: PresentationEventModel): string {
    const impact = model.impact?.trim();
    const seen = new Set<string>();
    return model.description
      .split(/\n+/)
      .map((line) => {
        let copy = line.trim();
        if (impact && copy.includes(impact)) copy = copy.replace(impact, '').trim();
        return copy;
      })
      .filter(Boolean)
      .filter((line) => {
        const key = this.normalizePresentationCopy070412(line);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join('\n');
  }

  private showCanonicalJobLanding070411(
    presentation: Presentation07044,
    model: PresentationEventModel,
  ): void {
    const previous = presentation.active;
    if (previous?.active && previous.name === 'job-presentation-card') previous.destroy(true);

    const root = this.add.container(640, 350)
      .setDepth(900)
      .setName('job-presentation-card')
      .setAlpha(0)
      .setScale(0.96);
    presentation.active = root;

    const isResult = model.title.includes('NHẬN VIỆC');

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-416, -126, 832, 262, 28);
    shadow.setPosition(0, 9);

    const panel = this.add.graphics();
    panel.fillStyle(0x2c2925, 0.985);
    panel.fillRoundedRect(-410, -130, 820, 260, 26);
    panel.lineStyle(5, 0xffd34d, 0.96);
    panel.strokeRoundedRect(-410, -130, 820, 260, 26);

    const eyebrow = this.add.text(0, -100, model.eyebrow, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#d9d1c7',
      fixedWidth: 680,
      align: 'center',
    }).setOrigin(0.5);

    const icon = this.add.text(isResult ? -320 : -315, isResult ? 8 : -10, model.impact || '💼', {
      fontFamily: 'Arial, sans-serif',
      fontSize: isResult ? '54px' : '46px',
    }).setOrigin(0.5);

    const jobBodyCopy = this.canonicalJobBody070414(model);
    const title = this.add.text(isResult ? 190 : 60, isResult ? -24 : -48, model.title, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: isResult ? '28px' : '30px',
      fontStyle: 'bold',
      color: '#ffffff',
      fixedWidth: isResult ? 320 : 570,
      align: 'center',
      wordWrap: { width: isResult ? 320 : 570, useAdvancedWrap: true },
    }).setOrigin(0.5);

    const body = this.add.text(isResult ? -240 : 60, isResult ? 24 : 38, jobBodyCopy, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: isResult ? '16px' : '17px',
      color: '#f4ede4',
      fixedWidth: isResult ? 260 : 570,
      fixedHeight: isResult ? 92 : 88,
      align: isResult ? 'left' : 'center',
      wordWrap: { width: isResult ? 260 : 570, useAdvancedWrap: true },
      lineSpacing: isResult ? 10 : 7,
      maxLines: 3,
    }).setOrigin(isResult ? 0 : 0.5, 0.5);

    const hit = this.add.rectangle(0, 0, 820, 260, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });

    root.add([shadow, panel, eyebrow, icon, title, body, hit]);
    root.bringToTop(eyebrow);
    root.bringToTop(icon);
    root.bringToTop(title);
    root.bringToTop(body);

    sfxController.play('ui_confirm');
    this.tweens.add({
      targets: root,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 170,
      ease: 'Back.easeOut',
    });

    let closed = false;
    const close = (): void => {
      if (closed || presentation.currentModel !== model) return;
      closed = true;
      presentation.finishCurrent(false);
    };

    hit.on('pointerdown', close);
    this.time.delayedCall(Math.max(model.holdMs, 1900), close);
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
