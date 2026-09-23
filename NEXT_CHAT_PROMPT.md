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
9. `src/ui/JobChoicePicker.ts` and `src/ui/jobHubFocus070423.ts`
10. `tests/job-minigame-input-070410.ts`
11. `src/ui/MiniGameOverlay.ts` and `src/ui/miniGameLayout070423.ts`
12. `tests/job-minigame-depth-059.ts` and `tests/roguelike-lap-shuffle-071.ts`
13. `src/ui/steamDeckController070424.ts` and `src/ui/steamDeckPadPolicy070424.ts`
14. `tests/steam-deck-controller-070424.ts` and `docs/STEAM_DECK_WEB_070425.md`
15. `src/ui/visualFoundationV01.ts` and `src/visualFoundationV01.css` (VF-03)
16. `src/ui/visualFoundationHudVf04.ts` and `src/scenes/CareerMinigameBoardScene065.ts` (VF-04)
17. `tests/visual-foundation-hud-vf04.ts` and `docs/VISUAL_FOUNDATION_PASS_0.1.md`
18. Ron's newest runtime screenshots/feedback

Current checkpoint:
**0.1.70.4.22 — Presentation Single Owner + Safe Reactions**

Current validated source HEAD:
`f4c55e2e53ce90b40196cf603efaf86cd37f127d`

Important:
- recurring overlay bug was traced to duplicate visual producers + horizontally unsafe reaction geometry + stale reaction timers + permissive final whitelisting;
- both legacy toast producers are now disabled;
- reactions use tested 212px side rails and exact event ownership;
- final modal guard runs again in POST_UPDATE;
- do not add another content-specific hide rule unless new evidence proves a separate producer;
- do not touch Host authority/RNG/reconnect/WebRTC for this presentation bug;
- do not call Runtime PASS before real browser retest.

Also retain:
- Visual Foundation VF-01/02 live; VF-03 shared shell with Avatar Choice modal CI #3220/PAGES #23 PASS; VF-04 four-corner HUD source with exact bounds CI #3222/PAGES #24 PASS but device review still required; next VF-05 first canonical TIN TỨC / LÁ BÀI after runtime feedback;
- Roguelike Lap Shuffle implemented, circular tile hotfix landed, runtime retest still pending;
- PR #1 stays Draft/Open;
- never merge PR #1 unless Ron explicitly asks;
- keep visible labels TIN TỨC / LÁ BÀI.

Newest follow-up:
- source `f1b94158ed273d7347795a72c29e9af0bd8fbc63` adds Enter/Space to authoritative Job Hub dice;
- CI #3213 PASS; mirror `05dc1532f7ef9dda39392f0ca9a44dc3204b1f21` and Pages #17 SUCCESS;
- test mouse/Enter/Space parity, spectator/waiting lock and A/B/C/ESC detail controls in browser;
- visual acceptance remains open for the broader Job layout and border-naturalness feedback.

Latest CI #3214 SUCCESS, mirror `a24b90417b018198651f61bb0e1e8d75fb36412b`, Pages #18 SUCCESS. Four runtime screenshot issues to verify in next session: (1) RPS duel labels/result and HUD layer, (2) Job Hub Enter/Space dice (already shipped with CI #3213), (3) arbitrary News/Card detached text/reactions (source .22, browser proof still required), (4) post-Lap Shuffle double rings (new .23 in-place canonical circle update). Never confuse CI PASS with runtime acceptance.

Latest Job Hub keyboard-only milestone: `a91fbb10ffaaa9710393f541e6b1017b0459ec01`, CI #3215 SUCCESS, compiled mirror `636c4662b72c8adecae7f5d26f7b0421fe99a7a2`, Pages #19 SUCCESS. Visible keyboard focus starts on the dice, arrow keys/Tab move between offered jobs and dice, Enter/Space opens detail or rolls according to focus, detail can be closed without mouse. Runtime acceptance still required for complete mouse-free flow.

Newest Steam Deck .25 source `6f9507e1cff75914b56bf0f4a75ac6e7de27abb8`, CI #3219 SUCCESS, mirror `473fcf21a0a7797d7525309eac00a210e061c281`, Pages #22 SUCCESS. Mouse-free browser Gamepad play from Splash, CHỌN CÁCH CHƠI mode A-edit/↑↓/A-save/B-cancel, Setup, Roll For Order, authoritative board D6, Job Hub default dice, branch/target cards, Mini Game, and final result input is source-implemented and automatically gated, but requires a real Steam Deck/Steam Input/Chromium retest before any Runtime PASS statement. Current latest docs in `docs/STEAM_DECK_WEB_070425.md`.

Current newest visual milestone is `f4c55e2` (CI #3222 SUCCESS, compiled mirror `bbf37689cad6f122b8bccb5ec15046cfcb3ed591`, Pages #24 SUCCESS). VF-04 source only until Ron confirms real Steam Deck + mobile appearance. Read `docs/VISUAL_FOUNDATION_PASS_0.1.md`, actual player HUD skin and all four-corner clamps before any VF-05 propagation. Old overlay/reaction and Lap Shuffle runtime acceptance stays open.

At session start, first verify the latest GitHub Actions result for the current branch HEAD, then continue from Ron's newest runtime feedback.
