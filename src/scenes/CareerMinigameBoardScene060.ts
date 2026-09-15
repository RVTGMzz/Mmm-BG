import type { MatchState } from '../core/matchState';
import { CareerMinigameBoardScene059 } from './CareerMinigameBoardScene059';

type NetworkStateSource = 'host' | 'state' | 'snapshot';

type PacingInternals060 = {
  match: MatchState;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
};

/**
 * 0.1.60 gameplay changes live in the HOST/replay economy layer.
 * This wrapper only gives the new finish/score-lock rule a clear presentation beat.
 */
export class CareerMinigameBoardScene060 extends CareerMinigameBoardScene059 {
  create(): void {
    super.create();
    this.installFinishLockFeedback();
  }

  private installFinishLockFeedback(): void {
    const internals = this as unknown as PacingInternals060;
    const originalApplyNetworkState = internals.applyNetworkState.bind(this);

    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      const previousEventSeq = internals.match.nextEventSeq;
      const finishEvent = state.eventLog.find(
        (event) =>
          event.seq >= previousEventSeq &&
          event.type === 'ready_pass' &&
          event.data.finishLocked === true,
      );

      originalApplyNetworkState(state, commandSeq, checksum, source);
      if (source === 'snapshot' || !finishEvent) return;

      const player = state.players.find((entry) => entry.id === finishEvent.actorId);
      this.showFinishLockToast(player?.name ?? 'Người chơi');
    };
  }

  private showFinishLockToast(playerName: string): void {
    const root = this.add.container(640, 102).setDepth(985).setScrollFactor(0).setAlpha(0);
    const panel = this.add.rectangle(0, 0, 560, 70, 0x24211d, 0.97)
      .setStrokeStyle(4, 0xffd34d, 1);
    const title = this.add.text(0, -10, `🏁 ${playerName} VỀ ĐÍCH`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const sub = this.add.text(0, 18, 'B$ ĐÃ KHÓA • NGHỈ CÁC LƯỢT CÒN LẠI', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd34d',
    }).setOrigin(0.5);
    root.add([panel, title, sub]);

    this.tweens.add({ targets: root, alpha: 1, y: 118, duration: 180, ease: 'Back.easeOut' });
    this.time.delayedCall(1800, () => {
      this.tweens.add({
        targets: root,
        alpha: 0,
        y: 96,
        duration: 220,
        onComplete: () => root.destroy(true),
      });
    });
  }
}
