import { DurableObject } from "cloudflare:workers";

interface Env {
  MEMEME_ROOMS: DurableObjectNamespace<MeMeMeRoom>;
}

type SocketRole = "host" | "client";

interface SocketAttachment {
  clientId: string;
  seatId: number;
  role: SocketRole;
  roomCode: string;
  channel: string;
  joinedAt: number;
}

interface RelayEnvelope {
  to?: string;
  payload: unknown;
}

interface RoomSettings {
  cameraAllowed: boolean;
  voiceAllowed: boolean;
  cpuFill: boolean;
}

type LobbyPresence0704 = "online" | "reconnecting" | "disconnected";

interface LobbyPlayerStored {
  clientId: string;
  seatId: number;
  name: string;
  ready: boolean;
  role: SocketRole;
  reconnectTokenHash: string;
  joinedAt: number;
  activeDeviceId: string;
  lastSeenAt: number;
}

const ONLINE_WINDOW_MS_0704 = 12_000;
const DISCONNECTED_WINDOW_MS_0704 = 30_000;
const RECONNECT_GRACE_MS_0704 = 60_000;

function presence0704(player: LobbyPlayerStored, now = Date.now()): LobbyPresence0704 {
  const age = Math.max(0, now - player.lastSeenAt);
  if (age <= ONLINE_WINDOW_MS_0704) return "online";
  if (age <= DISCONNECTED_WINDOW_MS_0704) return "reconnecting";
  return "disconnected";
}

const ALLOWED_ORIGINS = new Set([
  "https://ronvotri.github.io",
  "https://mwp-test.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://ronvotri.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, String(value));
  return new Response(JSON.stringify(data), { ...init, headers });
}

function internalJson(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function normalizeName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim().replace(/[<>]/g, "").slice(0, 18);
  return cleaned || fallback;
}

function normalizeSettings(value: unknown): RoomSettings {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    cameraAllowed: source.cameraAllowed === true,
    voiceAllowed: source.voiceAllowed === true,
    cpuFill: source.cpuFill !== false
  };
}

function generateRoomCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return "ME" + (bytes[0] % (36 ** 4)).toString(36).toUpperCase().padStart(4, "0");
}

function makeSecret(): string {
  return crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function websocketUrl(request: Request, roomCode: string, hostToken?: string): string {
  const source = new URL(request.url);
  const protocol = source.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL(`${protocol}//${source.host}/api/rooms/${roomCode}/ws`);
  if (hostToken) url.searchParams.set("hostToken", hostToken);
  return url.toString();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: "mememe-online",
        milestone: "0.1.70.4.6",
        transport: "websocket-durable-object",
        lobbyAuthority: true
      }, {}, origin);
    }

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      const rawRequestedCode = String(body.roomCode ?? "").trim().toUpperCase();
      if (rawRequestedCode && !/^[A-Z0-9]{4,8}$/.test(rawRequestedCode)) {
        return json({ ok: false, error: "invalid_custom_room_code" }, { status: 400 }, origin);
      }
      const requestedRoomCode = rawRequestedCode ? normalizeRoomCode(rawRequestedCode) : "";
      const attempts = requestedRoomCode ? 1 : 6;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const roomCode = requestedRoomCode || generateRoomCode();
        const hostToken = makeSecret();
        const stub = env.MEMEME_ROOMS.getByName(roomCode);
        const initialized = await stub.fetch("https://room.internal/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomCode,
            hostToken,
            hostName: normalizeName(body.hostName, "Host"),
            settings: normalizeSettings(body.settings),
            deviceId: String(body.deviceId ?? "").trim().slice(0, 120)
          })
        });

        if (initialized.status === 409) {
          if (requestedRoomCode) {
            return json({ ok: false, error: "room_code_taken" }, { status: 409 }, origin);
          }
          continue;
        }
        if (!initialized.ok) return json({ ok: false, error: "room_initialize_failed" }, { status: 502 }, origin);

        const lobby = await initialized.json();
        return json({
          ok: true,
          roomCode,
          hostToken,
          websocketUrl: websocketUrl(request, roomCode, hostToken),
          lobby
        }, { status: 201 }, origin);
      }
      return json({ ok: false, error: "room_code_exhausted" }, { status: 503 }, origin);
    }

    const match = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9]{4,8})\/(ws|status|join|ready|settings|kick|start|leave|heartbeat|close)$/);
    if (!match) {
      return json({
        ok: false,
        error: "not_found",
        endpoints: [
          "GET /health", "POST /api/rooms", "GET /api/rooms/:code/status",
          "POST /api/rooms/:code/join", "POST /api/rooms/:code/ready",
          "POST /api/rooms/:code/settings", "POST /api/rooms/:code/kick",
          "POST /api/rooms/:code/start", "POST /api/rooms/:code/leave",
          "POST /api/rooms/:code/heartbeat", "POST /api/rooms/:code/close",
          "WS /api/rooms/:code/ws"
        ]
      }, { status: 404 }, origin);
    }

    const roomCode = normalizeRoomCode(match[1]);
    const action = match[2];
    if (!roomCode) return json({ ok: false, error: "invalid_room_code" }, { status: 400 }, origin);
    const stub = env.MEMEME_ROOMS.getByName(roomCode);

    if (action === "ws") {
      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
        return json({ ok: false, error: "websocket_upgrade_required" }, { status: 426 }, origin);
      }
      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return json({ ok: false, error: "origin_not_allowed" }, { status: 403 }, origin);
      }
      const forward = new URL(request.url);
      forward.hostname = "room.internal";
      forward.protocol = "https:";
      forward.searchParams.set("roomCode", roomCode);
      return stub.fetch(new Request(forward.toString(), request));
    }

    const internal = new URL(`https://room.internal/${action}`);
    internal.searchParams.set("roomCode", roomCode);
    const response = await stub.fetch(new Request(internal.toString(), request));
    return new Response(response.body, {
      status: response.status,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8" }
    });
  }
};

