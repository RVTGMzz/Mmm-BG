import Phaser from 'phaser';
import { paintPartyBackdropCh19, PARTY_INK_CH19, type PartyBackdropCh19 } from './partyKitCh19';

export type ToyTownBackdropVariantCh17 = 'peach' | 'mint' | 'butter' | 'sky';

const VARIANTS = {
  peach: { sky: 0xffdfc6, glow: 0xfff1cf, hill: 0xeeb28d, leaf: 0xc8cf8a, accent: 0xd87b5d },
  mint: { sky: 0xdaf0d2, glow: 0xfff2bf, hill: 0xaed19d, leaf: 0x82bb8d, accent: 0x64a87d },
  butter: { sky: 0xffe7b8, glow: 0xfff6d9, hill: 0xe9c77b, leaf: 0xb9ca7f, accent: 0xd88f52 },
  sky: { sky: 0xd9edf5, glow: 0xfff0c6, hill: 0xbdd9cf, leaf: 0x8fc3a2, accent: 0x72a8c9 },
} as const;

/**
 * Presentation-only cozy/chibi backdrop inspired by warm mobile town/farm UIs.
 * No gameplay state, RNG, input, or authority ownership lives here.
 */
export function paintToyTownBackdropCh17(
  scene: Phaser.Scene,
  variant: ToyTownBackdropVariantCh17,
  panel: { x: number; y: number; width: number; height: number; radius?: number },
): Phaser.GameObjects.Graphics {
  // CH-19: bright starry party backdrop that fills every aspect ratio, and a
  // light glass panel with a chunky outline instead of the flat paper card.
  void VARIANTS;
  paintPartyBackdropCh19(scene, PARTY_VARIANT[variant]);
  const g = scene.add.graphics().setName('toy-town-backdrop-ch17').setDepth(-999);
  const radius = panel.radius ?? 34;
  g.fillStyle(0x10143a, 0.22).fillRoundedRect(panel.x + 6, panel.y + 10, panel.width, panel.height, radius);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(panel.x - 5, panel.y - 5, panel.width + 10, panel.height + 10, radius + 5);
  g.fillStyle(0xffffff, 1).fillRoundedRect(panel.x, panel.y, panel.width, panel.height, radius);
  g.fillStyle(0xfffaf0, 1).fillRoundedRect(panel.x + 8, panel.y + 8, panel.width - 16, panel.height - 16, Math.max(12, radius - 8));
  return g;
}

const PARTY_VARIANT: Record<ToyTownBackdropVariantCh17, PartyBackdropCh19> = {
  peach: 'sun',
  mint: 'sea',
  butter: 'berry',
  sky: 'sky',
};
