import boardJson from '../content/city/board_city_mvp.json';
import { getOutgoingEdges, pickParityEdge } from '../core/board';
import { browserSession } from '../core/browserSession';
import type { ClientIntentType } from '../core/authority';
import type { MatchEventValue, MatchState } from '../core/matchState';
import type { BoardDefinition, PlayerState } from '../core/types';
import { MatchPresentationLayer } from '../ui/MatchPresentationLayer';
import {
  shouldAutoAdvancePresentation,
  shouldDeferResultOverlay,
} from '../ui/presentationFlowPolicy';
import { PlaytestDemoBoardScene } from './PlaytestDemoBoardScene';

const BOARD = boardJson as BoardDefinition;

type NetworkStateSource = 'host' | 'state' | 'snapshot';

interface PresentationBoardInternals {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay: Array<{ destroy(): void }>;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
  canControlCurrentPlayer(): boolean;
  currentPlayer(): PlayerState | undefined;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
  queueCpuActionIfNeeded(): void;
  promptNetworkBranch(): Promise<void>;
  refreshHud(): void;
  renderShellOverlay(): void;
  writeLog(message: string): void;
}

interface LegacyToastHook {
  showEventToast(title: string, body: string): void;
}

/**
 * Presentation-only shell layered on top of the stable playtest board.
 *
 * 0.1.18.1 changes presentation from a passive timed queue into a gameplay gate:
 * the authoritative turn cannot advance while a Tile/Card/News/Reaction panel is
 * waiting for acknowledgement. Branch choices are still explicit authoritative
 * commands, but the UI now derives them automatically from dice parity.
 */
export class PresentationParityBoardScene extends PlaytestDemoBoardScene {
  private presentation?: MatchPresentationLayer;
  private presentationBlocking = false;
  private lastAutoBranchSignature = '';

  create(): void {
    const legacyToast = this as unknown as LegacyToastHook;
    legacyToast.showEventToast = () => undefined;

    super.create();

    // Cover legacy labels from the stable base scene without churning its authority code.
    this.add
      .text(178, 45, 'CITY • MVP 0.1.18.1 FLOW FIX', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#202020',
        backgroundColor: '#f4ead7',
        padding: { x: 2, y: 2 },
      })
      .setDepth(931);

    this.add
      .text(1218, 690, 'PLAYTEST 0.1.18.1 • FLOW FIX', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#ef4545',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(1, 1)
      .setDepth(930);

    const internals = this as unknown as PresentationBoardInternals;

    const clearShellOverlay = () => {
      for (const object of internals.shellOverlay) object.destroy();
      internals.shellOverlay = [];
    };

    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);
    internals.renderShellOverlay = () => {
      if (shouldDeferResultOverlay(this.presentationBlocking, internals.shell.status)) {
        clearShellOverlay();
        return;
      }
      originalRenderShellOverlay();
    };

    const originalCanControl = internals.canControlCurrentPlayer.bind(this);
    internals.canControlCurrentPlayer = () => {
      if (this.presentationBlocking) return false;
      return originalCanControl();
    };

    const originalQueueCpuAction = internals.queueCpuActionIfNeeded.bind(this);
    internals.queueCpuActionIfNeeded = () => {
      if (this.presentationBlocking) return;
      originalQueueCpuAction();
    };

    // Human and client-controlled seats no longer open a branch picker. The roll
    // parity selects the matching edge, while choose_branch remains in the command
    // log so replay/authority semantics stay unchanged.
    internals.promptNetworkBranch = async () => {
      if (this.presentationBlocking) return;
      const player = internals.currentPlayer();
      if (!player || internals.match.turn.phase !== 'BRANCH_CHOICE') return;

      const outgoing = getOutgoingEdges(BOARD, player.nodeId);
      if (outgoing.length <= 1) return;

      const roll = internals.match.turn.lastRoll ?? 0;
      const selected = pickParityEdge(outgoing, roll);
      if (!selected) return;

      const signature = [
        internals.match.turn.turnNumber,
        internals.match.turn.revision,
        player.id,
        player.nodeId,
        roll,
      ].join(':');
      if (signature === this.lastAutoBranchSignature) return;
      this.lastAutoBranchSignature = signature;

      const parityLabel = Math.abs(Math.floor(roll)) % 2 === 0 ? 'CHẴN' : 'LẺ';
      internals.writeLog(
        `🛣️ ${player.name}: xúc xắc ${roll} ${parityLabel} → ${selected.label ?? `${selected.from}→${selected.to}`}`,
      );
      internals.submitIntent('choose_branch', { to: selected.to });
    };

    const autoAdvance = shouldAutoAdvancePresentation(
      browserSession.current.cpuSeatIds,
      internals.match?.players.length ?? 4,
    );
    this.presentation = new MatchPresentationLayer(
      this,
      () => internals.match?.players ?? [],
      {
        autoAdvance,
        onBlockingChange: (blocking) => {
          this.presentationBlocking = blocking;

          if (shouldDeferResultOverlay(blocking, internals.shell.status)) {
            clearShellOverlay();
          } else if (!blocking && internals.shell.status === 'ended') {
            internals.renderShellOverlay();
          }

          internals.refreshHud();

          if (
            !blocking &&
            internals.match?.turn.phase === 'BRANCH_CHOICE' &&
            internals.canControlCurrentPlayer()
          ) {
            void internals.promptNetworkBranch();
          }
        },
      },
    );

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
      this.presentationBlocking = false;
      this.lastAutoBranchSignature = '';
    });
  }
}
