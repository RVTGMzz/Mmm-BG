export type MiniGameChoiceReceiptStatus = 'accepted' | 'duplicate' | 'rejected';

export interface MiniGameChoiceRoundState {
  sourceEventSeq: number;
  promptKey: string;
  playerIds: number[];
  allowedChoices: string[];
  submittedPlayerIds: number[];
  complete: boolean;
  /** Secret choices are omitted until every required seat has committed. */
  revealedChoices?: Record<string, string>;
}

export interface MiniGameChoiceSubmitMessage {
  kind: 'minigame_choice_submit';
  sourceEventSeq: number;
  promptKey: string;
  clientId: string;
  playerId: number;
  choice: string;
}

export interface MiniGameChoiceReceiptMessage {
  kind: 'minigame_choice_receipt';
  sourceEventSeq: number;
  promptKey: string;
  playerId: number;
  status: MiniGameChoiceReceiptStatus;
  reason?: string;
}

export interface MiniGameChoiceStateMessage {
  kind: 'minigame_choice_state';
  state: MiniGameChoiceRoundState;
}

export interface MiniGameChoiceSyncRequestMessage {
  kind: 'minigame_choice_sync_request';
  sourceEventSeq: number;
  clientId: string;
}

export type MiniGameChoiceMessage =
  | MiniGameChoiceSubmitMessage
  | MiniGameChoiceReceiptMessage
  | MiniGameChoiceStateMessage
  | MiniGameChoiceSyncRequestMessage;
