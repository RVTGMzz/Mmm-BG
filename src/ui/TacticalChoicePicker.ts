import Phaser from 'phaser';
import {
  pickRichestOtherTarget,
  tacticalChoicePressureAmount,
  type CardDefinition,
  type TacticalCardChoice,
} from '../core/cards';
import type { PlayerState } from '../core/types';

export function showTacticalChoicePicker(
  scene: Phaser.Scene,
  caster: PlayerState,
  players: PlayerState[],
  card: CardDefinition,
): Promise<TacticalCardChoice | undefined> {
  if (card.effect.type !== 'tactical_choice') return Promise.resolve(undefined);

  const safeAmount = Math.max(0, Math.floor(card.effect.safeAmount));
  const richest = pickRichestOtherTarget(players, caster.id);
  const pressureAmount = tacticalChoicePressureAmount(card.effect, players, caster.id);
  const pressurePercent = Math.round(Math.min(1, Math.max(0, card.effect.taxPercent)) * 100);

  return new Promise<TacticalCardChoice | undefined>((resolve) => {
    const root = scene.add.container(640, 360).setDepth(675);
    const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.62).setInteractive();
    const panel = scene.add.rectangle(0, 0, 780, 430, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
    const title = scene.add.text(0, -170, `${card.title} • CHỌN KÈO`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    const subtitle = scene.add.text(0, -128, 'Cả hai lựa chọn đều deterministic. Chọn xong host mới resolve Lá Bài.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#746a60',
    }).setOrigin(0.5);

    root.add([backdrop, panel, title, subtitle]);

    let settled = false;
    const finish = (choice?: TacticalCardChoice): void => {
      if (settled) return;
      settled = true;
      root.destroy(true);
      resolve(choice);
    };

    const addChoice = (
      x: number,
      fill: number,
      heading: string,
      amount: string,
      detail: string,
      choice: TacticalCardChoice,
    ) => {
      const box = scene.add.rectangle(x, 24, 310, 220, fill, 1)
        .setStrokeStyle(4, 0x242424, 1)
        .setInteractive({ useHandCursor: true });
      const choiceTitle = scene.add.text(x, -50, heading, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '23px',
        fontStyle: 'bold',
        color: '#202020',
      }).setOrigin(0.5);
      const value = scene.add.text(x, 0, amount, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '31px',
        fontStyle: 'bold',
        color: '#202020',
      }).setOrigin(0.5);
      const body = scene.add.text(x, 61, detail, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#4e4740',
        align: 'center',
        fixedWidth: 270,
        wordWrap: { width: 270 },
      }).setOrigin(0.5);

      box.on('pointerover', () => box.setScale(1.025));
      box.on('pointerout', () => box.setScale(1));
      box.on('pointerdown', () => finish(choice));
      root.add([box, choiceTitle, value, body]);
    };

    addChoice(
      -175,
      0xffd86b,
      '🪙 ĂN CHẮC',
      `+${safeAmount} B$`,
      'Không đụng ai. Tiền vào ví ngay, ít drama nhưng chắc tay.',
      'safe',
    );

    addChoice(
      175,
      0xffa8a2,
      '👑 ÉP TOP 1',
      `+${pressureAmount} B$`,
      richest
        ? `Lấy ${pressurePercent}% từ ${richest.name} đang có ${richest.money} B$.`
        : 'Không có đối thủ hợp lệ.',
      'pressure',
    );

    const cancel = scene.add.rectangle(0, 176, 170, 40, 0xd8d2c7, 1)
      .setStrokeStyle(3, 0x242424, 1)
      .setInteractive({ useHandCursor: true });
    const cancelText = scene.add.text(0, 176, 'QUAY LẠI', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    cancel.on('pointerdown', () => finish());
    root.add([cancel, cancelText]);
  });
}
