import Phaser from 'phaser';
import { MINI_GAME_SLOTS_059 } from '../core/miniGameSlots059';
import { publicAssetUrl } from './publicAssetUrl';
import {
  fillStarCh19, partyBannerCh19, partyBoxCh19, partyPillButtonCh19, partyPillShapeCh19, partyTextCh19, PARTY_FONT_CH19, PARTY_INK_CH19, tintCh19,
} from './partyKitCh19';
import { stageRectCh19 } from './responsiveStageCh19';
import { reskinGraphicsCh19 } from './uiKitCh19';

/**
 * CH-19 Mini Game screen. The Mini Game overlay keeps every rule, CPU pick and
 * online sync; this skin turns it into its own full screen: a wipe into a
 * themed stage with the game's painted icon, painted pictures on the choice
 * cards, and an illustrated three-step "how to play" in place of the rules text.
 */

type Style = { icon: string; colour: number };
const SLOT_STYLE_CH19: Record<string, Style> = {
  MINIGAME_SLOT_01: { icon: 'crowd', colour: 0x3f8cf0 },
  MINIGAME_SLOT_02: { icon: 'allin', colour: 0xf0524a },
  MINIGAME_SLOT_03: { icon: 'buoy', colour: 0x22a98f },
  MINIGAME_SLOT_04: { icon: 'top2', colour: 0x7a5cf0 },
  MINIGAME_SLOT_05: { icon: 'sprint', colour: 0xf08a2c },
};

/** Painted icon for a Mini Game slot as HTML (DOM menus), emoji fallback. */
export function miniGameIconHtmlCh19(contentId: string, fallback: string): string {
  const style = SLOT_STYLE_CH19[contentId];
  if (!style) return fallback;
  return `<img class="quick-mini-icon-art-ch19" src="${publicAssetUrl(`assets/ui/ch19/minigame/icon-${style.icon}.png`)}" alt="${fallback}" />`;
}

export const MINIGAME_ICONS_CH19 = ['crowd', 'allin', 'buoy', 'top2', 'sprint', 'rps', 'doors'] as const;
export const MINIGAME_PICKS_CH19 = ['palm-up', 'palm-down', 'rock', 'paper', 'scissors', 'door', 'buoy', 'lock', 'fire', 'reroll'] as const;
export const MINIGAME_TUTORIALS_CH19 = ['majority', 'rps', 'doors', 'allin', 'buoy', 'cuttop', 'sprint'] as const;

const iconKey = (k: string) => `mg-ch19-icon-${k}`;
const pickKey = (k: string) => `mg-ch19-pick-${k}`;
const tutKey = (k: string) => `mg-ch19-tut-${k}`;

export function preloadMiniGamePartyCh19(scene: Phaser.Scene): void {
  for (const k of MINIGAME_ICONS_CH19) if (!scene.textures.exists(iconKey(k))) scene.load.image(iconKey(k), publicAssetUrl(`assets/ui/ch19/minigame/icon-${k}.png`));
  for (const k of MINIGAME_PICKS_CH19) if (!scene.textures.exists(pickKey(k))) scene.load.image(pickKey(k), publicAssetUrl(`assets/ui/ch19/minigame/pick-${k}.png`));
  for (const k of MINIGAME_TUTORIALS_CH19) if (!scene.textures.exists(tutKey(k))) scene.load.image(tutKey(k), publicAssetUrl(`assets/ui/ch19/minigame/tut-${k}.webp`));
}

/** emoji on the old choice cards -> painted pictogram */
const PICK_FOR_EMOJI: Record<string, string> = {
  '🤲': 'palm-up', '🖐️': 'paper', '✊': 'rock', '✌️': 'scissors', '✋': 'lock', '🔥': 'fire',
  '🚪': 'door', '🛟': 'buoy', '✅': 'lock', '↻': 'reroll',
};

