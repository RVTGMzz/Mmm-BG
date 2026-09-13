import Phaser from 'phaser';
import cardsJson from '../content/core/cards_mvp.json';
import type { ClientIntentType } from '../core/authority';
import { browserSession } from '../core/browserSession';
import { getValidTargets, type CardDefinition } from '../core/cards';
import type { MatchEventValue, MatchState } from '../core/matchState';
import { MVP_MAX_CARD_PLAYS_PER_TURN } from '../core/rules';
import { cpuQuirkLine, shouldCpuQuirk } from '../core/testBot';
import type { TurnPhaseMachine } from '../core/turnPhase';
import type { PlayerState } from '../core/types';
import { showCardHandPicker } from '../ui/CardHandPicker';
import { showTacticalChoicePicker } from '../ui/TacticalChoicePicker';
import { showTargetPicker } from '../ui/TargetPicker';
import { TurnStakesBoardScene } from './TurnStakesBoardScene';

const CARDS = cardsJson as CardDefinition[];

type TacticalBoardInternals = {
  match: MatchState;
  phase: TurnPhaseMachine;
  cardPickerOpen: boolean;
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
  refreshHud(): void;
  flashCenter(message: string, color: string): void;
  handleUseCard(): Promise<void>;
};

export class TacticalChoiceBoardScene extends TurnStakesBoardScene {
  private lastNpcQuirkSignature = '';
  private npcQuirkBubble?: Phaser.GameObjects.Container;

  create(): void {
    super.create();

    const internals = this as unknown as TacticalBoardInternals;
    internals.handleUseCard = async () => {
      if (!internals.phase.can('use_card') || !internals.canControlCurrentPlayer() || internals.cardPickerOpen) return;
      const caster = internals.currentPlayer();
      if (!caster) return;

      if (caster.cardBlockTurns > 0) {
        internals.flashCenter('🔒 BỊ KHÓA LÁ BÀI!', '#c34a44');
        return;
      }
      if (caster.cardsPlayedThisTurn >= MVP_MAX_CARD_PLAYS_PER_TURN) {
        internals.flashCenter('🃏 ĐÃ DÙNG LÁ BÀI LƯỢT NÀY', '#8f68af');
        return;
      }
      if (caster.handCardIds.length === 0) {
        internals.flashCenter('🃏 CHƯA CÓ LÁ BÀI', '#8f68af');
        return;
      }

      internals.cardPickerOpen = true;
      internals.refreshHud();
      try {
        const selection = await showCardHandPicker(this, caster, caster.handCardIds, CARDS);
        if (!selection) return;

        const { card } = selection;
        let targetId = -1;
        let choice: MatchEventValue = null;

        if (card.effect.type === 'tactical_choice') {
          const tacticalChoice = await showTacticalChoicePicker(this, caster, internals.match.players, card);
          if (!tacticalChoice) return;
          choice = tacticalChoice;
        } else if (card.targetMode === 'single_other') {
          const target = await showTargetPicker(this, caster, getValidTargets(internals.match.players, caster.id));
          if (!target) return;
          targetId = target.id;
        }

        internals.submitIntent('play_card', { cardId: card.id, targetId, choice });
      } finally {
        internals.cardPickerOpen = false;
        internals.refreshHud();
      }
    };

    this.updateBuildLabels();
    this.events.once('shutdown', () => {
      this.npcQuirkBubble?.destroy();
      this.npcQuirkBubble = undefined;
      this.lastNpcQuirkSignature = '';
    });
  }

  update(): void {
    super.update();
    this.maybeShowNpcQuirk();
  }

  private maybeShowNpcQuirk(): void {
    const internals = this as unknown as TacticalBoardInternals;
    const player = internals.currentPlayer();
    if (!player || !browserSession.isCpuSeat(player.id)) return;
    if (internals.match.turn.phase !== 'PRE_ROLL_ACTION' || player.handCardIds.length === 0) return;

    const cardId = player.handCardIds[0] ?? '';
    if (!shouldCpuQuirk(internals.match, player.id, cardId)) return;
    const signature = `${internals.match.turn.turnNumber}:${internals.match.turn.revision}:${player.id}:${cardId}`;
    if (signature === this.lastNpcQuirkSignature) return;
    this.lastNpcQuirkSignature = signature;
    this.showNpcQuirkBubble(player, cpuQuirkLine(internals.match.turn.turnNumber, player.id));
  }

  private showNpcQuirkBubble(player: PlayerState, message: string): void {
    this.npcQuirkBubble?.destroy();
    const left = player.id % 2 === 0;
    const x = left ? 215 : 1065;
    const y = 535;
    const bubble = this.add.container(x + (left ? -24 : 24), y).setDepth(948).setAlpha(0);
    this.npcQuirkBubble = bubble;

    const panel = this.add.graphics();
    panel.fillStyle(0xfffbf3, 0.985);
    panel.fillRoundedRect(-170, -42, 340, 84, 18);
    panel.lineStyle(3, 0xf2b84b, 0.95);
    panel.strokeRoundedRect(-170, -42, 340, 84, 18);
    const name = this.add.text(-145, -28, `${player.name} 🤖`, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#6a4b12',
    });
    const text = this.add.text(-145, 2, message, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#201d1a',
      wordWrap: { width: 285 },
    }).setOrigin(0, 0.5);
    bubble.add([panel, name, text]);

    this.tweens.add({ targets: bubble, x, alpha: 1, duration: 180, ease: 'Sine.easeOut' });
    this.time.delayedCall(4500, () => {
      if (!bubble.active) return;
      this.tweens.add({
        targets: bubble, alpha: 0, y: y - 8, duration: 260, ease: 'Sine.easeIn',
        onComplete: () => {
          if (this.npcQuirkBubble === bubble) this.npcQuirkBubble = undefined;
          bubble.destroy();
        },
      });
    });
  }

  private updateBuildLabels(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      const current = object.text;
      if (current.includes('CITY • MVP 0.1.26 TURN STAKES')) {
        object.setText('CITY • MVP 0.1.28 NPC BANTER');
      } else if (current.includes('PLAYTEST 0.1.26 • TURN STAKES')) {
        object.setText('PLAYTEST 0.1.28 • NPC BANTER');
      }
    }
  }
}
