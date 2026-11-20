import Phaser from 'phaser';
import { publicAssetUrl } from './publicAssetUrl';
import { stageRectCh19 } from './responsiveStageCh19';

/**
 * CH-19 "party" UI kit: bold, saturated, thick-outlined console-party style
 * (polka-dot portrait cards, starry backdrops, cloud option pills, glossy
 * round buttons). Everything is drawn with Graphics so it stays crisp at any
 * scale; character busts are painted art (public/assets/ui/ch19/bust-*.webp).
 * Presentation only: no game state lives here.
 */

export const PARTY_FONT_CH19 =
  '"Arial Rounded MT Bold", "Nunito", ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif';
export const PARTY_INK_CH19 = 0x1f2340;

export const PARTY_PLAYER_COLOURS_CH19 = [0xf0524a, 0x3f8cf0, 0xf5b335, 0x3cbf6b] as const;
export const PARTY_PLAYER_HEX_CH19 = ['#f0524a', '#3f8cf0', '#f5b335', '#3cbf6b'] as const;

/* ------------------------------------------------------------------ busts */

export const PARTY_BUST_IDS_CH19: Record<string, string> = {
  'starter-crybaby': 'khoc-nhe',
  'starter-grumpy': 'cau-co',
  'starter-anxious': 'lo-lang',
  'starter-hyper': 'tang-dong',
  'secret-baby': 'secret-baby',
};
export const partyBustKeyCh19 = (characterId: string | undefined): string | undefined =>
  characterId && PARTY_BUST_IDS_CH19[characterId] ? `party-bust-ch19-${PARTY_BUST_IDS_CH19[characterId]}` : undefined;

/** Card colour that suits each character's palette. */
export const PARTY_CHARACTER_COLOUR_CH19: Record<string, number> = {
  'starter-crybaby': 0xf47fb0,
  'starter-grumpy': 0xf08a3c,
  'starter-anxious': 0x46b3e6,
  'starter-hyper': 0xa77ef0,
  'secret-baby': 0xf5c33b,
};

export function preloadPartyKitCh19(scene: Phaser.Scene): void {
  for (const file of new Set(Object.values(PARTY_BUST_IDS_CH19))) {
    const key = `party-bust-ch19-${file}`;
    if (!scene.textures.exists(key)) scene.load.image(key, publicAssetUrl(`assets/ui/ch19/bust-${file}.webp`));
  }
}

/* ------------------------------------------------------------------ colour */

export function tintCh19(colour: number, k: number): number {
  const c = Phaser.Display.Color.IntegerToColor(colour);
  const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return Phaser.Display.Color.GetColor(f(c.red), f(c.green), f(c.blue));
}
export const hexCh19 = (colour: number): string => `#${colour.toString(16).padStart(6, '0')}`;

/* ------------------------------------------------------------------ text */

export type PartyTextOptsCh19 = {
  size?: number;
  fill?: string;
  gradient?: [string, string];
  stroke?: string;
  strokeWidth?: number;
  shadow?: boolean;
  align?: 'left' | 'center' | 'right';
  wrap?: number;
};

/** Chunky outlined text (white stroke + dark drop), optional vertical gradient fill. */
export function partyTextCh19(scene: Phaser.Scene, x: number, y: number, text: string, o: PartyTextOptsCh19 = {}): Phaser.GameObjects.Text {
  const size = o.size ?? 28;
  const t = scene.add.text(x, y, text, {
    fontFamily: PARTY_FONT_CH19,
    fontSize: `${size}px`,
    fontStyle: 'bold',
    color: o.fill ?? '#ffffff',
    stroke: o.stroke ?? hexCh19(PARTY_INK_CH19),
    strokeThickness: o.strokeWidth ?? Math.max(3, Math.round(size * 0.2)),
    align: o.align ?? 'center',
    wordWrap: o.wrap ? { width: o.wrap, useAdvancedWrap: true } : undefined,
    shadow: o.shadow === false ? undefined : { offsetX: 0, offsetY: Math.max(2, size * 0.09), color: 'rgba(20,24,60,.45)', blur: 0, fill: true, stroke: true },
    padding: { x: 4, y: 4 },
  }).setOrigin(o.align === 'left' ? 0 : o.align === 'right' ? 1 : 0.5, 0.5);
  if (o.gradient) {
    const g = t.context.createLinearGradient(0, 0, 0, t.height);
    g.addColorStop(0.15, o.gradient[0]);
    g.addColorStop(0.85, o.gradient[1]);
    t.setFill(g);
  }
  return t;
}

