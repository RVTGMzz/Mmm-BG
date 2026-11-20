import Phaser from 'phaser';
import { publicAssetUrl } from './publicAssetUrl';
import { PROP_CATALOG_CH19, type IslandBoundsCh19, type IslandPropCh19 } from './cityIslandSceneryCh19';
import { installIslandCrittersCh19, preloadIslandCrittersCh19 } from './islandCrittersCh19';
import { preloadDiceCh19 } from './diceRollCh19';

/**
 * CH-19 live scenery: trees, buildings and landmarks from the concept-styled
 * sprite set (public/assets/scenery/ch19), placed by the island layout and
 * gently animated so the city feels alive without distracting from play:
 * trees sway (with an occasional gust), bushes breathe, buildings now and then
 * bounce / puff chimney smoke / sparkle their sign, glass towers blink a roof
 * light, the ferris wheel turns, the fountain sprays, the hospital cross pulses
 * and the jail lamps flicker. Presentation only; timings come from each prop's
 * deterministic seed (no gameplay RNG).
 */

const PROP_DEPTH_MIN_CH19 = -39;
const PROP_DEPTH_MAX_CH19 = -2;
const propKeyCh19 = (key: string): string => `island-prop-ch19-${key}`;

/** Chimney tops as a fraction of the (unflipped) sprite, measured from the art. */
const CHIMNEY_CH19: Readonly<Record<string, { x: number; y: number }>> = {
  'house-red': { x: 0.22, y: 0.04 },
  'house-blue': { x: 0.67, y: 0.05 },
  bakery: { x: 0.69, y: 0.02 },
};
/** Sign centres for the sparkle. */
const SIGN_CH19: Readonly<Record<string, { x: number; y: number }>> = {
  cafe: { x: 0.5, y: 0.45 },
  'shop-pink': { x: 0.62, y: 0.1 },
  store: { x: 0.62, y: 0.12 },
  bakery: { x: 0.52, y: 0.22 },
  apartment: { x: 0.5, y: 0.2 },
  'house-red': { x: 0.5, y: 0.45 },
  'house-blue': { x: 0.45, y: 0.45 },
  jobs: { x: 0.27, y: 0.1 },
};

/** Per-bush tints so no two bushes look copy-pasted (fresh, lime, deep, olive, warm). */
const BUSH_TINTS_CH19 = [0xffffff, 0xeaffd2, 0xd4f0e0, 0xf3f0c8, 0xffe8e0, 0xdcefff];

export function preloadIslandPropsCh19(scene: Phaser.Scene): void {
  preloadIslandCrittersCh19(scene);
  preloadDiceCh19(scene);
  for (const key of Object.keys(PROP_CATALOG_CH19)) {
    if (!scene.textures.exists(propKeyCh19(key))) {
      scene.load.image(propKeyCh19(key), publicAssetUrl(`assets/scenery/ch19/${key}.png`));
    }
  }
}

