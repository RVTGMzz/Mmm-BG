import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { CareerMinigameBoardScene063 } from './CareerMinigameBoardScene063';

const BOARD = boardJson as BoardDefinition;
const CAMERA_EDGE_MARGIN_0631 = 96;

type PlayerVisualRuntime0631 = { token: Phaser.GameObjects.Container };

type CenterLockInternals0631 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime0631>;
  currentPlayer(): PlayerState | undefined;
  focusActiveToken(animated: boolean): void;
  overviewMode: boolean;
};

/**
 * 0.1.63.1 active-player center-lock hotfix.
 *
 * 0.1.63 deliberately used a low camera lerp for a trailing glide, but human
 * playtest feedback showed the moving token could outrun the camera and leave the
 * viewport. This presentation-only patch makes the active player's token the exact
 * camera center every frame during normal play. The token tween itself remains
 * smooth, so the camera inherits that smooth motion without lag.
 *
 * Overview remains the sole intentional exception.
 */
export class CareerMinigameBoardScene0631 extends CareerMinigameBoardScene063 {
  create(): void {
    super.create();
    this.expandCameraBoundsForCenterLock0631();
    this.installActivePlayerCenterLock0631();
    this.updateBuildLabels0631();
  }

  update(): void {
    super.update();
    this.centerActivePlayer0631();
  }

  private installActivePlayerCenterLock0631(): void {
    const internals = this as unknown as CenterLockInternals0631;
    const originalFocusActiveToken = internals.focusActiveToken.bind(this);

    internals.focusActiveToken = (animated: boolean) => {
      originalFocusActiveToken(animated);
      this.centerActivePlayer0631();
    };

    this.centerActivePlayer0631();
  }

  private centerActivePlayer0631(): void {
    const internals = this as unknown as CenterLockInternals0631;
    if (internals.overviewMode) return;

    const player = internals.currentPlayer();
    const token = player ? internals.visuals.get(player.id)?.token : undefined;
    if (!token) return;

    // Lerp is intentionally bypassed here. The token already moves on a tween, so
    // centering on its interpolated position each frame stays visually smooth while
    // guaranteeing the current player can never outrun the camera.
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(token.x, token.y);
  }

  private expandCameraBoundsForCenterLock0631(): void {
    const camera = this.cameras.main;
    const zoom = Math.max(0.01, camera.zoom);
    const halfViewX = camera.width / (2 * zoom);
    const halfViewY = camera.height / (2 * zoom);
    const xs = BOARD.nodes.map((node) => node.x);
    const ys = BOARD.nodes.map((node) => node.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const left = minX - halfViewX - CAMERA_EDGE_MARGIN_0631;
    const top = minY - halfViewY - CAMERA_EDGE_MARGIN_0631;
    const right = maxX + halfViewX + CAMERA_EDGE_MARGIN_0631;
    const bottom = maxY + halfViewY + CAMERA_EDGE_MARGIN_0631;
    camera.setBounds(left, top, right - left, bottom - top);
  }

  private updateBuildLabels0631(): void {
    this.visitDisplayTree0631(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (object.text.startsWith('CITY • MVP 0.1.63')) {
        object.setText('CITY • MVP 0.1.63.1 • ACTIVE PLAYER CENTER LOCK');
      } else if (object.text.startsWith('PLAYTEST 0.1.63')) {
        object.setText('PLAYTEST 0.1.63.1 • ACTIVE TOKEN LUÔN Ở GIỮA');
      }
    });
  }

  private visitDisplayTree0631(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree0631(object.list, visit);
      }
    }
  }
}
