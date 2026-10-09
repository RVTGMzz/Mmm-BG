import Phaser from 'phaser';
import { CAU_CO_RIG_PILOT_CH1822 } from '../content/core/character_rig_manifest_ch1822';
import { publicAssetUrl } from './publicAssetUrl';

const PREFIX = 'cau-co-rig-ch1822-';
const SOURCE = CAU_CO_RIG_PILOT_CH1822.baseResolution;
const SCALE = CAU_CO_RIG_PILOT_CH1822.displaySize / SOURCE;

export interface CauCoRigCh1822 {
  root: Phaser.GameObjects.Container;
  pose: (timeMs: number, moving: boolean, dx: number) => void;
}

/** Only preload the pilot when explicitly requested. No production strip is overwritten. */
export function preloadCauCoRigCh1822(scene: Phaser.Scene): void {
  for (const name of CAU_CO_RIG_PILOT_CH1822.partIds) {
    const key = PREFIX + name;
    if (!scene.textures.exists(key)) {
      scene.load.image(key, publicAssetUrl(CAU_CO_RIG_PILOT_CH1822.partsPath + name + '.svg'));
    }
  }
}

export function cauCoRigPartsReadyCh1822(scene: Phaser.Scene): boolean {
  return CAU_CO_RIG_PILOT_CH1822.partIds.every(name => scene.textures.exists(PREFIX + name));
}

/**
 * All layers are separate Phaser images, with nested elbow/knee pivots.
 * Source skeleton coordinates use a 192px viewport and the existing 104px token fit.
 * These pilot vectors are NOT a final art sign-off for the canon's costume details.
 */