export class MeMeMeRoom extends DurableObject<Env> {
  private async readPlayers(): Promise<LobbyPlayerStored[]> {
    const stored = await this.ctx.storage.get<LobbyPlayerStored[]>("players") ?? [];
    const now = Date.now();
    let migrated = false;
    const players = stored.map((player) => {
      if (typeof player.lastSeenAt === "number" && typeof player.activeDeviceId === "string") return player;
      migrated = true;
      return {
        ...player,
        activeDeviceId: typeof player.activeDeviceId === "string" ? player.activeDeviceId : "",
        lastSeenAt: typeof player.lastSeenAt === "number"
          ? player.lastSeenAt
          : (typeof player.joinedAt === "number" ? player.joinedAt : now)
      };
    });
    if (migrated) await this.ctx.storage.put("players", players);
    return players;
  }

  private async readSettings(): Promise<RoomSettings> {
    return await this.ctx.storage.get<RoomSettings>("settings") ?? {
      cameraAllowed: false,
      voiceAllowed: false,
      cpuFill: true
    };
  }

  private async validHostToken(token: string): Promise<boolean> {
    const expected = await this.ctx.storage.get<string>("hostTokenHash");
    return Boolean(expected && token && await sha256Hex(token) === expected);
  }

  /**
   * CPU Fill never reserves lobby seats. CPU rows are presentation-only until Start.
   * A real human always takes the first free seat in P2 -> P3 -> P4 order.
   */
  private firstFreeHumanSeat07041(players: LobbyPlayerStored[]): number | undefined {
    const humanSeats = new Set(players.filter((player) => player.role === "client").map((player) => player.seatId));
    return [1, 2, 3].find((seat) => !humanSeats.has(seat));
  }

  private async roomCanRecycle07046(
    players: LobbyPlayerStored[],
    started: boolean,
    closed: boolean,
    now = Date.now(),
  ): Promise<boolean> {
    if (closed) return true;

    const host = players.find((player) => player.role === "host");
    if (!started) {
      return Boolean(host && now - host.lastSeenAt > RECONNECT_GRACE_MS_0704);
    }

    // Once a match has started, lobby heartbeats intentionally stop. The room may
    // therefore look stale while the game is healthy. Only recycle after every
    // game/media/shell socket is gone AND every remembered human is beyond the
    // reconnect grace window. This keeps reconnect safe without immortal room codes.
    const noLiveSockets = this.ctx.getWebSockets().length === 0;
    const lastSocketActivityAt = await this.ctx.storage.get<number>("lastSocketActivityAt") ?? 0;
    const latestHumanActivityAt = players.reduce(
      (latest, player) => Math.max(latest, player.lastSeenAt),
      lastSocketActivityAt,
    );
    const reconnectGraceExpired = latestHumanActivityAt > 0
      && now - latestHumanActivityAt > RECONNECT_GRACE_MS_0704;
    return noLiveSockets && reconnectGraceExpired;
  }

