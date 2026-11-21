import Phaser from 'phaser';
import cardsJson from '../content/core/cards_mvp.json';
import type { CardDefinition, CardRarity } from '../core/cards';
import { publicAssetUrl } from './publicAssetUrl';
import { fillStarCh19, partyTextCh19, PARTY_INK_CH19, tintCh19 } from './partyKitCh19';

/**
 * CH-19 card faces: every Card has its own Codex-painted illustration
 * (public/assets/ui/ch19/cards/<id>.webp) in a frame coloured by rarity,
 * with its name ribbon, rarity stars and effect line. Used in the hand
 * picker and on the draw / play presentation cards. Presentation only.
 */

const CARDS = cardsJson as CardDefinition[];
const BY_TITLE = new Map(CARDS.map((card) => [card.title, card]));

export const cardArtKeyCh19 = (id: string) => `card-art-ch19-${id}`;

export function preloadCardArtCh19(scene: Phaser.Scene): void {
  for (const card of CARDS) {
    if (!scene.textures.exists(cardArtKeyCh19(card.id))) scene.load.image(cardArtKeyCh19(card.id), publicAssetUrl(`assets/ui/ch19/cards/${card.id}.webp`));
  }
}

const RARITY: Record<CardRarity, { frame: number; glow: number; stars: number; name: string }> = {
  N: { frame: 0x6f8fb0, glow: 0xdfe8f2, stars: 1, name: 'THƯỜNG' },
  R: { frame: 0x2f86e0, glow: 0xcfe6ff, stars: 2, name: 'HIẾM' },
  SR: { frame: 0x9a52e6, glow: 0xeedcff, stars: 3, name: 'SIÊU HIẾM' },
  SSR: { frame: 0xf0a41c, glow: 0xfff1b8, stars: 4, name: 'HUYỀN THOẠI' },
};

export function cardByTitleCh19(title: string): CardDefinition | undefined {
  return BY_TITLE.get(title.trim());
}

/** A full card face, centre origin, w x (w * 1.4). */
export function cardFaceCh19(scene: Phaser.Scene, card: CardDefinition, w: number, withText = true): Phaser.GameObjects.Container {
  const h = Math.round(w * 1.4);
  const r = RARITY[card.rarity] ?? RARITY.N;
  const c = scene.add.container(0, 0).setName(`card-face-ch19-${card.id}`).setSize(w, h);
  const g = scene.add.graphics();
  const x0 = -w / 2, y0 = -h / 2;
  g.fillStyle(0x10143a, 0.3).fillRoundedRect(x0 + 5, y0 + 8, w, h, 18);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(x0 - 4, y0 - 4, w + 8, h + 8, 22);
  g.fillStyle(r.frame, 1).fillRoundedRect(x0, y0, w, h, 18);
  g.fillStyle(tintCh19(r.frame, 0.25), 1).fillRoundedRect(x0 + 5, y0 + 5, w - 10, h * 0.45, { tl: 14, tr: 14, bl: 0, br: 0 });
  // art window
  const ax = x0 + 12, ay = y0 + 12, aw = w - 24, ah = aw;
  g.fillStyle(0xffffff, 1).fillRoundedRect(ax - 3, ay - 3, aw + 6, ah + 6, 12);
  c.add(g);
  const key = cardArtKeyCh19(card.id);
  if (scene.textures.exists(key)) {
    const img = scene.add.image(0, ay + ah / 2, key);
    img.setDisplaySize(aw, ah);
    c.add(img);
  } else {
    c.add(partyTextCh19(scene, 0, ay + ah / 2, card.impact, { size: Math.round(aw * 0.45), shadow: false }));
  }
  // SSR / SR shine
  if (card.rarity === 'SSR' || card.rarity === 'SR') {
    const shine = scene.add.graphics();
    shine.fillStyle(0xffffff, 0.35).fillTriangle(ax, ay + ah * 0.55, ax + aw * 0.3, ay, ax + aw * 0.45, ay);
    c.add(shine);
    scene.tweens.add({ targets: shine, alpha: 0.2, duration: 900, yoyo: true, repeat: -1 });
  }
  // rarity stars over the art's top-left corner
  const stars = scene.add.graphics();
  for (let i = 0; i < r.stars; i++) {
    const sx = ax + 14 + i * 20, sy = ay + 14;
    stars.fillStyle(PARTY_INK_CH19, 1);
    fillStarCh19(stars, sx, sy + 1, 11);
    stars.fillStyle(0xffe066, 1);
    fillStarCh19(stars, sx, sy, 8);
  }
  c.add(stars);
  // name ribbon across the bottom of the art
  const ribY = ay + ah + 2;
  const rib = scene.add.graphics();
  rib.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(x0 + 4, ribY - 17, w - 8, 34, 10);
  rib.fillStyle(0xffffff, 1).fillRoundedRect(x0 + 7, ribY - 14, w - 14, 28, 8);
  c.add(rib);
  c.add(partyTextCh19(scene, 0, ribY, card.title, { size: Math.max(12, Math.round(w * 0.085)), fill: hex(r.frame), stroke: '#ffffff', strokeWidth: 3, shadow: false }));
  if (withText) {
    const textTop = ribY + 22;
    const box = scene.add.graphics();
    box.fillStyle(r.glow, 1).fillRoundedRect(x0 + 10, textTop, w - 20, y0 + h - 10 - textTop, 10);
    c.add(box);
    c.add(partyTextCh19(scene, 0, (textTop + y0 + h - 10) / 2, card.description, {
      // long effects get a smaller line so they stay inside the card
      size: Math.max(9, Math.round(w * (card.description.length > 100 ? 0.044 : card.description.length > 70 ? 0.05 : 0.058))), fill: '#1f2340', stroke: '#ffffff', strokeWidth: 2, wrap: w - 30, shadow: false,
    }));
  }
  c.add(partyTextCh19(scene, x0 + w - 12, y0 + 6, r.name, { size: Math.max(9, Math.round(w * 0.045)), fill: '#ffffff', strokeWidth: 3, align: 'right', shadow: false }).setOrigin(1, 0));
  return c;
}

