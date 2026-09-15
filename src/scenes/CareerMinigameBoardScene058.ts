import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import { getBoardNode } from '../core/board';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { CareerMinigameBoardScene057 } from './CareerMinigameBoardScene057';

const BOARD = boardJson as BoardDefinition;
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];

type NetworkStateSource = 'host' | 'state' | 'snapshot';
type PlayerVisualRuntime = { token: Phaser.GameObjects.Container };

type DepthInternals058 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime>;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
};

/**
 * 0.1.58 keeps the 0.1.57 authority chain and adds presentation reconciliation for
 * LÁ BÀI / TIN TỨC effects that relocate another player directly to Jail/Hospital.
 *
 * The authoritative MatchState is still mutated only by replay/host authority. This
 * wrapper merely animates a token after a newly received card_play/news state proves
 * that the player's authoritative node and specialHold changed.
 */
export class CareerMinigameBoardScene058 extends CareerMinigameBoardScene057 {
  create(): void {
    super.create();
    this.installDepthRelocationPresentation();
  }

  private installDepthRelocationPresentation(): void {
    const internals = this as unknown as DepthInternals058;
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
        }]),
      );
      const newEvents = state.eventLog.filter((event) => event.seq >= previousEventSeq);
      const causedByDepthEffect = newEvents.some(
        (event) => event.type === 'card_play' || event.type === 'news',
      );
      const moveStepsBeforeEffect = newEvents.filter((event) => event.type === 'move_step').length;
      const containsNews = newEvents.some((event) => event.type === 'news');

      originalApplyNetworkState(state, commandSeq, checksum, source);

      if (source === 'snapshot' || !causedByDepthEffect) return;

      const relocations = state.players.filter((player) => {
        const previous = previousPlayers.get(player.id);
        return Boolean(
          previous &&
          player.specialHold &&
          player.specialHold !== previous.specialHold &&
          player.nodeId !== previous.nodeId,
        );
      });
      if (relocations.length === 0) return;

      // A News relocation arrives in the same command packet as the movement that
      // landed on the News tile. Give those queued move_step visuals time to finish
      // before reconciling the effect target. Card plays have no preceding movement.
      const delayMs = containsNews
        ? Math.min(1850, 420 + moveStepsBeforeEffect * 245)
        : 320;

      this.time.delayedCall(delayMs, () => {
        for (const player of relocations) this.animateDepthRelocation(internals, player);
      });
    };
  }

  private animateDepthRelocation(internals: DepthInternals058, snapshotPlayer: PlayerState): void {
    const current = internals.match.players.find((player) => player.id === snapshotPlayer.id);
    const visual = internals.visuals.get(snapshotPlayer.id);
    if (!current || !visual) return;
    if (current.nodeId !== snapshotPlayer.nodeId || current.specialHold !== snapshotPlayer.specialHold) return;

    const destination = getBoardNode(BOARD, current.nodeId);
    const offset = TOKEN_OFFSETS[current.id] ?? { x: 0, y: 0 };
    this.tweens.killTweensOf(visual.token);
    this.tweens.add({
      targets: visual.token,
      x: destination.x + offset.x,
      y: destination.y + offset.y,
      duration: 520,
      ease: 'Cubic.easeInOut',
    });
  }
}
