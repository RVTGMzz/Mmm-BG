import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, BoardNode, PlayerState } from '../core/types';
import type { JobDefinition } from '../core/jobs';
import { effectiveBoardNode071 } from '../core/lapShuffle071';
import { MVP_CARD_HAND_LIMIT } from '../core/rules';
import { gameSession } from '../core/session';
import jobsJson from '../content/core/jobs_mvp.json';
import { playerHudCareer065 } from '../ui/playerHud065';
import { publicAssetUrl } from '../ui/publicAssetUrl';
import {
  PLAYER_CARD_CH19,
  PORTRAIT_BABY_KEY_CH19,
  PORTRAIT_BABY_PATH_CH19,
  PORTRAIT_CELL_CH19,
  PORTRAIT_STARTERS_KEY_CH19,
  PORTRAIT_STARTERS_PATH_CH19,
  buildPlayerCardCh19,
  playerCardPositionCh19,
  playerCardSignatureCh19,
  type PlayerCardModelCh19,
} from '../ui/playerCardCh19';
import {
  ISLAND_PALETTE_CH19,
  buildCityIslandSceneryCh19,
  rasterizeIslandSceneryCh19,
  shadeCh19,
  type IslandLabelCh19,
} from '../ui/cityIslandSceneryCh19';
import { MOBILE_UI_FONT_07044 } from '../ui/mobileReadability07044';
import { HUD_PLAYER_ACCENTS_VF04 } from '../ui/visualFoundationHudVf04';
import { CareerMinigameBoardSceneCh173 } from './CareerMinigameBoardSceneCh173';

const BOARD_CH19 = boardJson as BoardDefinition;
const JOBS_CH19 = jobsJson as JobDefinition[];
const SCENERY_TEXTURE_CH19 = 'city-island-scenery-ch19';
const SCENERY_DEPTH_CH19 = -45;
const LABEL_DEPTH_CH19 = -40;
const TILE_DEPTH_CH19 = 4.2;

/**
 * Walk strips have no standing pose; when a Character is still we hold the
 * frame with the narrowest stance (measured from the strips) and breathe.
 * Optional true standing art: drop a 192x192 PNG at
 * public/assets/characters/idle/<characterId>.png and list the id here.
 */
const IDLE_WALK_FRAME_CH19: Readonly<Record<string, number>> = {
  'starter-crybaby': 4,
  'starter-grumpy': 1,
  'starter-anxious': 7,
  'starter-hyper': 3,
  'secret-baby': 2,
};
const IDLE_STANDING_ART_CH19: readonly string[] = [];
const IDLE_SETTLE_MS_CH19 = 140;
const BREATH_PERIOD_MS_CH19 = 2600;

type TileLook = {
  kind: 'start' | 'plain' | 'disc';
  color?: number;
  symbol?: string;
  big?: boolean;
  small?: boolean;
};

const hex = (n: number): string => '#' + n.toString(16).padStart(6, '0');
const num = (s: string): number => parseInt(s.slice(1), 16);

const TILE_COLORS_CH19 = {
  purple: 0x8b4fe0,
  red: 0xe5363f,
  gold: 0xf7c531,
  green: 0x3dba5c,
  blue: 0x2f7fe0,
  pink: 0xf0509a,
  orange: 0xf4a23b,
  slate: 0x6b7488,
} as const;

/**
 * CH-19 City Island board (presentation only).
 *
 * Replaces the flat green board, thin edge lines and plain round tiles with the
 * island look from docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png. Gameplay,
 * authority, tokens, HUD and camera rig are inherited untouched. Inherited tile
 * objects stay alive (for any lookup/tween code) but are made invisible; this
 * layer redraws every tile from the authoritative Lap Shuffle assignment.
 */
export class CareerMinigameBoardSceneIslandCh19 extends CareerMinigameBoardSceneCh173 {
  private readonly islandTilesCh19 = new Map<number, Phaser.GameObjects.Container>();
  private readonly hiddenTileObjectsCh19: { alpha: number; setAlpha(value: number): unknown }[] = [];
  private readonly hiddenTileTextsCh19: Phaser.GameObjects.Text[] = [];
  private islandSignatureCh19 = '';
  private islandSceneryCh19?: Phaser.GameObjects.Image;
  private islandLabelsCh19: Phaser.GameObjects.Container[] = [];
  private readonly tileNumbersCh19 = tileNumbersCh19(BOARD_CH19);
  private readonly playerCardsCh19 = new Map<number, { card: Phaser.GameObjects.Container; signature: string; money: number; active: boolean }>();
  private readonly tokenStillCh19 = new Map<number, { x: number; y: number; stillMs: number }>();