  private async maintainLobby0704(): Promise<LobbyPlayerStored[]> {
    const players = await this.readPlayers();
    const started = await this.ctx.storage.get<boolean>("started") ?? false;
    const now = Date.now();
    const closed = await this.ctx.storage.get<boolean>("closed") ?? false;

    if (started) {
      if (!closed && await this.roomCanRecycle07046(players, true, false, now)) {
        await this.ctx.storage.put({
          closed: true,
          closeReason: "host_timeout"
        });
      }
      return players;
    }

    const host = players.find((player) => player.role === "host");

    if (!closed && host && now - host.lastSeenAt > RECONNECT_GRACE_MS_0704) {
      await this.ctx.storage.put({
        closed: true,
        closeReason: "host_timeout"
      });
    }

    const retained = players.filter((player) =>
      player.role === "host" || now - player.lastSeenAt <= RECONNECT_GRACE_MS_0704
    );
    if (retained.length !== players.length) {
      await this.ctx.storage.put("players", retained);
    }
    return retained;
  }

  private canStart(players: LobbyPlayerStored[], settings: RoomSettings, now = Date.now()): boolean {
    if (players.length === 0) return false;
    if (!players.every((player) => player.ready && presence0704(player, now) === "online")) return false;
    return settings.cpuFill ? true : players.length === 4;
  }

