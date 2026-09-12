import Phaser from 'phaser';
import cardsJson from '../content/core/cards_mvp.json';
import newsJson from '../content/core/news_mvp_demo.json';
import reactionsJson from '../content/core/reactions_mvp_demo.json';
import boardJson from '../content/city/board_city_mvp.json';
import {
  applyCardEffect,
  drawWeightedCard,
  getValidTargets,
  type CardDefinition,
} from '../core/cards';
import { rollD6 } from '../core/dice';
import {
  applyNewsEffect,
  drawWeightedNews,
  type NewsDefinition,
} from '../core/news';
import type { ReactionContext, ReactionEventDefinition } from '../core/reactions';
import { gameSession, type FaceExpression } from '../core/session';
import { TurnManager } from '../core/turn';
import type { BoardDefinition, BoardNode, PlayerState, TileType } from '../core/types';
import { showDynamicCard } from '../ui/CardOverlay';
import { showDynamicNews } from '../ui/NewsOverlay';
import { playReactionSequence } from '../ui/ReactionSequencer';
import { showTargetPicker } from '../ui/TargetPicker';

type VisualPlayer = PlayerState & {
  token: Phaser.GameObjects.Container;
  face?: Phaser.GameObjects.Image;
};

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const REACTIONS = reactionsJson as ReactionEventDefinition[];

const TILE_COLORS: Record<TileType, number> = {
  ready: 0xef4545,
  normal: 0xf6efe3,
  money: 0xffd34d,
  news: 0x9bcf74,
  card: 0xb997d6,
};

