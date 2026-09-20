# MeMeMe — Latest Handoff

Branch: `mmm-mvp-0.1-core`

Legacy PR #1 remains Draft/Open on `mememe-mvp-0.1-core`.
Do not merge or mark Ready unless Ron explicitly asks.

## Current public runtime

**0.1.70.4.18 — Adaptive Presentation Safe Area**

Runtime source tree:
`7583836934f7081c8fd2cb85941fd989c39b967f`

Final validated source head (tree-identical presentation-test follow-up):
`e8e1f018f7c904aca0c84020840d6a2095289830`

Public mirror:
`0c5f3398105126344fa4ba81a5c7ce13fe7b63b2`

Mirror publish title:
`Publish compiled playtest 7583836`

Test:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

## 0.1.70.4.17 retained fixes

- Card/News cinematics use a semantic single-owner guard, so duplicate detached text is hidden generically instead of patching one event at a time.
- P1–P4 token seat badges are restored/kept visible during movement.
- Invisible `move_step` blockers are no longer treated as visual modals.

## 0.1.70.4.18 changes

- Card/News titles now adapt from 30px down to 24px when required by wrapped copy.
- Card/News body copy now adapts from 16px down to 12px before the final text box is locked.
- The same adaptive fitter applies to future Card/News content, not only currently reported cards.
- Reaction bubbles moved to HUD-safe vertical lanes:
  - top lane: y=190
  - bottom lane: y=530
- The safe-area regression test accounts for the 1.18x active-player HUD scale and 12px mobile safe margin.
- Presentation-only: no Host authority, deterministic RNG, reconnect ownership, or WebRTC signaling changes.

## Validation

- MMM MVP CI #3156: SUCCESS
- GitHub Actions run: `35525656148`
- Typecheck/build: SUCCESS
- 0.1.70.4.17 global cinematic ownership + token badge guard: SUCCESS
- 0.1.70.4.18 adaptive presentation safe area: SUCCESS
- mobile landscape/face style: SUCCESS
- external playtest package: SUCCESS
- compiled mirror publish: SUCCESS

The compiled mirror currently points at:
- JS: `./assets/index-CyXhECzx.js`
- CSS: `./assets/index-BZCErh0i.css`

Do not call Runtime PASS from CI alone. Ron's screenshots/device playtest remain the runtime authority.

## Online runtime items still requiring real-device confirmation

- client can roll on their own turn;
- black waiting overlay disappears;
- P1/P2 can see each other's camera in group media;
- CPU autoplay behaves correctly;
- reconnect preserves the active match state.

Current WebRTC remains STUN-only. Add TURN only if cross-network real-device testing proves it necessary.

Cloudflare online release remains frozen unless Ron explicitly asks to update it.

Do not resume 0.1.71 yet.
Do not merge PR #1.
