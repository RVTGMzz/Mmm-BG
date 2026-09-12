import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import cardsJson from '../content/core/cards_mvp.json';
import newsJson from '../content/core/news_mvp_demo.json';
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  type ClientIntentType,
} from '../core/authority';
import { getBoardNode, getOutgoingEdges, validateBoardDefinition } from '../core/board';
import { browserSession } from '../core/browserSession';
import { getValidTargets, type CardDefinition } from '../core/cards';
import { computeMatchChecksum } from '../core/checksum';
import {
  createDemoMatchShell,
  demoMatchResult,
  demoMatchTurnProgress,
  shouldEndDemoMatch,
  type DemoMatchShellState,
} from '../core/demoMatch';
import {
  DemoShellClientSession,
  DemoShellHostSession,
  type DemoShellMessage,
} from '../core/demoShellSession';
import { BroadcastChannelTransport, InMemoryTransportHub } from '../core/localTransport';
import {
  cloneMatchState,
  createInitialMatchState,
  serializeMatchState,
  type MatchEventValue,
  type MatchState,
} from '../core/matchState';
import type { NewsDefinition } from '../core/news';
import { MVP_CARD_HAND_LIMIT, MVP_MAX_CARD_PLAYS_PER_TURN } from '../core/rules';
import { gameSession } from '../core/session';
import {
  TwoTabClientSession,
  TwoTabHostSession,
  type TwoTabMessage,
  type TwoTabSessionEvent,
} from '../core/twoTabSession';
import { TURN_PHASE_LABELS, TurnPhaseMachine } from '../core/turnPhase';
import type { BoardDefinition, BoardNode, PlayerState, TileType } from '../core/types';
import { showBranchPicker } from '../ui/BranchPicker';
import { showCardHandPicker } from '../ui/CardHandPicker';
import { showTargetPicker } from '../ui/TargetPicker';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const DEMO_ROUNDS = 3;

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

type PlayerVisual = {
  token: Phaser.GameObjects.Container;
  face?: Phaser.GameObjects.Image;
};

export class DemoBoardScene extends Phaser.Scene {
  private match!: MatchState;
  private phase!: TurnPhaseMachine;
  private players: PlayerState[] = [];
  private shell: DemoMatchShellState = createDemoMatchShell(4, DEMO_ROUNDS);
  private readonly visuals = new Map<number, PlayerVisual>();
  private hostSession?: TwoTabHostSession;
  private clientSession?: TwoTabClientSession;
  private shellHost?: DemoShellHostSession;
  private shellClient?: DemoShellClientSession;
  private unsubscribeGame?: () => void;
  private unsubscribeShell?: () => void;
  private branchPromptOpen = false;
  private cardPickerOpen = false;
  private shellOverlay: Phaser.GameObjects.GameObject[] = [];
  private turnText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private diceText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private networkText!: Phaser.GameObjects.Text;
  private rollButton!: Phaser.GameObjects.Rectangle;
  private rollButtonText!: Phaser.GameObjects.Text;
  private handButton!: Phaser.GameObjects.Rectangle;
  private handButtonText!: Phaser.GameObjects.Text;
  private logs: string[] = [];

