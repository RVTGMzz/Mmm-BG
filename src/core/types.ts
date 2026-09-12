export type TileType = 'ready' | 'normal' | 'money' | 'news' | 'card';
export type BoardEdgeRoute = 'main' | 'branch';
export type BoardEdgeParity = 'odd' | 'even';

export interface BoardNode {
  id: number;
  x: number;
  y: number;
  type: TileType;
  value?: number;
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
