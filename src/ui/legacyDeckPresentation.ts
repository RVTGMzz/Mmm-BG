import type { PresentationEventModel } from './presentationModel';

export type LegacyDeckFamily = 'prophecy' | 'spell' | 'system';
export type LegacyDeckForm = 'portrait' | 'landscape' | 'standard';

export function legacyDeckFamilyForKind(kind: PresentationEventModel['kind']): LegacyDeckFamily {
  if (kind === 'news') return 'prophecy';
  if (kind === 'card_draw' || kind === 'card_play' || kind === 'card_blocked') return 'spell';
  return 'system';
}

export function legacyDeckFormForKind(kind: PresentationEventModel['kind']): LegacyDeckForm {
  const family = legacyDeckFamilyForKind(kind);
  if (family === 'prophecy') return 'portrait';
  if (family === 'spell') return 'landscape';
  return 'standard';
}

/**
 * Visible vocabulary only. Technical event/command names intentionally stay news/card_*
 * so replay, authority, checksum and saved protocol compatibility remain untouched.
 */
export function legacyDeckVisibleText(source: string): string {
  return source
    .replaceAll('TIN\nTỨC', 'TIÊN\nTRI')
    .replaceAll('TIN TỨC', 'TIÊN TRI')
    .replaceAll('CITY NEWS', 'TIÊN TRI')
    .replaceAll('TIÊN TRI • BREAKING', 'TIÊN TRI • LỜI SẤM')
    .replaceAll('LÁ\nBÀI', 'PHÉP\nTHUẬT')
    .replaceAll('LÁ BÀI', 'PHÉP THUẬT')
    .replaceAll('Lá Bài', 'Phép Thuật')
    .replaceAll('Lá bài', 'Phép thuật')
    .replaceAll('Lá chỉ', 'Phép chỉ')
    .replaceAll('DÙNG LÁ NÀY', 'DÙNG PHÉP NÀY')
    .replaceAll('CARD DROP', 'RÚT PHÉP')
    .replaceAll('CARD ACTION', 'PHÉP THUẬT')
    .replaceAll('HAND LIMIT', 'GIỚI HẠN PHÉP');
}

export function presentationParityFingerprint(models: readonly PresentationEventModel[]): string {
  return JSON.stringify(models.map((model) => ({
    eventSeq: model.eventSeq,
    kind: model.kind,
    family: legacyDeckFamilyForKind(model.kind),
    form: legacyDeckFormForKind(model.kind),
    eyebrow: legacyDeckVisibleText(model.eyebrow),
    title: legacyDeckVisibleText(model.title),
    rarity: model.rarity,
    impact: model.impact,
    description: legacyDeckVisibleText(model.description),
    summary: legacyDeckVisibleText(model.summary),
    actorId: model.actorId ?? null,
    targetId: model.targetId ?? null,
    affectedPlayerIds: [...model.affectedPlayerIds],
    roll: model.roll ?? null,
    amount: model.amount ?? null,
    reactions: model.reactions.map((reaction) => ({
      sequence: reaction.sequence,
      speakerId: reaction.speakerId ?? null,
      expression: reaction.expression,
      text: legacyDeckVisibleText(reaction.text),
    })),
  })));
}
