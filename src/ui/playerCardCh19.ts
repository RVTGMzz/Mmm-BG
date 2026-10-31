import Phaser from 'phaser';
import { STARTER_CHARACTERS_V01 } from '../content/core/characters_starter_v01';
import { HUD_PLAYER_ACCENTS_VF04 } from './visualFoundationHudVf04';
import { MOBILE_UI_FONT_07044 } from './mobileReadability07044';
import { shadeCh19 } from './cityIslandSceneryCh19';

/**
 * CH-19 player card (presentation only), styled after the corner cards in
 * docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png: character sticker breaking out
 * of a player-coloured frame, name ribbon, round stat chips, a motto pill and
 * a crown for the leader. All values come from the authoritative match state.
 */

export const PLAYER_CARD_CH19 = Object.freeze({
  width: 320,
  height: 112,
  // Painted extents around the card centre (sticker and motto overflow the frame).
  extentLeft: 160,
  extentRight: 160,
  // The settings gear lives in the top-right corner of the stage.
  topRightGearClearance: 44,
  extentTop: 62,
  extentBottom: 60,
  margin: 12,
  activeScale: 1,
  idleScale: 0.88,
});

export const PORTRAIT_STARTERS_KEY_CH19 = 'character-portraits-starters-ch19';
export const PORTRAIT_STARTERS_PATH_CH19 = 'assets/characters/ch181/portrait-atlas-starters.webp';
export const PORTRAIT_BABY_KEY_CH19 = 'character-portraits-secret-baby-ch19';
export const PORTRAIT_BABY_PATH_CH19 = 'assets/characters/ch181/portrait-atlas-secret-baby.webp';
export const PORTRAIT_CELL_CH19 = 64;
const PORTRAIT_COLUMNS_CH19 = 8;
const ROW_BY_CHARACTER_CH19: Readonly<Record<string, number>> = {
  'starter-crybaby': 0,
  'starter-grumpy': 1,
  'starter-anxious': 2,
  'starter-hyper': 3,
};

export interface PlayerCardModelCh19 {
  playerId: number;
  name: string;
  money: number;
  handCount: number;
  handLimit: number;
  lockTurns: number;
  laps: number;
  jobLine: string;
  characterId?: string;
  faceTextureKey?: string;
  active: boolean;
  leader: boolean;
}

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
const CORNERS_CH19: readonly Corner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

/** Card centre for a corner so the painted card stays inside the 1280x720 stage. */
export function playerCardPositionCh19(playerId: number, scale: number): { x: number; y: number } {
  const c = PLAYER_CARD_CH19;
  const corner = CORNERS_CH19[playerId] ?? 'top-left';
  const left = corner.endsWith('left');
  const top = corner.startsWith('top');
  return {
    x: left
      ? c.margin + c.extentLeft * scale
      : 1280 - c.margin - c.extentRight * scale - (top ? c.topRightGearClearance : 0),
    y: top ? c.margin + c.extentTop * scale : 720 - c.margin - c.extentBottom * scale,
  };
}

export function playerCardMottoCh19(characterId?: string): string {
  const character = STARTER_CHARACTERS_V01.find((entry) => entry.id === characterId);
  if (character?.passiveConcept?.label) return `${character.passiveConcept.label}!`;
  if (characterId === 'secret-baby') return 'BÍ ẨN!';
  return 'CỐ LÊN NÀO!';
}

export function playerCardSignatureCh19(model: PlayerCardModelCh19): string {
  return [
    model.name, model.money, model.handCount, model.handLimit, model.lockTurns, model.laps,
    model.jobLine, model.characterId ?? '', model.faceTextureKey ?? '', model.active, model.leader,
  ].join('|');
}

const hexNum = (hex: string): number => parseInt(hex.slice(1), 16);
const toHex = (n: number): string => '#' + n.toString(16).padStart(6, '0');

/**
 * Draws one card into a fresh container. The caller owns positioning/scale
 * and replaces the card whenever the model signature changes.
 */
