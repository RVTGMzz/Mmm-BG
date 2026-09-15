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
  feature?: FunctionTileType;
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

export type JobStatus = 'unemployed' | 'employed' | 'jailed';
export type SpecialHoldLocation = 'jail' | 'hospital';

export interface PlayerState {
  id: number;
  name: string;
  nodeId: number;
  money: number;
  cardBlockTurns: number;
  handCardIds: string[];
  cardsPlayedThisTurn: number;
  /** Completed board laps. Optional so older schema-v3 snapshots still deserialize safely. */
  lapsCompleted?: number;
  /** Career fields are optional so old schema-v3 playtest snapshots still deserialize cleanly. */
  jobId?: string;
  jobLevel?: number;
  jobStatus?: JobStatus;
  /** 0.1.57 authoritative holding state. Omitted means the player is free on the board. */
  specialHold?: SpecialHoldLocation;
}