  private async publicLobby(): Promise<Record<string, unknown>> {
    const roomCode = await this.ctx.storage.get<string>("roomCode");
    const settings = await this.readSettings();
    const players = await this.maintainLobby0704();
    const started = await this.ctx.storage.get<boolean>("started") ?? false;
    const cpuSeatIds = await this.ctx.storage.get<number[]>("cpuSeatIds") ?? [];
    const closed = await this.ctx.storage.get<boolean>("closed") ?? false;
    const closeReason = await this.ctx.storage.get<"host_left" | "host_timeout">("closeReason");
    const now = Date.now();
    return {
      ok: Boolean(roomCode),
      roomCode: roomCode ?? "",
      settings,
      players: players
        .map(({ clientId, seatId, name, ready, role, lastSeenAt }) => ({
          clientId, seatId, name, ready, role,
          presence: presence0704({ clientId, seatId, name, ready, role, reconnectTokenHash: "", joinedAt: 0, activeDeviceId: "", lastSeenAt }, now)
        }))
        .sort((a, b) => a.seatId - b.seatId),
      started,
      cpuSeatIds,
      closed,
      closeReason,
      reconnectGraceMs: RECONNECT_GRACE_MS_0704,
      canStart: !closed && !started && this.canStart(players, settings, now)
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/initialize" && request.method === "POST") {
      const existing = await this.ctx.storage.get<string>("hostTokenHash");
      if (existing) {
        const closed = await this.ctx.storage.get<boolean>("closed") ?? false;
        const started = await this.ctx.storage.get<boolean>("started") ?? false;
        const existingPlayers = await this.readPlayers();
        if (!await this.roomCanRecycle07046(existingPlayers, started, closed)) {
          return internalJson({ ok: false, error: "room_exists" }, 409);
        }
        await this.ctx.storage.deleteAll();
      }
      const body = await request.json() as Record<string, unknown>;
      const roomCode = normalizeRoomCode(String(body.roomCode ?? ""));
      const hostToken = String(body.hostToken ?? "");
      if (!roomCode || !hostToken) return internalJson({ ok: false, error: "missing_room_bootstrap" }, 400);
      const settings = normalizeSettings(body.settings);
      const deviceId = String(body.deviceId ?? "").trim().slice(0, 120);
      const now = Date.now();
      const players: LobbyPlayerStored[] = [{
        clientId: "host",
        seatId: 0,
        name: normalizeName(body.hostName, "Host"),
        ready: false,
        role: "host",
        reconnectTokenHash: "",
        joinedAt: now,
        activeDeviceId: deviceId || "host-device-unknown",
        lastSeenAt: now
      }];
      await this.ctx.storage.put({
        roomCode,
        hostTokenHash: await sha256Hex(hostToken),
        settings,
        players,
        bannedClientIds: [] as string[],
        started: false,
        closed: false,
        closeReason: "",
        cpuSeatIds: [] as number[],
        createdAt: Date.now()
      });
      return internalJson(await this.publicLobby(), 201);
    }

    if (url.pathname === "/status") {
      const roomCode = await this.ctx.storage.get<string>("roomCode");
      if (!roomCode) return internalJson({ ok: false, error: "room_not_found" }, 404);
      return internalJson(await this.publicLobby());
    }

    if (url.pathname === "/join" && request.method === "POST") {
      const started = await this.ctx.storage.get<boolean>("started") ?? false;
      if (await this.ctx.storage.get<boolean>("closed")) return internalJson({ ok: false, error: "room_closed" }, 410);
      const body = await request.json() as Record<string, unknown>;
      const clientId = String(body.clientId ?? "").trim().slice(0, 80);
      const displayName = normalizeName(body.displayName, "Người chơi");
      const reconnectToken = String(body.reconnectToken ?? "");
      const deviceId = String(body.deviceId ?? "").trim().slice(0, 120);
      if (!clientId) return internalJson({ ok: false, error: "client_id_required" }, 400);
      if (!deviceId) return internalJson({ ok: false, error: "device_id_required" }, 400);
      const banned = await this.ctx.storage.get<string[]>("bannedClientIds") ?? [];
      if (banned.includes(clientId)) return internalJson({ ok: false, error: "kicked_from_room" }, 403);

      const players = await this.maintainLobby0704();
      const existing = players.find((player) => player.clientId === clientId);
      if (existing) {
        if (!reconnectToken || await sha256Hex(reconnectToken) !== existing.reconnectTokenHash) {
          return internalJson({ ok: false, error: "reconnect_token_invalid" }, 403);
        }
        const age = Date.now() - existing.lastSeenAt;
        if (existing.activeDeviceId && existing.activeDeviceId !== deviceId && age <= RECONNECT_GRACE_MS_0704) {
          return internalJson({ ok: false, error: "duplicate_device_active" }, 409);
        }
        existing.name = displayName;
        existing.activeDeviceId = deviceId;
        existing.lastSeenAt = Date.now();
        await this.ctx.storage.put("players", players);
        return internalJson({
          ok: true, roomCode: normalizeRoomCode(String(await this.ctx.storage.get("roomCode") ?? "")),
          clientId, seatId: existing.seatId, reconnectToken, lobby: await this.publicLobby()
        });
      }

      // New humans cannot enter after Start, but an authenticated existing client above
      // may reconnect to its original seat.
      if (started) return internalJson({ ok: false, error: "match_already_started" }, 409);

      // CPU Fill is only a future Start placeholder. It must never make Join return room_full.
      const seatId = this.firstFreeHumanSeat07041(players);
      if (seatId === undefined) return internalJson({ ok: false, error: "room_full_humans" }, 409);
      const token = makeSecret();
      players.push({
        clientId,
        seatId,
        name: displayName,
        ready: false,
        role: "client",
        reconnectTokenHash: await sha256Hex(token),
        joinedAt: Date.now(),
        activeDeviceId: deviceId,
        lastSeenAt: Date.now()
      });
      players.sort((a, b) => a.seatId - b.seatId);
      const staleCpuSeatIds = await this.ctx.storage.get<number[]>("cpuSeatIds") ?? [];
      await this.ctx.storage.put({
        players,
        cpuSeatIds: staleCpuSeatIds.filter((cpuSeatId) => cpuSeatId !== seatId)
      });
      return internalJson({
        ok: true,
        roomCode: normalizeRoomCode(String(await this.ctx.storage.get("roomCode") ?? "")),
        clientId,
        seatId,
        reconnectToken: token,
        lobby: await this.publicLobby()
      }, 201);
    }

    if (url.pathname === "/heartbeat" && request.method === "POST") {
      const body = await request.json() as Record<string, unknown>;
      const clientId = String(body.clientId ?? "").trim().slice(0, 80);
      const deviceId = String(body.deviceId ?? "").trim().slice(0, 120);
      if (!clientId || !deviceId) return internalJson({ ok: false, error: "heartbeat_identity_required" }, 400);

      const players = await this.maintainLobby0704();
      const player = players.find((entry) => entry.clientId === clientId);
      if (!player) return internalJson({ ok: false, error: "player_not_found" }, 404);

      if (player.role === "host") {
        if (!await this.validHostToken(String(body.hostToken ?? ""))) {
          return internalJson({ ok: false, error: "host_auth_failed" }, 403);
        }
      } else {
        const token = String(body.reconnectToken ?? "");
        if (!token || await sha256Hex(token) !== player.reconnectTokenHash) {
          return internalJson({ ok: false, error: "reconnect_token_invalid" }, 403);
        }
      }

      const age = Date.now() - player.lastSeenAt;
      if (player.activeDeviceId && player.activeDeviceId !== deviceId && age <= RECONNECT_GRACE_MS_0704) {
        return internalJson({ ok: false, error: "duplicate_device_active" }, 409);
      }

      player.activeDeviceId = deviceId;
      player.lastSeenAt = Date.now();
      await this.ctx.storage.put("players", players);
      return internalJson(await this.publicLobby());
    }

    if (url.pathname === "/close" && request.method === "POST") {
      const body = await request.json() as Record<string, unknown>;
      if (!await this.validHostToken(String(body.hostToken ?? ""))) {
        return internalJson({ ok: false, error: "host_auth_failed" }, 403);
      }
      await this.ctx.storage.put({
        closed: true,
        closeReason: "host_left"
      });
      for (const socket of this.ctx.getWebSockets()) {
        try { socket.close(4004, "Host left room."); } catch {}
      }
      return internalJson(await this.publicLobby());
    }

    if (url.pathname === "/ready" && request.method === "POST") {
      if (await this.ctx.storage.get<boolean>("started")) return internalJson({ ok: false, error: "match_already_started" }, 409);
      const body = await request.json() as Record<string, unknown>;
      const clientId = String(body.clientId ?? "");
      const ready = body.ready === true;
      const players = await this.readPlayers();
      const player = players.find((entry) => entry.clientId === clientId);
      if (!player) return internalJson({ ok: false, error: "player_not_found" }, 404);
      if (player.role === "host") {
        if (!await this.validHostToken(String(body.hostToken ?? ""))) return internalJson({ ok: false, error: "host_auth_failed" }, 403);
      } else {
        const token = String(body.reconnectToken ?? "");
        if (!token || await sha256Hex(token) !== player.reconnectTokenHash) {
          return internalJson({ ok: false, error: "reconnect_token_invalid" }, 403);
        }
      }
      player.ready = ready;
      await this.ctx.storage.put("players", players);
      return internalJson(await this.publicLobby());
    }

    if (url.pathname === "/settings" && request.method === "POST") {
      const body = await request.json() as Record<string, unknown>;
      if (!await this.validHostToken(String(body.hostToken ?? ""))) return internalJson({ ok: false, error: "host_auth_failed" }, 403);
      if (await this.ctx.storage.get<boolean>("started")) return internalJson({ ok: false, error: "match_already_started" }, 409);
      const current = await this.readSettings();
      const next = normalizeSettings(body.settings);
      const changed = current.cameraAllowed !== next.cameraAllowed || current.voiceAllowed !== next.voiceAllowed || current.cpuFill !== next.cpuFill;
      await this.ctx.storage.put("settings", next);
      if (changed) {
        const players = await this.readPlayers();
        for (const player of players) player.ready = false;
        await this.ctx.storage.put("players", players);
      }
      return internalJson(await this.publicLobby());
    }

    if (url.pathname === "/kick" && request.method === "POST") {
      const body = await request.json() as Record<string, unknown>;
      if (!await this.validHostToken(String(body.hostToken ?? ""))) return internalJson({ ok: false, error: "host_auth_failed" }, 403);
      if (await this.ctx.storage.get<boolean>("started")) return internalJson({ ok: false, error: "match_already_started" }, 409);
      const seatId = Number(body.seatId);
      if (!Number.isInteger(seatId) || seatId < 1 || seatId > 3) return internalJson({ ok: false, error: "invalid_kick_seat" }, 400);
      const players = await this.readPlayers();
      const target = players.find((player) => player.seatId === seatId && player.role === "client");
      if (!target) return internalJson({ ok: false, error: "player_not_found" }, 404);
      const banned = await this.ctx.storage.get<string[]>("bannedClientIds") ?? [];
      if (!banned.includes(target.clientId)) banned.push(target.clientId);
      await this.ctx.storage.put({
        players: players.filter((player) => player.clientId !== target.clientId),
        bannedClientIds: banned
      });
      for (const socket of this.ctx.getWebSockets()) {
        const attachment = socket.deserializeAttachment() as SocketAttachment | null;
        if (attachment?.clientId === target.clientId) {
          try { socket.close(4003, "Kicked by host."); } catch {}
        }
      }
      return internalJson(await this.publicLobby());
    }

    if (url.pathname === "/leave" && request.method === "POST") {
      const body = await request.json() as Record<string, unknown>;
      const clientId = String(body.clientId ?? "");
      const token = String(body.reconnectToken ?? "");
      const players = await this.readPlayers();
      const target = players.find((player) => player.clientId === clientId && player.role === "client");
      if (!target) return internalJson(await this.publicLobby());
      if (!token || await sha256Hex(token) !== target.reconnectTokenHash) return internalJson({ ok: false, error: "reconnect_token_invalid" }, 403);
      await this.ctx.storage.put("players", players.filter((player) => player.clientId !== clientId));
      return internalJson(await this.publicLobby());
    }

    if (url.pathname === "/start" && request.method === "POST") {
      const body = await request.json() as Record<string, unknown>;
      if (!await this.validHostToken(String(body.hostToken ?? ""))) return internalJson({ ok: false, error: "host_auth_failed" }, 403);
      if (await this.ctx.storage.get<boolean>("started")) return internalJson(await this.publicLobby());
      if (await this.ctx.storage.get<boolean>("closed")) return internalJson({ ok: false, error: "room_closed" }, 410);
      const players = await this.maintainLobby0704();
      const settings = await this.readSettings();
      if (!this.canStart(players, settings)) return internalJson({ ok: false, error: "players_not_ready" }, 409);
      const used = new Set(players.map((player) => player.seatId));
      const cpuSeatIds = settings.cpuFill ? [1, 2, 3].filter((seat) => !used.has(seat)) : [];
      await this.ctx.storage.put({ started: true, cpuSeatIds });
      return internalJson(await this.publicLobby());
    }

    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return internalJson({ ok: false, error: "websocket_required" }, 426);
    }

