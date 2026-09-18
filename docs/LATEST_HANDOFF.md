# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR #1: Draft/Open. Do not merge unless Ron explicitly asks.

## Current milestone

**0.1.70.3 — Online Lobby Authority**

Public build is deployed. Human cross-device testing is pending.

Runtime source:
`d56755ba6731ef78c8ecb32a76e0e7752e036506`

Implemented:
- Cloudflare Worker + SQLite Durable Object room backend;
- Internet WebSocket transport while retaining BroadcastChannel local mode;
- Host=P1;
- server auto-seat P2 -> P3 -> P4 by join order;
- Host-controlled Camera Call allowed, Voice Chat allowed, CPU Fill;
- camera/mic remain OFF and media is not implemented yet;
- human Ready state and authoritative Start gate;
- settings changes reset Ready;
- CPU Fill converts vacant seats on Start;
- Host Kick;
- room-session ban for kicked client IDs;
- reconnect token hashing and client seat validation;
- game / turn-order / demo-shell channel isolation.

Validation:
- CI #2954 SUCCESS
- PR CI #2955 SUCCESS
- source web #280 SUCCESS
- Cloudflare Worker build SUCCESS
- publisher #236 SUCCESS
- 0.1.70.3 lobby gate PASS
- Pages #36 SUCCESS

Public mirror:
`5f9c4805a17a9919a5c35a36456eaf1882296724`

Test:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Do not call Online Runtime PASS until Ron tests two real devices.
Do not resume 0.1.71.
Do not merge PR #1.

The prior freeze/stuck symptom is reported fixed, but the full Jail/Hospital release matrix still has not received explicit human PASS.
