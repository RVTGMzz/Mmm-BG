import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import { getBoardNode } from '../core/board';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, BoardNode } from '../core/types';
import { movementStepDisposition } from '../ui/movementVisualPolicy';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene0634 } from './CareerMinigameBoardScene0634';

const BOARD = boardJson as BoardDefinition;
const TILE_SCALE_064 = 1.5;
const OVERVIEW_ZOOM_064 = 0.46;
const CORRIDOR_FROM_064 = new Set([100, 101, 102, 103, 110, 111, 112, 113]);
const PENALTY_NODE_IDS_064 = new Set([101, 102, 103, 111, 112, 113]);
const TOKEN_OFFSETS_064 = [
  { x: -18, y: -18 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 18, y: 18 },
];

const BOARD_MIN_X_064 = Math.min(...BOARD.nodes.map((node) => node.x));
const BOARD_MAX_X_064 = Math.max(...BOARD.nodes.map((node) => node.x));
const BOARD_MIN_Y_064 = Math.min(...BOARD.nodes.map((node) => node.y));
const BOARD_MAX_Y_064 = Math.max(...BOARD.nodes.map((node) => node.y));
const BOARD_CENTER_X_064 = (BOARD_MIN_X_064 + BOARD_MAX_X_064) / 2;
const BOARD_CENTER_Y_064 = (BOARD_MIN_Y_064 + BOARD_MAX_Y_064) / 2;

type PlayerVisualRuntime064 = { token: Phaser.GameObjects.Container };

type SceneRuntime064 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime064>;
  overviewMode: boolean;
  animateMoveStep(
    internals: { visuals: Map<number, PlayerVisualRuntime064> },
    model: PresentationEventModel,
  ): Promise<void>;
  presentation?: {
    showLanding(model: PresentationEventModel): void;
  };
};

/**
 * 0.1.64 human-feedback runtime.
 *
 * Gameplay additions live in board/special-location data: the map spacing is 2x,
 * successful Jail/Hospital release leaves the token on the hold node, and a fresh
 * movement D6 walks the three real -20 B$ corridor tiles. This scene owns the
 * matching presentation: 1.5x round spaces, proper corridor step animation,
 * expanded overview framing and explicit release-in-place copy.
 */
export class CareerMinigameBoardScene064 extends CareerMinigameBoardScene0634 {
  create(): void {
    super.create();
    this.hideLegacyBackdrop064();
    this.enlargeRoundTiles064();
    this.decoratePenaltyCorridors064();
    this.restoreFreshCorridorMovement064();
    this.installReleaseInPlaceCopy064();
    this.updateBuildLabels064();
  }

  update(): void {
    super.update();
    this.keepExpandedOverviewFramed064();
  }

  private runtime064(): SceneRuntime064 {
    return this as unknown as SceneRuntime064;
  }

  private hideLegacyBackdrop064(): void {
    for (const object of this.children.list) {
      const depth = Number((object as Phaser.GameObjects.GameObject & { depth?: number }).depth ?? 0);
      if (depth < 0) object.setVisible(false);
    }

    // The camera background already uses this green. Add one board-sized plane so
    // screenshots/overview remain visually continuous across the newly expanded map.
    this.add.rectangle(
      BOARD_CENTER_X_064,
      BOARD_CENTER_Y_064,
      (BOARD_MAX_X_064 - BOARD_MIN_X_064) + 520,
      (BOARD_MAX_Y_064 - BOARD_MIN_Y_064) + 420,
      0x6fae87,
      1,
    ).setDepth(-50);
  }

  private baseRadius064(node: BoardNode): number {
    const contentId = node.contentId ?? '';
    const holding = contentId === 'SPECIAL_JAIL_HOLD' || contentId === 'SPECIAL_HOSPITAL_HOLD';
    const anchor =
      node.type === 'ready' ||
      contentId === 'SPECIAL_JAIL_GATE' ||
      contentId === 'SPECIAL_HOSPITAL_GATE' ||
      contentId === 'SPECIAL_LOTTERY';

    if (holding) return 36;
    if (anchor) return 33;
    if (node.feature) return 31;
    return 27;
  }

  private enlargeRoundTiles064(): void {
    for (const node of BOARD.nodes) {
      const circle = this.children.list.find(
        (object): object is Phaser.GameObjects.Arc =>
          object instanceof Phaser.GameObjects.Arc &&
          object.visible &&
          object.depth === 4 &&
          Math.abs(object.x - node.x) < 0.01 &&
          Math.abs(object.y - node.y) < 0.01,
      );
      if (!circle) continue;
      circle.setRadius(this.baseRadius064(node) * TILE_SCALE_064);
    }
  }

