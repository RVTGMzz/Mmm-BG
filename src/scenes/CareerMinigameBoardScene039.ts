import Phaser from 'phaser';
import { demoMatchLapProgress } from '../core/demoMatch';
import type { MatchState } from '../core/matchState';
import { CareerMinigameBoardScene037 } from './CareerMinigameBoardScene037';

type FinalResultInternals = {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay: Phaser.GameObjects.GameObject[];
  renderShellOverlay(): void;
};

/**
 * 0.1.39 presentation-only final score transition.
 *
 * PresentationParity already owns the important ordering invariant: the result overlay
 * is deferred while queued presentation is blocking. This wrapper runs only after that
 * render gate has allowed the real result overlay to exist. It briefly announces that
 * every required lap is complete, blocks accidental clicks, then reveals the existing
 * authoritative B$ result overlay. No gameplay state, RNG, ranking or payout is changed.
 */
export class CareerMinigameBoardScene039 extends CareerMinigameBoardScene037 {
  private finalResultTransitionShown = false;
  private finalResultTransition?: Phaser.GameObjects.Container;
  private finalResultBlocker?: Phaser.GameObjects.Rectangle;

  create(): void {
    super.create();
    this.installFinalResultTransition();
    this.updateBuildLabels039();

    this.events.once('shutdown', () => {
      this.finalResultTransition?.destroy(true);
      this.finalResultTransition = undefined;
      this.finalResultBlocker?.destroy();
      this.finalResultBlocker = undefined;
      this.finalResultTransitionShown = false;
    });
  }

  private installFinalResultTransition(): void {
    const internals = this as unknown as FinalResultInternals;
    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);

    internals.renderShellOverlay = () => {
      originalRenderShellOverlay();

      if (internals.shell.status !== 'ended') {
        this.finalResultTransitionShown = false;
        this.finalResultTransition?.destroy(true);
        this.finalResultTransition = undefined;
        this.finalResultBlocker?.destroy();
        this.finalResultBlocker = undefined;
        return;
      }

      // An empty result overlay means PresentationParity is still deferring final score.
      // Never create the celebration early or bypass that queue gate.
      if (internals.shellOverlay.length === 0 || this.finalResultTransitionShown) return;

      this.finalResultTransitionShown = true;
      this.showFinalResultTransition(internals);
    };
  }

  private showFinalResultTransition(internals: FinalResultInternals): void {
    const progress = demoMatchLapProgress(internals.match);

    // Hide the already-authoritative result for a short beat. The blocker catches input
    // while the buttons are visually hidden so a fast click cannot trigger a rematch.
    for (const object of internals.shellOverlay) {
      if ('setAlpha' in object && typeof object.setAlpha === 'function') object.setAlpha(0);
    }

    const blocker = this.add.rectangle(640, 360, 1280, 720, 0x111111, 0.28)
      .setDepth(980)
      .setInteractive();
    this.finalResultBlocker = blocker;

    const root = this.add.container(640, 338).setDepth(990).setAlpha(0).setScale(0.84);
    this.finalResultTransition = root;

    const shadow = this.add.graphics().setName('final-transition-shadow-ch176');
    shadow.fillStyle(0x4b302a, 0.24);
    shadow.fillRoundedRect(-334, -82, 668, 188, 30);

    const panel = this.add.graphics().setName('final-transition-panel-ch176');
    panel.fillStyle(0xfff7e8, 1);
    panel.fillRoundedRect(-328, -91, 656, 184, 28);
    panel.lineStyle(5, 0x4b302a, 0.96);
    panel.strokeRoundedRect(-328, -91, 656, 184, 28);

    const headerBand = this.add.graphics().setName('final-transition-header-ch176');
    headerBand.fillStyle(0xffd76a, 1);
    headerBand.fillRoundedRect(-304, -72, 608, 50, { tl: 18, tr: 18, bl: 10, br: 10 });
    headerBand.fillStyle(0xffffff, 0.48);
    headerBand.fillRoundedRect(-290, -65, 580, 9, 4);

    const flagWell = this.add.graphics().setName('final-transition-flag-well-ch176');
    flagWell.fillStyle(0xfffdf8, 1);
    flagWell.fillCircle(-256, -46, 28);
    flagWell.lineStyle(3, 0xd99b38, 0.88);
    flagWell.strokeCircle(-256, -46, 28);
    const flag = this.add.text(-256, -46, '🏁', { fontSize: '31px' }).setOrigin(0.5);

    const title = this.add.text(28, -47, `${progress.completedPlayers}/${progress.totalPlayers} HOÀN THÀNH!`, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#4b302a',
      fixedWidth: 510,
      align: 'center',
    }).setOrigin(0.5);
    const detail = this.add.text(0, 37, 'CHỐT B$ • XẾP HẠNG CUỐI VÁN', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#6c5146',
      letterSpacing: 1,
    }).setOrigin(0.5);

    root.add([shadow, panel, headerBand, flagWell, flag, title, detail]);

    // Small deterministic presentation sparkles. Their positions are fixed constants,
    // not gameplay RNG and not Math.random().
    const sparks = [
      [-282, -82], [-220, 92], [-128, -105], [136, -104], [226, 91], [284, -76],
      [-330, 12], [330, 18],
    ] as const;
    sparks.forEach(([x, y], index) => {
      const spark = this.add.text(x, y, index % 2 === 0 ? '✦' : '★', {
        fontSize: index % 3 === 0 ? '22px' : '16px',
        color: index % 2 === 0 ? '#ef4545' : '#d59a36',
      }).setOrigin(0.5).setAlpha(0.9);
      root.add(spark);
      this.tweens.add({
        targets: spark,
        angle: index % 2 === 0 ? 18 : -18,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 260 + index * 18,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut',
      });
    });

    this.tweens.add({
      targets: root,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 240,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(720, () => {
          if (!root.active) return;

          for (const object of internals.shellOverlay) {
            if (!object.active || !('setAlpha' in object) || typeof object.setAlpha !== 'function') continue;
            this.tweens.add({
              targets: object,
              alpha: 1,
              duration: 360,
              ease: 'Sine.easeOut',
            });
          }

          this.tweens.add({
            targets: root,
            alpha: 0,
            y: 320,
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 310,
            ease: 'Sine.easeIn',
            onComplete: () => {
              if (this.finalResultTransition === root) this.finalResultTransition = undefined;
              root.destroy(true);
              if (this.finalResultBlocker === blocker) this.finalResultBlocker = undefined;
              blocker.destroy();
            },
          });
        });
      },
    });
  }

  private updateBuildLabels039(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.38 CHOICE SFX + COPY CLEANUP')) {
        object.setText('CITY • MVP 0.1.39 FINAL B$ LOCK TRANSITION');
      } else if (object.text.includes('PLAYTEST 0.1.38 • CHOICE FEEDBACK POLISH')) {
        object.setText('PLAYTEST 0.1.39 • FINAL RESULT CLARITY');
      }
    }
  }
}
