import Phaser from 'phaser';
import cardsJson from '../content/core/cards_mvp.json';
import newsJson from '../content/core/news_mvp_demo.json';
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
  for (const news of NEWS) {
    if (!scene.textures.exists(newsArtKeyCh19(news.id))) scene.load.image(newsArtKeyCh19(news.id), publicAssetUrl(`assets/ui/ch19/news/${news.id}.webp`));
  }
}

type NewsItemCh19 = { id: string; title: string; description: string };
const NEWS = newsJson as NewsItemCh19[];
export const newsArtKeyCh19 = (id: string) => `news-art-ch19-${id}`;

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
  // without the effect box the card ends right under its name ribbon
  const h = withText ? Math.round(w * 1.4) : w + 20;
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
  const titleSize = Math.max(12, Math.min(30, Math.round(w * 0.085)));
  const ribH = Math.max(34, titleSize + 14);
  rib.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(x0 + 4, ribY - ribH / 2, w - 8, ribH, 10);
  rib.fillStyle(0xffffff, 1).fillRoundedRect(x0 + 7, ribY - ribH / 2 + 3, w - 14, ribH - 6, 8);
  c.add(rib);
  c.add(partyTextCh19(scene, 0, ribY, card.title, { size: titleSize, fill: hex(r.frame), stroke: '#ffffff', strokeWidth: 3, shadow: false }));
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
      else if (o.name === 'news-presentation-card') skinNewsCh19(scene, o);
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

const STAGE_CX_CH19 = 640;
const STAGE_CY_CH19 = 360;
const REVEAL_DEPTH_CH19 = 9000;

/** The board behind a card reveal goes soft; removed when the reveal leaves. */
function blurBoardCh19(scene: Phaser.Scene, root: Phaser.GameObjects.Container): void {
  const cam = scene.cameras.main as Phaser.Cameras.Scene2D.Camera & { postFX?: Phaser.GameObjects.Components.FX };
  const fx = cam.postFX?.addBlur?.(1, 2, 2, 1.4);
  if (!fx) return;
  const clear = () => { try { cam.postFX?.remove(fx); } catch { /* camera already gone */ } };
  root.once(Phaser.GameObjects.Events.DESTROY, clear);
  const watch = () => {
    if (root.active && root.scene) return;
    clear();
    scene.events.off(Phaser.Scenes.Events.UPDATE, watch);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, watch);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { clear(); scene.events.off(Phaser.Scenes.Events.UPDATE, watch); });
}

