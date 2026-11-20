import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { publicAssetUrl } from './publicAssetUrl';

/**
 * CH-19 "you're nicked / you're hurt" cutscene (presentation only).
 *
 * When a player is sent to the Jail or the Hospital, a police car or an
 * ambulance drives in with flashing lights and a siren, opens its door, the
 * Character hops in, the vehicle drives to the hold tile, drops the Character
 * off and drives away. Gameplay already moved the player; this layer only
 * hides the token for the ride and shows it again on arrival.
 */

export type RescueKindCh19 = 'jail' | 'hospital';

const VEHICLE_CH19 = {
  jail: {
    closed: 'police-car', open: 'police-car-open',
    // roof lamps as fractions of the sprite (measured from the art)
    lamps: [{ x: 0.419, y: 0.092, color: 0x3b7bff }, { x: 0.548, y: 0.069, color: 0xff3b3b }],
    door: { x: 0.33, y: 0.62 },
  },
  hospital: {
    closed: 'ambulance', open: 'ambulance-open',
    lamps: [{ x: 0.535, y: 0.066, color: 0xff3b3b }, { x: 0.67, y: 0.066, color: 0xff3b3b }],
    door: { x: 0.1, y: 0.6 },
  },
} as const;
const VEHICLE_WIDTH_CH19 = 176;
const VEHICLE_DEPTH_CH19 = 30;
const keyCh19 = (name: string): string => `rescue-vehicle-ch19-${name}`;

export function preloadRescueVehiclesCh19(scene: Phaser.Scene): void {
  for (const v of Object.values(VEHICLE_CH19)) {
    for (const name of [v.closed, v.open]) {
      if (!scene.textures.exists(keyCh19(name))) scene.load.image(keyCh19(name), publicAssetUrl(`assets/scenery/ch19/${name}.png`));
    }
  }
}

export interface RescueRideCh19 {
  kind: RescueKindCh19;
  from: { x: number; y: number };
  to: { x: number; y: number };
  token: Phaser.GameObjects.Container;
  /** the Character art shown hopping in/out (texture + frame of the token's sprite) */
  rider?: { texture: string; frame: string | number; scale: number };
  followCamera: boolean;
  /** called once the Character is dropped at the hold tile (token shown there) */
  onArrive?: () => void;
}

