import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import type { CardDefinition } from '../core/cards';
import type { PlayerState } from '../core/types';
import { friendlyVisibleCopy0701 } from './friendlyVisibleCopy0701';

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
    case 'random_other': return '🎲 NGƯỜI CHƠI NGẪU NHIÊN';
    case 'richest_other': return '👑 NGƯỜI GIÀU NHẤT';
    case 'all_others': return '🌪️ TẤT CẢ NGƯỜI CHƠI KHÁC';
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
    const root = scene.add.container(640, 360).setDepth(650).setName('card-hand-picker-modal');
    const backdrop = scene.add
      .rectangle(0, 0, 1280, 720, 0x4b302a, 0.60)
      .setInteractive();

    const shadow = scene.add.graphics().setName('card-hand-shadow-ch1711');
    shadow.fillStyle(0x4b302a, 0.24);
    shadow.fillRoundedRect(-503, -242, 1006, 526, 34);

    const panel = scene.add.graphics().setName('card-hand-panel-ch1711');
    panel.fillStyle(0xfff7e8, 1);
    panel.fillRoundedRect(-495, -255, 990, 510, 32);
    panel.lineStyle(5, 0x4b302a, 0.96);
    panel.strokeRoundedRect(-495, -255, 990, 510, 32);

    const headerBand = scene.add.graphics().setName('card-hand-header-ch1711');
    headerBand.fillStyle(0xbca7dc, 1);
    headerBand.fillRoundedRect(-470, -236, 940, 78, { tl: 22, tr: 22, bl: 12, br: 12 });
    headerBand.fillStyle(0xffffff, 0.48);
    headerBand.fillRoundedRect(-454, -228, 908, 10, 5);

    const title = scene.add
      .text(0, -207, `${player.name} • CHỌN LÁ BÀI`, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#4b302a',
      })
      .setOrigin(0.5);

    const subtitle = scene.add
      .text(0, -174, 'Lá chỉ được dùng sau khi bạn chọn đủ mục tiêu hoặc lựa chọn.', {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '13px',
        color: '#735e55',
      })
      .setOrigin(0.5);

    root.add([backdrop, shadow, panel, headerBand, title, subtitle]);

    let settled = false;
    const finish = (selection?: CardHandSelection): void => {
      if (settled) return;
      settled = true;
      sfxController.play('ui_confirm');
      root.destroy(true);
      resolve(selection);
    };

    const spacing = 286;
    const startX = -((entries.length - 1) * spacing) / 2;

    entries.forEach(({ card, handIndex }, index) => {
      const x = startX + index * spacing;
      const cardSkin = scene.add.graphics().setName(`card-hand-skin-${handIndex}-ch1711`);
      const paintCard = (hovered = false) => {
        cardSkin.clear();
        cardSkin.fillStyle(0x4b302a, hovered ? 0.23 : 0.16);
        cardSkin.fillRoundedRect(x - 123, -147, 252, 322, 22);
        cardSkin.fillStyle(hovered ? 0xfff0d2 : 0xfffdf8, 1);
        cardSkin.fillRoundedRect(x - 126, -153, 252, 322, 22);
        cardSkin.fillStyle(0xffffff, hovered ? 0.58 : 0.40);
        cardSkin.fillRoundedRect(x - 114, -143, 228, 10, 5);
        cardSkin.lineStyle(5, 0x4b302a, 0.94);
        cardSkin.strokeRoundedRect(x - 126, -153, 252, 322, 22);
      };
      paintCard();
      const cardPanel = scene.add
        .rectangle(x, 8, 252, 322, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true })
        .setName(`card-hand-hit-${handIndex}-ch1711`);
      const rarityStrip = scene.add.graphics().setName(`card-hand-rarity-${handIndex}-ch1711`);
      rarityStrip.fillStyle(RARITY_COLORS[card.rarity], 1);
      rarityStrip.fillRoundedRect(x - 118, -147, 236, 38, { tl: 15, tr: 15, bl: 7, br: 7 });
      rarityStrip.fillStyle(0xffffff, 0.34);
      rarityStrip.fillRoundedRect(x - 106, -141, 212, 7, 4);
      const rarity = scene.add
        .text(x - 105, -130, `${card.rarity} • ${card.impact}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#202020',
        })
        .setOrigin(0, 0.5);
      const cardTitle = scene.add
        .text(x, -82, card.title, {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          fontSize: '23px',
          fontStyle: 'bold',
          color: '#9b5f79',
          align: 'center',
          fixedWidth: 220,
        })
        .setOrigin(0.5);
      const descriptionCopy = friendlyVisibleCopy0701(card.description);
      const description = scene.add
        .text(x, -12, descriptionCopy, {
          fontFamily: 'Arial, sans-serif',
          fontSize: descriptionCopy.length > 92 ? '12px' : '13px',
          color: '#4e4740',
          align: 'center',
          fixedWidth: 214,
          fixedHeight: 108,
          wordWrap: { width: 214, useAdvancedWrap: true },
          lineSpacing: 2,
        })
        .setOrigin(0.5);
      const targetLabel = scene.add
        .text(x, 93, targetCopy(card), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#6a6057',
        })
        .setOrigin(0.5);
      const useText = scene.add
        .text(x, 137, 'DÙNG LÁ NÀY', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#202020',
        })
        .setOrigin(0.5);

      cardPanel.on('pointerover', () => paintCard(true));
      cardPanel.on('pointerout', () => paintCard(false));
      cardPanel.on('pointerdown', () => finish({ card, handIndex }));

      root.add([cardSkin, cardPanel, rarityStrip, rarity, cardTitle, description, targetLabel, useText]);
    });

    const cancelSkin = scene.add.graphics().setName('card-hand-cancel-ch1711');
    cancelSkin.fillStyle(0xb99c86, 1);
    cancelSkin.fillRoundedRect(-85, 208, 170, 42, 14);
    cancelSkin.fillStyle(0xf3e4d2, 1);
    cancelSkin.fillRoundedRect(-85, 204, 170, 42, 14);
    cancelSkin.lineStyle(3, 0x4b302a, 0.90);
    cancelSkin.strokeRoundedRect(-85, 204, 170, 42, 14);
    const cancel = scene.add
      .rectangle(0, 225, 170, 42, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    const cancelText = scene.add
      .text(0, 224, 'GIỮ LẠI', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);
    cancel.on('pointerdown', () => finish());
    root.add([cancelSkin, cancel, cancelText]);
  });
}
