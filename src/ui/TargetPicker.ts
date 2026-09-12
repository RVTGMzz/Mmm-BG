import Phaser from 'phaser';
import { gameSession } from '../core/session';
import type { PlayerState } from '../core/types';

export function showTargetPicker<T extends PlayerState>(
  scene: Phaser.Scene,
  caster: T,
  candidates: T[],
): Promise<T | undefined> {
  if (candidates.length === 0) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    const root = scene.add.container(640, 360).setDepth(600);
    const objects: Phaser.GameObjects.GameObject[] = [];

    const dim = scene.add
      .rectangle(0, 0, 1280, 720, 0x1b1713, 0.58)
      .setInteractive();
    const panel = scene.add
      .rectangle(0, 0, 860, 420, 0xfffbf3, 1)
      .setStrokeStyle(6, 0x202020, 1);
    const title = scene.add
      .text(0, -160, `${caster.name}, chọn mục tiêu`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(0, -122, 'Chọn nhanh 1 người chơi khác để dùng Lá Bài', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#70665b',
      })
      .setOrigin(0.5);

    objects.push(dim, panel, title, subtitle);

    const spacing = 240;
    const startX = -((candidates.length - 1) * spacing) / 2;

    const finish = (target: T): void => {
      root.destroy(true);
      resolve(target);
    };

    candidates.forEach((player, index) => {
      const x = startX + index * spacing;
      const button = scene.add
        .rectangle(x, 32, 210, 230, 0xfff4de, 1)
        .setStrokeStyle(4, 0x2a2723, 1)
        .setInteractive({ useHandCursor: true });
      objects.push(button);

      const face = gameSession.getFace(player.id, 'neutral');
      if (face && scene.textures.exists(face.textureKey)) {
        const image = scene.add.image(x, -18, face.textureKey).setDisplaySize(112, 112);
        objects.push(image);
      } else {
        const fallback = scene.add
          .text(x, -18, '😐', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '82px',
          })
          .setOrigin(0.5);
        objects.push(fallback);
      }

      const name = scene.add
        .text(x, 63, player.name, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#202020',
          align: 'center',
          fixedWidth: 184,
        })
        .setOrigin(0.5);
      const money = scene.add
        .text(x, 96, `${player.money}B$${player.cardBlockTurns > 0 ? '  🔒' : ''}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#635b52',
        })
        .setOrigin(0.5);
      const choose = scene.add
        .text(x, 126, 'CHỌN', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#ef4545',
        })
        .setOrigin(0.5);

      objects.push(name, money, choose);

      button.on('pointerover', () => button.setFillStyle(0xffe3b5, 1));
      button.on('pointerout', () => button.setFillStyle(0xfff4de, 1));
      button.on('pointerdown', () => finish(player));
    });

    root.add(objects);
    root.setAlpha(0).setScale(0.94);
    scene.tweens.add({
      targets: root,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Back.Out',
    });
  });
}
