import Phaser from 'phaser';
import { publicAssetUrl } from './publicAssetUrl';

/**
 * CH-19 dice roll: a painted die (concept style, public/assets/scenery/ch19)
 * drops in tumbling, bounces twice, lands on the server's result face, kicks
 * up a dust puff and flashes a gold star burst. Presentation only: the result
 * always comes from the match event, never from client RNG.
 */

export const DICE_FACE_KEYS_CH19 = [1, 2, 3, 4, 5, 6].map((n) => `dice-${n}`);
export const DICE_TUMBLE_KEYS_CH19 = [1, 2, 3, 4].map((n) => `dice-tumble-${n}`);
const DICE_FX_KEYS_CH19 = ['dice-dust', 'dice-burst'];
const diceKeyCh19 = (name: string): string => `dice-ch19-${name}`;

const DIE_SIZE_CH19 = 172;
const FLOOR_Y_CH19 = 46;

export function preloadDiceCh19(scene: Phaser.Scene): void {
  for (const name of [...DICE_FACE_KEYS_CH19, ...DICE_TUMBLE_KEYS_CH19, ...DICE_FX_KEYS_CH19]) {
    if (!scene.textures.exists(diceKeyCh19(name))) scene.load.image(diceKeyCh19(name), publicAssetUrl(`assets/scenery/ch19/${name}.png`));
  }
}

export function diceSpritesReadyCh19(scene: Phaser.Scene): boolean {
  return [...DICE_FACE_KEYS_CH19, ...DICE_TUMBLE_KEYS_CH19].every((n) => scene.textures.exists(diceKeyCh19(n)));
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

  const shadow = scene.add.ellipse(0, FLOOR_Y_CH19 + 6, DIE_SIZE_CH19 * 0.78, 26, 0x2a1a14, 0.22).setScale(0.35);
  const burst = scene.textures.exists(diceKeyCh19('dice-burst'))
    ? scene.add.image(0, FLOOR_Y_CH19 - DIE_SIZE_CH19 * 0.45, diceKeyCh19('dice-burst')).setAlpha(0)
    : undefined;
  if (burst) fit(scene, burst, DIE_SIZE_CH19 * 1.55);
  const burstScale = burst?.scale ?? 1;
  const dust = scene.textures.exists(diceKeyCh19('dice-dust'))
    ? scene.add.image(0, FLOOR_Y_CH19 + 8, diceKeyCh19('dice-dust')).setOrigin(0.5, 0.75).setAlpha(0)
    : undefined;
  if (dust) fit(scene, dust, DIE_SIZE_CH19 * 1.5);
  const dustScale = dust?.scale ?? 1;

  const die = scene.add.image(0, -300, diceKeyCh19(DICE_TUMBLE_KEYS_CH19[0])).setOrigin(0.5, 1).setName('presentation-dice-sprite-ch19');
  const dieScale = fit(scene, die, DIE_SIZE_CH19);

  const pill = scene.add.graphics().setAlpha(0);
  const text = scene.add.text(0, FLOOR_Y_CH19 + 44, caption, {
    fontFamily: 'Nunito, "Baloo 2", Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    stroke: '#7a3b22', strokeThickness: 5,
  }).setOrigin(0.5).setAlpha(0);
  const pw = text.width + 44;
  pill.fillStyle(0xff8a5b, 1).fillRoundedRect(-pw / 2, FLOOR_Y_CH19 + 24, pw, 40, 20);
  pill.lineStyle(3, 0xffffff, 0.9).strokeRoundedRect(-pw / 2, FLOOR_Y_CH19 + 24, pw, 40, 20);

  container.add([burst, shadow, dust, die, pill, text].filter((o): o is NonNullable<typeof o> => Boolean(o)));

  // while airborne the die rolls through every face 1..6, alternating with
  // the tilted corner-on tumble frames, so it clearly reads as a real roll
  const ROLL_FRAMES = DICE_FACE_KEYS_CH19.flatMap((faceKey, i) => [DICE_TUMBLE_KEYS_CH19[i % DICE_TUMBLE_KEYS_CH19.length], faceKey]);
  let frame = (face * 2) % ROLL_FRAMES.length;
  const spin = scene.time.addEvent({
    delay: 60, loop: true,
    callback: () => {
      frame = (frame + 1) % ROLL_FRAMES.length;
      const key = ROLL_FRAMES[frame];
      const tumbling = key.startsWith('dice-tumble');
      if (die.active) die.setTexture(diceKeyCh19(key)).setAngle(tumbling ? 0 : (frame % 4 < 2 ? -1 : 1) * (18 + frame * 3));
    },
  });

  const squash = (amount: number) => scene.tweens.add({
    targets: die, scaleX: dieScale * (1 + amount), scaleY: dieScale * (1 - amount), duration: 70, yoyo: true, ease: 'Quad.easeOut',
  });
  const puff = (size: number) => {
    if (!dust) return;
    dust.setAlpha(0.95).setScale(dustScale * 0.5 * size);
    scene.tweens.add({ targets: dust, scale: dustScale * size, alpha: 0, duration: 420, ease: 'Quad.easeOut' });
  };

  // fall → bounce → small bounce → settle
  scene.tweens.add({ targets: shadow, scale: 1, duration: 330, ease: 'Quad.easeIn' });
  scene.tweens.chain({
    targets: die,
    tweens: [
      { y: FLOOR_Y_CH19, duration: 330, ease: 'Quad.easeIn', onComplete: () => { squash(0.16); puff(0.8); } },
      { y: FLOOR_Y_CH19 - 70, duration: 170, ease: 'Quad.easeOut' },
      { y: FLOOR_Y_CH19, duration: 170, ease: 'Quad.easeIn', onComplete: () => squash(0.1) },
      { y: FLOOR_Y_CH19 - 22, duration: 100, ease: 'Quad.easeOut' },
      {
        y: FLOOR_Y_CH19, duration: 100, ease: 'Quad.easeIn',
        onComplete: () => {
          spin.remove();
          die.setTexture(diceKeyCh19(DICE_FACE_KEYS_CH19[face - 1])).setAngle(0);
          squash(0.12);
          puff(1.15);
          if (burst) {
            burst.setAlpha(1).setScale(burstScale * 0.4).setAngle(0);
            scene.tweens.add({ targets: burst, scale: burstScale, angle: 25, duration: 380, ease: 'Back.easeOut' });
            scene.tweens.add({ targets: burst, alpha: 0, delay: 520, duration: 420 });
          }
          scene.tweens.add({ targets: [pill, text], alpha: 1, duration: 160 });
          scene.tweens.add({ targets: text, scale: { from: 0.7, to: 1 }, duration: 220, ease: 'Back.easeOut' });
          onLand();
        },
      },
    ],
  });
}
