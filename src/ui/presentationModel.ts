import cardReactionsJson from '../content/core/card_reactions_023.json';
import cardsJson from '../content/core/cards_mvp.json';
import reactionsJson from '../content/core/reactions_mvp_demo.json';
import type { CardDefinition } from '../core/cards';
import type { MatchEvent } from '../core/matchState';
import {
  formatReactionText,
  type ReactionEventDefinition,
  type ReactionSpeakerRole,
} from '../core/reactions';
import type { FaceExpression } from '../core/session';
import type { PlayerState } from '../core/types';
import { tileIdentityCopy } from './tileIdentity';

const REACTIONS = [
  ...(reactionsJson as ReactionEventDefinition[]),
  ...(cardReactionsJson as ReactionEventDefinition[]),
];
const CARDS = cardsJson as CardDefinition[];

export type PresentationKind =
  | 'dice_roll'
  | 'move_step'
  | 'tile_land'
  | 'ready_bonus'
  | 'card_draw'
  | 'card_blocked'
  | 'card_play'
  | 'news';

export interface PresentationReactionLine {
  sequence: number;
  delayMs: number;
  durationMs: number;
  speakerId?: number;
  speakerName: string;
  speakerRole: ReactionSpeakerRole;
  expression: FaceExpression;
  text: string;
}

export interface PresentationEventModel {
  eventSeq: number;
  kind: PresentationKind;
  eyebrow: string;
  title: string;
  rarity: string;
  impact: string;
  description: string;
  summary: string;
  actorId?: number;
  actorName: string;
  targetId?: number;
  targetName?: string;
  reactionEventId?: string;
  reactions: PresentationReactionLine[];
  holdMs: number;
  tileType?: string;
  amount?: number;
  affectedPlayerIds: number[];
  roll?: number;
  step?: number;
  fromNodeId?: number;
  toNodeId?: number;
}

function dataString(event: MatchEvent, key: string): string {
  const value = event.data[key];
  if (value === null || value === undefined) return '';
  return String(value);
}

function dataNumber(event: MatchEvent, key: string, allowNegative = false): number | undefined {
  const value = Number(event.data[key]);
  if (!Number.isFinite(value)) return undefined;
  if (!allowNegative && value < 0) return undefined;
  return value;
}

function parsePlayerIds(raw: string): number[] {
  const ids = raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 0);
  return [...new Set(ids)];
}

function affectedPlayerIds(event: MatchEvent, targetId?: number): number[] {
  const explicit = parsePlayerIds(dataString(event, 'affectedPlayerIds'));
  if (explicit.length > 0) return explicit;
  const fallback = [event.actorId, targetId].filter((value): value is number => value !== undefined && value >= 0);
  return [...new Set(fallback)];
}

function playerById(players: PlayerState[], id: number | undefined): PlayerState | undefined {
  if (id === undefined) return undefined;
  return players.find((player) => player.id === id);
}

function playerName(players: PlayerState[], id: number | undefined, fallback = 'MeMeMe'): string {
  return playerById(players, id)?.name ?? (id === undefined ? fallback : `P${id + 1}`);
}

function speakerIdForRole(role: ReactionSpeakerRole, event: MatchEvent): number | undefined {
  switch (role) {
    case 'caster':
    case 'subject':
      return event.actorId;
    case 'target':
      return dataNumber(event, 'targetId');
    case 'spectator':
      return dataNumber(event, 'spectatorId');
  }
}

function cardReactionEventId(event: MatchEvent): string | undefined {
  const cardId = dataString(event, 'cardId');
  const card = CARDS.find((entry) => entry.id === cardId);
  if (!card) return undefined;

  switch (card.effect.type) {
    case 'steal_money':
      return 'CARD_STEAL_023';
    case 'block_cards':
      return 'CARD_BLOCK_023';
    case 'percent_loss_all_others':
      return 'CARD_GROUP_CURSE_023';
    case 'swap_money':
      return 'CARD_SWAP_023';
  }
}

function reactionLines(
  event: MatchEvent,
  players: PlayerState[],
  reactionEventIdOverride?: string,
): PresentationReactionLine[] {
  const reactionEventId = reactionEventIdOverride ?? dataString(event, 'reactionEventId');
  if (!reactionEventId) return [];

  const definition = REACTIONS.find((entry) => entry.id === reactionEventId);
  if (!definition) return [];

  const actorName = playerName(players, event.actorId);
  const targetId = dataNumber(event, 'targetId');
  const spectatorId = dataNumber(event, 'spectatorId');
  const targetName = playerName(players, targetId, actorName);
  const spectatorName = playerName(players, spectatorId, 'Cả bàn');
  const amount = Math.abs(Number(event.data.amount ?? 0));

  const variables: Record<string, string | number> = {
    amount: Number.isFinite(amount) ? amount : 0,
    caster: actorName,
    subject: actorName,
    target: targetName,
    spectator: spectatorName,
  };

  return [...definition.steps]
    .sort((left, right) => left.sequence - right.sequence)
    .map((step) => {
      const speakerId = speakerIdForRole(step.speakerRole, event);
      const speakerName = playerName(players, speakerId, step.speakerRole === 'spectator' ? 'Cả bàn' : actorName);
      const variantIndex = speakerId === undefined || step.variants.length === 0
        ? 0
        : Math.abs(speakerId) % step.variants.length;
      const variant = step.variants[variantIndex] ?? step.variants[0];

      return {
        sequence: step.sequence,
        delayMs: step.delayMs,
        durationMs: step.durationMs,
        speakerId,
        speakerName,
        speakerRole: step.speakerRole,
        expression: step.expression,
        text: variant ? formatReactionText(variant.text, variables) : '',
      };
    })
    .filter((line) => line.text.trim().length > 0);
}