function skinPresentation(scene: Phaser.Scene, root: Phaser.GameObjects.Container): void {
  const mine = (o: Phaser.GameObjects.GameObject) => Boolean(o.getData?.('ch19-card-ui'));
  const stage = root.getData('ch19-card-stage') as Phaser.GameObjects.Container | undefined;
  if (stage) {
    // the older layers keep re-skinning their panel: keep everything but the reveal hidden,
    // and undo the root's own placement so the reveal fills the screen
    for (const o of root.list) if (!mine(o)) (o as unknown as Phaser.GameObjects.Components.Alpha).setAlpha?.(0);
    const sx = root.scaleX || 1, sy = root.scaleY || 1;
    stage.setScale(1 / sx, 1 / sy).setPosition((STAGE_CX_CH19 - root.x) / sx, (STAGE_CY_CH19 - root.y) / sy).setAngle(-root.angle);
    if (root.depth < REVEAL_DEPTH_CH19) root.setDepth(REVEAL_DEPTH_CH19);
    return;
  }
  const texts = root.list.filter((o): o is Phaser.GameObjects.Text => o instanceof Phaser.GameObjects.Text);
  const titleText = texts.find((t) => Boolean(cardByTitleCh19(t.text)));
  if (!titleText) return;
  const card = cardByTitleCh19(titleText.text)!;
  root.setData('ch19-card-face', true);
  const kicker = texts.find((t) => t.name === 'cinematic-kicker-ch141')?.text ?? '';
  // what actually happened (card play summary), when the older card shows one
  const extra = texts
    .filter((t) => t !== titleText && t.name !== 'cinematic-kicker-ch141' && t.text.trim() && t.text.trim() !== card.description.trim())
    .map((t) => t.text.trim())
    .filter((line) => line.length > 12)
    .slice(0, 2)
    .join(' ');
  for (const o of root.list) (o as unknown as Phaser.GameObjects.Components.Alpha).setAlpha?.(0);

  const tag = <T extends Phaser.GameObjects.GameObject>(o: T): T => { o.setData('ch19-card-ui', true); return o; };
  const r = RARITY[card.rarity] ?? RARITY.N;
  // top layer: a soft dark veil over the blurred board, one huge card, the caption right under it
  root.setDepth(Math.max(root.depth, REVEAL_DEPTH_CH19));
  const st = tag(scene.add.container(0, 0));
  root.add(st);
  root.setData('ch19-card-stage', st);
  const veil = scene.add.graphics();
  veil.fillStyle(0x10143a, 1).fillRect(-2000, -1500, 4000, 3000);
  veil.setAlpha(0.58);
  st.add(veil);
  const glow = scene.add.graphics();
  glow.fillStyle(r.glow, 0.16).fillCircle(0, -112, 340);
  glow.fillStyle(r.glow, 0.14).fillCircle(0, -112, 280);
  st.add(glow);
  const W = 420; // 420 x 440: the art fills most of the screen height
  const CY = -112;
  const face = cardFaceCh19(scene, card, W, false).setPosition(0, CY);
  st.add(face);
  const cap = scene.add.container(0, 150);
  if (kicker) cap.add(partyTextCh19(scene, 0, -2, kicker.toUpperCase(), { size: 16, fill: '#ffe066', strokeWidth: 4, shadow: false }));
  cap.add(partyTextCh19(scene, 0, 34, card.description, { size: 24, fill: '#ffffff', strokeWidth: 6, wrap: 820, shadow: false }).setOrigin(0.5, 0));
  if (extra) cap.add(partyTextCh19(scene, 0, 104, extra, { size: 18, fill: '#cfe4ff', strokeWidth: 4, wrap: 820, shadow: false }).setOrigin(0.5, 0));
  st.add(cap);
  // rarity chip pinned to the card's bottom edge
  const chipW = 170;
  const rc = scene.add.container(0, CY + (W + 20) / 2 + 4);
  const cg = scene.add.graphics();
  cg.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-chipW / 2 - 3, -18, chipW + 6, 36, 18);
  cg.fillStyle(r.frame, 1).fillRoundedRect(-chipW / 2, -15, chipW, 30, 15);
  rc.add(cg);
  rc.add(partyTextCh19(scene, 0, 0, `${'★'.repeat(r.stars)} ${r.name}`, { size: 15, fill: '#ffffff', strokeWidth: 3, shadow: false }));
  st.add(rc);
  skinPresentation(scene, root);
  blurBoardCh19(scene, root);

  face.setScale(0.35).setAlpha(0).setAngle(-14);
  scene.tweens.add({ targets: face, scale: 1, alpha: 1, angle: 0, duration: 460, ease: 'Back.easeOut' });
  rc.setAlpha(0).setScale(0.6);
  scene.tweens.add({ targets: rc, alpha: 1, scale: 1, duration: 260, delay: 300, ease: 'Back.easeOut' });
  cap.setAlpha(0).setY(180);
  scene.tweens.add({ targets: cap, alpha: 1, y: 150, duration: 320, delay: 240, ease: 'Cubic.easeOut' });
  glow.setAlpha(0);
  scene.tweens.add({ targets: glow, alpha: 1, duration: 500 });
}

/* ------------------------------------------------------------------ news on TV */

