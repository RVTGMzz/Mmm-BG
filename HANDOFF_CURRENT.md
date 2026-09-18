# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

**Do not merge PR #1 or mark it Ready unless Ron explicitly asks.**

## Current milestone

**MVP 0.1.70.4.5 — Online Runtime Shell + Group Media + Mobile Readability**

Status: **PUBLIC TEST BUILD DEPLOYED / PENDING REAL-DEVICE RUNTIME ACCEPTANCE**

Do not resume 0.1.71 yet.

## Runtime authority

Runtime source:
`66dba6cf04f6f5959d2b0dc340719465336835a8`

Public mirror:
`db577149ff3467b5119c8ab63edc4df20bd55a11`

Public Pages:
- run **#51**
- SUCCESS

Test URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Cloudflare Worker:
`https://mememe-online.lengochung28191.workers.dev`

PR #1 remains Draft/Open.

## Retained online room contract

- Host = P1.
- Humans auto-seat P2 -> P3 -> P4.
- CPU Fill never blocks real humans; humans replace CPU placeholders in join order.
- Custom room code is optional, 4–8 A-Z/0-9 characters; empty means auto-generated.
- Ready / Kick / CPU Fill remain Host-controlled.
- Camera/Voice permission is room policy only; each player still turns their own device on/off.
- 3-second lobby heartbeat.
- presence: Online / Reconnecting / Disconnected.
- 60-second reconnect grace.
- duplicate-device reconnect identity lock.
- Host Leave closes the pre-match room.
- authenticated existing clients may reconnect to their original seat after Start.
- new humans cannot join after Start.

## 0.1.70.4.2 Participation ownership

- Lobby DOM + heartbeat timer are explicitly destroyed on scene transition.
- No stale lobby UI should remain clickable behind the game.
- Every online human routes through SetupScene and edits only their own seat/avatar.
- Online setup shows only the local seat card.
- CPU seats are not edited in avatar setup.
- 3-face avatar profile is synced through the Turn Order authority channel.
- profile payload limit was raised enough for three 320px WebP face stickers.
- Host waits for all expected human seats before locking Roll For Order claims.
- CPU Roll For Order is automatic.
- CPU board turns use the existing authoritative test-bot decision path.
- Online waiting overlay no longer offers a mid-match return-to-lobby control.

## 0.1.70.4.3 Group Camera / Voice

Implemented `src/ui/OnlineGroupMedia07043.ts`:
- real WebRTC peer connections;
- signaling uses the authenticated online `media` logical channel;
- host relays client-to-client signaling;
- room roster is synchronized through the Host;
- mesh connections are established between all real human peers;
- STUN currently uses `stun:stun.l.google.com:19302`;
- each player starts Camera/Mic OFF;
- each player may independently turn their own camera/mic on;
- Host policy can allow/deny camera and voice but cannot force-enable another device;
- remote players fall back to their static avatar when video is off;
- local preview is muted;
- group media starts on the active online board and stops on scene shutdown.

Important: this is currently **STUN-only**. Cross-network WebRTC may still fail on restrictive NAT/mobile networks; add TURN only if real-device testing proves it is necessary.

## 0.1.70.4.4 Mobile UI readability

Presentation-only pass:
- larger mobile landscape lobby copy;
- larger online room player/status text;
- larger avatar editor and camera controls;
- larger rule selector controls;
- larger board/player HUD via retained presentation subclasses;
- group-media strip resized for mobile;
- canonical gameplay authority/RNG remains unchanged.

## 0.1.70.4.5 Online board auto-start

The screenshot feedback showed clients stuck behind:
`CHỜ HOST BẮT ĐẦU...`

Fix:
- when the online Host reaches the Demo board after Ready + Roll For Order, Host immediately calls shell `begin(...)`;
- authoritative `shell=active` is broadcast;
- reconnecting/late existing clients request `shell_state` and receive the already-active state;
- manual DEMO Start remains only for solo/hotseat fallback.

This should remove the black waiting overlay and allow the correct remote human to roll on their own turn.

## Validation

Runtime `66dba6c...`:
- Push CI **#3100** SUCCESS
- PR CI **#3101** SUCCESS
- Steam Deck/Web **#355** SUCCESS
- Cloudflare Workers Build SUCCESS
- Publisher **#311** SUCCESS
- Online Participation gate PASS
- Online Runtime Shell + Group Media gate PASS
- Mobile UI Readability gate PASS
- Online Board Auto-start gate PASS
- Pages **#51** SUCCESS

## Human runtime tests still required

Do **not** call Online Runtime PASS yet.

Highest-priority test:
1. Host + P2 enter online room.
2. Both finish their own avatar setup.
3. Roll For Order completes.
4. Board opens without persistent black `CHỜ HOST BẮT ĐẦU` overlay.
5. When P2 is current actor, P2 can roll from P2 device.
6. CPU P3/P4 roll and play automatically.
7. With Camera Allowed, P1 turns camera on and P2 sees P1 video.
8. P2 turns camera on and P1 sees P2 video.
9. Both video tiles are visible in the same group media strip.
10. Turning camera off restores static avatar.
11. Voice remains individually opt-in.
12. Reload/reconnect P2 and confirm original seat + active shell recover.

If group camera works only on same Wi-Fi but fails across different networks, keep signaling code and add TURN rather than rewriting the media model.

## Mobile flow

Phone boot contract:
**XOAY NGANG -> INTRO -> GAME**

Rotate UI is tappable and attempts fullscreen + landscape lock before Phaser is created.

Keep visible vocabulary **TIN TỨC / LÁ BÀI**.
Keep `specialHoldSourceJobId` authoritative.
Do not merge PR #1.
