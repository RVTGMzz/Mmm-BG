import Phaser from 'phaser';
import cardsJson from '../content/core/cards_mvp.json';
import newsJson from '../content/core/news_mvp_demo.json';
import reactionsJson from '../content/core/reactions_mvp_demo.json';
import boardJson from '../content/city/board_city_mvp.json';
import {
  getBoardNode,
  getOutgoingEdges,
  pickParityEdge,
  validateBoardDefinition,
} from '../core/board';
import {
  applyCardEffect,
  drawWeightedCard,
  getValidTargets,
  type CardDefinition,
  type CardResolution,
} from '../core/cards';
import { computeMatchChecksum } from '../core/checksum';
import { rollD6 } from '../core/dice';
import {
  advanceMatchTurn,
  appendMatchCommand,
  appendMatchEvent,
  createInitialMatchState,
  deserializeMatchState,
  serializeMatchState,
  type MatchState,
} from '../core/matchState';
import {
  applyNewsEffect,
  drawWeightedNews,
  type NewsDefinition,
} from '../core/news';
import type { ReactionContext, ReactionEventDefinition } from '../core/reactions';
import { replayMatchCommands } from '../core/replay';
import { createRandomSource } from '../core/rng';
import {
  MVP_BRANCH_DECISION_MODE,
  MVP_CARD_HAND_LIMIT,
  MVP_MAX_CARD_PLAYS_PER_TURN,
} from '../core/rules';
import { gameSession, type FaceExpression } from '../core/session';
import {
  TURN_PHASE_LABELS,
  TurnPhaseMachine,
  type TurnPhase,
} from '../core/turnPhase';
import type {
  BoardDefinition,
  BoardEdge,
  BoardNode,
  PlayerState,
  TileType,
} from '../core/types';
import { showBranchPicker } from '../ui/BranchPicker';
import { showCardHandPicker } from '../ui/CardHandPicker';
import { showDynamicCard } from '../ui/CardOverlay';
import { showDynamicNews } from '../ui/NewsOverlay';
import { playReactionSequence } from '../ui/ReactionSequencer';
import { showTargetPicker } from '../ui/TargetPicker';