export function createCauCoRigCh1822(
  scene: Phaser.Scene,
  playerId: number,
  baseY = 8,
): CauCoRigCh1822 {
  const root = scene.add.container(0, baseY - 0.84 * 104)
    .setScale(SCALE)
    .setName('character-rig-cau-co-ch1822-p' + (playerId + 1));

  const part = (name: string, x: number, y: number, originX = 0.5, originY = 0.5) =>
    scene.add.image(x, y, PREFIX + name)
      .setOrigin(originX, originY)
      .setName('character-rig-part-ch1822-' + name + '-p' + (playerId + 1));

  // Every top-level bone lives in source coordinates relative to source X = 96.
  const geometry = CAU_CO_RIG_PILOT_CH1822.geometryLock;
  const coat = part('coat-back', geometry.coat.x, geometry.coat.y, 0.5, 0)
    .setScale(geometry.coat.scaleX, geometry.coat.scaleY);
  const bag = part('satchel', geometry.satchel.x, geometry.satchel.y, 0.5, 0)
    .setScale(geometry.satchel.scaleX, geometry.satchel.scaleY);
  // Jacket is a BACK layer. A briefcase resting by the left hip is a
  // foreground layer; painting both behind the legs made the prop float
  // through the torso and exaggerated the silhouette.
  root.add(coat);

  function leg(side: 'left' | 'right', x: number) {
    const hip = scene.add.container(x - 96, 110)
      .setName('character-rig-hip-ch1822-' + side + '-p' + (playerId + 1));
    const upper = part('leg-upper-' + side, 0, 0, 0.5, 0.1);
    const knee = scene.add.container(0, 30)
      .setName('character-rig-knee-ch1822-' + side + '-p' + (playerId + 1));
    knee.add([
      part('leg-lower-' + side, 0, 0, 0.5, 0.1),
      part('shoe-' + side, 3, 28, 0.5, 0.12),
    ]);
    hip.add([upper, knee]);
    root.add(hip);
    return { hip, knee };
  }
  const legLeft = leg('left', 80);
  const legRight = leg('right', 112);

  function arm(side: 'left' | 'right', x: number) {
    const shoulder = scene.add.container(x - 96, 77)
      .setName('character-rig-shoulder-ch1822-' + side + '-p' + (playerId + 1));
    const upper = part('arm-upper-' + side, 0, 0, 0.5, 0.14);
    const elbow = scene.add.container(0, 35)
      .setName('character-rig-elbow-ch1822-' + side + '-p' + (playerId + 1));
    elbow.add([
      part('arm-lower-' + side, 0, 0, 0.5, 0.12),
      part('hand-' + side, 1, 28, 0.5, 0.13),
    ]);
    shoulder.add([upper, elbow]);
    root.add(shoulder);
    return { shoulder, elbow };
  }

  const armLeft = arm('left', 62);
  const torso = scene.add.container(0, 100)
    .setName('character-rig-torso-ch1822-p' + (playerId + 1));
  torso.add(part('torso', 0, 0, 0.5, 0.52));
  root.add(torso);
  root.add(bag);
  const armRight = arm('right', 129);

  const head = scene.add.container(0, 81)
    .setName('character-rig-head-ch1822-p' + (playerId + 1));
  head.add([
    part('head', 0, 0, 0.5, 0.85),
    part('hair-front', 0, -72, 0.5, 0),
    part('glasses', 0, -28, 0.5, 0),
  ]);
  root.add(head);

  let facingLeft = false;
  let walkBlend = 0;
  let lastPoseMs = 0;
  return {
    root,
    pose(timeMs, moving, dx) {
      if (Math.abs(dx) > 0.2) facingLeft = dx < 0;
      root.setScale(facingLeft ? -SCALE : SCALE, SCALE);

      // Give movement a short blend to avoid snapping from CAU CÓ's folded arms
      // into a full walk swing on the first frame (or freezing mid-stride).
      const deltaMs = Math.min(50, Math.max(0, lastPoseMs ? timeMs - lastPoseMs : 16));
      lastPoseMs = timeMs;
      const approach = 1 - Math.exp(-deltaMs / 145);
      walkBlend += ((moving ? 1 : 0) - walkBlend) * approach;
      const walkPhase = timeMs * (Math.PI * 2 / 620);
      const stride = Math.sin(walkPhase);
      const idlePhase = timeMs * (Math.PI * 2 / 2200);
      const breath = (1 + Math.sin(idlePhase - Math.PI / 2)) / 2;
      const walking = walkBlend;
      const resting = 1 - walking;
      const footLiftL = Math.max(0, -stride) * walking;
      const footLiftR = Math.max(0, stride) * walking;

      // Root stays floor-anchored. Idle breathing comes from the chest/shoulders,
      // not global scale; eye line and feet therefore do not bounce together.
      torso.y = 100 - walking * Math.abs(stride) * 1.6 - resting * breath * 0.8;
      torso.setScale(1 + resting * breath * 0.003, 1 + resting * breath * 0.012);
      head.y = 81 - walking * Math.abs(stride) * 1.0 - resting * breath * 0.65;
      head.angle = walking * (-1.2 * stride) + resting * (-1.5 + breath * 1.2);

      legLeft.hip.angle = 14 * stride * walking;
      legRight.hip.angle = -14 * stride * walking;
      legLeft.knee.angle = (-5 + 14 * footLiftL) * walking;
      legRight.knee.angle = (-5 + 14 * footLiftR) * walking;
      legLeft.knee.y = 30 - footLiftL * 1.8;
      legRight.knee.y = 30 - footLiftR * 1.8;

      // Stern idle pose: arms held across the torso. While walking they unfold
      // and counter-swing to the legs; both elbows remain independently animated.
      armLeft.shoulder.angle = -61 * resting - 11 * stride * walking;
      armRight.shoulder.angle = 61 * resting + 11 * stride * walking;
      armLeft.elbow.angle = 22 * resting + (7 + 5 * footLiftL) * walking;
      armRight.elbow.angle = -22 * resting - (7 + 5 * footLiftR) * walking;
      armLeft.shoulder.y = 77 - resting * breath * 0.55;
      armRight.shoulder.y = 77 - resting * breath * 0.55;

      // Heavy jacket and leather briefcase lag behind the torso, rather than
      // becoming glued to a full-frame sprite.
      coat.angle = 0.9 * stride * walking + 0.25 * breath * resting;
      bag.angle = -2.0 * stride * walking + 0.35 * breath * resting;
      bag.y = geometry.satchel.y + walking * 0.8 * Math.abs(stride);
    },
  };
}
