import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import { rollD6 } from '../core/dice';
import { TurnManager } from '../core/turn';
import type { BoardDefinition, BoardNode, PlayerState, TileType } from '../core/types';

type VisualPlayer = PlayerState & {
  token: Phaser.GameObjects.Container;
};

const BOARD = boardJson as BoardDefinition;

const TILE_COLORS: Record<TileType, number> = {
  ready: 0xef4545,
  normal: 0xf6efe3,
  money: 0xffd34d,
  news: 0x9bcf74,
  card: 0xb997d6,
};

const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];
const TOKEN_OFFSETS = [
  { x: -16, y: -16 },
  { x: 16, y: -16 },
  { x: -16, y: 16 },
  { x: 16, y: 16 },
];

export class BoardScene extends Phaser.Scene {
  private readonly turn = new TurnManager(4);
  private readonly players: VisualPlayer[] = [];
  private rolling = false;
  private diceText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private rollButton!: Phaser.GameObjects.Rectangle;
  private logs: string[] = [];

  constructor() {
    super('BoardScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#f4ead7');
    this.drawHeader();
    this.drawBoard();
    this.createPlayers();
    this.createHud();
    this.writeLog('MVP 0.1: Roll → Move → Trigger → Next Turn');
    this.refreshHud();

    this.input.keyboard?.on('keydown-SPACE', () => {
      void this.handleRoll();
    });
  }

  private drawHeader(): void {
    this.add
      .text(48, 30, 'Me³', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '58px',
        color: '#ef4545',
        stroke: '#191919',
        strokeThickness: 8,
      })
      .setOrigin(0, 0);

