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
  private holdStatusSkin?: Phaser.GameObjects.Graphics;
  private holdSignature = '';

  create(): void {
    super.create();
    this.installHeldCardGuard();

    this.holdStatusSkin = this.add.graphics()
      .setDepth(1001)
      .setVisible(false)
      .setName('special-hold-banner-skin-ch1712');

    this.holdStatus = this.add.text(640, 112, '', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4b302a',
      padding: { x: 12, y: 7 },
      align: 'center',
      fixedWidth: 500,
    }).setOrigin(0.5).setDepth(1002).setVisible(false)
      .setName('special-hold-banner-text-ch1712');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.holdStatus?.destroy();
      this.holdStatusSkin?.destroy();
      this.holdStatus = undefined;
      this.holdStatusSkin = undefined;
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
      this.holdStatusSkin?.setVisible(false);
      return;
    }

    const rule = player.specialHold === 'jail'
      ? 'ĐỔ 1 / 3 / 5 ĐỂ THOÁT • TRƯỢT = HẾT LƯỢT'
      : 'ĐỔ ĐÚNG 2 / 4 / 5 ĐỂ XUẤT VIỆN • TRƯỢT = HẾT LƯỢT';
    const isJail = player.specialHold === 'jail';
    const accent = isJail ? 0xf0a83c : 0xf28bbb;
    this.holdStatusSkin?.clear();
    this.holdStatusSkin?.fillStyle(0x4b302a, 0.22);
    this.holdStatusSkin?.fillRoundedRect(371, 83, 546, 66, 20);
    this.holdStatusSkin?.fillStyle(0xfff7e8, 0.995);
    this.holdStatusSkin?.fillRoundedRect(367, 78, 546, 66, 20);
    this.holdStatusSkin?.fillStyle(accent, 1);
    this.holdStatusSkin?.fillRoundedRect(367, 78, 546, 14, { tl: 20, tr: 20, bl: 7, br: 7 });
    this.holdStatusSkin?.fillStyle(0xffffff, 0.42);
    this.holdStatusSkin?.fillRoundedRect(380, 82, 520, 7, 4);
    this.holdStatusSkin?.lineStyle(4, 0x4b302a, 0.92);
    this.holdStatusSkin?.strokeRoundedRect(367, 78, 546, 66, 20);
    this.holdStatusSkin?.setVisible(true);

    this.holdStatus
      .setText(`${specialHoldLabel057(player.specialHold)} • ${player.name}\n${rule}`)
      .setVisible(true);
  }
}
