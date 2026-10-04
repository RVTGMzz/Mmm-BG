import Phaser from 'phaser';
import { gameSession } from '../core/session';
import { MOBILE_UI_FONT_07044 } from '../ui/mobileReadability07044';
import { paintToyTownBackdropCh17 } from '../ui/paintToyTownBackdropCh17';
import { TurnOrderScene07044 } from './TurnOrderScene07044';

const PLAYER_COLORS_CH17 = [0xef6a63, 0x6f9df2, 0xf1bd55, 0x6fc08b] as const;
const COCOA_CH17 = 0x4b302a;
const PAPER_CH17 = 0xfff8eb;
const PAPER_LIGHT_CH17 = 0xfffdf7;

type TurnOrderRuntimeCh17 = {
  promptText?: Phaser.GameObjects.Text;
  detailText?: Phaser.GameObjects.Text;
  rollButton?: Phaser.GameObjects.Rectangle;
  rollButtonText?: Phaser.GameObjects.Text;
  nameTexts: Map<number, Phaser.GameObjects.Text>;
  ownerTexts: Map<number, Phaser.GameObjects.Text>;
  valueTexts: Map<number, Phaser.GameObjects.Text>;
  rankTexts: Map<number, Phaser.GameObjects.Text>;
};

/**
 * CH-17 presentation-only refresh for Roll For Order.
 * Turn sequencing, remote ownership, D6 results and final order stay inherited.
 */
export class TurnOrderSceneCh17 extends TurnOrderScene07044 {
  private readonly cardSkinsCh17 = new Map<number, Phaser.GameObjects.Graphics>();
  private statusSkinCh17?: Phaser.GameObjects.Graphics;
  private rollSkinCh17?: Phaser.GameObjects.Graphics;
  private orderLabelCh17?: Phaser.GameObjects.Text;
  private orderPreviewCh17?: Phaser.GameObjects.Text;

  create(): void {
    super.create();
    const runtime = this.runtimeCh17();

    const oldFrame = this.children.getByName('roll-order-frame');
    if (oldFrame instanceof Phaser.GameObjects.Graphics) oldFrame.setVisible(false);

    paintToyTownBackdropCh17(this, 'butter', {
      x: 75,
      y: 42,
      width: 1130,
      height: 630,
      radius: 32,
    }).setName('roll-order-backdrop-ch17');

    this.createPlayerSkinsCh17();
    this.createStatusPanelCh17();
    this.createRollButtonSkinCh17();
    this.applyTypographyCh17(runtime);
    this.redrawCh17();
  }

  update(): void {
    super.update();
    this.redrawCh17();
  }

  private runtimeCh17(): TurnOrderRuntimeCh17 {
    return this as unknown as TurnOrderRuntimeCh17;
  }

  private createPlayerSkinsCh17(): void {
    for (const player of gameSession.players) {
      const skin = this.add.graphics()
        .setDepth(2)
        .setName(`roll-order-card-ch17-${player.id}`);
      this.cardSkinsCh17.set(player.id, skin);
    }
  }

  private createStatusPanelCh17(): void {
    this.statusSkinCh17 = this.add.graphics()
      .setDepth(2)
      .setName('roll-order-status-panel-ch17');

    this.orderLabelCh17 = this.add.text(930, 470, 'THỨ TỰ TẠM', {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#8c6250',
    }).setOrigin(0.5).setDepth(4).setName('roll-order-preview-label-ch17');

    this.orderPreviewCh17 = this.add.text(930, 510, 'Đang chờ kết quả...', {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#4b302a',
      align: 'center',
      wordWrap: { width: 340, useAdvancedWrap: true },
      fixedWidth: 340,
    }).setOrigin(0.5).setDepth(4).setName('roll-order-preview-ch17');
  }

  private createRollButtonSkinCh17(): void {
    this.rollSkinCh17 = this.add.graphics()
      .setDepth(3.5)
      .setName('roll-order-button-skin-ch17');
  }

  private applyTypographyCh17(runtime: TurnOrderRuntimeCh17): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      const copy = object.text.trim();