export function buildPlayerCardCh19(scene: Phaser.Scene, model: PlayerCardModelCh19): Phaser.GameObjects.Container {
  const c = PLAYER_CARD_CH19;
  const accent = HUD_PLAYER_ACCENTS_VF04[model.playerId] ?? 0x765047;
  const accentHex = toHex(accent);
  const dark = hexNum(shadeCh19(accentHex, -0.28));
  const darker = shadeCh19(accentHex, -0.5);
  const tint = hexNum(shadeCh19(accentHex, 0.84));
  const root = scene.add.container(0, 0).setName(`player-card-ch19-${model.playerId}`);
  const font = MOBILE_UI_FONT_07044;
  const halfW = c.width / 2, halfH = c.height / 2;

  /* ---------- frame */
  const frame = scene.add.graphics();
  frame.fillStyle(0x14243f, 0.28).fillRoundedRect(-halfW + 2, -halfH + 7, c.width, c.height, 26);
  if (model.active) {
    frame.fillStyle(0xffd45c, 1).fillRoundedRect(-halfW - 5, -halfH - 5, c.width + 10, c.height + 10, 30);
  }
  frame.fillStyle(0xffffff, 1).fillRoundedRect(-halfW, -halfH, c.width, c.height, 26);
  frame.fillStyle(accent, 1).fillRoundedRect(-halfW + 4, -halfH + 4, c.width - 8, c.height - 8, 23);
  frame.fillStyle(0xffffff, 0.18).fillRoundedRect(-halfW + 10, -halfH + 8, c.width - 20, 18, 9);
  frame.fillStyle(tint, 1).fillRoundedRect(-62, -40, 214, 88, 18);
  root.add(frame);

  /* ---------- name ribbon */
  const ribbon = scene.add.graphics();
  ribbon.fillStyle(dark, 1).fillRoundedRect(-52, -52, 188, 32, 16);
  ribbon.lineStyle(3, 0xffffff, 1).strokeRoundedRect(-52, -52, 188, 32, 16);
  root.add(ribbon);
  const name = Array.from(model.name.trim());
  root.add(scene.add.text(42, -36, name.length > 13 ? `${name.slice(0, 12).join('')}…` : model.name.trim(), {
    fontFamily: font, fontSize: '19px', fontStyle: 'bold', color: '#ffffff',
    stroke: darker, strokeThickness: 3,
  }).setOrigin(0.5));

  /* ---------- crown for the leader */
  if (model.leader) {
    const crown = scene.add.graphics().setPosition(140, -50).setAngle(14);
    crown.fillStyle(0x9a6e10, 1).fillPoints(crownPoints(1, 3), true);
    crown.fillStyle(0xffd45c, 1).fillPoints(crownPoints(1, 0), true);
    crown.fillStyle(0xffffff, 0.5).fillCircle(-6, -2, 2.5);
    root.add(crown);
  }

  /* ---------- stat chips: B$ · cards · laps */
  const chip = (x: number, w: number, icon: (g: Phaser.GameObjects.Graphics) => void, value: string, name: string) => {
    const g = scene.add.graphics().setPosition(x, 4);
    g.fillStyle(0xffffff, 1).fillRoundedRect(0, -14, w, 28, 14);
    g.lineStyle(2, hexNum(shadeCh19(accentHex, 0.4)), 1).strokeRoundedRect(0, -14, w, 28, 14);
    icon(g);
    root.add(g);
    root.add(scene.add.text(x + 30, 4, value, {
      fontFamily: font, fontSize: '17px', fontStyle: 'bold', color: '#3b2b27',
    }).setOrigin(0, 0.5).setName(name));
  };
  chip(-56, 86, (g) => {
    g.fillStyle(0x9a6e10, 1).fillCircle(13, 1, 13);
    g.fillStyle(0xf7c531, 1).fillCircle(13, 0, 12);
    g.lineStyle(2, 0xffe38a, 1).strokeCircle(13, 0, 8);
  }, `${model.money}`, 'player-card-money-ch19');
  chip(34, 64, (g) => {
    g.fillStyle(0x5a2fa8, 1).fillRoundedRect(4, -11, 18, 23, 4);
    g.fillStyle(0x8b4fe0, 1).fillRoundedRect(4, -12, 18, 22, 4);
    g.fillStyle(0xffffff, 0.85).fillRoundedRect(8, -8, 10, 14, 2);
  }, model.lockTurns > 0 ? `🔒${model.lockTurns}` : `${model.handCount}/${model.handLimit}`, 'player-card-hand-ch19');
  chip(102, 46, (g) => {
    g.fillStyle(0x1f8a3d, 1).fillCircle(13, 1, 13);
    g.fillStyle(0x3dba5c, 1).fillCircle(13, 0, 12);
    g.lineStyle(2, 0xffffff, 1).lineBetween(9, 7, 9, -7);
    g.fillStyle(0xffffff, 1).fillTriangle(9, -7, 18, -4, 9, -1);
  }, `${model.laps}`, 'player-card-laps-ch19');

  /* ---------- character sticker (breaks out of the frame) */
  const sticker = scene.add.container(-110, -12).setAngle(-5);
  const back = scene.add.graphics();
  back.fillStyle(0x14243f, 0.3).fillRoundedRect(-46, -42, 92, 92, 22);
  back.fillStyle(0xffffff, 1).fillRoundedRect(-48, -48, 96, 96, 24);
  back.fillStyle(accent, 1).fillRoundedRect(-43, -43, 86, 86, 20);
  sticker.add(back);
  const portrait = portraitImageCh19(scene, model);
  if (portrait) {
    sticker.add(portrait);
    const gloss = scene.add.graphics();
    gloss.lineStyle(3, 0xffffff, 0.9).strokeRoundedRect(-40, -40, 80, 80, 12);
    sticker.add(gloss);
  } else {
    sticker.add(scene.add.text(0, 2, `P${model.playerId + 1}`, {
      fontFamily: font, fontSize: '34px', fontStyle: 'bold', color: '#ffffff', stroke: darker, strokeThickness: 5,
    }).setOrigin(0.5));
  }
  root.add(sticker);

  /* ---------- motto pill */
  const motto = playerCardMottoCh19(model.characterId);
  const mottoW = Math.min(150, Math.max(92, Array.from(motto).length * 8.4 + 22));
  const mottoX = -halfW + 6 + mottoW / 2;
  const pill = scene.add.graphics().setPosition(mottoX, 46);
  pill.fillStyle(0x14243f, 0.25).fillRoundedRect(-mottoW / 2, -11, mottoW, 26, 13);
  pill.fillStyle(dark, 1).fillRoundedRect(-mottoW / 2, -14, mottoW, 26, 13);
  pill.lineStyle(2.5, 0xffffff, 1).strokeRoundedRect(-mottoW / 2, -14, mottoW, 26, 13);
  root.add(pill);
  root.add(scene.add.text(mottoX, 45, motto, {
    fontFamily: font, fontSize: '13px', fontStyle: 'bold italic', color: '#ffffff',
  }).setOrigin(0.5));

  /* ---------- job line (right of the motto pill) */
  const jobX = Math.max(-54, mottoX + mottoW / 2 + 8);
  const jobRoom = 150 - jobX;
  const jobGlyphs = Array.from(model.jobLine);
  const jobMax = Math.max(6, Math.floor(jobRoom / 7.2));
  root.add(scene.add.text(jobX, 33, jobGlyphs.length > jobMax ? `${jobGlyphs.slice(0, jobMax - 1).join('')}…` : model.jobLine, {
    fontFamily: font, fontSize: '13px', fontStyle: 'bold', color: darker,
  }).setOrigin(0, 0.5).setName('player-card-job-ch19'));

  /* ---------- turn tag */
  if (model.active) {
    const tag = scene.add.graphics().setPosition(102, 54);
    tag.fillStyle(0x9a6e10, 1).fillRoundedRect(-44, -10, 88, 24, 12);
    tag.fillStyle(0xffd45c, 1).fillRoundedRect(-44, -12, 88, 24, 12);
    root.add(tag);
    root.add(scene.add.text(102, 54, '▶ ĐẾN LƯỢT', {
      fontFamily: font, fontSize: '12px', fontStyle: 'bold', color: '#5a3d0a',
    }).setOrigin(0.5));
  }

  return root;
}

