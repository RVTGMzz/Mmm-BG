import type { SerializableRngState } from './rng';
import { nextRandom } from './rng';
import type { BoardDefinition, BoardNode } from './types';

/**
 * One entry means: the board position at nodeId currently owns the complete
 * gameplay content bundle originally defined by sourceNodeId.
 *
 * Coordinates, node IDs and graph edges never move. Only tile content moves.
 */
export interface BoardContentAssignment071 {
  nodeId: number;
  sourceNodeId: number;
}

export interface BoardShuffleResult071 {
  assignments: BoardContentAssignment071[];
  mutableNodeIds: number[];
  changedNodeIds: number[];
}

const LOCKED_CONTENT_IDS_071 = new Set([
  'SPECIAL_JAIL_GATE',
  'SPECIAL_JAIL_HOLD',
  'SPECIAL_HOSPITAL_GATE',
  'SPECIAL_HOSPITAL_HOLD',
]);

export function isBoardNodeLockedForShuffle071(
  board: BoardDefinition,
  node: BoardNode,
): boolean {
  if (node.id === board.startNodeId || node.type === 'ready') return true;
  if (node.feature === 'job') return true;

  const contentId = node.contentId ?? '';
  if (LOCKED_CONTENT_IDS_071.has(contentId)) return true;
  if (contentId.startsWith('JAIL_EXIT_')) return true;
  if (contentId.startsWith('HOSPITAL_EXIT_')) return true;
  return false;
}

export function shouldTriggerBoardShuffle071(
  completedLap: number,
  lastShuffleLap: number | undefined,
): boolean {
  const lap = Math.max(0, Math.floor(completedLap));
  const last = Math.max(0, Math.floor(lastShuffleLap ?? 0));
  return lap > 0 && lap > last;
}

export function mutableBoardNodeIds071(board: BoardDefinition): number[] {
  return board.nodes
    .filter((node) => !isBoardNodeLockedForShuffle071(board, node))
    .map((node) => node.id)
    .sort((left, right) => left - right);
}

export function normalizeBoardContentAssignments071(
  board: BoardDefinition,
  assignments: readonly BoardContentAssignment071[] | undefined,
): BoardContentAssignment071[] {
  const mutable = mutableBoardNodeIds071(board);
  const mutableSet = new Set(mutable);
  const validSourceIds = new Set(mutable);
  const byNode = new Map<number, number>();

  for (const entry of assignments ?? []) {
    if (!mutableSet.has(entry.nodeId) || !validSourceIds.has(entry.sourceNodeId)) continue;
    if (byNode.has(entry.nodeId)) continue;
    byNode.set(entry.nodeId, entry.sourceNodeId);
  }

  // A partial/legacy mapping falls back to that position's original content.
  return mutable.map((nodeId) => ({
    nodeId,
    sourceNodeId: byNode.get(nodeId) ?? nodeId,
  }));
}

function sameAssignments071(
  left: readonly BoardContentAssignment071[],
  right: readonly BoardContentAssignment071[],
): boolean {
  if (left.length !== right.length) return false;
  return left.every(
    (entry, index) =>
      entry.nodeId === right[index]?.nodeId
      && entry.sourceNodeId === right[index]?.sourceNodeId,
  );
}

/**
 * HOST-authoritative Fisher-Yates shuffle.
 *
 * The random stream is the existing serializable match RNG, never Math.random().
 * If Fisher-Yates happens to produce the exact same complete layout, rotate once
 * without consuming another RNG call so a triggered shuffle always changes the board.
 */
export function shuffleBoardContent071(
  board: BoardDefinition,
  current: readonly BoardContentAssignment071[] | undefined,
  rng: SerializableRngState,
): BoardShuffleResult071 {
  const previous = normalizeBoardContentAssignments071(board, current);
  const sourceIds = previous.map((entry) => entry.sourceNodeId);

  for (let index = sourceIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom(rng) * (index + 1));
    [sourceIds[index], sourceIds[swapIndex]] = [sourceIds[swapIndex], sourceIds[index]];
  }

  let assignments = previous.map((entry, index) => ({
    nodeId: entry.nodeId,
    sourceNodeId: sourceIds[index] ?? entry.sourceNodeId,
  }));

  if (assignments.length > 1 && sameAssignments071(assignments, previous)) {
    const rotated = assignments.map((entry) => entry.sourceNodeId);
    rotated.unshift(rotated.pop() as number);
    assignments = assignments.map((entry, index) => ({
      nodeId: entry.nodeId,
      sourceNodeId: rotated[index] ?? entry.sourceNodeId,
    }));
  }

  const changedNodeIds = assignments
    .filter((entry, index) => entry.sourceNodeId !== previous[index]?.sourceNodeId)
    .map((entry) => entry.nodeId);

  return {
    assignments,
    mutableNodeIds: assignments.map((entry) => entry.nodeId),
    changedNodeIds,
  };
}

export function effectiveBoardNode071(
  board: BoardDefinition,
  nodeId: number,
  assignments: readonly BoardContentAssignment071[] | undefined,
): BoardNode {
  const target = board.nodes.find((node) => node.id === nodeId);
  if (!target) throw new Error(`Board node ${nodeId} does not exist.`);

  if (isBoardNodeLockedForShuffle071(board, target)) return target;

  const sourceId = assignments?.find((entry) => entry.nodeId === nodeId)?.sourceNodeId ?? nodeId;
  const source = board.nodes.find((node) => node.id === sourceId);
  if (!source || isBoardNodeLockedForShuffle071(board, source)) return target;

  return {
    id: target.id,
    x: target.x,
    y: target.y,
    type: source.type,
    ...(source.value === undefined ? {} : { value: source.value }),
    ...(source.feature === undefined ? {} : { feature: source.feature }),
    ...(source.contentId === undefined ? {} : { contentId: source.contentId }),
  };
}

export function boardShuffleSignature071(
  assignments: readonly BoardContentAssignment071[] | undefined,
): string {
  return (assignments ?? [])
    .slice()
    .sort((left, right) => left.nodeId - right.nodeId)
    .map((entry) => `${entry.nodeId}:${entry.sourceNodeId}`)
    .join('|');
}
