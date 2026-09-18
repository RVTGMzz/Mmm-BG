import Phaser from 'phaser';
import { browserSession } from '../core/browserSession';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import type { PresentationEventModel } from '../ui/presentationModel';
import { onlineGroupMedia07043 } from '../ui/OnlineGroupMedia07043';
import { CareerMinigameBoardScene069 } from './CareerMinigameBoardScene069';

type Presentation0701 = {
  currentModel?: PresentationEventModel;
  isBlocking(): boolean;
  finishCurrent(animate?: boolean): void;
};

type Runtime0701 = {
  match: MatchState;
  presentation?: Presentation0701;
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
  compactCard?: Phaser.GameObjects.Rectangle;
  compactCardText?: Phaser.GameObjects.Text;
};

/**
 * 0.1.70.1 Release Flow Repair + UI Density Pass.
 *
 * Release authority already clears the hold and returns to PRE_ROLL_ACTION with
 * lastRoll=null. Presentation stays strictly non-authoritative:
 * - the release modal is force-bounded even if an inherited timer/tween stalls;
 * - CPU fresh-roll authority stays in the single 0.1.66 compatibility wrapper,
 *   now backed by releaseFlow0701 and independent from modal blocking;
 * - the legacy Card slot is visible only on an interactive human turn;
 * - Mini Game ranking uses a denser rounded result card instead of a blank wall.
 */
export class CareerMinigameBoardScene0701 extends CareerMinigameBoardScene069 {
  private releaseModelSeq0701 = 0;
  private releaseModelSeenAt0701 = -Infinity;
  private compactCardSkin0701?: Phaser.GameObjects.Graphics;
  private readonly roundedRankingRoots0701 = new WeakSet<Phaser.GameObjects.Container>();

  create(): void {
    super.create();
    this.releaseModelSeq0701 = 0;
    this.releaseModelSeenAt0701 = -Infinity;
    this.installCompactCardSkin0701();
    this.syncCompactCard0701();
    this.updateBuildLabels0701();
    if (browserSession.isOnline) onlineGroupMedia07043.start();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      onlineGroupMedia07043.stop();
      this.compactCardSkin0701?.destroy();
      this.compactCardSkin0701 = undefined;
    });
  }

  update(): void {
    super.update();
    this.repairReleasePresentation0701();
    this.syncCompactCard0701();
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

    // Release success is feedback, never turn authority. If any inherited timer or
    // tween stalls, close this exact card after the intended reading window.
    if (presentation.isBlocking() && this.time.now - this.releaseModelSeenAt0701 >= 1850) {
      presentation.finishCurrent(false);
    }
  }

  private installCompactCardSkin0701(): void {
    const runtime = this.runtime0701();
    const card = runtime.compactCard;
    if (!card) return;
    card.setAlpha(0.001);
    this.compactCardSkin0701 = this.add.graphics().setDepth(card.depth);
    runtime.compactCardText?.setDepth(card.depth + 1);
  }

  private syncCompactCard0701(): void {
    const runtime = this.runtime0701();
    const player = runtime.currentPlayer();
    const card = runtime.compactCard;
    const text = runtime.compactCardText;
    const skin = this.compactCardSkin0701;
    if (!player || !card || !text) {
      skin?.setVisible(false);
      return;
    }

    const blocking = runtime.presentation?.isBlocking() ?? false;
    const humanTurn = runtime.canControlCurrentPlayer() && !browserSession.isCpuSeat(player.id);
    const visible = humanTurn && !blocking;
    card.setVisible(visible).setAlpha(visible ? 0.001 : 0);
    text.setVisible(visible);
    skin?.setVisible(visible);

    if (!visible) {
      if (card.input?.enabled) card.disableInteractive();
      return;
    }
    if (!card.input?.enabled) card.setInteractive({ useHandCursor: true });

    const canUse = runtime.match.turn.phase === 'PRE_ROLL_ACTION' && player.handCardIds.length > 0;
    const fill = canUse ? 0xb997d6 : 0xd8d2c7;
    if (skin) {
      skin.clear();
      skin.fillStyle(fill, 1);
      skin.fillRoundedRect(card.x - 75, card.y - 20, 150, 40, 16);
      skin.lineStyle(3, 0x242424, 1);
      skin.strokeRoundedRect(card.x - 75, card.y - 20, 150, 40, 16);
    }
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
        object.setText('CITY • MVP 0.1.70.4.3 • ONLINE RUNTIME REPAIR');
      } else if (object.text.startsWith('PLAYTEST 0.1.70')) {
        object.setText('PLAYTEST 0.1.70.4.3 • GROUP MEDIA + SHELL SYNC');
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
