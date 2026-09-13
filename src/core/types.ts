export type TileType = 'ready' | 'normal' | 'money' | 'news' | 'card';
export type FunctionTileType = 'minigame' | 'job';
export type BoardEdgeRoute = 'main' | 'branch';
export type BoardEdgeParity = 'odd' | 'even';

export interface BoardNode {
  id: number;
  x: number;
  y: number;
  type: TileType;
  value?: number;
  /** Optional function-space layer. 0.1.29 keeps the base tile graph/state model intact. */
  feature?: FunctionTileType;
  /** Stable content hook for the future playable Mini Game / Job catalog. */
  contentId?: string;
}

export interface BoardEdge {
  from: number;
  to: number;
  label?: string;
  route?: BoardEdgeRoute;
  parity?: BoardEdgeParity;
}

export interface BoardDefinition {
  id: string;
  name: string;
  startNodeId: number;
  nodes: BoardNode[];
  edges: BoardEdge[];
}

export interface PlayerState {
  id: number;
  name: string;
  nodeId: number;
  money: number;
  cardBlockTurns: number;
  handCardIds: string[];
  cardsPlayedThisTurn: number;
}