/* ------------------------------------------------------------------ shapes */

function starPoints(cx: number, cy: number, r: number, inner: number, spin = -Math.PI / 2): Phaser.Math.Vector2[] {
  const pts: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const a = spin + (i * Math.PI) / 5;
    const rr = i % 2 ? inner : r;
    pts.push(new Phaser.Math.Vector2(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr));
  }
  return pts;
}
export function fillStarCh19(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, spin?: number): void {
  g.fillPoints(starPoints(cx, cy, r, r * 0.5, spin), true);
}

const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/* ------------------------------------------------------------------ backdrop */

export type PartyBackdropCh19 = 'sun' | 'sea' | 'berry' | 'sky';
const BACKDROPS: Record<PartyBackdropCh19, { base: number; glow: number; star: number; dot: number }> = {
  sun: { base: 0xffd84d, glow: 0xfff3a8, star: 0xffffff, dot: 0xffc22e },
  sea: { base: 0x46c9b0, glow: 0xb6f2e2, star: 0xe9fff8, dot: 0x2fae95 },
  berry: { base: 0xff8fbd, glow: 0xffe1ee, star: 0xffffff, dot: 0xf46ea6 },
  sky: { base: 0x6cbcf5, glow: 0xd9f0ff, star: 0xffffff, dot: 0x4ba3e6 },
};

/**
 * Full-stage starry backdrop (fills every aspect ratio), slowly drifting.
 * Depth -1000 so scene content stays on top.
 */
export function paintPartyBackdropCh19(scene: Phaser.Scene, variant: PartyBackdropCh19): Phaser.GameObjects.Container {
  const p = BACKDROPS[variant];
  scene.cameras.main.setBackgroundColor(p.base);
  const root = scene.add.container(0, 0).setDepth(-1000).setName('party-backdrop-ch19');
  // cover the widest supported stage plus the drift period
  const X0 = -520, Y0 = -420, X1 = 1800, Y1 = 1140, P = 180;
  const base = scene.add.graphics();
  base.fillStyle(p.base, 1).fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  // soft radial glow in the middle
  for (let i = 9; i >= 1; i--) base.fillStyle(p.glow, 0.07).fillEllipse(640, 330, 260 + i * 130, 170 + i * 90);
  root.add(base);

  const drift = scene.add.graphics();
  let n = 0;
  for (let y = Y0; y < Y1 + P; y += P / 2) {
    const row = Math.round((y - Y0) / (P / 2));
    for (let x = X0 + (row % 2 ? P / 2 : 0); x < X1 + P; x += P) {
      n++;
      const big = hash(n) < 0.32;
      drift.fillStyle(p.star, big ? 0.34 : 0.26);
      fillStarCh19(drift, x + (hash(n * 3) - 0.5) * 30, y + (hash(n * 5) - 0.5) * 30, big ? 34 + hash(n * 7) * 14 : 14 + hash(n * 7) * 8, -Math.PI / 2 + (hash(n * 11) - 0.5) * 0.7);
      drift.fillStyle(p.dot, 0.5).fillCircle(x + P / 4, y + P / 4 - 10, 5 + hash(n * 13) * 4);
    }
  }
  root.add(drift);
  scene.tweens.add({ targets: drift, x: -P, y: -P, duration: 16000, repeat: -1, ease: 'Linear' });

  // sparkles that twinkle
  for (let i = 0; i < 10; i++) {
    const s = scene.add.graphics().setPosition(80 + hash(i * 17) * 1120, 60 + hash(i * 19) * 600);
    s.fillStyle(0xffffff, 0.95);
    fillStarCh19(s, 0, 0, 9, -Math.PI / 2);
    s.fillPoints([new Phaser.Math.Vector2(0, -16), new Phaser.Math.Vector2(3, 0), new Phaser.Math.Vector2(0, 16), new Phaser.Math.Vector2(-3, 0)], true);
    s.setAlpha(0).setScale(0.6);
    root.add(s);
    scene.tweens.add({ targets: s, alpha: 0.9, scale: 1, duration: 700, yoyo: true, repeat: -1, delay: hash(i * 23) * 3000, repeatDelay: 1400 + hash(i * 29) * 2600, ease: 'Sine.easeInOut' });
  }
  return root;
}

/* ------------------------------------------------------------------ frames */

export type PartyBoxOptsCh19 = { radius?: number; ring?: number; outline?: number; gloss?: boolean; shadow?: boolean; fillBottom?: number };

