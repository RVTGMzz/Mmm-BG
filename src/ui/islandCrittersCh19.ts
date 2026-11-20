import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { publicAssetUrl } from './publicAssetUrl';
import type { IslandBoundsCh19, IslandPropCh19 } from './cityIslandSceneryCh19';

/**
 * CH-19 island wildlife (presentation only):
 *  - now and then a rabbit peeks out of a bush, or hops out, sits and hops back;
 *  - butterflies flutter out of bushes and wander back in;
 *  - small flocks of birds (blue songbird, yellow canary, seagull) fly across
 *    the view with a soft synthesised chirp, each species with its own call.
 * Timing comes from a deterministic hash (no Math.random, no gameplay RNG).
 */

const CRITTER_KEYS_CH19 = [
  ...[1, 2, 3, 4].flatMap((n) => [`bird-blue-${n}`, `bird-yellow-${n}`, `seagull-${n}`]),
  ...[1, 2, 3].flatMap((n) => [`butterfly-orange-${n}`, `butterfly-blue-${n}`]),
  'rabbit-peek', 'rabbit-peek-blink', 'rabbit-sit', 'rabbit-hop',
];
const critterKeyCh19 = (name: string): string => `island-critter-ch19-${name}`;
const BIRD_DEPTH_CH19 = 60;

type BirdKind = 'blue' | 'yellow' | 'seagull';
/** 4-frame wing cycle (up, level, down, level) per species. */
const BIRDS_CH19: Record<BirdKind, { frames: string[]; size: number; speed: number; flap: number }> = {
  blue: { frames: [1, 2, 3, 4].map((n) => `bird-blue-${n}`), size: 36, speed: 0.22, flap: 70 },
  yellow: { frames: [1, 2, 3, 4].map((n) => `bird-yellow-${n}`), size: 32, speed: 0.25, flap: 60 },
  seagull: { frames: [1, 2, 3, 4].map((n) => `seagull-${n}`), size: 58, speed: 0.17, flap: 120 },
};
/** butterfly wing cycle: open → half → closed → half */
const BUTTERFLY_CYCLE_CH19 = [1, 2, 3, 2];

/** Deterministic 0..1 hash. */
const hashCh19 = (n: number): number => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export function preloadIslandCrittersCh19(scene: Phaser.Scene): void {
  for (const name of CRITTER_KEYS_CH19) {
    if (!scene.textures.exists(critterKeyCh19(name))) scene.load.image(critterKeyCh19(name), publicAssetUrl(`assets/scenery/ch19/${name}.png`));
  }
}

const sized = (scene: Phaser.Scene, image: Phaser.GameObjects.Image, longest: number): number => {
  const src = scene.textures.get(image.texture.key).getSourceImage() as HTMLImageElement;
  const scale = longest / Math.max(src.width, src.height);
  image.setScale(scale);
  return scale;
};

export function installIslandCrittersCh19(
  scene: Phaser.Scene,
  props: readonly IslandPropCh19[],
  bushDepth: (prop: IslandPropCh19) => number,
  _bounds: IslandBoundsCh19,
): void {
  if (!CRITTER_KEYS_CH19.every((k) => scene.textures.exists(critterKeyCh19(k)))) return;

  const bushes = props.filter((p) => p.kind === 'bush');
  // about half the bushes are "lived in"; each has its own rhythm
  bushes.forEach((bush, i) => {
    if (hashCh19(bush.seed * 997 + i) > 0.55) return;
    let n = 0;
    const next = () => 9000 + hashCh19(bush.seed * 131 + n * 7.7) * 16000;
    const visit = () => {
      n++;
      const roll = hashCh19(bush.seed * 53 + n * 3.1);
      if (roll < 0.4) rabbitPeek(scene, bush, bushDepth(bush), n);
      else if (roll < 0.62) rabbitHop(scene, bush, bushDepth(bush), n);
      else butterfly(scene, bush, bushDepth(bush), n);
      scene.time.delayedCall(next(), visit);
    };
    scene.time.delayedCall(2500 + hashCh19(bush.seed * 17 + i) * 14000, visit);
  });

  // birds across the current view
  let flight = 0;
  const kinds: BirdKind[] = ['blue', 'yellow', 'seagull'];
  const fly = () => {
    flight++;
    const kind = kinds[Math.floor(hashCh19(flight * 4.3) * kinds.length) % kinds.length];
    // mostly a lone bird or a pair, now and then a bigger flock of 3-5
    const c = hashCh19(flight * 9.1);
    const count = c < 0.5 ? 1 : c < 0.78 ? 2 : 3 + Math.floor(hashCh19(flight * 5.7) * 3);
    flock(scene, kind, count, flight);
    // uneven sky: usually long quiet gaps (15-65 s), sometimes a busy spell
    // where another flock follows within a few seconds
    const g = hashCh19(flight * 2.7);
    const busy = hashCh19(flight * 7.3) < 0.18;
    scene.time.delayedCall(busy ? 3000 + g * 4000 : 15000 + g * g * 50000, fly);
  };
  scene.time.delayedCall(9000 + hashCh19(3.3) * 9000, fly);
}