export class RescueVehiclesCh19 {
  private readonly hidden = new Set<Phaser.GameObjects.Container>();
  private active = 0;
  /** vehicle the camera should track while a ride is on screen */
  private cameraTarget?: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene) {}

  get busy(): boolean { return this.active > 0; }

  canPlay(kind: RescueKindCh19): boolean {
    return this.scene.textures.exists(keyCh19(VEHICLE_CH19[kind].closed));
  }

  /** Call every frame: keeps riders' tokens hidden even if older code tweens their alpha. */
  update(): void {
    for (const token of this.hidden) if (token.active && token.alpha > 0) token.setAlpha(0);
    // Older camera code re-centres on the active token every frame; while a ride
    // is on screen, gently track the vehicle instead.
    const car = this.cameraTarget;
    if (car?.active) {
      const cam = this.scene.cameras.main;
      cam.stopFollow();
      const tx = car.x - cam.width / 2, ty = car.y - 50 - cam.height / 2;
      cam.setScroll(cam.scrollX + (tx - cam.scrollX) * 0.12, cam.scrollY + (ty - cam.scrollY) * 0.12);
    }
  }

  play(ride: RescueRideCh19): void {
    const scene = this.scene;
    const spec = VEHICLE_CH19[ride.kind];
    if (!scene.textures.exists(keyCh19(spec.closed))) { ride.onArrive?.(); return; }
    this.active++;

    const tex = scene.textures.get(keyCh19(spec.closed)).getSourceImage() as HTMLImageElement;
    const scale = VEHICLE_WIDTH_CH19 / tex.width;
    const w = VEHICLE_WIDTH_CH19, h = tex.height * scale;

    // arrive from the far side of the pickup, park beside it, then drive to the hold tile
    const away = new Phaser.Math.Vector2(ride.from.x - ride.to.x, ride.from.y - ride.to.y);
    if (away.length() < 1) away.set(-1, 0);
    away.normalize();
    const park = { x: ride.from.x + 70, y: ride.from.y + 10 };
    const start = { x: park.x + away.x * 560, y: park.y + away.y * 300 };
    const drop = { x: ride.to.x + 70, y: ride.to.y + 10 };

    const car = scene.add.container(start.x, start.y).setDepth(VEHICLE_DEPTH_CH19).setName(`rescue-vehicle-ch19-${ride.kind}`);
    const shadow = scene.add.ellipse(0, -4, w * 0.9, h * 0.18, 0x14243f, 0.28);
    const body = scene.add.image(0, 0, keyCh19(spec.closed)).setOrigin(0.5, 1).setScale(scale);
    car.add([shadow, body]);
    const lamps = spec.lamps.map((l, i) => {
      const glow = scene.add.circle((l.x - 0.5) * w, -h * (1 - l.y), w * 0.075, l.color, 0)
        .setBlendMode(Phaser.BlendModes.ADD);
      car.add(glow);
      return { glow, i };
    });
    const face = (dx: number) => {
      const left = dx < 0;
      body.setFlipX(left);
      for (const { glow, i } of lamps) glow.setX((left ? 0.5 - spec.lamps[i].x : spec.lamps[i].x - 0.5) * w);
    };
    const doorAt = () => ({
      x: car.x + (body.flipX ? 0.5 - spec.door.x : spec.door.x - 0.5) * w,
      y: car.y - h * (1 - spec.door.y),
    });

    // flashing lights + siren for the whole ride
    let tick = 0;
    const flash = scene.time.addEvent({
      delay: 170, loop: true,
      callback: () => {
        tick++;
        for (const { glow, i } of lamps) glow.setAlpha((tick + i) % 2 === 0 ? 0.85 : 0.05).setScale((tick + i) % 2 === 0 ? 1.35 : 0.9);
      },
    });
    const siren = startSirenCh19(ride.kind);
    const bob = scene.tweens.add({ targets: body, y: -2.5, duration: 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const camera = scene.cameras.main;
    if (ride.followCamera) this.cameraTarget = car;

    const drive = (to: { x: number; y: number }, duration: number, ease: string, next: () => void) => {
      face(to.x - car.x);
      scene.tweens.add({ targets: car, x: to.x, y: to.y, duration, ease, onComplete: next });
    };
    const rider = (x: number, y: number) => {
      if (!ride.rider || !scene.textures.exists(ride.rider.texture)) return undefined;
      return scene.add.image(x, y, ride.rider.texture, ride.rider.frame)
        .setOrigin(0.5, 0.84).setScale(ride.rider.scale).setDepth(VEHICLE_DEPTH_CH19 + 0.5);
    };

    // 1) drive in
    drive(park, 1100, 'Sine.easeOut', () => {
      // 2) door opens, Character hops in
      body.setTexture(keyCh19(spec.open));
      this.hidden.add(ride.token);
      ride.token.setAlpha(0);
      const hop = rider(ride.from.x, ride.from.y);
      const door = doorAt();
      if (hop) {
        scene.tweens.add({
          targets: hop, x: door.x, y: door.y + 18, scale: hop.scale * 0.55, duration: 420, ease: 'Back.easeIn',
          onUpdate: (tw) => hop.setY(hop.y - Math.sin(tw.progress * Math.PI) * 4),
          onComplete: () => hop.destroy(),
        });
      }
      scene.time.delayedCall(560, () => {
        body.setTexture(keyCh19(spec.closed));
        // 3) ride to the hold tile
        drive(drop, 1500, 'Sine.easeInOut', () => {
          // 4) drop off
          body.setTexture(keyCh19(spec.open));
          const out = doorAt();
          const hopOut = rider(out.x, out.y + 18);
          const finishDrop = () => {
            this.hidden.delete(ride.token);
            ride.onArrive?.();
            if (ride.token.active) {
              ride.token.setAlpha(1);
              scene.tweens.add({ targets: ride.token, scale: { from: ride.token.scale * 0.8, to: ride.token.scale }, duration: 220, ease: 'Back.easeOut' });
            }
            if (ride.followCamera) {
              this.cameraTarget = undefined;
              camera.startFollow(ride.token, true, 0.12, 0.12);
            }
          };
          if (hopOut) {
            hopOut.setScale(hopOut.scale * 0.55);
            scene.tweens.add({
              targets: hopOut, x: ride.to.x, y: ride.to.y, scale: ride.rider!.scale, duration: 420, ease: 'Back.easeOut',
              onComplete: () => { hopOut.destroy(); finishDrop(); },
            });
          } else finishDrop();
          scene.time.delayedCall(600, () => {
            body.setTexture(keyCh19(spec.closed));
            // 5) drive away and fade
            const leave = { x: car.x + (body.flipX ? -1 : 1) * 520, y: car.y };
            scene.tweens.add({ targets: car, alpha: 0, delay: 500, duration: 500 });
            drive(leave, 1000, 'Sine.easeIn', () => {
              flash.remove();
              bob.stop();
              siren.stop();
              car.destroy(true);
              this.active--;
            });
          });
        });
      });
    });
  }
}

/* ------------------------------------------------------------------ siren (synthesised) */

let sirenContextCh19: AudioContext | undefined;

function startSirenCh19(kind: RescueKindCh19): { stop(): void } {
  const silent = { stop: () => undefined };
  if (typeof window === 'undefined' || sfxController.getState().muted) return silent;
  const Ctor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return silent;
  sirenContextCh19 ??= new Ctor();
  const ctx = sirenContextCh19;
  void ctx.resume().catch(() => undefined);

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2200;
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.25);
  filter.connect(gain).connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = kind === 'jail' ? 'square' : 'sine';
  osc.connect(filter);

  const now = ctx.currentTime;
  const length = 6;
  if (kind === 'jail') {
    // "ò e ò e": two flat tones alternating
    for (let t = 0; t < length; t += 0.76) {
      osc.frequency.setValueAtTime(950, now + t);
      osc.frequency.setValueAtTime(760, now + t + 0.38);
    }
  } else {
    // ambulance wail: rising and falling sweep
    osc.frequency.setValueAtTime(650, now);
    for (let t = 0; t < length; t += 1.2) {
      osc.frequency.linearRampToValueAtTime(1150, now + t + 0.6);
      osc.frequency.linearRampToValueAtTime(650, now + t + 1.2);
    }
  }
  osc.start(now);
  osc.stop(now + length);
  return {
    stop: () => {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.45);
      } catch {
        // already stopped
      }
    },
  };
}
