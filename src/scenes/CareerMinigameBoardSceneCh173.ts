import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { MOBILE_UI_FONT_07044 } from '../ui/mobileReadability07044';
import { publicAssetUrl } from '../ui/publicAssetUrl';
import { CareerMinigameBoardScene07044 } from './CareerMinigameBoardScene07044';

const COCOA_CH173 = 0x4b302a;
const CREAM_CH173 = 0xfff7e8;
const BUTTER_CH173 = 0xffd76a;
const BUTTER_SHADOW_CH173 = 0xd99b38;
const LAVENDER_CH173 = 0xbca7dc;
const LAVENDER_SHADOW_CH173 = 0x8f74b7;
const BOARD_CH175 = boardJson as BoardDefinition;

type HudCh173 = {
  root: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

type RuntimeCh173 = {
  match: MatchState;
  hud: Map<number, HudCh173>;
  visuals: Map<number, { token: Phaser.GameObjects.Container }>;
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
  private boardPathChromeCh175?: Phaser.GameObjects.Graphics;
  private readonly boardTileSkinsCh175 = new Map<Phaser.GameObjects.Rectangle, Phaser.GameObjects.Graphics>();
  private readonly characterWalkSpritesCh181 = new Map<number, Phaser.GameObjects.Sprite>();
  private readonly characterWalkRowsCh181 = new Map<number, number>();
  private readonly characterWalkLastPositionsCh181 = new Map<number, { x: number; y: number }>();

  preload(): void {
    super.preload();
    if (!this.textures.exists('character-walk-atlas-ch181')) {
      this.load.spritesheet(
        'character-walk-atlas-ch181',
        publicAssetUrl('assets/characters/ch181/walk-atlas.webp'),
        { frameWidth: 48, frameHeight: 48 },
      );
    }
  }

  create(): void {
    super.create();
    this.installCharacterProductionCh181();
    this.installBoardChromeCh173();
    this.installBoardPathChromeCh175();
    this.installBoardTileChromeCh175();
    this.syncBoardChromeCh173();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyBoardChromeCh173());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyBoardChromeCh173());
  }

  update(): void {
    super.update();
    this.syncCharacterProductionCh181();
    this.syncBoardChromeCh173();
  }

  private runtimeCh173(): RuntimeCh173 {
    return this as unknown as RuntimeCh173;
  }

  private characterProductionRowCh181(characterId?: string): number | undefined {
    if (characterId === 'starter-crybaby') return 0;
    if (characterId === 'starter-grumpy') return 1;
    if (characterId === 'starter-anxious') return 2;
    if (characterId === 'starter-hyper') return 3;
    if (characterId === 'secret-baby') return 4;
    return undefined;
  }

  private installCharacterProductionCh181(): void {
    const runtime = this.runtimeCh173();
    for (const player of runtime.match.players) {
      const visual = runtime.visuals.get(player.id);
      const row = this.characterProductionRowCh181(player.characterId);
      if (!visual || row === undefined) continue;

      // Retire only the old center avatar/circle. The P1-P4 seat badge stays readable.
      for (const child of visual.token.list) {
        if (
          (child instanceof Phaser.GameObjects.Image || child instanceof Phaser.GameObjects.Arc)
          && Math.abs(child.x) < 1
          && Math.abs(child.y) < 1
        ) {
          child.setVisible(false);
        }
      }

      const sprite = this.add.sprite(0, -5, 'character-walk-atlas-ch181', row * 8)
        .setName(`character-walk-token-ch181-p${player.id + 1}`)
        .setDisplaySize(62, 62)
        .setOrigin(0.5, 0.58);
      visual.token.addAt(sprite, 0);

      this.characterWalkSpritesCh181.set(player.id, sprite);
      this.characterWalkRowsCh181.set(player.id, row);
      this.characterWalkLastPositionsCh181.set(player.id, { x: visual.token.x, y: visual.token.y });
    }
  }

  private syncCharacterProductionCh181(): void {
    const runtime = this.runtimeCh173();
    for (const [playerId, sprite] of this.characterWalkSpritesCh181) {
      const visual = runtime.visuals.get(playerId);
      const row = this.characterWalkRowsCh181.get(playerId);
      const previous = this.characterWalkLastPositionsCh181.get(playerId);
      if (!visual || row === undefined || !previous || !sprite.active) continue;

      const dx = visual.token.x - previous.x;
      const dy = visual.token.y - previous.y;
      const moving = Math.hypot(dx, dy) > 0.45;

      if (moving) {
        const walkFrame = Math.floor(this.time.now / 90) % 8;
        sprite.setFrame(row * 8 + walkFrame);
        sprite.setY(-5 - (walkFrame % 2 === 0 ? 0 : 1.5));
        if (Math.abs(dx) > 0.2) sprite.setFlipX(dx < 0);
      } else {
        sprite.setFrame(row * 8);
        sprite.setY(-5);
      }

      previous.x = visual.token.x;
      previous.y = visual.token.y;
    }
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
    this.syncBoardTileChromeCh175();
  }

  private installBoardPathChromeCh175(): void {
    const path = this.add.graphics()
      .setDepth(0.35)
      .setName('board-path-chrome-ch175');
    this.boardPathChromeCh175 = path;

    for (const edge of BOARD_CH175.edges) {
      const from = BOARD_CH175.nodes.find((node) => node.id === edge.from);
      const to = BOARD_CH175.nodes.find((node) => node.id === edge.to);
      if (!from || !to) continue;

      const branch = edge.route === 'branch';
      path.lineStyle(branch ? 10 : 13, COCOA_CH173, branch ? 0.18 : 0.20);
      path.lineBetween(from.x + 2, from.y + 3, to.x + 2, to.y + 3);

      path.lineStyle(branch ? 6 : 9, branch ? 0x67cfc4 : 0xf5dfb8, 1);
      path.lineBetween(from.x, from.y, to.x, to.y);

      path.lineStyle(2, branch ? 0xcff8f0 : 0xffffff, branch ? 0.48 : 0.38);
      path.lineBetween(from.x - 1, from.y - 1, to.x - 1, to.y - 1);
    }
  }

  private installBoardTileChromeCh175(): void {
    const nodePositions = new Set(
      BOARD_CH175.nodes.map((node) => `${Math.round(node.x)}:${Math.round(node.y)}`),
    );

    for (const object of this.children.list) {
      if (
        object instanceof Phaser.GameObjects.Rectangle
        && object.depth === 4
        && nodePositions.has(`${Math.round(object.x)}:${Math.round(object.y)}`)
      ) {
        object.setAlpha(0.001);
        const skin = this.add.graphics()
          .setPosition(object.x, object.y)
          .setDepth(4.2)
          .setName('board-tile-skin-ch175');
        this.boardTileSkinsCh175.set(object, skin);
      }

      if (
        object instanceof Phaser.GameObjects.Text
        && object.depth === 5
        && nodePositions.has(`${Math.round(object.x)}:${Math.round(object.y)}`)
      ) {
        object
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setColor('#4b302a')
          .setShadow(0, 1, '#fff7e8', 0, true, false);
      }
    }

    this.syncBoardTileChromeCh175();
  }

  private syncBoardTileChromeCh175(): void {
    for (const [source, skin] of [...this.boardTileSkinsCh175]) {
      if (!source.active || !skin.active) {
        if (skin.active) skin.destroy();
        this.boardTileSkinsCh175.delete(source);
        continue;
      }

      const visible = source.visible;
      skin.setVisible(visible).setPosition(source.x, source.y);
      if (!visible) continue;

      const width = source.width;
      const height = source.height;
      const radius = Math.max(7, Math.min(14, Math.min(width, height) * 0.32));
      const fill = source.fillColor;
      const strong = width >= 42 || height >= 30;

      skin.clear();
      skin.fillStyle(COCOA_CH173, strong ? 0.24 : 0.19);
      skin.fillRoundedRect(-width / 2 + 2, -height / 2 + 4, width, height, radius);

      skin.fillStyle(fill, 1);
      skin.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

      skin.fillStyle(0xffffff, strong ? 0.52 : 0.40);
      skin.fillRoundedRect(
        -width / 2 + 4,
        -height / 2 + 4,
        Math.max(8, width - 8),
        Math.max(4, Math.min(7, height * 0.22)),
        Math.max(3, radius * 0.45),
      );

      skin.lineStyle(strong ? 3 : 2, COCOA_CH173, 0.92);
      skin.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    }
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
    this.boardPathChromeCh175?.destroy();
    for (const skin of this.boardTileSkinsCh175.values()) skin.destroy();
    this.boardTileSkinsCh175.clear();
    this.turnStatusSkinCh173 = undefined;
    this.overviewSkinCh173 = undefined;
    this.directDiceSkinCh173 = undefined;
    this.directDiceTextCh173 = undefined;
    this.boardPathChromeCh175 = undefined;
    for (const sprite of this.characterWalkSpritesCh181.values()) sprite.destroy();
    this.characterWalkSpritesCh181.clear();
    this.characterWalkRowsCh181.clear();
    this.characterWalkLastPositionsCh181.clear();
  }
}