const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

/**
 * Per-frame skin: the hand picker's paper cards and the draw / play
 * presentation get the painted card face.
 */
export function installCardArtCh19(scene: Phaser.Scene): void {
  const tick = () => {
    for (const o of scene.children.list) {
      if (!(o instanceof Phaser.GameObjects.Container) || !o.active) continue;
      if (o.name === 'card-hand-picker-modal') skinHand(scene, o);
      else if (o.name === 'card-presentation-card') skinPresentation(scene, o);
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
}

function skinHand(scene: Phaser.Scene, root: Phaser.GameObjects.Container): void {
  for (const o of [...root.list]) {
    if (!(o instanceof Phaser.GameObjects.Text) || o.getData('ch19-card')) continue;
    const card = cardByTitleCh19(o.text);
    if (!card) continue;
    o.setData('ch19-card', true);
    const x = o.x;
    // everything of the old paper card in that column steps aside, except its hit area and "use" line
    for (const p of root.list) {
      const t = p as Phaser.GameObjects.GameObject & { x?: number; y?: number; name: string };
      if (p === o || p.getData?.('ch19-card-face')) continue;
      // only inside that card's own box (the header and the cancel button stay)
      const inColumn = typeof t.x === 'number' && typeof t.y === 'number' && Math.abs(t.x - x) < 140 && t.y > -165 && t.y < 125
        && !(p instanceof Phaser.GameObjects.Rectangle);
      const isSkin = /card-hand-(skin|rarity)-/.test(t.name);
      if ((inColumn && p instanceof Phaser.GameObjects.Text && !/DÙNG/.test((p as Phaser.GameObjects.Text).text)) || isSkin) {
        (p as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(0);
      }
    }
    o.setAlpha(0);
    const face = cardFaceCh19(scene, card, 214).setPosition(x, -12).setData('ch19-card-face', true);
    // on top of the paper panel; it is not interactive, so the hit area underneath still takes the tap
    root.add(face);
    const use = root.list.find((p) => p instanceof Phaser.GameObjects.Text && /DÙNG/.test(p.text) && Math.abs(p.x - x) < 20) as Phaser.GameObjects.Text | undefined;
    if (use) { use.setY(166).setColor('#ffffff').setStroke('#1f2340', 5).setFontSize(18); root.bringToTop(use); }
  }
  // keep the old skins hidden (they repaint on hover)
  for (const p of root.list) if (/card-hand-(skin|rarity)-/.test(p.name)) (p as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(0);
}

function skinPresentation(scene: Phaser.Scene, root: Phaser.GameObjects.Container): void {
  if (root.getData('ch19-card-face')) return;
  const titleText = root.list.find((o): o is Phaser.GameObjects.Text => o instanceof Phaser.GameObjects.Text && Boolean(cardByTitleCh19(o.text)));
  if (!titleText) return;
  const card = cardByTitleCh19(titleText.text)!;
  root.setData('ch19-card-face', true);
  const face = cardFaceCh19(scene, card, 190, false).setPosition(-470, 0).setAngle(-6).setData('ch19-skin', true);
  root.add(face);
  face.setScale(0.2).setAlpha(0);
  scene.tweens.add({ targets: face, scale: 1, alpha: 1, angle: -4, duration: 360, ease: 'Back.easeOut' });
}
