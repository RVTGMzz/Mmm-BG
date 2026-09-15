import Phaser from 'phaser';
import type { MatchState } from '../core/matchState';
import { specialHoldLabel057 } from '../core/specialLocations057';
import type { PlayerState } from '../core/types';
import { CareerMinigameBoardScene0561 } from './CareerMinigameBoardScene0561';

type SpecialUiInternals057 = {
  match: MatchState;
  currentPlayer(): PlayerState | undefined;
  handleUseCard(): Promise<void>;
  flashCenter(message: string, color: string): void;
};

/**
 * 0.1.57 adds authoritative special-location gameplay while deliberately reusing
 * the 0.1.56.1 canonical camera/HUD presentation architecture.
 */
export class CareerMinigameBoardScene057 extends CareerMinigameBoardScene0561 {
  private holdStatus?: Phaser.GameObjects.Text;
  private holdSignature = '';

  create(): void {
    super.create();
    this.installHeldCardGuard();
    this.holdStatus = this.add.text(640, 112, '', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#202020',
      backgroundColor: '#fff3c7',
      padding: { x: 12, y: 7 },
      align: 'center',
    }).setOrigin(0.5).setDepth(1002).setVisible(false);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.holdStatus?.destroy();
      this.holdStatus = undefined;
      this.holdSignature = '';
    });
  }

  update(): void {
    super.update();
    this.syncHoldStatus();
  }

  private internals057(): SpecialUiInternals057 {
    return this as unknown as SpecialUiInternals057;
  }

  private installHeldCardGuard(): void {
    const internals = this.internals057();
    const originalHandleUseCard = internals.handleUseCard.bind(this);
    internals.handleUseCard = async () => {
      const player = internals.currentPlayer();
      if (player?.specialHold) {
        const label = player.specialHold === 'jail' ? 'ĐỒN' : 'BỆNH VIỆN';
        internals.flashCenter(`⛔ ${label}: PHẢI ĐỔ XÚC XẮC THOÁT TRƯỚC`, '#c34a44');
        return;
      }
      await originalHandleUseCard();
    };
  }

  private syncHoldStatus(): void {
    const internals = this.internals057();
    const player = internals.currentPlayer();
    if (!player || !this.holdStatus) return;
    const signature = `${player.id}:${player.specialHold ?? 'free'}:${internals.match.turn.turnNumber}:${internals.match.turn.phase}`;
    if (signature === this.holdSignature) return;
    this.holdSignature = signature;

    if (!player.specialHold) {
      this.holdStatus.setVisible(false);
      return;
    }

    const rule = player.specialHold === 'jail'
      ? 'ĐỔ 1 / 3 / 5 ĐỂ THOÁT • TRƯỢT = HẾT LƯỢT'
      : 'ĐỔ ĐÚNG 2 / 4 / 5 ĐỂ XUẤT VIỆN • TRƯỢT = HẾT LƯỢT';
    this.holdStatus
      .setText(`${specialHoldLabel057(player.specialHold)} • ${player.name}\n${rule}`)
      .setVisible(true);
  }
}
