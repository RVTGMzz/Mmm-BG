import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import boardJson from '../content/city/board_city_mvp.json';
import { getBoardNode, getOutgoingEdges, pickParityEdge } from '../core/board';
import { browserSession } from '../core/browserSession';
import type { ClientIntentType } from '../core/authority';
import type { MatchEventValue, MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { MatchPresentationLayer } from '../ui/MatchPresentationLayer';
import type { PresentationEventModel } from '../ui/presentationModel';
import {
  presentationTimingForModel,
  shouldDeferResultOverlay,
} from '../ui/presentationFlowPolicy';
import { PlaytestDemoBoardScene } from './PlaytestDemoBoardScene';

const BOARD = boardJson as BoardDefinition;
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];

type NetworkStateSource = 'host' | 'state' | 'snapshot';
type PlayerVisualRuntime = { token: Phaser.GameObjects.Container };

interface PresentationBoardInternals {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended'; rounds?: number };
  shellOverlay: Array<{ destroy(): void }>;
  visuals: Map<number, PlayerVisualRuntime>;
  turnText: Phaser.GameObjects.Text;
  phaseText: Phaser.GameObjects.Text;
  diceText: Phaser.GameObjects.Text;
  rollButton: Phaser.GameObjects.Rectangle;
  rollButtonText: Phaser.GameObjects.Text;
  handButton: Phaser.GameObjects.Rectangle;
  handButtonText: Phaser.GameObjects.Text;
  logText: Phaser.GameObjects.Text;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
  canControlCurrentPlayer(): boolean;
  currentPlayer(): PlayerState | undefined;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
  queueCpuActionIfNeeded(): void;
  promptNetworkBranch(): Promise<void>;
  refreshHud(): void;
  renderShellOverlay(): void;
  syncVisualsToState(): void;
  syncBgmToMatch(): void;
  handleRoll(): void;
  handleUseCard(): Promise<void>;
  writeLog(message: string): void;
}

interface LegacyToastHook {
  showEventToast(title: string, body: string): void;
}

export class PresentationParityBoardScene extends PlaytestDemoBoardScene {
  private presentation?: MatchPresentationLayer;
  private presentationBlocking = false;
  private lastAutoBranchSignature = '';
  private visualNextEventSeq = 1;
  private compactObjects: Phaser.GameObjects.GameObject[] = [];
  private compactTurnText?: Phaser.GameObjects.Text;
  private compactRoll?: Phaser.GameObjects.Rectangle;
  private compactRollText?: Phaser.GameObjects.Text;
  private compactCard?: Phaser.GameObjects.Rectangle;
  private compactCardText?: Phaser.GameObjects.Text;

  create(): void {
    const legacyToast = this as unknown as LegacyToastHook;
    legacyToast.showEventToast = () => undefined;

    super.create();

    const internals = this as unknown as PresentationBoardInternals;
    this.visualNextEventSeq = internals.match?.nextEventSeq ?? 1;
    this.installBoardFirstHud(internals);

    this.add
      .text(178, 45, 'CITY • MVP 0.1.19 BOARD FLOW', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#202020',
        backgroundColor: '#f4ead7',
        padding: { x: 2, y: 2 },
      })
      .setDepth(931);

    this.add
      .text(1218, 690, 'PLAYTEST 0.1.19 • BOARD FLOW', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#ef4545',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(1, 1)
      .setDepth(930);

    const clearShellOverlay = () => {
      for (const object of internals.shellOverlay) object.destroy();
      internals.shellOverlay = [];
    };

    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);
    internals.renderShellOverlay = () => {
      if (shouldDeferResultOverlay(this.presentationBlocking, internals.shell.status)) {
        clearShellOverlay();
        return;
      }
      originalRenderShellOverlay();
    };

    const originalCanControl = internals.canControlCurrentPlayer.bind(this);
    internals.canControlCurrentPlayer = () => {
      if (this.presentationBlocking) return false;
      return originalCanControl();
    };

    const originalQueueCpuAction = internals.queueCpuActionIfNeeded.bind(this);
    internals.queueCpuActionIfNeeded = () => {
      if (this.presentationBlocking) return;
      originalQueueCpuAction();
    };

    // Keep the currently playing round theme stable while an event/dice/movement
    // presentation is on screen. A round transition may happen only after that
    // presentation queue has fully cleared, so News/Card never steals the BGM.
    const originalSyncBgm = internals.syncBgmToMatch.bind(this);
    internals.syncBgmToMatch = () => {
      if (this.presentationBlocking) return;
      originalSyncBgm();
    };

