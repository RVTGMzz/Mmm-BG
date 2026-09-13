import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import { configureInitialPlayOrder } from '../core/matchState';
import { gameSession } from '../core/session';

const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];

function localD6(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return Math.floor((value[0]! / 0x100000000) * 6) + 1;
  }
  return Math.floor(Math.random() * 6) + 1;
}

export class TurnOrderScene extends Phaser.Scene {
  private rollButton?: Phaser.GameObjects.Rectangle;
  private rollButtonText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;
  private detailText?: Phaser.GameObjects.Text;
  private readonly valueTexts = new Map<number, Phaser.GameObjects.Text>();
  private readonly rankTexts = new Map<number, Phaser.GameObjects.Text>();
  private waitingResolver?: () => void;
  private enterBattleReady = false;

  constructor() {
    super('TurnOrderScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#f4ead7');
    this.add.rectangle(640, 360, 1130, 620, 0xfffbf3, 1).setStrokeStyle(5, 0x202020, 1);
    this.add.text(640, 64, '🎲 ROLL FOR ORDER', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    this.add.text(640, 105, 'Mỗi người đổ xúc xắc để xếp thứ tự đi 1 → 2 → 3 → 4. Nhóm hòa sẽ đổ lại.', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#6d655b',
    }).setOrigin(0.5);

    gameSession.players.forEach((player, index) => {
      const x = 220 + index * 280;
      const color = PLAYER_COLORS[player.id] ?? 0x999999;
      this.add.rectangle(x, 268, 230, 210, 0xffffff, 1).setStrokeStyle(5, color, 1);
      this.add.circle(x, 210, 26, color, 1).setStrokeStyle(3, 0x202020, 1);
      this.add.text(x, 210, `P${player.id + 1}`, {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      this.add.text(x, 258, player.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#202020',
        fixedWidth: 205, align: 'center',
      }).setOrigin(0.5);
      this.add.text(x, 291, browserSession.isCpuSeat(player.id) ? '🤖 CPU' : '👤 PLAYER', {
        fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#746a60',
      }).setOrigin(0.5);
      const value = this.add.text(x, 338, '—', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '41px', fontStyle: 'bold', color: '#202020',
      }).setOrigin(0.5);
      const rank = this.add.text(x, 382, '', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#746a60',
      }).setOrigin(0.5);
      this.valueTexts.set(player.id, value);
      this.rankTexts.set(player.id, rank);
    });

    this.promptText = this.add.text(640, 422, 'Chuẩn bị...', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    this.detailText = this.add.text(640, 457, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#6d655b', align: 'center', fixedWidth: 900,
    }).setOrigin(0.5);

    this.rollButton = this.add.rectangle(640, 535, 270, 72, 0xef4545, 1)
      .setStrokeStyle(4, 0x202020, 1)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.rollButtonText = this.add.text(640, 535, '🎲 ĐỔ XÚC XẮC', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setVisible(false);
    this.rollButton.on('pointerover', () => this.rollButton?.setScale(1.035));
    this.rollButton.on('pointerout', () => this.rollButton?.setScale(1));
    this.rollButton.on('pointerdown', () => {
      if (!this.waitingResolver) return;
      sfxController.play(this.enterBattleReady ? 'ui_confirm' : 'dice_roll');
      this.waitingResolver();
    });

    void this.runCeremony();
  }

  private async runCeremony(): Promise<void> {
    const ids = gameSession.players.map((player) => player.id);
    const order = await this.resolveGroup(ids, 1);
    gameSession.setPlayOrder(order);
    configureInitialPlayOrder(order);

    this.enterBattleReady = true;
    for (const [id, text] of this.valueTexts) {
      text.setAlpha(1).setScale(1);
      const rank = order.indexOf(id);
      this.rankTexts.get(id)?.setText(rank >= 0 ? `THỨ ${rank + 1}` : '');
    }

    const names = order.map((id, index) => `${index + 1}. ${gameSession.players[id]?.name ?? `P${id + 1}`}`);
    this.promptText?.setText('🏁 THỨ TỰ ĐÃ CHỐT!');
    this.detailText?.setText(names.join('   •   '));
    this.rollButton?.setVisible(true).setFillStyle(0x61b37b, 1);
    this.rollButtonText?.setVisible(true).setText('VÀO TRẬN ▶');

    await new Promise<void>((resolve) => {
      this.waitingResolver = resolve;
      if (browserSession.current.cpuSeatIds.length === gameSession.players.length) {
        this.time.delayedCall(1500, resolve);
      }
    });
    this.waitingResolver = undefined;
    this.scene.start('DemoBoardScene');
  }

  private async resolveGroup(ids: number[], depth: number): Promise<number[]> {
    if (ids.length <= 1) return ids;
    const rolls = new Map<number, number>();

    for (const id of ids) {
      const player = gameSession.players[id];
      if (!player) continue;
      this.promptText?.setText(`${player.name} • ĐỔ XÚC XẮC`);
      this.detailText?.setText(depth === 1 ? 'Điểm cao hơn được đi trước.' : 'Hòa điểm! Chỉ nhóm này đổ lại để phân thứ hạng.');
      this.highlight(id);
      const result = await this.waitForRoll(id);
      rolls.set(id, result);
      this.valueTexts.get(id)?.setText(`🎲 ${result}`);
      await this.pause(420);
    }

    const values = [...new Set(rolls.values())].sort((a, b) => b - a);
    const resolved: number[] = [];
    for (const value of values) {
      const tied = ids.filter((id) => rolls.get(id) === value);
      if (tied.length === 1) {
        resolved.push(tied[0]!);
        continue;
      }
      const tiedNames = tied.map((id) => gameSession.players[id]?.name ?? `P${id + 1}`).join(', ');
      this.promptText?.setText(`🤝 HÒA ${value}!`);
      this.detailText?.setText(`${tiedNames} cùng ra ${value}. Nhóm này đổ lại.`);
      await this.pause(900);
      for (const id of tied) this.valueTexts.get(id)?.setText('↻');
      resolved.push(...await this.resolveGroup(tied, depth + 1));
    }
    return resolved;
  }

  private waitForRoll(playerId: number): Promise<number> {
    const isCpu = browserSession.isCpuSeat(playerId);
    this.enterBattleReady = false;
    if (isCpu) {
      this.rollButton?.setVisible(false);
      this.rollButtonText?.setVisible(false);
      return new Promise((resolve) => {
        this.time.delayedCall(620, () => {
          sfxController.play('dice_roll');
          resolve(localD6());
        });
      });
    }

    this.rollButton?.setVisible(true).setFillStyle(0xef4545, 1);
    this.rollButtonText?.setVisible(true).setText('🎲 ĐỔ XÚC XẮC');
    return new Promise((resolve) => {
      this.waitingResolver = () => {
        this.waitingResolver = undefined;
        this.rollButton?.setVisible(false);
        this.rollButtonText?.setVisible(false);
        resolve(localD6());
      };
    });
  }

  private highlight(playerId: number): void {
    for (const [id, text] of this.valueTexts) {
      text.setAlpha(id === playerId ? 1 : 0.48);
      text.setScale(id === playerId ? 1.08 : 1);
      this.rankTexts.get(id)?.setText('');
    }
  }

  private pause(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }
}