/** Rounded box: dark outline, white ring, coloured face (optional vertical gradient + gloss). */
export function drawPartyBoxCh19(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, colour: number, o: PartyBoxOptsCh19 = {}): void {
  const r = o.radius ?? Math.min(26, h / 2);
  const ring = o.ring ?? 6;
  const ol = o.outline ?? 4;
  if (o.shadow !== false) g.fillStyle(0x10143a, 0.28).fillRoundedRect(x + 4, y + 7, w, h, r);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(x - ol, y - ol, w + ol * 2, h + ol * 2, r + ol);
  g.fillStyle(0xffffff, 1).fillRoundedRect(x, y, w, h, r);
  const ir = Math.max(4, r - ring);
  const bottom = o.fillBottom ?? tintCh19(colour, -0.18);
  g.fillStyle(bottom, 1).fillRoundedRect(x + ring, y + ring, w - ring * 2, h - ring * 2, ir);
  g.fillStyle(tintCh19(colour, 0.06), 1).fillRoundedRect(x + ring, y + ring, w - ring * 2, (h - ring * 2) * 0.62, { tl: ir, tr: ir, bl: 0, br: 0 });
  g.fillStyle(colour, 1).fillRect(x + ring, y + ring + (h - ring * 2) * 0.62 - 1, w - ring * 2, Math.min(ir, (h - ring * 2) * 0.2));
  if (o.gloss !== false) {
    g.fillStyle(0xffffff, 0.22).fillRoundedRect(x + ring + 6, y + ring + 4, w - ring * 2 - 12, Math.min(18, (h - ring * 2) * 0.32), { tl: ir, tr: ir, bl: 6, br: 6 });
  }
}

export function partyBoxCh19(scene: Phaser.Scene, x: number, y: number, w: number, h: number, colour: number, o: PartyBoxOptsCh19 = {}): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setPosition(x, y);
  drawPartyBoxCh19(g, -w / 2, -h / 2, w, h, colour, o);
  return g;
}

/** Title banner like a TV-game header. */
export function partyBannerCh19(scene: Phaser.Scene, x: number, y: number, w: number, text: string, colour = 0x2f6fd6, size = 34): Phaser.GameObjects.Container {
  const h = size * 2.1;
  const c = scene.add.container(x, y).setName('party-banner-ch19');
  c.add(partyBoxCh19(scene, 0, 0, w, h, colour, { radius: h / 2, ring: 7 }));
  c.add(partyTextCh19(scene, 0, 0, text, { size, gradient: ['#ffffff', '#cfe9ff'], stroke: hexCh19(tintCh19(colour, -0.55)), strokeWidth: Math.round(size * 0.22) }));
  return c;
}

/* ------------------------------------------------------------------ portrait card */

export type PartyCardOptsCh19 = {
  w: number;
  h: number;
  colour: number;
  bust?: string; // texture key
  mystery?: boolean; // "?" silhouette instead of a bust
  label?: string; // name strip at the bottom
  dim?: boolean;
};

/**
 * Polka-dot portrait card with a thick dark frame and a grey bevel, like a
 * console party game roster. Returns a container sized for input.
 */
