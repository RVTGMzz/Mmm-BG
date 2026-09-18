import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, BoardNode, PlayerState } from '../core/types';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene062 } from './CareerMinigameBoardScene062';

const BOARD = boardJson as BoardDefinition;
const TOKEN_SCALE_063 = 0.82;
const FOLLOW_LERP_063 = 0.075;
const LANDING_CONTENT_SCALE_063 = 1.18;
const CINEMATIC_CONTENT_SCALE_063 = 1.14;

type PlayerVisualRuntime063 = { token: Phaser.GameObjects.Container };

type PolishInternals063 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime063>;
  currentPlayer(): PlayerState | undefined;
  focusActiveToken(animated: boolean): void;
  overviewMode: boolean;
};

type PresentationRuntime063 = {
  active?: Phaser.GameObjects.Container;
  showLanding(model: PresentationEventModel): void;
  showCinematic(model: PresentationEventModel): void;
};

/**
 * 0.1.63 human-feedback presentation polish.
 *
 * Gameplay remains the 0.1.62 HOST-authoritative parity-routing runtime. This
 * wrapper only changes presentation: larger event panels, smoother camera follow,
 * slightly smaller player tokens, and slightly larger round movement spaces.
 */
export class CareerMinigameBoardScene063 extends CareerMinigameBoardScene062 {
  create(): void {
    super.create();
    this.installSmoothFollow063();
    this.installLargerEventPanels063();
    this.enlargeRoundTiles063();
    this.applyTokenScale063();
    this.updateBuildLabels063();
  }

  update(): void {
    super.update();
    // A few inherited reconciliation paths intentionally reset a token to scale 1.
    // Re-apply the presentation-only 0.1.63 scale after those paths run.
    this.applyTokenScale063();
  }

  private installSmoothFollow063(): void {
    const internals = this as unknown as PolishInternals063;
    const originalFocusActiveToken = internals.focusActiveToken.bind(this);

    internals.focusActiveToken = (animated: boolean) => {
      originalFocusActiveToken(animated);
      this.applySmoothFollow063(internals);
    };

    // super.create() already focused the first actor with the inherited 0.1.62
    // settings, so immediately upgrade that first follow too.
    this.applySmoothFollow063(internals);
  }

  private applySmoothFollow063(internals: PolishInternals063): void {
    if (internals.overviewMode) return;
    const player = internals.currentPlayer();
    const token = player ? internals.visuals.get(player.id)?.token : undefined;
    if (!token) return;

    // roundPixels=false removes tiny pixel-step judder while the low lerp lets the
    // camera glide behind the moving token instead of snapping onto every step.
    this.cameras.main.startFollow(token, false, FOLLOW_LERP_063, FOLLOW_LERP_063);
  }

  private installLargerEventPanels063(): void {
    const presentation = (this as unknown as { presentation?: PresentationRuntime063 }).presentation;
    if (!presentation) return;

    const originalShowLanding = presentation.showLanding.bind(presentation);
    presentation.showLanding = (model: PresentationEventModel) => {
      originalShowLanding(model);
      this.inflatePresentationContents063(presentation.active, LANDING_CONTENT_SCALE_063);
    };

    const originalShowCinematic = presentation.showCinematic.bind(presentation);
    presentation.showCinematic = (model: PresentationEventModel) => {
      originalShowCinematic(model);
      this.inflatePresentationContents063(presentation.active, CINEMATIC_CONTENT_SCALE_063);
    };
  }

  private inflatePresentationContents063(
    root: Phaser.GameObjects.Container | undefined,
    factor: number,
  ): void {
    if (!root) return;
    for (const child of root.list) {
      const transform = child as Phaser.GameObjects.GameObject & {
        x?: number;
        y?: number;
        scaleX?: number;
        scaleY?: number;
        setPosition?: (x: number, y: number) => unknown;
        setScale?: (x: number, y?: number) => unknown;
      };
      if (
        typeof transform.x === 'number' &&
        typeof transform.y === 'number' &&
        typeof transform.setPosition === 'function'
      ) {
        transform.setPosition(transform.x * factor, transform.y * factor);
      }
      if (
        typeof transform.scaleX === 'number' &&
        typeof transform.scaleY === 'number' &&
        typeof transform.setScale === 'function'
      ) {
        transform.setScale(transform.scaleX * factor, transform.scaleY * factor);
      }
    }
  }

  private tileRadius063(node: BoardNode): number {
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

  private enlargeRoundTiles063(): void {
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
      circle.setRadius(this.tileRadius063(node));
    }
  }

  private applyTokenScale063(): void {
    const internals = this as unknown as PolishInternals063;
    for (const visual of internals.visuals.values()) {
      if (Math.abs(visual.token.scaleX - TOKEN_SCALE_063) < 0.001) continue;
      visual.token.setScale(TOKEN_SCALE_063);
    }
  }

  private updateBuildLabels063(): void {
    this.visitDisplayTree063(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (
        object.text === 'CITY • MVP 0.1.61 • PLAYTEST REPORT' ||
        object.text === 'CITY • MVP 0.1.62 • RANDOM BRANCH + ROUND TILES'
      ) {
        object.setText('CITY • MVP 0.1.63 • UI READABILITY + SMOOTH FOLLOW');
      } else if (
        object.text === 'PLAYTEST 0.1.61 • LOCAL MATCH TELEMETRY' ||
        object.text === 'PLAYTEST 0.1.62 • LẺ ← TRÁI • CHẴN → PHẢI'
      ) {
        object.setText('PLAYTEST 0.1.63 • LẺ ← TRÁI • CHẴN → PHẢI');
      }
    });
  }

  private visitDisplayTree063(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree063(object.list, visit);
      }
    }
  }
}