    this.add.text(178, 47, 'CITY • MVP 0.1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#202020',
    });

    this.add.text(178, 77, 'Bộ xương playable đầu tiên của MeMeMe', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#6d655b',
    });
  }

  private drawBoard(): void {
    const path = this.add.graphics();
    path.lineStyle(8, 0xd8c5a5, 0.75);

    BOARD.nodes.forEach((node, index) => {
      const next = BOARD.nodes[(index + 1) % BOARD.nodes.length];
      path.lineBetween(node.x, node.y, next.x, next.y);
    });

    BOARD.nodes.forEach((node) => {
      this.add.circle(node.x, node.y, 34, TILE_COLORS[node.type], 1).setStrokeStyle(5, 0x242424, 1);
      this.add
        .text(node.x, node.y, this.tileLabel(node), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#222222',
          align: 'center',
        })
        .setOrigin(0.5);
    });

    this.add
      .text(640, 350, 'CITY PLAYTEST\n18 NODES', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#c8b99f',
        align: 'center',
      })
      .setOrigin(0.5);
  }

  private tileLabel(node: BoardNode): string {
    if (node.type === 'ready') return 'READY';
    if (node.type === 'news') return 'TIN\nTỨC';
    if (node.type === 'card') return 'LÁ\nBÀI';
    if (node.type === 'money') return `${(node.value ?? 0) >= 0 ? '+' : ''}${node.value}B$`;
    return '•';
  }

  private createPlayers(): void {
    const start = BOARD.nodes[0];

    for (let i = 0; i < 4; i += 1) {
      const body = this.add.circle(0, 0, 22, PLAYER_COLORS[i], 1).setStrokeStyle(4, 0xffffff, 1);
      const number = this.add
        .text(0, 0, String(i + 1), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      const token = this.add.container(
        start.x + TOKEN_OFFSETS[i].x,
        start.y + TOKEN_OFFSETS[i].y,
        [body, number],
      );

      this.players.push({
        id: i,
        name: `Player ${i + 1}`,
        tileIndex: 0,
        money: 1000,
        token,
      });
    }
  }

  private createHud(): void {
    this.add.rectangle(640, 350, 360, 220, 0xfffbf3, 0.96).setStrokeStyle(4, 0x242424, 1);

    this.turnText = this.add
      .text(640, 286, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);

    this.diceText = this.add
      .text(640, 332, '🎲  ?', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '35px',
        color: '#202020',
      })
      .setOrigin(0.5);

    this.rollButton = this.add
      .rectangle(640, 397, 210, 58, 0xef4545, 1)
      .setStrokeStyle(4, 0x242424, 1)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(640, 397, 'ĐỔ XÚC XẮC', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.rollButton.on('pointerdown', () => {
      void this.handleRoll();
    });

    this.add.text(452, 467, 'Click nút hoặc nhấn SPACE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#756d62',
    });

    this.scoreText = this.add.text(1010, 28, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#252525',
      backgroundColor: '#fffaf0',
      padding: { x: 16, y: 12 },
      lineSpacing: 7,
    });

    this.logText = this.add.text(48, 620, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#554f47',
      backgroundColor: '#fffaf0',
      padding: { x: 12, y: 8 },
      fixedWidth: 790,
    });
  }

  private async handleRoll(): Promise<void> {
    if (this.rolling) return;

    this.rolling = true;
    this.rollButton.setFillStyle(0xb8ada1, 1);

    const player = this.players[this.turn.currentIndex];
    const result = rollD6();
    this.diceText.setText(`🎲  ${result}`);
    this.writeLog(`${player.name} đổ được ${result}.`);

    await this.movePlayer(player, result);
    this.resolveTile(player);

    this.turn.next();
    this.rolling = false;
    this.rollButton.setFillStyle(0xef4545, 1);
    this.refreshHud();
  }

  private async movePlayer(player: VisualPlayer, steps: number): Promise<void> {
    for (let step = 0; step < steps; step += 1) {
      const nextIndex = (player.tileIndex + 1) % BOARD.nodes.length;
      player.tileIndex = nextIndex;

      if (nextIndex === 0) {
        player.money += 100;
        this.writeLog(`${player.name} hoàn thành 1 vòng: +100B$.`);
      }

      const node = BOARD.nodes[nextIndex];
      const offset = TOKEN_OFFSETS[player.id];

      await new Promise<void>((resolve) => {
        this.tweens.add({
          targets: player.token,
          x: node.x + offset.x,
          y: node.y + offset.y,
          duration: 180,
          ease: 'Sine.easeInOut',
          onComplete: () => resolve(),
        });
      });
    }
  }

  private resolveTile(player: VisualPlayer): void {
    const node = BOARD.nodes[player.tileIndex];

    switch (node.type) {
      case 'money': {
        const amount = node.value ?? 0;
        player.money += amount;
        this.writeLog(`${player.name} ${amount >= 0 ? 'nhận' : 'mất'} ${Math.abs(amount)}B$.`);
        break;
      }
      case 'news':
        this.writeLog(`${player.name} chạm TIN TỨC. Deck thật sẽ được nối ở milestone kế tiếp.`);
        this.flashCenter('📰 TIN TỨC!', '#6aa84f');
        break;
      case 'card':
        this.writeLog(`${player.name} chạm LÁ BÀI. Inventory/deck sẽ được nối ở milestone kế tiếp.`);
        this.flashCenter('🃏 LÁ BÀI!', '#8f68af');
        break;
      case 'ready':
        this.writeLog(`${player.name} dừng tại READY.`);
        break;
      case 'normal':
        this.writeLog(`${player.name} đáp xuống ô thường.`);
        break;
    }
  }

  private flashCenter(message: string, color: string): void {
    const text = this.add
      .text(640, 530, message, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color,
        backgroundColor: '#fffaf0',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      y: 510,
      duration: 160,
      yoyo: true,
      hold: 650,
      onComplete: () => text.destroy(),
    });
  }

  private refreshHud(): void {
    const current = this.players[this.turn.currentIndex];
    this.turnText.setText(`Lượt: ${current.name}`);

    this.scoreText.setText(
      this.players
        .map((player, index) => `${index === this.turn.currentIndex ? '▶' : ' '} P${index + 1}  ${player.money}B$  • ô ${player.tileIndex}`)
        .join('\n'),
    );
  }

  private writeLog(message: string): void {
    this.logs.unshift(message);
    this.logs = this.logs.slice(0, 3);
    this.logText?.setText(this.logs.join('\n'));
  }
}
