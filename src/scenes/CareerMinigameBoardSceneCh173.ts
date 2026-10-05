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
  private readonly characterFaceCompositeImagesCh187 = new Map<number, Phaser.GameObjects.Image>();
  private readonly characterLiveFaceVideosCh188 = new Map<number, HTMLVideoElement>();
  private readonly characterLiveFaceCanvasesCh188 = new Map<number, HTMLCanvasElement>();
  private readonly characterLiveFaceLastPaintCh188 = new Map<number, number>();

  preload(): void {
    super.preload();
    if (!this.textures.exists('character-walk-atlas-ch181')) {
      this.load.spritesheet(
        'character-walk-atlas-ch181',
        publicAssetUrl('assets/characters/ch181/walk-atlas.webp'),
        { frameWidth: 48, frameHeight: 48 },
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

      const sprite = this.add.sprite(0, CHARACTER_TOKEN_BASE_Y_CH186, 'character-walk-atlas-ch181', row * 8)
        .setName(`character-walk-token-ch186-p${player.id + 1}`)
        .setDisplaySize(CHARACTER_TOKEN_SIZE_CH186, CHARACTER_TOKEN_SIZE_CH186)
        .setOrigin(0.5, CHARACTER_TOKEN_ORIGIN_Y_CH186);
      visual.token.addAt(sprite, 0);

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
        .setDisplaySize(CRYBABY_FACE_DISPLAY_WIDTH_CH187, CRYBABY_FACE_DISPLAY_HEIGHT_CH187)
        .setOrigin(0.5, CHARACTER_TOKEN_ORIGIN_Y_CH186)
        .setName(`character-face-socket-board-ch187-p${player.id + 1}`);

      visual.token.addAt(composite, 0);
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
        .setDisplaySize(CRYBABY_FACE_DISPLAY_WIDTH_CH187, CRYBABY_FACE_DISPLAY_HEIGHT_CH187)
        .setOrigin(0.5, CHARACTER_TOKEN_ORIGIN_Y_CH186)
        .setName(`character-live-face-socket-board-ch188-p${playerId + 1}`);
      visual.token.addAt(image, 0);
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
      const faceComposite = this.characterFaceCompositeImagesCh187.get(playerId);

      if (faceComposite?.active && faceComposite.visible) {
        if (moving) {
          const bob = Math.floor(this.time.now / 110) % 2 === 0 ? 0 : 3;
          faceComposite
            .setY(CHARACTER_TOKEN_BASE_Y_CH186 - bob)
            .setAngle(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? -2.5 : 2.5) : 0);
          if (Math.abs(dx) > 0.2) faceComposite.setFlipX(dx < 0);
        } else {
          faceComposite
            .setY(CHARACTER_TOKEN_BASE_Y_CH186)
            .setAngle(0);
        }
      } else if (moving) {
        const walkFrame = Math.floor(this.time.now / 90) % 8;
        sprite.setFrame(row * 8 + walkFrame);
        sprite.setY(CHARACTER_TOKEN_BASE_Y_CH186 - (walkFrame % 2 === 0 ? 0 : 2));
        if (Math.abs(dx) > 0.2) sprite.setFlipX(dx < 0);
      } else {
        sprite.setFrame(row * 8);
        sprite.setY(CHARACTER_TOKEN_BASE_Y_CH186);
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
