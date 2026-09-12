import { computeMatchChecksum } from './checksum';
import { diffMatchStates, type MatchStateDiff } from './desync';
import { cloneMatchState, type MatchState } from './matchState';
import { replayMatchCommands, type ReplayCommandCheckpoint, type ReplayResult } from './replay';
import type { CardDefinition } from './cards';
import type { NewsDefinition } from './news';
import type { BoardDefinition } from './types';

export interface LockstepSimulationResult {
  pass: boolean;
  peerA: ReplayResult;
  peerB: ReplayResult;
  peerAChecksum: string;
  peerBChecksum: string;
  diffs: MatchStateDiff[];
  firstDesyncCommandSeq?: number;
}

function firstCheckpointMismatch(
  left: ReplayCommandCheckpoint[],
  right: ReplayCommandCheckpoint[],
): number | undefined {
  const rightBySeq = new Map(right.map((checkpoint) => [checkpoint.seq, checkpoint]));

  for (const checkpoint of left) {
    const peer = rightBySeq.get(checkpoint.seq);
    if (!peer) return checkpoint.seq;
    if (
      checkpoint.checksum !== peer.checksum ||
      checkpoint.turnNumber !== peer.turnNumber ||
      checkpoint.playerIndex !== peer.playerIndex ||
      checkpoint.phase !== peer.phase ||
      checkpoint.revision !== peer.revision
    ) {
      return checkpoint.seq;
    }
  }

  if (right.length > left.length) return right[left.length]?.seq;
  return undefined;
}

function earliestDefined(...values: Array<number | undefined>): number | undefined {
  const defined = values.filter((value): value is number => value !== undefined);
  return defined.length > 0 ? Math.min(...defined) : undefined;
}

/**
 * Replay two independent peers and compare command-boundary checkpoints plus final gameplay state.
 * No network transport is involved yet; this is the deterministic lockstep contract simulator.
 */
export function simulateLockstepPeers(
  peerASource: MatchState,
  board: BoardDefinition,
  cards: CardDefinition[],
  news: NewsDefinition[],
  peerBSource: MatchState = peerASource,
): LockstepSimulationResult {
  const peerA = replayMatchCommands(peerASource, board, cards, news);
  const peerB = replayMatchCommands(peerBSource, board, cards, news);
  const peerAChecksum = computeMatchChecksum(peerA.state);
  const peerBChecksum = computeMatchChecksum(peerB.state);
  const diffs = diffMatchStates(peerA.state, peerB.state);
  const checkpointMismatch = firstCheckpointMismatch(peerA.checkpoints, peerB.checkpoints);
  const firstDesyncCommandSeq = earliestDefined(
    peerA.failedCommandSeq,
    peerB.failedCommandSeq,
    checkpointMismatch,
  );

  const peerAComplete =
    peerA.errors.length === 0 && peerA.consumedCommands === peerASource.commandLog.length;
  const peerBComplete =
    peerB.errors.length === 0 && peerB.consumedCommands === peerBSource.commandLog.length;

  return {
    pass:
      peerAComplete &&
      peerBComplete &&
      peerAChecksum === peerBChecksum &&
      diffs.length === 0 &&
      checkpointMismatch === undefined,
    peerA,
    peerB,
    peerAChecksum,
    peerBChecksum,
    diffs,
    firstDesyncCommandSeq,
  };
}

/**
 * Upgrade an existing command stream that predates lockstep envelopes.
 * Replay supplies the exact deterministic state seen before each command, then those
 * checkpoints are copied back into the command log. Useful for fixtures and migrations;
 * live runtime commands are stamped at creation time instead.
 */
export function stampCommandEnvelopes(
  source: MatchState,
  board: BoardDefinition,
  cards: CardDefinition[],
  news: NewsDefinition[],
): MatchState {
  const replay = replayMatchCommands(source, board, cards, news);
  if (replay.errors.length > 0 || replay.consumedCommands !== source.commandLog.length) {
    throw new Error(`Cannot stamp invalid command stream: ${replay.errors[0] ?? 'incomplete replay'}`);
  }

  const checkpoints = new Map(replay.checkpoints.map((checkpoint) => [checkpoint.seq, checkpoint]));
  const stamped = cloneMatchState(source);

  stamped.commandLog = stamped.commandLog.map((command) => {
    const checkpoint = checkpoints.get(command.seq);
    if (!checkpoint) throw new Error(`Missing replay checkpoint for command #${command.seq}.`);
    return {
      ...command,
      turnNumber: checkpoint.turnNumber,
      playerIndex: checkpoint.playerIndex,
      phase: checkpoint.phase,
      revision: checkpoint.revision,
      preChecksum: checkpoint.checksum,
      data: { ...command.data },
    };
  });
  stamped.nextCommandSeq = stamped.commandLog.length + 1;
  return stamped;
}
