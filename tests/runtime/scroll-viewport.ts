import Phaser from 'phaser';
import { createScrollableTextViewport070429 } from '../../src/ui/scrollableTextViewport070429';

const query = new URLSearchParams(location.search);
const game = new Phaser.Game({
  type: query.get('renderer') === 'canvas' ? Phaser.CANVAS : Phaser.WEBGL,
  width: 1280, height: 720, backgroundColor: '#000000',
  render: { preserveDrawingBuffer: true, antialias: false },
  scene: { create() {
    const scene = this;
    const outer = scene.add.container(140, 100).setScrollFactor(0);
    const inner = scene.add.container(90, 65).setScale(0.85, 1.15);
    outer.add(inner);
    const viewport = createScrollableTextViewport070429(scene, inner, {
      x: 35, y: 40, width: 360, height: 110,
      text: Array.from({length: 12}, (_, i) => `Hạng ${i + 1} • Nguyễn Hoàng • +25 B$`).join('\n'),
      fontFamily: 'Arial', fontSize: 24, color: '#ffffff', lineSpacing: 8,
    });
    const api = {
      game, scene, outer, inner, viewport,
      // Pixels are read from the actual renderer, not bounds/source assertions.
      pixels() {
        const canvas = document.createElement('canvas');
        canvas.width = 1280; canvas.height = 720;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(game.canvas, 0, 0);
        return ctx.getImageData(0, 0, 1280, 720).data;
      },
      check() {
        const matrix = viewport.root.getWorldTransformMatrix();
        const pixels = api.pixels();
        let inside = 0, outside = 0, leftGlyph = 0;
        const camera = scene.cameras.main;
        // Tests use a zero-scroll UI camera for pixel checks; input also covers
        // a scrolled camera independently below.
        for (let y = 0; y < 720; y++) for (let x = 0; x < 1280; x++) {
          const index = (y * 1280 + x) * 4;
          if (pixels[index] < 230 || pixels[index+1] < 230 || pixels[index+2] < 230) continue;
          const w = camera.getWorldPoint(x, y);
          w.x -= camera.scrollX; w.y -= camera.scrollY;
          const p = matrix.applyInverse(w.x, w.y);
          if (p.x >= -2 && p.x <= 362 && p.y >= -2 && p.y <= 112) {
            inside++;
            if (p.x < 23) leftGlyph++;
          } else outside++;
        }
        return { inside, outside, leftGlyph, cropY: viewport.text._crop?.y, height: viewport.height };
      },
    };
    (window as any).scrollFixture = api;
  } },
});
