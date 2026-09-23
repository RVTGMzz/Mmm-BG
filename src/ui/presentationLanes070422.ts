/**
 * 0.1.70.4.22: one geometry contract for all presentation-owned reaction bubbles.
 *
 * The logical UI camera is 1280x720. The widest canonical event/job card can
 * reach x=258..1022, so 328px reaction balloons at x=188/1092 NEVER fitted
 * the side lanes even though their vertical safe-area checks used to pass.
 *
 * This pure policy can be tested without Phaser or a browser.
 */
export const PRESENTATION_LANES_070422 = Object.freeze({
  viewportWidth: 1280,
  viewportHeight: 720,
  margin: 18,
  modalLeft: 258,
  modalRight: 1022,
  modalGap: 20,
  hudTopBottom: 125,
  hudBottomTop: 595,
  reactionWidth: 212,
  reactionHeight: 116,
  leftCenterX: 130,
  rightCenterX: 1150,
  topCenterY: 225,
  bottomCenterY: 486,
});

export interface ReactionPlacement070422 {
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'left' | 'right';
}

/** Return null instead of allowing any balloon to spill across the modal/HUD. */
export function reactionPlacement070422(
  speakerId: number | undefined,
  index: number,
  viewportWidth: number = PRESENTATION_LANES_070422.viewportWidth,
  viewportHeight: number = PRESENTATION_LANES_070422.viewportHeight,
): ReactionPlacement070422 | null {
  const seat = speakerId === undefined ? index % 4 : Math.max(0, Math.min(3, speakerId));
  const side = seat === 0 || seat === 2 ? 'left' : 'right';
  const upper = seat === 0 || seat === 1;
  const layout = PRESENTATION_LANES_070422;
  const placement: ReactionPlacement070422 = {
    x: side === 'left' ? layout.leftCenterX : layout.rightCenterX,
    y: upper ? layout.topCenterY : layout.bottomCenterY,
    width: layout.reactionWidth,
    height: layout.reactionHeight,
    side,
  };

  const halfWidth = placement.width / 2;
  const halfHeight = placement.height / 2;
  const left = placement.x - halfWidth;
  const right = placement.x + halfWidth;
  const top = placement.y - halfHeight;
  const bottom = placement.y + halfHeight;
  const modalClear =
    side === 'left'
      ? right + layout.modalGap <= layout.modalLeft
      : left - layout.modalGap >= layout.modalRight;
  const hudClear =
    upper
      ? top >= layout.hudTopBottom + layout.margin
      : bottom <= layout.hudBottomTop - layout.margin;
  const viewportClear =
    left >= layout.margin
    && right <= viewportWidth - layout.margin
    && top >= layout.margin
    && bottom <= viewportHeight - layout.margin;

  return modalClear && hudClear && viewportClear ? placement : null;
}
