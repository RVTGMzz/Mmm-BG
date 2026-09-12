import type { BoardDefinition, BoardEdge, BoardNode } from './types';

export function getBoardNode(board: BoardDefinition, nodeId: number): BoardNode {
  const node = board.nodes.find((entry) => entry.id === nodeId);
  if (!node) {
    throw new Error(`Board ${board.id} is missing node ${nodeId}.`);
  }
  return node;
}

export function getOutgoingEdges(board: BoardDefinition, nodeId: number): BoardEdge[] {
  return board.edges.filter((edge) => edge.from === nodeId);
}

export function pickParityEdge(edges: BoardEdge[], roll: number): BoardEdge | undefined {
  if (edges.length === 0) return undefined;
  const parity = Math.abs(Math.floor(roll)) % 2 === 0 ? 'even' : 'odd';
  return edges.find((edge) => edge.parity === parity) ?? edges[0];
}

export function validateBoardDefinition(board: BoardDefinition): string[] {
  const errors: string[] = [];
  const ids = new Set<number>();

  for (const node of board.nodes) {
    if (ids.has(node.id)) errors.push(`Duplicate node id: ${node.id}`);
    ids.add(node.id);
  }

  if (!ids.has(board.startNodeId)) {
    errors.push(`Missing start node: ${board.startNodeId}`);
  }

  for (const edge of board.edges) {
    if (!ids.has(edge.from)) errors.push(`Edge starts at missing node ${edge.from}`);
    if (!ids.has(edge.to)) errors.push(`Edge points to missing node ${edge.to}`);
    if (edge.from === edge.to) errors.push(`Self-loop is not allowed for MVP edge ${edge.from} → ${edge.to}`);
  }

  for (const node of board.nodes) {
    if (getOutgoingEdges(board, node.id).length === 0) {
      errors.push(`Node ${node.id} has no outgoing edge.`);
    }
  }

  return errors;
}
