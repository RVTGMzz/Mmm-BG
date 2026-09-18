# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR #1: Draft/Open. Do not merge unless Ron explicitly asks.

## Current milestone

**0.1.70.4 — Online Room Hardening**

Public build is deployed. Human cross-device hardening test is pending.

Runtime source:
`ece4cde7b42ce2c69cd17e3973bbb6223825a2d2`

Implemented:
- all 0.1.70.3 Host=P1 / auto-seat / Ready / CPU Fill / Kick rules retained;
- per-install device identity;
- 3-second authoritative lobby heartbeat;
- Online / Reconnecting / Disconnected presence;
- 60-second reconnect grace and reserved seat;
- Start requires humans to be Online + Ready;
- duplicate-device identity lock during grace;
- explicit Host Leave closes room;
- Host timeout closes pre-match room after 60 seconds;
- stale client seat pruning;
- presence UI in lobby;
- mobile flow remains XOAY NGANG -> INTRO -> GAME;
- camera/voice still policy-only, no WebRTC media yet.

Validation:
- Push CI #2996 SUCCESS
- PR CI #2997 SUCCESS
- Steam Deck/Web #301 SUCCESS
- Cloudflare Worker build SUCCESS
- Publisher #257 SUCCESS
- 0.1.70.4 hardening gate PASS
- Pages #44 SUCCESS

Public mirror:
`abb46b58540ffc1ac8b508c8d11ade3670f1926f`

Test:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Do not call Online Runtime PASS until Ron tests the reconnect/presence/device-lock/host-leave cases on real devices.
Do not resume 0.1.71.
Do not merge PR #1.

Next planned online layer after human acceptance: **0.1.70.5 optional Camera/Voice WebRTC**, opt-in per player and OFF by default.
