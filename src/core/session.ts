export type FaceExpression = 'neutral' | 'happy' | 'angry';
export type PersonalityTag = 'mean' | 'whiny' | 'gossip' | 'chill';

const DEFAULT_PERSONALITIES: PersonalityTag[] = ['mean', 'whiny', 'gossip', 'chill'];

export interface FaceAsset {
  dataUrl: string;
  textureKey: string;
  originalName?: string;
}

export interface PlayerProfile {
  id: number;
  name: string;
  personality: PersonalityTag;
  faces: Partial<Record<FaceExpression, FaceAsset>>;
}

class GameSession {
  players: PlayerProfile[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.players = Array.from({ length: 4 }, (_, id) => ({
      id,
      name: `Player ${id + 1}`,
      personality: DEFAULT_PERSONALITIES[id % DEFAULT_PERSONALITIES.length],
      faces: {},
    }));
  }

  setPlayerName(playerId: number, name: string): void {
    const player = this.players[playerId];
    if (!player) return;
    player.name = name.trim() || `Player ${playerId + 1}`;
  }

  setPersonality(playerId: number, personality: PersonalityTag): void {
    const player = this.players[playerId];
    if (!player) return;
    player.personality = personality;
  }

  getPersonality(playerId: number): PersonalityTag {
    return this.players[playerId]?.personality ?? 'chill';
  }

  setFace(playerId: number, expression: FaceExpression, asset: FaceAsset): void {
    const player = this.players[playerId];
    if (!player) return;
    player.faces[expression] = asset;
  }

  getFace(playerId: number, expression: FaceExpression): FaceAsset | undefined {
    const player = this.players[playerId];
    if (!player) return undefined;
    return player.faces[expression] ?? player.faces.neutral;
  }

  isReady(): boolean {
    return this.players.every((player) => player.name.trim().length > 0 && Boolean(player.faces.neutral));
  }
}

export const gameSession = new GameSession();
