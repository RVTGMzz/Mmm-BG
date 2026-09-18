import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import { getBoardNode } from '../core/board';
import type { BoardDefinition } from '../core/types';
import { movementStepDisposition } from '../ui/movementVisualPolicy';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene046 } from './CareerMinigameBoardScene046';

const BOARD = boardJson as BoardDefinition;
const TOKEN_OFFSETS = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];

type MovementInternals048 = {
  visuals: Map<number, { token: Phaser.GameObjects.Container }>;
};

type MovementRuntime048 = {
  animateMoveStep(
    internals: MovementInternals048,
    model: PresentationEventModel,
  ): Promise<void>;
};

/**
 * 0.1.48 runtime bugfix pass.
 *
 * The 0.1.47 Tiên Tri / Phép Thuật visual reinterpretation was based on a
 * misunderstanding of the supplied legacy-card references, so the active runtime
 * intentionally returns to the validated 0.1.46 vocabulary/UI chain.
 *
 * This wrapper also rejects delayed/duplicated move_step presentation events when
 * the token is no longer standing at that event's from-node. Authoritative match
 * state is untouched; only stale visual motion is discarded.
 */
export class CareerMinigameBoardScene048 extends CareerMinigameBoardScene046 {
  create(): void {
    super.create();
    this.installStaleMoveGuard();
    this.updateBuildLabels048();
  }

  private installStaleMoveGuard(): void {
    const runtime = this as unknown as MovementRuntime048;
    const originalAnimateMoveStep = runtime.animateMoveStep.bind(this);

    runtime.animateMoveStep = (
      internals: MovementInternals048,
      model: PresentationEventModel,
    ): Promise<void> => {
      const playerId = model.actorId;
      const toNodeId = model.toNodeId;
      if (playerId === undefined || toNodeId === undefined) {
        return originalAnimateMoveStep(internals, model);
      }

      const visual = internals.visuals.get(playerId);
      if (!visual) return originalAnimateMoveStep(internals, model);

      const offset = TOKEN_OFFSETS[playerId] ?? { x: 0, y: 0 };
      const toNode = getBoardNode(BOARD, toNodeId);
      const fromNode = model.fromNodeId === undefined ? undefined : getBoardNode(BOARD, model.fromNodeId);
      const disposition = movementStepDisposition(
        { x: visual.token.x, y: visual.token.y },
        fromNode ? { x: fromNode.x + offset.x, y: fromNode.y + offset.y } : undefined,
        { x: toNode.x + offset.x, y: toNode.y + offset.y },
      );

      if (disposition !== 'animate') return Promise.resolve();
      return originalAnimateMoveStep(internals, model);
    };
  }

  private updateBuildLabels048(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.46 JOB HUB MULTIPLAYER POLISH')) {
        object.setText('CITY • MVP 0.1.48 BUGFIX PASS');
      } else if (object.text.includes('PLAYTEST 0.1.46 • REMOTE JOB DICE')) {
        object.setText('PLAYTEST 0.1.48 • AUDIO + DICE + TOKEN SYNC');
      }
    }
  }
}
