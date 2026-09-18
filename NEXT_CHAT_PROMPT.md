# NEXT CHAT PROMPT — MeMeMe Board Game

Continue from `HANDOFF_CURRENT.md` on branch `mememe-mvp-0.1-core`.

Current milestone:
**0.1.70.4 — Online Room Hardening**

Read:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. Ron's newest runtime feedback
4. `src/core/onlineLobby0703.ts`
5. `src/scenes/OnlineRoomLobbyScene.ts`
6. `cloudflare/mememe-online/src/index.ts`
7. `src/core/onlineTransport0702.ts`
8. `tests/online-room-hardening-0704.ts`
9. `tests/online-lobby-authority-0703.ts`

Runtime source:
`ece4cde7b42ce2c69cd17e3973bbb6223825a2d2`

Public test:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

0.1.70.4 contract:
- Host=P1
- auto-seat P2/P3/P4
- Ready / CPU Fill / Kick retained
- per-device identity
- heartbeat every 3 seconds
- presence Online / Reconnecting / Disconnected
- 60-second reconnect grace
- Start requires Online + Ready
- duplicate-device reconnect identity lock
- Host Leave closes room
- Host timeout closes pre-match room after 60 seconds
- gameplay authority remains Host-side
- camera/voice media is still not implemented

Mobile boot remains:
**XOAY NGANG -> INTRO -> GAME**

Await Ron's real-device runtime test before declaring Online Runtime PASS.

After 0.1.70.4 human acceptance, planned next layer is:
**0.1.70.5 Optional Camera/Voice WebRTC**
with camera/mic OFF by default and explicit per-player opt-in.

Do not resume 0.1.71.
Do not merge or Ready PR #1.
Keep TIN TỨC / LÁ BÀI.