export function partyCardCh19(scene: Phaser.Scene, x: number, y: number, o: PartyCardOptsCh19): Phaser.GameObjects.Container {
  const { w, h } = o;
  const c = scene.add.container(x, y).setSize(w, h).setName('party-card-ch19');
  const g = scene.add.graphics();
  const x0 = -w / 2, y0 = -h / 2, r = 18;
  g.fillStyle(0x10143a, 0.3).fillRoundedRect(x0 + 6, y0 + 9, w, h, r);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(x0 - 4, y0 - 4, w + 8, h + 8, r + 4);
  g.fillStyle(0xdfe3ec, 1).fillRoundedRect(x0, y0, w, h, r);
  g.fillStyle(0xb8bfcf, 1).fillRoundedRect(x0 + 4, y0 + h - 14, w - 8, 10, 5);
  g.fillStyle(0xffffff, 1).fillRoundedRect(x0 + 6, y0 + 6, w - 12, h - 16, r - 4);
  const fx = x0 + 11, fy = y0 + 11, fw = w - 22, fh = h - 26;
  const col = o.dim ? tintCh19(o.colour, 0.45) : o.colour;
  g.fillStyle(col, 1).fillRoundedRect(fx, fy, fw, fh, 10);
  // polka dots
  const step = Math.max(16, Math.round(fw / 7));
  g.fillStyle(tintCh19(col, 0.32), 1);
  for (let yy = fy + step / 2, row = 0; yy < fy + fh - 4; yy += step * 0.62, row++) {
    for (let xx = fx + (row % 2 ? step / 2 : 0) + step / 4; xx < fx + fw - 4; xx += step) {
      g.fillCircle(xx, yy, step * 0.2);
    }
  }
  c.add(g);
  if (o.bust && scene.textures.exists(o.bust)) {
    const img = scene.add.image(0, fy + fh, o.bust).setOrigin(0.5, 1);
    const src = scene.textures.get(o.bust).getSourceImage() as HTMLImageElement;
    const s = (fw + 8) / src.width;
    img.setScale(s);
    const visibleSrcH = Math.min(src.height, fh / s);
    img.setCrop(0, src.height - visibleSrcH, src.width, visibleSrcH);
    if (o.dim) img.setTint(0xb0b0c0);
    c.add(img);
  } else if (o.mystery) {
    const m = scene.add.graphics();
    const cx = 0, base = fy + fh, hr = fw * 0.26;
    m.fillStyle(tintCh19(col, -0.55), 1);
    // shoulders: a half ellipse sitting on the bottom edge of the art window
    m.slice(cx, base, fw * 0.4, Math.PI, 0, false).fillPath();
    m.fillCircle(cx, base - fh * 0.48, hr);
    // a messy hair tuft, so it reads as "a person" rather than an animal
    m.fillCircle(cx - hr * 0.45, base - fh * 0.5 - hr * 0.85, hr * 0.42);
    m.fillCircle(cx + hr * 0.1, base - fh * 0.5 - hr * 1.0, hr * 0.46);
    m.fillCircle(cx + hr * 0.6, base - fh * 0.5 - hr * 0.78, hr * 0.38);
    c.add(m);
    c.add(partyTextCh19(scene, cx, base - fh * 0.42, '?', { size: Math.round(fw * 0.42), fill: '#ffffff', stroke: hexCh19(tintCh19(col, -0.65)) }));
  }
  // frame lip over the art corners
  const lip = scene.add.graphics();
  lip.lineStyle(5, 0xffffff, 1).strokeRoundedRect(fx - 2, fy - 2, fw + 4, fh + 4, 11);
  lip.fillStyle(0xffffff, 0.16).fillRoundedRect(fx + 4, fy + 3, fw - 8, Math.min(26, fh * 0.12), 8);
  c.add(lip);
  if (o.label) {
    c.add(partyTextCh19(scene, 0, fy + fh - 4, o.label, { size: Math.max(14, Math.round(w * 0.11)), fill: '#ffffff', stroke: hexCh19(PARTY_INK_CH19) }));
  }
  return c;
}

/** Scalloped seal badge ("1P", "2P"...) */
export function partyBadgeCh19(scene: Phaser.Scene, x: number, y: number, text: string, colour: number, r = 30): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setName('party-badge-ch19');
  const g = scene.add.graphics();
  const bumps = 9;
  const blob = (rr: number, col: number) => {
    g.fillStyle(col, 1).fillCircle(0, 0, rr * 0.86);
    for (let i = 0; i < bumps; i++) {
      const a = (i / bumps) * Math.PI * 2;
      g.fillCircle(Math.cos(a) * rr * 0.72, Math.sin(a) * rr * 0.72, rr * 0.34);
    }
  };
  blob(r + 4, PARTY_INK_CH19);
  blob(r, 0xffffff);
  blob(r - 6, colour);
  g.fillStyle(0xffffff, 0.3).fillEllipse(0, -r * 0.35, r * 1.1, r * 0.5);
  c.add(g);
  c.add(partyTextCh19(scene, 0, 1, text, { size: Math.round(r * 0.78), fill: '#ffffff', stroke: hexCh19(tintCh19(colour, -0.55)) }));
  return c;
}

/* ------------------------------------------------------------------ buttons */

function hoverable(c: Phaser.GameObjects.Container, onClick: () => void): void {
  c.setInteractive({ useHandCursor: true });
  const s0 = () => (c.getData('baseScale') as number | undefined) ?? 1;
  c.on('pointerover', () => c.scene.tweens.add({ targets: c, scale: s0() * 1.06, duration: 110 }));
  c.on('pointerout', () => c.scene.tweens.add({ targets: c, scale: s0(), duration: 110 }));
  c.on('pointerdown', () => {
    c.scene.tweens.add({ targets: c, scale: s0() * 0.94, duration: 70, yoyo: true });
    onClick();
  });
}

