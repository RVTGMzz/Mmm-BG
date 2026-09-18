import type { PresentationEventModel } from './presentationModel';

/**
 * Visible B$ must advance at the moment the matching effect is presented, never
 * merely because HOST authority has already calculated the eventual state.
 */
export function shouldCommitVisibleMoney0634(
  model: Pick<PresentationEventModel, 'kind' | 'tileType'> | undefined,
): boolean {
  if (!model) return false;
  if (model.kind === 'ready_bonus') return true;
  if (model.kind === 'card_play' || model.kind === 'news') return true;
  return model.kind === 'tile_land' && model.tileType === 'money';
}

export function shouldCatchUpVisibleMoney0634(presentationBlocking: boolean): boolean {
  return !presentationBlocking;
}
