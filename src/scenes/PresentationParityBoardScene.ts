import type { MatchState } from '../core/matchState';
import { MatchPresentationLayer } from '../ui/MatchPresentationLayer';
import { PlaytestDemoBoardScene } from './PlaytestDemoBoardScene';

type NetworkStateSource = 'host' | 'state' | 'snapshot';

interface PresentationBoardInternals {
  match: MatchState;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
}

interface LegacyToastHook {
  showEventToast(title: string, body: string): void;
}

/**
 * Presentation-only shell layered on top of the stable 0.1.17 playtest board.
 *
 * The underlying PlaytestDemoBoardScene still owns authority, replay, deltas,
 * movement tweening and diagnostics. This wrapper only consumes authoritative
 * MatchEvents after state application and renders a richer Card/News/Reaction
 * treatment. Snapshot restores intentionally do not replay old presentation.
 */
export class PresentationParityBoardScene extends PlaytestDemoBoardScene {
  private presentation?: MatchPresentationLayer;

  create(): void {
    // The previous purple event toast remains useful as a fallback implementation,
    // but the cinematic layer supersedes it. Shadow only that toast hook; B$/card
    // delta toasts and runtime logs remain intact.
    const legacyToast = this as unknown as LegacyToastHook;
    legacyToast.showEventToast = () => undefined;

    super.create();

    const internals = this as unknown as PresentationBoardInternals;
    this.presentation = new MatchPresentationLayer(this, () => internals.match?.players ?? []);

    const originalApplyNetworkState = internals.applyNetworkState.bind(this);
    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      const beforeEventSeq = internals.match?.nextEventSeq ?? 1;
      originalApplyNetworkState(state, commandSeq, checksum, source);

      if (source !== 'snapshot') {
        this.presentation?.enqueue(
          state.eventLog.filter((event) => event.seq >= beforeEventSeq),
        );
      }
    };

    this.events.once('shutdown', () => {
      this.presentation?.destroy();
      this.presentation = undefined;
    });
  }
}
