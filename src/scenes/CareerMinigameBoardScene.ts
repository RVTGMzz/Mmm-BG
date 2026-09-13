import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import type { ClientIntentType } from '../core/authority';
import { browserSession } from '../core/browserSession';
import { demoMatchLapProgress } from '../core/demoMatch';
import type { JobDefinition } from '../core/jobs';
import type { MatchEventValue, MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { showJobRollPicker } from '../ui/JobChoicePicker';
import { startMiniGameOverlay } from '../ui/MiniGameOverlay';
import type { PresentationEventModel } from '../ui/presentationModel';
import { DirectDiceBoardScene } from './DirectDiceBoardScene';

const JOBS = jobsJson as JobDefinition[];
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
  finishCurrent(animate?: boolean): void;
};

type PresentationVisualInternals = {
  visualNextEventSeq: number;
};

export class CareerMinigameBoardScene extends DirectDiceBoardScene {
  private jobPickerOpen = false;
  private lastJobOfferSignature = '';
  private forceAuthoritativeTokenSnap = false;

  create(): void {
    super.create();
    this.installStableTokenSync();
    this.installOneLapScoreHud();
    this.installPlayableMiniGame();
    this.updateBuildLabels033();
    this.events.once('shutdown', () => {
      this.jobPickerOpen = false;
      this.lastJobOfferSignature = '';
      this.forceAuthoritativeTokenSnap = false;
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
      const run = startMiniGameOverlay(this, participants.length > 0 ? participants : internals.match.players, model.eventSeq);
      presentation.active = run.root;
      run.done
        .catch(() => undefined)
        .finally(() => {
          if (presentation.currentModel === model) presentation.finishCurrent(false);
        });
    };
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
      await showJobRollPicker(this, player.name, offer);
      internals.submitIntent('choose_job', {});
    } finally {
      this.jobPickerOpen = false;
    }
  }

  private updateBuildLabels033(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.31 JOB DICE + MINI GAMES')) {
        object.setText('CITY • MVP 0.1.33 ONE-LAP SCORE + TOKEN SYNC');
      } else if (object.text.includes('PLAYTEST 0.1.31 • JOB SALARY + PARTY RULES')) {
        object.setText('PLAYTEST 0.1.33 • 1 LAP THEN SCORE');
      }
    }
  }
}