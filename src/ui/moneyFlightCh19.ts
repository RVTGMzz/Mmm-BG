import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { publicAssetUrl } from './publicAssetUrl';
import { partyTextCh19 } from './partyKitCh19';
import { stageRectCh19 } from './responsiveStageCh19';

/**
 * CH-19 money you can see: whenever M$ changes hands, stacks of M$ bills fly
 * out of the payer and into the receiver. Money from / to the bank comes
 * down from / goes up past the top of the screen. Presentation only.
 */

export const MONEY_STACK_KEY_CH19 = 'money-stack-ch19';
const DEPTH_CH19 = 1650; // above the board HUD, under the card / news reveal

export function preloadMoneyFlightCh19(scene: Phaser.Scene): void {
  if (!scene.textures.exists(MONEY_STACK_KEY_CH19)) scene.load.image(MONEY_STACK_KEY_CH19, publicAssetUrl('assets/ui/ch19/money-stack.png'));
}

type Point = { x: number; y: number };

/** Bills from `from` to `to` (UI coordinates). A missing end is the bank above the screen. */
export function flyMoneyCh19(scene: Phaser.Scene, from: Point | undefined, to: Point | undefined, amount: number, delay = 0): void {
  if (!scene.textures.exists(MONEY_STACK_KEY_CH19) || amount <= 0) return;
  const r = stageRectCh19(scene);
  const bank = (p?: Point): Point => ({ x: p ? p.x : r.x + r.w / 2, y: r.y - 80 });
  const start = from ?? bank(to);
  const end = to ?? bank(from);
  const count = Phaser.Math.Clamp(Math.round(amount / 10), 2, 6);
  const lift = Math.min(220, 90 + Phaser.Math.Distance.BetweenPoints(start, end) * 0.25);

  if (from) {
    scene.time.delayedCall(delay, () => {
      sfxController.play('coin_loss');
      floatLabel(scene, from, `−${amount} M$`, '#ff6b6b');
    });
  }
  for (let i = 0; i < count; i++) {
    const bill = scene.add.image(start.x, start.y, MONEY_STACK_KEY_CH19).setDepth(DEPTH_CH19).setScrollFactor(1);
    bill.setScale(0).setName('money-flight-ch19');
    const mid = { x: (start.x + end.x) / 2 + (i - count / 2) * 18, y: Math.min(start.y, end.y) - lift };
    const state = { t: 0 };
    scene.tweens.add({
      targets: state,
      t: 1,
      delay: delay + i * 90,
      duration: 760,
      ease: 'Sine.easeInOut',
      onStart: () => scene.tweens.add({ targets: bill, scale: 0.42, duration: 160, ease: 'Back.easeOut' }),
      onUpdate: () => {
        const t = state.t, u = 1 - t;
        bill.setPosition(u * u * start.x + 2 * u * t * mid.x + t * t * end.x, u * u * start.y + 2 * u * t * mid.y + t * t * end.y);
        bill.setAngle(Math.sin(t * Math.PI * 2 + i) * 18);
      },
      onComplete: () => {
        scene.tweens.add({ targets: bill, scale: 0, alpha: 0, duration: 140, onComplete: () => bill.destroy() });
        if (i === count - 1 && to) {
          sfxController.play('coin_gain');
          floatLabel(scene, to, `+${amount} M$`, '#7dff9a');
        }
      },
    });
  }
}

function floatLabel(scene: Phaser.Scene, at: Point, copy: string, fill: string): void {
  const label = partyTextCh19(scene, at.x, at.y - 40, copy, { size: 26, fill, strokeWidth: 6 }).setDepth(DEPTH_CH19 + 1);
  label.setScale(0.4);
  scene.tweens.add({ targets: label, scale: 1, duration: 220, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: label, y: label.y - 46, alpha: 0, delay: 650, duration: 700, onComplete: () => label.destroy() });
}

/**
 * Pairs everyone who lost money this moment with everyone who gained: payers
 * send bills to receivers in proportion; the rest goes to / comes from the bank.
 */
export function flyMoneyChangesCh19(
  scene: Phaser.Scene,
  changes: ReadonlyArray<{ id: number; delta: number }>,
  pointFor: (id: number) => Point | undefined,
): void {
  const losers = changes.filter((c) => c.delta < 0).map((c) => ({ id: c.id, left: -c.delta }));
  const gainers = changes.filter((c) => c.delta > 0).map((c) => ({ id: c.id, left: c.delta }));
  let delay = 0;
  for (const loser of losers) {
    for (const gainer of gainers) {
      const amount = Math.min(loser.left, gainer.left);
      if (amount <= 0) continue;
      flyMoneyCh19(scene, pointFor(loser.id), pointFor(gainer.id), amount, delay);
      loser.left -= amount;
      gainer.left -= amount;
      delay += 260;
    }
  }
  for (const loser of losers) if (loser.left > 0) { flyMoneyCh19(scene, pointFor(loser.id), undefined, loser.left, delay); delay += 160; }
  for (const gainer of gainers) if (gainer.left > 0) { flyMoneyCh19(scene, undefined, pointFor(gainer.id), gainer.left, delay); delay += 160; }
}
