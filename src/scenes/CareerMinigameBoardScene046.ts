import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import { browserSession } from '../core/browserSession';
import type { JobDefinition } from '../core/jobs';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { createJobRollPicker, type JobRollPickerHandle } from '../ui/JobChoicePicker';
import { CareerMinigameBoardScene045 } from './CareerMinigameBoardScene045';

const JOBS = jobsJson as JobDefinition[];

type NetworkStateSource = 'host' | 'state' | 'snapshot';

type JobHubInternals = {
  match: MatchState;
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
  presentation?: {
    active?: Phaser.GameObjects.Container;
    isBlocking(): boolean;
  };
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
};

/**
 * 0.1.46 Job Hub multiplayer presentation polish.
 *
 * The controlling peer still submits the existing choose_job intent. Host authority
 * remains the only place that consumes gameplay RNG and resolves 1-2=A, 3-4=B,
 * 5-6=C. Non-controlling network peers now keep the same three Job offers visible
 * while they wait, then everyone consumes the authoritative job_dice_roll and
 * job_selected events already carried by MatchState.
 */
export class CareerMinigameBoardScene046 extends CareerMinigameBoardScene045 {
  private jobSpectatorPicker?: JobRollPickerHandle;
  private jobSpectatorSignature = '';

  create(): void {
    super.create();
    this.installJobHubSpectatorCleanup();
    this.updateBuildLabels046();
    this.events.once('shutdown', () => this.closeJobSpectator());
  }

  update(): void {
    super.update();
    this.maybeShowJobHubSpectator();
  }

  private installJobHubSpectatorCleanup(): void {
    const internals = this as unknown as JobHubInternals;
    const originalApplyNetworkState = internals.applyNetworkState.bind(this);

    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      originalApplyNetworkState(state, commandSeq, checksum, source);

      if (state.turn.phase !== 'JOB_CHOICE') {
        this.closeJobSpectator();
        return;
      }

      const offerIds = state.pendingJobOfferIds ?? [];
      const nextSignature = `${state.turn.turnNumber}:${state.turn.revision}:${state.pendingJobPlayerId ?? -1}:${offerIds.join(',')}`;
      if (this.jobSpectatorSignature && this.jobSpectatorSignature !== nextSignature) {
        this.closeJobSpectator();
      }
    };
  }

  private maybeShowJobHubSpectator(): void {
    if (browserSession.current.mode === 'solo' || this.jobSpectatorPicker?.root.active) return;

    const internals = this as unknown as JobHubInternals;
    const match = internals.match;
    const player = internals.currentPlayer();
    if (!match || !player || match.turn.phase !== 'JOB_CHOICE') return;
    if (internals.presentation?.isBlocking() || internals.presentation?.active?.active) return;

    // The controlling tab already receives the interactive Job picker from the
    // validated base scene. 0.1.46 only fills the multiplayer spectator gap.
    if (internals.canControlCurrentPlayer()) return;

    const offerIds = match.pendingJobOfferIds ?? [];
    if (offerIds.length !== 3 || match.pendingJobPlayerId !== player.id) return;
    const offer = offerIds
      .map((id) => JOBS.find((job) => job.id === id))
      .filter((job): job is JobDefinition => Boolean(job));
    if (offer.length !== 3) return;

    this.jobSpectatorSignature = `${match.turn.turnNumber}:${match.turn.revision}:${player.id}:${offerIds.join(',')}`;
    const waitingLabel = browserSession.current.mode === 'host'
      ? `⏳ CHỜ ${player.name} ĐỔ JOB TRÊN TAB CỦA HỌ...`
      : `⏳ ${player.name} ĐANG ĐỔ XÚC XẮC JOB...`;

    this.jobSpectatorPicker = createJobRollPicker(this, player.name, offer, {
      canRoll: false,
      waitingLabel,
    });
  }

  private closeJobSpectator(): void {
    this.jobSpectatorPicker?.close();
    this.jobSpectatorPicker = undefined;
    this.jobSpectatorSignature = '';
  }

  private updateBuildLabels046(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.45 REMOTE ROLL FOR ORDER')) {
        object.setText('CITY • MVP 0.1.46 JOB HUB MULTIPLAYER POLISH');
      } else if (object.text.includes('PLAYTEST 0.1.45 • HOST-AUTH REMOTE D6')) {
        object.setText('PLAYTEST 0.1.46 • REMOTE JOB DICE');
      }
    }
  }
}
