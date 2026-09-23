# NEXT CHAT PROMPT — Mmm-BG

Continue the board game from `HANDOFF_CURRENT.md` in repo `RVTGMzz/Mmm-BG`, branch `mmm-mvp-0.1-core`.

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/PRESENTATION_OWNERSHIP_AUDIT_070422.md`
4. `src/ui/presentationLanes070422.ts`
5. `src/ui/MatchPresentationLayer.ts`
6. `src/scenes/PresentationParityBoardScene.ts`
7. `src/scenes/CareerMinigameBoardScene07044.ts`
8. `tests/presentation-owner-rootfix-070422.ts`
9. `src/ui/JobChoicePicker.ts`
10. `tests/job-minigame-input-070410.ts`
11. Ron's newest runtime screenshots/feedback

Current checkpoint:
**0.1.70.4.22 — Presentation Single Owner + Safe Reactions**

Current handoff HEAD:
`f1b94158ed273d7347795a72c29e9af0bd8fbc63`

Important:
- recurring overlay bug was traced to duplicate visual producers + horizontally unsafe reaction geometry + stale reaction timers + permissive final whitelisting;
- both legacy toast producers are now disabled;
- reactions use tested 212px side rails and exact event ownership;
- final modal guard runs again in POST_UPDATE;
- do not add another content-specific hide rule unless new evidence proves a separate producer;
- do not touch Host authority/RNG/reconnect/WebRTC for this presentation bug;
- do not call Runtime PASS before real browser retest.

Also retain:
- Visual Foundation VF-01 + VF-02 implemented, VF-03 panel/modal shell is next after stability;
- Roguelike Lap Shuffle implemented, circular tile hotfix landed, runtime retest still pending;
- PR #1 stays Draft/Open;
- never merge PR #1 unless Ron explicitly asks;
- keep visible labels TIN TỨC / LÁ BÀI.

Newest follow-up:
- source `f1b94158ed273d7347795a72c29e9af0bd8fbc63` adds Enter/Space to authoritative Job Hub dice;
- CI #3213 PASS; mirror `05dc1532f7ef9dda39392f0ca9a44dc3204b1f21` and Pages #17 SUCCESS;
- test mouse/Enter/Space parity, spectator/waiting lock and A/B/C/ESC detail controls in browser;
- visual acceptance remains open for the broader Job layout and border-naturalness feedback.

At session start, first verify the latest GitHub Actions result for the current branch HEAD, then continue from Ron's newest runtime feedback.
