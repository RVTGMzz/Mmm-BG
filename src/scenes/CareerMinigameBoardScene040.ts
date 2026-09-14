import Phaser from 'phaser';
import { computeMatchChecksum } from '../core/checksum';
import { demoMatchLapProgress } from '../core/demoMatch';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { CareerMinigameBoardScene039 } from './CareerMinigameBoardScene039';

type LapNativeShellInternals = {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay: Phaser.GameObjects.GameObject[];
  turnText?: Phaser.GameObjects.Text;
  phaseText?: Phaser.GameObjects.Text;
  logText?: Phaser.GameObjects.Text;
  logs: string[];
  currentPlayer(): PlayerState | undefined;
  refreshHud(): void;
  renderShellOverlay(): void;
  writeLog(message: string): void;
};

/**
 * 0.1.40 presentation cleanup for legacy DemoBoardScene copy.
 *
 * The old shell still serializes rounds/turnLimit for compatibility, but those
 * fields are no longer the match-end rule. This wrapper guarantees that inherited
 * runtime text cannot surface the obsolete three-round interpretation again.
 * No gameplay state, authority, RNG, payout or shell serialization is changed.
 */
export class CareerMinigameBoardScene040 extends CareerMinigameBoardScene039 {
  create(): void {
    super.create();
    this.installLapNativeLegacyCopyGuard();
    this.updateBuildLabels040();
  }

  private installLapNativeLegacyCopyGuard(): void {
    const internals = this as unknown as LapNativeShellInternals;

    const originalRefreshHud = internals.refreshHud.bind(this);
    internals.refreshHud = () => {
      originalRefreshHud();
      this.refreshLegacyHudCopy(internals);
    };

    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);
    internals.renderShellOverlay = () => {
      originalRenderShellOverlay();
      this.refreshLegacyShellCopy(internals);
    };

    const originalWriteLog = internals.writeLog.bind(this);
    internals.writeLog = (message: string) => {
      originalWriteLog(this.lapNativeLogCopy(message));
    };

    // super.create() may have emitted the initial shell line before this wrapper was
    // installed. Normalize the retained log buffer once so it cannot reappear later.
    internals.logs = internals.logs.map((message) => this.lapNativeLogCopy(message));
    internals.logText?.setText(internals.logs.join('\n'));

    this.refreshLegacyStaticCopy();
    this.refreshLegacyHudCopy(internals);
    this.refreshLegacyShellCopy(internals);
  }

  private refreshLegacyHudCopy(internals: LapNativeShellInternals): void {
    const current = internals.currentPlayer();
    if (!current || !internals.match) return;

    const progress = demoMatchLapProgress(internals.match);
    internals.turnText?.setText(
      `🏁 ${progress.completedPlayers}/${progress.totalPlayers} ĐỦ VÒNG • ${current.name}`,
    );

    if (internals.phaseText) {
      const phaseLabel = internals.phaseText.text.split('•')[0]?.trim() || internals.match.turn.phase;
      internals.phaseText.setText(
        `${phaseLabel} • 🏁 ${progress.completedPlayers}/${progress.totalPlayers} • ${computeMatchChecksum(internals.match)}`,
      );
    }
  }

  private refreshLegacyStaticCopy(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;

      if (object.text.includes('MATCH SHELL • 3 VÒNG')) {
        object.setText('MATCH • MỖI NGƯỜI ĐỦ 1 VÒNG → CHỐT B$');
      } else if (object.text.includes('demo 3 vòng')) {
        object.setText(object.text.replace('demo 3 vòng', 'đủ 1 vòng/người'));
      } else if (object.text.includes('MATCH SHELL • 3 VONG')) {
        object.setText('MATCH • MOI NGUOI DU 1 VONG → CHOT B$');
      }
    }
  }

  private refreshLegacyShellCopy(internals: LapNativeShellInternals): void {
    if (!internals.match) return;
    const progress = demoMatchLapProgress(internals.match);

    for (const object of internals.shellOverlay) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;

      if (
        object.text.includes('Luật demo tạm:') ||
        object.text.includes('Kết thúc vòng cuối') ||
        object.text.includes('chưa phải win condition final')
      ) {
        object.setText(
          'Luật playtest: mỗi người hoàn thành ít nhất 1 vòng quanh bàn.\n' +
          `Tiến độ hiện tại: 🏁 ${progress.completedPlayers}/${progress.totalPlayers} người đã đủ vòng.\n` +
          'Chỉ sau khi cả bàn đủ vòng mới khóa B$; tiền cao nhất thắng, bằng tiền thì đồng hạng.',
        );
      } else if (
        object.text.includes('Demo tạm kết thúc sau') ||
        object.text.includes('kết thúc sau') && object.text.includes('vòng')
      ) {
        object.setText(
          `🏁 ${progress.completedPlayers}/${progress.totalPlayers} người đã đủ vòng • bảng B$ đã khóa authoritative`,
        );
      }
    }
  }

  private lapNativeLogCopy(message: string): string {
    if (/Demo bắt đầu\s*•\s*\d+ vòng\s*•\s*\d+ lượt\./u.test(message)) {
      return '🚦 Trận bắt đầu • mục tiêu: mỗi người hoàn thành ít nhất 1 vòng.';
    }
    if (message.includes('Demo match đã kết thúc.')) {
      return '🏁 Cả bàn đã đủ vòng • bảng B$ đã chốt.';
    }
    if (message.includes('Demo hotseat sẵn sàng.')) {
      return message.replace('Demo hotseat sẵn sàng.', 'Hotseat sẵn sàng.');
    }
    return message;
  }

  private updateBuildLabels040(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.39 FINAL B$ LOCK TRANSITION')) {
        object.setText('CITY • MVP 0.1.40 LAP-NATIVE SHELL CLEANUP');
      } else if (object.text.includes('PLAYTEST 0.1.39 • FINAL RESULT CLARITY')) {
        object.setText('PLAYTEST 0.1.40 • NO LEGACY ROUND COPY');
      }
    }
  }
}
