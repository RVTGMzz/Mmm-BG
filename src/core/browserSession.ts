export type BrowserSessionMode = 'solo' | 'host' | 'client';

export interface BrowserSessionConfig {
  mode: BrowserSessionMode;
  roomCode: string;
  clientId: string;
  seatId: number;
  cpuSeatIds: number[];
}

function makeClientId(prefix: string): string {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

function normalizeCpuSeatIds(seatIds: number[]): number[] {
  return [...new Set(seatIds)]
    .filter((seatId) => Number.isInteger(seatId) && seatId >= 0 && seatId <= 3)
    .sort((a, b) => a - b);
}

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function generateRoomCode(): string {
  const value = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0');
  return `ME${value}`;
}

class BrowserSessionState {
  private config: BrowserSessionConfig = {
    mode: 'solo',
    roomCode: '',
    clientId: 'solo',
    seatId: 0,
    cpuSeatIds: [],
  };

  get current(): BrowserSessionConfig {
    return { ...this.config, cpuSeatIds: [...this.config.cpuSeatIds] };
  }

  get isNetworked(): boolean {
    return this.config.mode !== 'solo';
  }

  get channelName(): string {
    if (!this.config.roomCode) return 'mememe-local-solo';
    return `mememe-local-${this.config.roomCode}`;
  }

  isCpuSeat(seatId: number): boolean {
    return this.config.mode === 'solo' && this.config.cpuSeatIds.includes(seatId);
  }

  configureSolo(cpuSeatIds: number[] = []): BrowserSessionConfig {
    this.config = {
      mode: 'solo',
      roomCode: '',
      clientId: 'solo',
      seatId: 0,
      cpuSeatIds: normalizeCpuSeatIds(cpuSeatIds),
    };
    return this.current;
  }

  configureHost(roomCode: string): BrowserSessionConfig {
    const room = normalizeRoomCode(roomCode) || generateRoomCode();
    this.config = {
      mode: 'host',
      roomCode: room,
      clientId: 'host',
      seatId: 0,
      cpuSeatIds: [],
    };
    return this.current;
  }

  configureClient(roomCode: string, seatId: number): BrowserSessionConfig {
    const room = normalizeRoomCode(roomCode);
    if (!room) throw new Error('Room code is required.');
    if (!Number.isInteger(seatId) || seatId < 1 || seatId > 3) {
      throw new Error('Local two-tab client seat must be P2, P3, or P4.');
    }

    this.config = {
      mode: 'client',
      roomCode: room,
      clientId: makeClientId(`client-p${seatId + 1}`),
      seatId,
      cpuSeatIds: [],
    };
    return this.current;
  }
}

export const browserSession = new BrowserSessionState();
