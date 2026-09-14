import Phaser from 'phaser';
import { TurnOrderScene } from './TurnOrderScene';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

type TurnOrderRuntime048 = {
  animateRoll(playerId: number, result: number): Promise<void>;
  valueTexts: Map<number, Phaser.GameObjects.Text>;
};

/**
 * Keeps the validated 0.1.45 remote authority ceremony, but fixes the final visual.
 * Unicode 🎲 is a fixed artwork and does not encode the authoritative D6 value, so
 * the settled frame now uses ⚀..⚅ plus the number instead.
 */
export class TurnOrderScene048 extends TurnOrderScene {
  create(): void {
    super.create();

    const runtime = this as unknown as TurnOrderRuntime048;
    const originalAnimateRoll = runtime.animateRoll.bind(this);
    runtime.animateRoll = async (playerId: number, result: number): Promise<void> => {
      await originalAnimateRoll(playerId, result);
      const face = DICE_FACES[Math.max(1, Math.min(6, result)) - 1] ?? '⚀';
      runtime.valueTexts.get(playerId)?.setText(`${face} ${result}`).setAngle(0).setScale(1);
    };

    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('MVP 0.1.45 • REMOTE ROLL FOR ORDER')) {
        object.setText('MVP 0.1.48 • AUTHORITATIVE D6 FACE FIX');
      }
    }
  }
}