/** Square portrait shown inside the rounded sticker window (no GPU mask needed). */
function portraitImageCh19(scene: Phaser.Scene, model: PlayerCardModelCh19): Phaser.GameObjects.Image | undefined {
  const size = 80;
  if (model.faceTextureKey && scene.textures.exists(model.faceTextureKey)) {
    const img = scene.add.image(0, 0, model.faceTextureKey);
    const side = Math.min(img.width, img.height);
    img.setCrop((img.width - side) / 2, (img.height - side) / 2, side, side);
    return img.setScale(size / side);
  }
  const column = model.active ? 1 : 0; // happy on your turn, neutral otherwise
  if (model.characterId === 'secret-baby' && scene.textures.exists(PORTRAIT_BABY_KEY_CH19)) {
    return scene.add.image(0, 0, PORTRAIT_BABY_KEY_CH19, column).setDisplaySize(size, size);
  }
  const row = model.characterId ? ROW_BY_CHARACTER_CH19[model.characterId] : undefined;
  if (row !== undefined && scene.textures.exists(PORTRAIT_STARTERS_KEY_CH19)) {
    return scene.add.image(0, 0, PORTRAIT_STARTERS_KEY_CH19, row * PORTRAIT_COLUMNS_CH19 + column).setDisplaySize(size, size);
  }
  return undefined;
}

function crownPoints(scale: number, dy: number): Phaser.Types.Math.Vector2Like[] {
  return [
    { x: -14, y: 8 + dy }, { x: -16, y: -8 + dy }, { x: -7, y: -1 + dy }, { x: 0, y: -12 + dy },
    { x: 7, y: -1 + dy }, { x: 16, y: -8 + dy }, { x: 14, y: 8 + dy },
  ].map((p) => ({ x: p.x * scale, y: p.y * scale }));
}
