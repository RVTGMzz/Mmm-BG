import Phaser from 'phaser';
import { bgmController, type BgmTrackId } from '../audio/bgmController';
import boardJson from '../content/city/board_city_mvp.json';
import { getBoardNode } from '../core/board';
import type { MatchState } from '../core/matchState';
import { MINI_GAME_SLOTS_059 } from '../core/miniGameSlots059';
import type { BoardDefinition, PlayerState } from '../core/types';
import { startMiniGameOverlay } from '../ui/MiniGameOverlay';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene058 } from './CareerMinigameBoardScene058';

const BOARD = boardJson as BoardDefinition;
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];

type NetworkStateSource = 'host' | 'state' | 'snapshot';
type PlayerVisualRuntime = { token: Phaser.GameObjects.Container };

type DepthInternals059 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime>;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
};

type PresentationRuntime059 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
  showLanding(model: PresentationEventModel): void;
  finishCurrent(animate?: boolean): void;
};

/**
 * 0.1.59 stays presentation-only at the scene layer.
 *
 * Gameplay state remains owned by HostAuthority/replay. This wrapper gives each of
 * the five canonical Mini Game spaces its own arena identity/reward profile and
 * visually reconciles the real criminal-Job arrest introduced in jobs.ts.
 */
export class CareerMinigameBoardScene059 extends CareerMinigameBoardScene058 {
  create(): void {
    super.create();
    this.installFiveArenaMiniGames();
    this.installJobArrestReconciliation();
    this.drawArenaIdentityBadges();
  }

  private installFiveArenaMiniGames(): void {
    const presentation = (this as unknown as { presentation?: PresentationRuntime059 }).presentation;
    if (!presentation) return;
    const originalShowLanding = presentation.showLanding.bind(presentation);

    presentation.showLanding = (model: PresentationEventModel) => {
      if (model.tileType !== 'minigame') {
        originalShowLanding(model);
        return;
      }

      const internals = this as unknown as DepthInternals059;
      const actor = internals.match.players.find((player) => player.id === model.actorId);
      const sourceNode = actor ? getBoardNode(BOARD, actor.nodeId) : undefined;
      const contentId = sourceNode?.feature === 'minigame'
        ? sourceNode.contentId
        : 'MINIGAME_SLOT_01';
      const affected = new Set(model.affectedPlayerIds);
      const participants = internals.match.players.filter((player) => affected.size === 0 || affected.has(player.id));
      const previousTrack: BgmTrackId = bgmController.getState().currentTrackId ?? 'city_bubble';

      bgmController.playMiniGame();
      const run = startMiniGameOverlay(
        this,
        participants.length > 0 ? participants : internals.match.players,
        model.eventSeq,
        contentId,
      );
      presentation.active = run.root;
      run.done
        .catch(() => undefined)
        .finally(() => {
          bgmController.playTrack(previousTrack);
          if (presentation.currentModel === model) presentation.finishCurrent(false);
        });
    };
  }

  private installJobArrestReconciliation(): void {
    const internals = this as unknown as DepthInternals059;
    const originalApplyNetworkState = internals.applyNetworkState.bind(this);

    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      const previousEventSeq = internals.match.nextEventSeq;
      const previousPlayers = new Map(
        internals.match.players.map((player) => [player.id, {
          nodeId: player.nodeId,
          specialHold: player.specialHold,
          jobId: player.jobId,
        }]),
      );
      const newEvents = state.eventLog.filter((event) => event.seq >= previousEventSeq);
      const arrestEvent = newEvents.find(
        (event) => event.type === 'job_progress' && String(event.data.outcome ?? '') === 'jailed',
      );
      const movementCount = newEvents.filter((event) => event.type === 'move_step').length;

      originalApplyNetworkState(state, commandSeq, checksum, source);

      if (source === 'snapshot' || !arrestEvent) return;
      const arrested = state.players.find((player) => {
        const previous = previousPlayers.get(player.id);
        return Boolean(
          previous &&
          previous.jobId &&
          !player.jobId &&
          player.specialHold === 'jail' &&
          player.nodeId === 100 &&
          (previous.nodeId !== player.nodeId || previous.specialHold !== player.specialHold),
        );
      });
      if (!arrested) return;

      // The arrest happens after landing on Job Hub in the same command packet. Wait
      // until the queued landing movement has visually completed, then move to Jail.
      const delayMs = Math.min(1850, 420 + movementCount * 245);
      this.time.delayedCall(delayMs, () => this.animateArrestToJail(internals, arrested));
    };
  }

  private animateArrestToJail(internals: DepthInternals059, snapshotPlayer: PlayerState): void {
    const current = internals.match.players.find((player) => player.id === snapshotPlayer.id);
    const visual = internals.visuals.get(snapshotPlayer.id);
    if (!current || !visual) return;
    if (current.nodeId !== 100 || current.specialHold !== 'jail' || current.jobId) return;

    const destination = getBoardNode(BOARD, 100);
    const offset = TOKEN_OFFSETS[current.id] ?? { x: 0, y: 0 };
    this.tweens.killTweensOf(visual.token);
    this.tweens.add({
      targets: visual.token,
      x: destination.x + offset.x,
      y: destination.y + offset.y,
      duration: 560,
      ease: 'Cubic.easeInOut',
    });
  }

  private drawArenaIdentityBadges(): void {
    for (const slot of MINI_GAME_SLOTS_059) {
      const node = getBoardNode(BOARD, slot.nodeId);
      this.add.text(node.x, node.y + 42, `${slot.icon} ${slot.identity}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#4f4740',
        backgroundColor: '#fffaf0',
        padding: { x: 3, y: 1 },
      }).setOrigin(0.5).setDepth(5);
    }
  }
}
