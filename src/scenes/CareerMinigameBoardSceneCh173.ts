import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { fitFaceSourceToSocketCh02f } from '../core/characterFaceSocketFitCh02f';
import { characterArtManifestV01 } from '../content/core/character_art_manifest_v01';
import { gameSession } from '../core/session';
import { MOBILE_UI_FONT_07044 } from '../ui/mobileReadability07044';
import {
  CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181,
  CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181,
  CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182,
} from '../ui/characterProductionArtCh181';
import { publicAssetUrl } from '../ui/publicAssetUrl';
import { cauCoRigPreviewEnabledCh1822 } from '../content/core/character_rig_manifest_ch1822';
import { preloadCauCoRigCh1822, cauCoRigPartsReadyCh1822, createCauCoRigCh1822 } from '../ui/characterRigCh1822';
import type { CauCoRigCh1822 } from '../ui/characterRigCh1822';
import { onlineGroupMedia07043 } from '../ui/OnlineGroupMedia07043';
import { CareerMinigameBoardScene07044 } from './CareerMinigameBoardScene07044';

const COCOA_CH173 = 0x4b302a;
const CREAM_CH173 = 0xfff7e8;
const BUTTER_CH173 = 0xffd76a;
const BUTTER_SHADOW_CH173 = 0xd99b38;
const LAVENDER_CH173 = 0xbca7dc;
const LAVENDER_SHADOW_CH173 = 0x8f74b7;
const BOARD_CH175 = boardJson as BoardDefinition;
const CHARACTER_TOKEN_SIZE_CH186 = 96;
const CHARACTER_TOKEN_BASE_Y_CH186 = 8;
const CHARACTER_TOKEN_ORIGIN_Y_CH186 = 0.82;
const CHARACTER_BADGE_X_CH186 = 38;
const CHARACTER_BADGE_Y_CH186 = 30;
const CHARACTER_HQ_ATLAS_KEY_CH189 = 'character-walk-atlas-hq-ch189';
const CHARACTER_HQ_SOURCE_FRAME_CH189 = 48;
const CHARACTER_HQ_FRAME_CH189 = 192;
const CHARACTER_HQ_COLUMNS_CH189 = 8;
const CHARACTER_HQ_ROWS_CH189 = 5;
const CRYBABY_PRODUCTION_WALK_KEY_CH1811 = 'character-walk-crybaby-production-ch1811';
const CRYBABY_PRODUCTION_WALK_PATH_CH1811 = 'assets/characters/ch181/walk-khoc-nhe-production-x4.png';
const GRUMPY_PRODUCTION_WALK_KEY_CH1816 = 'character-walk-grumpy-production-ch1816';
const GRUMPY_PRODUCTION_WALK_PATH_CH1816 = 'assets/characters/ch181/walk-cau-co-production-x4.png';
const ANXIOUS_PRODUCTION_WALK_KEY_CH1817 = 'character-walk-anxious-production-ch1817';
const ANXIOUS_PRODUCTION_WALK_PATH_CH1817 = 'assets/characters/ch181/walk-lo-lang-production-x4.png';
const HYPER_PRODUCTION_WALK_KEY_CH1818 = 'character-walk-hyper-production-ch1818';
const HYPER_PRODUCTION_WALK_PATH_CH1818 = 'assets/characters/ch181/walk-tang-dong-production-x4.png';
const SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819 = 'character-crawl-secret-baby-production-ch1819';
const SECRET_BABY_PRODUCTION_CRAWL_PATH_CH1819 = 'assets/characters/ch181/walk-secret-baby-production-x4.png';
const CHARACTER_TOKEN_DISPLAY_CH189 = 104;
const CHARACTER_TOKEN_ORIGIN_Y_CH189 = 0.84;
const CHARACTER_FOOT_RING_Y_CH189 = 31;
const CHARACTER_FOOT_RING_WIDTH_CH189 = 78;
const CHARACTER_FOOT_RING_HEIGHT_CH189 = 18;
const CHARACTER_IDLE_BREATH_PERIOD_CH1813 = 2200;
const CHARACTER_IDLE_BREATH_RISE_CH1813 = 1.1;
const CHARACTER_IDLE_BREATH_SCALE_X_CH1813 = 0.003;
const CHARACTER_IDLE_BREATH_SCALE_Y_CH1813 = 0.012;