function baseModel(event: MatchEvent, players: PlayerState[]): Pick<PresentationEventModel, 'eventSeq' | 'actorId' | 'actorName' | 'affectedPlayerIds'> {
  const targetId = dataNumber(event, 'targetId');
  return {
    eventSeq: event.seq,
    actorId: event.actorId,
    actorName: playerName(players, event.actorId),
    affectedPlayerIds: affectedPlayerIds(event, targetId),
  };
}

function tileLandingModel(event: MatchEvent, players: PlayerState[]): PresentationEventModel {
  const base = baseModel(event, players);
  const nodeId = dataNumber(event, 'nodeId') ?? -1;
  const tileType = dataString(event, 'tileType') || 'normal';
  const amount = dataNumber(event, 'value', true) ?? 0;
  const copy = tileIdentityCopy(tileType, nodeId, amount);

  return {
    ...base,
    kind: 'tile_land',
    eyebrow: `${base.actorName} • ĐÁP Ô`,
    title: copy.title,
    rarity: '',
    impact: copy.impact,
    description: copy.description,
    summary: '',
    reactions: [],
    holdMs: copy.holdMs,
    tileType,
    amount,
  };
}

export function buildPresentationModel(event: MatchEvent, players: PlayerState[]): PresentationEventModel | undefined {
  const base = baseModel(event, players);
  const targetId = dataNumber(event, 'targetId');
  const targetName = targetId === undefined ? undefined : playerName(players, targetId);
  const title = dataString(event, 'title');
  const rarity = dataString(event, 'rarity');
  const impact = dataString(event, 'impact');
  const description = dataString(event, 'description');
  const summary = dataString(event, 'summary');
  const reactionEventId = dataString(event, 'reactionEventId') || undefined;

  if (event.type === 'dice_roll') {
    const roll = dataNumber(event, 'result') ?? 1;
    return {
      ...base,
      kind: 'dice_roll',
      eyebrow: `${base.actorName} • XÚC XẮC`,
      title: String(roll),
      rarity: '',
      impact: '🎲',
      description: '',
      summary: '',
      reactions: [],
      holdMs: 780,
      roll,
    };
  }

  if (event.type === 'move_step') {
    return {
      ...base,
      kind: 'move_step',
      eyebrow: '',
      title: '',
      rarity: '',
      impact: '',
      description: '',
      summary: '',
      reactions: [],
      holdMs: 230,
      roll: dataNumber(event, 'roll'),
      step: dataNumber(event, 'step'),
      fromNodeId: dataNumber(event, 'fromNodeId'),
      toNodeId: dataNumber(event, 'toNodeId'),
    };
  }

  if (event.type === 'tile_land') return tileLandingModel(event, players);

  if (event.type === 'ready_pass') {
    const amount = dataNumber(event, 'amount', true) ?? 100;
    return {
      ...base,
      kind: 'ready_bonus',
      eyebrow: `${base.actorName} • QUA READY`,
      title: `+${Math.abs(amount)} B$`,
      rarity: '',
      impact: '🏁✨',
      description: 'Thưởng hoàn thành một vòng!',
      summary: '',
      reactions: [],
      holdMs: 1800,
      amount,
    };
  }

  if (event.type === 'card_draw') {
    return {
      ...base,
      kind: 'card_draw',
      eyebrow: 'LÁ BÀI • RÚT ĐƯỢC',
      title: title || dataString(event, 'cardId') || 'Lá Bài',
      rarity,
      impact,
      description,
      summary: '',
      reactions: [],
      holdMs: 2600,
    };
  }

  if (event.type === 'card_draw_blocked') {
    return {
      ...base,
      kind: 'card_blocked',
      eyebrow: 'LÁ BÀI • GIỚI HẠN TAY',
      title: 'Không thể rút thêm',
      rarity: '',
      impact: '✋',
      description: 'Tay bài đã chạm giới hạn MVP.',
      summary: '',
      reactions: [],
      holdMs: 2000,
    };
  }

  if (event.type === 'card_play') {
    const resolvedReactionEventId = cardReactionEventId(event) ?? reactionEventId;
    return {
      ...base,
      kind: 'card_play',
      eyebrow: 'LÁ BÀI • KÍCH HOẠT',
      title: title || dataString(event, 'cardId') || 'Lá Bài',
      rarity,
      impact,
      description,
      summary,
      targetId,
      targetName,
      reactionEventId: resolvedReactionEventId,
      reactions: reactionLines(event, players, resolvedReactionEventId),
      holdMs: 3500,
      amount: dataNumber(event, 'amount', true),
    };
  }

  if (event.type === 'news') {
    return {
      ...base,
      kind: 'news',
      eyebrow: 'TIN TỨC • BREAKING',
      title: title || dataString(event, 'newsId') || 'Tin Tức',
      rarity,
      impact,
      description,
      summary,
      targetId,
      targetName,
      reactionEventId,
      reactions: reactionLines(event, players),
      holdMs: 3800,
      amount: dataNumber(event, 'amount', true),
    };
  }

  return undefined;
}
