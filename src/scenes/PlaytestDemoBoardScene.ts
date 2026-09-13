import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import boardJson from '../content/city/board_city_mvp.json';
import cardsJson from '../content/core/cards_mvp.json';
import type { ClientIntentType } from '../core/authority';
import { browserSession } from '../core/browserSession';
import type { CardDefinition } from '../core/cards';
import { computeMatchChecksum } from '../core/checksum';
import { serializeMatchState, type MatchEventValue, type MatchState } from '../core/matchState';
import { chooseTestBotIntent } from '../core/testBot';
import type { TwoTabHostSession } from '../core/twoTabSession';
import type { TurnPhaseMachine } from '../core/turnPhase';
import type { BoardDefinition, PlayerState } from '../core/types';
import { DemoBoardScene } from './DemoBoardScene';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];

type NetworkStateSource = 'host' | 'state' | 'snapshot';

type PlayerPresentationSnapshot = {
  id: number;
  money: number;
  handCardIds: string[];
};

interface DemoBoardInternals {
  match: MatchState;
  phase: TurnPhaseMachine;
  shell: { status: 'waiting' | 'active' | 'ended' };
  hostSession?: TwoTabHostSession;
  logs: string[];
  currentPlayer(): PlayerState | undefined;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
  canControlCurrentPlayer(): boolean;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
  writeLog(message: string): void;
}

export class PlaytestDemoBoardScene extends DemoBoardScene {
  private guideObjects: Phaser.GameObjects.GameObject[] = [];
  private botTimer?: Phaser.Time.TimerEvent;
  private lastBgmRound = 0;

  create(): void {
    // Test-only hooks stay in the presentation wrapper so deterministic gameplay,
    // replay and host authority code remain untouched.
    const internals = this.demoInternals();
    const originalCanControl = internals.canControlCurrentPlayer.bind(this);
    internals.canControlCurrentPlayer = () => {
      const current = internals.currentPlayer();
      if (current && browserSession.isCpuSeat(current.id)) return false;
      return originalCanControl();
    };

    const originalApplyNetworkState = internals.applyNetworkState.bind(this);
    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      const before = this.snapshotPlayers(internals.match);
      originalApplyNetworkState(state, commandSeq, checksum, source);
      if (source !== 'snapshot') this.presentStateDeltas(before, state.players);
    };

    super.create();
    this.lastBgmRound = 0;

    const badge = this.add
      .text(1218, 690, 'PLAYTEST 0.1.17', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#6d655b',
        backgroundColor: '#fffaf0',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(1, 1)
      .setDepth(680);

    const bugButton = this.add
      .text(1218, 572, '🐛  BUG REPORT', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#202020',
        backgroundColor: '#ffd34d',
        padding: { x: 10, y: 7 },
      })
      .setOrigin(1, 0.5)
      .setDepth(680)
      .setInteractive({ useHandCursor: true });

    bugButton.on('pointerdown', () => this.downloadBugReport());

    const helpButton = this.add
      .text(1218, 610, '?  CÁCH CHƠI', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#795796',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 0.5)
      .setDepth(680)
      .setInteractive({ useHandCursor: true });

    helpButton.on('pointerdown', () => this.showPlaytestGuide());

    const cpuSeats = browserSession.current.cpuSeatIds;
    const cpuLabel = cpuSeats.length > 0
      ? `🤖 CPU TEST: ${cpuSeats.map((id) => `P${id + 1}`).join(', ')}`
      : 'Tip: Lá Bài dùng trước khi đổ xúc xắc';
    this.add
      .text(1218, 646, cpuLabel, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: cpuSeats.length > 0 ? 'bold' : 'normal',
        color: cpuSeats.length > 0 ? '#795796' : '#756d62',
      })
      .setOrigin(1, 0.5)
      .setDepth(680);

    this.input.keyboard?.on('keydown-H', () => {
      if (this.guideObjects.length === 0) this.showPlaytestGuide();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.botTimer?.remove(false);
      this.botTimer = undefined;
      this.lastBgmRound = 0;
      if (this.input.keyboard) this.input.keyboard.enabled = true;
      for (const object of this.guideObjects) object.destroy();
      this.guideObjects = [];
    });

