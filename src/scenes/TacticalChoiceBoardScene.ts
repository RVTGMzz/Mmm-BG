import Phaser from 'phaser';
import cardsJson from '../content/core/cards_mvp.json';
import type { ClientIntentType } from '../core/authority';
import { getValidTargets, type CardDefinition } from '../core/cards';
import type { MatchEventValue, MatchState } from '../core/matchState';
import { MVP_MAX_CARD_PLAYS_PER_TURN } from '../core/rules';
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

    this.updateBuildLabels028();
  }

  private updateBuildLabels028(): void {
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
