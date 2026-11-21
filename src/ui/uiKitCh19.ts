import Phaser from 'phaser';
import { publicAssetUrl } from './publicAssetUrl';

/**
 * CH-19 UI kit: painted, concept-matched frames / buttons / icons
 * (public/assets/ui/ch19, drawn with Codex from the MeMeMe board concept)
 * used instead of the flat vector panels. Presentation only.
 *
 * Panels and pill buttons are 9-slice / 3-slice so they stretch to any size
 * without distorting their rounded candy borders.
 */

export const UI_KIT_KEYS_CH19 = [
  'panel-coral', 'panel-lilac', 'btn-coral', 'btn-blue', 'btn-slate', 'ribbon-coral', 'chip-gold',
  'icon-coin', 'icon-card', 'icon-job', 'icon-dice', 'icon-alert', 'icon-crown', 'icon-heart',
] as const;
export type UiKitKeyCh19 = typeof UI_KIT_KEYS_CH19[number];
export const uiKeyCh19 = (name: UiKitKeyCh19): string => `ui-kit-ch19-${name}`;

export function preloadUiKitCh19(scene: Phaser.Scene): void {
  for (const name of UI_KIT_KEYS_CH19) {
    if (!scene.textures.exists(uiKeyCh19(name))) scene.load.image(uiKeyCh19(name), publicAssetUrl(`assets/ui/ch19/${name}.png`));
  }
}

export const uiReadyCh19 = (scene: Phaser.Scene, name: UiKitKeyCh19): boolean => scene.textures.exists(uiKeyCh19(name));

/** Painted panel stretched to w x h (centre origin). */
export function uiPanelCh19(scene: Phaser.Scene, name: 'panel-coral' | 'panel-lilac', w: number, h: number): Phaser.GameObjects.NineSlice {
  const s = 0.55; // corner size on screen = slice * s
  const slice = 64;
  return scene.add.nineslice(0, 0, uiKeyCh19(name), undefined, w / s, h / s, slice, slice, slice, slice)
    .setScale(s).setName(`ui-${name}-ch19`);
}

/** Painted pill button stretched to w (height h), centre origin. */
export function uiPillCh19(scene: Phaser.Scene, name: 'btn-coral' | 'btn-blue' | 'btn-slate', w: number, h: number): Phaser.GameObjects.NineSlice {
  const tex = scene.textures.get(uiKeyCh19(name)).getSourceImage() as HTMLImageElement;
  const s = h / tex.height;
  const cap = Math.floor(tex.height / 2);
  return scene.add.nineslice(0, 0, uiKeyCh19(name), undefined, Math.max(tex.height + 2, w / s), tex.height, cap, cap, 0, 0)
    .setScale(s).setName(`ui-${name}-ch19`);
}

/** Icon image fitted to `size` px (longest side). */
export function uiIconCh19(scene: Phaser.Scene, name: UiKitKeyCh19, x: number, y: number, size: number): Phaser.GameObjects.Image {
  const img = scene.add.image(x, y, uiKeyCh19(name)).setName(`ui-${name}-ch19`);
  const src = scene.textures.get(uiKeyCh19(name)).getSourceImage() as HTMLImageElement;
  return img.setScale(size / Math.max(src.width, src.height));
}

/* ------------------------------------------------------------------ live re-skin of older popups */

type Box = { x: number; y: number; w: number; h: number };
const BOUNDS = Symbol('ch19-graphics-bounds');
type Tracked = Phaser.GameObjects.Graphics & { [BOUNDS]?: Box };

let patched = false;
/**
 * Older popup layers draw their panels with Graphics.fillRoundedRect at sizes
 * decided in several places. Record the union of filled rects on each
 * Graphics so the painted panel can be laid exactly where the old one was.
 */
export function trackGraphicsBoundsCh19(): void {
  if (patched) return;
  patched = true;
  const proto = Phaser.GameObjects.Graphics.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const grow = (g: Tracked, x: number, y: number, w: number, h: number) => {
    const b = g[BOUNDS];
    if (!b) { g[BOUNDS] = { x, y, w, h }; return; }
    const x0 = Math.min(b.x, x), y0 = Math.min(b.y, y);
    const x1 = Math.max(b.x + b.w, x + w), y1 = Math.max(b.y + b.h, y + h);
    g[BOUNDS] = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };
  for (const method of ['fillRoundedRect', 'fillRect']) {
    const original = proto[method];
    proto[method] = function (this: Tracked, ...args: unknown[]) {
      const [x, y, w, h] = args as number[];
      if ([x, y, w, h].every((v) => typeof v === 'number' && Number.isFinite(v))) grow(this, x, y, w, h);
      return original.apply(this, args);
    };
  }
  const clear = proto.clear;
  proto.clear = function (this: Tracked, ...args: unknown[]) {
    delete this[BOUNDS];
    return clear.apply(this, args);
  };
}

export const graphicsBoundsCh19 = (g: Phaser.GameObjects.Graphics): Box | undefined => (g as Tracked)[BOUNDS];

/**
 * Lays a painted panel / button over the given old Graphics (same container,
 * same box) and hides the old one. Re-fits when the old Graphics is redrawn.
 */
export function reskinGraphicsCh19(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  old: Phaser.GameObjects.Graphics,
  make: (w: number, h: number) => Phaser.GameObjects.GameObject & { setPosition(x: number, y: number): unknown },
  pad = 0,
): void {
  const box = graphicsBoundsCh19(old);
  if (!box || box.w < 8 || box.h < 8) return;
  const sig = `${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.w)},${Math.round(box.h)},${old.x},${old.y},${old.scaleX},${old.scaleY}`;
  const skinKey = `ch19-skin-${old.name || container.getIndex(old)}`;
  const current = container.getData(skinKey) as { sig: string; obj: Phaser.GameObjects.GameObject } | undefined;
  // interactive shapes (choice cards) must stay hit-testable: Phaser ignores alpha-0 objects
  const hidden = old.input?.enabled ? 0.001 : 0;
  if (old.alpha !== hidden) old.setAlpha(hidden);
  if (current?.sig === sig && current.obj.active) return;
  current?.obj.destroy();
  // the old Graphics may itself be scaled by a later layout pass
  const sx = old.scaleX || 1, sy = old.scaleY || 1;
  const w = box.w * sx + pad * 2, h = box.h * sy + pad * 2;
  const obj = make(w, h);
  // a skin may itself be a Graphics: mark it so it is never taken for an old panel
  obj.setData('ch19-skin', true);
  obj.setPosition(old.x + (box.x + box.w / 2) * sx, old.y + (box.y + box.h / 2) * sy);
  container.addAt(obj, container.getIndex(old) + 1);
  container.setData(skinKey, { sig, obj });
}