export function installIslandPropsCh19(
  scene: Phaser.Scene,
  props: readonly IslandPropCh19[],
  bounds: IslandBoundsCh19,
): Phaser.GameObjects.GameObject[] {
  const made: Phaser.GameObjects.GameObject[] = [];
  const depthFor = (y: number) =>
    PROP_DEPTH_MIN_CH19 + (PROP_DEPTH_MAX_CH19 - PROP_DEPTH_MIN_CH19) * Phaser.Math.Clamp((y - bounds.y) / bounds.h, 0, 1);

  for (const prop of props) {
    const texture = propKeyCh19(prop.key);
    if (!scene.textures.exists(texture)) continue;
    const catalog = PROP_CATALOG_CH19[prop.key];
    const scale = prop.w / catalog.w;
    const s = prop.seed;

    if (prop.kind === 'wheel') {
      const wheel = scene.add.image(prop.x, prop.y, texture).setScale(scale).setDepth(depthFor(prop.y + prop.h * 0.8) - 0.01)
        .setName('island-ferris-wheel-ch19');
      scene.tweens.add({ targets: wheel, angle: 360, duration: 36000, repeat: -1, ease: 'Linear' });
      made.push(wheel);
      continue;
    }

    // Container pivots at the base so rotation looks like trunk/ground sway.
    const root = scene.add.container(prop.x, prop.y).setDepth(depthFor(prop.y)).setName(`island-prop-ch19-${prop.kind}`);
    const image = scene.add.image(0, 0, texture).setOrigin(0.5, 1).setScale(scale).setFlipX(prop.flip);
    if (prop.kind === 'bush') {
      // every bush a little different: tint, width/height ratio
      image.setTint(BUSH_TINTS_CH19[Math.floor(s * 997) % BUSH_TINTS_CH19.length]);
      image.setScale(scale * (0.9 + ((s * 7.31) % 1) * 0.24), scale * (0.88 + ((s * 3.77) % 1) * 0.26));
    }
    root.add(image);
    made.push(root);
    const at = (fx: number, fy: number) => ({
      x: ((prop.flip ? 1 - fx : fx) - 0.5) * prop.w,
      y: -prop.h * (1 - fy),
    });

    if (prop.kind === 'tree' || prop.kind === 'bush') {
      const amp = prop.kind === 'bush' ? 0.6 : 0.9 + s * 1.1;
      root.setAngle(-amp);
      scene.tweens.add({
        targets: root, angle: amp, duration: 2200 + s * 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: s * 2400,
      });
      if (prop.kind === 'bush') {
        scene.tweens.add({ targets: image, scaleY: image.scaleY * 1.035, duration: 1800 + s * 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      } else {
        // an occasional gust bends the crown a little further, then settles
        const gust = () => {
          if (!image.active) return;
          scene.tweens.add({
            targets: image, angle: (s > 0.5 ? 1 : -1) * (3 + s * 2.5), duration: 260, yoyo: true, repeat: 1, ease: 'Sine.easeInOut',
          });
          scene.time.delayedCall(9000 + ((s * 7919) % 1) * 9000, gust);
        };
        scene.time.delayedCall(3000 + s * 9000, gust);
      }
      continue;
    }

    if (prop.kind === 'beach') {
      if (prop.key.startsWith('umbrella')) {
        // sea breeze: the canopy rocks a little
        root.setAngle(-1.2);
        scene.tweens.add({ targets: root, angle: 1.2, duration: 1700 + s * 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: s * 1500 });
      } else if (prop.key === 'beach-ball') {
        // now and then the ball gets a nudge and hops
        const hop = () => {
          if (!image.active) return;
          scene.tweens.add({ targets: image, y: -prop.h * 0.7, angle: image.angle + 90, duration: 260, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
          scene.time.delayedCall(8000 + s * 9000, hop);
        };
        scene.time.delayedCall(3000 + s * 8000, hop);
      } else if (prop.key === 'sandcastle') {
        sparkle(scene, root, at(0.62, 0.08), prop.w * 0.8, s);
      }
      continue;
    }

    if (prop.kind === 'building') {
      // now and then: a cheerful squash-bounce
      const bounce = () => {
        if (!image.active) return;
        scene.tweens.add({ targets: image, scaleY: scale * 1.045, scaleX: scale * 0.985, duration: 140, yoyo: true, ease: 'Sine.easeOut' });
        scene.time.delayedCall(14000 + s * 12000, bounce);
      };
      scene.time.delayedCall(4000 + s * 14000, bounce);
      if (prop.key === 'tower-glass') blinkLight(scene, root, at(0.5, 0.02), Math.max(3, prop.w * 0.035), s);
    }

    const chimney = CHIMNEY_CH19[prop.key];
    if (chimney) smoke(scene, root, at(chimney.x, chimney.y), prop.w, s);
    const sign = SIGN_CH19[prop.key];
    if (sign) sparkle(scene, root, at(sign.x, sign.y), prop.w, s);

    if (prop.key === 'fountain') spray(scene, root, at(0.5, 0.33), prop.w, s);
    if (prop.key === 'hospital') pulseGlow(scene, root, at(0.5, 0.09), prop.w * 0.09, 0xffffff, 2400);
    if (prop.key === 'jail') {
      flicker(scene, root, at(0.3, 0.62), prop.w * 0.05, s);
      flicker(scene, root, at(0.7, 0.62), prop.w * 0.05, (s + 0.37) % 1);
    }
    if (prop.key === 'jobs') blinkLight(scene, root, at(0.68, 0.03), Math.max(3, prop.w * 0.025), s);
  }
  installIslandCrittersCh19(scene, props, (p) => depthFor(p.y), bounds);
  return made;
}

/* ------------------------------------------------------------------ effects */

function smoke(scene: Phaser.Scene, root: Phaser.GameObjects.Container, p: { x: number; y: number }, w: number, s: number): void {
  const burst = () => {
    if (!root.active) return;
    for (let i = 0; i < 3; i++) {
      scene.time.delayedCall(i * 420, () => {
        if (!root.active) return;
        const puff = scene.add.circle(p.x, p.y, w * 0.035, 0xffffff, 0.75);
        root.add(puff);
        scene.tweens.add({
          targets: puff, y: p.y - w * 0.28, x: p.x + w * 0.05, scale: 2.2, alpha: 0, duration: 1900, ease: 'Sine.easeOut',
          onComplete: () => puff.destroy(),
        });
      });
    }
    scene.time.delayedCall(6000 + s * 6000, burst);
  };
  scene.time.delayedCall(1500 + s * 6000, burst);
}

function sparkle(scene: Phaser.Scene, root: Phaser.GameObjects.Container, p: { x: number; y: number }, w: number, s: number): void {
  const r = w * 0.07;
  const star = scene.add.graphics().setPosition(p.x, p.y).setAlpha(0).setScale(0.2);
  star.fillStyle(0xfff6c2, 1);
  star.fillPoints([
    { x: 0, y: -r }, { x: r * 0.22, y: -r * 0.22 }, { x: r, y: 0 }, { x: r * 0.22, y: r * 0.22 },
    { x: 0, y: r }, { x: -r * 0.22, y: r * 0.22 }, { x: -r, y: 0 }, { x: -r * 0.22, y: -r * 0.22 },
  ], true);
  root.add(star);
  const twinkle = () => {
    if (!star.active) return;
    scene.tweens.add({
      targets: star, alpha: { from: 0, to: 1 }, scale: { from: 0.2, to: 1 }, angle: { from: 0, to: 45 },
      duration: 280, yoyo: true, hold: 120, ease: 'Sine.easeOut',
    });
    scene.time.delayedCall(7000 + s * 8000, twinkle);
  };
  scene.time.delayedCall(2000 + s * 9000, twinkle);
}

function blinkLight(scene: Phaser.Scene, root: Phaser.GameObjects.Container, p: { x: number; y: number }, r: number, s: number): void {
  const glow = scene.add.circle(p.x, p.y, r * 2.2, 0xff5a5a, 0.35);
  const dot = scene.add.circle(p.x, p.y, r, 0xff3b3b, 1);
  root.add([glow, dot]);
  scene.tweens.add({ targets: [glow, dot], alpha: 0.15, duration: 600, yoyo: true, repeat: -1, hold: 500, delay: s * 1200 });
}

function pulseGlow(scene: Phaser.Scene, root: Phaser.GameObjects.Container, p: { x: number; y: number }, r: number, color: number, period: number): void {
  const glow = scene.add.circle(p.x, p.y, r, color, 0).setBlendMode(Phaser.BlendModes.ADD);
  root.add(glow);
  scene.tweens.add({ targets: glow, alpha: 0.55, scale: 1.35, duration: period / 2, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

function flicker(scene: Phaser.Scene, root: Phaser.GameObjects.Container, p: { x: number; y: number }, r: number, s: number): void {
  const glow = scene.add.circle(p.x, p.y, r, 0xffc861, 0.45).setBlendMode(Phaser.BlendModes.ADD);
  root.add(glow);
  let n = 0;
  scene.time.addEvent({
    delay: 140, loop: true,
    callback: () => {
      n++;
      const v = Math.sin((n + s * 100) * 1.7) * Math.sin((n + s * 50) * 0.63);
      glow.setAlpha(0.32 + 0.22 * v).setScale(1 + 0.12 * v);
    },
  });
}

function spray(scene: Phaser.Scene, root: Phaser.GameObjects.Container, p: { x: number; y: number }, w: number, s: number): void {
  let n = 0;
  scene.time.addEvent({
    delay: 220, loop: true,
    callback: () => {
      if (!root.active) return;
      n++;
      const dir = Math.sin((n + s * 10) * 2.3);
      const drop = scene.add.circle(p.x, p.y, w * 0.012, 0xbfeaff, 0.95);
      root.add(drop);
      const dx = dir * w * 0.2;
      scene.tweens.add({ targets: drop, x: p.x + dx, duration: 900, ease: 'Linear' });
      scene.tweens.add({
        targets: drop, y: p.y - w * 0.12, duration: 380, ease: 'Sine.easeOut', yoyo: true, hold: 0,
        onYoyo: () => undefined,
        onComplete: () => {
          scene.tweens.add({ targets: drop, y: p.y + w * 0.1, alpha: 0, duration: 300, ease: 'Sine.easeIn', onComplete: () => drop.destroy() });
        },
      });
    },
  });
}
