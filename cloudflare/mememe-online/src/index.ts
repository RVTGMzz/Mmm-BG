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
  joinedAt: number;
}

interface RelayEnvelope {
  to?: string;
  payload: unknown;
}

const ALLOWED_ORIGINS = new Set([
  "https://ronvotri.github.io",
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

function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function generateRoomCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return "ME" + (bytes[0] % (36 ** 4)).toString(36).toUpperCase().padStart(4, "0");
}

function makeHostToken(): string {
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

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: "mememe-online",
        milestone: "0.1.70.2",
        transport: "websocket-durable-object"
      }, {}, origin);
    }

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const roomCode = generateRoomCode();
        const hostToken = makeHostToken();
        const stub = env.MEMEME_ROOMS.getByName(roomCode);
        const initialized = await stub.fetch("https://room.internal/initialize", {
          method: "POST",
          headers: {
            "X-MeMeMe-Room-Code": roomCode,
            "X-MeMeMe-Host-Token": hostToken
          }
        });

        if (initialized.status === 409) continue;
        if (!initialized.ok) {
          return json({ ok: false, error: "room_initialize_failed" }, { status: 502 }, origin);
        }

        return json({
          ok: true,
          roomCode,
          hostToken,
          websocketUrl: websocketUrl(request, roomCode, hostToken)
        }, { status: 201 }, origin);
      }

      return json({ ok: false, error: "room_code_exhausted" }, { status: 503 }, origin);
    }

    const match = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9]{4,8})\/(ws|status)$/);
    if (!match) {
      return json({
        ok: false,
        error: "not_found",
        endpoints: ["GET /health", "POST /api/rooms", "GET /api/rooms/:code/status", "WS /api/rooms/:code/ws"]
      }, { status: 404 }, origin);
    }

    const roomCode = normalizeRoomCode(match[1]);
    if (!roomCode) return json({ ok: false, error: "invalid_room_code" }, { status: 400 }, origin);

    const stub = env.MEMEME_ROOMS.getByName(roomCode);

    if (match[2] === "status") {
      const response = await stub.fetch(`https://room.internal/status?roomCode=${encodeURIComponent(roomCode)}`);
      const body = await response.text();
      return new Response(body, {
        status: response.status,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8" }
      });
    }

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
};

