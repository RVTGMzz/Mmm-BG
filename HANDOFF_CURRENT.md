# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

**Do not merge PR #1 or mark it Ready unless Ron explicitly asks.**

## Current milestone

**MVP 0.1.70.4 — Online Room Hardening**

Status: **PUBLIC TEST BUILD DEPLOYED / PENDING HUMAN ONLINE HARDENING TEST**

Do not resume 0.1.71 yet.

The previous 0.1.70.1 freeze/stuck symptom was reported fixed by Ron. Full Jail/Hospital acceptance is still pending, so do not call the entire release-flow matrix Runtime PASS yet.

## Runtime authority

Runtime source:
`ece4cde7b42ce2c69cd17e3973bbb6223825a2d2`

Public mirror:
`abb46b58540ffc1ac8b508c8d11ade3670f1926f`

Public Pages:
- run **#44**
- SUCCESS

Test URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Cloudflare Worker:
`https://mememe-online.lengochung28191.workers.dev`

## 0.1.70.4 room hardening contract

Retains all 0.1.70.3 authority:
- Host = P1.
- Remote clients auto-seat P2 -> P3 -> P4.
- Host owns Camera Allowed / Voice Allowed / CPU Fill policy.
- Camera/mic remain OFF by default.
- All humans must Ready.
- Only Host can Start and Kick.
- Gameplay remains browser-Host authoritative.
- game / turn-order / demo-shell WebSocket channels stay isolated.

Adds:
- persistent per-install `deviceId` in browser localStorage;
- reconnect identity continues to use room/client/reconnect token in sessionStorage;
- lobby heartbeat every 3 seconds;
- presence states:
  - `online`
  - `reconnecting`
  - `disconnected`;
- 60-second reconnect grace: a disconnected client seat remains reserved before it can be reclaimed;
- Start requires every current human to be both **Online + Ready**;
- duplicate-device lock: an active reconnect identity cannot be claimed by a different device during the grace window;
- Host explicit Leave closes the room and clients receive a clear closed-room state;
- Host missing for more than 60 seconds closes the pre-match room with `host_timeout`;
- disconnected/reconnecting state is visible in the lobby UI;
- stale client seats are pruned after the grace period on authoritative room maintenance.

Important limitation:
- duplicate-device lock is identity-based, not name-based. Two different people may use the same display name.
- camera/voice WebRTC media is still not implemented.

## Validation

Successful chain for runtime source `ece4cde...`:
- Push CI **#2996**: SUCCESS
- PR CI **#2997**: SUCCESS
- Steam Deck/Web **#301**: SUCCESS
- Cloudflare Workers Build: SUCCESS
- Publisher **#257**: SUCCESS
- 0.1.70.3 inherited lobby gate: PASS
- 0.1.70.4 online hardening gate: PASS
- 0.1.70.3.1 mobile landscape/avatar gate: PASS
- Package validation: PASS
- Pages **#44**: SUCCESS

PR #1 remains Draft/Open.

## Human online test still required

Do not call Online Runtime PASS until Ron verifies real devices.

Core 0.1.70.3 test:
1. Host creates room and remains P1.
2. Remote joins receive P2/P3/P4 in order.
3. Settings parity is correct.
4. Ready gate works.
5. Host Kick works.
6. CPU Fill works.
7. Both devices reach Roll For Order.
8. Remote D6 remains Host-authoritative.
9. State/checksum remains synchronized.

New 0.1.70.4 test:
1. Client temporarily loses network and its seat stays reserved.
2. Lobby changes Online -> Reconnecting -> Disconnected as time passes.
3. Client reconnects within 60 seconds and keeps the same seat.
4. A stale client can be released after the grace period.
5. Start is blocked while a current human is not Online.
6. The same reconnect identity cannot be active from another device during the grace window.
7. Host pressing Leave closes the room for clients instead of leaving them hanging.
8. Host disappearing for more than 60 seconds closes the pre-match room.

## Mobile flow retained

Phone boot contract remains:
**XOAY NGANG -> INTRO -> GAME**

The rotate UI is tappable and attempts fullscreen + landscape lock. Phaser is not created until the initial landscape gate resolves, so the intro starts from frame zero.

Native Android/iOS image pickers may still open portrait. If they return the browser portrait, MeMeMe reuses the rotate gate before opening the face editor.

## Next planned layer

After 0.1.70.4 human acceptance:
**0.1.70.5 — Optional Camera / Voice WebRTC foundation**

Rules:
- Host only allows/denies room media capability.
- Camera and mic stay OFF by default.
- Each player must explicitly enable their own camera/mic.
- Host can never force-enable another player's device.
- Do not resume 0.1.71 visual redesign until Ron asks.

Keep visible vocabulary **TIN TỨC / LÁ BÀI**.
Keep `specialHoldSourceJobId` authoritative.
Do not merge PR #1.
