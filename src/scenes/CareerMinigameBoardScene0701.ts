import Phaser from 'phaser';
import { browserSession } from '../core/browserSession';
import { pendingFreshMovementRollAfterRelease0701 } from '../core/releaseFlow0701';
import type { ClientIntentType } from '../core/authority';
import type { MatchEventValue, MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene069 } from './CareerMinigameBoardScene069';

type Presentation0701 = {
  currentModel?: PresentationEventModel;
  isBlocking(): boolean;
  finishCurrent(animate?: boolean): void;
};

type Runtime0701 = {
  match: MatchState;
  presentation?: Presentation0701;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
  currentPlayer(): PlayerState | undefined;
};

/**
 * 0.1.70.1 Release Flow Repair + UI Density Pass.
 *
 * Release authority already clears the hold and returns to PRE_ROLL_ACTION with
 * lastRoll=null. This layer makes presentation strictly non-authoritative:
 * - the release modal may never hold a CPU fresh-roll forever;
 * - a release modal is force-bounded even if an inherited timer/tween stalls;
 * - Mini Game ranking uses a denser rounded result card instead of a blank wall.
 */
export class CareerMinigameBoardScene0701 extends CareerMinigameBoardScene069 {
  private releaseModelSeq0701 = 0;
  private releaseModelSeenAt0701 = -Infinity;
  private cpuFreshRollSubmittedSeq0701 = 0;
  private readonly roundedRankingRoots0701 = new WeakSet<Phaser.GameObjects.Container>();

  create(): void {
    super.create();
    this.releaseModelSeq0701 = 0;
    this.releaseModelSeenAt0701 = -Infinity;
    this.cpuFreshRollSubmittedSeq0701 = 0;
    this.updateBuildLabels0701();
  }

  update(): void {
    super.update();
    this.repairReleasePresentation0701();
    this.resumeCpuFreshMovementRoll0701();
    this.polishMiniGameRanking0701();
  }

  private runtime0701(): Runtime0701 {
    return this as unknown as Runtime0701;
  }

  private repairReleasePresentation0701(): void {
    const runtime = this.runtime0701();
    const presentation = runtime.presentation;
    const model = presentation?.currentModel;
    if (!presentation || !model || model.tileType !== 'special_release') {
      this.releaseModelSeq0701 = 0;
      this.releaseModelSeenAt0701 = -Infinity;
      return;
    }

    if (this.releaseModelSeq0701 !== model.eventSeq) {
      this.releaseModelSeq0701 = model.eventSeq;
      this.releaseModelSeenAt0701 = this.time.now;
    }

    // The release card is feedback only. If any inherited timing/tween path fails,
    // force it closed after the intended reading window so it cannot own the turn.
    if (presentation.isBlocking() && this.time.now - this.releaseModelSeenAt0701 >= 1850) {
      presentation.finishCurrent(false);
    }
  }

  private resumeCpuFreshMovementRoll0701(): void {
    const runtime = this.runtime0701();
    const releaseSeq = pendingFreshMovementRollAfterRelease0701(runtime.match);
    if (releaseSeq === undefined || this.cpuFreshRollSubmittedSeq0701 === releaseSeq) return;

    const player = runtime.currentPlayer();
    if (!player || !browserSession.isCpuSeat(player.id)) return;

    const model = runtime.presentation?.currentModel;
    const releaseCardVisible = model?.tileType === 'special_release';
    if (releaseCardVisible && this.releaseModelSeq0701 === model.eventSeq) {
      // Let the success card breathe briefly, but never wait for presentationBlocking
      // to become false. Authority can accept the fresh movement D6 independently.
      if (this.time.now - this.releaseModelSeenAt0701 < 900) return;
    }

    this.cpuFreshRollSubmittedSeq0701 = releaseSeq;
    runtime.submitIntent('roll', {});
  }

  private polishMiniGameRanking0701(): void {
    let heading: Phaser.GameObjects.Text | undefined;
    this.visitDisplayTree0701(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (object.text.trim().startsWith('🏆 BẢNG XẾP HẠNG')) heading = object;
    });
    if (!heading?.active) return;

    const stage = heading.parentContainer;
    const root = stage?.parentContainer;
    if (!stage || !root) return;

    heading
      .setPosition(0, -72)
      .setOrigin(0.5)
      .setFontSize(30)
      .setFixedSize(680, 46)
      .setAlign('center');

    for (const child of stage.list) {
      if (!(child instanceof Phaser.GameObjects.Text) || child === heading) continue;
      if (!/[🥇🥈🥉4️⃣]/u.test(child.text) || !child.text.includes('B$')) continue;
      child
        .setPosition(0, 48)
        .setOrigin(0.5)
        .setFontSize(22)
        .setLineSpacing(15)
        .setFixedSize(620, 205)
        .setAlign('left');
    }

    for (const child of root.list) {
      if (!(child instanceof Phaser.GameObjects.Text)) continue;
      if (child.y <= -210) child.setY(-184);
      else if (child.y <= -170) child.setY(-146);
      else if (child.y <= -145) child.setY(-116);
    }

    if (this.roundedRankingRoots0701.has(root)) return;
    const legacyPanel = root.list.find((child): child is Phaser.GameObjects.Rectangle =>
      child instanceof Phaser.GameObjects.Rectangle && child.width >= 880 && child.height >= 520 && child.width < 1000,
    );
    if (!legacyPanel) return;

    legacyPanel.setVisible(false);
    const rounded = this.add.graphics();
    rounded.fillStyle(0xfffbf3, 1);
    rounded.fillRoundedRect(-425, -230, 850, 460, 30);
    rounded.lineStyle(6, 0x242424, 1);
    rounded.strokeRoundedRect(-425, -230, 850, 460, 30);
    root.addAt(rounded, Math.min(1, root.length));
    this.roundedRankingRoots0701.add(root);
  }

  private updateBuildLabels0701(): void {
    this.visitDisplayTree0701(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (object.text.startsWith('CITY • MVP 0.1.70')) {
        object.setText('CITY • MVP 0.1.70.1 • RELEASE FLOW REPAIR');
      } else if (object.text.startsWith('PLAYTEST 0.1.70')) {
        object.setText('PLAYTEST 0.1.70.1 • FRESH RELEASE D6 + UI DENSITY');
      }
    });
  }

  private visitDisplayTree0701(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree0701(object.list, visit);
      }
    }
  }
}