const CRYBABY_PROOF_CH187 = characterArtManifestV01('starter-crybaby')
  ?.poses.find((pose) => pose.emotion === 'neutral');
const CRYBABY_PROOF_BODY_KEY_CH187 = 'character-crybaby-proof-body-ch187';
const CRYBABY_PROOF_MASK_KEY_CH187 = 'character-crybaby-proof-mask-ch187';
const CRYBABY_PROOF_FOREGROUND_KEY_CH187 = 'character-crybaby-proof-foreground-ch187';
const CRYBABY_PROOF_WIDTH_CH187 = CRYBABY_PROOF_CH187?.runtimeProof?.width ?? 128;
const CRYBABY_PROOF_HEIGHT_CH187 = CRYBABY_PROOF_CH187?.runtimeProof?.height ?? 192;
const CRYBABY_FACE_DISPLAY_WIDTH_CH187 = 84;
const CRYBABY_FACE_DISPLAY_HEIGHT_CH187 = 126;

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
  /** Private ancestor map read presentation-only so CH-18.9 can mirror active halo state below feet. */
  tokenHalos?: Map<number, Phaser.GameObjects.Arc>;
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
  private readonly cauCoRigPilotCh1822 = new Map<number, CauCoRigCh1822>();
  private readonly characterWalkRowsCh181 = new Map<number, number>();
  private readonly characterWalkLastPositionsCh181 = new Map<number, { x: number; y: number }>();
  private readonly characterFaceCompositeImagesCh187 = new Map<number, Phaser.GameObjects.Image>();
  private readonly characterFootRingsCh189 = new Map<number, Phaser.GameObjects.Ellipse>();
  private readonly characterLiveFaceVideosCh188 = new Map<number, HTMLVideoElement>();
  private readonly characterLiveFaceCanvasesCh188 = new Map<number, HTMLCanvasElement>();
  private readonly characterLiveFaceLastPaintCh188 = new Map<number, number>();

  preload(): void {
    super.preload();
    if (cauCoRigPreviewEnabledCh1822()) preloadCauCoRigCh1822(this);
    if (!this.textures.exists('character-walk-atlas-ch181')) {
      this.load.spritesheet(
        'character-walk-atlas-ch181',
        publicAssetUrl('assets/characters/ch181/walk-atlas.webp'),
        { frameWidth: 48, frameHeight: 48 },
      );
    }
    if (!this.textures.exists(CHARACTER_HQ_ATLAS_KEY_CH189)) {
      this.load.spritesheet(
        CHARACTER_HQ_ATLAS_KEY_CH189,
        publicAssetUrl('assets/characters/ch181/walk-atlas-hq-x4.svg'),
        { frameWidth: CHARACTER_HQ_FRAME_CH189, frameHeight: CHARACTER_HQ_FRAME_CH189 },
      );
    }
    if (!this.textures.exists(CRYBABY_PRODUCTION_WALK_KEY_CH1811)) {
      this.load.spritesheet(
        CRYBABY_PRODUCTION_WALK_KEY_CH1811,
        publicAssetUrl(CRYBABY_PRODUCTION_WALK_PATH_CH1811),
        { frameWidth: CHARACTER_HQ_FRAME_CH189, frameHeight: CHARACTER_HQ_FRAME_CH189 },
      );
    }
    if (!this.textures.exists(GRUMPY_PRODUCTION_WALK_KEY_CH1816)) {
      this.load.spritesheet(
        GRUMPY_PRODUCTION_WALK_KEY_CH1816,
        publicAssetUrl(GRUMPY_PRODUCTION_WALK_PATH_CH1816),
        { frameWidth: CHARACTER_HQ_FRAME_CH189, frameHeight: CHARACTER_HQ_FRAME_CH189 },
      );
    }
    if (!this.textures.exists(ANXIOUS_PRODUCTION_WALK_KEY_CH1817)) {
      this.load.spritesheet(
        ANXIOUS_PRODUCTION_WALK_KEY_CH1817,
        publicAssetUrl(ANXIOUS_PRODUCTION_WALK_PATH_CH1817),
        { frameWidth: CHARACTER_HQ_FRAME_CH189, frameHeight: CHARACTER_HQ_FRAME_CH189 },
      );
    }
    if (!this.textures.exists(HYPER_PRODUCTION_WALK_KEY_CH1818)) {
      this.load.spritesheet(
        HYPER_PRODUCTION_WALK_KEY_CH1818,
        publicAssetUrl(HYPER_PRODUCTION_WALK_PATH_CH1818),
        { frameWidth: CHARACTER_HQ_FRAME_CH189, frameHeight: CHARACTER_HQ_FRAME_CH189 },
      );
    }
    if (!this.textures.exists(SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819)) {
      this.load.spritesheet(
        SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819,
        publicAssetUrl(SECRET_BABY_PRODUCTION_CRAWL_PATH_CH1819),
        { frameWidth: CHARACTER_HQ_FRAME_CH189, frameHeight: CHARACTER_HQ_FRAME_CH189 },
      );
    }
    if (!this.textures.exists(CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182)) {
      this.load.spritesheet(
        CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182,
        publicAssetUrl(CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181),
        {
          frameWidth: CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181,
          frameHeight: CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181,
        },
      );
    }

    const proof = CRYBABY_PROOF_CH187;
    const proofReady = Boolean(
      proof?.runtimeProof
      && proof.bodyBackAsset
      && proof.faceMaskAsset
      && proof.foregroundAsset,
    );
    const needsCrybabyProof = proofReady && gameSession.players.some(
      (player) => player.characterId === 'starter-crybaby',
    );

    if (needsCrybabyProof && proof) {
      if (!this.textures.exists(CRYBABY_PROOF_BODY_KEY_CH187)) {
        this.load.image(CRYBABY_PROOF_BODY_KEY_CH187, publicAssetUrl(proof.bodyBackAsset));
      }
      if (!this.textures.exists(CRYBABY_PROOF_MASK_KEY_CH187) && proof.faceMaskAsset) {
        this.load.image(CRYBABY_PROOF_MASK_KEY_CH187, publicAssetUrl(proof.faceMaskAsset));
      }
      if (!this.textures.exists(CRYBABY_PROOF_FOREGROUND_KEY_CH187)) {
        this.load.image(CRYBABY_PROOF_FOREGROUND_KEY_CH187, publicAssetUrl(proof.foregroundAsset));
      }
      for (const player of gameSession.players) {
        if (player.characterId !== 'starter-crybaby') continue;
        const source = player.faces.neutral?.compositeSourceDataUrl;
        if (!source) continue;
        const key = this.characterFaceSourceTextureKeyCh187(player.id);
        if (!this.textures.exists(key)) this.load.image(key, source);
      }
    }
  }

  create(): void {
    super.create();
    // CH-18.6: exact 2x presentation of the 48px walk atlas.
    // NEAREST avoids cross-frame bleed/softening while the token moves.
    if (this.textures.exists('character-walk-atlas-ch181')) {
      this.textures.get('character-walk-atlas-ch181').setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists(CHARACTER_HQ_ATLAS_KEY_CH189)) {
      this.textures.get(CHARACTER_HQ_ATLAS_KEY_CH189).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    this.installCharacterProductionCh181();
    this.installCharacterFaceCompositeCh187();
    this.installBoardChromeCh173();
    this.installBoardPathChromeCh175();
    this.installBoardTileChromeCh175();
    this.syncBoardChromeCh173();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyBoardChromeCh173());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyBoardChromeCh173());
  }

  update(): void {
    super.update();
    this.syncCharacterLiveFaceCh188();
    this.syncCharacterProductionCh181();
    this.syncCharacterTokenPresentationCh189();
    this.syncBoardChromeCh173();
  }

  private runtimeCh173(): RuntimeCh173 {
    return this as unknown as RuntimeCh173;
  }

  private syncCharacterTokenPresentationCh189(): void {
    const runtime = this.runtimeCh173();
    const activeId = runtime.currentPlayer()?.id;
    for (const player of runtime.match.players) {
      const visual = runtime.visuals.get(player.id);
      if (!visual) continue;

      // 0.1.63 inherited a global 0.82 token scale. That was useful for the old
      // placeholder token but makes the new Character art tiny, so normalize the
      // Character container after inherited presentation code runs.
      if (this.characterWalkSpritesCh181.has(player.id)) visual.token.setScale(1);

      const legacyHalo = runtime.tokenHalos?.get(player.id);
      const ring = this.characterFootRingsCh189.get(player.id);
      if (!ring) continue;

      const inheritedActive = player.id === activeId;
      // The inherited halo can pulse at scales intended for its old large ring.
      // Normalize the new 78x18 under-foot ring independently so it cannot
      // become wider than the character's stance in real runtime.
      const inheritedPulse = legacyHalo?.scaleX ?? 1;
      const footRingPulse = Math.min(1.08, Math.max(0.94,
        Number.isFinite(inheritedPulse) ? inheritedPulse : 1));
      const inheritedAlpha = legacyHalo?.alpha ?? 0.72;

      // Keep ancestor turn ownership/camera semantics, but never draw its torso ring.
      legacyHalo?.setVisible(false);
      ring
        .setVisible(inheritedActive)
        .setAlpha(Math.max(0.42, inheritedAlpha))
        .setScale(footRingPulse);
    }
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

      // Retire only the old center avatar/circle. Keep the seat badge, but move
      // it outside the enlarged Character silhouette so it never covers the art.
      for (const child of visual.token.list) {
        if (
          (child instanceof Phaser.GameObjects.Image || child instanceof Phaser.GameObjects.Arc)
          && Math.abs(child.x) < 1
          && Math.abs(child.y) < 1
        ) {
          child.setVisible(false);
          continue;
        }
        if (
          child instanceof Phaser.GameObjects.Arc
          && Math.abs(child.x - 21) < 1
          && Math.abs(child.y - 21) < 1
        ) {
          child.setPosition(CHARACTER_BADGE_X_CH186, CHARACTER_BADGE_Y_CH186);
          continue;
        }
        if (
          child instanceof Phaser.GameObjects.Text
          && child.text === String(player.id + 1)
          && Math.abs(child.x - 21) < 1
          && Math.abs(child.y - 21) < 1
        ) {
          child.setPosition(CHARACTER_BADGE_X_CH186, CHARACTER_BADGE_Y_CH186);
        }
      }

      const footRing = this.add
        .ellipse(
          0,
          CHARACTER_FOOT_RING_Y_CH189,
          CHARACTER_FOOT_RING_WIDTH_CH189,
          CHARACTER_FOOT_RING_HEIGHT_CH189,
          0xffd76a,
          0.12,
        )
        .setStrokeStyle(4, 0xffc84a, 0.94)
        .setVisible(false)
        .setName(`character-foot-ring-ch189-p${player.id + 1}`);
      visual.token.addAt(footRing, 0);
      this.characterFootRingsCh189.set(player.id, footRing);

      // Retain the historical marker name so old source gates do not mistake this
      // presentation upgrade for an ownership rewrite.
      let walkTextureKeyCh1811 = CHARACTER_HQ_ATLAS_KEY_CH189;
      if (
        player.characterId === 'starter-crybaby'
        && this.textures.exists(CRYBABY_PRODUCTION_WALK_KEY_CH1811)
      ) {
        walkTextureKeyCh1811 = CRYBABY_PRODUCTION_WALK_KEY_CH1811;
      } else if (
        player.characterId === 'starter-grumpy'
        && this.textures.exists(GRUMPY_PRODUCTION_WALK_KEY_CH1816)
      ) {
        walkTextureKeyCh1811 = GRUMPY_PRODUCTION_WALK_KEY_CH1816;
      }
      else if (
        player.characterId === 'starter-anxious'
        && this.textures.exists(ANXIOUS_PRODUCTION_WALK_KEY_CH1817)
      ) {
        walkTextureKeyCh1811 = ANXIOUS_PRODUCTION_WALK_KEY_CH1817;
      }
      else if (
        player.characterId === 'starter-hyper'
        && this.textures.exists(HYPER_PRODUCTION_WALK_KEY_CH1818)
      ) {
        walkTextureKeyCh1811 = HYPER_PRODUCTION_WALK_KEY_CH1818;
      }
      else if (
        player.characterId === 'secret-baby'
        && this.textures.exists(SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819)
      ) {
        walkTextureKeyCh1811 = SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819;
      }
      const walkFrameBaseCh1811 = walkTextureKeyCh1811 === CHARACTER_HQ_ATLAS_KEY_CH189
        ? row * 8
        : 0;

      const sprite = this.add.sprite(0, CHARACTER_TOKEN_BASE_Y_CH186, walkTextureKeyCh1811, walkFrameBaseCh1811)
        .setData('walkFrameBaseCh1811', walkFrameBaseCh1811)
        .setData('productionWalkCh1811', walkTextureKeyCh1811 !== CHARACTER_HQ_ATLAS_KEY_CH189)
        .setName(`character-walk-token-ch186-p${player.id + 1}`)
        .setDisplaySize(CHARACTER_TOKEN_DISPLAY_CH189, CHARACTER_TOKEN_DISPLAY_CH189)
        .setOrigin(0.5, CHARACTER_TOKEN_ORIGIN_Y_CH189);
      sprite
        .setData('idleBaseScaleXCh1813', sprite.scaleX)
        .setData('idleBaseScaleYCh1813', sprite.scaleY);
      visual.token.addAt(sprite, 1);

      // CH-18.22: opt-in rig pilot only, never override the approved production
      // strip when QA parts have not all loaded or the preview flag is absent.
      if (
        player.characterId === 'starter-grumpy'
        && cauCoRigPreviewEnabledCh1822()
        && cauCoRigPartsReadyCh1822(this)
      ) {
        const rig = createCauCoRigCh1822(this, player.id, CHARACTER_TOKEN_BASE_Y_CH186);
        visual.token.addAt(rig.root, 1);
        sprite.setVisible(false);
        this.cauCoRigPilotCh1822.set(player.id, rig);
        rig.pose(this.time.now, false, 0);
      }

      this.characterWalkSpritesCh181.set(player.id, sprite);
      this.characterWalkRowsCh181.set(player.id, row);
      this.characterWalkLastPositionsCh181.set(player.id, { x: visual.token.x, y: visual.token.y });
    }
  }

  private characterFaceSourceTextureKeyCh187(playerId: number): string {
    return `character-face-source-ch187-p${playerId + 1}`;
  }

  private characterCompositeTextureKeyCh187(playerId: number): string {
    return `character-layer-composite-ch187-p${playerId + 1}`;
  }

  private installCharacterFaceCompositeCh187(): void {
    const proof = CRYBABY_PROOF_CH187;
    const socket = proof?.runtimeProof?.faceSocket;
    if (
      !proof?.runtimeProof
      || !socket
      || !this.textures.exists(CRYBABY_PROOF_BODY_KEY_CH187)
      || !this.textures.exists(CRYBABY_PROOF_MASK_KEY_CH187)
      || !this.textures.exists(CRYBABY_PROOF_FOREGROUND_KEY_CH187)
    ) return;

    const runtime = this.runtimeCh173();
    for (const player of runtime.match.players) {
      if (player.characterId !== 'starter-crybaby') continue;
      const sourceKey = this.characterFaceSourceTextureKeyCh187(player.id);
      if (!this.textures.exists(sourceKey)) continue;
      const visual = runtime.visuals.get(player.id);
      const walk = this.characterWalkSpritesCh181.get(player.id);
      if (!visual || !walk) continue;

      const textureKey = this.characterCompositeTextureKeyCh187(player.id);
      if (this.textures.exists(textureKey)) this.textures.remove(textureKey);

      const canvas = document.createElement('canvas');
      canvas.width = proof.runtimeProof.width;
      canvas.height = proof.runtimeProof.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      const body = this.textures.get(CRYBABY_PROOF_BODY_KEY_CH187).getSourceImage() as HTMLImageElement;
      const mask = this.textures.get(CRYBABY_PROOF_MASK_KEY_CH187).getSourceImage() as HTMLImageElement;
      const foreground = this.textures.get(CRYBABY_PROOF_FOREGROUND_KEY_CH187).getSourceImage() as HTMLImageElement;
      const source = this.textures.get(sourceKey).getSourceImage() as HTMLImageElement;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(body, 0, 0, canvas.width, canvas.height);

      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = canvas.width;
      faceCanvas.height = canvas.height;
      const faceCtx = faceCanvas.getContext('2d');
      if (!faceCtx) continue;

      const fit = fitFaceSourceToSocketCh02f(
        {
          width: Math.max(1, source.naturalWidth || source.width),
          height: Math.max(1, source.naturalHeight || source.height),
        },
        socket,
        canvas.width,
        canvas.height,
      );

      faceCtx.clearRect(0, 0, canvas.width, canvas.height);
      faceCtx.drawImage(source, fit.x, fit.y, fit.width, fit.height);
      faceCtx.globalCompositeOperation = 'destination-in';
      faceCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      faceCtx.globalCompositeOperation = 'source-over';

      ctx.drawImage(faceCanvas, 0, 0);
      ctx.drawImage(foreground, 0, 0, canvas.width, canvas.height);

      this.textures.addCanvas(textureKey, canvas);
      const composite = this.add
        .image(0, CHARACTER_TOKEN_BASE_Y_CH186, textureKey)
        .setDisplaySize(CRYBABY_FACE_DISPLAY_WIDTH_CH187 * 1.08, CRYBABY_FACE_DISPLAY_HEIGHT_CH187 * 1.08)
        .setOrigin(0.5, CHARACTER_TOKEN_ORIGIN_Y_CH189)
        .setName(`character-face-socket-board-ch187-p${player.id + 1}`);
      composite
        .setData('idleBaseScaleXCh1813', composite.scaleX)
        .setData('idleBaseScaleYCh1813', composite.scaleY);

      visual.token.addAt(composite, 1);
      walk.setVisible(false);
      this.characterFaceCompositeImagesCh187.set(player.id, composite);
    }
  }

  private characterLiveTextureKeyCh188(playerId: number): string {
    return `character-live-face-composite-ch188-p${playerId + 1}`;
  }

  private ensureLiveFaceVideoCh188(playerId: number, stream: MediaStream): HTMLVideoElement {
    let video = this.characterLiveFaceVideosCh188.get(playerId);
    if (!video) {
      video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      this.characterLiveFaceVideosCh188.set(playerId, video);
    }
    if (video.srcObject !== stream) {
      video.srcObject = stream;
      void video.play().catch(() => undefined);
    }
    return video;
  }

  private paintCrybabyFaceCompositeCh188(
    canvas: HTMLCanvasElement,
    source: CanvasImageSource,
    sourceWidth: number,
    sourceHeight: number,
  ): boolean {
    const proof = CRYBABY_PROOF_CH187;
    const socket = proof?.runtimeProof?.faceSocket;
    if (
      !proof?.runtimeProof
      || !socket
      || !this.textures.exists(CRYBABY_PROOF_BODY_KEY_CH187)
      || !this.textures.exists(CRYBABY_PROOF_MASK_KEY_CH187)
      || !this.textures.exists(CRYBABY_PROOF_FOREGROUND_KEY_CH187)
      || sourceWidth <= 0
      || sourceHeight <= 0
    ) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const body = this.textures.get(CRYBABY_PROOF_BODY_KEY_CH187).getSourceImage() as HTMLImageElement;
    const mask = this.textures.get(CRYBABY_PROOF_MASK_KEY_CH187).getSourceImage() as HTMLImageElement;
    const foreground = this.textures.get(CRYBABY_PROOF_FOREGROUND_KEY_CH187).getSourceImage() as HTMLImageElement;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(body, 0, 0, canvas.width, canvas.height);

    // Front-camera video is normally 16:9. Crop the center square first so the
    // face socket receives a head-shaped source instead of a letterboxed landscape frame.
    const cropSize = Math.min(sourceWidth, sourceHeight);
    const cropX = (sourceWidth - cropSize) / 2;
    const cropY = (sourceHeight - cropSize) / 2;
    const square = document.createElement('canvas');
    square.width = 256;
    square.height = 256;
    const squareCtx = square.getContext('2d');
    if (!squareCtx) return false;
    squareCtx.drawImage(
      source,
      cropX, cropY, cropSize, cropSize,
      0, 0, square.width, square.height,
    );

    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = canvas.width;
    faceCanvas.height = canvas.height;
    const faceCtx = faceCanvas.getContext('2d');
    if (!faceCtx) return false;
    const fit = fitFaceSourceToSocketCh02f(
      { width: square.width, height: square.height },
      socket,
      canvas.width,
      canvas.height,
    );

    faceCtx.clearRect(0, 0, canvas.width, canvas.height);
    faceCtx.drawImage(square, fit.x, fit.y, fit.width, fit.height);
    faceCtx.globalCompositeOperation = 'destination-in';
    faceCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
    faceCtx.globalCompositeOperation = 'source-over';

    ctx.drawImage(faceCanvas, 0, 0);
    ctx.drawImage(foreground, 0, 0, canvas.width, canvas.height);
    return true;
  }

  private ensureLiveFaceCompositeImageCh188(playerId: number): {
    image: Phaser.GameObjects.Image;
    canvas: HTMLCanvasElement;
    textureKey: string;
  } | undefined {
    const visual = this.runtimeCh173().visuals.get(playerId);
    const walk = this.characterWalkSpritesCh181.get(playerId);
    if (!visual || !walk) return undefined;

    let canvas = this.characterLiveFaceCanvasesCh188.get(playerId);
    const textureKey = this.characterLiveTextureKeyCh188(playerId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = CRYBABY_PROOF_WIDTH_CH187;
      canvas.height = CRYBABY_PROOF_HEIGHT_CH187;
      this.characterLiveFaceCanvasesCh188.set(playerId, canvas);
      if (this.textures.exists(textureKey)) this.textures.remove(textureKey);
      this.textures.addCanvas(textureKey, canvas);
    }

    let image = this.characterFaceCompositeImagesCh187.get(playerId);
    if (!image?.active) {
      image = this.add
        .image(0, CHARACTER_TOKEN_BASE_Y_CH186, textureKey)
        .setDisplaySize(CRYBABY_FACE_DISPLAY_WIDTH_CH187 * 1.08, CRYBABY_FACE_DISPLAY_HEIGHT_CH187 * 1.08)
        .setOrigin(0.5, CHARACTER_TOKEN_ORIGIN_Y_CH189)
        .setName(`character-live-face-socket-board-ch188-p${playerId + 1}`);
      image
        .setData('idleBaseScaleXCh1813', image.scaleX)
        .setData('idleBaseScaleYCh1813', image.scaleY);
      // Keep the active foot ring at index 0 so it is always behind every
      // Character body variant, including live-camera face composites.
      visual.token.addAt(image, 1);
      this.characterFaceCompositeImagesCh187.set(playerId, image);
    }

    walk.setVisible(false);
    image.setVisible(true);
    return { image, canvas, textureKey };
  }

  private syncCharacterLiveFaceCh188(): void {
    const runtime = this.runtimeCh173();
    for (const player of runtime.match.players) {
      if (player.characterId !== 'starter-crybaby') continue;

      const walk = this.characterWalkSpritesCh181.get(player.id);
      if (!walk?.active) continue;
      const liveStream = onlineGroupMedia07043.getLiveVideoStreamCh188(player.id);
      const staticTextureKey = this.characterCompositeTextureKeyCh187(player.id);
      let composite = this.characterFaceCompositeImagesCh187.get(player.id);

      if (!liveStream) {
        const video = this.characterLiveFaceVideosCh188.get(player.id);
        if (video?.srcObject) video.srcObject = null;

        if (composite?.active && this.textures.exists(staticTextureKey)) {
          composite
            .setTexture(staticTextureKey)
            .setVisible(true)
            .setName(`character-face-socket-board-ch187-p${player.id + 1}`);
          walk.setVisible(false);
        } else {
          composite?.setVisible(false);
          walk.setVisible(true);
        }
        continue;
      }

      const video = this.ensureLiveFaceVideoCh188(player.id, liveStream);
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0 || video.videoHeight <= 0) {
        continue;
      }

      const live = this.ensureLiveFaceCompositeImageCh188(player.id);
      if (!live) continue;
      composite = live.image;
      composite
        .setTexture(live.textureKey)
        .setName(`character-live-face-socket-board-ch188-p${player.id + 1}`);

      const lastPaint = this.characterLiveFaceLastPaintCh188.get(player.id) ?? -Infinity;
      if (this.time.now - lastPaint < 66) continue;
      if (!this.paintCrybabyFaceCompositeCh188(live.canvas, video, video.videoWidth, video.videoHeight)) continue;

      const texture = this.textures.get(live.textureKey);
      if (texture instanceof Phaser.Textures.CanvasTexture) texture.refresh();
      this.characterLiveFaceLastPaintCh188.set(player.id, this.time.now);
    }
  }

  private applyCharacterIdleBreathCh1813(
    target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
    playerId: number,
  ): void {
    const baseScaleX = Number(target.getData('idleBaseScaleXCh1813') ?? target.scaleX);
    const baseScaleY = Number(target.getData('idleBaseScaleYCh1813') ?? target.scaleY);
    const phase = (
      (this.time.now + playerId * 173)
      % CHARACTER_IDLE_BREATH_PERIOD_CH1813
    ) / CHARACTER_IDLE_BREATH_PERIOD_CH1813 * Math.PI * 2;
    const breath = (Math.sin(phase - Math.PI / 2) + 1) * 0.5;

    target
      .setScale(
        baseScaleX * (1 + CHARACTER_IDLE_BREATH_SCALE_X_CH1813 * breath),
        baseScaleY * (1 + CHARACTER_IDLE_BREATH_SCALE_Y_CH1813 * breath),
      )
      .setY(CHARACTER_TOKEN_BASE_Y_CH186 - CHARACTER_IDLE_BREATH_RISE_CH1813 * breath)
      .setAngle(0);
  }

  private resetCharacterIdleBreathCh1813(
    target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  ): void {
    const baseScaleX = Number(target.getData('idleBaseScaleXCh1813') ?? target.scaleX);
    const baseScaleY = Number(target.getData('idleBaseScaleYCh1813') ?? target.scaleY);
    target
      .setScale(baseScaleX, baseScaleY)
      .setY(CHARACTER_TOKEN_BASE_Y_CH186);
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
      const rig = this.cauCoRigPilotCh1822.get(playerId);
      if (rig) {
        rig.pose(this.time.now, moving, dx);
        previous.x = visual.token.x;
        previous.y = visual.token.y;
        continue;
      }
      const faceComposite = this.characterFaceCompositeImagesCh187.get(playerId);

      if (faceComposite?.active && faceComposite.visible) {
        if (moving) {
          this.resetCharacterIdleBreathCh1813(faceComposite);
          const bob = Math.floor(this.time.now / 110) % 2 === 0 ? 0 : 3;
          faceComposite
            .setY(CHARACTER_TOKEN_BASE_Y_CH186 - bob)
            .setAngle(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? -2.5 : 2.5) : 0);
          if (Math.abs(dx) > 0.2) faceComposite.setFlipX(dx < 0);
        } else {
          this.applyCharacterIdleBreathCh1813(faceComposite, playerId);
        }
      } else if (moving) {
        this.resetCharacterIdleBreathCh1813(sprite);
        const walkFrame = Math.floor(this.time.now / 90) % 8;
        const frameBaseCh1811 = Number(sprite.getData('walkFrameBaseCh1811') ?? row * 8);
        sprite.setFrame(frameBaseCh1811 + walkFrame);
        sprite.setY(CHARACTER_TOKEN_BASE_Y_CH186 - (walkFrame % 2 === 0 ? 0 : 2));
        if (Math.abs(dx) > 0.2) sprite.setFlipX(dx < 0);
      } else {
        const frameBaseCh1811 = Number(sprite.getData('walkFrameBaseCh1811') ?? row * 8);
        sprite.setFrame(frameBaseCh1811);
        this.applyCharacterIdleBreathCh1813(sprite, playerId);
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
    for (const rig of this.cauCoRigPilotCh1822.values()) rig.root.destroy();
    this.cauCoRigPilotCh1822.clear();
    for (const sprite of this.characterWalkSpritesCh181.values()) sprite.destroy();
    this.characterWalkSpritesCh181.clear();
    for (const ring of this.characterFootRingsCh189.values()) ring.destroy();
    this.characterFootRingsCh189.clear();
    this.characterWalkRowsCh181.clear();
    this.characterWalkLastPositionsCh181.clear();
    for (const image of this.characterFaceCompositeImagesCh187.values()) image.destroy();
    this.characterFaceCompositeImagesCh187.clear();
    for (const video of this.characterLiveFaceVideosCh188.values()) {
      video.pause();
      video.srcObject = null;
    }
    this.characterLiveFaceVideosCh188.clear();
    this.characterLiveFaceCanvasesCh188.clear();
    this.characterLiveFaceLastPaintCh188.clear();
    for (const player of gameSession.players) {
      const liveKey = this.characterLiveTextureKeyCh188(player.id);
      if (this.textures.exists(liveKey)) this.textures.remove(liveKey);
    }
  }
}
