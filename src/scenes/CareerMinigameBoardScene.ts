import Phaser from 'phaser';
import { bgmController, type BgmTrackId } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import boardJson from '../content/city/board_city_mvp.json';
import jobsJson from '../content/core/jobs_mvp.json';
import type { ClientIntentType } from '../core/authority';
import { getBoardNode } from '../core/board';
import { browserSession } from '../core/browserSession';
import { demoMatchLapProgress } from '../core/demoMatch';
import type { JobDefinition } from '../core/jobs';
import type { MatchEventValue, MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { showJobRollPicker } from '../ui/JobChoicePicker';
import { startMiniGameOverlay } from '../ui/MiniGameOverlay';
import type { PresentationEventModel } from '../ui/presentationModel';
import { DirectDiceBoardScene } from './DirectDiceBoardScene';

const BOARD = boardJson as BoardDefinition;
const JOBS = jobsJson as JobDefinition[];
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];

type NetworkStateSource = 'host' | 'state' | 'snapshot';
type PlayerVisualRuntime = { token: Phaser.GameObjects.Container };

type CareerInternals = {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay: Phaser.GameObjects.GameObject[];
  visuals: Map<number, PlayerVisualRuntime>;
  compactTurnText?: Phaser.GameObjects.Text;
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
  syncVisualsToState(): void;
  updateCompactHud(arg: unknown): void;
  renderShellOverlay(): void;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
};

type PresentationRuntime = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
  showLanding(model: PresentationEventModel): void;
  runMoveStep(model: PresentationEventModel): void;
  finishCurrent(animate?: boolean): void;
};

type PresentationVisualInternals = {
  visualNextEventSeq: number;
};

export class CareerMinigameBoardScene extends DirectDiceBoardScene {
  private jobPickerOpen = false;
  private lastJobOfferSignature = '';
  private forceAuthoritativeTokenSnap = false;
  private lapBanner?: Phaser.GameObjects.Container;
  private victoryPlayed = false;

  create(): void {
    super.create();
    this.installStableTokenSync();
    this.installStepSfx();
    this.installLapCompletionFeedback();
    this.installOneLapScoreHud();
    this.installPlayableMiniGame();
    this.updateBuildLabels036();
    this.events.once('shutdown', () => {
      this.jobPickerOpen = false;
      this.lastJobOfferSignature = '';
      this.forceAuthoritativeTokenSnap = false;
      this.victoryPlayed = false;
      this.lapBanner?.destroy();
      this.lapBanner = undefined;
    });
  }

  update(): void {
    super.update();
    void this.maybePromptJobRoll();
  }

