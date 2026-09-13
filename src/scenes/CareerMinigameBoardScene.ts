import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import type { ClientIntentType } from '../core/authority';
import { browserSession } from '../core/browserSession';
import type { JobDefinition } from '../core/jobs';
import type { MatchEventValue, MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { showJobChoicePicker } from '../ui/JobChoicePicker';
import { startMiniGameOverlay } from '../ui/MiniGameOverlay';
import type { PresentationEventModel } from '../ui/presentationModel';
import { DirectDiceBoardScene } from './DirectDiceBoardScene';

const JOBS = jobsJson as JobDefinition[];

type CareerInternals = {
  match: MatchState;
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
};

type PresentationRuntime = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
  showLanding(model: PresentationEventModel): void;
  finishCurrent(animate?: boolean): void;
};

export class CareerMinigameBoardScene extends DirectDiceBoardScene {
  private jobPickerOpen = false;
  private lastJobOfferSignature = '';

  create(): void {
    super.create();
    this.installPlayableMiniGame();
    this.updateBuildLabels031();
    this.events.once('shutdown', () => {
      this.jobPickerOpen = false;
      this.lastJobOfferSignature = '';
    });
  }

  update(): void {
    super.update();
    void this.maybePromptJobChoice();
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

  private async maybePromptJobChoice(): Promise<void> {
    if (this.jobPickerOpen) return;
    const internals = this as unknown as CareerInternals;
    const match = internals.match;
    const player = internals.currentPlayer();
    if (!match || !player) return;
    if (match.turn.phase !== 'JOB_CHOICE') return;
    if (!internals.canControlCurrentPlayer() || browserSession.isCpuSeat(player.id)) return;

    const offerIds = match.pendingJobOfferIds ?? [];
    if (offerIds.length === 0 || match.pendingJobPlayerId !== player.id) return;
    const signature = `${match.turn.turnNumber}:${match.turn.revision}:${player.id}:${offerIds.join(',')}`;
    if (signature === this.lastJobOfferSignature) return;

    const offer = offerIds
      .map((id) => JOBS.find((job) => job.id === id))
      .filter((job): job is JobDefinition => Boolean(job));
    if (offer.length === 0) return;

    this.jobPickerOpen = true;
    this.lastJobOfferSignature = signature;
    try {
      const jobId = await showJobChoicePicker(this, player.name, offer);
      if (!jobId) {
        this.lastJobOfferSignature = '';
        return;
      }
      internals.submitIntent('choose_job', { jobId });
    } finally {
      this.jobPickerOpen = false;
    }
  }

  private updateBuildLabels031(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.30 DIRECT TURN DICE')) {
        object.setText('CITY • MVP 0.1.31 JOB HUB + MINI GAMES');
      } else if (object.text.includes('PLAYTEST 0.1.30 • DIRECT DICE')) {
        object.setText('PLAYTEST 0.1.31 • CAREER + MINI GAMES');
      }
    }
  }
}
