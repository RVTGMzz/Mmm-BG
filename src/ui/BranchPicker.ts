import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { branchFlavorInfo056 } from '../core/branchIdentity056';
import type { BoardEdge, BoardNode, PlayerState } from '../core/types';

export interface BranchOption {
  edge: BoardEdge;
  destination: BoardNode;
}

function nodeLabel(node: BoardNode): string {
  switch (node.type) {
    case 'ready':
      return 'READY';
    case 'money':
      return `${(node.value ?? 0) >= 0 ? '+' : ''}${node.value ?? 0}B$`;
    case 'news':
      return 'TIN TỨC';
    case 'card':
      return 'LÁ BÀI';
    case 'normal':
      return 'Ô THƯỜNG';
  }
}

export function showBranchPicker<T extends PlayerState>(
  scene: Phaser.Scene,
  player: T,
  options: BranchOption[],
  roll: number,
): Promise<BoardEdge> {
  if (options.length === 0) {
    return Promise.reject(new Error('BranchPicker requires at least one option.'));
  }
  if (options.length === 1) return Promise.resolve(options[0].edge);

  return new Promise((resolve) => {
    const root = scene.add.container(640, 360).setDepth(650);
    const objects: Phaser.GameObjects.GameObject[] = [];
    const dim = scene.add.rectangle(0, 0, 1280, 720, 0x17120f, 0.6).setInteractive();
    const panel = scene.add
      .rectangle(0, 0, 820, 455, 0xfffbf3, 1)
      .setStrokeStyle(6, 0x202020, 1);
    const title = scene.add
      .text(0, -174, `${player.name}, chọn đường đi`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(0, -132, `Xúc xắc: ${roll} • mỗi đường có một kiểu rủi ro riêng`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#70665b',
      })
      .setOrigin(0.5);

    objects.push(dim, panel, title, subtitle);

    const spacing = 310;
    const startX = -((options.length - 1) * spacing) / 2;

    options.forEach((option, index) => {
      const x = startX + index * spacing;
      const flavor = branchFlavorInfo056(option.destination);
      const accent = flavor.flavor === 'safe'
        ? 0x61b37b
        : flavor.flavor === 'drama'
          ? 0xb56bb8
          : flavor.flavor === 'money'
            ? 0xd6a020
            : 0x6d87a8;
      const button = scene.add
        .rectangle(x, 38, 265, 250, 0xfff4de, 1)
        .setStrokeStyle(4, accent, 1)
        .setInteractive({ useHandCursor: true });
      const routeName = scene.add
        .text(x, -54, option.edge.label ?? `ĐƯỜNG ${index + 1}`, {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#202020',
          align: 'center',
          fixedWidth: 235,
          wordWrap: { width: 235, useAdvancedWrap: true },
        })
        .setOrigin(0.5);
      const identity = scene.add
        .text(x, -13, `${flavor.icon} ${flavor.title}`, {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          fontSize: '21px',
          fontStyle: 'bold',
          color: `#${accent.toString(16).padStart(6, '0')}`,
        })
        .setOrigin(0.5);
      const destination = scene.add
        .text(x, 26, `Bắt đầu: ${nodeLabel(option.destination)}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#5c534a',
        })
        .setOrigin(0.5);
      const summary = scene.add
        .text(x, 66, flavor.summary, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#3c3732',
          align: 'center',
          fixedWidth: 225,
          wordWrap: { width: 225, useAdvancedWrap: true },
        })
        .setOrigin(0.5);
      const risk = scene.add
        .text(x, 105, flavor.riskLabel, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#756b61',
        })
        .setOrigin(0.5);
      const choose = scene.add
        .text(x, 142, 'CHỌN ĐƯỜNG', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: `#${accent.toString(16).padStart(6, '0')}`,
        })
        .setOrigin(0.5);

      objects.push(button, routeName, identity, destination, summary, risk, choose);

      button.on('pointerover', () => button.setFillStyle(0xffe3b5, 1));
      button.on('pointerout', () => button.setFillStyle(0xfff4de, 1));
      button.on('pointerdown', () => {
        sfxController.play('ui_confirm');
        root.destroy(true);
        resolve(option.edge);
      });
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
