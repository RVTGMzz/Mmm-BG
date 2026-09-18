import { normalizeRoomCode } from './browserSession';
import { MEMEME_ONLINE_BASE_URL } from './onlineTransport0702';

export interface OnlineRoomSettings0703 {
  cameraAllowed: boolean;
  voiceAllowed: boolean;
  cpuFill: boolean;
}

export type OnlinePresence0704 = 'online' | 'reconnecting' | 'disconnected';

export interface OnlineLobbyPlayer0703 {
  clientId: string;
  seatId: number;
  name: string;
  ready: boolean;
  role: 'host' | 'client';
  presence: OnlinePresence0704;
}

export interface OnlineLobbyState0703 {
  ok: boolean;
  roomCode: string;
  settings: OnlineRoomSettings0703;
  players: OnlineLobbyPlayer0703[];
  started: boolean;
  cpuSeatIds: number[];
  canStart: boolean;
  closed: boolean;
  closeReason?: 'host_left' | 'host_timeout';
  reconnectGraceMs: number;
  error?: string;
}

export interface OnlineRoomCreate0703 {
  ok: true;
  roomCode: string;
  hostToken: string;
  websocketUrl: string;
  lobby: OnlineLobbyState0703;
}

export interface OnlineRoomJoin0703 {
  ok: true;
  roomCode: string;
  clientId: string;
  seatId: number;
  reconnectToken: string;
  lobby: OnlineLobbyState0703;
}

interface SavedClientIdentity {
  roomCode: string;
  clientId: string;
  reconnectToken: string;
}

const identityKey = (roomCode: string) => `mememe-online-client-${normalizeRoomCode(roomCode)}`;
const DEVICE_KEY_0704 = 'mememe-online-device-0704';

function base(value = MEMEME_ONLINE_BASE_URL): string {
  return value.trim().replace(/\/+$/, '');
}

const ONLINE_ERROR_COPY_0704: Record<string, string> = {
  duplicate_device_active: 'Ghế này đang hoạt động trên thiết bị khác.',
  room_closed: 'Phòng online đã đóng.',
  room_full_humans: 'Phòng đã đủ 4 người chơi thật.',
  room_code_taken: 'Mã phòng này đang được sử dụng.',
  invalid_custom_room_code: 'Mã phòng cần 4–8 ký tự, chỉ gồm chữ A–Z và số 0–9.',
  host_left: 'Host đã rời phòng.',
  host_timeout: 'Host đã mất kết nối quá lâu.',
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) {
    const key = body.error || '';
    throw new Error(ONLINE_ERROR_COPY_0704[key] || key || `Online request failed (${response.status}).`);
  }
  return body;
}

function makeClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `online-${crypto.randomUUID().slice(0, 12)}`;
  }
  return `online-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeDeviceId0704(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `device-${crypto.randomUUID()}`;
  }
  return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getOnlineDeviceId0704(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY_0704)?.trim();
    if (existing) return existing;
    const created = makeDeviceId0704();
    localStorage.setItem(DEVICE_KEY_0704, created);
    return created;
  } catch {
    return makeDeviceId0704();
  }
}

function loadIdentity(roomCode: string): SavedClientIdentity | undefined {
  try {
    const raw = sessionStorage.getItem(identityKey(roomCode));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as SavedClientIdentity;
    if (parsed.roomCode !== normalizeRoomCode(roomCode) || !parsed.clientId || !parsed.reconnectToken) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function saveIdentity(identity: SavedClientIdentity): void {
  try { sessionStorage.setItem(identityKey(identity.roomCode), JSON.stringify(identity)); } catch {}
}

export function clearOnlineClientIdentity0703(roomCode: string): void {
  try { sessionStorage.removeItem(identityKey(roomCode)); } catch {}
}

export async function createOnlineRoom0703(
  hostName: string,
  settings: OnlineRoomSettings0703,
  requestedRoomCode = '',
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineRoomCreate0703> {
  const roomCode = normalizeRoomCode(requestedRoomCode);
  if (requestedRoomCode.trim() && roomCode.length < 4) {
    throw new Error('Mã phòng cần 4–8 ký tự, chỉ gồm chữ A–Z và số 0–9.');
  }
  const response = await fetch(`${base(baseUrl)}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hostName: hostName.trim() || 'Host',
      roomCode,
      settings,
      deviceId: getOnlineDeviceId0704(),
    }),
  });
  return readJson<OnlineRoomCreate0703>(response);
}

export async function joinOnlineRoom0703(
  roomCode: string,
  displayName: string,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineRoomJoin0703> {
  const room = normalizeRoomCode(roomCode);
  const saved = loadIdentity(room);
  const clientId = saved?.clientId ?? makeClientId();
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      displayName: displayName.trim() || 'Người chơi',
      reconnectToken: saved?.reconnectToken ?? '',
      deviceId: getOnlineDeviceId0704(),
    }),
  });
  const joined = await readJson<OnlineRoomJoin0703>(response);
  saveIdentity({ roomCode: joined.roomCode, clientId: joined.clientId, reconnectToken: joined.reconnectToken });
  return joined;
}

export async function fetchOnlineLobby0703(
  roomCode: string,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineLobbyState0703> {
  const room = normalizeRoomCode(roomCode);
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/status`, { cache: 'no-store' });
  return readJson<OnlineLobbyState0703>(response);
}

export async function heartbeatOnlineLobby0704(
  roomCode: string,
  auth: { clientId: string; reconnectToken?: string; hostToken?: string },
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineLobbyState0703> {
  const room = normalizeRoomCode(roomCode);
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ ...auth, deviceId: getOnlineDeviceId0704() }),
  });
  return readJson<OnlineLobbyState0703>(response);
}

export async function closeOnlineRoom0704(
  roomCode: string,
  hostToken: string,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineLobbyState0703> {
  const room = normalizeRoomCode(roomCode);
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostToken, reason: 'host_left' }),
  });
  return readJson<OnlineLobbyState0703>(response);
}

export async function setOnlineReady0703(
  roomCode: string,
  ready: boolean,
  auth: { clientId: string; reconnectToken?: string; hostToken?: string },
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineLobbyState0703> {
  const room = normalizeRoomCode(roomCode);
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/ready`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...auth, ready }),
  });
  return readJson<OnlineLobbyState0703>(response);
}

export async function updateOnlineSettings0703(
  roomCode: string,
  hostToken: string,
  settings: OnlineRoomSettings0703,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineLobbyState0703> {
  const room = normalizeRoomCode(roomCode);
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostToken, settings }),
  });
  return readJson<OnlineLobbyState0703>(response);
}

export async function kickOnlinePlayer0703(
  roomCode: string,
  hostToken: string,
  seatId: number,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineLobbyState0703> {
  const room = normalizeRoomCode(roomCode);
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/kick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostToken, seatId }),
  });
  return readJson<OnlineLobbyState0703>(response);
}

export async function startOnlineMatch0703(
  roomCode: string,
  hostToken: string,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineLobbyState0703> {
  const room = normalizeRoomCode(roomCode);
  const response = await fetch(`${base(baseUrl)}/api/rooms/${room}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostToken }),
  });
  return readJson<OnlineLobbyState0703>(response);
}

export async function leaveOnlineRoom0703(
  roomCode: string,
  clientId: string,
  reconnectToken: string,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<void> {
  const room = normalizeRoomCode(roomCode);
  await fetch(`${base(baseUrl)}/api/rooms/${room}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, reconnectToken }),
  });
  clearOnlineClientIdentity0703(room);
}