type PlayerVisual = {
  token: Phaser.GameObjects.Container;
  face?: Phaser.GameObjects.Image;
};

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const REACTIONS = reactionsJson as ReactionEventDefinition[];
const SNAPSHOT_STORAGE_KEY = 'mememe.mvp.0.1.9.snapshot';

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
  private match!: MatchState;
  private phase!: TurnPhaseMachine;
  private random!: () => number;
  private players: PlayerState[] = [];
  private readonly visuals = new Map<number, PlayerVisual>();
  private diceText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private rollButton!: Phaser.GameObjects.Rectangle;
  private rollButtonText!: Phaser.GameObjects.Text;
  private handButton!: Phaser.GameObjects.Rectangle;
  private handButtonText!: Phaser.GameObjects.Text;
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
    const graphErrors = validateBoardDefinition(BOARD);
    if (graphErrors.length > 0) {
      throw new Error(`Invalid board graph:\n${graphErrors.join('\n')}`);
    }

    this.match = createInitialMatchState({
      boardId: BOARD.id,
      startNodeId: BOARD.startNodeId,
      playerNames: gameSession.players.map((profile, index) => profile.name || `Player ${index + 1}`),
      seed: this.resolveSeed(),
    });
    this.players = this.match.players;
    this.phase = new TurnPhaseMachine(this.match.turn);
    this.random = createRandomSource(this.match.rng);
    this.visuals.clear();
    this.logs = [];

    appendMatchEvent(this.match, 'match_start', {
      boardId: BOARD.id,
      seed: this.match.seed,
      playerCount: this.players.length,
    });

    this.cameras.main.setBackgroundColor('#f4ead7');
    this.drawHeader();
    this.drawBoard();
    this.createPlayers();
    this.createHud();
    this.openPreRollWindow();

    const snapshotBytes = serializeMatchState(this.match).length;
    this.writeLog(`MVP 0.1.9: snapshot restore + command replay đã hoạt động 🧬 (${snapshotBytes} chars)`);
    this.refreshHud();

    this.input.keyboard?.on('keydown-SPACE', () => {
      void this.handleRoll();
    });
    this.input.keyboard?.on('keydown-C', () => {
      void this.handleUseCard();
    });
    this.input.keyboard?.on('keydown-S', () => {
      this.saveSnapshot();
    });
    this.input.keyboard?.on('keydown-L', () => {
      this.loadSnapshot();
    });
    this.input.keyboard?.on('keydown-V', () => {
      this.verifyReplay();
    });
  }

  private resolveSeed(): number {
    const raw = new URLSearchParams(window.location.search).get('seed');
    if (raw !== null) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
    return Date.now();
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

    this.add.text(178, 47, 'CITY • MVP 0.1.9', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#202020',
    });

    this.add.text(178, 77, 'Snapshot Restore • Action Replay • deterministic checksum • seeded runtime', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#6d655b',
    });
  }

  private drawBoard(): void {
    for (const edge of BOARD.edges) {
      const from = getBoardNode(BOARD, edge.from);
      const to = getBoardNode(BOARD, edge.to);
      const path = this.add.graphics();
      const isBranch = edge.route === 'branch';
      path.lineStyle(isBranch ? 7 : 8, isBranch ? 0x9f7fba : 0xd8c5a5, isBranch ? 0.82 : 0.75);
      path.lineBetween(from.x, from.y, to.x, to.y);

      if (edge.label) {
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        this.add
          .text(midX, midY - 23, edge.label, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: isBranch ? '#795796' : '#8a672f',
            backgroundColor: '#fffaf0',
            padding: { x: 5, y: 3 },
          })
          .setOrigin(0.5)
          .setDepth(3);
      }
    }

    for (const node of BOARD.nodes) {
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
    }

    this.add
      .text(640, 350, 'CITY GRAPH\n20 NODES • 1 BRANCH', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '31px',
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
    const start = getBoardNode(BOARD, BOARD.startNodeId);

    for (const player of this.players) {
      const profile = gameSession.players[player.id];
      const neutralAsset = gameSession.getFace(player.id, 'neutral');
      const tokenContents: Phaser.GameObjects.GameObject[] = [];
      let face: Phaser.GameObjects.Image | undefined;

      if (neutralAsset && this.textures.exists(neutralAsset.textureKey)) {
        face = this.add.image(0, 0, neutralAsset.textureKey).setDisplaySize(54, 54);
        tokenContents.push(face);
      } else {
        tokenContents.push(
          this.add.circle(0, 0, 24, PLAYER_COLORS[player.id], 1).setStrokeStyle(4, 0xffffff, 1),
        );
      }

      const badge = this.add
        .circle(21, 21, 11, PLAYER_COLORS[player.id], 1)
        .setStrokeStyle(2, 0x202020, 1);
      const badgeText = this.add
        .text(21, 21, String(player.id + 1), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      tokenContents.push(badge, badgeText);

      if (profile && player.name !== profile.name && profile.name.trim()) {
        player.name = profile.name;
      }

      const offset = TOKEN_OFFSETS[player.id];
      const token = this.add.container(start.x + offset.x, start.y + offset.y, tokenContents);
      token.setDepth(20 + player.id);
      this.visuals.set(player.id, { token, face });
    }
  }

  private createHud(): void {
    this.add.rectangle(640, 365, 430, 310, 0xfffbf3, 0.96).setStrokeStyle(4, 0x242424, 1);

    this.turnText = this.add
      .text(640, 255, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '23px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);

    this.phaseText = this.add
      .text(640, 286, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#795796',
        backgroundColor: '#f1e6f8',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);

    this.diceText = this.add
      .text(640, 328, '🎲  ?', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '34px',
        color: '#202020',
      })
      .setOrigin(0.5);

    this.rollButton = this.add
      .rectangle(640, 382, 220, 50, 0xef4545, 1)
      .setStrokeStyle(4, 0x242424, 1)
      .setInteractive({ useHandCursor: true });

    this.rollButtonText = this.add
      .text(640, 382, 'ĐỔ XÚC XẮC', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.handButton = this.add
      .rectangle(640, 444, 220, 50, 0xb997d6, 1)
      .setStrokeStyle(4, 0x242424, 1)
      .setInteractive({ useHandCursor: true });

    this.handButtonText = this.add
      .text(640, 444, 'LÁ BÀI 0/3', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5);

    this.rollButton.on('pointerdown', () => {
      void this.handleRoll();
    });
    this.handButton.on('pointerdown', () => {
      void this.handleUseCard();
    });

    this.add
      .text(640, 489, 'SPACE roll • C cards • S save • L load • V verify replay', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#756d62',
      })
      .setOrigin(0.5);

    this.scoreText = this.add.text(955, 28, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#252525',
      backgroundColor: '#fffaf0',
      padding: { x: 13, y: 10 },
      lineSpacing: 7,
    });

    this.logText = this.add.text(48, 620, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#554f47',
      backgroundColor: '#fffaf0',
      padding: { x: 12, y: 8 },
      fixedWidth: 860,
    });
  }

  private openPreRollWindow(): void {
    this.transitionPhase('PRE_ROLL_ACTION');
  }

  private transitionPhase(next: TurnPhase): void {
    const from = this.phase.phase;
    this.phase.transition(next);
    appendMatchEvent(
      this.match,
      'phase_transition',
      { from, to: next },
      this.currentPlayer()?.id,
    );
    this.refreshHud();
  }

  private currentPlayer(): PlayerState | undefined {
    return this.players[this.match.turn.currentPlayerIndex];
  }

  private async handleRoll(): Promise<void> {
    if (!this.phase.can('roll')) return;

    const player = this.currentPlayer();
    if (!player) return;

    appendMatchCommand(this.match, 'roll', player.id);
    this.setPlayerExpression(player, 'neutral');
    this.transitionPhase('ROLLING');

    const result = rollD6(this.random);
    this.match.turn.lastRoll = result;
    appendMatchEvent(this.match, 'roll', { result }, player.id);
    this.diceText.setText(`🎲  ${result}`);
    this.writeLog(`${player.name} đổ được ${result}.`);

    this.transitionPhase('MOVING');
    await this.movePlayer(player, result);

    this.transitionPhase('RESOLVING_TILE');
    this.resolveTile(player);

    this.transitionPhase('TURN_END');
    this.finishTurn(player);
    appendMatchEvent(this.match, 'turn_end', { playerId: player.id }, player.id);
    advanceMatchTurn(this.match);

    this.transitionPhase('TURN_START');
    this.openPreRollWindow();
  }

  private async handleUseCard(): Promise<void> {
    if (!this.phase.can('use_card')) return;

    const caster = this.currentPlayer();
    if (!caster) return;

    if (caster.cardBlockTurns > 0) {
      this.setPlayerExpression(caster, 'angry', 1100);
      this.flashCenter('🔒 BỊ KHÓA LÁ BÀI!', '#c34a44');
      this.writeLog(`${caster.name} đang bị Khóa Mõm nên không thể dùng Lá Bài ở lượt này.`);
      appendMatchEvent(this.match, 'card_use_blocked', { reason: 'card_lock' }, caster.id);
      return;
    }

    if (caster.cardsPlayedThisTurn >= MVP_MAX_CARD_PLAYS_PER_TURN) {
      this.flashCenter('🃏 ĐÃ DÙNG LÁ BÀI LƯỢT NÀY', '#8f68af');
      this.writeLog(`${caster.name} đã chạm giới hạn dùng Lá Bài của MVP trong lượt này.`);
      appendMatchEvent(this.match, 'card_use_blocked', { reason: 'turn_limit' }, caster.id);
      return;
    }

    if (caster.handCardIds.length === 0) {
      this.flashCenter('🃏 CHƯA CÓ LÁ BÀI', '#8f68af');
      this.writeLog(`${caster.name} chưa có Lá Bài trong tay.`);
      appendMatchEvent(this.match, 'card_use_blocked', { reason: 'empty_hand' }, caster.id);
      return;
    }

    this.transitionPhase('CARD_ACTION');

    try {
      const selection = await showCardHandPicker(this, caster, caster.handCardIds, CARDS);
      if (!selection) {
        appendMatchEvent(this.match, 'card_picker_cancel', {}, caster.id);
        return;
      }

      const { card, handIndex } = selection;
      let target: PlayerState | undefined;

      if (card.targetMode === 'single_other') {
        const candidates = getValidTargets(this.players, caster.id);
        target = await showTargetPicker(this, caster, candidates);
        if (!target) {
          this.writeLog(`${caster.name} giữ lại ${card.title} vì chưa chọn mục tiêu.`);
          appendMatchEvent(this.match, 'card_target_cancel', { cardId: card.id }, caster.id);
          return;
        }
      }

      appendMatchCommand(
        this.match,
        'play_card',
        caster.id,
        { cardId: card.id, targetId: target?.id ?? -1 },
      );
      const resolution = applyCardEffect(card, caster, this.players, target);
      caster.handCardIds.splice(handIndex, 1);
      caster.cardsPlayedThisTurn += 1;
      appendMatchEvent(
        this.match,
        'card_play',
        {
          cardId: card.id,
          targetId: target?.id ?? -1,
          amount: resolution.amount ?? 0,
        },
        caster.id,
      );
      this.presentCardResolution(caster, card, resolution, target);
    } finally {
      if (this.phase.is('CARD_ACTION')) {
        this.transitionPhase('PRE_ROLL_ACTION');
      }
    }
  }

  private async movePlayer(player: PlayerState, steps: number): Promise<void> {
    const visual = this.visuals.get(player.id);
    if (!visual) throw new Error(`Missing visual for player ${player.id}.`);

    for (let step = 0; step < steps; step += 1) {
      const outgoing = getOutgoingEdges(BOARD, player.nodeId);
      if (outgoing.length === 0) {
        this.writeLog(`⚠️ Node ${player.nodeId} không có đường đi tiếp.`);
        appendMatchEvent(this.match, 'movement_stopped', { nodeId: player.nodeId }, player.id);
        return;
      }

      const fromNodeId = player.nodeId;
      const edge = await this.chooseEdge(player, outgoing, steps);
      player.nodeId = edge.to;
      appendMatchEvent(
        this.match,
        'move_edge',
        { from: fromNodeId, to: edge.to, step: step + 1, totalSteps: steps },
        player.id,
      );

      if (edge.to === BOARD.startNodeId) {
        player.money += 100;
        this.setPlayerExpression(player, 'happy', 900);
        this.writeLog(`${player.name} hoàn thành 1 vòng: +100B$.`);
        appendMatchEvent(this.match, 'lap_reward', { amount: 100 }, player.id);
      }

      const node = getBoardNode(BOARD, edge.to);
      const offset = TOKEN_OFFSETS[player.id];

      await new Promise<void>((resolve) => {
        this.tweens.add({
          targets: visual.token,
          x: node.x + offset.x,
          y: node.y + offset.y,
          duration: 180,
          ease: 'Sine.easeInOut',
          onComplete: () => resolve(),
        });
      });
    }
  }

  private async chooseEdge(
    player: PlayerState,
    outgoing: BoardEdge[],
    roll: number,
  ): Promise<BoardEdge> {
    if (outgoing.length === 1) return outgoing[0];

    this.transitionPhase('BRANCH_CHOICE');

    try {
      if (MVP_BRANCH_DECISION_MODE === 'odd_even') {
        const selected = pickParityEdge(outgoing, roll) ?? outgoing[0];
        const parity = roll % 2 === 0 ? 'CHẴN' : 'LẺ';
        appendMatchCommand(this.match, 'choose_branch', player.id, { to: selected.to });
        this.flashCenter(`🛣️ ${parity} → ${selected.label ?? `NODE ${selected.to}`}`, '#795796');
        this.writeLog(`${player.name} gặp ngã rẽ: roll ${parity}, đi ${selected.label ?? selected.to}.`);
        appendMatchEvent(
          this.match,
          'branch_choice',
          { mode: 'odd_even', to: selected.to, label: selected.label ?? '' },
          player.id,
        );
        return selected;
      }

      const options = outgoing.map((edge) => ({
        edge,
        destination: getBoardNode(BOARD, edge.to),
      }));
      const selected = await showBranchPicker(this, player, options, roll);
      appendMatchCommand(this.match, 'choose_branch', player.id, { to: selected.to });
      this.writeLog(`${player.name} chọn ${selected.label ?? `đường tới node ${selected.to}`}.`);
      appendMatchEvent(
        this.match,
        'branch_choice',
        { mode: 'manual', to: selected.to, label: selected.label ?? '' },
        player.id,
      );
      return selected;
    } finally {
      if (this.phase.is('BRANCH_CHOICE')) {
        this.transitionPhase('MOVING');
      }
    }
  }

  private resolveTile(player: PlayerState): void {
    const node = getBoardNode(BOARD, player.nodeId);
    appendMatchEvent(
      this.match,
      'tile_resolve',
      { nodeId: node.id, tileType: node.type },
      player.id,
    );

    switch (node.type) {
      case 'money': {
        const amount = node.value ?? 0;
        player.money += amount;
        this.setPlayerExpression(player, amount >= 0 ? 'happy' : 'angry', 1100);
        this.writeLog(`${player.name} ${amount >= 0 ? 'nhận' : 'mất'} ${Math.abs(amount)}B$.`);
        appendMatchEvent(this.match, 'money_delta', { amount, balance: player.money }, player.id);
        break;
      }
      case 'news':
        this.resolveNewsTile(player);
        break;
      case 'card':
        this.drawCardToHand(player);
        break;
      case 'ready':
        this.writeLog(`${player.name} dừng tại READY.`);
        break;
      case 'normal':
        this.writeLog(`${player.name} đáp xuống ô thường.`);
        break;
    }
  }

  private drawCardToHand(player: PlayerState): void {
    if (player.handCardIds.length >= MVP_CARD_HAND_LIMIT) {
      this.setPlayerExpression(player, 'angry', 900);
      this.flashCenter('🃏 TAY BÀI ĐÃ ĐẦY!', '#8f68af');
      this.writeLog(`${player.name} chạm ô Lá Bài nhưng tay đã đủ ${MVP_CARD_HAND_LIMIT} lá.`);
      appendMatchEvent(this.match, 'card_draw_blocked', { reason: 'hand_full' }, player.id);
      return;
    }

    const card = drawWeightedCard(CARDS, this.random);
    if (!card) {
      this.writeLog('Deck Lá Bài không có lá hợp lệ.');
      appendMatchEvent(this.match, 'card_draw_blocked', { reason: 'empty_deck' }, player.id);
      return;
    }

    player.handCardIds.push(card.id);
    appendMatchEvent(
      this.match,
      'card_draw',
      { cardId: card.id, rarity: card.rarity, handSize: player.handCardIds.length },
      player.id,
    );
    this.setPlayerExpression(player, 'happy', 1000);
    this.flashCenter(`🃏 ${card.rarity} • ${card.title}`, '#8f68af');
    this.writeLog(`${player.name} rút ${card.title} vào tay (${player.handCardIds.length}/${MVP_CARD_HAND_LIMIT}).`);
    this.refreshHud();
  }

  private resolveNewsTile(subject: PlayerState): void {
    const news = drawWeightedNews(NEWS, this.random);
    if (!news) {
      this.writeLog('Deck Tin Tức demo không có entry hợp lệ.');
      appendMatchEvent(this.match, 'news_draw_blocked', { reason: 'empty_deck' }, subject.id);
      return;
    }

    const resolution = applyNewsEffect(news, subject, this.players);
    appendMatchEvent(
      this.match,
      'news_resolve',
      {
        newsId: news.id,
        rarity: news.rarity,
        amount: resolution.amount ?? 0,
      },
      subject.id,
    );

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

  private presentCardResolution(
    caster: PlayerState,
    card: CardDefinition,
    resolution: CardResolution,
    target?: PlayerState,
  ): void {
    this.setPlayerExpression(caster, 'happy', 1500);

    if (target) {
      this.setPlayerExpression(target, 'angry', 1500);
    } else {
      for (const opponent of this.players) {
        if (opponent.id !== caster.id && resolution.affectedPlayerIds.includes(opponent.id)) {
          this.setPlayerExpression(opponent, 'angry', 1500);
        }
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

  private pickSpectator(excludedIds: number[]): PlayerState | undefined {
    const candidates = this.players.filter((player) => !excludedIds.includes(player.id));
    if (candidates.length === 0) return undefined;
    return candidates[Math.floor(this.random() * candidates.length)];
  }

  private finishTurn(player: PlayerState): void {
    if (player.cardBlockTurns > 0) {
      player.cardBlockTurns -= 1;
      if (player.cardBlockTurns === 0) {
        this.writeLog(`🔓 ${player.name} đã hết hiệu lực Khóa Mõm.`);
        appendMatchEvent(this.match, 'card_lock_expired', {}, player.id);
      }
    }

    player.cardsPlayedThisTurn = 0;
  }

  private saveSnapshot(): void {
    if (!this.phase.is('PRE_ROLL_ACTION')) {
      this.flashCenter('💾 CHỈ SAVE Ở CỬA SỔ PRE-ROLL', '#795796');
      return;
    }

    const serialized = serializeMatchState(this.match);
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, serialized);
    const checksum = computeMatchChecksum(this.match);
    appendMatchEvent(this.match, 'snapshot_saved', { checksum });
    this.writeLog(`💾 Snapshot saved • checksum ${checksum} • ${serialized.length} chars.`);
    this.refreshHud();
  }

  private loadSnapshot(): void {
    if (!this.phase.is('PRE_ROLL_ACTION')) {
      this.flashCenter('📦 CHỈ LOAD Ở CỬA SỔ PRE-ROLL', '#795796');
      return;
    }

    const serialized = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!serialized) {
      this.writeLog('📦 Chưa có snapshot local để restore.');
      return;
    }

    try {
      const restored = deserializeMatchState(serialized);
      if (restored.boardId !== BOARD.id) {
        throw new Error(`Snapshot board ${restored.boardId} không khớp ${BOARD.id}.`);
      }
      if (restored.players.length !== this.visuals.size) {
        throw new Error(`Snapshot có ${restored.players.length} player, scene có ${this.visuals.size}.`);
      }
      if (restored.turn.phase !== 'PRE_ROLL_ACTION') {
        throw new Error(`Snapshot phase ${restored.turn.phase} chưa phải safe restore point.`);
      }

      this.match = restored;
      this.players = restored.players;
      this.phase = new TurnPhaseMachine(restored.turn);
      this.random = createRandomSource(restored.rng);
      this.syncVisualsToState();
      appendMatchEvent(this.match, 'snapshot_restored', {
        checksum: computeMatchChecksum(this.match),
      });
      this.writeLog(`📦 Snapshot restored • checksum ${computeMatchChecksum(this.match)}.`);
      this.refreshHud();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.writeLog(`⚠️ Restore failed: ${message}`);
    }
  }

  private verifyReplay(): void {
    if (!this.phase.is('PRE_ROLL_ACTION')) {
      this.flashCenter('🧬 VERIFY Ở CỬA SỔ PRE-ROLL', '#795796');
      return;
    }

    const replay = replayMatchCommands(this.match, BOARD, CARDS, NEWS);
    const liveChecksum = computeMatchChecksum(this.match);
    const replayChecksum = computeMatchChecksum(replay.state);
    const complete = replay.consumedCommands === this.match.commandLog.length;
    const pass = replay.errors.length === 0 && complete && liveChecksum === replayChecksum;

    appendMatchEvent(this.match, 'replay_verify', {
      pass,
      liveChecksum,
      replayChecksum,
      consumed: replay.consumedCommands,
      commands: this.match.commandLog.length,
    });

    if (pass) {
      this.flashCenter(`🧬 REPLAY MATCH ${liveChecksum}`, '#3d8b5f');
      this.writeLog(`🧬 PASS • ${replay.consumedCommands} commands → checksum ${liveChecksum}.`);
    } else {
      this.flashCenter('🧬 REPLAY MISMATCH', '#c34a44');
      this.writeLog(
        `🧬 FAIL • live ${liveChecksum} / replay ${replayChecksum} • ${replay.errors[0] ?? 'command count mismatch'}`,
      );
    }
    this.refreshHud();
  }

  private syncVisualsToState(): void {
    for (const player of this.players) {
      const visual = this.visuals.get(player.id);
      if (!visual) continue;
      const node = getBoardNode(BOARD, player.nodeId);
      const offset = TOKEN_OFFSETS[player.id];
      visual.token.setPosition(node.x + offset.x, node.y + offset.y);
      this.setPlayerExpression(player, 'neutral');
    }

    this.diceText.setText(this.match.turn.lastRoll === null ? '🎲  ?' : `🎲  ${this.match.turn.lastRoll}`);
  }

  private setPlayerExpression(
    player: PlayerState,
    expression: FaceExpression,
    holdMs = 0,
  ): void {
    const visual = this.visuals.get(player.id);
    if (!visual?.face) return;

    const asset = gameSession.getFace(player.id, expression);
    if (asset && this.textures.exists(asset.textureKey)) {
      visual.face.setTexture(asset.textureKey);
    }

    if (holdMs <= 0 || expression === 'neutral') return;

    this.time.delayedCall(holdMs, () => {
      const neutral = gameSession.getFace(player.id, 'neutral');
      const currentVisual = this.visuals.get(player.id);
      if (neutral && currentVisual?.face && this.textures.exists(neutral.textureKey)) {
        currentVisual.face.setTexture(neutral.textureKey);
      }
    });
  }

  private flashCenter(message: string, color: string): void {
    const text = this.add
      .text(640, 545, message, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color,
        backgroundColor: '#fffaf0',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(250);

    this.tweens.add({
      targets: text,
      alpha: 1,
      y: 525,
      duration: 160,
      yoyo: true,
      hold: 650,
      onComplete: () => text.destroy(),
    });
  }

  private refreshHud(): void {
    if (!this.turnText || this.players.length === 0) return;

    const current = this.currentPlayer();
    if (!current) return;

    const phaseLabel = TURN_PHASE_LABELS[this.phase.phase];
    const checksum = computeMatchChecksum(this.match);
    this.turnText.setText(`Lượt ${this.match.turn.turnNumber}: ${current.name}`);
    this.phaseText.setText(
      `${phaseLabel} • rev ${this.phase.revision} • rng ${this.match.rng.calls} • cmd ${this.match.commandLog.length} • ${checksum}`,
    );

    this.scoreText.setText(
      this.players
        .map((player, index) => {
          const marker = index === this.match.turn.currentPlayerIndex ? '▶' : ' ';
          const lock = player.cardBlockTurns > 0 ? ` 🔒${player.cardBlockTurns}` : '';
          const personality = gameSession.getPersonality(player.id);
          const hand = `🃏${player.handCardIds.length}/${MVP_CARD_HAND_LIMIT}`;
          return `${marker} ${this.shortName(player.name)} ${player.money}B$ ${hand}${lock} • ${personality} • node ${player.nodeId}`;
        })
        .join('\n'),
    );

    const canRoll = this.phase.can('roll');
    this.rollButton.setFillStyle(canRoll ? 0xef4545 : 0xb8ada1, 1);
    this.rollButtonText.setText(canRoll ? 'ĐỔ XÚC XẮC' : phaseLabel);
    this.rollButtonText.setFontSize(canRoll ? 18 : 12);

    const cardLocked = current.cardBlockTurns > 0;
    const cardLimitReached = current.cardsPlayedThisTurn >= MVP_MAX_CARD_PLAYS_PER_TURN;
    const hasCards = current.handCardIds.length > 0;
    const canUseCard = this.phase.can('use_card');

    this.handButtonText.setText(`LÁ BÀI ${current.handCardIds.length}/${MVP_CARD_HAND_LIMIT}`);

    if (!canUseCard) {
      this.handButton.setFillStyle(0xb8ada1, 1);
    } else if (cardLocked) {
      this.handButton.setFillStyle(0xb8ada1, 1);
      this.handButtonText.setText(`🔒 LÁ BÀI ${current.handCardIds.length}/${MVP_CARD_HAND_LIMIT}`);
    } else if (cardLimitReached) {
      this.handButton.setFillStyle(0xd8d2c7, 1);
      this.handButtonText.setText('✓ ĐÃ DÙNG LÁ BÀI');
    } else if (!hasCards) {
      this.handButton.setFillStyle(0xd8d2c7, 1);
    } else {
      this.handButton.setFillStyle(0xb997d6, 1);
    }
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
