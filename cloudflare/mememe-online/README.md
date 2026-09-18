# MeMeMe Online Worker — 0.1.70.2

Cloudflare Worker + SQLite-backed Durable Object foundation for cross-device MeMeMe rooms.

## Dashboard build settings

- Worker name: `mememe-online`
- Production branch: `mememe-mvp-0.1-core`
- Root directory: `cloudflare/mememe-online`
- Build command: leave blank
- Deploy command: `npx wrangler deploy`
- Preview builds: disabled for now

The Worker name intentionally matches the existing Cloudflare dashboard Worker.

## Endpoints

- `GET /health`
- `POST /api/rooms` creates a room and returns a host token
- `GET /api/rooms/:code/status`
- `WS /api/rooms/:code/ws`

The Durable Object is a relay/room coordinator only. Gameplay authority remains in MeMeMe's existing host-authoritative session code.

The WebSocket server uses Cloudflare's hibernation API through `ctx.acceptWebSocket()`.

## Cloudflare Git deployment

Git integration connected on 2026-09-18 to the existing `mememe-online` Worker.
This checkpoint intentionally touches the Worker root so Cloudflare can run the first production build from `mememe-mvp-0.1-core`.
