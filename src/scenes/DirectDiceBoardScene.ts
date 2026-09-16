import Phaser from 'phaser';
import { browserSession } from '../core/browserSession';
import { pendingFreshRollAfterRelease066 } from '../core/cpuReleaseResume066';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { shouldShowDirectTurnDice } from '../ui/directDicePolicy';
import { TacticalChoiceBoardScene } from './TacticalChoiceBoardScene';

type DirectDiceInternals = {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended' };
  cardPickerOpen: boolean;
  presentation?: { isBlocking(): boolean };
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
  handleRoll(): void;
};

const PIP_POSITIONS = [-22, 0, 22].flatMap((y) => [-22, 0, 22].map((x) => ({ x, y })));
const IDLE_PIPS = new Set([0, 2, 4, 6, 8]);

export class DirectDiceBoardScene extends TacticalChoiceBoardScene {
  private directDice?: Phaser.GameObjects.Container;
  private directDiceTween?: Phaser.Tweens.Tween;
  private rollPendingTurn?: number;
  private handledFreshReleaseEventSeq = 0;

  create(): void {
    super.create();
    this.removeLegacyRollButton();
    this.createDirectDice();
    this.updateBuildLabels030();
    this.handledFreshReleaseEventSeq = 0;

    this.events.on(Phaser.Scenes.Events.UPDATE, this.syncDirectDice, this);
    this.events.once('shutdown', () => {
      this.events.off(Phaser.Scenes.Events.UPDATE, this.syncDirectDice, this);
      this.directDiceTween?.stop();
      this.directDiceTween = undefined;
      this.directDice?.destroy();
      this.directDice = undefined;
      this.rollPendingTurn = undefined;
      this.handledFreshReleaseEventSeq = 0;
    });
  }

  private removeLegacyRollButton(): void {
    for (const object of this.children.list) {
      if (object instanceof Phaser.GameObjects.Rectangle) {
        if (Math.abs(object.x - 615) < 2 && Math.abs(object.y - 681) < 2 && Math.abs(object.width - 150) < 4) {
          object.disableInteractive().setVisible(false);
        } else if (Math.abs(object.x - 640) < 2 && Math.abs(object.y - 681) < 2 && Math.abs(object.width - 620) < 4) {
          object.setDisplaySize(470, 58);
        } else if (Math.abs(object.x - 790) < 2 && Math.abs(object.y - 681) < 2 && Math.abs(object.width - 150) < 4) {
          object.setX(745);
        }
      }

      if (object instanceof Phaser.GameObjects.Text) {
        if (Math.abs(object.x - 615) < 2 && Math.abs(object.y - 681) < 2) {
          object.setVisible(false);
        } else if (Math.abs(object.x - 350) < 2 && Math.abs(object.y - 681) < 2) {
          object.setX(515);
        } else if (Math.abs(object.x - 790) < 2 && Math.abs(object.y - 681) < 2) {
          object.setX(745);
        }
      }
    }
  }

  private createDirectDice(): void {
    const container = this.add.container(640, 344).setDepth(918).setVisible(false).setAlpha(0);
    this.directDice = container;

    const glow = this.add.circle(0, 0, 78, 0xffd34d, 0.12);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-50, -46, 100, 100, 22);
    shadow.setPosition(0, 8);

    const die = this.add.graphics();
    die.fillStyle(0xfffbf3, 1);
    die.fillRoundedRect(-50, -50, 100, 100, 22);
    die.lineStyle(5, 0x24211d, 1);
    die.strokeRoundedRect(-50, -50, 100, 100, 22);

    const pips = PIP_POSITIONS.map((position, index) =>
      this.add.circle(position.x, position.y, 7, 0x24211d, 1).setVisible(IDLE_PIPS.has(index)),
    );

    const label = this.add.text(0, 76, 'BẤM XÚC XẮC', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#202020',
      backgroundColor: '#fffaf0',
      padding: { x: 11, y: 5 },
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(0, 8, 132, 150, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });

    container.add([glow, shadow, die, ...pips, label, hitArea]);