    const roomCode = await this.ctx.storage.get<string>("roomCode");
    const hostTokenHash = await this.ctx.storage.get<string>("hostTokenHash");
    if (!roomCode || !hostTokenHash) return new Response("Room not found.", { status: 404 });
    if (!await this.ctx.storage.get<boolean>("started")) return new Response("Lobby not started.", { status: 409 });

    const role = url.searchParams.get("role") === "host" ? "host" : "client";
    const clientId = (url.searchParams.get("clientId") ?? "").trim().slice(0, 80);
    const seatId = Number(url.searchParams.get("seatId") ?? (role === "host" ? "0" : "-1"));
    const channel = (url.searchParams.get("channel") ?? "game").trim().toLowerCase();
    if (!clientId) return new Response("clientId is required.", { status: 400 });
    if (!/^[a-z0-9-]{1,32}$/.test(channel)) return new Response("Invalid channel.", { status: 400 });
    if (!Number.isInteger(seatId) || seatId < 0 || seatId > 3) return new Response("Invalid seat.", { status: 400 });
    if (role === "host" && seatId !== 0) return new Response("Host must own P1.", { status: 400 });
    if (role === "client" && seatId === 0) return new Response("Remote clients must use P2-P4.", { status: 400 });

    if (role === "host") {
      const token = url.searchParams.get("hostToken") ?? "";
      if (!token || await sha256Hex(token) !== hostTokenHash) return new Response("Invalid host token.", { status: 403 });
    } else {
      const player = (await this.readPlayers()).find((entry) => entry.clientId === clientId && entry.seatId === seatId && entry.role === "client");
      const token = url.searchParams.get("reconnectToken") ?? "";
      if (!player || !token || await sha256Hex(token) !== player.reconnectTokenHash) {
        return new Response("Invalid client seat token.", { status: 403 });
      }
    }

