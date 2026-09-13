import reactionsJson from '../content/core/reactions_mvp_demo.json';
import type { MatchEvent } from '../core/matchState';
import {
  formatReactionText,
  type ReactionEventDefinition,
  type ReactionSpeakerRole,
} from '../core/reactions';
import type { FaceExpression } from '../core/session';
import type { PlayerState } from '../core/types';

const REACTIONS = reactionsJson as ReactionEventDefinition[];

export type PresentationKind = 'card_draw' | 'card_blocked' | 'card_play' | 'news';

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
}

function dataString(event: MatchEvent, key: string): string {
  const value = event.data[key];
  if (value === null || value === undefined) return '';
  return String(value);
}

function dataNumber(event: MatchEvent, key: string): number | undefined {
  const value = Number(event.data[key]);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function playerById(players: PlayerState[], id: number | undefined): PlayerState | undefined {
  if (id === undefined) return undefined;
  return players.find((player) => player.id === id);
}

function playerName(players: PlayerState[], id: number | undefined, fallback = 'MeMeMe'): string {
  return playerById(players, id)?.name ?? (id === undefined ? fallback : `P${id + 1}`);
}

function speakerIdForRole(
  role: ReactionSpeakerRole,
  event: MatchEvent,
): number | undefined {
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

function reactionLines(event: MatchEvent, players: PlayerState[]): PresentationReactionLine[] {
  const reactionEventId = dataString(event, 'reactionEventId');
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
      // Personality is not yet part of synced presentation state. Pick a stable
      // seat-based variant so host and client always render the same line.
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

export function buildPresentationModel(
  event: MatchEvent,
  players: PlayerState[],
): PresentationEventModel | undefined {
  const actorId = event.actorId;
  const actorName = playerName(players, actorId);
  const targetId = dataNumber(event, 'targetId');
  const targetName = targetId === undefined ? undefined : playerName(players, targetId);
  const title = dataString(event, 'title');
  const rarity = dataString(event, 'rarity');
  const impact = dataString(event, 'impact');
  const description = dataString(event, 'description');
  const summary = dataString(event, 'summary');
  const reactionEventId = dataString(event, 'reactionEventId') || undefined;

  if (event.type === 'card_draw') {
    return {
      eventSeq: event.seq,
      kind: 'card_draw',
      eyebrow: 'LÁ BÀI • RÚT ĐƯỢC',
      title: title || dataString(event, 'cardId') || 'Lá Bài',
      rarity,
      impact,
      description,
      summary: '',
      actorId,
      actorName,
      reactions: [],
      holdMs: 1350,
    };
  }

  if (event.type === 'card_draw_blocked') {
    return {
      eventSeq: event.seq,
      kind: 'card_blocked',
      eyebrow: 'LÁ BÀI • GIỚI HẠN TAY',
      title: 'Không thể rút thêm',
      rarity: '',
      impact: '✋',
      description: 'Tay bài đã chạm giới hạn MVP.',
      summary: '',
      actorId,
      actorName,
      reactions: [],
      holdMs: 1050,
    };
  }

  if (event.type === 'card_play') {
    return {
      eventSeq: event.seq,
      kind: 'card_play',
      eyebrow: 'LÁ BÀI • KÍCH HOẠT',
      title: title || dataString(event, 'cardId') || 'Lá Bài',
      rarity,
      impact,
      description,
      summary,
      actorId,
      actorName,
      targetId,
      targetName,
      reactionEventId,
      reactions: reactionLines(event, players),
      holdMs: 2050,
    };
  }

  if (event.type === 'news') {
    return {
      eventSeq: event.seq,
      kind: 'news',
      eyebrow: 'TIN TỨC • BREAKING',
      title: title || dataString(event, 'newsId') || 'Tin Tức',
      rarity,
      impact,
      description,
      summary,
      actorId,
      actorName,
      targetId,
      targetName,
      reactionEventId,
      reactions: reactionLines(event, players),
      holdMs: 2200,
    };
  }

  return undefined;
}
