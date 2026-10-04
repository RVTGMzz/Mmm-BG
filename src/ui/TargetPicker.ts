import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { gameSession } from '../core/session';
import type { PlayerState } from '../core/types';

export function showTargetPicker<T extends PlayerState>(
  scene: Phaser.Scene,
  caster: T,
  candidates: T[],
): Promise<T | undefined> {
  if (candidates.length === 0) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    const root = scene.add.container(640, 360).setDepth(600).setName('target-picker-modal');
    const objects: Phaser.GameObjects.GameObject[] = [];

    const dim = scene.add
      .rectangle(0, 0, 1280, 720, 0x4b302a, 0.60)
      .setInteractive();

    const shadow = scene.add.graphics().setName('target-picker-shadow-ch1711');
    shadow.fillStyle(0x4b302a, 0.24);
    shadow.fillRoundedRect(-438, -196, 876, 438, 32);

    const panel = scene.add.graphics().setName('target-picker-panel-ch1711');
    panel.fillStyle(0xfff7e8, 1);
    panel.fillRoundedRect(-430, -210, 860, 420, 30);
    panel.lineStyle(5, 0x4b302a, 0.96);
    panel.strokeRoundedRect(-430, -210, 860, 420, 30);

    const headerBand = scene.add.graphics().setName('target-picker-header-ch1711');
    headerBand.fillStyle(0xbca7dc, 1);
    headerBand.fillRoundedRect(-406, -190, 812, 82, { tl: 22, tr: 22, bl: 12, br: 12 });
    headerBand.fillStyle(0xffffff, 0.46);
    headerBand.fillRoundedRect(-390, -181, 780, 10, 5);

    const title = scene.add
      .text(0, -160, `${caster.name}, chọn mục tiêu`, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#4b302a',
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(0, -122, 'Chọn nhanh 1 người chơi khác để dùng Lá Bài', {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '15px',
        color: '#735e55',
      })
      .setOrigin(0.5);

    objects.push(dim, shadow, panel, headerBand, title, subtitle);

    const spacing = 240;
    const startX = -((candidates.length - 1) * spacing) / 2;

    const finish = (target: T): void => {
      sfxController.play('ui_confirm');
      root.destroy(true);
      resolve(target);
    };

    candidates.forEach((player, index) => {
      const x = startX + index * spacing;
      const cardSkin = scene.add.graphics().setName(`target-picker-skin-${player.id}-ch1711`);
      const accent = [0xef8a77, 0x8fd49f, 0x9fd8e8, 0xbca7dc][player.id % 4] ?? 0xffd76a;
      const paintCard = (hovered = false) => {
        cardSkin.clear();
        cardSkin.fillStyle(0x4b302a, hovered ? 0.22 : 0.15);
        cardSkin.fillRoundedRect(x - 102, -77, 210, 230, 22);
        cardSkin.fillStyle(hovered ? 0xffefcf : 0xfffdf7, 1);
        cardSkin.fillRoundedRect(x - 105, -82, 210, 230, 22);
        cardSkin.fillStyle(accent, 0.98);
        cardSkin.fillRoundedRect(x - 105, -82, 210, 18, { tl: 22, tr: 22, bl: 7, br: 7 });
        cardSkin.fillStyle(0xffffff, 0.48);
        cardSkin.fillRoundedRect(x - 92, -76, 184, 7, 4);
        cardSkin.lineStyle(4, 0x4b302a, 0.92);
        cardSkin.strokeRoundedRect(x - 105, -82, 210, 230, 22);
      };
      paintCard();
      const button = scene.add
        .rectangle(x, 33, 210, 230, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true })
        .setName(`target-picker-hit-${player.id}-ch1711`);
      objects.push(cardSkin, button);

      const face = gameSession.getFace(player.id, 'neutral');
      if (face && scene.textures.exists(face.textureKey)) {
        const faceFrame = scene.add.graphics().setName(`target-face-frame-${player.id}-ch1711`);
        faceFrame.fillStyle(0xfff7e8, 1);
        faceFrame.fillRoundedRect(x - 61, -78, 122, 122, 22);
        faceFrame.lineStyle(3, accent, 0.96);
        faceFrame.strokeRoundedRect(x - 61, -78, 122, 122, 22);
        const image = scene.add.image(x, -18, face.textureKey).setDisplaySize(108, 108);
        objects.push(faceFrame, image);
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
          color: '#6b554d',
        })
        .setOrigin(0.5);
      const choose = scene.add
        .text(x, 126, 'CHỌN', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#9a5f4f',
        })
        .setOrigin(0.5);

      objects.push(name, money, choose);

      button.on('pointerover', () => paintCard(true));
      button.on('pointerout', () => paintCard(false));
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