  private decoratePenaltyCorridors064(): void {
    for (const node of BOARD.nodes) {
      if (!PENALTY_NODE_IDS_064.has(node.id)) continue;

      const circle = this.children.list.find(
        (object): object is Phaser.GameObjects.Arc =>
          object instanceof Phaser.GameObjects.Arc &&
          object.visible &&
          object.depth === 4 &&
          Math.abs(object.x - node.x) < 0.01 &&
          Math.abs(object.y - node.y) < 0.01,
      );
      circle?.setFillStyle(node.id < 110 ? 0xe79a63 : 0xe98dad, 1);

      const label = this.children.list.find(
        (object): object is Phaser.GameObjects.Text =>
          object instanceof Phaser.GameObjects.Text &&
          object.depth === 5 &&
          Math.abs(object.x - node.x) < 0.01 &&
          Math.abs(object.y - node.y) < 0.01,
      );
      if (label) {
        const short = node.contentId?.startsWith('JAIL_EXIT_')
          ? `J${node.contentId.at(-1)}`
          : `H${node.contentId?.at(-1) ?? ''}`;
        label.setText(`${short}\n−20`).setFontSize(11).setAlign('center');
      }
    }
  }

  private restoreFreshCorridorMovement064(): void {
    const runtime = this.runtime064();
    const inheritedAnimateMoveStep = runtime.animateMoveStep.bind(this);

    runtime.animateMoveStep = (
      internals: { visuals: Map<number, PlayerVisualRuntime064> },
      model: PresentationEventModel,
    ): Promise<void> => {
      const fromNodeId = model.fromNodeId;
      if (fromNodeId === undefined || !CORRIDOR_FROM_064.has(fromNodeId)) {
        return inheritedAnimateMoveStep(internals, model);
      }

      const toNodeId = model.toNodeId;
      const playerId = model.actorId;
      if (toNodeId === undefined || playerId === undefined) return Promise.resolve();
      const visual = internals.visuals.get(playerId);
      if (!visual) return Promise.resolve();

      const fromNode = getBoardNode(BOARD, fromNodeId);
      const toNode = getBoardNode(BOARD, toNodeId);
      const offset = TOKEN_OFFSETS_064[playerId] ?? { x: 0, y: 0 };
      const from = { x: fromNode.x + offset.x, y: fromNode.y + offset.y };
      const to = { x: toNode.x + offset.x, y: toNode.y + offset.y };
      const disposition = movementStepDisposition(
        { x: visual.token.x, y: visual.token.y },
        from,
        to,
      );
      if (disposition !== 'animate') return Promise.resolve();

      this.tweens.killTweensOf(visual.token);
      return new Promise((resolve) => {
        this.tweens.add({
          targets: visual.token,
          x: to.x,
          y: to.y,
          duration: Math.max(230, model.holdMs),
          ease: 'Sine.easeInOut',
          onComplete: () => {
            visual.token.setPosition(to.x, to.y);
            resolve();
          },
        });
      });
    };
  }

  private installReleaseInPlaceCopy064(): void {
    const presentation = this.runtime064().presentation;
    if (!presentation) return;
    const originalShowLanding = presentation.showLanding.bind(presentation);

    presentation.showLanding = (model: PresentationEventModel) => {
      if (model.tileType !== 'special_release' || model.impact !== '✅') {
        originalShowLanding(model);
        return;
      }

      const place = model.title.includes('XUẤT VIỆN') ? 'BỆNH VIỆN' : 'TÙ';
      originalShowLanding({
        ...model,
        description:
          `Xúc xắc ${model.roll ?? '?'} CHỈ dùng để được thả. ` +
          `Bạn vẫn đứng tại ${place}. Đổ một D6 MỚI để bắt đầu di chuyển qua 3 ô phạt bên trong.`,
      });
    };
  }

  private keepExpandedOverviewFramed064(): void {
    const runtime = this.runtime064();
    if (!runtime.overviewMode) return;
    this.cameras.main.stopFollow();
    this.cameras.main.setZoom(OVERVIEW_ZOOM_064);
    this.cameras.main.centerOn(BOARD_CENTER_X_064, BOARD_CENTER_Y_064);
  }

  private updateBuildLabels064(): void {
    this.visitDisplayTree064(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (object.text.startsWith('CITY • MVP 0.1.63')) {
        object.setText('CITY • MVP 0.1.64 • EXPANDED BOARD + RELEASE CORRIDOR');
      } else if (object.text.startsWith('PLAYTEST 0.1.63')) {
        object.setText('PLAYTEST 0.1.64 • MAP X2 • TILE X1.5 • J/H = −20 B$');
      }
    });
  }

  private visitDisplayTree064(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree064(object.list, visit);
      }
    }
  }
}