    void badge;
  }

  update(): void {
    this.syncBgmToMatch();
    this.queueCpuActionIfNeeded();
  }

  private demoInternals(): DemoBoardInternals {
    return this as unknown as DemoBoardInternals;
  }

  private snapshotPlayers(match?: MatchState): PlayerPresentationSnapshot[] {
    if (!match) return [];
    return match.players.map((player) => ({
      id: player.id,
      money: player.money,
      handCardIds: [...player.handCardIds],
    }));
  }

  private presentStateDeltas(before: PlayerPresentationSnapshot[], after: PlayerState[]): void {
    if (before.length === 0) return;
    const lines: string[] = [];

    for (const player of after) {
      const previous = before.find((entry) => entry.id === player.id);
      if (!previous) continue;

      const moneyDelta = player.money - previous.money;
      if (moneyDelta !== 0) {
        const sign = moneyDelta > 0 ? '+' : '';
        lines.push(`💸 ${player.name}: ${sign}${moneyDelta} B$ → ${player.money} B$`);
      }

      const addedCards = this.multisetDifference(player.handCardIds, previous.handCardIds);
      const removedCards = this.multisetDifference(previous.handCardIds, player.handCardIds);
      for (const cardId of addedCards) {
        lines.push(`🃏 ${player.name}: + ${this.cardTitle(cardId)} • tay ${player.handCardIds.length}/${5}`);
      }
      for (const cardId of removedCards) {
        lines.push(`🃏 ${player.name}: − ${this.cardTitle(cardId)} • còn ${player.handCardIds.length} lá`);
      }
    }

    if (lines.length === 0) return;
    const internals = this.demoInternals();
    for (const line of lines) internals.writeLog(line);
    this.showDeltaToast(lines.slice(0, 4));
  }

  private multisetDifference(left: string[], right: string[]): string[] {
    const counts = new Map<string, number>();
    for (const id of right) counts.set(id, (counts.get(id) ?? 0) + 1);

    const difference: string[] = [];
    for (const id of left) {
      const count = counts.get(id) ?? 0;
      if (count > 0) counts.set(id, count - 1);
      else difference.push(id);
    }
    return difference;
  }

  private cardTitle(cardId: string): string {
    return CARDS.find((card) => card.id === cardId)?.title ?? cardId;
  }

  private showDeltaToast(lines: string[]): void {
    const toast = this.add
      .text(640, 122, lines.join('\n'), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#202020',
        align: 'center',
        backgroundColor: '#fff4d6',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5, 0)
      .setDepth(675);

    this.tweens.add({
      targets: toast,
      y: 106,
      alpha: 0,
      delay: 1450,
      duration: 480,
      ease: 'Sine.easeIn',
      onComplete: () => toast.destroy(),
    });
  }

  private syncBgmToMatch(): void {
    const internals = this.demoInternals();
    if (!internals.match || internals.shell.status !== 'active') return;

    const playerCount = Math.max(1, internals.match.players.length);
    const round = Math.max(
      1,
      Math.floor((Math.max(1, internals.match.turn.turnNumber) - 1) / playerCount) + 1,
    );
    const clampedRound = Math.min(3, round);
    if (clampedRound === this.lastBgmRound) return;

    this.lastBgmRound = clampedRound;
    bgmController.playRound(clampedRound);
  }

  private downloadBugReport(): void {
    const internals = this.demoInternals();
    if (!internals.match) return;

    const serializedState = serializeMatchState(internals.match);
    const report = {
      product: 'MeMeMe',
      build: 'MVP 0.1.17',
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      browserSession: browserSession.current,
      shellStatus: internals.shell.status,
      checksum: computeMatchChecksum(internals.match),
      bgm: bgmController.getState(),
      logs: [...internals.logs],
      matchState: JSON.parse(serializedState) as unknown,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = report.exportedAt.replace(/[:.]/g, '-');
    anchor.href = url;
    anchor.download = `mememe-bug-report-${stamp}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    internals.writeLog(`🐛 Bug report exported • ${report.checksum}`);
  }

  private queueCpuActionIfNeeded(): void {
    if (this.botTimer || this.guideObjects.length > 0) return;
    const internals = this.demoInternals();
    if (!internals.match || !internals.phase || !internals.hostSession) return;
    if (internals.shell.status !== 'active') return;

    const current = internals.currentPlayer();
    if (!current || !browserSession.isCpuSeat(current.id)) return;

    const decision = chooseTestBotIntent(internals.match, BOARD, CARDS);
    if (!decision) return;

    const signature = [
      internals.match.turn.turnNumber,
      internals.match.turn.currentPlayerIndex,
      internals.match.turn.phase,
      internals.match.turn.revision,
      current.id,
    ].join(':');

    this.botTimer = this.time.delayedCall(520, () => {
      this.botTimer = undefined;
      if (this.guideObjects.length > 0) return;

      const live = this.demoInternals();
      if (live.shell.status !== 'active' || !live.hostSession) return;
      const livePlayer = live.currentPlayer();
      if (!livePlayer || !browserSession.isCpuSeat(livePlayer.id)) return;

      const liveSignature = [
        live.match.turn.turnNumber,
        live.match.turn.currentPlayerIndex,
        live.match.turn.phase,
        live.match.turn.revision,
        livePlayer.id,
      ].join(':');
      if (liveSignature !== signature) return;

      const liveDecision = chooseTestBotIntent(live.match, BOARD, CARDS);
      if (!liveDecision) return;
      live.writeLog(`🤖 ${livePlayer.name}: ${liveDecision.reason}`);
      live.submitIntent(liveDecision.type, liveDecision.data);
    });
  }

  private showPlaytestGuide(): void {
    if (this.guideObjects.length > 0) return;
    this.botTimer?.remove(false);
    this.botTimer = undefined;
    if (this.input.keyboard) this.input.keyboard.enabled = false;

    const blocker = this.add
      .rectangle(640, 360, 1280, 720, 0x202020, 0.78)
      .setDepth(900)
      .setInteractive();

    const panel = this.add
      .rectangle(640, 360, 760, 520, 0xfffbf3, 1)
      .setStrokeStyle(5, 0x202020, 1)
      .setDepth(901);

    const title = this.add
      .text(640, 145, '🎲 CÁCH CHƠI NHANH', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5)
      .setDepth(902);

    const body = this.add
      .text(
        360,
        202,
        [
          '1. Tới lượt mình → bấm ĐỔ XÚC XẮC.',
          '2. Trước khi đổ, có thể bấm LÁ BÀI nếu đang cầm bài.',
          '3. Ô LÁ BÀI: tự rút bài. Ô TIN TỨC: sự kiện tự kích hoạt.',
          '4. Gặp ngã rẽ: người đang chơi chọn đường đi.',
          '5. Demo kéo dài 3 vòng / 12 lượt. B$ cao nhất thắng.',
          '6. Nếu hai người bằng tiền khi hết demo → đồng hạng.',
          '',
          '🤖 CPU TEST: bot tự dùng Lá Bài hợp lệ, roll và chọn nhánh.',
          '1 người + 3 CPU là chế độ nên dùng khi test một mình.',
          '4 CPU AUTOPLAY dùng để soi kẹt lượt/nhánh/card.',
          '',
          'CPU này chỉ là bot QA đơn giản, chưa phải AI gameplay final.',
        ].join('\n'),
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#403a34',
          lineSpacing: 7,
          wordWrap: { width: 560 },
        },
      )
      .setOrigin(0, 0)
      .setDepth(902);

    const note = this.add
      .text(640, 525, 'Luật thắng 3 vòng chỉ là luật playtest tạm, chưa phải luật MeMeMe final.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#795796',
      })
      .setOrigin(0.5)
      .setDepth(902);

    const closeButton = this.add
      .rectangle(640, 575, 220, 52, 0xef4545, 1)
      .setStrokeStyle(3, 0x202020, 1)
      .setDepth(903)
      .setInteractive({ useHandCursor: true });

    const closeText = this.add
      .text(640, 575, 'HIỂU RỒI, CHƠI! ✨', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(904);

    closeButton.on('pointerdown', () => this.hidePlaytestGuide());
    blocker.on('pointerdown', () => undefined);

    this.guideObjects = [blocker, panel, title, body, note, closeButton, closeText];
  }

  private hidePlaytestGuide(): void {
    for (const object of this.guideObjects) object.destroy();
    this.guideObjects = [];
    if (this.input.keyboard) this.input.keyboard.enabled = true;
  }
}
