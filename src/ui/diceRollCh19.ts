import Phaser from 'phaser';
import { publicAssetUrl } from './publicAssetUrl';

/**
 * CH-19 dice roll: a painted die (concept style, public/assets/scenery/ch19)
 * drops in low on the screen, rolls through all six faces, bounces and comes
 * to rest with the server's result on its TOP face (like a real die on a
 * table); then it lifts to the middle of the screen, grows and flashes a gold
 * star burst so everyone can read it. Presentation only: the result always
 * comes from the match event, never from client RNG.
 */

export const DICE_FACE_KEYS_CH19 = [1, 2, 3, 4, 5, 6].map((n) => `dice-${n}`);
export const DICE_TUMBLE_KEYS_CH19 = [1, 2, 3, 4].map((n) => `dice-tumble-${n}`);
/** resting die seen from above: the result is the top face */
export const DICE_TOP_KEYS_CH19 = [1, 2, 3, 4, 5, 6].map((n) => `dice-top-${n}`);
const DICE_FX_KEYS_CH19 = ['dice-dust', 'dice-burst'];
const diceKeyCh19 = (name: string): string => `dice-ch19-${name}`;

/** rolling size, and the size it is shown at in the middle of the screen */
const DIE_SIZE_CH19 = 128;
const SHOW_SIZE_CH19 = 196;
/** the table line, low on the screen (relative to the container near screen centre) */
const FLOOR_Y_CH19 = 205;

export function preloadDiceCh19(scene: Phaser.Scene): void {
  for (const name of [...DICE_FACE_KEYS_CH19, ...DICE_TOP_KEYS_CH19, ...DICE_TUMBLE_KEYS_CH19, ...DICE_FX_KEYS_CH19]) {
    if (!scene.textures.exists(diceKeyCh19(name))) scene.load.image(diceKeyCh19(name), publicAssetUrl(`assets/scenery/ch19/${name}.png`));
  }
}

export function diceSpritesReadyCh19(scene: Phaser.Scene): boolean {
  return [...DICE_FACE_KEYS_CH19, ...DICE_TOP_KEYS_CH19, ...DICE_TUMBLE_KEYS_CH19].every((n) => scene.textures.exists(diceKeyCh19(n)));
}

const fit = (scene: Phaser.Scene, image: Phaser.GameObjects.Image, size: number): number => {
  const src = scene.textures.get(image.texture.key).getSourceImage() as HTMLImageElement;
  const scale = size / Math.max(src.width, src.height);
  image.setScale(scale);
  return scale;
};

/**
 * Builds the tumbling die inside `container` (already positioned and named by
 * the presentation layer). `onLand` fires once, on the final impact.
 */
