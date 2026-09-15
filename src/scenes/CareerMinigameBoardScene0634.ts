import Phaser from 'phaser';
import type { MatchState } from '../core/matchState';
import {
  shouldCatchUpVisibleMoney0634,
  shouldCommitVisibleMoney0634,
} from '../ui/landingEffectSync0634';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene0633 } from './CareerMinigameBoardScene0633';

type HudHandle0634 = {
  money: Phaser.GameObjects.Text;
};

type PresentationRuntime0634 = {
  currentModel?: PresentationEventModel;
  isBlocking(): boolean;
  showLanding(model: PresentationEventModel): void;
  showCinematic(model: PresentationEventModel): void;
};

type SceneRuntime0634 = {
  match: MatchState;
  hud: Map<number, HudHandle0634>;
  presentation?: PresentationRuntime0634;
};

/**
 * 0.1.63.4 landing-effect synchronization.
 *
 * HOST remains authoritative and may calculate the destination/economy immediately,
 * but the HUD now owns a separate presented-money snapshot. A money change becomes
 * visible only when its corresponding landing/Card/News presentation actually starts.
 * This prevents the player seeing “-20 B$” while their token is still travelling.
 */
export class CareerMinigameBoardScene0634 extends CareerMinigameBoardScene0633 {
  private readonly visibleMoney0634 = new Map<number, number>();

  create(): void {
    super.create();
    this.captureAuthoritativeMoney0634();
    this.installLandingMoneyCommit0634();
    this.applyVisibleMoneyLabels0634();
    this.updateBuildLabels0634();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.visibleMoney0634.clear();
    });
  }

  update(): void {
    super.update();

    const presentation = this.runtime0634().presentation;
    if (shouldCatchUpVisibleMoney0634(Boolean(presentation?.isBlocking()))) {
      this.captureAuthoritativeMoney0634();
    }

    // Inherited canonical HUD may have just rendered the already-authoritative
    // future money. Restore the presentation-owned snapshot every frame.
    this.applyVisibleMoneyLabels0634();
  }

  private runtime0634(): SceneRuntime0634 {
    return this as unknown as SceneRuntime0634;
  }

  private installLandingMoneyCommit0634(): void {
    const presentation = this.runtime0634().presentation;
    if (!presentation) return;

    const originalShowLanding = presentation.showLanding.bind(presentation);
    presentation.showLanding = (model: PresentationEventModel) => {
      if (shouldCommitVisibleMoney0634(model)) {
        this.captureAuthoritativeMoney0634();
        this.applyVisibleMoneyLabels0634();
      }
      originalShowLanding(model);
    };

    const originalShowCinematic = presentation.showCinematic.bind(presentation);
    presentation.showCinematic = (model: PresentationEventModel) => {
      if (shouldCommitVisibleMoney0634(model)) {
        this.captureAuthoritativeMoney0634();
        this.applyVisibleMoneyLabels0634();
      }
      originalShowCinematic(model);
    };
  }

  private captureAuthoritativeMoney0634(): void {
    for (const player of this.runtime0634().match.players) {
      this.visibleMoney0634.set(player.id, player.money);
    }
  }

  private applyVisibleMoneyLabels0634(): void {
    const runtime = this.runtime0634();
    for (const player of runtime.match.players) {
      const money = this.visibleMoney0634.get(player.id);
      const hud = runtime.hud.get(player.id);
      if (money === undefined || !hud) continue;
      hud.money.setText(`🪙 ${money} B$`);
    }
  }

  private updateBuildLabels0634(): void {
    this.visitDisplayTree0634(this.children.list, (object) => {
      if (!(object instanceof Phaser.GameObjects.Text)) return;
      if (object.text.startsWith('CITY • MVP 0.1.63')) {
        object.setText('CITY • MVP 0.1.63.4 • JOB CONTINUE + LANDING EFFECT SYNC');
      } else if (object.text.startsWith('PLAYTEST 0.1.63')) {
        object.setText('PLAYTEST 0.1.63.4 • JOB XONG ĐI TIẾP • TỚI Ô MỚI TRỪ/CỘNG B$');
      }
    });
  }

  private visitDisplayTree0634(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (object: Phaser.GameObjects.GameObject) => void,
  ): void {
    for (const object of objects) {
      visit(object);
      if (object instanceof Phaser.GameObjects.Container) {
        this.visitDisplayTree0634(object.list, visit);
      }
    }
  }
}
