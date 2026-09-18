# NEXT CHAT PROMPT — MeMeMe Board Game

Continue from `HANDOFF_CURRENT.md` on branch `mememe-mvp-0.1-core`.

Current milestone:
**0.1.70.3 — Online Lobby Authority**

Read:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. Ron's newest runtime feedback
4. `src/core/onlineLobby0703.ts`
5. `src/scenes/OnlineRoomLobbyScene.ts`
6. `cloudflare/mememe-online/src/index.ts`
7. `src/core/onlineTransport0702.ts`
8. `tests/online-lobby-authority-0703.ts`

Runtime source:
`d56755ba6731ef78c8ecb32a76e0e7752e036506`

Public test:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

0.1.70.3 contract:
- Host=P1
- remote clients auto-seat P2/P3/P4 in join order
- Host controls room permission for Camera Call / Voice Chat and CPU Fill
- camera and mic are still OFF by default; no WebRTC media yet
- all humans must Ready
- setting change resets Ready
- CPU Fill turns vacant seats into CPU at Start
- CPU Fill OFF requires four humans
- Host owns Start and Kick
- reconnect token protects reserved client seat
- gameplay WS validates lobby seat identity
- Host gameplay authority remains unchanged

Await Ron's two-device online runtime test before declaring Online Runtime PASS.

Do not resume 0.1.71.
Do not merge or Ready PR #1.
Keep TIN TỨC / LÁ BÀI.