/* ------------------------------------------------------------------ bush critters */

function bushAnchor(bush: IslandPropCh19, n: number) {
  const side = hashCh19(bush.seed * 29 + n) - 0.5;
  return { x: bush.x + side * bush.w * 0.45, y: bush.y - bush.h * 0.12 };
}

function rabbitPeek(scene: Phaser.Scene, bush: IslandPropCh19, depth: number, n: number): void {
  const a = bushAnchor(bush, n);
  const rabbit = scene.add.image(a.x, a.y, critterKeyCh19('rabbit-peek')).setOrigin(0.5, 1)
    .setDepth(depth - 0.005).setFlipX(hashCh19(n + bush.seed) < 0.5).setName('island-rabbit-ch19');
  const s = sized(scene, rabbit, Math.max(30, bush.h * 0.55));
  const rise = rabbit.displayHeight * 0.72;
  rabbit.setY(a.y + rise);
  scene.tweens.chain({
    targets: rabbit,
    tweens: [
      { y: a.y, duration: 260, ease: 'Back.easeOut' },
      // look around: a little tilt left and right
      { angle: -7, duration: 180, ease: 'Sine.easeInOut', yoyo: true, hold: 260 },
      {
        angle: 7, duration: 180, ease: 'Sine.easeInOut', yoyo: true, hold: 220,
        // a happy blink / ear flop while looking around
        onStart: () => { rabbit.setTexture(critterKeyCh19('rabbit-peek-blink')); scene.time.delayedCall(260, () => rabbit.active && rabbit.setTexture(critterKeyCh19('rabbit-peek'))); },
      },
      { scaleY: s * 0.92, duration: 90, yoyo: true },
      { y: a.y + rise, duration: 200, ease: 'Quad.easeIn', delay: 600 },
    ],
    onComplete: () => rabbit.destroy(),
  });
}

function rabbitHop(scene: Phaser.Scene, bush: IslandPropCh19, depth: number, n: number): void {
  const dir = hashCh19(bush.seed * 7 + n) < 0.5 ? -1 : 1;
  const start = { x: bush.x + dir * bush.w * 0.15, y: bush.y - 2 };
  const out = { x: bush.x + dir * (bush.w * 0.5 + 26), y: bush.y + 6 };
  const rabbit = scene.add.image(start.x, start.y, critterKeyCh19('rabbit-sit')).setOrigin(0.5, 1)
    .setDepth(depth - 0.005).setFlipX(dir < 0).setName('island-rabbit-ch19');
  const s = sized(scene, rabbit, Math.max(26, bush.h * 0.42));
  const hop = (to: { x: number; y: number }, onDone: () => void) => {
    scene.tweens.add({ targets: rabbit, x: to.x, duration: 300, ease: 'Linear' });
    rabbit.setTexture(critterKeyCh19('rabbit-hop'));
    scene.tweens.add({
      targets: rabbit, y: to.y - 16, duration: 150, ease: 'Quad.easeOut', yoyo: true,
      onComplete: () => {
        rabbit.setY(to.y).setTexture(critterKeyCh19('rabbit-sit'));
        scene.tweens.add({ targets: rabbit, scaleY: s * 0.88, scaleX: s * 1.06, duration: 70, yoyo: true, onComplete: onDone });
      },
    });
  };
  const mid = { x: (start.x + out.x) / 2, y: (start.y + out.y) / 2 };
  hop(mid, () => {
    // in front of the bush once clear of it
    rabbit.setDepth(depth + 0.005);
    hop(out, () => {
      scene.time.delayedCall(1600 + hashCh19(n * 5 + bush.seed) * 1600, () => {
        if (!rabbit.active) return;
        rabbit.setFlipX(dir > 0);
        hop(mid, () => {
          rabbit.setDepth(depth - 0.005);
          hop(start, () => scene.tweens.add({ targets: rabbit, alpha: 0, duration: 160, onComplete: () => rabbit.destroy() }));
        });
      });
    });
  });
}

