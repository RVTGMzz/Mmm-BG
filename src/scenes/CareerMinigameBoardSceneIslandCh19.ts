import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, BoardNode, PlayerState } from '../core/types';
import type { JobDefinition } from '../core/jobs';
import { effectiveBoardNode071 } from '../core/lapShuffle071';
import { specialHoldNodeId057 } from '../core/specialLocations057';
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
import { installIslandPropsCh19, preloadIslandPropsCh19 } from '../ui/islandPropsCh19';
import { RescueVehiclesCh19, preloadRescueVehiclesCh19 } from '../ui/rescueVehiclesCh19';
import { diceSpritesReadyCh19, playDiceRollCh19 } from '../ui/diceRollCh19';
import { graphicsBoundsCh19, preloadUiKitCh19, reskinGraphicsCh19, trackGraphicsBoundsCh19, uiIconCh19, uiPanelCh19, uiPillCh19, uiReadyCh19 } from '../ui/uiKitCh19';
import { diceSettleFeedbackCh09 } from '../ui/presentationFeedbackCh09';
import { sfxController } from '../audio/sfxController';
import type { PresentationEventModel } from '../ui/presentationModel';
import { HUD_PLAYER_ACCENTS_VF04 } from '../ui/visualFoundationHudVf04';
import { CareerMinigameBoardSceneCh173 } from './CareerMinigameBoardSceneCh173';
import { TurnSpotlightCh19, type SpotlightPlayerCh19 } from '../ui/turnSpotlightCh19';
import { partyBoxCh19, partyPillShapeCh19, preloadPartyKitCh19 } from '../ui/partyKitCh19';
import { stageRectCh19 } from '../ui/responsiveStageCh19';
import { browserSession } from '../core/browserSession';
import { shopForNodeCh19 } from '../core/shopTilesCh19';
import { installMiniGamePartyCh19, preloadMiniGamePartyCh19 } from '../ui/miniGamePartyCh19';

const BOARD_CH19 = boardJson as BoardDefinition;
/** Sole line of the CH-19 character strips (fraction of the 192px frame). */
const FEET_LINE_CH19 = 0.93;

