import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import { getBoardNode } from '../core/board';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition } from '../core/types';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene0632 } from './CareerMinigameBoardScene0632';

const BOARD = boardJson as BoardDefinition;
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];
const RELEASE_CORRIDOR_FROM_0633 = new Set([100, 101, 102, 103, 110, 111, 112, 113]);
const RELEASE_GATE_NODE_0633 = new Set([12, 34]);

type PlayerVisualRuntime0633 = { token: Phaser.GameObjects.Container };

type PresentationRuntime0633 = {
  currentModel?: PresentationEventModel;
  isBlocking(): boolean;
};

type UiSyncRuntime0633 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime0633>;
  syncCanonicalHud(force: boolean): void;
  rollPendingTurn?: number;
  showDeltaToast(lines: string[]): void;
  animateMoveStep(
    internals: { visuals: Map<number, PlayerVisualRuntime0633> },
    model: PresentationEventModel,
  ): Promise<void>;
};

/**
 * 0.1.63.3 presentation/state pacing hotfix.
 *
 * Human feedback exposed two related presentation races:
 * 1) authoritative money/effects could already be visible while the token was still
 *    waiting for its queued dice + movement animation;
 * 2) Jail/Hospital release corridor move_step events looked like normal movement,
 *    obscuring that the release D6 is discarded and a fresh D6 is required.
 *
 * Gameplay authority and RNG stay unchanged. This scene only aligns what the player
 * sees with the already-authoritative event order.
 */
export class CareerMinigameBoardScene0633 extends CareerMinigameBoardScene0632 {
  private releaseFreshRollArmed0633 = false;

  create(): void {
    super.create();
    this.installPresentedStateSync0633();
    this.installReleaseCorridorPresentation0633();
    this.updateBuildLabels0633();
  }

  update(): void {
    super.update();
    this.syncFreshRollAfterRelease0633();
  }

  private presentation0633(): PresentationRuntime0633 | undefined {
    return (this as unknown as { presentation?: PresentationRuntime0633 }).presentation;
  }

  private installPresentedStateSync0633(): void {
    const runtime = this as unknown as UiSyncRuntime0633;
    const originalSyncCanonicalHud = runtime.syncCanonicalHud.bind(this);

    // The old playtest layer showed state-delta toasts immediately when the HOST
    // packet arrived, before the queued move animation. MatchPresentationLayer now
    // owns the visible effect timing, so suppress that legacy early toast.
    runtime.showDeltaToast = () => undefined;

    runtime.syncCanonicalHud = (force: boolean) => {
      const presentation = this.presentation0633();
      const model = presentation?.currentModel;
      const movementStillPresenting = Boolean(
        presentation?.isBlocking() &&
        (!model || model.kind === 'dice_roll' || model.kind === 'move_step'),
      );
      if (movementStillPresenting) return;
      originalSyncCanonicalHud(force);
    };
  }

  private installReleaseCorridorPresentation0633(): void {
    const runtime = this as unknown as UiSyncRuntime0633;
    const originalAnimateMoveStep = runtime.animateMoveStep.bind(this);

    runtime.animateMoveStep = (
      internals: { visuals: Map<number, PlayerVisualRuntime0633> },
      model: PresentationEventModel,
    ): Promise<void> => {
      const fromNodeId = model.fromNodeId;
      if (fromNodeId === undefined || !RELEASE_CORRIDOR_FROM_0633.has(fromNodeId)) {
        return originalAnimateMoveStep(internals, model);
      }

      // Internal corridor nodes are authoritative topology, not player-facing board
      // steps. Keep them in replay/state, but do not animate them as 3 extra moves.
      if (model.toNodeId === undefined || !RELEASE_GATE_NODE_0633.has(model.toNodeId)) {
        return Promise.resolve();
      }

      const playerId = model.actorId;
      if (playerId === undefined) return Promise.resolve();
      const visual = internals.visuals.get(playerId);
      if (!visual) return Promise.resolve();

      const destination = getBoardNode(BOARD, model.toNodeId);
      const offset = TOKEN_OFFSETS[playerId] ?? { x: 0, y: 0 };
      const targetX = destination.x + offset.x;
      const targetY = destination.y + offset.y;

      this.tweens.killTweensOf(visual.token);
      return new Promise((resolve) => {
        this.tweens.add({
          targets: visual.token,
          x: targetX,
          y: targetY,
          duration: 430,
          ease: 'Sine.easeInOut',
          onComplete: () => resolve(),
        });
      });
    };
  }

  private syncFreshRollAfterRelease0633(): void {
    const runtime = this as unknown as UiSyncRuntime0633;
    const presentation = this.presentation0633();
    const model = presentation?.currentModel;

    if (
      model?.tileType === 'special_release' &&
      runtime.match.turn.phase === 'PRE_ROLL_ACTION' &&
      runtime.match.turn.lastRoll === null
    ) {
      this.releaseFreshRollArmed0633 = true;
    }

    if (!this.releaseFreshRollArmed0633 || presentation?.isBlocking()) return;

    // DirectDiceBoardScene historically keyed its pending click only by turnNumber.
    // A successful release intentionally stays in the same turn, so clear that one
    // pending marker only after the release presentation finishes. The next D6 is a
    // genuinely new roll and cannot double-submit during the release animation.
    runtime.rollPendingTurn = undefined;
    this.releaseFreshRollArmed0633 = false;
  }

  private updateBuildLabels0633(): void {
    this.visitDisplayTree0633(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (object.text.startsWith('CITY • MVP 0.1.63')) {
        object.setText('CITY • MVP 0.1.63.3 • PRESENTATION SYNC + RELEASE D6');
      } else if (object.text.startsWith('PLAYTEST 0.1.63')) {
        object.setText('PLAYTEST 0.1.63.3 • ĐI TỚI Ô RỒI MỚI ĂN HIỆU ỨNG');
      }
    });
  }

  private visitDisplayTree0633(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree0633(object.list, visit);
      }
    }
  }
}
