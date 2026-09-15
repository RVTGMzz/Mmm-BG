import Phaser from 'phaser';
import { browserSession } from '../core/browserSession';
import { pendingCpuFreshRollAfterRelease066 } from '../core/cpuReleaseResume066';
import type { ClientIntentType } from '../core/authority';
import type { MatchEventValue, MatchState } from '../core/matchState';
import { CareerMinigameBoardScene0651 } from './CareerMinigameBoardScene0651';

type CpuReleaseResumeInternals066 = {
  match: MatchState;
  presentation?: { isBlocking(): boolean };
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
};

/**
 * 0.1.66 shipped-flow wrapper.
 *
 * Retains the inherited HOST-authoritative gameplay chain while adding:
 * - unified 0.1.66 build label;
 * - redundant Job dice-icon cleanup;
 * - Mini Game result/ranking reflow;
 * - a browser CPU watchdog that wakes the existing HOST roll intent after a
 *   successful same-turn Jail/Hospital release once presentation is unblocked.
 */
export class CareerMinigameBoardScene066 extends CareerMinigameBoardScene0651 {
  private handledCpuReleaseEventSeq066 = 0;

  create(): void {
    super.create();
    this.handledCpuReleaseEventSeq066 = 0;
    this.polishPresentation066();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.handledCpuReleaseEventSeq066 = 0;
    });
  }

  update(): void {
    super.update();
    this.polishPresentation066();
    this.resumeCpuFreshRollAfterRelease066();
  }

  private resumeCpuFreshRollAfterRelease066(): void {
    const internals = this as unknown as CpuReleaseResumeInternals066;
    if (!internals.match) return;

    const eventSeq = pendingCpuFreshRollAfterRelease066(
      internals.match,
      browserSession.current.cpuSeatIds,
      internals.presentation?.isBlocking() ?? false,
      this.handledCpuReleaseEventSeq066,
    );
    if (eventSeq === undefined) return;

    // Mark before submission so a delayed local transport cannot submit twice.
    // submitIntent still goes through the existing HOST authority/replay path.
    this.handledCpuReleaseEventSeq066 = eventSeq;
    internals.submitIntent('roll', {});
  }

  private polishPresentation066(): void {
    this.visitTextTree066(this.children.list, (text) => {
      if (text.text.startsWith('CITY • MVP 0.1.65.1')) {
        text.setText('CITY • MVP 0.1.66 • UNIFIED FLOW + MATCH LENGTH');
      }

      if (text.text.includes('💼🎲')) {
        text.setText(text.text.replaceAll('💼🎲', '💼'));
      }

      const value = text.text.trim();
      if (value.startsWith('🤝 HÒA') || value.includes('HÒA, RA LẠI')) {
        text
          .setY(-108)
          .setOrigin(0.5, 0)
          .setFontSize(28)
          .setAlign('center')
          .setFixedSize(760, 56);
        return;
      }

      if (value.startsWith('🏆 BẢNG XẾP HẠNG')) {
        text
          .setY(-112)
          .setOrigin(0.5, 0)
          .setFontSize(27)
          .setAlign('center')
          .setFixedSize(760, 54);
        return;
      }

      const isChoiceSummary = value.includes('\n')
        && /(SẤP|NGỬA|BÚA|BAO|KÉO)/.test(value)
        && /(Player|CPU|P\d)/.test(value);
      if (isChoiceSummary) {
        text
          .setY(-42)
          .setOrigin(0.5, 0)
          .setFontSize(17)
          .setLineSpacing(10)
          .setAlign('left')
          .setFixedSize(720, 190);
        return;
      }

      const isRankingBody = value.includes('\n') && /[🥇🥈🥉4️⃣]/u.test(value) && value.includes('B$');
      if (isRankingBody) {
        text
          .setY(-42)
          .setOrigin(0.5, 0)
          .setFontSize(19)
          .setLineSpacing(12)
          .setAlign('left')
          .setFixedSize(660, 210);
      }
    });
  }

  private visitTextTree066(
    objects: readonly Phaser.GameObjects.GameObject[],
    visit: (text: Phaser.GameObjects.Text) => void,
  ): void {
    for (const object of objects) {
      if (object instanceof Phaser.GameObjects.Text) visit(object);
      if (object instanceof Phaser.GameObjects.Container) this.visitTextTree066(object.list, visit);
    }
  }
}