/** rules heading ("📘 LUẬT • <title>") -> tutorial strip + three captions */
const TUTORIALS: Record<string, { key: string; captions: [string, string, string] }> = {
  'NHIỀU RA ÍT BỊ': { key: 'majority', captions: ['Chọn kín: NGỬA hay SẤP tay', 'Mọi người cùng lật một lúc', 'Phe ÍT người hơn bị loại'] },
  'OẲN TÙ XÌ': { key: 'rps', captions: ['Hai người đấu tay đôi', 'Búa > Kéo > Bao > Búa', 'Thắng là ăn thưởng'] },
  'BA CỬA': { key: 'doors', captions: ['Mỗi người đứng trước 1 cửa', 'Xúc xắc chọn cửa sống: 1-2 A · 3-4 B · 5-6 C', 'Đứng đúng cửa là thắng'] },
  'KÈO ALL-IN': { key: 'allin', captions: ['Mỗi người nhận 1 xúc xắc', 'CHỐT điểm hoặc ALL-IN đổ thêm', 'Tổng vượt 9 là CHÁY = 0 điểm'] },
  'PHAO ĐƠN': { key: 'buoy', captions: ['Có 3 cái phao', 'Mỗi người nhảy lên 1 phao', 'Chỉ phao có ĐÚNG 1 người mới nổi'] },
  'CẮT TOP XÚC XẮC': { key: 'cuttop', captions: ['Mọi người cùng đổ xúc xắc', 'So điểm với nhau', '2 người cao nhất sống sót'] },
  'ĐUA 3 CHẶNG': { key: 'sprint', captions: ['Đua 3 chặng, mỗi chặng 1 xúc xắc', 'Mỗi người được ĐỔ LẠI 1 lần', 'Tổng cao nhất về nhất'] },
};

const OLD_CHROME = [
  'vf07-minigame-shell-shadow-ch174', 'vf07-minigame-shell-ch141', 'vf07-minigame-header-ch141',
  'vf07-minigame-header-gloss-ch174', 'vf07-minigame-sticker-ch141', 'vf07-minigame-sticker-icon-ch174',
];
const PAPER = /(paper|result-box|badge|ribbon|privacy-rail|rps-card)/;

function findModal(scene: Phaser.Scene): Phaser.GameObjects.Container | undefined {
  const direct = scene.children.getByName('minigame-modal');
  if (direct instanceof Phaser.GameObjects.Container) return direct;
  for (const o of scene.children.list) {
    if (o instanceof Phaser.GameObjects.Container) {
      const inner = o.getByName('minigame-modal');
      if (inner instanceof Phaser.GameObjects.Container) return inner;
    }
  }
  return undefined;
}

