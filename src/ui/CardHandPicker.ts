import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import type { CardDefinition } from '../core/cards';
import type { PlayerState } from '../core/types';

const RARITY_COLORS: Record<CardDefinition['rarity'], number> = {
  N: 0xd8d2c7,
  R: 0x8ec7ff,
  SR: 0xcf9cff,
  SSR: 0xffd35a,
};

export interface CardHandSelection {
  card: CardDefinition;
  handIndex: number;
}

function targetCopy(card: CardDefinition): string {
  if (card.effect.type === 'tactical_choice') return '🧠 2 LỰA CHỌN';
  switch (card.targetMode) {
    case 'self': return '🙋 CHÍNH BẠN';
    case 'single_other': return '🎯 1 MỤC TIÊU';
    case 'random_other': return '🎲 ĐỐI THỦ NGẪU NHIÊN';
    case 'richest_other': return '👑 NGƯỜI GIÀU NHẤT';
    case 'all_others': return '🌪️ TẤT CẢ ĐỐI THỦ';
  }
}

export function showCardHandPicker(
  scene: Phaser.Scene,
  player: PlayerState,
  handCardIds: string[],
  catalog: CardDefinition[],
): Promise<CardHandSelection | undefined> {
  const entries = handCardIds
    .map((cardId, handIndex) => ({
      handIndex,
      card: catalog.find((card) => card.id === cardId),
    }))
    .filter((entry): entry is { handIndex: number; card: CardDefinition } => Boolean(entry.card));

  if (entries.length === 0) return Promise.resolve(undefined);

  return new Promise<CardHandSelection | undefined>((resolve) => {
    const root = scene.add.container(640, 360).setDepth(650);
    const backdrop = scene.add
      .rectangle(0, 0, 1280, 720, 0x111111, 0.58)
      .setInteractive();
    const panel = scene.add
      .rectangle(0, 0, 1030, 440, 0xfffbf3, 1)
      .setStrokeStyle(6, 0x242424, 1);

    const title = scene.add
      .text(0, -182, `${player.name} • CHỌN PHÉP THUẬT`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);

    const subtitle = scene.add
      .text(0, -148, 'PHÉP THUẬT • LÁ NGANG • chỉ tiêu hao sau khi effect resolve thành công.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#746a60',
      })
      .setOrigin(0.5);

    root.add([backdrop, panel, title, subtitle]);

    let settled = false;
    const finish = (selection?: CardHandSelection): void => {
      if (settled) return;
      settled = true;
      sfxController.play('ui_confirm');
      root.destroy(true);
      resolve(selection);
    };

    const spacing = 315;
    const startX = -((entries.length - 1) * spacing) / 2;

    entries.forEach(({ card, handIndex }, index) => {
      const x = startX + index * spacing;
      const cardPanel = scene.add
        .rectangle(x, 18, 286, 190, 0xffffff, 1)
        .setStrokeStyle(5, 0x242424, 1)
        .setInteractive({ useHandCursor: true });
      const rarityStrip = scene.add.rectangle(x, -59, 278, 32, RARITY_COLORS[card.rarity], 1);
      const rarity = scene.add
        .text(x - 122, -59, `${card.rarity} • ${card.impact}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#202020',
        })
        .setOrigin(0, 0.5);
      const cardTitle = scene.add
        .text(x, -25, card.title, {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ef4545',
          align: 'center',
          fixedWidth: 250,
        })
        .setOrigin(0.5);
      const description = scene.add
        .text(x, 19, card.description, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#4e4740',
          align: 'center',
          fixedWidth: 250,
          wordWrap: { width: 250 },
          maxLines: 3,
        })
        .setOrigin(0.5);
      const targetLabel = scene.add
        .text(x, 64, targetCopy(card), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#6a6057',
        })
        .setOrigin(0.5);
      const useText = scene.add
        .text(x, 94, 'DÙNG PHÉP NÀY', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#202020',
        })
        .setOrigin(0.5);

      cardPanel.on('pointerover', () => cardPanel.setFillStyle(0xfff1d6, 1));
      cardPanel.on('pointerout', () => cardPanel.setFillStyle(0xffffff, 1));
      cardPanel.on('pointerdown', () => finish({ card, handIndex }));

      root.add([cardPanel, rarityStrip, rarity, cardTitle, description, targetLabel, useText]);
    });

    const cancel = scene.add
      .rectangle(0, 184, 170, 42, 0xd8d2c7, 1)
      .setStrokeStyle(3, 0x242424, 1)
      .setInteractive({ useHandCursor: true });
    const cancelText = scene.add
      .text(0, 184, 'GIỮ LẠI', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);
    cancel.on('pointerdown', () => finish());
    root.add([cancel, cancelText]);
  });
}