    // Replace the old straight-line authoritative snap/tween. New move_step events
    // own token movement one board node at a time; non-moving players still snap to
    // their authoritative coordinates on resync.
    internals.syncVisualsToState = () => {
      const freshEvents = internals.match.eventLog.filter((event) => event.seq >= this.visualNextEventSeq);
      this.visualNextEventSeq = internals.match.nextEventSeq;
      const movingActors = new Set(
        freshEvents
          .filter((event) => event.type === 'move_step' && event.actorId !== undefined)
          .map((event) => event.actorId as number),
      );

      for (const player of internals.match.players) {
        if (movingActors.has(player.id)) continue;
        const visual = internals.visuals.get(player.id);
        if (!visual) continue;
        const node = getBoardNode(BOARD, player.nodeId);
        const offset = TOKEN_OFFSETS[player.id] ?? { x: 0, y: 0 };
        this.tweens.killTweensOf(visual.token);
        visual.token.setPosition(node.x + offset.x, node.y + offset.y).setScale(1);
      }
    };

    internals.promptNetworkBranch = async () => {
      if (this.presentationBlocking) return;
      const player = internals.currentPlayer();
      if (!player || internals.match.turn.phase !== 'BRANCH_CHOICE') return;

      const outgoing = getOutgoingEdges(BOARD, player.nodeId);
      if (outgoing.length <= 1) return;
      const roll = internals.match.turn.lastRoll ?? 0;
      const selected = pickParityEdge(outgoing, roll);
      if (!selected) return;

      const signature = [
        internals.match.turn.turnNumber,
        internals.match.turn.revision,
        player.id,
        player.nodeId,
        roll,
      ].join(':');
      if (signature === this.lastAutoBranchSignature) return;
      this.lastAutoBranchSignature = signature;

      const parityLabel = Math.abs(Math.floor(roll)) % 2 === 0 ? 'CHẴN' : 'LẺ';
      internals.writeLog(`🛣️ ${player.name}: ${roll} ${parityLabel} → ${selected.label ?? `${selected.from}→${selected.to}`}`);
      internals.submitIntent('choose_branch', { to: selected.to });
    };

    this.presentation = new MatchPresentationLayer(
      this,
      () => internals.match?.players ?? [],
      {
        timingForModel: (model, revealMs) => presentationTimingForModel(
          model,
          browserSession.current,
          internals.match?.players.length ?? 4,
          revealMs,
        ),
        onMoveStep: (model) => this.animateMoveStep(internals, model),
        onBlockingChange: (blocking) => {
          this.presentationBlocking = blocking;

          if (shouldDeferResultOverlay(blocking, internals.shell.status)) {
            clearShellOverlay();
          } else if (!blocking && internals.shell.status === 'ended') {
            internals.renderShellOverlay();
          }

          internals.refreshHud();
          this.updateCompactHud(internals);

          if (
            !blocking &&
            internals.match?.turn.phase === 'BRANCH_CHOICE' &&
            internals.canControlCurrentPlayer()
          ) {
            void internals.promptNetworkBranch();
          }
        },
        onPresentationStart: () => this.updateCompactHud(internals),
        onPresentationEnd: () => this.updateCompactHud(internals),
      },
    );

    const originalApplyNetworkState = internals.applyNetworkState.bind(this);
    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      const beforeEventSeq = internals.match?.nextEventSeq ?? 1;
      originalApplyNetworkState(state, commandSeq, checksum, source);

