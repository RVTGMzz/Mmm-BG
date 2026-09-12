export class TurnManager {
  private index = 0;

  constructor(private readonly playerCount: number) {
    if (playerCount < 1) {
      throw new Error('TurnManager requires at least one player.');
    }
  }

  get currentIndex(): number {
    return this.index;
  }

  next(): number {
    this.index = (this.index + 1) % this.playerCount;
    return this.index;
  }
}