const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
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

  preload(): void {
    for (const profile of gameSession.players) {
      for (const asset of Object.values(profile.faces)) {
        if (asset && !this.textures.exists(asset.textureKey)) {
          this.load.image(asset.textureKey, asset.dataUrl);
        }
      }
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#f4ead7');
    this.drawHeader();
    this.drawBoard();
    this.createPlayers();
    this.createHud();
    this.writeLog('MVP 0.1.4: Tin Tức + Reaction Sequencer đã hoạt động 📰💬');
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

    this.add.text(178, 47, 'CITY • MVP 0.1.4', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#202020',
    });

    this.add.text(178, 77, 'Lá Bài + Tin Tức data-driven • auto reaction không block turn', {
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
      const profile = gameSession.players[i];
      const neutralAsset = gameSession.getFace(i, 'neutral');
      const tokenContents: Phaser.GameObjects.GameObject[] = [];
      let face: Phaser.GameObjects.Image | undefined;

      if (neutralAsset && this.textures.exists(neutralAsset.textureKey)) {
        face = this.add.image(0, 0, neutralAsset.textureKey).setDisplaySize(54, 54);
        tokenContents.push(face);
      } else {
        tokenContents.push(
          this.add.circle(0, 0, 24, PLAYER_COLORS[i], 1).setStrokeStyle(4, 0xffffff, 1),
        );
      }

      const badge = this.add.circle(21, 21, 11, PLAYER_COLORS[i], 1).setStrokeStyle(2, 0x202020, 1);
      const badgeText = this.add
        .text(21, 21, String(i + 1), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      tokenContents.push(badge, badgeText);

      const token = this.add.container(
        start.x + TOKEN_OFFSETS[i].x,
        start.y + TOKEN_OFFSETS[i].y,
        tokenContents,
      );
      token.setDepth(20 + i);

      this.players.push({
        id: i,
        name: profile?.name || `Player ${i + 1}`,
        tileIndex: 0,
        money: 1000,
        cardBlockTurns: 0,
        token,
        face,
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

    this.scoreText = this.add.text(1000, 28, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#252525',
      backgroundColor: '#fffaf0',
      padding: { x: 14, y: 11 },
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
    this.setPlayerExpression(player, 'neutral');

    const result = rollD6();
    this.diceText.setText(`🎲  ${result}`);
    this.writeLog(`${player.name} đổ được ${result}.`);

    await this.movePlayer(player, result);
    await this.resolveTile(player);
    this.finishTurn(player);

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
        this.setPlayerExpression(player, 'happy', 900);
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

  private async resolveTile(player: VisualPlayer): Promise<void> {
    const node = BOARD.nodes[player.tileIndex];

    switch (node.type) {
      case 'money': {
        const amount = node.value ?? 0;
        player.money += amount;
        this.setPlayerExpression(player, amount >= 0 ? 'happy' : 'angry', 1100);
        this.writeLog(`${player.name} ${amount >= 0 ? 'nhận' : 'mất'} ${Math.abs(amount)}B$.`);
        break;
      }
      case 'news':
        this.resolveNewsTile(player);
        break;
      case 'card':
        await this.resolveCardTile(player);
        break;
      case 'ready':
        this.writeLog(`${player.name} dừng tại READY.`);
        break;
      case 'normal':
        this.writeLog(`${player.name} đáp xuống ô thường.`);
        break;
    }
  }

  private resolveNewsTile(subject: VisualPlayer): void {
    const news = drawWeightedNews(NEWS);
    if (!news) {
      this.writeLog('Deck Tin Tức demo không có entry hợp lệ.');
      return;
    }

    const resolution = applyNewsEffect(news, subject, this.players);
    for (const player of this.players) {
      const delta = resolution.deltas[player.id] ?? 0;
      if (delta > 0) this.setPlayerExpression(player, 'happy', 1500);
      if (delta < 0) this.setPlayerExpression(player, 'angry', 1500);
    }

    const subjectDelta = resolution.deltas[subject.id] ?? 0;
    const subjectExpression: FaceExpression = subjectDelta > 0 ? 'happy' : subjectDelta < 0 ? 'angry' : 'neutral';
    showDynamicNews(this, news, subject, resolution.summary, subjectExpression);

    const spectator = this.pickSpectator([subject.id]);
    this.runReaction(news.reactionEventId, {
      subject,
      spectator,
      variables: {
        subject: subject.name,
        news: news.title,
        amount: resolution.amount ?? 0,
      },
    });

    this.writeLog(`📰 ${news.rarity} ${news.title}: ${resolution.summary}`);
    this.refreshHud();
  }

  private async resolveCardTile(caster: VisualPlayer): Promise<void> {
    if (caster.cardBlockTurns > 0) {
      this.setPlayerExpression(caster, 'angry', 1100);
      this.flashCenter('🔒 BỊ KHÓA LÁ BÀI!', '#c34a44');
      this.writeLog(`${caster.name} đang bị Khóa Mõm nên không thể dùng Lá Bài ở lượt này.`);
      return;
    }

    const card = drawWeightedCard(CARDS);
    if (!card) {
      this.writeLog('Deck Lá Bài không có lá hợp lệ.');
      return;
    }

    let target: VisualPlayer | undefined;
    if (card.targetMode === 'single_other') {
      const candidates = getValidTargets(this.players, caster.id);
      target = await showTargetPicker(this, caster, candidates);
      if (!target) {
        this.writeLog(`${caster.name} rút ${card.title}, nhưng không có mục tiêu hợp lệ.`);
        return;
      }
    }

    const resolution = applyCardEffect(card, caster, this.players, target);
    this.setPlayerExpression(caster, 'happy', 1500);

    if (target) {
      this.setPlayerExpression(target, 'angry', 1500);
    } else {
      for (const opponent of this.players) {
        if (opponent.id !== caster.id) this.setPlayerExpression(opponent, 'angry', 1500);
      }
    }

    showDynamicCard(this, card, caster, target, resolution.summary);

    const primaryTarget =
      target ??
      this.players.find(
        (player) => player.id !== caster.id && resolution.affectedPlayerIds.includes(player.id),
      );
    const spectator = this.pickSpectator([
      caster.id,
      ...(primaryTarget ? [primaryTarget.id] : []),
    ]);

    this.runReaction('CARD_ATTACK_DEMO', {
      caster,
      target: primaryTarget,
      spectator,
      variables: {
        caster: caster.name,
        target: primaryTarget?.name ?? 'cả bàn',
        card: card.title,
        amount: resolution.amount ?? 0,
      },
    });

    this.writeLog(`🃏 ${card.rarity} ${card.title}: ${resolution.summary}`);
    this.refreshHud();
  }

  private runReaction(eventId: string | undefined, context: ReactionContext): void {
    if (!eventId) return;
    const event = REACTIONS.find((entry) => entry.id === eventId);
    if (!event) {
      this.writeLog(`Reaction event ${eventId} chưa có data.`);
      return;
    }
    playReactionSequence(this, event, context);
  }

  private pickSpectator(excludedIds: number[]): VisualPlayer | undefined {
    const candidates = this.players.filter((player) => !excludedIds.includes(player.id));
    if (candidates.length === 0) return undefined;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private finishTurn(player: VisualPlayer): void {
    if (player.cardBlockTurns <= 0) return;

    player.cardBlockTurns -= 1;
    if (player.cardBlockTurns === 0) {
      this.writeLog(`🔓 ${player.name} đã hết hiệu lực Khóa Mõm.`);
    }
  }

  private setPlayerExpression(
    player: VisualPlayer,
    expression: FaceExpression,
    holdMs = 0,
  ): void {
    if (!player.face) return;

    const asset = gameSession.getFace(player.id, expression);
    if (asset && this.textures.exists(asset.textureKey)) {
      player.face.setTexture(asset.textureKey);
    }

    if (holdMs <= 0 || expression === 'neutral') return;

    this.time.delayedCall(holdMs, () => {
      const neutral = gameSession.getFace(player.id, 'neutral');
      if (neutral && player.face && this.textures.exists(neutral.textureKey)) {
        player.face.setTexture(neutral.textureKey);
      }
    });
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
        .map((player, index) => {
          const marker = index === this.turn.currentIndex ? '▶' : ' ';
          const lock = player.cardBlockTurns > 0 ? `  🔒${player.cardBlockTurns}` : '';
          const personality = gameSession.getPersonality(player.id);
          return `${marker} ${this.shortName(player.name)}  ${player.money}B$${lock}  • ${personality} • ô ${player.tileIndex}`;
        })
        .join('\n'),
    );
  }

  private shortName(name: string): string {
    return name.length <= 12 ? name : `${name.slice(0, 11)}…`;
  }

  private writeLog(message: string): void {
    this.logs.unshift(message);
    this.logs = this.logs.slice(0, 3);
    this.logText?.setText(this.logs.join('\n'));
  }
}