/** Cloud-shaped option pill (board / laps / bonus style). */
export function partyCloudCh19(scene: Phaser.Scene, x: number, y: number, w: number, h: number, colour: number, label: string, onClick?: () => void, size = 30): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setSize(w + 20, h + 20).setName('party-cloud-ch19');
  const g = scene.add.graphics();
  const lumps = Math.max(4, Math.round(w / 70));
  const shape = (grow: number, col: number, dy = 0) => {
    g.fillStyle(col, 1);
    g.fillRoundedRect(-w / 2 - grow, -h / 2 + h * 0.12 - grow + dy, w + grow * 2, h * 0.76 + grow * 2, h * 0.38 + grow);
    for (let i = 0; i < lumps; i++) {
      const t = (i + 0.5) / lumps;
      const lx = -w / 2 + w * t;
      const lr = h * (0.3 + 0.06 * Math.sin(i * 2.3)) + grow;
      g.fillCircle(lx, -h / 2 + h * 0.3 + dy, lr);
      g.fillCircle(lx + w / lumps / 2 - w / lumps / 2, h / 2 - h * 0.3 + dy, lr * 0.92);
    }
    g.fillCircle(-w / 2 + h * 0.18, dy, h * 0.4 + grow);
    g.fillCircle(w / 2 - h * 0.18, dy, h * 0.4 + grow);
  };
  shape(9, PARTY_INK_CH19, 5);
  shape(9, PARTY_INK_CH19);
  shape(5, 0xffffff);
  shape(0, colour);
  g.fillStyle(0xffffff, 0.3).fillEllipse(-w * 0.12, -h * 0.22, w * 0.62, h * 0.24);
  c.add(g);
  const t = partyTextCh19(scene, 0, 2, label, { size, gradient: ['#fff6c2', '#ffb02e'], stroke: hexCh19(tintCh19(colour, -0.6)), strokeWidth: Math.round(size * 0.24) });
  t.setName('label');
  c.add(t);
  if (onClick) hoverable(c, onClick);
  return c;
}

/** Glossy round button ("Có" / "Không"). */
export function partyRoundButtonCh19(scene: Phaser.Scene, x: number, y: number, r: number, colour: number, label: string, onClick?: () => void, size?: number): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setSize(r * 2, r * 2).setName('party-round-button-ch19');
  const g = scene.add.graphics();
  g.fillStyle(0x10143a, 0.3).fillCircle(4, 8, r);
  g.fillStyle(PARTY_INK_CH19, 1).fillCircle(0, 0, r + 4);
  g.fillStyle(0xffffff, 1).fillCircle(0, 0, r);
  g.fillStyle(tintCh19(colour, -0.2), 1).fillCircle(0, 0, r - 6);
  g.fillStyle(colour, 1).fillCircle(0, -3, r - 9);
  g.fillStyle(0xffffff, 0.3).fillEllipse(-r * 0.12, -r * 0.45, r * 1.1, r * 0.45);
  c.add(g);
  c.add(partyTextCh19(scene, 0, 0, label, { size: size ?? Math.round(r * 0.55), fill: '#ffffff', stroke: hexCh19(PARTY_INK_CH19) }).setName('label'));
  if (onClick) hoverable(c, onClick);
  return c;
}

/** Capsule button body only (no label), centre origin. */
export function partyPillShapeCh19(scene: Phaser.Scene, w: number, h: number, colour: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(0x10143a, 0.3).fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, h / 2 + 3);
  g.fillStyle(0xffffff, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  g.fillStyle(tintCh19(colour, -0.22), 1).fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, h / 2 - 4);
  g.fillStyle(colour, 1).fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 12, h / 2 - 4);
  g.fillStyle(0xffffff, 0.28).fillRoundedRect(-w / 2 + 14, -h / 2 + 7, w - 28, (h - 14) * 0.32, (h - 14) * 0.16);
  return g;
}

/** Glossy capsule button. */
export function partyPillButtonCh19(scene: Phaser.Scene, x: number, y: number, w: number, h: number, colour: number, label: string, onClick?: () => void, size?: number): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setSize(w, h).setName('party-pill-button-ch19');
  const g = scene.add.graphics();
  g.fillStyle(0x10143a, 0.3).fillRoundedRect(-w / 2 + 3, -h / 2 + 7, w, h, h / 2);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4);
  g.fillStyle(0xffffff, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  g.fillStyle(tintCh19(colour, -0.22), 1).fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, h / 2 - 5);
  g.fillStyle(colour, 1).fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 15, h / 2 - 5);
  g.fillStyle(0xffffff, 0.3).fillRoundedRect(-w / 2 + 16, -h / 2 + 9, w - 32, (h - 18) * 0.34, (h - 18) * 0.17);
  c.add(g);
  c.add(partyTextCh19(scene, 0, -2, label, { size: size ?? Math.round(h * 0.42), fill: '#ffffff', stroke: hexCh19(PARTY_INK_CH19) }).setName('label'));
  if (onClick) hoverable(c, onClick);
  return c;
}

