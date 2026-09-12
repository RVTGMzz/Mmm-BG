import Phaser from 'phaser';
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
      .rectangle(0, 0, 790, 430, 0xfffbf3, 1)
      .setStrokeStyle(6, 0x202020, 1);
    const title = scene.add
      .text(0, -160, `${player.name}, chọn đường đi`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(0, -120, `Xúc xắc: ${roll} • lựa chọn này là PoC, chưa khóa luật chẵn/lẻ`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#70665b',
      })
      .setOrigin(0.5);

    objects.push(dim, panel, title, subtitle);

    const spacing = 300;
    const startX = -((options.length - 1) * spacing) / 2;

    options.forEach((option, index) => {
      const x = startX + index * spacing;
      const accent = option.edge.route === 'branch' ? 0x8f68af : 0xd59a36;
      const button = scene.add
        .rectangle(x, 35, 250, 225, 0xfff4de, 1)
        .setStrokeStyle(4, 0x2a2723, 1)
        .setInteractive({ useHandCursor: true });
      const routeName = scene.add
        .text(x, -32, option.edge.label ?? `ĐƯỜNG ${index + 1}`, {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#202020',
          align: 'center',
          fixedWidth: 220,
        })
        .setOrigin(0.5);
      const destination = scene.add
        .text(x, 18, `→ Node ${option.destination.id}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#5c534a',
        })
        .setOrigin(0.5);
      const tile = scene.add
        .text(x, 54, nodeLabel(option.destination), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#202020',
        })
        .setOrigin(0.5);
      const parity = scene.add
        .text(x, 88, option.edge.parity ? `Legacy test: ${option.edge.parity === 'odd' ? 'LẺ' : 'CHẴN'}` : '', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#7a7066',
        })
        .setOrigin(0.5);
      const choose = scene.add
        .text(x, 122, 'CHỌN ĐƯỜNG', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: `#${accent.toString(16).padStart(6, '0')}`,
        })
        .setOrigin(0.5);

      objects.push(button, routeName, destination, tile, parity, choose);

      button.on('pointerover', () => button.setFillStyle(0xffe3b5, 1));
      button.on('pointerout', () => button.setFillStyle(0xfff4de, 1));
      button.on('pointerdown', () => {
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
