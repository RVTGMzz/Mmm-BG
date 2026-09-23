/**
 * One camera-space geometry contract for the Mini Game 1v1 reveal.
 * This is presentation only: results and stakes remain HOST-authoritative.
 */
export const MINI_GAME_DUEL_LAYOUT_070423 = Object.freeze({
  modalHalfWidth: 450,
  modalHalfHeight: 270,
  stageOffsetY: 22,
  cardCenterX: 210,
  cardCenterY: 2,
  cardWidth: 226,
  cardHeight: 190,
  nameY: -127,
  chantY: 128,
  verdictY: 178,
});

/** Guard whole component rectangles, not just their centers. */
export function miniGameDuelFits070423(
  l: typeof MINI_GAME_DUEL_LAYOUT_070423 = MINI_GAME_DUEL_LAYOUT_070423,
): boolean {
  const cardTop = l.stageOffsetY + l.cardCenterY - l.cardHeight / 2;
  const cardBottom = l.stageOffsetY + l.cardCenterY + l.cardHeight / 2;
  const cardLeft = l.cardCenterX - l.cardWidth / 2;
  const cardRight = l.cardCenterX + l.cardWidth / 2;
  const nameBottom = l.stageOffsetY + l.nameY + 16;
  return cardLeft >= 88
    && cardRight <= l.modalHalfWidth - 24
    && nameBottom + 16 <= cardTop
    && cardBottom + 20 <= l.stageOffsetY + l.chantY
    && l.stageOffsetY + l.verdictY + 18 <= l.modalHalfHeight - 24;
}
