export type TileType = 'ready' | 'normal' | 'money' | 'news' | 'card';

export interface BoardNode {
  id: number;
  x: number;
  y: number;
  type: TileType;
  value?: number;
}

export interface BoardDefinition {
  id: string;
  name: string;
  nodes: BoardNode[];
}

export interface PlayerState {
  id: number;
  name: string;
  tileIndex: number;
  money: number;
  cardBlockTurns: number;
  handCardIds: string[];
  cardsPlayedThisTurn: number;
}