export function installMiniGamePartyCh19(scene: Phaser.Scene): void {
  let open: Phaser.GameObjects.Container | undefined;
  let colour = 0x3f8cf0;

  const tick = () => {
    const root = findModal(scene);
    if (root && root !== open) {
      open = root;
      colour = dress(scene, root);
    }
    if (root?.active) restyle(scene, root);
    if (!root && open) {
      open = undefined;
      wipeOut(scene, colour);
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
}

/* ------------------------------------------------------------------ shell */

function slotOf(root: Phaser.GameObjects.Container) {
  const titles = root.list.filter((o): o is Phaser.GameObjects.Text => o instanceof Phaser.GameObjects.Text).map((t) => t.text.trim());
  return MINI_GAME_SLOTS_059.find((slot) => titles.includes(slot.title)) ?? MINI_GAME_SLOTS_059[0];
}

function dress(scene: Phaser.Scene, root: Phaser.GameObjects.Container): number {
  root.setData('ch19', true);
  root.setData('ch19-old-texts', root.list.filter((o): o is Phaser.GameObjects.Text => o instanceof Phaser.GameObjects.Text));
  // follow the (centred) UI camera like the rest of the HUD on any aspect ratio
  root.setScrollFactor(1);
  const slot = slotOf(root);
  const style = SLOT_STYLE_CH19[slot.contentId] ?? SLOT_STYLE_CH19.MINIGAME_SLOT_01;
  const r = stageRectCh19(scene);
  const skin = scene.add.container(0, 0).setName('party-minigame-shell-ch19');

  // full-screen themed stage
  const bg = scene.add.graphics();
  const L = r.x - 640 - 40, T = r.y - 360 - 40, W = r.w + 80, H = r.h + 80;
  bg.fillStyle(tintCh19(style.colour, -0.1), 1).fillRect(L, T, W, H);
  for (let i = 8; i >= 1; i--) bg.fillStyle(tintCh19(style.colour, 0.35), 0.06).fillEllipse(0, -20, 220 + i * 150, 140 + i * 95);
  skin.add(bg);
  const stars = scene.add.graphics();
  let n = 0;
  for (let y = T; y < T + H + 160; y += 80) for (let x = L + ((y / 80) % 2 ? 80 : 0); x < L + W + 160; x += 160) {
    n++;
    const s = (Math.sin(n * 12.9898) * 43758.5453) % 1;
    stars.fillStyle(0xffffff, 0.12 + Math.abs(s) * 0.12);
    fillStarCh19(stars, x, y, 10 + Math.abs(s) * 18, -Math.PI / 2 + s);
  }
  skin.add(stars);
  scene.tweens.add({ targets: stars, x: -160, y: -80, duration: 18500, repeat: -1 });

  // header: painted icon + title banner + identity chip
  const head = scene.add.container(0, -300);
  head.add(partyBannerCh19(scene, 40, 0, 560, slot.title, tintCh19(style.colour, -0.25), 32));
  if (scene.textures.exists(iconKey(style.icon))) {
    const icon = scene.add.image(-290, -6, iconKey(style.icon));
    icon.setScale(118 / Math.max(icon.width, icon.height));
    head.add(icon);
    scene.tweens.add({ targets: icon, angle: { from: -6, to: 6 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  head.add(partyTextCh19(scene, 40, 52, `MINI GAME • ${slot.identity}`, { size: 18, fill: '#ffffff', strokeWidth: 5, shadow: false }));
  skin.add(head);
  root.addAt(skin, 1);
  const backdrop = root.list[0] as Phaser.GameObjects.Rectangle | undefined;
  if (backdrop instanceof Phaser.GameObjects.Rectangle) backdrop.setFillStyle(0x000000, 0.001).setSize(4000, 3000);

  // quick Mini Game mode: a way back out to the game list
  if (scene.scene.key === 'MiniGameQuickScene') {
    const back = partyPillButtonCh19(scene, r.x - 640 + 110, r.y - 360 + 44, 170, 52, 0x5b7fa8, '← Thoát', () => scene.scene.restart(), 20);
    back.setName('party-minigame-exit-ch19');
    skin.add(back);
  }

  wipeIn(scene, style, slot.title);
  return style.colour;
}

function wipeIn(scene: Phaser.Scene, style: Style, title: string): void {
  const r = stageRectCh19(scene);
  const card = scene.add.container(r.x + r.w / 2, r.y + r.h / 2).setDepth(1700).setName('party-minigame-wipe-ch19');
  const g = scene.add.graphics();
  g.fillStyle(style.colour, 1).fillRect(-r.w / 2 - 20, -r.h / 2 - 20, r.w + 40, r.h + 40);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    g.fillStyle(0xffffff, 0.12).fillTriangle(0, 0, Math.cos(a) * 1400, Math.sin(a) * 1400, Math.cos(a + 0.18) * 1400, Math.sin(a + 0.18) * 1400);
  }
  card.add(g);
  if (scene.textures.exists(iconKey(style.icon))) {
    const icon = scene.add.image(0, -70, iconKey(style.icon));
    icon.setScale(0.1);
    card.add(icon);
    scene.tweens.add({ targets: icon, scale: 230 / Math.max(icon.width, icon.height), duration: 420, ease: 'Back.easeOut' });
  }
  card.add(partyTextCh19(scene, 0, 90, 'MINI GAME!', { size: 30, fill: '#ffe066', strokeWidth: 7 }));
  card.add(partyTextCh19(scene, 0, 140, title, { size: 52, fill: '#ffffff', strokeWidth: 10 }));
  card.setScale(1.1).setAlpha(0);
  scene.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 200 });
  scene.tweens.add({
    targets: card, y: card.y - r.h - 80, duration: 460, delay: 1250, ease: 'Cubic.easeIn',
    onComplete: () => card.destroy(true),
  });
}

function wipeOut(scene: Phaser.Scene, colour: number): void {
  const r = stageRectCh19(scene);
  const g = scene.add.graphics().setDepth(1700).setName('party-minigame-wipe-out-ch19');
  g.fillStyle(colour, 1).fillRect(r.x - 20, r.y - 20, r.w + 40, r.h + 40);
  scene.tweens.add({ targets: g, alpha: 0, duration: 520, ease: 'Sine.easeIn', onComplete: () => g.destroy() });
}

/* ------------------------------------------------------------------ per frame */

function restyle(scene: Phaser.Scene, root: Phaser.GameObjects.Container): void {
  for (const name of OLD_CHROME) {
    const o = root.getByName(name) as (Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible) | null;
    if (o?.visible) o.setVisible(false);
  }
  // the old title / subtitle / stake lines: the header banner says it now
  for (const o of (root.getData('ch19-old-texts') as Phaser.GameObjects.Text[] | undefined) ?? []) if (o.visible) o.setVisible(false);
  const stage = root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
  if (!stage) return;

  const rules = stage.list.find((o): o is Phaser.GameObjects.Text => o instanceof Phaser.GameObjects.Text && o.name === 'vf07-minigame-result-heading' && o.text.startsWith('📘'));
  if (rules) { tutorial(scene, stage, rules); return; }

  let choiceIndex = 0;
  for (const o of [...stage.list]) {
    if (o.getData?.('ch19-skin')) continue;
    if (o instanceof Phaser.GameObjects.Graphics) {
      if (/vf07-minigame-choice-box-\d/.test(o.name)) {
        const idx = Number(o.name.slice(-1));
        const tint = [0xffd34d, 0x6cc4ff, 0xb79bff, 0x6fe0a0][idx % 4];
        const focused = o.scaleX > 1.01;
        reskinGraphicsCh19(scene, stage, o, (w, h) => {
          const box = partyBoxCh19(scene, 0, 0, w, h, tint, { radius: 26, ring: focused ? 9 : 7 });
          // the keyboard / pad focus gets a bright gold halo
          if (focused) box.lineStyle(7, 0xffe066, 1).strokeRoundedRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 34);
          return box;
        });
        choiceIndex++;
      } else if (PAPER.test(o.name)) {
        const strong = /(result-box|badge|ribbon)/.test(o.name);
        reskinGraphicsCh19(scene, stage, o, (w, h) => partyBoxCh19(scene, 0, 0, w, h, strong ? 0xffe38a : 0xfffaf0, { radius: 26, ring: 7, gloss: false, fillBottom: strong ? 0xffcf5a : 0xffeccc }));
      }
    } else if (o instanceof Phaser.GameObjects.Text) {
      let pick = PICK_FOR_EMOJI[o.text.trim()];
      // 🖐️ is both "BAO" (paper) and "SẤP" (palm down): read the card's label
      if (pick === 'paper') {
        const label = stage.list.find((t): t is Phaser.GameObjects.Text => t instanceof Phaser.GameObjects.Text && /choice-label/.test(t.name) && Math.abs(t.x - o.x) < 4);
        if (label && /SẤP/.test(label.text)) pick = 'palm-down';
      }
      if (pick && Number.parseFloat(String(o.style.fontSize)) >= 40 && !o.getData('ch19-pick')) {
        o.setData('ch19-pick', true).setAlpha(0);
        if (scene.textures.exists(pickKey(pick))) {
          const img = scene.add.image(o.x, o.y + 4, pickKey(pick)).setData('ch19-skin', true);
          img.setScale(104 / Math.max(img.width, img.height));
          stage.addAt(img, stage.getIndex(o) + 1);
        }
      } else if (!o.getData('ch19-font') && /choice-prompt|choice-hint|network-wait-hint|ranking-hint/.test(o.name)) {
        // lines that sit straight on the blue stage: white with a dark outline
        o.setData('ch19-font', true).setFontFamily(PARTY_FONT_CH19).setColor('#ffffff').setStroke(hexInk(), 6)
          .setShadow(0, 3, 'rgba(16,20,58,.45)', 0, true, true);
      } else if (!o.getData('ch19-font') && /heading|label/.test(o.name)) {
        // on light cards / papers: dark ink with a white outline
        o.setData('ch19-font', true).setFontFamily(PARTY_FONT_CH19).setColor(hexInk()).setStroke('#ffffff', 5);
      }
    }
  }
  void choiceIndex;
}

const hexInk = () => `#${PARTY_INK_CH19.toString(16).padStart(6, '0')}`;

/* ------------------------------------------------------------------ how to play */

function tutorial(scene: Phaser.Scene, stage: Phaser.GameObjects.Container, heading: Phaser.GameObjects.Text): void {
  if (stage.getData('ch19-tutorial') === heading) return;
  stage.setData('ch19-tutorial', heading);
  const title = heading.text.replace(/^📘\s*LUẬT\s*•\s*/, '').trim();
  const info = TUTORIALS[title];
  // payout line from the rules copy
  const body = stage.list.find((o): o is Phaser.GameObjects.Text => o instanceof Phaser.GameObjects.Text && o.name === 'vf07-minigame-result-body')
    ?? findTextDeep(stage, 'vf07-minigame-result-body');
  const payout = (body?.text.split('\n').find((line) => line.includes('THƯỞNG')) ?? '').replace(/^💰\s*THƯỞNG\s*/, '').trim();
  const cont = findTextDeep(stage, 'vf07-minigame-rules-continue-ch142');

  // hide the old rules card; keep its (interactive) continue line
  for (const o of stage.list) {
    if (o === cont) continue;
    (o as unknown as Phaser.GameObjects.Components.Visible).setVisible?.(false);
  }
  if (!info) { stage.list.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible?.(true)); return; }

  const group = scene.add.container(0, 0).setData('ch19-skin', true).setName('party-minigame-tutorial-ch19');
  group.add(partyBoxCh19(scene, 0, 24, 960, 508, 0xfffaf0, { radius: 30, ring: 8, gloss: false, fillBottom: 0xffeccc }));
  group.add(partyBannerCh19(scene, 0, -222, 420, `Cách chơi • ${title}`, 0xf2549c, 24));
  const stripW = 820;
  if (scene.textures.exists(tutKey(info.key))) {
    const img = scene.add.image(0, -24, tutKey(info.key));
    img.setScale(stripW / img.width);
    group.add(img);
    const h = img.displayHeight;
    info.captions.forEach((cap, i) => {
      const x = (i - 1) * (stripW / 3);
      const y = -24 + h / 2 + 28;
      const g = scene.add.graphics();
      g.fillStyle(PARTY_INK_CH19, 1).fillCircle(x - stripW / 6 + 30, y, 17);
      g.fillStyle(0xffe066, 1).fillCircle(x - stripW / 6 + 30, y, 14);
      group.add(g);
      group.add(partyTextCh19(scene, x - stripW / 6 + 30, y + 1, String(i + 1), { size: 18, fill: '#1f2340', stroke: '#ffffff', strokeWidth: 3, shadow: false }));
      group.add(partyTextCh19(scene, x + 14, y, cap, { size: 17, fill: '#1f2340', stroke: '#ffffff', strokeWidth: 4, wrap: stripW / 3 - 70, shadow: false }));
    });
  } else {
    info.captions.forEach((cap, i) => group.add(partyTextCh19(scene, 0, -100 + i * 60, `${i + 1}. ${cap}`, { size: 24, fill: '#1f2340', stroke: '#ffffff', strokeWidth: 5 })));
  }
  if (payout) group.add(partyTextCh19(scene, 0, 208, `🏆 Thưởng: ${payout}`, { size: 18, fill: '#7a3b12', stroke: '#ffffff', strokeWidth: 4, shadow: false }));
  stage.addAt(group, 0);
  if (cont) {
    // the old (interactive) continue line becomes a big glossy pill button
    const pill = partyPillShapeCh19(scene, 330, 64, 0xf2549c).setPosition(0, 262).setData('ch19-skin', true);
    stage.add(pill);
    cont.setVisible(true).setY(258).setFontFamily(PARTY_FONT_CH19).setFontSize(26).setColor('#ffffff').setStroke(hexInk(), 6)
      .setBackgroundColor('rgba(0,0,0,0)').setPadding(80, 16, 80, 16).setText('BẮT ĐẦU CHƠI! ▶');
    stage.bringToTop(cont);
    scene.tweens.add({ targets: [cont, pill], scale: 1.05, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

function findTextDeep(c: Phaser.GameObjects.Container, name: string): Phaser.GameObjects.Text | undefined {
  for (const o of c.list) {
    if (o instanceof Phaser.GameObjects.Text && o.name === name) return o;
    if (o instanceof Phaser.GameObjects.Container) {
      const t = findTextDeep(o, name);
      if (t) return t;
    }
  }
  return undefined;
}
