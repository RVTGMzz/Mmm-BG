export type BrowserSessionMode = 'solo' | 'host' | 'client';
export type BrowserTransportKind = 'local' | 'online';

export interface BrowserSessionConfig {
  mode: BrowserSessionMode;
  transport: BrowserTransportKind;
  roomCode: string;
  clientId: string;
  seatId: number;
  cpuSeatIds: number[];
  onlineBaseUrl: string;
  hostToken: string;
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

function normalizeOnlineBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function validateRemoteSeat(seatId: number): void {
  if (!Number.isInteger(seatId) || seatId < 1 || seatId > 3) {
    throw new Error('Ghế online/local client phải là P2, P3 hoặc P4.');
  }
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
    transport: 'local',
    roomCode: '',
    clientId: 'solo',
    seatId: 0,
    cpuSeatIds: [],
    onlineBaseUrl: '',
    hostToken: '',
  };

  get current(): BrowserSessionConfig {
    return { ...this.config, cpuSeatIds: [...this.config.cpuSeatIds] };
  }

  get isNetworked(): boolean {
    return this.config.mode !== 'solo';
  }

  get isOnline(): boolean {
    return this.config.mode !== 'solo' && this.config.transport === 'online';
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
      transport: 'local',
      roomCode: '',
      clientId: 'solo',
      seatId: 0,
      cpuSeatIds: normalizeCpuSeatIds(cpuSeatIds),
      onlineBaseUrl: '',
      hostToken: '',
    };
    return this.current;
  }

  configureHost(roomCode: string): BrowserSessionConfig {
    const room = normalizeRoomCode(roomCode) || generateRoomCode();
    this.config = {
      mode: 'host',
      transport: 'local',
      roomCode: room,
      clientId: 'host',
      seatId: 0,
      cpuSeatIds: [],
      onlineBaseUrl: '',
      hostToken: '',
    };
    return this.current;
  }

  configureClient(roomCode: string, seatId: number): BrowserSessionConfig {
    const room = normalizeRoomCode(roomCode);
    if (!room) throw new Error('Room code is required.');
    validateRemoteSeat(seatId);

    this.config = {
      mode: 'client',
      transport: 'local',
      roomCode: room,
      clientId: makeClientId(`client-p${seatId + 1}`),
      seatId,
      cpuSeatIds: [],
      onlineBaseUrl: '',
      hostToken: '',
    };
    return this.current;
  }

  configureOnlineHost(roomCode: string, hostToken: string, onlineBaseUrl: string): BrowserSessionConfig {
    const room = normalizeRoomCode(roomCode);
    const baseUrl = normalizeOnlineBaseUrl(onlineBaseUrl);
    if (!room) throw new Error('Mã phòng online không hợp lệ.');
    if (!hostToken.trim()) throw new Error('Thiếu host token của phòng online.');
    if (!baseUrl) throw new Error('Thiếu địa chỉ server online.');

    this.config = {
      mode: 'host',
      transport: 'online',
      roomCode: room,
      clientId: 'host',
      seatId: 0,
      cpuSeatIds: [],
      onlineBaseUrl: baseUrl,
      hostToken: hostToken.trim(),
    };
    return this.current;
  }

  configureOnlineClient(roomCode: string, seatId: number, onlineBaseUrl: string): BrowserSessionConfig {
    const room = normalizeRoomCode(roomCode);
    const baseUrl = normalizeOnlineBaseUrl(onlineBaseUrl);
    if (!room) throw new Error('Mã phòng online không hợp lệ.');
    validateRemoteSeat(seatId);
    if (!baseUrl) throw new Error('Thiếu địa chỉ server online.');

    this.config = {
      mode: 'client',
      transport: 'online',
      roomCode: room,
      clientId: makeClientId(`online-p${seatId + 1}`),
      seatId,
      cpuSeatIds: [],
      onlineBaseUrl: baseUrl,
      hostToken: '',
    };
    return this.current;
  }
}

export const browserSession = new BrowserSessionState();
