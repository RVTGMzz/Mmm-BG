import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { BoardDefinition, BoardNode } from '../core/types';
import { CareerMinigameBoardScene061 } from './CareerMinigameBoardScene061';

const BOARD = boardJson as BoardDefinition;

/**
 * 0.1.62 human-feedback runtime wrapper.
 *
 * Gameplay authority now resolves branches from the movement D6 (odd LEFT,
 * even RIGHT). This scene only owns the requested readability pass: closer
 * follow framing, larger round movement spaces, and explicit luck-rule copy.
 */
export class CareerMinigameBoardScene062 extends CareerMinigameBoardScene061 {
  create(): void {
    super.create();
    this.replaceTileBodiesWithCircles062();
    this.updateBuildLabels062();
  }

  private tileRadius062(node: BoardNode): number {
    const contentId = node.contentId ?? '';
    const holding = contentId === 'SPECIAL_JAIL_HOLD' || contentId === 'SPECIAL_HOSPITAL_HOLD';
    const anchor =
      node.type === 'ready' ||
      contentId === 'SPECIAL_JAIL_GATE' ||
      contentId === 'SPECIAL_HOSPITAL_GATE' ||
      contentId === 'SPECIAL_LOTTERY';

    if (holding) return 32;
    if (anchor) return 29;
    if (node.feature) return 27;
    return 23;
  }

  private replaceTileBodiesWithCircles062(): void {
    for (const node of BOARD.nodes) {
      const body = this.children.list.find(
        (object): object is Phaser.GameObjects.Rectangle =>
          object instanceof Phaser.GameObjects.Rectangle &&
          object.depth === 4 &&
          Math.abs(object.x - node.x) < 0.01 &&
          Math.abs(object.y - node.y) < 0.01,
      );
      if (!body) continue;

      const fillColor = body.fillColor;
      const fillAlpha = body.fillAlpha;
      const strokeColor = body.strokeColor;
      const strokeAlpha = body.strokeAlpha;
      const lineWidth = Math.max(2, body.lineWidth);
      body.destroy();

      this.add.circle(node.x, node.y, this.tileRadius062(node), fillColor, fillAlpha)
        .setStrokeStyle(lineWidth, strokeColor, strokeAlpha)
        .setDepth(4);
    }
  }

  private updateBuildLabels062(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text === 'CITY • MVP 0.1.61 • PLAYTEST REPORT') {
        object.setText('CITY • MVP 0.1.62 • RANDOM BRANCH + ROUND TILES');
      } else if (object.text === 'PLAYTEST 0.1.61 • LOCAL MATCH TELEMETRY') {
        object.setText('PLAYTEST 0.1.62 • LẺ ← TRÁI • CHẴN → PHẢI');
      }
    }
  }
}
