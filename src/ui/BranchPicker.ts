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
      return node.feature === 'job' ? 'JOB' : node.feature === 'minigame' ? 'MINI GAME' : 'Ô THƯỜNG';
  }
}

function accentFor(option: BranchOption): number {
  const flavor = branchFlavorInfo056(option.destination).flavor;
  if (flavor === 'safe') return 0x61b37b;
  if (flavor === 'drama') return 0xb56bb8;
  if (flavor === 'money') return 0xd6a020;
  return 0x6d87a8;
}

/**
 * Canonical manual Left/Right picker.
 *
 * It intentionally occupies only the lower-center safe area. The board junction
 * remains visible behind it, and the four player HUD corners remain uncovered.
 */
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
    const root = scene.add.container(640, 510).setDepth(960).setAlpha(0).setScale(0.96).setName('branch-picker-modal');
    const panel = scene.add.graphics();
    panel.fillStyle(0x202633, 0.93);
    panel.fillRoundedRect(-322, -108, 644, 216, 18);
    panel.lineStyle(3, 0xffffff, 0.84);
    panel.strokeRoundedRect(-322, -108, 644, 216, 18);

    const title = scene.add.text(0, -84, `${player.name} • CHỌN HƯỚNG`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const subtitle = scene.add.text(0, -62, `🎲 ${roll} • hai đường đi cùng số bước đến điểm nhập`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#d8dee5',
    }).setOrigin(0.5);

    root.add([panel, title, subtitle]);

    const spacing = options.length === 2 ? 280 : 205;
    const startX = -((options.length - 1) * spacing) / 2;

    options.forEach((option, index) => {
      const x = startX + index * spacing;
      const flavor = branchFlavorInfo056(option.destination);
      const accent = accentFor(option);
      const routeLabel = option.edge.label ?? `ĐƯỜNG ${index + 1}`;

      const button = scene.add.rectangle(x, 26, options.length === 2 ? 252 : 188, 136, 0xfffbf3, 0.98)
        .setStrokeStyle(4, accent, 1)
        .setInteractive({ useHandCursor: true });
      const route = scene.add.text(x, -26, routeLabel, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#202020',
        align: 'center',
        fixedWidth: options.length === 2 ? 230 : 172,
      }).setOrigin(0.5);
      const identity = scene.add.text(x, 0, `${flavor.icon} ${flavor.title}`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: `#${accent.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5);
      const detail = scene.add.text(x, 29, `Bắt đầu: ${nodeLabel(option.destination)} • ${flavor.riskLabel}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#5f574f',
        align: 'center',
        fixedWidth: options.length === 2 ? 230 : 170,
      }).setOrigin(0.5);
      const summary = scene.add.text(x, 56, flavor.summary, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#3f3a35',
        align: 'center',
        fixedWidth: options.length === 2 ? 220 : 164,
        wordWrap: { width: options.length === 2 ? 220 : 164, useAdvancedWrap: true },
      }).setOrigin(0.5);
      const choose = scene.add.text(x, 87, 'BẤM ĐỂ CHỌN', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#e7edf3',
      }).setOrigin(0.5);

      root.add([button, route, identity, detail, summary, choose]);

      button.on('pointerover', () => {
        button.setFillStyle(0xffefd4, 1);
        scene.tweens.add({ targets: button, scaleX: 1.025, scaleY: 1.025, duration: 80, ease: 'Sine.easeOut' });
      });
      button.on('pointerout', () => {
        button.setFillStyle(0xfffbf3, 0.98);
        scene.tweens.add({ targets: button, scaleX: 1, scaleY: 1, duration: 80, ease: 'Sine.easeOut' });
      });
      button.on('pointerdown', () => {
        sfxController.play('ui_confirm');
        root.destroy(true);
        resolve(option.edge);
      });
    });

    scene.tweens.add({
      targets: root,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      y: 500,
      duration: 150,
      ease: 'Back.Out',
    });
  });
}
