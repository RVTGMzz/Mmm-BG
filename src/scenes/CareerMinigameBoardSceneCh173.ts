import Phaser from 'phaser';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { MOBILE_UI_FONT_07044 } from '../ui/mobileReadability07044';
import { CareerMinigameBoardScene07044 } from './CareerMinigameBoardScene07044';

const COCOA_CH173 = 0x4b302a;
const CREAM_CH173 = 0xfff7e8;
const BUTTER_CH173 = 0xffd76a;
const BUTTER_SHADOW_CH173 = 0xd99b38;
const LAVENDER_CH173 = 0xbca7dc;
const LAVENDER_SHADOW_CH173 = 0x8f74b7;

type HudCh173 = {
  root: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

type RuntimeCh173 = {
  match: MatchState;
  hud: Map<number, HudCh173>;
  turnStatus?: Phaser.GameObjects.Text;
  overviewButton?: Phaser.GameObjects.Text;
  compactCard?: Phaser.GameObjects.Rectangle;
  compactCardText?: Phaser.GameObjects.Text;
  directDice?: Phaser.GameObjects.Container;
  currentPlayer(): PlayerState | undefined;
};

/**
 * CH-17.3 presentation-only board chrome refresh.
 * HUD data, turn state, direct-dice ownership and all intents stay inherited.
 */
export class CareerMinigameBoardSceneCh173 extends CareerMinigameBoardScene07044 {
  private turnStatusSkinCh173?: Phaser.GameObjects.Graphics;
  private overviewSkinCh173?: Phaser.GameObjects.Graphics;
  private directDiceSkinCh173?: Phaser.GameObjects.Graphics;
  private directDiceTextCh173?: Phaser.GameObjects.Text;

  create(): void {
    super.create();
    this.installBoardChromeCh173();
    this.syncBoardChromeCh173();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyBoardChromeCh173());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyBoardChromeCh173());
  }

  update(): void {
    super.update();
    this.syncBoardChromeCh173();
  }

  private runtimeCh173(): RuntimeCh173 {
    return this as unknown as RuntimeCh173;
  }

  private installBoardChromeCh173(): void {
    const runtime = this.runtimeCh173();

    if (runtime.turnStatus) {
      runtime.turnStatus
        .setBackgroundColor('rgba(0,0,0,0)')
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setColor('#4b302a')
        .setPadding(15, 8, 15, 8)
        .setDepth(runtime.turnStatus.depth + 1);
      this.turnStatusSkinCh173 = this.add.graphics()
        .setDepth(runtime.turnStatus.depth)
        .setName('board-turn-status-skin-ch173');
    }

    if (runtime.overviewButton) {
      runtime.overviewButton
        .setBackgroundColor('rgba(0,0,0,0)')
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setColor('#4b302a')
        .setPadding(14, 8, 14, 8)
        .setDepth(runtime.overviewButton.depth + 1);
      this.overviewSkinCh173 = this.add.graphics()
        .setDepth(runtime.overviewButton.depth)
        .setName('board-overview-skin-ch173');
    }

    const dice = runtime.directDice;
    if (dice) {
      this.directDiceTextCh173 = dice.list.find(
        (child): child is Phaser.GameObjects.Text =>
          child instanceof Phaser.GameObjects.Text && child.text.trim() === 'BẤM XÚC XẮC',
      );
      if (this.directDiceTextCh173) {
        this.directDiceTextCh173
          .setBackgroundColor('rgba(0,0,0,0)')
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setColor('#4b302a')
          .setPadding(20, 11, 20, 11)
          .setDepth(this.directDiceTextCh173.depth + 1);

        this.directDiceSkinCh173 = this.add.graphics().setName('board-direct-dice-skin-ch173');
        const index = Math.max(0, dice.getIndex(this.directDiceTextCh173));
        dice.addAt(this.directDiceSkinCh173, index);
      }
    }
  }

  private syncBoardChromeCh173(): void {
    const runtime = this.runtimeCh173();
    const current = runtime.currentPlayer();

    for (const player of runtime.match.players) {
      const hud = runtime.hud.get(player.id);
      if (!hud) continue;
      const active = player.id === current?.id;

      hud.name
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setColor('#4b302a')
        .setFontStyle('bold');

      hud.money
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setColor(active ? '#6b461b' : '#735326')
        .setFontStyle('bold');

      hud.meta
        .setFontFamily(MOBILE_UI_FONT_07044)
        .setColor(active ? '#5f4a42' : '#7a665d')
        .setLineSpacing(2);
    }

    this.redrawTopStatusCh173(runtime);
    this.redrawOverviewCh173(runtime);
    this.redrawDirectDiceCh173(runtime);
  }

  private redrawTopStatusCh173(runtime: RuntimeCh173): void {
    const text = runtime.turnStatus;
    const skin = this.turnStatusSkinCh173;
    if (!text || !skin) return;

    skin.setVisible(text.visible && text.alpha > 0.01);
    if (!skin.visible) return;

    const bounds = text.getBounds();
    const x = text.x - bounds.width / 2 - 12;
    const y = text.y - bounds.height / 2 - 7;
    const width = bounds.width + 24;
    const height = bounds.height + 14;

    skin.clear();
    skin.fillStyle(COCOA_CH173, 0.18);
    skin.fillRoundedRect(x + 3, y + 5, width, height, 16);
    skin.fillStyle(CREAM_CH173, 0.97);
    skin.fillRoundedRect(x, y, width, height, 16);
    skin.fillStyle(BUTTER_CH173, 1);
    skin.fillRoundedRect(x + 8, y + 6, 8, height - 12, 4);
    skin.lineStyle(3, COCOA_CH173, 0.92);
    skin.strokeRoundedRect(x, y, width, height, 16);
  }

  private redrawOverviewCh173(runtime: RuntimeCh173): void {
    const text = runtime.overviewButton;
    const skin = this.overviewSkinCh173;
    if (!text || !skin) return;

    skin.setVisible(text.visible && text.alpha > 0.01);
    if (!skin.visible) return;

    const bounds = text.getBounds();
    const x = text.x - bounds.width / 2 - 10;
    const y = text.y - bounds.height / 2 - 5;
    const width = bounds.width + 20;
    const height = bounds.height + 10;

    skin.clear();
    skin.fillStyle(LAVENDER_SHADOW_CH173, 1);
    skin.fillRoundedRect(x, y + 5, width, height, 15);
    skin.fillStyle(0xf5edff, 1);
    skin.fillRoundedRect(x, y, width, height, 15);
    skin.fillStyle(0xffffff, 0.65);
    skin.fillRoundedRect(x + 7, y + 5, width - 14, 8, 4);
    skin.lineStyle(3, COCOA_CH173, 0.88);
    skin.strokeRoundedRect(x, y, width, height, 15);
  }

  private redrawDirectDiceCh173(runtime: RuntimeCh173): void {
    const dice = runtime.directDice;
    const text = this.directDiceTextCh173;
    const skin = this.directDiceSkinCh173;
    if (!dice || !text || !skin) return;

    const visible = dice.visible && text.visible && text.alpha > 0.01;
    skin.setVisible(visible);
    if (!visible) return;

    const bounds = text.getBounds();
    // Text bounds are world-space; convert back to the dice container's local space.
    const localX = bounds.centerX - dice.x;
    const localY = bounds.centerY - dice.y;
    const width = Math.max(190, bounds.width + 34);
    const height = Math.max(58, bounds.height + 20);
    const x = localX - width / 2;
    const y = localY - height / 2;

    skin.clear();
    skin.fillStyle(BUTTER_SHADOW_CH173, 1);
    skin.fillRoundedRect(x, y + 7, width, height, 21);
    skin.fillStyle(BUTTER_CH173, 1);
    skin.fillRoundedRect(x, y, width, height, 21);
    skin.fillStyle(0xffffff, 0.58);
    skin.fillRoundedRect(x + 9, y + 7, width - 18, 13, 7);
    skin.lineStyle(4, COCOA_CH173, 1);
    skin.strokeRoundedRect(x, y, width, height, 21);
  }

  private destroyBoardChromeCh173(): void {
    this.turnStatusSkinCh173?.destroy();
    this.overviewSkinCh173?.destroy();
    this.directDiceSkinCh173?.destroy();
    this.turnStatusSkinCh173 = undefined;
    this.overviewSkinCh173 = undefined;
    this.directDiceSkinCh173 = undefined;
    this.directDiceTextCh173 = undefined;
  }
}