function butterfly(scene: Phaser.Scene, bush: IslandPropCh19, depth: number, n: number): void {
  const colour = hashCh19(bush.seed * 11 + n) < 0.5 ? 'orange' : 'blue';
  const a = bushAnchor(bush, n);
  const fly = scene.add.image(a.x, a.y - bush.h * 0.3, critterKeyCh19(`butterfly-${colour}-1`))
    .setDepth(depth + 0.5).setAlpha(0).setName('island-butterfly-ch19');
  sized(scene, fly, 22);
  let flap = 0;
  const flapper = scene.time.addEvent({
    delay: 55, loop: true,
    callback: () => {
      flap++;
      if (fly.active) fly.setTexture(critterKeyCh19(`butterfly-${colour}-${BUTTERFLY_CYCLE_CH19[flap % BUTTERFLY_CYCLE_CH19.length]}`));
    },
  });
  // wander in a few loose loops above the bush, then settle back into it
  const t0 = scene.time.now;
  const life = 5200 + hashCh19(n * 3 + bush.seed) * 2600;
  const rx = 40 + bush.w * 0.4, ry = 26 + bush.h * 0.3;
  const phase = hashCh19(bush.seed * 41 + n) * Math.PI * 2;
  const cx = a.x, cy = a.y - bush.h * 0.55;
  const tick = () => {
    if (!fly.active) return;
    const t = (scene.time.now - t0) / life;
    if (t >= 1) {
      flapper.remove();
      scene.tweens.add({ targets: fly, x: a.x, y: a.y, alpha: 0, scale: fly.scale * 0.6, duration: 400, onComplete: () => fly.destroy() });
      scene.events.off(Phaser.Scenes.Events.UPDATE, tick);
      return;
    }
    const ang = phase + t * Math.PI * 3.2;
    const x = cx + Math.cos(ang) * rx + Math.sin(ang * 2.7) * 10;
    const y = cy + Math.sin(ang * 1.3) * ry - Math.abs(Math.sin(ang * 5)) * 8;
    // top-down art: lean the body toward the heading instead of mirroring it
    const heading = Math.atan2(y - fly.y, x - fly.x);
    fly.setRotation(Phaser.Math.Angle.RotateTo(fly.rotation, heading + Math.PI / 2, 0.12)).setPosition(x, y).setAlpha(Math.min(1, t * 10));
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
}

/* ------------------------------------------------------------------ birds */

function flock(scene: Phaser.Scene, kind: BirdKind, count: number, flight: number): void {
  const spec = BIRDS_CH19[kind];
  const view = scene.cameras.main.worldView;
  if (view.width <= 0) return;
  const leftToRight = hashCh19(flight * 6.1) < 0.5;
  const margin = 90;
  const y0 = view.y + view.height * (0.12 + hashCh19(flight * 8.3) * 0.5);
  const drift = (hashCh19(flight * 1.9) - 0.5) * view.height * 0.35;
  const sx = leftToRight ? view.x - margin : view.right + margin;
  const ex = leftToRight ? view.right + margin * 3 : view.x - margin * 3;
  const duration = Math.abs(ex - sx) / spec.speed;

  for (let i = 0; i < count; i++) {
    const off = { x: -i * (leftToRight ? 1 : -1) * (spec.size * 1.3), y: (i % 2 ? 1 : -1) * i * spec.size * 0.45 };
    const bird = scene.add.image(sx + off.x, y0 + off.y, critterKeyCh19(spec.frames[0]))
      .setDepth(BIRD_DEPTH_CH19).setFlipX(!leftToRight).setName(`island-bird-ch19-${kind}`);
    sized(scene, bird, spec.size * (0.9 + hashCh19(flight + i * 3) * 0.2));
    // soft ground shadow far below the bird
    const shadow = scene.add.ellipse(bird.x, bird.y + 120, spec.size * 0.7, spec.size * 0.18, 0x13304a, 0.14).setDepth(BIRD_DEPTH_CH19 - 1);
    let f = i;
    const flap = scene.time.addEvent({
      delay: spec.flap, loop: true,
      callback: () => {
        f++;
        // seagulls glide: flap a cycle or two, then hold the wings level
        const glide = kind === 'seagull' && f % 14 > 7;
        if (bird.active) bird.setTexture(critterKeyCh19(glide ? spec.frames[1] : spec.frames[f % spec.frames.length]));
      },
    });
    const by = bird.y;
    scene.tweens.add({
      targets: bird, x: ex + off.x, duration, ease: 'Linear',
      onUpdate: (tw) => {
        bird.setY(by + drift * tw.progress + Math.sin(tw.progress * Math.PI * 6 + i) * 6);
        shadow.setPosition(bird.x + 20, bird.y + 120);
      },
      onComplete: () => { flap.remove(); bird.destroy(); shadow.destroy(); },
    });
  }
  // the call comes once the flock is on screen
  scene.time.delayedCall(700, () => chirpCh19(kind, flight));
}

/* ------------------------------------------------------------------ chirps (synthesised) */

let chirpContextCh19: AudioContext | undefined;

function chirpCh19(kind: BirdKind, flight: number): void {
  if (typeof window === 'undefined' || sfxController.getState().muted) return;
  if (typeof document !== 'undefined' && document.hidden) return;
  const Ctor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  chirpContextCh19 ??= new Ctor();
  const ctx = chirpContextCh19;
  if (ctx.state !== 'running') { void ctx.resume().catch(() => undefined); return; }

  const out = ctx.createGain();
  out.gain.value = kind === 'seagull' ? 0.022 : 0.018;
  out.connect(ctx.destination);
  const now = ctx.currentTime + 0.02;

  const note = (at: number, f0: number, f1: number, len: number, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, at);
    osc.frequency.exponentialRampToValueAtTime(f1, at + len);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(1, at + len * 0.18);
    env.gain.exponentialRampToValueAtTime(0.001, at + len);
    osc.connect(env).connect(out);
    osc.start(at);
    osc.stop(at + len + 0.02);
  };

  const v = hashCh19(flight * 3.3);
  if (kind === 'blue') {
    // "tsi-tsiu": two quick rising-falling tweets
    note(now, 3400 + v * 400, 4600, 0.07);
    note(now + 0.11, 4200, 3000 + v * 300, 0.09);
    if (v > 0.5) note(now + 0.32, 3600, 4800, 0.06);
  } else if (kind === 'yellow') {
    // canary trill: a rapid run of tiny notes
    const steps = 6 + Math.floor(v * 4);
    for (let i = 0; i < steps; i++) note(now + i * 0.045, 4800 - i * 60, 5600 - i * 80, 0.035);
  } else {
    // seagull "kyow": lower, a little raspy, falling
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 1.2;
    filter.connect(out);
    for (let i = 0; i < 2; i++) {
      const at = now + i * 0.32;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1350 + v * 120, at);
      osc.frequency.linearRampToValueAtTime(1650, at + 0.06);
      osc.frequency.exponentialRampToValueAtTime(850, at + 0.26);
      env.gain.setValueAtTime(0, at);
      env.gain.linearRampToValueAtTime(0.9, at + 0.04);
      env.gain.exponentialRampToValueAtTime(0.001, at + 0.28);
      osc.connect(env).connect(filter);
      osc.start(at);
      osc.stop(at + 0.3);
    }
  }
}
