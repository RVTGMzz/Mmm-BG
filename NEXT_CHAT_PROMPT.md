# NEXT CHAT PROMPT — MeMeMe Board Game

Continue from `HANDOFF_CURRENT.md` on branch `mememe-mvp-0.1-core`.

Current public runtime:
**0.1.70.4.5 — Online Runtime Shell + Group Media + Mobile Readability**

Runtime source:
`66dba6cf04f6f5959d2b0dc340719465336835a8`

Public:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. Ron's newest runtime feedback
4. `src/ui/OnlineGroupMedia07043.ts`
5. `src/core/demoShellSession.ts`
6. `src/scenes/DemoBoardScene.ts`
7. `src/scenes/CareerMinigameBoardScene0701.ts`
8. `src/mobileReadability07044.css`
9. `tests/online-runtime-media-07043.ts`
10. `tests/online-board-autostart-07045.ts`

Current intended runtime:
- Lobby cleanup is real.
- Each online human owns only their avatar.
- CPU auto-rolls and auto-plays.
- Group camera/voice uses WebRTC mesh; Camera/Mic OFF until each person opts in.
- Online Demo shell auto-begins on Host and broadcasts active state.
- Mobile readability pass is presentation-only.

Await real-device verification before Runtime PASS.

If camera works on same Wi-Fi but not across different networks, add TURN; do not redesign signaling unless evidence shows signaling itself is wrong.

Do not resume 0.1.71.
Do not merge or Ready PR #1.
Keep TIN TỨC / LÁ BÀI.
