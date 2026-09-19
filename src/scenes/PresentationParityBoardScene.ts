import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import boardJson from '../content/city/board_city_mvp.json';
import { getBoardNode, getOutgoingEdges, pickParityEdge } from '../core/board';
import { browserSession } from '../core/browserSession';
import type { ClientIntentType } from '../core/authority';
import type { MatchEventValue, MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { clampDiceFace, compactPlayerStatus, movementStepDurationMs } from '../ui/boardFeelPolicy';
import { MatchPresentationLayer } from '../ui/MatchPresentationLayer';
import type { PresentationEventModel } from '../ui/presentationModel';
import {
  presentationTimingForModel,
  shouldDeferResultOverlay,
} from '../ui/presentationFlowPolicy';
import { routeFeedbackCopy } from '../ui/routeFeedback';
import { PlaytestDemoBoardScene } from './PlaytestDemoBoardScene';

const BOARD = boardJson as BoardDefinition;
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];

const DICE_PIP_MASKS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

type NetworkStateSource = 'host' | 'state' | 'snapshot';
type PlayerVisualRuntime = { token: Phaser.GameObjects.Container };

type PresentationLayerRuntime = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
  showDiceRoll(model: PresentationEventModel): void;
  finishCurrent(animate?: boolean): void;
};

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
  scoreText: Phaser.GameObjects.Text;
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
  private compactScoreText?: Phaser.GameObjects.Text;
  private compactRoll?: Phaser.GameObjects.Rectangle;
  private compactRollText?: Phaser.GameObjects.Text;
  private compactCard?: Phaser.GameObjects.Rectangle;
  private compactCardText?: Phaser.GameObjects.Text;
  private readonly tokenHalos = new Map<number, Phaser.GameObjects.Arc>();
  private activeHaloTween?: Phaser.Tweens.Tween;
  private routeBanner?: Phaser.GameObjects.Container;

  create(): void {
    const legacyToast = this as unknown as LegacyToastHook;
    legacyToast.showEventToast = () => undefined;

    super.create();

    const internals = this as unknown as PresentationBoardInternals;
    this.visualNextEventSeq = internals.match?.nextEventSeq ?? 1;
    this.installBoardFirstHud(internals);
    this.installTurnHalos(internals);

    this.add
      .text(178, 45, 'CITY • MVP 0.1.23 REACTION + ROUTE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#202020',
        backgroundColor: '#f4ead7',
        padding: { x: 2, y: 2 },
      })
      .setDepth(931);

    this.add
      .text(1218, 690, 'PLAYTEST 0.1.23 • REACTION + ROUTE', {
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

    const originalSyncBgm = internals.syncBgmToMatch.bind(this);
    internals.syncBgmToMatch = () => {
      if (this.presentationBlocking) return;
      originalSyncBgm();
    };

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
      const routeLabel = selected.label ?? `${selected.from}→${selected.to}`;
      internals.writeLog(`🛣️ ${player.name}: ${roll} ${parityLabel} → ${routeLabel}`);
      this.showRouteChoice(player.name, roll, routeLabel);
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
    this.installGraphicalDiceOverride(this.presentation);

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
      this.activeHaloTween?.stop();
      this.activeHaloTween = undefined;
      this.routeBanner?.destroy();
      this.routeBanner = undefined;
      for (const halo of this.tokenHalos.values()) halo.destroy();
      this.tokenHalos.clear();
      for (const object of this.compactObjects) object.destroy();
      this.compactObjects = [];
    });

    bgmController.playRound(1);
  }

  private installBoardFirstHud(internals: PresentationBoardInternals): void {
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
    internals.scoreText.setVisible(false);
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

    this.compactScoreText = this.add.text(1018, 28, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#2d2925',
      backgroundColor: '#fffaf0',
      padding: { x: 9, y: 7 },
      lineSpacing: 4,
      fixedWidth: 220,
    }).setDepth(619);

    this.compactRoll.on('pointerdown', () => internals.handleRoll());
    this.compactCard.on('pointerdown', () => void internals.handleUseCard());
    this.compactObjects.push(
      bar,
      this.compactTurnText,
      this.compactRoll,
      this.compactRollText,
      this.compactCard,
      this.compactCardText,
      this.compactScoreText,
    );
  }

  private installTurnHalos(internals: PresentationBoardInternals): void {
    for (const [playerId, visual] of internals.visuals) {
      const halo = this.add.circle(0, 0, 32, 0xffd34d, 0.04)
        .setStrokeStyle(3, 0xffd34d, 0.92)
        .setVisible(false)
        .setAlpha(0.35);
      visual.token.addAt(halo, 0);
      this.tokenHalos.set(playerId, halo);
    }
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

    if (this.compactScoreText) {
      this.compactScoreText.setText(
        internals.match.players
          .map((entry) => compactPlayerStatus(entry, player.id, browserSession.isCpuSeat(entry.id)))
          .join('\n'),
      );
    }
    this.updateActiveTokenHalo(player.id);
  }

  private updateActiveTokenHalo(currentPlayerId: number): void {
    this.activeHaloTween?.stop();
    this.activeHaloTween = undefined;

    for (const [playerId, halo] of this.tokenHalos) {
      halo.setVisible(playerId === currentPlayerId).setAlpha(playerId === currentPlayerId ? 0.34 : 0.2).setScale(1);
    }

    const active = this.tokenHalos.get(currentPlayerId);
    if (!active) return;
    this.activeHaloTween = this.tweens.add({
      targets: active,
      alpha: 0.9,
      scaleX: 1.13,
      scaleY: 1.13,
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private showRouteChoice(playerName: string, roll: number, routeLabel?: string): void {
    this.routeBanner?.destroy();
    const copy = routeFeedbackCopy(roll, routeLabel);
    const accent = copy.parityLabel === 'CHẴN' ? 0x795796 : 0xef4545;
    const container = this.add.container(640, 104).setDepth(945).setAlpha(0).setY(88);
    this.routeBanner = container;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-214, -34, 428, 72, 17);
    shadow.setPosition(0, 5);
    const panel = this.add.graphics();
    panel.fillStyle(0xfffbf3, 0.97);
    panel.fillRoundedRect(-210, -36, 420, 70, 16);
    panel.lineStyle(3, accent, 0.95);
    panel.strokeRoundedRect(-210, -36, 420, 70, 16);
    const icon = this.add.text(-176, -1, copy.icon, {
      fontFamily: 'Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const title = this.add.text(-145, -22, `${copy.title} • ${playerName}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#202020',
    });
    const detail = this.add.text(-145, 4, copy.detail, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#6d655b',
    });
    container.add([shadow, panel, icon, title, detail]);

    this.tweens.add({ targets: container, alpha: 1, y: 104, duration: 150, ease: 'Back.easeOut' });
    this.time.delayedCall(1050, () => {
      if (!container.active) return;
      this.tweens.add({
        targets: container,
        alpha: 0,
        y: 92,
        duration: 180,
        ease: 'Sine.easeIn',
        onComplete: () => {
          if (this.routeBanner === container) this.routeBanner = undefined;
          container.destroy();
        },
      });
    });
  }

  private installGraphicalDiceOverride(layer: MatchPresentationLayer): void {
    const runtime = layer as unknown as PresentationLayerRuntime;
    runtime.showDiceRoll = (model: PresentationEventModel) => {
      const result = clampDiceFace(model.roll ?? 1);
      const container = this.add.container(640, 338).setDepth(920).setAlpha(0).setScale(0.68);
      runtime.active = container;

      const glow = this.add.circle(0, 0, 82, 0xffd34d, 0.11);
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.22);
      shadow.fillRoundedRect(-53, -49, 106, 106, 23);
      shadow.setPosition(0, 8);
      const die = this.add.graphics();
      die.fillStyle(0xfffbf3, 1);
      die.fillRoundedRect(-53, -53, 106, 106, 23);
      die.lineStyle(5, 0x24211d, 1);
      die.strokeRoundedRect(-53, -53, 106, 106, 23);

      const pipPositions = [-26, 0, 26].flatMap((y) => [-26, 0, 26].map((x) => ({ x, y })));
      const pips = pipPositions.map((position) =>
        this.add.circle(position.x, position.y, 7, 0x24211d, 1).setVisible(false),
      );
      const label = this.add.text(0, 86, `${model.actorName} đang đổ...`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#202020',
        backgroundColor: '#fffaf0',
        padding: { x: 11, y: 5 },
      }).setOrigin(0.5);

      const renderFace = (face: number) => {
        const visible = new Set(DICE_PIP_MASKS[clampDiceFace(face)] ?? DICE_PIP_MASKS[1]);
        pips.forEach((pip, index) => pip.setVisible(visible.has(index)));
      };

      container.add([glow, shadow, die, ...pips, label]);
      renderFace(result === 6 ? 2 : result + 1);
      sfxController.play('dice_roll');

      this.tweens.add({
        targets: container,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Back.easeOut',
      });

      for (let index = 0; index < 6; index += 1) {
        this.time.delayedCall(75 + index * 72, () => {
          if (!container.active || runtime.currentModel !== model) return;
          renderFace(((result + index * 2 + 1) % 6) + 1);
          container.setAngle(index % 2 === 0 ? -8 : 8);
        });
      }

      this.time.delayedCall(555, () => {
        if (!container.active || runtime.currentModel !== model) return;
        renderFace(result);
        container.setAngle(0).setScale(1.1);
        label.setText(model.actorName);
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 170, ease: 'Back.easeOut' });
      });

      this.time.delayedCall(Math.max(860, model.holdMs), () => {
        if (runtime.currentModel === model) runtime.finishCurrent(false);
      });
    };
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
    const from = model.fromNodeId === undefined ? undefined : getBoardNode(BOARD, model.fromNodeId);
    const offset = TOKEN_OFFSETS[playerId] ?? { x: 0, y: 0 };
    const targetX = node.x + offset.x;
    const targetY = node.y + offset.y;
    const distance = from ? Math.hypot(node.x - from.x, node.y - from.y) : Math.hypot(targetX - visual.token.x, targetY - visual.token.y);
    const duration = movementStepDurationMs(distance);

    this.tweens.killTweensOf(visual.token);
    return new Promise((resolve) => {
      this.tweens.add({
        targets: visual.token,
        x: targetX,
        y: targetY,
        duration,
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