    const sockets = this.ctx.getWebSockets();
    for (const socket of sockets) {
      const attachment = socket.deserializeAttachment() as SocketAttachment | null;
      if (!attachment || attachment.channel !== channel) continue;
      if (attachment.clientId === clientId) {
        try { socket.close(4001, "Replaced by reconnect."); } catch {}
        continue;
      }
      if (attachment.seatId === seatId) return new Response("Seat already occupied.", { status: 409 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const attachment: SocketAttachment = { clientId, seatId, role, roomCode, channel, joinedAt: Date.now() };
    server.serializeAttachment(attachment);
    this.ctx.acceptWebSocket(server);
    await this.ctx.storage.put("lastSocketActivityAt", Date.now());
    server.send(JSON.stringify({ kind: "relay_ready", roomCode, clientId, seatId, role, channel }));
    this.broadcastPresence(channel);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const sender = socket.deserializeAttachment() as SocketAttachment | null;
    if (!sender) return;
    await this.ctx.storage.put("lastSocketActivityAt", Date.now());
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    // 0.1.70.4.2 profile sync may carry three 320px WebP face stickers.
    if (text.length > 1048576) { socket.close(1009, "Message too large."); return; }

    let envelope: RelayEnvelope;
    try { envelope = JSON.parse(text) as RelayEnvelope; }
    catch { socket.send(JSON.stringify({ kind: "relay_error", error: "invalid_json" })); return; }
    if (!envelope || typeof envelope !== "object" || !("payload" in envelope)) {
      socket.send(JSON.stringify({ kind: "relay_error", error: "invalid_envelope" }));
      return;
    }

    const outbound = JSON.stringify({ from: sender.clientId, to: envelope.to, payload: envelope.payload });
    let delivered = 0;
    for (const recipient of this.ctx.getWebSockets()) {
      if (recipient === socket) continue;
      const target = recipient.deserializeAttachment() as SocketAttachment | null;
      if (!target || target.channel !== sender.channel) continue;
      if (sender.role === "client") {
        if (target.role !== "host") continue;
      } else if (envelope.to) {
        if (target.clientId !== envelope.to) continue;
      } else if (target.role === "host") continue;
      try { recipient.send(outbound); delivered += 1; } catch {}
    }
    if (sender.role === "client" && delivered === 0) {
      socket.send(JSON.stringify({ kind: "relay_error", error: "host_offline" }));
    }
  }

  async webSocketClose(socket: WebSocket, code: number, reason: string): Promise<void> {
    const attachment = socket.deserializeAttachment() as SocketAttachment | null;
    await this.ctx.storage.put("lastSocketActivityAt", Date.now());
    try { socket.close(code, reason); } catch {}
    if (attachment) this.broadcastPresence(attachment.channel);
  }

  async webSocketError(socket: WebSocket): Promise<void> {
    const attachment = socket.deserializeAttachment() as SocketAttachment | null;
    await this.ctx.storage.put("lastSocketActivityAt", Date.now());
    try { socket.close(1011, "WebSocket error."); } catch {}
    if (attachment) this.broadcastPresence(attachment.channel);
  }

  private broadcastPresence(channel: string): void {
    const sockets = this.ctx.getWebSockets().filter((socket) => {
      const attachment = socket.deserializeAttachment() as SocketAttachment | null;
      return attachment?.channel === channel;
    });
    const seats = sockets
      .map((socket) => socket.deserializeAttachment() as SocketAttachment | null)
      .filter((value): value is SocketAttachment => Boolean(value))
      .map(({ clientId, seatId, role }) => ({ clientId, seatId, role }))
      .sort((a, b) => a.seatId - b.seatId);
    const payload = JSON.stringify({ kind: "presence", channel, seats });
    for (const socket of sockets) { try { socket.send(payload); } catch {} }
  }
}