export function playDiceRollCh19(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  result: number,
  caption: string,
  onLand: () => void,
): void {
  const face = Math.max(1, Math.min(6, Math.round(result)));
  const startX = -150;

  const shadow = scene.add.ellipse(startX, FLOOR_Y_CH19 + 4, DIE_SIZE_CH19 * 0.8, 24, 0x2a1a14, 0.24).setScale(0.35);
  const burst = scene.textures.exists(diceKeyCh19('dice-burst'))
    ? scene.add.image(0, -20, diceKeyCh19('dice-burst')).setAlpha(0)
    : undefined;
  if (burst) fit(scene, burst, SHOW_SIZE_CH19 * 1.5);
  const burstScale = burst?.scale ?? 1;
  const dust = scene.textures.exists(diceKeyCh19('dice-dust'))
    ? scene.add.image(0, FLOOR_Y_CH19 + 8, diceKeyCh19('dice-dust')).setOrigin(0.5, 0.75).setAlpha(0)
    : undefined;
  if (dust) fit(scene, dust, DIE_SIZE_CH19 * 1.4);
  const dustScale = dust?.scale ?? 1;

  // origin at the die's centre so it can spin; y is its centre
  const restY = FLOOR_Y_CH19 - DIE_SIZE_CH19 * 0.5;
  const die = scene.add.image(startX, -260, diceKeyCh19(DICE_TUMBLE_KEYS_CH19[0])).setName('presentation-dice-sprite-ch19');
  fit(scene, die, DIE_SIZE_CH19);

  const pill = scene.add.graphics().setAlpha(0);
  const text = scene.add.text(0, SHOW_SIZE_CH19 * 0.5 + 34, caption, {
    fontFamily: 'Nunito, "Baloo 2", Arial, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    stroke: '#7a3b22', strokeThickness: 5,
  }).setOrigin(0.5).setAlpha(0);
  const pw = text.width + 48, py = text.y - 21;
  pill.fillStyle(0x7a3b22, 0.25).fillRoundedRect(-pw / 2 + 2, py + 4, pw, 42, 21);
  pill.fillStyle(0xff8a5b, 1).fillRoundedRect(-pw / 2, py, pw, 42, 21);
  pill.lineStyle(3, 0xffffff, 0.95).strokeRoundedRect(-pw / 2, py, pw, 42, 21);

  container.add([shadow, dust, burst, die, pill, text].filter((o): o is NonNullable<typeof o> => Boolean(o)));

  // airborne: the die rolls through every face 1..6, alternating with the
  // tilted corner-on tumble frames, and spins as it goes
  const ROLL_FRAMES = DICE_FACE_KEYS_CH19.flatMap((faceKey, i) => [DICE_TUMBLE_KEYS_CH19[i % DICE_TUMBLE_KEYS_CH19.length], faceKey]);
  let frame = (face * 2) % ROLL_FRAMES.length;
  const spin = scene.time.addEvent({
    delay: 60, loop: true,
    callback: () => {
      frame = (frame + 1) % ROLL_FRAMES.length;
      if (die.active) die.setTexture(diceKeyCh19(ROLL_FRAMES[frame])).setAngle(die.angle + 38);
    },
  });

  const squash = (amount: number) => {
    const sx = die.scaleX, sy = die.scaleY;
    scene.tweens.add({ targets: die, scaleX: sx * (1 + amount), scaleY: sy * (1 - amount), duration: 70, yoyo: true, ease: 'Quad.easeOut' });
  };
  const puff = (x: number, size: number) => {
    if (!dust) return;
    dust.setPosition(x, FLOOR_Y_CH19 + 8).setAlpha(0.95).setScale(dustScale * 0.5 * size);
    scene.tweens.add({ targets: dust, scale: dustScale * size, alpha: 0, duration: 420, ease: 'Quad.easeOut' });
  };

  // fall -> bounce -> small bounce, travelling right across the "table"
  const x1 = startX + 90, x2 = startX + 135, x3 = 0;
  scene.tweens.add({ targets: shadow, scale: 1, x: x3, duration: 700, ease: 'Sine.easeOut' });
  scene.tweens.chain({
    targets: die,
    tweens: [
      { x: x1, y: restY, duration: 320, ease: 'Quad.easeIn', onComplete: () => { squash(0.16); puff(x1, 0.8); } },
      { x: (x1 + x2) / 2, y: restY - 80, duration: 170, ease: 'Quad.easeOut' },
      { x: x2, y: restY, duration: 170, ease: 'Quad.easeIn', onComplete: () => squash(0.1) },
      { x: (x2 + x3) / 2, y: restY - 26, duration: 110, ease: 'Quad.easeOut' },
      {
        x: x3, y: restY, duration: 110, ease: 'Quad.easeIn',
        onComplete: () => {
          // it settles: result face up
          spin.remove();
          scene.tweens.killTweensOf(die);
          die.setTexture(diceKeyCh19(DICE_TOP_KEYS_CH19[face - 1])).setAngle(0);
          const restScale = fit(scene, die, DIE_SIZE_CH19);
          squash(0.12);
          puff(x3, 1.15);
          // brief beat on the table, then lift it to the middle of the screen
          scene.time.delayedCall(300, () => {
            if (!die.active) return;
            scene.tweens.killTweensOf(die);
            const showScale = restScale * SHOW_SIZE_CH19 / DIE_SIZE_CH19;
            scene.tweens.add({ targets: shadow, alpha: 0, duration: 200 });
            scene.tweens.add({
              targets: die, y: -20, scaleX: showScale, scaleY: showScale, duration: 320, ease: 'Back.easeOut',
              onComplete: () => {
                if (burst) {
                  burst.setAlpha(1).setScale(burstScale * 0.4).setAngle(0);
                  scene.tweens.add({ targets: burst, scale: burstScale, angle: 25, duration: 380, ease: 'Back.easeOut' });
                  scene.tweens.add({ targets: burst, alpha: 0, delay: 650, duration: 400 });
                }
                scene.tweens.add({ targets: die, y: -28, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                scene.tweens.add({ targets: [pill, text], alpha: 1, duration: 160 });
                scene.tweens.add({ targets: text, scale: { from: 0.7, to: 1 }, duration: 220, ease: 'Back.easeOut' });
                onLand();
              },
            });
          });
        },
      },
    ],
  });
}