      if (copy === '🎲 ROLL FOR ORDER') {
        object
          .setY(74)
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(42)
          .setColor('#4b302a')
          .setStroke('#fff7e8', 6)
          .setShadow(0, 4, '#4b302a', 0, true, false)
          .setDepth(4);
      } else if (copy.startsWith('Mỗi người tự đổ D6')) {
        object
          .setY(116)
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(18)
          .setColor('#7a6257')
          .setDepth(4);
      } else if (copy === '← QUAY LẠI') {
        object
          .setPosition(122, 82)
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(16)
          .setColor('#4b302a')
          .setBackgroundColor('#fff3d9')
          .setPadding(12, 8, 12, 8)
          .setDepth(5);
      } else if (/^P[1-4]$/.test(copy)) {
        object.setFontFamily(MOBILE_UI_FONT_07044).setFontSize(18).setDepth(5);
      }
    }

    for (const [id, text] of runtime.nameTexts) {
      text
        .setY(272)
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setFontSize(22)
        .setColor('#4b302a')
        .setDepth(5);
      const accent = PLAYER_COLORS_CH17[id] ?? 0xb99b87;
      text.setShadow(0, 2, Phaser.Display.Color.IntegerToColor(accent).rgba, 0, false, false);
    }

    for (const text of runtime.ownerTexts.values()) {
      text
        .setY(314)
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setFontSize(15)
        .setColor('#725148')
        .setDepth(5);
    }

    for (const text of runtime.valueTexts.values()) {
      text
        .setY(370)
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setFontSize(50)
        .setColor('#4b302a')
        .setDepth(5);
    }

    for (const text of runtime.rankTexts.values()) {
      text
        .setY(416)
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setFontSize(16)
        .setColor('#9b6250')
        .setDepth(5);
    }

    runtime.promptText
      ?.setPosition(420, 474)
      .setOrigin(0.5)
      .setFixedSize(500, 40)
      .setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(27)
      .setColor('#4b302a')
      .setDepth(5);

    runtime.detailText
      ?.setPosition(420, 513)
      .setOrigin(0.5, 0)
      .setFixedSize(500, 54)
      .setWordWrapWidth(500, true)
      .setMaxLines(2)
      .setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(17)
      .setColor('#7a6257')
      .setDepth(5);

    runtime.rollButton?.setY(622);
    runtime.rollButtonText
      ?.setY(622)
      .setFontFamily(MOBILE_UI_FONT_07044)
      .setFontSize(22)
      .setColor('#4b302a')
      .setDepth(5);
  }

  private redrawCh17(): void {
    const runtime = this.runtimeCh17();
    const activeId = this.activePlayerIdCh17(runtime);

    for (const player of gameSession.players) {
      const skin = this.cardSkinsCh17.get(player.id);
      if (!skin) continue;
      const x = runtime.nameTexts.get(player.id)?.x ?? (220 + player.id * 280);
      const accent = PLAYER_COLORS_CH17[player.id] ?? 0xb99b87;
      const active = activeId === player.id;
      const ranked = Boolean(runtime.rankTexts.get(player.id)?.text.trim());

      skin.clear();

      if (active) {
        skin.fillStyle(accent, 0.18);
        skin.fillRoundedRect(x - 124, 169, 248, 272, 30);
      }

      skin.fillStyle(COCOA_CH17, 0.18);
      skin.fillRoundedRect(x - 115 + 5, 182 + 7, 230, 248, 26);

      skin.fillStyle(PAPER_CH17, 1);
      skin.fillRoundedRect(x - 115, 182, 230, 248, 26);
      skin.lineStyle(active ? 6 : 4, active ? accent : COCOA_CH17, 1);
      skin.strokeRoundedRect(x - 115, 182, 230, 248, 26);

      skin.fillStyle(accent, 1);
      skin.fillRoundedRect(x - 115, 182, 230, 16, { tl: 26, tr: 26, bl: 0, br: 0 });
      skin.lineStyle(2, COCOA_CH17, 0.32);
      skin.lineBetween(x - 112, 199, x + 112, 199);

      skin.fillStyle(0xf2e3cf, 1);
      skin.fillRoundedRect(x - 49, 297, 98, 30, 15);
      skin.lineStyle(2, COCOA_CH17, 0.35);
      skin.strokeRoundedRect(x - 49, 297, 98, 30, 15);

      skin.fillStyle(PAPER_LIGHT_CH17, 1);
      skin.fillRoundedRect(x - 78, 337, 156, 63, 18);
      skin.lineStyle(3, accent, active ? 0.95 : 0.5);
      skin.strokeRoundedRect(x - 78, 337, 156, 63, 18);

      if (ranked) {
        skin.fillStyle(0xffe5a3, 0.92);
        skin.fillRoundedRect(x - 58, 402, 116, 30, 15);
        skin.lineStyle(2, COCOA_CH17, 0.35);
        skin.strokeRoundedRect(x - 58, 402, 116, 30, 15);
      }
    }

    this.redrawStatusCh17(runtime);
    this.redrawRollButtonCh17(runtime);
  }

  private redrawStatusCh17(runtime: TurnOrderRuntimeCh17): void {
    const skin = this.statusSkinCh17;
    if (!skin) return;

    const finalOrder = this.finalOrderFromRanksCh17(runtime);
    const isFinal = finalOrder.length === gameSession.players.length;

    skin.clear();
    skin.fillStyle(COCOA_CH17, 0.18);
    skin.fillRoundedRect(165, 455, 950, 125, 24);
    skin.fillStyle(isFinal ? 0xe4f3d8 : 0xfff2d8, 1);
    skin.fillRoundedRect(160, 449, 950, 125, 24);
    skin.lineStyle(4, COCOA_CH17, 1);
    skin.strokeRoundedRect(160, 449, 950, 125, 24);
    skin.lineStyle(2, COCOA_CH17, 0.18);
    skin.lineBetween(690, 465, 690, 559);

    if (this.orderLabelCh17) {
      this.orderLabelCh17.setText(isFinal ? 'THỨ TỰ ĐÃ CHỐT' : 'THỨ TỰ TẠM');
    }
    if (this.orderPreviewCh17) {
      this.orderPreviewCh17.setText(
        isFinal
          ? finalOrder.map((id, index) => `#${index + 1}  ${gameSession.players[id]?.name ?? `P${id + 1}`}`).join('   •   ')
          : this.partialOrderCopyCh17(runtime),
      );
    }
  }

  private redrawRollButtonCh17(runtime: TurnOrderRuntimeCh17): void {
    const button = runtime.rollButton;
    const text = runtime.rollButtonText;
    const skin = this.rollSkinCh17;
    if (!button || !skin || !text) return;

    skin.setVisible(button.visible);
    if (!button.visible) return;

    const entering = /VÀO TRẬN/.test(text.text);
    const fill = entering ? 0x8fd49f : 0xffd76a;
    const shadow = entering ? 0x4b9b6b : 0xd99b38;

    skin.clear();
    skin.fillStyle(shadow, 1);
    skin.fillRoundedRect(480, 592, 320, 72, 23);
    skin.fillStyle(fill, 1);
    skin.fillRoundedRect(480, 585, 320, 72, 23);
    skin.fillStyle(0xffffff, 0.5);
    skin.fillRoundedRect(488, 592, 304, 15, 10);
    skin.lineStyle(4, COCOA_CH17, 1);
    skin.strokeRoundedRect(480, 585, 320, 72, 23);

    button.setY(621);
    text.setY(621).setColor('#4b302a');
  }

  private activePlayerIdCh17(runtime: TurnOrderRuntimeCh17): number | null {
    const prompt = runtime.promptText?.text ?? '';
    if (!/ROLL|ĐỔ|ĐANG ĐỔ/i.test(prompt)) return null;

    for (const player of gameSession.players) {
      if (prompt.includes(player.name) || prompt.includes(`P${player.id + 1}`)) return player.id;
    }
    return null;
  }

  private finalOrderFromRanksCh17(runtime: TurnOrderRuntimeCh17): number[] {
    return gameSession.players
      .map((player) => {
        const match = runtime.rankTexts.get(player.id)?.text.match(/(\d+)/);
        return { id: player.id, rank: match ? Number(match[1]) : Number.POSITIVE_INFINITY };
      })
      .filter((entry) => Number.isFinite(entry.rank))
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => entry.id);
  }

  private partialOrderCopyCh17(runtime: TurnOrderRuntimeCh17): string {
    const rolled = gameSession.players
      .map((player) => {
        const copy = runtime.valueTexts.get(player.id)?.text.trim() ?? '';
        const match = copy.match(/([1-6])\s*$/);
        return match ? { id: player.id, value: Number(match[1]) } : null;
      })
      .filter((entry): entry is { id: number; value: number } => Boolean(entry))
      .sort((a, b) => b.value - a.value || a.id - b.id);

    if (!rolled.length) return 'Đang chờ kết quả...';
    return rolled
      .map(({ id, value }) => `🎲 P${id + 1}  ${value}`)
      .join('   •   ');
  }
}
