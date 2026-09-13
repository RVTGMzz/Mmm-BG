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

export type PresentationKind =
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

function tileLandingModel(event: MatchEvent, players: PlayerState[]): PresentationEventModel {
  const actorId = event.actorId;
  const actorName = playerName(players, actorId);
  const tileType = dataString(event, 'tileType') || 'normal';
  const amount = dataNumber(event, 'value', true) ?? 0;

  const tileCopy: Record<string, { title: string; impact: string; description: string }> = {
    normal: { title: 'Ô THƯỜNG', impact: '👟', description: 'Đáp xuống an toàn. Không có biến cố.' },
    money: {
      title: amount >= 0 ? `+${amount} B$` : `${amount} B$`,
      impact: amount >= 0 ? '💰' : '💸',
      description: amount >= 0 ? 'Ví dày thêm một chút.' : 'Ví vừa nhẹ đi một chút.',
    },
    card: { title: 'Ô LÁ BÀI', impact: '🃏', description: 'Chuẩn bị rút một Lá Bài.' },
    news: { title: 'Ô TIN TỨC', impact: '📰', description: 'Thành phố sắp có biến.' },
    ready: { title: 'READY', impact: '🏁', description: 'Về lại điểm xuất phát.' },
  };
  const copy = tileCopy[tileType] ?? tileCopy.normal;

  return {
    eventSeq: event.seq,
    kind: 'tile_land',
    eyebrow: `${actorName} • ĐÁP Ô`,
    title: copy.title,
    rarity: '',
    impact: copy.impact,
    description: copy.description,
    summary: '',
    actorId,
    actorName,
    reactions: [],
    holdMs: tileType === 'normal' ? 520 : 760,
    tileType,
    amount,
  };
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

  if (event.type === 'tile_land') return tileLandingModel(event, players);

  if (event.type === 'ready_pass') {
    const amount = dataNumber(event, 'amount', true) ?? 100;
    return {
      eventSeq: event.seq,
      kind: 'ready_bonus',
      eyebrow: `${actorName} • QUA READY`,
      title: `+${Math.abs(amount)} B$`,
      rarity: '',
      impact: '🏁✨',
      description: 'Thưởng hoàn thành một vòng!',
      summary: '',
      actorId,
      actorName,
      reactions: [],
      holdMs: 900,
      amount,
    };
  }

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
      amount: dataNumber(event, 'amount', true),
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
      amount: dataNumber(event, 'amount', true),
    };
  }

  return undefined;
}
