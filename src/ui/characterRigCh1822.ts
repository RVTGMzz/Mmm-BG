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
  const coat = part('coat-back', 0, 55, 0.5, 0);
  const bag = part('satchel', 51, 95, 0.5, 0);
  root.add([coat, bag]);

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
  return {
    root,
    pose(timeMs, moving, dx) {
      if (Math.abs(dx) > 0.2) facingLeft = dx < 0;
      root.setScale(facingLeft ? -SCALE : SCALE, SCALE);
      const p = timeMs * (Math.PI * 2 / (moving ? 620 : 2200));
      const stride = Math.sin(p);
      const soft = (Math.sin(p - Math.PI / 2) + 1) / 2;
      const movement = moving ? 1 : 0;

      // No full-body squash animation: true independent limb/joint movement.
      torso.y = 100 - (moving ? Math.abs(stride) * 1.8 : soft * 0.9);
      torso.setScale(1 + (moving ? 0 : soft * 0.002), 1 + (moving ? 0 : soft * 0.012));
      head.y = 81 - (moving ? Math.abs(stride) * 0.8 : soft * 0.7);
      head.angle = moving ? -1.2 * stride : -0.8 + 1.6 * soft;

      legLeft.hip.angle = movement * 14 * stride;
      legRight.hip.angle = -movement * 14 * stride;
      legLeft.knee.angle = movement * (-8 + 9 * Math.max(0, -stride));
      legRight.knee.angle = movement * (-8 + 9 * Math.max(0, stride));

      armLeft.shoulder.angle = moving ? -11 * stride : -1.3 + soft * 2.5;
      armRight.shoulder.angle = moving ? 11 * stride : 1.3 - soft * 2.5;
      armLeft.elbow.angle = moving ? 7 + 4 * Math.max(0, stride) : 5 + soft;
      armRight.elbow.angle = moving ? -7 - 4 * Math.max(0, -stride) : -5 - soft;

      coat.angle = moving ? 1.2 * stride : 0.6 * soft;
      bag.angle = moving ? -3.2 * stride : 0.7 * soft;
      bag.y = 95 + (moving ? 1.4 * Math.abs(stride) : 0);
    },
  };
}