/** Soft dark contact shadow (radial falloff), drawn once into a texture. */
function contactShadowKeyCh19(scene: Phaser.Scene): string {
  const key = 'character-contact-shadow-ch19';
  if (scene.textures.exists(key)) return key;
  const w = 84, h = 26;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex?.getContext();
  if (!tex || !ctx) return key;
  ctx.save();
  ctx.scale(1, h / w);
  const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  g.addColorStop(0, 'rgba(20,40,20,0.42)');
  g.addColorStop(0.55, 'rgba(20,40,20,0.26)');
  g.addColorStop(1, 'rgba(20,40,20,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, w);
  ctx.restore();
  tex.refresh();
  return key;
}
/** Jail / Hospital hold tiles (specialHoldNodeId057). */
const HOLD_NODE_CH19 = { jail: specialHoldNodeId057('jail'), hospital: specialHoldNodeId057('hospital') } as const;
const JOBS_CH19 = jobsJson as JobDefinition[];
const SCENERY_TEXTURE_CH19 = 'city-island-scenery-ch19';
const SCENERY_DEPTH_CH19 = -45;
// Above the live trees/buildings (-39..-2), below tiles (4.2).
const LABEL_DEPTH_CH19 = -1;
const TILE_DEPTH_CH19 = 4.2;

/**
 * Walk strips have no standing pose; when a Character is still we hold the
 * frame with the narrowest stance (measured from the strips) and breathe.
 */
const IDLE_WALK_FRAME_CH19: Readonly<Record<string, number>> = {
  'starter-crybaby': 4,
  'starter-grumpy': 1,
  'starter-anxious': 7,
  'starter-hyper': 3,
  'secret-baby': 2,
};
/**
 * CH-19 idle strips (8 x 192px, front view): frame 0 is the calm pose used for
 * breathing, frames 1..7 are a short personality action played every so often.
 */
const IDLE_STRIP_CH19: Readonly<Record<string, string>> = {
  'starter-grumpy': 'assets/characters/ch19/idle-cau-co-ch19.png',
  'starter-crybaby': 'assets/characters/ch19/idle-khoc-nhe-ch19.png',
  'starter-anxious': 'assets/characters/ch19/idle-lo-lang-ch19.png',
  'starter-hyper': 'assets/characters/ch19/idle-tang-dong-ch19.png',
  'secret-baby': 'assets/characters/ch19/idle-secret-baby-ch19.png',
};
const IDLE_ACTION_FRAMES_CH19 = 7;
const IDLE_ACTION_FRAME_MS_CH19 = 150;
const idleKeyCh19 = (characterId: string): string => `character-idle-ch19-${characterId}`;
/** Deterministic 6–12 s pause between idle actions (presentation only, no gameplay RNG). */
function idleActionDelayCh19(playerId: number, count: number): number {
  const h = Math.sin((playerId + 1) * 12.9898 + (count + 1) * 78.233) * 43758.5453;
  return 6000 + (h - Math.floor(h)) * 6000;
}

/**
 * CH-19 walk strips generated from the approved concept sheets (8 x 192px,
 * same format as the CH-18 production strips). A Character listed here swaps
 * to the new strip; everyone else keeps the CH-18 art.
 */
const WALK_STRIP_CH19: Readonly<Record<string, { path: string; idleFrame: number }>> = {
  'starter-grumpy': { path: 'assets/characters/ch19/walk-cau-co-ch19.png', idleFrame: 2 },
  'starter-crybaby': { path: 'assets/characters/ch19/walk-khoc-nhe-ch19.png', idleFrame: 6 },
  'starter-anxious': { path: 'assets/characters/ch19/walk-lo-lang-ch19.png', idleFrame: 2 },
  'starter-hyper': { path: 'assets/characters/ch19/walk-tang-dong-ch19.png', idleFrame: 2 },
  'secret-baby': { path: 'assets/characters/ch19/crawl-secret-baby-ch19.png', idleFrame: 0 },
};
const walkKeyCh19 = (characterId: string): string => `character-walk-ch19-${characterId}`;
const IDLE_SETTLE_MS_CH19 = 140;
const BREATH_PERIOD_MS_CH19 = 2600;

type TileLook = {
  kind: 'start' | 'plain' | 'disc' | 'shop' | 'none';
  building?: string;
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
  private rescueCh19?: RescueVehiclesCh19;
  private spotlightCh19?: TurnSpotlightCh19;
  /** Whose turn is being shown (presentation lags the state, which may already be on the next player). */
  private actorCh19?: number;
  /** building doors from the scenery (board node id -> door), and who is inside one */
  private doorsCh19 = new Map<number, { x: number; y: number }>();
  private readonly insideCh19 = new Map<number, { kind: 'hold'; x: number; y: number }>();
  /** a short, self-contained job-centre visit (walk in, wait, walk back out) */
  private readonly visitCh19 = new Map<number, { token: Phaser.GameObjects.Container; x: number; y: number; tweens: Phaser.Tweens.Tween[]; timer?: Phaser.Time.TimerEvent }>();

  preload(): void {
    super.preload();
    preloadIslandPropsCh19(this);
    preloadUiKitCh19(this);
    preloadPartyKitCh19(this);
    preloadMiniGamePartyCh19(this);
    trackGraphicsBoundsCh19();
    preloadRescueVehiclesCh19(this);
    if (!this.textures.exists(PORTRAIT_STARTERS_KEY_CH19)) {
      this.load.spritesheet(PORTRAIT_STARTERS_KEY_CH19, publicAssetUrl(PORTRAIT_STARTERS_PATH_CH19), {
        frameWidth: PORTRAIT_CELL_CH19, frameHeight: PORTRAIT_CELL_CH19,
      });
    }
    for (const [id, strip] of Object.entries(WALK_STRIP_CH19)) {
      if (!this.textures.exists(walkKeyCh19(id))) {
        this.load.spritesheet(walkKeyCh19(id), publicAssetUrl(strip.path), { frameWidth: 192, frameHeight: 192 });
      }
    }
    for (const [id, path] of Object.entries(IDLE_STRIP_CH19)) {
      if (!this.textures.exists(idleKeyCh19(id))) {
        this.load.spritesheet(idleKeyCh19(id), publicAssetUrl(path), { frameWidth: 192, frameHeight: 192 });
      }
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
    this.rescueCh19 = new RescueVehiclesCh19(this);
    this.installDiceRollCh19();
    this.installRescueMoveCh19();
    this.installJobVisitCh19();
    installMiniGamePartyCh19(this);
    // Let the first board frame render before the one-off scenery build.
    this.time.delayedCall(0, () => { void this.installIslandSceneryCh19(); });

    this.spotlightCh19 = new TurnSpotlightCh19(this, {
      players: () => this.spotlightPlayersCh19(),
      roll: () => this.pressDirectDiceCh19(),
      useCard: () => (this as unknown as { compactCard?: Phaser.GameObjects.Rectangle }).compactCard?.emit('pointerdown'),
      // a fresh page is the cleanest way out of every transport / session
      leave: () => { window.location.href = window.location.pathname; },
    });
    this.syncPlayerCardsCh19();

    const cleanup = () => {
      this.spotlightCh19?.destroy();
      this.spotlightCh19 = undefined;
      this.actorCh19 = undefined;
      this.insideCh19.clear();
      this.visitCh19.clear();
      this.doorsCh19 = new Map();
      this.playerCardsCh19.clear();
      this.rescueCh19 = undefined;
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
    this.syncTurnSpotlightCh19();
    this.syncBuildingVisitsCh19();
    this.syncPlayerCardsCh19();
    this.syncCharacterTokensCh19();
    this.syncActionButtonsCh19();
    this.syncPopupSkinsCh19();
    this.syncRescueRidesCh19();
  }

  /* ------------------------------------------------------------------ painted popups (UI kit) */

  /**
   * Older popup layers draw flat cream panels and pill buttons with Graphics.
   * Swap them for the painted, concept-matched UI kit at exactly the same box.
   */
  private syncPopupSkinsCh19(): void {
    if (!uiReadyCh19(this, 'panel-coral') || !uiReadyCh19(this, 'btn-coral')) return;
    const PANELS: Record<string, 'panel-coral' | 'panel-lilac'> = {
      'presentation-landing-card-ch1713': 'panel-coral',
      'job-presentation-card': 'panel-coral',
      'character-passive-presentation-ch05': 'panel-coral',
      'presentation-cinematic-card-ch1713': 'panel-coral',
      'card-presentation-card': 'panel-lilac',
    };
    const visit = (list: Phaser.GameObjects.GameObject[]) => {
      for (const o of list) {
        if (!(o instanceof Phaser.GameObjects.Container) || !o.active) continue;
        const graphics = o.list.filter((c): c is Phaser.GameObjects.Graphics => c instanceof Phaser.GameObjects.Graphics && !c.getData('ch19-skin'));
        const panelKey = PANELS[o.name];
        if (panelKey) {
          // the panel is the biggest flat box the older layers drew; every other
          // box of about that size (drop shadows, re-laid duplicates) goes too
          const sized = graphics
            .map((g) => ({ g, b: graphicsBoundsCh19(g) }))
            .filter((e): e is { g: Phaser.GameObjects.Graphics; b: NonNullable<typeof e.b> } => Boolean(e.b))
            // full-screen dimmers are not panels (they grow with the stage on 4:3)
            .filter((e) => !(e.b.w * (e.g.scaleX || 1) >= 1000 || e.b.h * (e.g.scaleY || 1) >= 600))
            .map((e) => ({ ...e, area: e.b.w * e.b.h }));
          const biggest = sized.reduce<typeof sized[number] | undefined>((m, e) => (!m || e.area > m.area ? e : m), undefined);
          if (biggest) {
            const big = sized.filter((e) => e.area >= biggest.area * 0.6);
            // the panel is the top-most of those (the ones under it are its drop shadows)
            const panel = big[big.length - 1];
            for (const e of big) if (e !== panel && e.g.alpha > 0) e.g.setAlpha(0);
            reskinGraphicsCh19(this, o, panel.g, (w, h) => partyBoxCh19(this, 0, 0, w + 4, h + 4, panelKey === 'panel-lilac' ? 0xf1e6ff : 0xfff6e0, { radius: 26, ring: 7, gloss: false, fillBottom: panelKey === 'panel-lilac' ? 0xe2d0ff : 0xffe7bd }));
          }
        } else if (o.name === 'presentation-continue-chip-ch1713') {
          const label = o.list.find((c): c is Phaser.GameObjects.Text => c instanceof Phaser.GameObjects.Text);
          const skip = /BỎ QUA/.test(label?.text ?? '');
          const button = graphics[1] ?? graphics[0];
          if (button) reskinGraphicsCh19(this, o, button, (w, h) => partyPillShapeCh19(this, w + 8, h + 6, skip ? 0x5b7fa8 : 0xf2549c));
          if (graphics.length > 1 && graphics[0].alpha > 0) graphics[0].setAlpha(0); // the old flat drop shadow
        }
        visit(o.list);
      }
    };
    visit(this.children.list);
  }

  /* ------------------------------------------------------------------ jail / hospital rides */

  /** Keeps riders hidden and the camera on the vehicle while a ride is on screen. */
  private syncRescueRidesCh19(): void {
    this.rescueCh19?.update();
  }

  /**
   * The capture itself: replay sends the player to the Jail / Hospital with one
   * special move_step (gate -> hold node). Instead of walking that step, the
   * police car / ambulance picks the Character up where it stands and drops it
   * at the hold tile; the step only finishes once the Character is inside, so
   * it never reappears at the gate or walks there by itself.
   */
  private installRescueMoveCh19(): void {
    type Runtime = {
      visuals?: Map<number, { token: Phaser.GameObjects.Container }>;
      characterWalkSpritesCh181?: Map<number, Phaser.GameObjects.Sprite>;
      overviewMode?: boolean;
      animateMoveStep(internals: { visuals: Map<number, { token: Phaser.GameObjects.Container }> }, model: PresentationEventModel): Promise<void>;
    };
    const runtime = this as unknown as Runtime;
    const inherited = runtime.animateMoveStep.bind(this);
    runtime.animateMoveStep = (internals, model) => {
      const from = model.fromNodeId, to = model.toNodeId, playerId = model.actorId;
      if (playerId !== undefined) this.actorCh19 = playerId;
      if (playerId !== undefined) this.cancelJobVisitCh19(playerId);
      const kind = to === HOLD_NODE_CH19.jail ? 'jail' : to === HOLD_NODE_CH19.hospital ? 'hospital' : undefined;
      const fromHold = from === HOLD_NODE_CH19.jail || from === HOLD_NODE_CH19.hospital;
      const token = playerId === undefined ? undefined : internals.visuals.get(playerId)?.token;
      if (!kind || fromHold || from === undefined || !token?.active || !this.rescueCh19?.canPlay(kind)) return inherited(internals, model);
      const fromNode = BOARD_CH19.nodes.find((n) => n.id === from);
      const toNode = BOARD_CH19.nodes.find((n) => n.id === to);
      if (!fromNode || !toNode) return inherited(internals, model);
      if (playerId !== undefined && Math.hypot(token.x - toNode.x, token.y - toNode.y) < 90) {
        // landed on the door mat: walk straight in
        return this.enterBuildingCh19(playerId, token, toNode.id, 'hold');
      }
      // keep the token's little per-player offset on the destination tile
      const off = Math.hypot(token.x - fromNode.x, token.y - fromNode.y) < 70 ? { x: token.x - fromNode.x, y: token.y - fromNode.y } : { x: 0, y: 0 };
      const dest = { x: toNode.x + off.x, y: toNode.y + off.y };
      const sprite = playerId === undefined ? undefined : runtime.characterWalkSpritesCh181?.get(playerId);
      this.tweens.killTweensOf(token);
      return new Promise<void>((resolve) => {
        this.rescueCh19!.play({
          kind,
          from: { x: token.x, y: token.y },
          to: dest,
          token,
          rider: sprite ? { texture: sprite.texture.key, frame: sprite.frame.name, scale: sprite.scaleX } : undefined,
          followCamera: !runtime.overviewMode,
          onArrive: () => { this.tweens.killTweensOf(token); token.setPosition(dest.x, dest.y); resolve(); },
        });
      });
    };
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
        let pill: Phaser.GameObjects.GameObject;
        if (uiReadyCh19(this, 'btn-coral')) {
          pill = uiPillCh19(this, 'btn-coral', 250, 62).setPosition(0, 77).setName('dice-action-pill-ch19');
        } else {
          const g = this.add.graphics().setName('dice-action-pill-ch19');
          g.fillStyle(0x14243f, 0.28).fillRoundedRect(-118, 60, 236, 54, 27);
          g.fillStyle(0xb8342c, 1).fillRoundedRect(-118, 56, 236, 54, 27);
          g.fillStyle(0xf2554a, 1).fillRoundedRect(-118, 50, 236, 54, 27);
          g.fillStyle(0xffffff, 0.28).fillRoundedRect(-102, 55, 204, 11, 6);
          g.lineStyle(3.5, 0xffffff, 1).strokeRoundedRect(-118, 50, 236, 54, 27);
          pill = g;
        }
        const label = this.add.text(0, 74, 'TUNG XÚC XẮC', {
          fontFamily: MOBILE_UI_FONT_07044, fontSize: '23px', fontStyle: 'bold', color: '#ffffff',
          stroke: '#8f2620', strokeThickness: 5,
        }).setOrigin(0.5).setName('dice-action-label-ch19');
        const keys = this.add.text(0, 124, 'Space · chạm', {
          fontFamily: MOBILE_UI_FONT_07044, fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
          stroke: '#3b2b27', strokeThickness: 4,
        }).setOrigin(0.5).setName('dice-action-keys-ch19');
        dice.add([pill, label, keys]);
        // painted die in place of the flat vector one, with an inviting little hop
        if (this.textures.exists('dice-ch19-dice-top-5')) {
          const die = this.add.image(0, -6, 'dice-ch19-dice-top-5').setName('dice-action-die-ch19');
          die.setScale(104 / Math.max(die.width, die.height));
          dice.add(die);
          this.tweens.add({ targets: die, y: -14, angle: { from: -4, to: 4 }, duration: 640, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
      }
      // keep the older die art hidden (it is redrawn by older layers)
      if (dice.getByName('dice-action-die-ch19')) {
        for (const child of dice.list) {
          const go = child as Phaser.GameObjects.GameObject & { alpha?: number; setAlpha?: (a: number) => unknown; name: string };
          if (/-ch19$/.test(go.name) || child instanceof Phaser.GameObjects.Rectangle) continue;
          if (child instanceof Phaser.GameObjects.Text && /TUNG|Space/.test(child.text)) continue;
          if (go.alpha !== undefined && go.alpha > 0) go.setAlpha?.(0);
        }
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
      const stage = stageRectCh19(this);
      dice.setX(640).setY(stage.y + stage.h - 12 - 146);
      if (this.spotlightCh19?.visible && dice.alpha > 0) dice.setAlpha(0);
    }

    const card = runtime.compactCard;
    const cardText = runtime.compactCardText;
    if (card?.active && cardText?.active) {
      const stage = stageRectCh19(this);
      const spot = Boolean(this.spotlightCh19?.visible);
      const x = spot ? -9999 : 900, y = stage.y + stage.h - 56;
      card.setPosition(x, y).setDisplaySize(170, 60).setAlpha(0.001);
      cardText.setPosition(x, y).setAlpha(0);
      runtime.compactCardSkin0701?.setAlpha(0);
      const visible = card.visible && cardText.visible && !spot;
      const player = runtime.currentPlayer?.();
      const hand = player?.handCardIds.length ?? 0;
      const canUse = runtime.match?.turn.phase === 'PRE_ROLL_ACTION' && hand > 0;
      const key = `${visible}|${canUse}|${hand}|${player?.cardBlockTurns ?? 0}|${y}`;
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
    if (uiReadyCh19(this, 'btn-blue') && uiReadyCh19(this, 'icon-card')) {
      root.add(uiPillCh19(this, canUse ? 'btn-blue' : 'btn-slate', 182, 66).setPosition(0, -2));
      root.add(uiIconCh19(this, 'icon-card', -60, -3, 42).setAngle(-8));
      root.add(this.add.text(-32, -13, 'LÁ BÀI', {
        fontFamily: MOBILE_UI_FONT_07044, fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
        stroke: canUse ? '#123f86' : '#4a4f5c', strokeThickness: 5,
      }).setOrigin(0, 0.5));
      root.add(this.add.text(-32, 11, lock > 0 ? `🔒 khóa ${lock} lượt` : `${hand}/${MVP_CARD_HAND_LIMIT}${canUse ? ' · dùng' : ''}`, {
        fontFamily: MOBILE_UI_FONT_07044, fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
        stroke: canUse ? '#123f86' : '#4a4f5c', strokeThickness: 3,
      }).setOrigin(0, 0.5));
      return root;
    }
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
      // a soft contact shadow reads as standing on the tile; outlined rings looked like stickers
      if (!token.getByName('player-ground-ch19')) {
        token.addAt(this.add.image(0, 17, contactShadowKeyCh19(this)).setName('player-ground-ch19'), 0);
      }
      for (const child of token.list) {
        if (/^character-foot-ring-ch189/.test(child.name)) {
          const ring = child as Phaser.GameObjects.Ellipse;
          if (ring.alpha > 0) ring.setAlpha(0);
        }
      }

      const sprite = runtime.characterWalkSpritesCh181?.get(player.id);
      // the shadow sits right under the feet (strips have their soles at 93% of the frame)
      const ground = token.getByName('player-ground-ch19') as Phaser.GameObjects.Image | null;
      if (ground && sprite?.active && sprite.visible) {
        const feetY = sprite.y + (FEET_LINE_CH19 - sprite.originY) * sprite.displayHeight - 2;
        ground.setPosition(sprite.x, feetY).setScale(Math.max(0.45, sprite.displayWidth * 0.62 / 84), Math.max(0.45, sprite.displayWidth * 0.62 / 84) * 0.9);
      }
      if (!sprite?.active || runtime.cauCoRigPilotCh1822?.has(player.id)) continue;
      if (runtime.characterFaceCompositeImagesCh187?.get(player.id)?.visible) continue;

      const strip = WALK_STRIP_CH19[player.characterId ?? ''];
      if (strip && !sprite.getData('walkCh19') && this.textures.exists(walkKeyCh19(player.characterId ?? ''))) {
        sprite.setData('walkCh19', true).setData('walkFrameBaseCh1811', 0);
        sprite.setTexture(walkKeyCh19(player.characterId ?? ''), 0);
      }

      const last = this.tokenStillCh19.get(player.id) ?? { x: token.x, y: token.y, stillMs: 0 };
      const moved = Math.hypot(token.x - last.x, token.y - last.y) > 0.45;
      last.stillMs = moved ? 0 : last.stillMs + delta;
      last.x = token.x;
      last.y = token.y;
      this.tokenStillCh19.set(player.id, last);

      const idleKey = idleKeyCh19(player.characterId ?? '');
      const hasIdleStrip = this.textures.exists(idleKey);
      if (last.stillMs < IDLE_SETTLE_MS_CH19) {
        if (sprite.getData('idleArtCh19')) {
          sprite.setTexture(String(sprite.getData('walkTextureCh19')), Number(sprite.getData('walkFrameBaseCh1811') ?? 0));
          sprite.setData('idleArtCh19', false);
        }
        sprite.setData('idleActionStartCh19', undefined);
        continue;
      }

      const sx = Number(sprite.getData('idleBaseScaleXCh1813') ?? sprite.scaleX);
      const sy = Number(sprite.getData('idleBaseScaleYCh1813') ?? sprite.scaleY);
      const now = this.time.now;

      if (hasIdleStrip) {
        if (!sprite.getData('idleArtCh19')) {
          sprite.setData('walkTextureCh19', sprite.texture.key).setData('idleArtCh19', true).setTexture(idleKey, 0).setFlipX(false);
          sprite.setData('idleActionCountCh19', 0).setData('idleNextActionCh19', now + idleActionDelayCh19(player.id, 0));
        }
        // Once in a while: play the personality action (frames 1..7), then back to breathing.
        const start = sprite.getData('idleActionStartCh19') as number | undefined;
        if (start === undefined && now >= Number(sprite.getData('idleNextActionCh19'))) {
          sprite.setData('idleActionStartCh19', now);
        }
        const actionStart = sprite.getData('idleActionStartCh19') as number | undefined;
        if (actionStart !== undefined) {
          const step = Math.floor((now - actionStart) / IDLE_ACTION_FRAME_MS_CH19);
          if (step < IDLE_ACTION_FRAMES_CH19) {
            sprite.setFrame(1 + step).setScale(sx, sy).setY(8).setAngle(0);
            continue;
          }
          const count = Number(sprite.getData('idleActionCountCh19') ?? 0) + 1;
          sprite.setData('idleActionStartCh19', undefined).setData('idleActionCountCh19', count)
            .setData('idleNextActionCh19', now + idleActionDelayCh19(player.id, count));
        }
        sprite.setFrame(0);
      } else {
        const base = Number(sprite.getData('walkFrameBaseCh1811') ?? 0);
        const idleFrame = sprite.getData('walkCh19') ? (strip?.idleFrame ?? 0) : (IDLE_WALK_FRAME_CH19[player.characterId ?? ''] ?? 0);
        sprite.setFrame(base + idleFrame);
      }

      const t = (now + player.id * 410) / BREATH_PERIOD_MS_CH19 * Math.PI * 2;
      const breath = (Math.sin(t) + 1) / 2; // 0 = exhale, 1 = inhale
      sprite
        .setScale(sx * (1 - 0.012 * breath), sy * (1 + 0.032 * breath))
        .setY(8)
        .setAngle(hasIdleStrip ? 0 : Math.sin(t * 0.5) * 0.9);
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
    const actorId = this.actorCh19 ?? current?.id;
    const stage = stageRectCh19(this);
    const spot = Boolean(this.spotlightCh19?.visible);
    for (const entry of this.playerCardsCh19.values()) {
      const want = spot ? 0 : 1;
      if (entry.card.getData('fade') !== want) {
        entry.card.setData('fade', want);
        this.tweens.killTweensOf(entry.card);
        this.tweens.add({ targets: entry.card, alpha: want, duration: want ? 260 : 160 });
      }
    }
    const top = Math.max(...match.players.map((p) => p.money));
    const leaders = match.players.filter((p) => p.money === top);

    for (const player of match.players) {
      const career = playerHudCareer065(player, JOBS_CH19);
      const active = player.id === actorId;
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
      const signature = `${playerCardSignatureCh19(model)}|${stage.w}x${stage.h}`;
      const existing = this.playerCardsCh19.get(player.id);
      if (existing?.signature === signature) continue;

      const scale = active ? PLAYER_CARD_CH19.activeScale : PLAYER_CARD_CH19.idleScale;
      const pos = playerCardPositionCh19(player.id, scale);
      // corners follow the real screen edges on any aspect ratio
      pos.x += pos.x < 640 ? stage.x : stage.x + stage.w - 1280;
      pos.y += pos.y < 360 ? stage.y : stage.y + stage.h - 720;
      const card = buildPlayerCardCh19(this, model).setPosition(pos.x, pos.y).setScale(scale);
      card.setData('fade', spot ? 0 : 1).setAlpha(spot ? 0 : 1);
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

  /* ------------------------------------------------------------------ turn spotlight */

  private spotlightPlayersCh19(): SpotlightPlayerCh19[] {
    const match = this.matchCh19();
    if (!match) return [];
    return match.players.map((player) => {
      const career = playerHudCareer065(player, JOBS_CH19);
      return {
        id: player.id,
        name: player.name,
        money: player.money,
        handCount: player.handCardIds.length,
        handLimit: MVP_CARD_HAND_LIMIT,
        lockTurns: player.cardBlockTurns,
        laps: player.lapsCompleted ?? 0,
        characterId: player.characterId,
        jobLine: career.employed ? `${career.icon} ${career.title} Lv.${career.level} · ${career.salary}/vòng` : '💼 Chưa có nghề',
        isCpu: browserSession.isCpuSeat(player.id),
        hold: player.specialHold,
      };
    });
  }

  private pressDirectDiceCh19(): void {
    const dice = (this as unknown as { directDice?: Phaser.GameObjects.Container }).directDice;
    const hit = dice?.list.find((c) => c instanceof Phaser.GameObjects.Rectangle && c.input?.enabled);
    hit?.emit('pointerdown');
  }

  /**
   * When a turn opens (before the roll), the turn owner gets the big portrait
   * and, if this screen controls them, the action menu; other cards step aside.
   */
  private syncTurnSpotlightCh19(): void {
    const runtime = this as unknown as {
      match?: MatchState;
      currentPlayer?: () => PlayerState | undefined;
      directDice?: Phaser.GameObjects.Container;
      presentation?: { isBlocking(): boolean };
      cardPickerOpen?: boolean;
    };
    const match = runtime.match;
    const spot = this.spotlightCh19;
    if (!match || !spot) return;
    const current = runtime.currentPlayer?.();
    const canAct = Boolean(runtime.directDice?.visible);
    const blocking = runtime.presentation?.isBlocking() ?? false;
    const show = Boolean(current) && !runtime.cardPickerOpen
      && (canAct || (match.turn.phase === 'PRE_ROLL_ACTION' && !blocking));
    if (show && current) this.actorCh19 = current.id;
    spot.update({
      show,
      playerId: current?.id,
      canAct,
      canUseCard: match.turn.phase === 'PRE_ROLL_ACTION' && (current?.handCardIds.length ?? 0) > 0 && (current?.cardBlockTurns ?? 0) === 0,
    });
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

  /**
   * Replaces the older vector die (installGraphicalDiceOverride) with the
   * painted CH-19 die: it tumbles through all six faces, bounces and lands on
   * the event's result. Falls back to the older die if the art is missing.
   */
  private installJobVisitCh19(): void {
    const runtime = (this as unknown as { presentation?: { showLanding(model: PresentationEventModel): void } }).presentation;
    if (!runtime) return;
    const previous = runtime.showLanding.bind(runtime);
    runtime.showLanding = (model: PresentationEventModel) => {
      previous(model);
      const pid = model.actorId;
      const jobNode = BOARD_CH19.nodes.find((n) => n.feature === 'job');
      const player = this.matchCh19()?.players.find((p) => p.id === pid);
      const token = pid === undefined ? undefined : (this as unknown as { visuals?: Map<number, { token: Phaser.GameObjects.Container }> }).visuals?.get(pid)?.token;
      if (model.tileType !== 'job' || pid === undefined || !jobNode || player?.nodeId !== jobNode.id || !token?.active) return;
      if (this.insideCh19.has(pid) || this.visitCh19.has(pid) || this.tweens.isTweening(token)) return;
      this.playJobVisitCh19(pid, token, jobNode.id);
    };
  }

  /** Walk into the job centre, wait a moment inside, walk back out to the same spot. */
  private playJobVisitCh19(playerId: number, token: Phaser.GameObjects.Container, nodeId: number): void {
    const door = this.doorsCh19.get(nodeId);
    if (!door) return;
    const visit = { token, x: token.x, y: token.y, tweens: [] as Phaser.Tweens.Tween[], timer: undefined as Phaser.Time.TimerEvent | undefined };
    this.visitCh19.set(playerId, visit);
    const step = (config: Phaser.Types.Tweens.TweenBuilderConfig) => { const t = this.tweens.add(config); visit.tweens.push(t); return t; };
    step({
      targets: token, x: door.x, y: door.y, duration: 480, ease: 'Sine.easeInOut',
      onComplete: () => step({
        targets: token, alpha: 0, duration: 200,
        onComplete: () => {
          visit.timer = this.time.delayedCall(900, () => {
            step({
              targets: token, alpha: 1, x: visit.x, y: visit.y, duration: 480, ease: 'Sine.easeOut',
              onComplete: () => this.cancelJobVisitCh19(playerId),
            });
          });
        },
      }),
    });
  }

  /** Stop a job visit and put the token back exactly where it was standing. */
  private cancelJobVisitCh19(playerId: number): void {
    const visit = this.visitCh19.get(playerId);
    if (!visit) return;
    this.visitCh19.delete(playerId);
    visit.timer?.remove();
    for (const t of visit.tweens) t.stop();
    if (visit.token.active) visit.token.setPosition(visit.x, visit.y).setAlpha(1);
  }

  /** Walk a token through a building's door and keep it inside (hidden). */
  private enterBuildingCh19(playerId: number, token: Phaser.GameObjects.Container, nodeId: number, kind: 'hold'): Promise<void> {
    const node = BOARD_CH19.nodes.find((n) => n.id === nodeId);
    const door = this.doorsCh19.get(nodeId);
    const back = { x: node?.x ?? token.x, y: node?.y ?? token.y };
    this.insideCh19.set(playerId, { kind, ...back });
    return new Promise<void>((resolve) => {
      if (!door) { token.setAlpha(0); resolve(); return; }
      this.tweens.add({
        targets: token, x: door.x, y: door.y, duration: 520, ease: 'Sine.easeInOut',
        onComplete: () => {
          this.tweens.add({ targets: token, alpha: 0, scale: 0.85, duration: 220, onComplete: () => { token.setPosition(back.x, back.y); resolve(); } });
        },
      });
    });
  }

  /** Step back out of the door onto the tile (Jail / Hospital release, job done). */
  private leaveBuildingCh19(playerId: number, token: Phaser.GameObjects.Container): void {
    const inside = this.insideCh19.get(playerId);
    if (!inside) return;
    this.insideCh19.delete(playerId);
    const node = BOARD_CH19.nodes.find((n) => Math.hypot(n.x - inside.x, n.y - inside.y) < 80);
    const door = node ? this.doorsCh19.get(node.id) : undefined;
    if (this.tweens.isTweening(token)) { token.setScale(1).setAlpha(1); return; } // already moving on
    token.setScale(1).setAlpha(0).setPosition(door?.x ?? inside.x, door?.y ?? inside.y);
    this.tweens.add({ targets: token, x: inside.x, y: inside.y, alpha: 1, duration: 420, ease: 'Sine.easeOut' });
  }

  /**
   * Held players wait inside the Jail / Hospital and step out in front of its
   * door when released (job-centre visits are short self-contained walks).
   */
  private syncBuildingVisitsCh19(): void {
    const match = this.matchCh19();
    const visuals = (this as unknown as { visuals?: Map<number, { token: Phaser.GameObjects.Container }> }).visuals;
    if (!match || !visuals) return;
    for (const player of match.players) {
      const token = visuals.get(player.id)?.token;
      if (!token?.active) continue;
      const inside = this.insideCh19.get(player.id);
      if (inside?.kind === 'hold') {
        if (!player.specialHold) this.leaveBuildingCh19(player.id, token);
        else if (token.alpha > 0 && !this.tweens.isTweening(token)) token.setAlpha(0);
      } else if (player.specialHold && !this.tweens.isTweening(token) && !this.rescueCh19?.busy) {
        // e.g. arrived by police car / ambulance: go in through the door
        void this.enterBuildingCh19(player.id, token, player.nodeId, 'hold');
      }
    }
  }

  private installDiceRollCh19(): void {
    type Runtime = {
      active?: Phaser.GameObjects.Container;
      currentModel?: PresentationEventModel;
      showDiceRoll(model: PresentationEventModel): void;
      finishCurrent(animate?: boolean): void;
    };
    const runtime = (this as unknown as { presentation?: Runtime }).presentation;
    if (!runtime) return;
    const previous = runtime.showDiceRoll.bind(runtime);
    runtime.showDiceRoll = (model: PresentationEventModel) => {
      if (!diceSpritesReadyCh19(this)) { previous(model); return; }
      const result = Math.max(1, Math.min(6, model.roll ?? 1));
      if (model.actorId !== undefined) this.actorCh19 = model.actorId;
      const container = this.add.container(640, 320).setDepth(920).setName('presentation-dice-card-ch19');
      runtime.active = container;
      sfxController.play('dice_roll');
      playDiceRollCh19(this, container, result, `${model.actorName} đổ ra ${result}`, () => {
        const settle = diceSettleFeedbackCh09(result);
        this.cameras.main.shake(settle.cameraShake.durationMs, settle.cameraShake.intensity);
      });
      this.time.delayedCall(Math.max(2200, model.holdMs + 1400), () => {
        if (runtime.currentModel === model) runtime.finishCurrent(false);
      });
    };
  }

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
      installIslandPropsCh19(this, scenery.props, scenery.bounds);
      this.doorsCh19 = scenery.doors;
      this.installDistrictLabelsCh19(scenery.labels);
    } catch (error) {
      // Scenery is decorative: the board stays fully playable on the sea colour.
      console.warn('[CH-19] island scenery unavailable', error);
    }
  }

  private installDistrictLabelsCh19(labels: IslandLabelCh19[]): void {
    // CH-19: no navy explainer plates; the buildings themselves tell the places apart
    if (labels.length >= 0) return;
    const placed: { x: number; y: number; w: number }[] = [];
    for (const label of labels) {
      const w = Math.max(label.title.length * 15 + 40, label.subtitle.length * 8.6 + 30);
      const clear = (y: number) =>
        BOARD_CH19.nodes.every((n) => Math.abs(n.x - label.x) > w / 2 + 50 || Math.abs(n.y - y) > 85)
        && placed.every((o) => Math.abs(o.x - label.x) > (o.w + w) / 2 + 20 || Math.abs(o.y - y) > 80);
      // stay close to the building: just below it, else just above its roof, else search
      const near = [0, 24, -24, 48].flatMap((d) => [label.y + d, ...(label.altY === undefined ? [] : [label.altY - d])]);
      const nearY = near.find(clear);
      // a shop sign far from its shop reads as belonging to something else: drop it
      if (nearY === undefined && label.altY !== undefined) continue;
      let y = nearY ?? label.y;
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
    // CH-19: the hold is the building itself (its corridor leads straight to the
    // door), so it is not drawn as a tile; the J / H gates stay on the main road
    if (c === 'SPECIAL_JAIL_HOLD' || c === 'SPECIAL_HOSPITAL_HOLD') return { kind: 'none' };
    if (c === 'SPECIAL_JAIL_GATE') return { kind: 'disc', color: C.orange, symbol: 'J' };
    if (c === 'SPECIAL_HOSPITAL_GATE') return { kind: 'disc', color: C.pink, symbol: 'H' };
    const shop = shopForNodeCh19(node);
    if (shop) return { kind: 'shop', color: num(shop.colour), symbol: shop.name, building: shop.building };
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

    if (look.kind === 'none') return root;

    if (look.kind === 'shop') {
      // the shop's colour with a little picture of its building
      const color = look.color ?? TILE_COLORS_CH19.blue;
      const r = 48;
      g.fillStyle(0x14243f, 0.32).fillCircle(0, 7, r + 5);
      g.fillStyle(0xffffff, 1).fillCircle(0, 0, r + 5);
      g.fillStyle(color, 1).fillCircle(0, 0, r);
      g.fillStyle(0xffffff, 0.9).fillCircle(0, -2, r - 9);
      const key = `island-prop-ch19-${look.building ?? ''}`;
      if (this.textures.exists(key)) {
        const img = this.add.image(0, 2, key).setOrigin(0.5, 0.62);
        img.setScale(64 / Math.max(img.width, img.height));
        root.add(img);
      }
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