/** Bottom hint capsule: [A] Chọn  [B] Quay lại */
export function partyHintBarCh19(scene: Phaser.Scene, x: number, y: number, items: { key: string; label: string; colour: string }[]): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setName('party-hint-bar-ch19');
  const parts: Phaser.GameObjects.GameObject[] = [];
  let cx = 0;
  const widths: number[] = [];
  for (const it of items) {
    const glyph = scene.add.container(0, 0);
    const gg = scene.add.graphics();
    gg.fillStyle(PARTY_INK_CH19, 1).fillCircle(0, 0, 16);
    gg.fillStyle(0xffffff, 1).fillCircle(0, 0, 13);
    glyph.add(gg);
    glyph.add(scene.add.text(0, 0, it.key, { fontFamily: PARTY_FONT_CH19, fontSize: '17px', fontStyle: 'bold', color: '#1f2340' }).setOrigin(0.5));
    const t = partyTextCh19(scene, 0, 0, it.label, { size: 26, fill: it.colour, stroke: '#ffffff', strokeWidth: 6, align: 'left' });
    widths.push(40 + t.width + 34);
    parts.push(glyph, t);
  }
  const total = widths.reduce((a, b) => a + b, 0) + 30;
  const g = scene.add.graphics();
  g.fillStyle(0x10143a, 0.25).fillRoundedRect(-total / 2 + 3, -27, total, 60, 30);
  g.fillStyle(0x9aa3b5, 1).fillRoundedRect(-total / 2 - 4, -34, total + 8, 66, 33);
  g.fillStyle(0xffffff, 1).fillRoundedRect(-total / 2, -30, total, 58, 29);
  g.fillStyle(0xd8f5ec, 1).fillRoundedRect(-total / 2 + 6, -24, total - 12, 46, 23);
  c.add(g);
  cx = -total / 2 + 15;
  for (let i = 0; i < items.length; i++) {
    const glyph = parts[i * 2] as Phaser.GameObjects.Container;
    const t = parts[i * 2 + 1] as Phaser.GameObjects.Text;
    glyph.setPosition(cx + 20, 0);
    t.setPosition(cx + 42, 0);
    c.add([glyph, t]);
    cx += widths[i];
  }
  return c;
}

/* ------------------------------------------------------------------ stage helpers */

/** Pin a container to an edge of the visible stage (after aspect changes too). */
export function pinToStageCh19(scene: Phaser.Scene, obj: Phaser.GameObjects.Components.Transform, anchor: { x?: 'left' | 'right'; y?: 'top' | 'bottom' }, dx = 0, dy = 0): void {
  const apply = () => {
    const r = stageRectCh19(scene);
    if (anchor.x === 'left') obj.x = r.x + dx;
    if (anchor.x === 'right') obj.x = r.x + r.w + dx;
    if (anchor.y === 'top') obj.y = r.y + dy;
    if (anchor.y === 'bottom') obj.y = r.y + r.h + dy;
  };
  apply();
  scene.scale.on(Phaser.Scale.Events.RESIZE, apply);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scale.off(Phaser.Scale.Events.RESIZE, apply));
}

/* ------------------------------------------------------------------ DOM skins */

/**
 * Older screens are DOM forms that own all of their logic. The party skin
 * draws the screen in Phaser and keeps the DOM alive but invisible, pressing
 * its buttons on the player's behalf.
 */
export function veilDomCh19(dom: Phaser.GameObjects.DOMElement): HTMLElement {
  const node = dom.node as HTMLElement;
  // Phaser rewrites opacity / display every frame, but leaves visibility alone
  dom.setAlpha(0);
  node.style.visibility = 'hidden';
  node.style.pointerEvents = 'none';
  node.setAttribute('aria-hidden', 'true');
  return node;
}

export function pressDomCh19(root: ParentNode, selector: string): void {
  const el = root.querySelector<HTMLElement>(selector);
  if (el && !(el as HTMLButtonElement).disabled) el.click();
}