      if (source !== 'snapshot') {
        this.presentation?.enqueue(state.eventLog.filter((event) => event.seq >= beforeEventSeq));
      }
      this.updateCompactHud(internals);
    };

    this.updateCompactHud(internals);

    this.events.once('shutdown', () => {
      this.presentation?.destroy();
      this.presentation = undefined;
      this.presentationBlocking = false;
      this.lastAutoBranchSignature = '';
      this.visualNextEventSeq = 1;
      for (const object of this.compactObjects) object.destroy();
      this.compactObjects = [];
    });

    // Ensure gameplay theme is restored if the previous build left the audio
    // controller at menu state before entering this scene.
    bgmController.playRound(1);
  }

  private installBoardFirstHud(internals: PresentationBoardInternals): void {
    // Remove the large permanent center panel from the inherited MVP shell.
    for (const object of [...this.children.list]) {
      if (
        object instanceof Phaser.GameObjects.Rectangle &&
        Math.abs(object.x - 640) < 1 &&
        Math.abs(object.y - 370) < 1 &&
        Math.abs(object.width - 430) < 2 &&
        Math.abs(object.height - 300) < 2
      ) {
        object.destroy();
      }
    }

    internals.turnText.setVisible(false);
    internals.phaseText.setVisible(false);
    internals.diceText.setVisible(false);
    internals.rollButton.disableInteractive().setVisible(false);
    internals.rollButtonText.setVisible(false);
    internals.handButton.disableInteractive().setVisible(false);
    internals.handButtonText.setVisible(false);
    internals.logText.setVisible(false);

    const bar = this.add.rectangle(640, 681, 620, 58, 0xfffbf3, 0.94)
      .setStrokeStyle(3, 0x242424, 0.9)
      .setDepth(620);
    this.compactTurnText = this.add.text(350, 681, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#202020',
      fixedWidth: 205,
      align: 'center',
    }).setOrigin(0.5).setDepth(621);

    this.compactRoll = this.add.rectangle(615, 681, 150, 40, 0xef4545, 1)
      .setStrokeStyle(3, 0x242424, 1)
      .setDepth(621)
      .setInteractive({ useHandCursor: true });
    this.compactRollText = this.add.text(615, 681, 'ĐỔ XÚC XẮC', {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(622);

    this.compactCard = this.add.rectangle(790, 681, 150, 40, 0xb997d6, 1)
      .setStrokeStyle(3, 0x242424, 1)
      .setDepth(621)
      .setInteractive({ useHandCursor: true });
    this.compactCardText = this.add.text(790, 681, 'LÁ BÀI', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5).setDepth(622);

    this.compactRoll.on('pointerdown', () => internals.handleRoll());
    this.compactCard.on('pointerdown', () => void internals.handleUseCard());
    this.compactObjects.push(
      bar,
      this.compactTurnText,
      this.compactRoll,
      this.compactRollText,
      this.compactCard,
      this.compactCardText,
    );
  }

  private updateCompactHud(internals: PresentationBoardInternals): void {
    const player = internals.currentPlayer();
    if (!player || !this.compactTurnText || !this.compactRoll || !this.compactRollText || !this.compactCard || !this.compactCardText) return;

    const playerCount = Math.max(1, internals.match.players.length);
    const round = Math.max(1, Math.floor((internals.match.turn.turnNumber - 1) / playerCount) + 1);
    const rounds = internals.shell.rounds ?? 3;
    const cpu = browserSession.isCpuSeat(player.id);
    this.compactTurnText.setText(`Vòng ${Math.min(round, rounds)}/${rounds}\n${cpu ? '🤖 ' : ''}${player.name}`);

    const canControl = internals.canControlCurrentPlayer();
    const canRoll = canControl && internals.match.turn.phase === 'PRE_ROLL_ACTION' && !this.presentationBlocking;
    const canCard = canRoll && player.handCardIds.length > 0;

    this.compactRoll.setFillStyle(canRoll ? 0xef4545 : 0xb8ada1, 1);
    this.compactRollText.setText(
      this.presentationBlocking
        ? 'ĐANG HIỂN THỊ…'
        : cpu
          ? 'CPU ĐANG CHƠI…'
          : canRoll
            ? 'ĐỔ XÚC XẮC'
            : 'CHỜ LƯỢT…',
    );
    this.compactRollText.setFontSize(canRoll ? 14 : 11);

    this.compactCard.setFillStyle(canCard ? 0xb997d6 : 0xd8d2c7, 1);
    this.compactCardText.setText(`LÁ BÀI ${player.handCardIds.length}/3`);
  }

  private animateMoveStep(
    internals: PresentationBoardInternals,
    model: PresentationEventModel,
  ): Promise<void> {
    const playerId = model.actorId;
    const toNodeId = model.toNodeId;
    if (playerId === undefined || toNodeId === undefined) return Promise.resolve();

    const visual = internals.visuals.get(playerId);
    if (!visual) return Promise.resolve();
    const node = getBoardNode(BOARD, toNodeId);
    const offset = TOKEN_OFFSETS[playerId] ?? { x: 0, y: 0 };
    const targetX = node.x + offset.x;
    const targetY = node.y + offset.y;

    this.tweens.killTweensOf(visual.token);
    return new Promise((resolve) => {
      this.tweens.add({
        targets: visual.token,
        x: targetX,
        y: targetY,
        duration: 230,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: visual.token,
            scaleX: 1.08,
            scaleY: 0.92,
            yoyo: true,
            duration: 65,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              visual.token.setScale(1);
              resolve();
            },
          });
        },
      });
    });
  }
}