export class MeMeMeRoom extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/initialize" && request.method === "POST") {
      const existing = await this.ctx.storage.get<string>("hostTokenHash");
      if (existing) return new Response("Room already exists.", { status: 409 });

      const roomCode = normalizeRoomCode(request.headers.get("X-MeMeMe-Room-Code") ?? "");
      const hostToken = request.headers.get("X-MeMeMe-Host-Token") ?? "";
      if (!roomCode || !hostToken) return new Response("Missing room bootstrap data.", { status: 400 });

      await this.ctx.storage.put({
        roomCode,
        hostTokenHash: await sha256Hex(hostToken),
        createdAt: Date.now()
      });
      return new Response("Created.", { status: 201 });
    }

    if (url.pathname === "/status") {
      const roomCode = await this.ctx.storage.get<string>("roomCode");
      if (!roomCode) {
        return new Response(JSON.stringify({ ok: false, error: "room_not_found" }), {
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }

      const sockets = this.ctx.getWebSockets();
      const seats = sockets
        .map((socket) => socket.deserializeAttachment() as SocketAttachment | null)
        .filter((value): value is SocketAttachment => Boolean(value))
        .map(({ clientId, seatId, role, joinedAt }) => ({ clientId, seatId, role, joinedAt }))
        .sort((a, b) => a.seatId - b.seatId);

      return Response.json({ ok: true, roomCode, connections: seats.length, seats });
    }

    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket required.", { status: 426 });
    }

    const roomCode = await this.ctx.storage.get<string>("roomCode");
    const hostTokenHash = await this.ctx.storage.get<string>("hostTokenHash");
    if (!roomCode || !hostTokenHash) return new Response("Room not found.", { status: 404 });

    const role = url.searchParams.get("role") === "host" ? "host" : "client";
    const clientId = (url.searchParams.get("clientId") ?? "").trim().slice(0, 80);
    const seatId = Number(url.searchParams.get("seatId") ?? (role === "host" ? "0" : "-1"));
    if (!clientId) return new Response("clientId is required.", { status: 400 });
    if (!Number.isInteger(seatId) || seatId < 0 || seatId > 3) return new Response("Invalid seat.", { status: 400 });
    if (role === "host" && seatId !== 0) return new Response("Host must own P1.", { status: 400 });
    if (role === "client" && seatId === 0) return new Response("Remote clients must use P2-P4.", { status: 400 });

    if (role === "host") {
      const token = url.searchParams.get("hostToken") ?? "";
      if (!token || await sha256Hex(token) !== hostTokenHash) {
        return new Response("Invalid host token.", { status: 403 });
      }
    }

    const sockets = this.ctx.getWebSockets();
    for (const socket of sockets) {
      const attachment = socket.deserializeAttachment() as SocketAttachment | null;
      if (!attachment) continue;

      if (attachment.clientId === clientId) {
        try { socket.close(4001, "Replaced by reconnect."); } catch {}
        continue;
      }

      if (attachment.seatId === seatId) {
        return new Response("Seat already occupied.", { status: 409 });
      }
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const attachment: SocketAttachment = {
      clientId,
      seatId,
      role,
      roomCode,
      joinedAt: Date.now()
    };

    server.serializeAttachment(attachment);
    this.ctx.acceptWebSocket(server);

    server.send(JSON.stringify({
      kind: "relay_ready",
      roomCode,
      clientId,
      seatId,
      role
    }));

    this.broadcastPresence();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const sender = socket.deserializeAttachment() as SocketAttachment | null;
    if (!sender) return;

    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    if (text.length > 262144) {
      socket.close(1009, "Message too large.");
      return;
    }

    let envelope: RelayEnvelope;
    try {
      envelope = JSON.parse(text) as RelayEnvelope;
    } catch {
      socket.send(JSON.stringify({ kind: "relay_error", error: "invalid_json" }));
      return;
    }

    if (!envelope || typeof envelope !== "object" || !("payload" in envelope)) {
      socket.send(JSON.stringify({ kind: "relay_error", error: "invalid_envelope" }));
      return;
    }

    const outbound = JSON.stringify({
      from: sender.clientId,
      to: envelope.to,
      payload: envelope.payload
    });

    const recipients = this.ctx.getWebSockets();
    let delivered = 0;

    for (const recipient of recipients) {
      if (recipient === socket) continue;
      const target = recipient.deserializeAttachment() as SocketAttachment | null;
      if (!target) continue;

      if (sender.role === "client") {
        if (target.role !== "host") continue;
      } else if (envelope.to) {
        if (target.clientId !== envelope.to) continue;
      } else if (target.role === "host") {
        continue;
      }

      try {
        recipient.send(outbound);
        delivered += 1;
      } catch {}
    }

    if (sender.role === "client" && delivered === 0) {
      socket.send(JSON.stringify({ kind: "relay_error", error: "host_offline" }));
    }
  }

  webSocketClose(socket: WebSocket, code: number, reason: string): void {
    try { socket.close(code, reason); } catch {}
    this.broadcastPresence();
  }

  webSocketError(socket: WebSocket): void {
    try { socket.close(1011, "WebSocket error."); } catch {}
    this.broadcastPresence();
  }

  private broadcastPresence(): void {
    const sockets = this.ctx.getWebSockets();
    const seats = sockets
      .map((socket) => socket.deserializeAttachment() as SocketAttachment | null)
      .filter((value): value is SocketAttachment => Boolean(value))
      .map(({ clientId, seatId, role }) => ({ clientId, seatId, role }))
      .sort((a, b) => a.seatId - b.seatId);

    const payload = JSON.stringify({ kind: "presence", seats });
    for (const socket of sockets) {
      try { socket.send(payload); } catch {}
    }
  }
}
