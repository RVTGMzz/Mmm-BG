import Phaser from 'phaser';

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
  const palette = VARIANTS[variant];
  scene.cameras.main.setBackgroundColor(palette.sky);

  const g = scene.add.graphics().setName('toy-town-backdrop-ch17').setDepth(-1000);
  g.fillStyle(palette.sky, 1).fillRect(0, 0, 1280, 720);

  // Soft sunrise / paper rays.
  g.fillStyle(palette.glow, 0.58);
  g.fillTriangle(640, 35, 355, 0, 510, 720);
  g.fillTriangle(640, 35, 765, 0, 870, 720);
  g.fillTriangle(640, 35, 980, 0, 1110, 720);

  // Simplified foliage/hills to make the menu feel illustrated without art assets.
  g.fillStyle(palette.hill, 0.7);
  g.fillEllipse(160, 675, 500, 220);
  g.fillEllipse(1120, 670, 540, 245);
  g.fillStyle(palette.leaf, 0.78);
  for (const [x, y, r] of [
    [62, 95, 78], [148, 70, 98], [1190, 92, 100], [1250, 160, 82],
    [70, 642, 95], [1195, 640, 112],
  ] as const) {
    g.fillCircle(x, y, r);
  }

  // Tiny decorative dots/stars.
  g.fillStyle(0xffffff, 0.72);
  for (const [x, y, r] of [
    [255, 78, 7], [316, 132, 4], [1000, 92, 6], [1080, 152, 4], [905, 54, 3],
  ] as const) {
    g.fillCircle(x, y, r);
  }

  const radius = panel.radius ?? 34;
  // Chunky shadow + warm paper panel.
  g.fillStyle(0x4b302a, 0.18).fillRoundedRect(
    panel.x + 8, panel.y + 10, panel.width, panel.height, radius,
  );
  g.fillStyle(0xfff7e8, 0.985).fillRoundedRect(
    panel.x, panel.y, panel.width, panel.height, radius,
  );
  g.lineStyle(5, 0x4b302a, 1).strokeRoundedRect(
    panel.x, panel.y, panel.width, panel.height, radius,
  );

  // Inner highlight, like a printed sticker/card edge.
  g.lineStyle(3, 0xffffff, 0.72).strokeRoundedRect(
    panel.x + 8, panel.y + 8, panel.width - 16, panel.height - 16, Math.max(12, radius - 8),
  );

  // Small top tab accent.
  const tabW = Math.min(250, panel.width * 0.28);
  g.fillStyle(palette.accent, 1).fillRoundedRect(
    panel.x + 34, panel.y - 8, tabW, 24, 12,
  );
  g.lineStyle(3, 0x4b302a, 1).strokeRoundedRect(
    panel.x + 34, panel.y - 8, tabW, 24, 12,
  );

  return g;
}