    hitArea.on('pointerover', () => {
      if (!container.visible) return;
      this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 90, ease: 'Sine.easeOut' });
    });
    hitArea.on('pointerout', () => {
      if (!container.visible) return;
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90, ease: 'Sine.easeOut' });
    });
    hitArea.on('pointerdown', () => {
      const internals = this as unknown as DirectDiceInternals;
      const player = internals.currentPlayer();
      if (!player) return;
      const presentationBlocking = internals.presentation?.isBlocking() ?? false;
      const allowed = shouldShowDirectTurnDice({
        phase: internals.match.turn.phase,
        canControl: internals.canControlCurrentPlayer(),
        isCpu: browserSession.isCpuSeat(player.id),
        shellActive: internals.shell.status === 'active',
        cardPickerOpen: internals.cardPickerOpen,
        presentationBlocking,
      });
      if (!allowed || this.rollPendingTurn === internals.match.turn.turnNumber) return;
      this.rollPendingTurn = internals.match.turn.turnNumber;
      this.hideDirectDiceImmediately();
      internals.handleRoll();
    });
  }

  private syncDirectDice(): void {
    const internals = this as unknown as DirectDiceInternals;
    const player = internals.currentPlayer();
    if (!this.directDice || !player) return;

    const presentationBlocking = internals.presentation?.isBlocking() ?? false;

    if (
      this.rollPendingTurn !== undefined &&
      this.rollPendingTurn !== internals.match.turn.turnNumber
    ) {
      this.rollPendingTurn = undefined;
    }

    // A successful Jail/Hospital release consumes a D6 without advancing the turn.
    // Once its modal is gone, unlock the direct die so the HUMAN actor can make the
    // fresh movement roll in the same turn. CPU seats keep using the 0.1.66 HOST watchdog.
    const freshReleaseEventSeq = pendingFreshRollAfterRelease066(
      internals.match,
      presentationBlocking,
      this.handledFreshReleaseEventSeq,
    );
    if (freshReleaseEventSeq !== undefined) {
      this.handledFreshReleaseEventSeq = freshReleaseEventSeq;
      if (!browserSession.isCpuSeat(player.id)) this.rollPendingTurn = undefined;
    }

    const shouldShow =
      this.rollPendingTurn !== internals.match.turn.turnNumber &&
      shouldShowDirectTurnDice({
        phase: internals.match.turn.phase,
        canControl: internals.canControlCurrentPlayer(),
        isCpu: browserSession.isCpuSeat(player.id),
        shellActive: internals.shell.status === 'active',
        cardPickerOpen: internals.cardPickerOpen,
        presentationBlocking,
      });

    if (shouldShow && !this.directDice.visible) {
      this.showDirectDice();
    } else if (!shouldShow && this.directDice.visible) {
      this.hideDirectDiceImmediately();
    }
  }

  private showDirectDice(): void {
    if (!this.directDice) return;
    this.directDiceTween?.stop();
    this.directDice.setVisible(true).setAlpha(0).setScale(0.88).setAngle(-3).setY(352);
    this.tweens.add({
      targets: this.directDice,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      y: 344,
      duration: 180,
      ease: 'Back.easeOut',
    });
    this.directDiceTween = this.tweens.add({
      targets: this.directDice,
      scaleX: 1.045,
      scaleY: 1.045,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private hideDirectDiceImmediately(): void {
    if (!this.directDice) return;
    this.directDiceTween?.stop();
    this.directDiceTween = undefined;
    this.tweens.killTweensOf(this.directDice);
    this.directDice.setVisible(false).setAlpha(0).setScale(1).setAngle(0).setY(344);
  }

  private updateBuildLabels030(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.29 MINI GAME + JOB FOUNDATION')) {
        object.setText('CITY • MVP 0.1.30 DIRECT TURN DICE');
      } else if (object.text.includes('PLAYTEST 0.1.29 • FUNCTION TILES')) {
        object.setText('PLAYTEST 0.1.30 • DIRECT DICE');
      }
    }
  }
}