  preload(): void {
    super.preload();
    if (!this.textures.exists(PORTRAIT_STARTERS_KEY_CH19)) {
      this.load.spritesheet(PORTRAIT_STARTERS_KEY_CH19, publicAssetUrl(PORTRAIT_STARTERS_PATH_CH19), {
        frameWidth: PORTRAIT_CELL_CH19, frameHeight: PORTRAIT_CELL_CH19,
      });
    }
    for (const id of IDLE_STANDING_ART_CH19) {
      const key = `character-idle-ch19-${id}`;
      if (!this.textures.exists(key)) this.load.image(key, publicAssetUrl(`assets/characters/idle/${id}.png`));
    }
    if (!this.textures.exists(PORTRAIT_BABY_KEY_CH19)) {
      this.load.spritesheet(PORTRAIT_BABY_KEY_CH19, publicAssetUrl(PORTRAIT_BABY_PATH_CH19), {
        frameWidth: PORTRAIT_CELL_CH19, frameHeight: PORTRAIT_CELL_CH19,
      });
    }
  }

  create(): void {
    super.create();
    this.cameras.main.setBackgroundColor(ISLAND_PALETTE_CH19.sea);
    this.hideLegacyBoardCh19();
    this.syncIslandTilesCh19(false);
    // Let the first board frame render before the one-off scenery build.
    this.time.delayedCall(0, () => { void this.installIslandSceneryCh19(); });

    this.syncPlayerCardsCh19();

    const cleanup = () => {
      this.playerCardsCh19.clear();
      this.islandTilesCh19.clear();
      this.hiddenTileObjectsCh19.length = 0;
      this.hiddenTileTextsCh19.length = 0;
      this.islandLabelsCh19 = [];
      this.islandSceneryCh19 = undefined;
      this.islandSignatureCh19 = '';
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }

  update(): void {
    super.update();
    // Ancestor tweens (e.g. Lap Shuffle fade-in) may restore alpha; keep them hidden.
    for (const object of this.hiddenTileObjectsCh19) if (object.alpha > 0.001) object.setAlpha(0.001);
    for (const text of this.hiddenTileTextsCh19) if (text.alpha > 0) text.setAlpha(0);
    this.syncIslandTilesCh19(true);
    this.syncPlayerCardsCh19();
    this.syncCharacterTokensCh19();
    this.syncActionButtonsCh19();
  }

  /* ------------------------------------------------------------------ action buttons */

  /**
   * The direct-turn dice sat at screen centre, i.e. on top of the active
   * Character the camera follows. Keep the inherited container (its hit area,
   * keyboard and gamepad paths stay intact) but anchor it bottom-centre and
   * replace its tiny label with a big, high-contrast action pill. The card
   * button keeps its inherited hit rectangle and gets a readable skin.
   */
  private syncActionButtonsCh19(): void {
    const runtime = this as unknown as {
      match?: MatchState;
      currentPlayer?: () => PlayerState | undefined;
      directDice?: Phaser.GameObjects.Container;
      compactCard?: Phaser.GameObjects.Rectangle;
      compactCardText?: Phaser.GameObjects.Text;
      compactCardSkin0701?: Phaser.GameObjects.Graphics;
    };

    const dice = runtime.directDice;
    if (dice?.active) {
      if (!dice.getData('ch19')) {
        dice.setData('ch19', true);
        const pill = this.add.graphics().setName('dice-action-pill-ch19');
        pill.fillStyle(0x14243f, 0.28).fillRoundedRect(-118, 60, 236, 54, 27);
        pill.fillStyle(0xb8342c, 1).fillRoundedRect(-118, 56, 236, 54, 27);
        pill.fillStyle(0xf2554a, 1).fillRoundedRect(-118, 50, 236, 54, 27);
        pill.fillStyle(0xffffff, 0.28).fillRoundedRect(-102, 55, 204, 11, 6);
        pill.lineStyle(3.5, 0xffffff, 1).strokeRoundedRect(-118, 50, 236, 54, 27);
        const label = this.add.text(0, 74, 'TUNG XÚC XẮC', {
          fontFamily: MOBILE_UI_FONT_07044, fontSize: '23px', fontStyle: 'bold', color: '#ffffff',
          stroke: '#8f2620', strokeThickness: 5,
        }).setOrigin(0.5).setName('dice-action-label-ch19');
        const keys = this.add.text(0, 124, 'Space · chạm', {
          fontFamily: MOBILE_UI_FONT_07044, fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
          stroke: '#3b2b27', strokeThickness: 4,
        }).setOrigin(0.5).setName('dice-action-keys-ch19');
        dice.add([pill, label, keys]);
      }
      for (const child of dice.list) {
        if (child instanceof Phaser.GameObjects.Text && child.text.trim() === 'BẤM XÚC XẮC' && child.alpha > 0) child.setAlpha(0);
        if (child instanceof Phaser.GameObjects.Rectangle && child.input?.enabled) {
          // Cover die + pill so the whole button is tappable.
          if (child.width !== 250) {
            child.setSize(250, 230).setPosition(0, 40);
            (child.input.hitArea as Phaser.Geom.Rectangle).setTo(0, 0, 250, 230);
          }
        }
      }
      dice.setX(640).setY(720 - 12 - 146);
    }

    const card = runtime.compactCard;
    const cardText = runtime.compactCardText;
    if (card?.active && cardText?.active) {
      const x = 900, y = 664;
      card.setPosition(x, y).setDisplaySize(170, 60).setAlpha(0.001);
      cardText.setPosition(x, y).setAlpha(0);
      runtime.compactCardSkin0701?.setAlpha(0);
      const visible = card.visible && cardText.visible;
      const player = runtime.currentPlayer?.();
      const hand = player?.handCardIds.length ?? 0;
      const canUse = runtime.match?.turn.phase === 'PRE_ROLL_ACTION' && hand > 0;
      const key = `${visible}|${canUse}|${hand}|${player?.cardBlockTurns ?? 0}`;
      let skin = this.children.getByName('card-action-ch19') as Phaser.GameObjects.Container | null;
      if (!skin || skin.getData('key') !== key) {
        skin?.destroy(true);
        skin = this.drawCardButtonCh19(x, y, canUse, hand, player?.cardBlockTurns ?? 0)
          .setDepth(card.depth + 0.5).setData('key', key).setVisible(visible);
      }
    }
  }

  private drawCardButtonCh19(x: number, y: number, canUse: boolean, hand: number, lock: number): Phaser.GameObjects.Container {
    const root = this.add.container(x, y).setName('card-action-ch19');
    const fill = canUse ? 0x8b4fe0 : 0xb9b2c6;
    const dark = canUse ? 0x5a2fa8 : 0x857d93;
    const g = this.add.graphics();
    g.fillStyle(0x14243f, 0.25).fillRoundedRect(-85, -22, 170, 60, 26);
    g.fillStyle(dark, 1).fillRoundedRect(-85, -26, 170, 60, 26);
    g.fillStyle(fill, 1).fillRoundedRect(-85, -32, 170, 60, 26);
    g.fillStyle(0xffffff, 0.25).fillRoundedRect(-70, -27, 140, 10, 5);
    g.lineStyle(3, 0xffffff, 1).strokeRoundedRect(-85, -32, 170, 60, 26);
    // little card stack icon
    g.fillStyle(0xffffff, 0.55).fillRoundedRect(-70, -20, 24, 32, 5);
    g.fillStyle(0xffffff, 1).fillRoundedRect(-64, -24, 24, 32, 5);
    g.lineStyle(2, dark, 1).strokeRoundedRect(-64, -24, 24, 32, 5);
    root.add(g);
    root.add(this.add.text(-52, -9, '?', {
      fontFamily: MOBILE_UI_FONT_07044, fontSize: '20px', fontStyle: 'bold', color: canUse ? '#8b4fe0' : '#857d93',
    }).setOrigin(0.5));
    root.add(this.add.text(-28, -12, 'LÁ BÀI', {
      fontFamily: MOBILE_UI_FONT_07044, fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
      stroke: canUse ? '#3f1d80' : '#5b5466', strokeThickness: 4,
    }).setOrigin(0, 0.5));
    root.add(this.add.text(-28, 12, lock > 0 ? `🔒 khóa ${lock} lượt` : `${hand}/${MVP_CARD_HAND_LIMIT}${canUse ? ' · dùng' : ''}`, {
      fontFamily: MOBILE_UI_FONT_07044, fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0, 0.5));
    return root;
  }

  /* ------------------------------------------------------------------ board tokens */

  /**
   * Seat-number badges floated beside each Character and read as belonging to
   * whoever stood next to them; replace them with a player-colour ground
   * shadow, and swap the mid-stride idle for a still stance that breathes.
   */
  private syncCharacterTokensCh19(): void {
    const runtime = this as unknown as {
      match?: MatchState;
      visuals?: Map<number, { token: Phaser.GameObjects.Container }>;
      characterWalkSpritesCh181?: Map<number, Phaser.GameObjects.Sprite>;
      cauCoRigPilotCh1822?: Map<number, unknown>;
      characterFaceCompositeImagesCh187?: Map<number, Phaser.GameObjects.Image>;
    };
    if (!runtime.match || !runtime.visuals) return;
    const delta = this.game.loop.delta;

    for (const player of runtime.match.players) {
      const token = runtime.visuals.get(player.id)?.token;
      if (!token?.active) continue;

      for (const child of token.list) {
        const c = child as Phaser.GameObjects.GameObject & { x: number; y: number; visible: boolean; setVisible(v: boolean): unknown };
        if (!c.visible) continue;
        const badge = (Math.abs(c.x - 38) < 1 && Math.abs(c.y - 30) < 1) || (Math.abs(c.x - 21) < 1 && Math.abs(c.y - 21) < 1);
        const oldCentre = child instanceof Phaser.GameObjects.Arc && Math.abs(c.x) < 1 && Math.abs(c.y) < 1;
        if ((badge && (child instanceof Phaser.GameObjects.Arc || child instanceof Phaser.GameObjects.Text)) || oldCentre) c.setVisible(false);
      }
      if (!token.getByName('player-ground-ch19')) {
        const colour = HUD_PLAYER_ACCENTS_VF04[player.id] ?? 0x765047;
        token.addAt(
          this.add.ellipse(0, 30, 66, 18, colour, 0.55).setStrokeStyle(2.5, 0xffffff, 0.85).setName('player-ground-ch19'),
          0,
        );
      }

      const sprite = runtime.characterWalkSpritesCh181?.get(player.id);
      if (!sprite?.active || runtime.cauCoRigPilotCh1822?.has(player.id)) continue;
      if (runtime.characterFaceCompositeImagesCh187?.get(player.id)?.visible) continue;

      const last = this.tokenStillCh19.get(player.id) ?? { x: token.x, y: token.y, stillMs: 0 };
      const moved = Math.hypot(token.x - last.x, token.y - last.y) > 0.45;
      last.stillMs = moved ? 0 : last.stillMs + delta;
      last.x = token.x;
      last.y = token.y;
      this.tokenStillCh19.set(player.id, last);

      const idleKey = `character-idle-ch19-${player.characterId ?? ''}`;
      const standing = this.textures.exists(idleKey);
      if (last.stillMs < IDLE_SETTLE_MS_CH19) {
        if (sprite.getData('idleArtCh19')) {
          sprite.setTexture(String(sprite.getData('walkTextureCh19')), Number(sprite.getData('walkFrameBaseCh1811') ?? 0));
          sprite.setData('idleArtCh19', false);
        }
        continue;
      }

      if (standing && !sprite.getData('idleArtCh19')) {
        sprite.setData('walkTextureCh19', sprite.texture.key).setData('idleArtCh19', true).setTexture(idleKey);
      } else if (!standing) {
        const base = Number(sprite.getData('walkFrameBaseCh1811') ?? 0);
        sprite.setFrame(base + (IDLE_WALK_FRAME_CH19[player.characterId ?? ''] ?? 0));
      }

      const sx = Number(sprite.getData('idleBaseScaleXCh1813') ?? sprite.scaleX);
      const sy = Number(sprite.getData('idleBaseScaleYCh1813') ?? sprite.scaleY);
      const t = (this.time.now + player.id * 410) / BREATH_PERIOD_MS_CH19 * Math.PI * 2;
      const breath = (Math.sin(t) + 1) / 2; // 0 = exhale, 1 = inhale
      sprite
        .setScale(sx * (1 - 0.012 * breath), sy * (1 + 0.032 * breath))
        .setY(8)
        .setAngle(Math.sin(t * 0.5) * 0.9);
    }
  }

  /* ------------------------------------------------------------------ player cards */

  private syncPlayerCardsCh19(): void {
    const runtime = this as unknown as {
      match?: MatchState;
      hud?: Map<number, { root: Phaser.GameObjects.Container }>;
      uiRoot?: Phaser.GameObjects.Container;
      currentPlayer?: () => PlayerState | undefined;
    };
    const match = runtime.match;
    if (!match) return;
    // Inherited corner HUDs keep updating underneath (their logic stays intact) but are not painted.
    for (const legacy of runtime.hud?.values() ?? []) if (legacy.root.alpha > 0) legacy.root.setAlpha(0);

    const current = runtime.currentPlayer?.();
    const top = Math.max(...match.players.map((p) => p.money));
    const leaders = match.players.filter((p) => p.money === top);

    for (const player of match.players) {
      const career = playerHudCareer065(player, JOBS_CH19);
      const active = player.id === current?.id;
      const model: PlayerCardModelCh19 = {
        playerId: player.id,
        name: player.name,
        money: player.money,
        handCount: player.handCardIds.length,
        handLimit: MVP_CARD_HAND_LIMIT,
        lockTurns: player.cardBlockTurns,
        laps: player.lapsCompleted ?? 0,
        jobLine: career.employed ? `${career.icon} ${career.title} Lv.${career.level} · ${career.salary}/vòng` : '💼 Chưa có nghề',
        characterId: player.characterId,
        faceTextureKey: gameSession.players[player.id]?.faces.neutral?.textureKey,
        active,
        leader: match.players.length > 1 && leaders.length === 1 && leaders[0].id === player.id,
      };
      const signature = playerCardSignatureCh19(model);
      const existing = this.playerCardsCh19.get(player.id);
      if (existing?.signature === signature) continue;

      const scale = active ? PLAYER_CARD_CH19.activeScale : PLAYER_CARD_CH19.idleScale;
      const pos = playerCardPositionCh19(player.id, scale);
      const card = buildPlayerCardCh19(this, model).setPosition(pos.x, pos.y).setScale(scale);
      if (runtime.uiRoot?.active) runtime.uiRoot.add(card);
      else card.setDepth(1000);
      existing?.card.destroy(true);
      this.playerCardsCh19.set(player.id, { card, signature, money: player.money, active });

      if (!existing) continue;
      if (existing.money !== player.money) this.popMoneyCh19(card, player.money - existing.money);
      if (active && !existing.active) {
        card.setScale(PLAYER_CARD_CH19.idleScale);
        this.tweens.add({ targets: card, scale, duration: 220, ease: 'Back.easeOut' });
      }
    }
  }

  private popMoneyCh19(card: Phaser.GameObjects.Container, delta: number): void {
    const money = card.getByName('player-card-money-ch19') as Phaser.GameObjects.Text | null;
    if (!money) return;
    money.setColor(delta >= 0 ? '#1f8a3d' : '#c62f2f');
    this.tweens.add({ targets: money, scale: { from: 1.35, to: 1 }, duration: 360, ease: 'Back.easeOut' });
    const float = this.add.text(money.x + 36, money.y - 6, `${delta >= 0 ? '+' : '−'}${Math.abs(delta)}`, {
      fontFamily: MOBILE_UI_FONT_07044, fontSize: '18px', fontStyle: 'bold',
      color: delta >= 0 ? '#1f8a3d' : '#c62f2f', stroke: '#ffffff', strokeThickness: 4,
    }).setOrigin(0, 0.5);
    card.add(float);
    this.tweens.add({ targets: float, y: float.y - 26, alpha: 0, duration: 900, ease: 'Sine.easeOut', onComplete: () => float.destroy() });
    this.time.delayedCall(700, () => { if (money.active) money.setColor('#3b2b27'); });
  }

  /* ------------------------------------------------------------------ legacy */

  private hideLegacyBoardCh19(): void {
    const positions = new Set(BOARD_CH19.nodes.map((node) => `${Math.round(node.x)}:${Math.round(node.y)}`));
    const atNode = (object: { x: number; y: number }) => positions.has(`${Math.round(object.x)}:${Math.round(object.y)}`);

    for (const object of this.children.list) {
      const depth = (object as Phaser.GameObjects.GameObject & { depth?: number }).depth ?? 0;
      // Flat green planes / blobs behind the board.
      if (depth < 0 && depth > SCENERY_DEPTH_CH19 - 10 && 'setAlpha' in object) {
        (object as unknown as { setAlpha(value: number): unknown }).setAlpha(0);
        continue;
      }
      // Edge lines (0.1.56.1) and the CH-17.5 path chrome.
      if (object instanceof Phaser.GameObjects.Graphics && depth <= 0.5) {
        object.setAlpha(0);
        continue;
      }
      // Canonical round tiles + CH-17.5 rectangle skins.
      if ((object instanceof Phaser.GameObjects.Arc || object instanceof Phaser.GameObjects.Rectangle) && depth === 4 && atNode(object)) {
        object.setAlpha(0.001);
        this.hiddenTileObjectsCh19.push(object);
        continue;
      }
      if (object instanceof Phaser.GameObjects.Graphics && object.name === 'board-tile-skin-ch175') {
        object.setAlpha(0);
        continue;
      }
      if (
        object instanceof Phaser.GameObjects.Text && depth === 5
        && BOARD_CH19.nodes.some((n) => Math.abs(n.x - object.x) < 4 && Math.abs(n.y - object.y) < 4)
      ) {
        object.setAlpha(0);
        this.hiddenTileTextsCh19.push(object);
        continue;
      }
      // 0.1.59 arena identity badges sit just under a tile at 7px: make them readable pills.
      if (
        object instanceof Phaser.GameObjects.Text && depth === 5
        && BOARD_CH19.nodes.some((n) => Math.abs(n.x - object.x) < 1 && object.y > n.y && object.y - n.y <= 60)
      ) {
        object
          .setFontFamily(MOBILE_UI_FONT_07044)
          .setFontSize(15)
          .setColor(ISLAND_PALETTE_CH19.navy)
          .setBackgroundColor('#ffffff')
          .setPadding(8, 3, 8, 3)
          .setY(object.y + 18)
          .setDepth(TILE_DEPTH_CH19 + 0.1);
      }
    }
  }

  /* ------------------------------------------------------------------ scenery */

  private async installIslandSceneryCh19(): Promise<void> {
    try {
      const scenery = buildCityIslandSceneryCh19(BOARD_CH19);
      if (!this.textures.exists(SCENERY_TEXTURE_CH19)) {
        const canvas = await rasterizeIslandSceneryCh19(scenery.svg, scenery.bounds);
        if (!this.sys.isActive() && !this.sys.isPaused()) return;
        if (!this.textures.exists(SCENERY_TEXTURE_CH19)) this.textures.addCanvas(SCENERY_TEXTURE_CH19, canvas);
      }
      if (!this.sys.isActive() && !this.sys.isPaused()) return;
      const b = scenery.bounds;
      this.islandSceneryCh19 = this.add.image(b.x, b.y, SCENERY_TEXTURE_CH19)
        .setOrigin(0, 0)
        .setDisplaySize(b.w, b.h)
        .setDepth(SCENERY_DEPTH_CH19)
        .setName('city-island-scenery-ch19')
        .setAlpha(0);
      this.tweens.add({ targets: this.islandSceneryCh19, alpha: 1, duration: 280, ease: 'Sine.easeOut' });
      this.installDistrictLabelsCh19(scenery.labels);
    } catch (error) {
      // Scenery is decorative: the board stays fully playable on the sea colour.
      console.warn('[CH-19] island scenery unavailable', error);
    }
  }

  private installDistrictLabelsCh19(labels: IslandLabelCh19[]): void {
    const placed: { x: number; y: number; w: number }[] = [];
    for (const label of labels) {
      const w = Math.max(label.title.length * 15 + 40, label.subtitle.length * 8.6 + 30);
      const clear = (y: number) =>
        BOARD_CH19.nodes.every((n) => Math.abs(n.x - label.x) > w / 2 + 50 || Math.abs(n.y - y) > 85)
        && placed.every((o) => Math.abs(o.x - label.x) > (o.w + w) / 2 + 20 || Math.abs(o.y - y) > 80);
      let y = label.y;
      for (let k = 0; k < 30 && !clear(y); k++) y = label.y + (k % 2 ? 1 : -1) * 24 * Math.ceil((k + 1) / 2);
      placed.push({ x: label.x, y, w });

      const root = this.add.container(label.x, y).setDepth(LABEL_DEPTH_CH19).setName('city-island-label-ch19');
      const plate = this.add.graphics();
      plate.fillStyle(0x14243f, 0.35).fillRoundedRect(-w / 2, -26, w, 62, 14);
      plate.fillStyle(num(ISLAND_PALETTE_CH19.navy), 1).fillRoundedRect(-w / 2, -31, w, 62, 14);
      plate.lineStyle(3, 0xffffff, 1).strokeRoundedRect(-w / 2, -31, w, 62, 14);
      const title = this.add.text(0, -9, label.title, {
        fontFamily: MOBILE_UI_FONT_07044, fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      const subtitle = this.add.text(0, 16, label.subtitle, {
        fontFamily: MOBILE_UI_FONT_07044, fontSize: '14px', color: '#c9e4ff',
      }).setOrigin(0.5);
      root.add([plate, title, subtitle]);
      this.islandLabelsCh19.push(root);
    }
  }

  /* ------------------------------------------------------------------ tiles */

  private matchCh19(): MatchState | undefined {
    return (this as unknown as { match?: MatchState }).match;
  }

  private syncIslandTilesCh19(animate: boolean): void {
    const assignments = this.matchCh19()?.boardContentAssignments;
    const signature = (assignments ?? []).map((a) => `${a.nodeId}>${a.sourceNodeId}`).join(',');
    if (signature === this.islandSignatureCh19 && this.islandTilesCh19.size > 0) return;
    const firstDraw = this.islandTilesCh19.size === 0;
    this.islandSignatureCh19 = signature;

    BOARD_CH19.nodes.forEach((target, index) => {
      const node = effectiveBoardNode071(BOARD_CH19, target.id, assignments);
      const look = this.tileLookCh19(target, node);
      const key = JSON.stringify(look);
      const existing = this.islandTilesCh19.get(target.id);
      if (existing?.getData('look') === key) return;
      existing?.destroy(true);

      const tile = this.drawTileCh19(target, look).setData('look', key);
      this.islandTilesCh19.set(target.id, tile);
      if (animate && !firstDraw) {
        tile.setScale(0.6).setAlpha(0);
        this.tweens.add({
          targets: tile, scale: 1, alpha: 1, duration: 260, delay: (index % 12) * 28, ease: 'Back.easeOut',
        });
      }
    });
  }

  private tileLookCh19(position: BoardNode, node: BoardNode): TileLook {
    const c = node.contentId ?? '';
    const C = TILE_COLORS_CH19;
    if (node.type === 'ready') return { kind: 'start' };
    if (c === 'SPECIAL_JAIL_HOLD') return { kind: 'disc', color: C.orange, symbol: 'TÙ', big: true };
    if (c === 'SPECIAL_HOSPITAL_HOLD') return { kind: 'disc', color: C.pink, symbol: '✚', big: true };
    if (c === 'SPECIAL_JAIL_GATE') return { kind: 'disc', color: C.orange, symbol: 'J' };
    if (c === 'SPECIAL_HOSPITAL_GATE') return { kind: 'disc', color: C.pink, symbol: 'H' };
    if (c === 'SPECIAL_LOTTERY') return { kind: 'disc', color: C.pink, symbol: '♥' };
    if (c.startsWith('JAIL_EXIT_') || c.startsWith('HOSPITAL_EXIT_')) {
      const v = node.value ?? 0;
      return { kind: 'disc', color: c.startsWith('JAIL') ? C.orange : C.pink, symbol: `${v >= 0 ? '+' : '−'}${Math.abs(v)}`, small: true };
    }
    if (node.feature === 'job') return { kind: 'disc', color: C.blue, symbol: '💼' };
    if (node.feature === 'minigame') return { kind: 'disc', color: C.green, symbol: '★' };
    if (node.type === 'card') return { kind: 'disc', color: C.purple, symbol: '?' };
    if (node.type === 'news') return { kind: 'disc', color: C.red, symbol: '!' };
    if (node.type === 'money') {
      const v = node.value ?? 0;
      return v >= 0
        ? { kind: 'disc', color: C.gold, symbol: `+${v}`, small: true }
        : { kind: 'disc', color: C.slate, symbol: `−${Math.abs(v)}`, small: true };
    }
    return { kind: 'plain', symbol: this.tileNumbersCh19.get(position.id) ?? '' };
  }

  private drawTileCh19(node: BoardNode, look: TileLook): Phaser.GameObjects.Container {
    const root = this.add.container(node.x, node.y).setDepth(TILE_DEPTH_CH19).setName('city-island-tile-ch19');
    const g = this.add.graphics();
    root.add(g);

    if (look.kind === 'start') {
      g.fillStyle(0x14243f, 0.32).fillEllipse(0, 8, 190, 132);
      g.fillStyle(0xffffff, 1).fillEllipse(0, 0, 184, 128);
      g.fillStyle(TILE_COLORS_CH19.green, 1).fillEllipse(0, 0, 168, 112);
      root.add(this.add.text(0, -6, 'START', {
        fontFamily: MOBILE_UI_FONT_07044, fontSize: '42px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#1f6b33', strokeThickness: 8,
      }).setOrigin(0.5));
      root.add(this.add.text(0, 30, 'Bắt đầu hành trình!', {
        fontFamily: MOBILE_UI_FONT_07044, fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#1f6b33', strokeThickness: 5,
      }).setOrigin(0.5));
      return root;
    }

    if (look.kind === 'plain') {
      g.fillStyle(0x14243f, 0.3).fillEllipse(0, 7, 92, 80);
      g.fillStyle(0xd5dbe6, 1).fillEllipse(0, 0, 94, 82);
      g.fillStyle(0xffffff, 1).fillEllipse(0, 0, 88, 76);
      g.fillStyle(0xe9edf4, 1).fillEllipse(0, 8, 80, 58);
      g.fillStyle(0xffffff, 1).fillEllipse(0, 2, 80, 64);
      const symbol = look.symbol ?? '';
      root.add(this.add.text(0, 1, symbol, {
        fontFamily: MOBILE_UI_FONT_07044, fontSize: symbol.length > 2 ? '24px' : '30px', fontStyle: 'bold', color: '#3b4560',
      }).setOrigin(0.5));
      return root;
    }

    const r = look.big ? 58 : 44;
    const color = look.color ?? TILE_COLORS_CH19.slate;
    g.fillStyle(0x14243f, 0.32).fillCircle(0, 7, r + 5);
    g.fillStyle(0xffffff, 1).fillCircle(0, 0, r + 5);
    g.fillStyle(color, 1).fillCircle(0, 0, r);
    g.fillStyle(num(shadeCh19(hex(color), 0.14)), 1).fillCircle(0, 0, r - 7);
    g.lineStyle(5, 0xffffff, 0.55);
    g.beginPath();
    g.arc(0, 0, r * 0.68, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(265));
    g.strokePath();

    const symbol = look.symbol ?? '';
    const emoji = /\p{Extended_Pictographic}/u.test(symbol);
    const size = look.big ? (symbol.length > 1 ? 30 : 54) : look.small ? 27 : 46;
    root.add(this.add.text(0, 1, symbol, {
      fontFamily: MOBILE_UI_FONT_07044,
      fontSize: `${emoji ? 38 : size}px`,
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: shadeCh19(hex(color), -0.45),
      strokeThickness: emoji ? 0 : look.small ? 5 : 6,
    }).setOrigin(0.5));
    return root;
  }
}

/** Main loop numbered 1..n from START; branch tiles keep their A1/B2/C3 ids. */
function tileNumbersCh19(board: BoardDefinition): Map<number, string> {
  const next = new Map<number, number>();
  for (const e of board.edges) if (e.route === 'main') next.set(e.from, e.to);
  const labels = new Map<number, string>();
  let index = 0;
  for (let id = next.get(board.startNodeId); id !== undefined && id !== board.startNodeId; id = next.get(id)) {
    labels.set(id, String(++index));
  }
  for (const node of board.nodes) {
    const c = node.contentId ?? '';
    if (/^[A-Z]\d$/.test(c)) labels.set(node.id, c);
  }
  return labels;
}