/** Breaking news: a big cartoon TV with the news painting on screen, caption under it. */
function skinNewsCh19(scene: Phaser.Scene, root: Phaser.GameObjects.Container): void {
  const mine = (o: Phaser.GameObjects.GameObject) => Boolean(o.getData?.('ch19-card-ui'));
  const stage = root.getData('ch19-card-stage') as Phaser.GameObjects.Container | undefined;
  if (stage) {
    for (const o of root.list) if (!mine(o)) (o as unknown as Phaser.GameObjects.Components.Alpha).setAlpha?.(0);
    const sx = root.scaleX || 1, sy = root.scaleY || 1;
    stage.setScale(1 / sx, 1 / sy).setPosition((STAGE_CX_CH19 - root.x) / sx, (STAGE_CY_CH19 - root.y) / sy).setAngle(-root.angle);
    if (root.depth < REVEAL_DEPTH_CH19) root.setDepth(REVEAL_DEPTH_CH19);
    return;
  }
  const texts = root.list.filter((o): o is Phaser.GameObjects.Text => o instanceof Phaser.GameObjects.Text);
  const titleText = texts.find((t) => NEWS.some((n) => n.title === t.text.trim()));
  if (!titleText) return;
  const news = NEWS.find((n) => n.title === titleText.text.trim())!;
  const kicker = texts.find((t) => t.name === 'cinematic-kicker-ch141')?.text ?? '';
  // the older card's body line(s): what actually happened this time
  const body = texts
    .filter((t) => t !== titleText && t.name !== 'cinematic-kicker-ch141' && t.text.trim().length > 6 && !/^[•⭐⚠️📰🗞️\s]+$/u.test(t.text.trim()))
    .map((t) => t.text.trim())
    .sort((a, b) => b.length - a.length)[0] ?? news.description;
  root.setData('ch19-card-face', true);
  for (const o of root.list) (o as unknown as Phaser.GameObjects.Components.Alpha).setAlpha?.(0);

  const tag = <T extends Phaser.GameObjects.GameObject>(o: T): T => { o.setData('ch19-card-ui', true); return o; };
  root.setDepth(Math.max(root.depth, REVEAL_DEPTH_CH19));
  const st = tag(scene.add.container(0, 0));
  root.add(st);
  root.setData('ch19-card-stage', st);
  const veil = scene.add.graphics();
  veil.fillStyle(0x10143a, 1).fillRect(-2000, -1500, 4000, 3000);
  veil.setAlpha(0.58);
  st.add(veil);

  // the TV: 560 x 315 screen in a chunky coral cabinet with antennae and feet
  const SW = 560, SH = 315, CY = -84;
  const tv = scene.add.container(0, CY);
  const g = scene.add.graphics();
  const bw = SW + 64, bh = SH + 64;
  g.lineStyle(9, PARTY_INK_CH19, 1).lineBetween(-40, -bh / 2 + 4, -120, -bh / 2 - 40).lineBetween(40, -bh / 2 + 4, 120, -bh / 2 - 40);
  g.fillStyle(0xffe066, 1).fillCircle(-120, -bh / 2 - 40, 13).fillCircle(120, -bh / 2 - 40, 13);
  g.lineStyle(4, PARTY_INK_CH19, 1).strokeCircle(-120, -bh / 2 - 40, 13).strokeCircle(120, -bh / 2 - 40, 13);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-bw / 2 + 60, bh / 2 - 6, 52, 30, 8).fillRoundedRect(bw / 2 - 112, bh / 2 - 6, 52, 30, 8);
  g.fillStyle(0x10143a, 0.3).fillRoundedRect(-bw / 2 + 6, -bh / 2 + 12, bw, bh, 40);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-bw / 2 - 5, -bh / 2 - 5, bw + 10, bh + 10, 44);
  g.fillStyle(0xf2549c, 1).fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 40);
  g.fillStyle(0xff8fbf, 1).fillRoundedRect(-bw / 2 + 8, -bh / 2 + 8, bw - 16, bh * 0.42, { tl: 34, tr: 34, bl: 0, br: 0 });
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-SW / 2 - 6, -SH / 2 - 6, SW + 12, SH + 12, 22);
  g.fillStyle(0x222645, 1).fillRoundedRect(-SW / 2, -SH / 2, SW, SH, 18);
  tv.add(g);
  const key = newsArtKeyCh19(news.id);
  if (scene.textures.exists(key)) {
    const img = scene.add.image(0, 0, key).setDisplaySize(SW, SH);
    tv.add(img);
    scene.tweens.add({ targets: img, alpha: { from: 0, to: 1 }, duration: 520, delay: 260 });
  }
  const bezel = scene.add.graphics();
  bezel.lineStyle(12, PARTY_INK_CH19, 1).strokeRoundedRect(-SW / 2 - 3, -SH / 2 - 3, SW + 6, SH + 6, 20);
  tv.add(bezel);
  const glare = scene.add.graphics();
  glare.fillStyle(0xffffff, 0.16).fillTriangle(-SW / 2, -SH / 2, -SW / 2 + 220, -SH / 2, -SW / 2, -SH / 2 + 170);
  tv.add(glare);
  // "TIN NÓNG" badge on the cabinet's top-left corner, the headline ribbon along the bottom
  const badge = scene.add.container(-bw / 2 + 92, -bh / 2 + 2);
  const bg = scene.add.graphics();
  bg.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-82, -21, 164, 42, 21);
  bg.fillStyle(0xf0524a, 1).fillRoundedRect(-78, -17, 156, 34, 17);
  badge.add(bg);
  badge.add(partyTextCh19(scene, 0, 0, '● TIN NÓNG', { size: 18, fill: '#ffffff', strokeWidth: 3, shadow: false }));
  tv.add(badge);
  scene.tweens.add({ targets: badge, scale: { from: 1, to: 1.08 }, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  const rib = scene.add.graphics();
  rib.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-SW / 2 + 20, SH / 2 - 26, SW - 40, 56, 14);
  rib.fillStyle(0xffffff, 1).fillRoundedRect(-SW / 2 + 24, SH / 2 - 22, SW - 48, 48, 11);
  tv.add(rib);
  tv.add(partyTextCh19(scene, 0, SH / 2 + 2, news.title, { size: 28, fill: '#f2549c', stroke: '#ffffff', strokeWidth: 3, shadow: false }));
  st.add(tv);

  const cap = scene.add.container(0, 158);
  if (kicker) cap.add(partyTextCh19(scene, 0, -2, kicker.toUpperCase(), { size: 16, fill: '#ffe066', strokeWidth: 4, shadow: false }));
  cap.add(partyTextCh19(scene, 0, 30, body, { size: 24, fill: '#ffffff', strokeWidth: 6, wrap: 820, shadow: false }).setOrigin(0.5, 0));
  st.add(cap);
  skinNewsCh19(scene, root);
  blurBoardCh19(scene, root);

  tv.setScale(0.3).setAlpha(0);
  scene.tweens.add({ targets: tv, scale: 1, alpha: 1, duration: 480, ease: 'Back.easeOut' });
  cap.setAlpha(0).setY(186);
  scene.tweens.add({ targets: cap, alpha: 1, y: 158, duration: 320, delay: 300, ease: 'Cubic.easeOut' });
}
