import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
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
    const root = scene.add.container(640, 360).setDepth(675).setName('tactical-choice-modal');
    const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x4b302a, 0.60).setInteractive();

    const shadow = scene.add.graphics().setName('tactical-choice-shadow-ch1711');
    shadow.fillStyle(0x4b302a, 0.24);
    shadow.fillRoundedRect(-398, -201, 796, 446, 32);

    const panel = scene.add.graphics().setName('tactical-choice-panel-ch1711');
    panel.fillStyle(0xfff7e8, 1);
    panel.fillRoundedRect(-390, -215, 780, 430, 30);
    panel.lineStyle(5, 0x4b302a, 0.96);
    panel.strokeRoundedRect(-390, -215, 780, 430, 30);

    const headerBand = scene.add.graphics().setName('tactical-choice-header-ch1711');
    headerBand.fillStyle(0xffd76a, 1);
    headerBand.fillRoundedRect(-366, -194, 732, 82, { tl: 22, tr: 22, bl: 12, br: 12 });
    headerBand.fillStyle(0xffffff, 0.48);
    headerBand.fillRoundedRect(-350, -185, 700, 10, 5);

    const title = scene.add.text(0, -165, `${card.title} • CHỌN KÈO`, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '29px',
      fontStyle: 'bold',
      color: '#4b302a',
    }).setOrigin(0.5);
    const subtitle = scene.add.text(0, -126, 'Chọn một cách chơi. Kết quả được áp dụng ngay sau khi bạn xác nhận.', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '13px',
      color: '#755f56',
    }).setOrigin(0.5);

    root.add([backdrop, shadow, panel, headerBand, title, subtitle]);

    let settled = false;
    const finish = (choice?: TacticalCardChoice): void => {
      if (settled) return;
      settled = true;
      sfxController.play('ui_confirm');
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
      const choiceSkin = scene.add.graphics().setName(`tactical-choice-skin-${choice}-ch1711`);
      const paintChoice = (hovered = false) => {
        choiceSkin.clear();
        choiceSkin.fillStyle(0x4b302a, hovered ? 0.22 : 0.16);
        choiceSkin.fillRoundedRect(x - 152, -81, 310, 220, 22);
        choiceSkin.fillStyle(fill, 1);
        choiceSkin.fillRoundedRect(x - 155, -86, 310, 220, 22);
        choiceSkin.fillStyle(0xffffff, hovered ? 0.52 : 0.38);
        choiceSkin.fillRoundedRect(x - 144, -75, 288, 10, 5);
        choiceSkin.lineStyle(4, 0x4b302a, 0.90);
        choiceSkin.strokeRoundedRect(x - 155, -86, 310, 220, 22);
      };
      paintChoice();
      const box = scene.add.rectangle(x, 24, 310, 220, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true })
        .setName(`tactical-choice-hit-${choice}-ch1711`);
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

      box.on('pointerover', () => paintChoice(true));
      box.on('pointerout', () => paintChoice(false));
      box.on('pointerdown', () => finish(choice));
      root.add([choiceSkin, box, choiceTitle, value, body]);
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
        : 'Không có người chơi khác hợp lệ.',
      'pressure',
    );

    const cancelSkin = scene.add.graphics().setName('tactical-choice-cancel-ch1711');
    cancelSkin.fillStyle(0xb99c86, 1);
    cancelSkin.fillRoundedRect(-85, 161, 170, 40, 14);
    cancelSkin.fillStyle(0xf4e6d5, 1);
    cancelSkin.fillRoundedRect(-85, 157, 170, 40, 14);
    cancelSkin.lineStyle(3, 0x4b302a, 0.90);
    cancelSkin.strokeRoundedRect(-85, 157, 170, 40, 14);
    const cancel = scene.add.rectangle(0, 177, 170, 40, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    const cancelText = scene.add.text(0, 176, 'QUAY LẠI', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    cancel.on('pointerdown', () => finish());
    root.add([cancelSkin, cancel, cancelText]);
  });
}
