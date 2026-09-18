# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR #1: Draft/Open. Do not merge unless Ron explicitly asks.

## Current public runtime

**0.1.70.4.5 — Online Runtime Shell + Group Media + Mobile Readability**

Runtime source:
`66dba6cf04f6f5959d2b0dc340719465336835a8`

Mirror:
`db577149ff3467b5119c8ab63edc4df20bd55a11`

Pages #51: SUCCESS

Test:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Implemented since old 0.1.70.4 checkpoint:
- human-over-CPU seating;
- optional custom 4–8 character room codes;
- lobby DOM cleanup on Start;
- authenticated reconnect after Start;
- each human edits/syncs only their own 3-face avatar;
- CPU Roll For Order + board autoplay;
- WebRTC group camera/voice mesh via authenticated `media` channel;
- camera/mic OFF by default and player-owned;
- mobile readability/font sizing pass;
- online Demo shell auto-start, removing the stuck `CHỜ HOST BẮT ĐẦU` state.

Validation:
- CI #3100 SUCCESS
- PR CI #3101 SUCCESS
- Steam Deck/Web #355 SUCCESS
- Cloudflare Worker SUCCESS
- Publisher #311 SUCCESS
- Pages #51 SUCCESS

Do not call Runtime PASS until Ron verifies:
- client can roll on their own turn;
- black waiting overlay disappears;
- P1/P2 can see each other's camera in group media;
- CPU auto-play behaves correctly;
- reconnect preserves active match state.

Current WebRTC uses STUN only. Add TURN only if cross-network real-device testing requires it.

Do not resume 0.1.71 yet.
Do not merge PR #1.