  /**
   * Runtime fix for the occasional "snap backwards then fly forward" token bug.
   *
   * Normal host/state messages are allowed to mutate authoritative state, but token
   * coordinates are now owned exclusively by queued move_step presentation events.
   * This prevents Card/News/tile state packets from killing an in-flight movement
   * tween or snapping a token to an intermediate authoritative position.
   *
   * Snapshot resync and rematch command #0 still hard-snap to authoritative nodes.
   */
  private installStableTokenSync(): void {
    const internals = this as unknown as CareerInternals;
    const visualInternals = this as unknown as PresentationVisualInternals;
    const originalSyncVisuals = internals.syncVisualsToState.bind(this);
    const originalApplyNetworkState = internals.applyNetworkState.bind(this);

    internals.syncVisualsToState = () => {
      if (!this.forceAuthoritativeTokenSnap) return;
      originalSyncVisuals();
    };

    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      this.forceAuthoritativeTokenSnap = source === 'snapshot' || commandSeq === 0;
      if (this.forceAuthoritativeTokenSnap) {
        // Do not let old move_step events make snapshot sync skip an actor.
        visualInternals.visualNextEventSeq = state.nextEventSeq;
      }
      try {
        originalApplyNetworkState(state, commandSeq, checksum, source);
      } finally {
        this.forceAuthoritativeTokenSnap = false;
      }
    };
  }

  /** One supplied footstep cue for every queued authoritative move_step. */
  private installStepSfx(): void {
    const presentation = (this as unknown as { presentation?: PresentationRuntime }).presentation;
    if (!presentation) return;
    const originalRunMoveStep = presentation.runMoveStep.bind(presentation);
    presentation.runMoveStep = (model: PresentationEventModel) => {
      sfxController.play('step');
      originalRunMoveStep(model);
    };
  }

  /** Presentation-only celebration when a player completes their required first lap. */
  private installLapCompletionFeedback(): void {
    const internals = this as unknown as CareerInternals;
    const originalApplyNetworkState = internals.applyNetworkState.bind(this);

    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      const newlyCompleted = source === 'snapshot'
        ? []
        : state.players.filter((nextPlayer) => {
            const previous = internals.match.players.find((player) => player.id === nextPlayer.id);
            return (previous?.lapsCompleted ?? 0) < 1 && (nextPlayer.lapsCompleted ?? 0) >= 1;
          });

      originalApplyNetworkState(state, commandSeq, checksum, source);

      if (newlyCompleted.length === 0) return;
      const progress = demoMatchLapProgress(internals.match);
      for (const player of newlyCompleted) {
        this.showLapCompletionBanner(player, progress.completedPlayers, progress.totalPlayers);
      }
    };
  }

  private showLapCompletionBanner(player: PlayerState, completedPlayers: number, totalPlayers: number): void {
    this.lapBanner?.destroy();

    const container = this.add.container(640, 90).setDepth(952).setAlpha(0);
    this.lapBanner = container;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-252, -34, 504, 72, 18);
    shadow.setPosition(0, 5);

    const panel = this.add.graphics();
    panel.fillStyle(0xfffbf3, 0.98);
    panel.fillRoundedRect(-248, -36, 496, 70, 17);
    panel.lineStyle(4, 0xffd34d, 1);
    panel.strokeRoundedRect(-248, -36, 496, 70, 17);

    const title = this.add.text(0, -17, `🏁 ${player.name} HOÀN THÀNH 1 VÒNG!`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);

    const detail = this.add.text(
      0,
      11,
      `${completedPlayers}/${totalPlayers} người đã đủ vòng • chốt B$ khi cả bàn hoàn thành`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#6d655b',
      },
    ).setOrigin(0.5);

    container.add([shadow, panel, title, detail]);

    this.tweens.add({
      targets: container,
      alpha: 1,
      y: 108,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 180,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 110, ease: 'Sine.easeOut' });
        this.time.delayedCall(1700, () => {
          if (!container.active) return;
          this.tweens.add({
            targets: container,
            alpha: 0,
            y: 96,
            duration: 220,
            ease: 'Sine.easeIn',
            onComplete: () => {
              if (this.lapBanner === container) this.lapBanner = undefined;
              container.destroy();
            },
          });
        });
      },
    });
  }

  private installOneLapScoreHud(): void {
    const internals = this as unknown as CareerInternals;
    const originalUpdateCompactHud = internals.updateCompactHud.bind(this);
    internals.updateCompactHud = (arg: unknown) => {
      originalUpdateCompactHud(arg);
      this.refreshLapProgressCopy(internals);
    };

    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);
    internals.renderShellOverlay = () => {
      originalRenderShellOverlay();
      this.refreshShellLapCopy(internals);

      // PresentationParity defers result overlay until its queue is empty. Only play
      // victory once the actual result overlay exists, never early on shell state alone.
      const resultVisible = internals.shell.status === 'ended' && internals.shellOverlay.length > 0;
      if (resultVisible && !this.victoryPlayed) {
        this.victoryPlayed = true;
        sfxController.play('victory');
      } else if (internals.shell.status !== 'ended') {
        this.victoryPlayed = false;
      }
    };

    this.refreshLapProgressCopy(internals);
    this.refreshStaticLapCopy();
    this.refreshShellLapCopy(internals);
  }

  private refreshLapProgressCopy(internals: CareerInternals): void {
    const text = internals.compactTurnText;
    const current = internals.currentPlayer();
    if (!text || !current) return;
    const progress = demoMatchLapProgress(internals.match);
    const lines = text.text.split('\n');
    const secondLine = lines[1] ?? current.name;
    text.setText(`HOÀN THÀNH 1 VÒNG • ${progress.completedPlayers}/${progress.totalPlayers}\n${secondLine}`);
  }

  private refreshStaticLapCopy(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('MATCH SHELL • 3 VÒNG')) {
        object.setText('MATCH • CẢ 4 NGƯỜI HOÀN THÀNH 1 VÒNG → CHỐT B$');
      } else if (object.text.includes('demo 3 vòng')) {
        object.setText(object.text.replace('demo 3 vòng', 'đủ 1 vòng/người'));
      }
    }
  }

  private refreshShellLapCopy(internals: CareerInternals): void {
    const progress = demoMatchLapProgress(internals.match);
    for (const object of internals.shellOverlay) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('Luật demo tạm:')) {
        object.setText(
          'Luật playtest: mỗi người phải hoàn thành 1 vòng quanh bàn.\n' +
          'Chỉ khi CẢ 4 người đã đi qua READY ít nhất 1 lần mới chốt bảng B$.\n' +
          'Sau đó ai có nhiều B$ nhất thắng; bằng tiền thì đồng hạng.',
        );
      } else if (object.text.includes('Demo tạm kết thúc sau')) {
        object.setText(
          `Đã ${progress.completedPlayers}/${progress.totalPlayers} người hoàn thành 1 vòng • chốt B$ khi đủ cả bàn`,
        );
      }
    }
  }

  private installPlayableMiniGame(): void {
    const presentation = (this as unknown as { presentation?: PresentationRuntime }).presentation;
    if (!presentation) return;
    const originalShowLanding = presentation.showLanding.bind(presentation);

    presentation.showLanding = (model: PresentationEventModel) => {
      if (model.tileType !== 'minigame') {
        originalShowLanding(model);
        return;
      }

      const internals = this as unknown as CareerInternals;
      const affected = new Set(model.affectedPlayerIds);
      const participants = internals.match.players.filter((player) => affected.size === 0 || affected.has(player.id));
      const previousTrack: BgmTrackId = bgmController.getState().currentTrackId ?? 'city_bubble';
      bgmController.playMiniGame();
      const run = startMiniGameOverlay(this, participants.length > 0 ? participants : internals.match.players, model.eventSeq);
      presentation.active = run.root;
      run.done
        .catch(() => undefined)
        .finally(() => {
          bgmController.playTrack(previousTrack === 'mini_game' ? 'city_bubble' : previousTrack);
          if (presentation.currentModel === model) presentation.finishCurrent(false);
        });
    };
  }

  /**
   * Human Job choice pauses the turn on JOB_CHOICE. At that safe idle point there is
   * no movement presentation left to preserve, so explicitly reconcile the human
   * token to the authoritative Job node. This prevents a stale visual from remaining
   * one node behind until the player's next turn.
   */
  private reconcileJobToken(internals: CareerInternals, playerId: number): void {
    const player = internals.match.players.find((candidate) => candidate.id === playerId);
    const visual = internals.visuals.get(playerId);
    if (!player || !visual) return;

    const node = getBoardNode(BOARD, player.nodeId);
    const offset = TOKEN_OFFSETS[playerId] ?? { x: 0, y: 0 };
    const targetX = node.x + offset.x;
    const targetY = node.y + offset.y;
    if (Math.hypot(visual.token.x - targetX, visual.token.y - targetY) < 1) return;

    this.tweens.killTweensOf(visual.token);
    visual.token.setPosition(targetX, targetY).setScale(1);
  }

  private async maybePromptJobRoll(): Promise<void> {
    if (this.jobPickerOpen) return;
    const internals = this as unknown as CareerInternals;
    const match = internals.match;
    const player = internals.currentPlayer();
    if (!match || !player) return;
    if (match.turn.phase !== 'JOB_CHOICE') return;
    if (!internals.canControlCurrentPlayer() || browserSession.isCpuSeat(player.id)) return;

    const offerIds = match.pendingJobOfferIds ?? [];
    if (offerIds.length !== 3 || match.pendingJobPlayerId !== player.id) return;
    const signature = `${match.turn.turnNumber}:${match.turn.revision}:${player.id}:${offerIds.join(',')}`;
    if (signature === this.lastJobOfferSignature) return;

    const offer = offerIds
      .map((id) => JOBS.find((job) => job.id === id))
      .filter((job): job is JobDefinition => Boolean(job));
    if (offer.length !== 3) return;

    this.jobPickerOpen = true;
    this.lastJobOfferSignature = signature;
    try {
      // showJobRollPicker creates its backdrop synchronously; reconcile behind it so
      // the player never watches a stale token fly around the board.
      const picker = showJobRollPicker(this, player.name, offer);
      this.reconcileJobToken(internals, player.id);
      await picker;
      this.reconcileJobToken(internals, player.id);
      internals.submitIntent('choose_job', {});
    } finally {
      this.jobPickerOpen = false;
    }
  }

  private updateBuildLabels036(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (
        object.text.includes('CITY • MVP 0.1.30 DIRECT TURN DICE') ||
        object.text.includes('CITY • MVP 0.1.31 JOB DICE + MINI GAMES') ||
        object.text.includes('CITY • MVP 0.1.33 ONE-LAP SCORE + TOKEN SYNC') ||
        object.text.includes('CITY • MVP 0.1.34 LAP CLARITY + READY CELEBRATION') ||
        object.text.includes('CITY • MVP 0.1.35 JOB TOKEN + RPS DUEL')
      ) {
        object.setText('CITY • MVP 0.1.36 EVENT AUDIO + ORDER DICE');
      } else if (
        object.text.includes('PLAYTEST 0.1.30 • DIRECT DICE') ||
        object.text.includes('PLAYTEST 0.1.31 • JOB SALARY + PARTY RULES') ||
        object.text.includes('PLAYTEST 0.1.33 • 1 LAP THEN SCORE') ||
        object.text.includes('PLAYTEST 0.1.34 • ONE-LAP CLARITY') ||
        object.text.includes('PLAYTEST 0.1.35 • JOB TOKEN + RPS DUEL')
      ) {
        object.setText('PLAYTEST 0.1.36 • EVENT AUDIO + MINI BGM');
      }
    }
  }
}
