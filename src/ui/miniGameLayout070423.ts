/**
 * One camera-space geometry contract for the Mini Game 1v1 reveal.
 * This is presentation only: results and stakes remain HOST-authoritative.
 */
export const MINI_GAME_DUEL_LAYOUT_070423 = Object.freeze({
  modalHalfWidth: 480,
  modalHalfHeight: 285,
  stageOffsetY: 22,
  cardCenterX: 220,
  cardCenterY: 4,
  cardWidth: 240,
  cardHeight: 198,
  nameY: -140,
  chantY: 138,
  verdictY: 190,
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


/**
 * 0.1.70.4.31 — canonical concealed-choice vertical rhythm.
 *
 * This belongs to the MiniGameOverlay owner. The goal is not to scale copy down,
 * but to guarantee visible breathing room between prompt, controls, cards and
 * the privacy rail on the 1280x720 logical canvas used by Deck/desktop.
 */
export const MINI_GAME_CHOICE_LAYOUT_070431 = Object.freeze({
  stageOffsetY: 22,
  promptY: -118,
  hintY: -72,
  cardCenterY: 76,
  cardWidth: 178,
  cardHeight: 166,
  twoChoiceSpacing: 242,
  multiChoiceSpacing: 212,
  iconOffsetY: -33,
  labelOffsetY: 39,
  privacyY: 208,
  privacyWidth: 690,
  privacyHeight: 44,
} as const);

export function miniGameChoiceFits070431(
  l: typeof MINI_GAME_CHOICE_LAYOUT_070431 = MINI_GAME_CHOICE_LAYOUT_070431,
): boolean {
  const promptBottom = l.promptY + 18;
  const hintTop = l.hintY - 13;
  const hintBottom = l.hintY + 13;
  const cardTop = l.cardCenterY - l.cardHeight / 2;
  const cardBottom = l.cardCenterY + l.cardHeight / 2;
  const privacyTop = l.privacyY - l.privacyHeight / 2;
  const privacyBottom = l.privacyY + l.privacyHeight / 2;
  const threeChoiceRight = l.multiChoiceSpacing + l.cardWidth / 2;

  return hintTop - promptBottom >= 12
    && cardTop - hintBottom >= 44
    && privacyTop - cardBottom >= 24
    && l.stageOffsetY + privacyBottom <= 258
    && threeChoiceRight <= 426;
}