  constructor() {
    super('DemoBoardScene');
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
    if (graphErrors.length > 0) throw new Error(`Invalid board graph:\n${graphErrors.join('\n')}`);

    this.match = createInitialMatchState({
      boardId: BOARD.id,
      startNodeId: BOARD.startNodeId,
      playerNames: gameSession.players.map((profile, index) => profile.name || `Player ${index + 1}`),
      seed: this.resolveSeed(),
    });
    this.players = this.match.players;
    this.phase = new TurnPhaseMachine(this.match.turn);
    this.shell = createDemoMatchShell(this.players.length, DEMO_ROUNDS, 'waiting');
    this.visuals.clear();
    this.logs = [];

    this.cameras.main.setBackgroundColor('#f4ead7');
    this.drawHeader();
    this.drawBoard();
    this.createPlayers();
    this.createHud();
    this.setupSessions();

    this.input.keyboard?.on('keydown-SPACE', () => this.handleRoll());
    this.input.keyboard?.on('keydown-C', () => void this.handleUseCard());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.closeSessions());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.closeSessions());

    if (browserSession.current.mode === 'client') {
      this.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => this.retryClientJoin(),
      });
    }

    this.refreshHud();
    this.renderShellOverlay();
  }

  private resolveSeed(): number {
    const raw = new URLSearchParams(window.location.search).get('seed');
    if (raw !== null) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
    return Date.now();
  }

  private setupSessions(): void {
    const config = browserSession.current;
    const runtime = { board: BOARD, cards: CARDS, news: NEWS };

    if (config.mode === 'client') {
      const gameTransport = new BroadcastChannelTransport<TwoTabMessage>(
        browserSession.channelName,
        config.clientId,
      );
      this.clientSession = new TwoTabClientSession(
        config.roomCode,
        config.clientId,
        config.seatId,
        gameTransport,
      );
      this.unsubscribeGame = this.clientSession.subscribe((event) => this.handleGameEvent(event));
      this.clientSession.start();

      const shellTransport = new BroadcastChannelTransport<DemoShellMessage>(
        `${browserSession.channelName}-demo-shell`,
        `shell-${config.clientId}`,
      );
      this.shellClient = new DemoShellClientSession(`shell-${config.clientId}`, shellTransport);
      this.unsubscribeShell = this.shellClient.subscribe((shell) => this.applyShell(shell));
      this.shellClient.start();
      this.writeLog(`🛰️ P${config.seatId + 1} đang kết nối phòng ${config.roomCode}...`);
      return;
    }

    const authority = createEmptyHostAuthority(
      {
        boardId: BOARD.id,
        startNodeId: BOARD.startNodeId,
        playerNames: gameSession.players.map((profile, index) => profile.name || `Player ${index + 1}`),
        seed: this.match.seed,
      },
      runtime,
    );

    if (config.mode === 'host') {
      const gameTransport = new BroadcastChannelTransport<TwoTabMessage>(
        browserSession.channelName,
        'host',
      );
      this.hostSession = new TwoTabHostSession(config.roomCode, authority, gameTransport);

      const shellTransport = new BroadcastChannelTransport<DemoShellMessage>(
        `${browserSession.channelName}-demo-shell`,
        'shell-host',
      );
      this.shellHost = new DemoShellHostSession(this.players.length, shellTransport, DEMO_ROUNDS);
    } else {
      const gameHub = new InMemoryTransportHub<TwoTabMessage>();
      this.hostSession = new TwoTabHostSession('SOLO', authority, gameHub.createEndpoint('host'));
      const shellHub = new InMemoryTransportHub<DemoShellMessage>();
      this.shellHost = new DemoShellHostSession(
        this.players.length,
        shellHub.createEndpoint('shell-host'),
        DEMO_ROUNDS,
      );
    }

    this.unsubscribeGame = this.hostSession.subscribe((event) => this.handleGameEvent(event));
    this.unsubscribeShell = this.shellHost.subscribe((shell) => this.applyShell(shell));
    this.hostSession.start();
    this.shellHost.start();

    if (config.mode === 'host') {
      this.writeLog(`📡 HOST ${config.roomCode}: client có thể JOIN trước khi bấm BẮT ĐẦU.`);
    } else {
      this.writeLog('🎲 Demo hotseat sẵn sàng. Bấm BẮT ĐẦU khi cả nhóm đã ngồi đủ.');
    }
  }

  private retryClientJoin(): void {
    if (!this.clientSession || !this.shellClient) return;
    if (!this.clientSession.joined) {
      this.clientSession.transport.send(
        {
          kind: 'join_request',
          roomCode: this.clientSession.roomCode,
          clientId: this.clientSession.clientId,
          seatId: this.clientSession.seatId,
        },
        'host',
      );
    }
    if (!this.shellClient.shell) this.shellClient.requestState();
  }

  private closeSessions(): void {
    this.unsubscribeGame?.();
    this.unsubscribeShell?.();
    this.unsubscribeGame = undefined;
    this.unsubscribeShell = undefined;
    this.hostSession?.close();
    this.clientSession?.close();
    this.shellHost?.close();
    this.shellClient?.close();
    this.hostSession = undefined;
    this.clientSession = undefined;
    this.shellHost = undefined;
    this.shellClient = undefined;
  }

  private handleGameEvent(event: TwoTabSessionEvent): void {
    if (event.kind === 'status') {
      this.writeLog(`${event.level === 'error' ? '⚠️' : event.level === 'success' ? '✅' : 'ℹ️'} ${event.message}`);
      this.refreshHud();
      return;
    }

    if (event.kind === 'receipt') {
      if (event.receipt.status === 'accepted') {
        const command = event.receipt.command;
        const label = command?.type === 'play_card'
          ? CARDS.find((card) => card.id === String(command.data.cardId ?? ''))?.title ?? command.type
          : command?.type ?? 'command';
        this.writeLog(`✅ HOST ACCEPT #${event.receipt.hostCommandSeq}: ${label}`);
      } else if (event.receipt.status === 'duplicate') {
        this.writeLog(`♻️ Duplicate intent ${event.receipt.intentId} được bỏ qua.`);
      } else {
        this.writeLog(`⛔ Host reject: ${event.receipt.reason ?? 'invalid intent'}`);
      }
      this.refreshHud();
      return;
    }

    this.applyNetworkState(event.state, event.commandSeq, event.checksum, event.source);
  }

  private applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: 'host' | 'state' | 'snapshot',
  ): void {
    if (state.boardId !== BOARD.id) {
      this.writeLog(`⚠️ Network board mismatch ${state.boardId}.`);
      return;
    }

    this.match = state;
    this.players = state.players;
    this.phase = new TurnPhaseMachine(state.turn);
    this.syncVisualsToState();
    this.networkText.setText(this.networkStatusLabel(commandSeq, checksum));
    if (source !== 'snapshot') this.writeLog(`🔄 ${source.toUpperCase()} → cmd #${commandSeq} • ${checksum}`);

    if (this.shellHost && shouldEndDemoMatch(this.match, this.shell)) {
      this.shellHost.finish(this.match, commandSeq);
    }

    this.refreshHud();
    if (this.shell.status === 'active' && this.phase.is('BRANCH_CHOICE') && this.canControlCurrentPlayer()) {
      void this.promptNetworkBranch();
    }
  }

  private applyShell(shell: DemoMatchShellState): void {
    const previous = this.shell.status;
    this.shell = shell;
    if (previous !== shell.status) {
      if (shell.status === 'active') this.writeLog(`🚦 Demo bắt đầu • ${shell.rounds} vòng • ${shell.turnLimit} lượt.`);
      if (shell.status === 'ended') this.writeLog('🏁 Demo match đã kết thúc.');
    }
    this.refreshHud();
    this.renderShellOverlay();
  }

  private networkStatusLabel(commandSeq?: number, checksum?: string): string {
    const config = browserSession.current;
    const role = config.mode === 'solo' ? 'HOTSEAT' : config.mode === 'host' ? 'HOST' : `CLIENT P${config.seatId + 1}`;
    const room = config.mode === 'solo' ? '' : ` • ROOM ${config.roomCode}`;
    const joined = config.mode === 'client' ? (this.clientSession?.joined ? ' • JOINED' : ' • CONNECTING') : '';
    const suffix = commandSeq === undefined ? '' : ` • cmd #${commandSeq} • ${checksum ?? computeMatchChecksum(this.match)}`;
    return `📡 ${role}${room}${joined}${suffix}`;
  }

  private canControlCurrentPlayer(): boolean {
    if (this.shell.status !== 'active') return false;
    const current = this.currentPlayer();
    if (!current) return false;
    if (this.hostSession) return this.hostSession.controlsActor(current.id);
    if (this.clientSession) return this.clientSession.controlsActor(current.id);
    return false;
  }

  private currentPlayer(): PlayerState | undefined {
    return this.players[this.match.turn.currentPlayerIndex];
  }

  private submitIntent(type: ClientIntentType, data: Record<string, MatchEventValue> = {}): void {
    if (this.shell.status !== 'active') return;
    const current = this.currentPlayer();
    if (!current) return;

    try {
      if (this.hostSession) this.hostSession.submitLocalIntent(type, current.id, data);
      else if (this.clientSession) this.clientSession.submitIntent(type, data);
    } catch (error) {
      this.writeLog(`⚠️ ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private handleRoll(): void {
    if (!this.phase.can('roll') || !this.canControlCurrentPlayer() || this.cardPickerOpen) return;
    this.submitIntent('roll');
  }

  private async handleUseCard(): Promise<void> {
    if (!this.phase.can('use_card') || !this.canControlCurrentPlayer() || this.cardPickerOpen) return;
    const caster = this.currentPlayer();
    if (!caster) return;

    if (caster.cardBlockTurns > 0) {
      this.flashCenter('🔒 BỊ KHÓA LÁ BÀI!', '#c34a44');
      return;
    }
    if (caster.cardsPlayedThisTurn >= MVP_MAX_CARD_PLAYS_PER_TURN) {
      this.flashCenter('🃏 ĐÃ DÙNG LÁ BÀI LƯỢT NÀY', '#8f68af');
      return;
    }
    if (caster.handCardIds.length === 0) {
      this.flashCenter('🃏 CHƯA CÓ LÁ BÀI', '#8f68af');
      return;
    }

    this.cardPickerOpen = true;
    this.refreshHud();
    try {
      const selection = await showCardHandPicker(this, caster, caster.handCardIds, CARDS);
      if (!selection) return;

      const { card } = selection;
      let targetId = -1;
      if (card.targetMode === 'single_other') {
        const target = await showTargetPicker(this, caster, getValidTargets(this.players, caster.id));
        if (!target) return;
        targetId = target.id;
      }
      this.submitIntent('play_card', { cardId: card.id, targetId });
    } finally {
      this.cardPickerOpen = false;
      this.refreshHud();
    }
  }

  private async promptNetworkBranch(): Promise<void> {
    if (this.branchPromptOpen || this.shell.status !== 'active' || !this.phase.is('BRANCH_CHOICE') || !this.canControlCurrentPlayer()) return;
    const player = this.currentPlayer();
    if (!player) return;
    const outgoing = getOutgoingEdges(BOARD, player.nodeId);
    if (outgoing.length <= 1) return;

    this.branchPromptOpen = true;
    try {
      const selected = await showBranchPicker(
        this,
        player,
        outgoing.map((edge) => ({ edge, destination: getBoardNode(BOARD, edge.to) })),
        this.match.turn.lastRoll ?? 0,
      );
      this.submitIntent('choose_branch', { to: selected.to });
    } finally {
      this.branchPromptOpen = false;
    }
  }

  private startDemoMatch(): void {
    if (!this.shellHost || !this.hostSession || this.shell.status !== 'waiting') return;
    this.shellHost.begin(hostAuthorityCommandSeq(this.hostSession.authority));
  }

  private rematchDemo(): void {
    if (!this.shellHost || !this.hostSession || this.shell.status !== 'ended') return;
    const names = this.players.map((player) => player.name);
    const fresh = createEmptyHostAuthority(
      {
        boardId: BOARD.id,
        startNodeId: BOARD.startNodeId,
        playerNames: names,
        seed: Date.now(),
        startingMoney: this.match.startingMoney,
      },
      { board: BOARD, cards: CARDS, news: NEWS },
    );

    this.hostSession.authority.source = fresh.source;
    this.hostSession.authority.state = fresh.state;
    this.hostSession.authority.receipts.clear();

    const checksum = computeMatchChecksum(fresh.state);
    this.hostSession.transport.send({
      kind: 'state',
      commandSeq: 0,
      checksum,
      serializedState: serializeMatchState(fresh.state),
    });
    this.applyNetworkState(cloneMatchState(fresh.state), 0, checksum, 'host');
    this.shellHost.resetAndBegin(fresh.state.players.length, 0);
    this.writeLog('🔁 Rematch mới đã bắt đầu với seed mới.');
  }

  private goLobby(): void {
    this.closeSessions();
    browserSession.configureSolo();
    this.scene.start('LocalLobbyScene');
  }

  private drawHeader(): void {
    this.add.text(48, 28, 'Me³', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '58px', color: '#ef4545', stroke: '#191919', strokeThickness: 8,
    });
    this.add.text(178, 45, 'CITY • DEMO MVP 0.1.15', {
      fontFamily: 'Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#202020',
    });
    this.add.text(178, 75, 'MATCH SHELL • 3 VÒNG • B$ CAO NHẤT THẮNG (LUẬT DEMO TẠM)', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#6d655b',
    });
    this.networkText = this.add.text(178, 99, this.networkStatusLabel(), {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#795796',
      backgroundColor: '#f1e6f8', padding: { x: 7, y: 3 },
    });
  }

  private drawBoard(): void {
    for (const edge of BOARD.edges) {
      const from = getBoardNode(BOARD, edge.from);
      const to = getBoardNode(BOARD, edge.to);
      const path = this.add.graphics();
      path.lineStyle(edge.route === 'branch' ? 7 : 8, edge.route === 'branch' ? 0x9f7fba : 0xd8c5a5, 0.78);
      path.lineBetween(from.x, from.y, to.x, to.y);
    }

    for (const node of BOARD.nodes) {
      this.add.circle(node.x, node.y, 34, TILE_COLORS[node.type], 1).setStrokeStyle(5, 0x242424, 1);
      this.add.text(node.x, node.y, this.tileLabel(node), {
        fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#222222', align: 'center',
      }).setOrigin(0.5);
    }

    this.add.text(640, 350, 'MeMeMe CITY\nDEMO MATCH', {
      fontFamily: 'Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#c8b99f', align: 'center',
    }).setOrigin(0.5);
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
      const neutralAsset = gameSession.getFace(player.id, 'neutral');
      const contents: Phaser.GameObjects.GameObject[] = [];
      let face: Phaser.GameObjects.Image | undefined;

      if (neutralAsset && this.textures.exists(neutralAsset.textureKey)) {
        face = this.add.image(0, 0, neutralAsset.textureKey).setDisplaySize(54, 54);
        contents.push(face);
      } else {
        contents.push(this.add.circle(0, 0, 24, PLAYER_COLORS[player.id], 1).setStrokeStyle(4, 0xffffff, 1));
      }

      contents.push(
        this.add.circle(21, 21, 11, PLAYER_COLORS[player.id], 1).setStrokeStyle(2, 0x202020, 1),
        this.add.text(21, 21, String(player.id + 1), {
          fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
        }).setOrigin(0.5),
      );

      const offset = TOKEN_OFFSETS[player.id];
      const token = this.add.container(start.x + offset.x, start.y + offset.y, contents).setDepth(20 + player.id);
      this.visuals.set(player.id, { token, face });
    }
  }

  private createHud(): void {
    this.add.rectangle(640, 370, 430, 300, 0xfffbf3, 0.96).setStrokeStyle(4, 0x242424, 1);
    this.turnText = this.add.text(640, 270, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    this.phaseText = this.add.text(640, 302, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#795796',
      backgroundColor: '#f1e6f8', padding: { x: 8, y: 4 },
    }).setOrigin(0.5);
    this.diceText = this.add.text(640, 343, '🎲  ?', {
      fontFamily: 'Arial, sans-serif', fontSize: '34px', color: '#202020',
    }).setOrigin(0.5);

    this.rollButton = this.add.rectangle(640, 400, 220, 50, 0xef4545, 1)
      .setStrokeStyle(4, 0x242424, 1).setInteractive({ useHandCursor: true });
    this.rollButtonText = this.add.text(640, 400, 'ĐỔ XÚC XẮC', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.handButton = this.add.rectangle(640, 462, 220, 50, 0xb997d6, 1)
      .setStrokeStyle(4, 0x242424, 1).setInteractive({ useHandCursor: true });
    this.handButtonText = this.add.text(640, 462, 'LÁ BÀI', {
      fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);

    this.rollButton.on('pointerdown', () => this.handleRoll());
    this.handButton.on('pointerdown', () => void this.handleUseCard());

    this.add.text(640, 505, 'SPACE roll • C cards • demo 3 vòng • hòa tiền = đồng hạng', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#756d62',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(955, 28, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#252525',
      backgroundColor: '#fffaf0', padding: { x: 13, y: 10 }, lineSpacing: 7,
    });
    this.logText = this.add.text(48, 620, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#554f47',
      backgroundColor: '#fffaf0', padding: { x: 12, y: 8 }, fixedWidth: 900,
    });
  }

  private syncVisualsToState(): void {
    for (const player of this.players) {
      const visual = this.visuals.get(player.id);
      if (!visual) continue;
      const node = getBoardNode(BOARD, player.nodeId);
      const offset = TOKEN_OFFSETS[player.id];
      visual.token.setPosition(node.x + offset.x, node.y + offset.y);
    }
    this.diceText.setText(this.match.turn.lastRoll === null ? '🎲  ?' : `🎲  ${this.match.turn.lastRoll}`);
  }

  private refreshHud(): void {
    if (!this.turnText || this.players.length === 0) return;
    const current = this.currentPlayer();
    if (!current) return;

    const canControl = this.canControlCurrentPlayer();
    const phaseLabel = TURN_PHASE_LABELS[this.phase.phase];
    const checksum = computeMatchChecksum(this.match);
    const progress = demoMatchTurnProgress(this.match, this.shell);
    this.turnText.setText(`Vòng ${progress.currentRound}/${this.shell.rounds} • ${current.name}`);
    this.phaseText.setText(`${phaseLabel} • lượt ${progress.completedTurns}/${progress.totalTurns} • ${checksum}`);
    this.networkText.setText(this.networkStatusLabel(undefined, checksum));

    const config = browserSession.current;
    this.scoreText.setText(
      this.players.map((player, index) => {
        const marker = index === this.match.turn.currentPlayerIndex ? '▶' : ' ';
        const mine = config.mode === 'client' && player.id === config.seatId ? ' ★' : '';
        const hostOwned = config.mode !== 'client' && this.hostSession?.controlsActor(player.id) ? ' H' : '';
        const lock = player.cardBlockTurns > 0 ? ` 🔒${player.cardBlockTurns}` : '';
        return `${marker} P${player.id + 1}${mine}${hostOwned} ${this.shortName(player.name)} • ${player.money}B$ • 🃏${player.handCardIds.length}/${MVP_CARD_HAND_LIMIT}${lock} • node ${player.nodeId}`;
      }).join('\n'),
    );

    const canRoll = canControl && this.phase.can('roll') && !this.cardPickerOpen;
    this.rollButton.setFillStyle(canRoll ? 0xef4545 : 0xb8ada1, 1);
    this.rollButtonText.setText(
      this.shell.status !== 'active'
        ? this.shell.status === 'ended' ? 'TRẬN ĐÃ KẾT THÚC' : 'CHỜ BẮT ĐẦU'
        : canRoll ? 'ĐỔ XÚC XẮC' : canControl ? phaseLabel : `CHỜ ${this.shortName(current.name)}`,
    );
    this.rollButtonText.setFontSize(canRoll ? 18 : 12);

    const canUseCard = canControl && this.phase.can('use_card') && !this.cardPickerOpen;
    this.handButtonText.setText(`LÁ BÀI ${current.handCardIds.length}/${MVP_CARD_HAND_LIMIT}`);
    this.handButton.setFillStyle(canUseCard && current.handCardIds.length > 0 ? 0xb997d6 : 0xd8d2c7, 1);
  }

  private renderShellOverlay(): void {
    for (const object of this.shellOverlay) object.destroy();
    this.shellOverlay = [];
    if (this.shell.status === 'active') return;

    const bg = this.add.rectangle(640, 360, 780, 430, 0x202020, 0.94)
      .setStrokeStyle(5, 0xfffaf0, 1).setDepth(700).setInteractive();
    this.shellOverlay.push(bg);

    if (this.shell.status === 'waiting') {
      this.shellOverlay.push(
        this.add.text(640, 220, '🎲 MeMeMe DEMO MATCH', {
          fontFamily: 'Arial, sans-serif', fontSize: '34px', fontStyle: 'bold', color: '#ffffff',
        }).setOrigin(0.5).setDepth(701),
        this.add.text(640, 292,
          `Luật demo tạm: ${this.shell.rounds} vòng (${this.shell.turnLimit} lượt).\nKết thúc vòng cuối, ai có nhiều B$ nhất thắng. Nếu bằng tiền thì đồng hạng.\nLuật này chỉ để playtest, chưa phải win condition final.`, {
            fontFamily: 'Arial, sans-serif', fontSize: '17px', color: '#f4ead7', align: 'center', lineSpacing: 8,
          }).setOrigin(0.5).setDepth(701),
      );

      if (this.shellHost) {
        this.addOverlayButton(640, 405, 'BẮT ĐẦU DEMO 🚦', 0xef4545, () => this.startDemoMatch());
      } else {
        this.shellOverlay.push(
          this.add.text(640, 410, '⏳ CHỜ HOST BẮT ĐẦU...', {
            fontFamily: 'Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffd34d',
          }).setOrigin(0.5).setDepth(701),
        );
      }
      this.addOverlayButton(640, 475, 'VỀ LOBBY', 0x6d655b, () => this.goLobby(), 210);
      return;
    }

    const result = demoMatchResult(this.match);
    const winners = result.winnerIds
      .map((id) => this.players.find((player) => player.id === id)?.name ?? `P${id + 1}`)
      .join(' + ');
    const ranking = result.ranking
      .map((entry, index) => {
        const player = this.players.find((candidate) => candidate.id === entry.playerId);
        return `${index + 1}. ${player?.name ?? `P${entry.playerId + 1}`}  •  ${entry.money}B$`;
      })
      .join('\n');

    this.shellOverlay.push(
      this.add.text(640, 200, result.winnerIds.length > 1 ? `🏆 ĐỒNG HẠNG: ${winners}` : `🏆 ${winners} THẮNG!`, {
        fontFamily: 'Arial, sans-serif', fontSize: '31px', fontStyle: 'bold', color: '#ffd34d', align: 'center',
      }).setOrigin(0.5).setDepth(701),
      this.add.text(640, 295, ranking, {
        fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#ffffff', align: 'left', lineSpacing: 7,
      }).setOrigin(0.5).setDepth(701),
      this.add.text(640, 378, `Demo tạm kết thúc sau ${this.shell.rounds} vòng • tiền cao nhất: ${this.shell.winningMoney ?? result.winningMoney}B$`, {
        fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#cfc6b8',
      }).setOrigin(0.5).setDepth(701),
    );

    if (this.shellHost) {
      this.addOverlayButton(535, 455, 'CHƠI LẠI 🔁', 0xef4545, () => this.rematchDemo(), 210);
      this.addOverlayButton(745, 455, 'VỀ LOBBY', 0x6d655b, () => this.goLobby(), 180);
    } else {
      this.shellOverlay.push(
        this.add.text(640, 440, '⏳ CHỜ HOST CHỌN CHƠI LẠI...', {
          fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#f4ead7',
        }).setOrigin(0.5).setDepth(701),
      );
      this.addOverlayButton(640, 490, 'VỀ LOBBY', 0x6d655b, () => this.goLobby(), 180);
    }
  }

  private addOverlayButton(
    x: number,
    y: number,
    label: string,
    color: number,
    action: () => void,
    width = 260,
  ): void {
    const button = this.add.rectangle(x, y, width, 52, color, 1)
      .setStrokeStyle(3, 0xfffaf0, 1).setDepth(702).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(703);
    button.on('pointerdown', action);
    this.shellOverlay.push(button, text);
  }

  private flashCenter(message: string, color: string): void {
    const text = this.add.text(640, 555, message, {
      fontFamily: 'Arial, sans-serif', fontSize: '26px', fontStyle: 'bold', color,
      backgroundColor: '#fffaf0', padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setDepth(250);
    this.tweens.add({ targets: text, alpha: 0, y: 535, delay: 700, duration: 250, onComplete: () => text.destroy() });
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
