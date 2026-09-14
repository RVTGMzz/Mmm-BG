# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.48 - Bugfix Pass (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN / NEW-CHAT READY)**

Latest validated artifact: `mememe-playtest-0.1.48`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.48_PROGRESS.md`
3. `docs/PLAYTEST_0.1.48.md`
4. `docs/MAP_ARCHITECTURE_FINAL.md`
5. `docs/UI_FINAL_PLAYER_HUD.md`
6. `docs/GAME_DESIGN_CURRENT.md`
7. `src/scenes/CareerMinigameBoardScene048.ts`
8. `src/ui/movementVisualPolicy.ts`
9. `tests/bugfix-pass-048.ts`
10. `src/scenes/TurnOrderScene048.ts`
11. `src/scenes/TurnStakesBoardScene.ts`
12. `src/audio/bgmController.ts`
13. `src/scenes/CareerMinigameBoardScene046.ts`
14. `tests/multiplayer-presentation-parity-047.ts`

## Active flow: two parallel tracks

### A. Runtime gate

- Keep **0.1.48** as the active validated runtime checkpoint.
- First runtime question remains repeated-turn token movement: after landing, the token must not snap back to the pre-roll position.
- If it reproduces, capture the in-game bug report and trace authoritative event/state/presentation order instead of adding another blind coordinate snap.
- Do not open a new runtime milestone until 0.1.48 is runtime-clean.
- Once clean, current recommended runtime milestone is **0.1.49 Legacy Effect Audit**.

### B. Final map architecture design

This is an explicit documentation/design lane and may continue while 0.1.48 is being tested because it does not alter the packaged runtime.

- Canonical tracker: `docs/MAP_ARCHITECTURE_FINAL.md`.
- Continue the final map into a **detailed 44–48-space architecture**.
- Decide exact node count, main-loop/side-branch split, numbered topology and adjacency graph.
- Hospital and Jail remain approved special side branches.
- Define branch geometry/entry/rejoin nodes but do not invent deep Jail/Hospital gameplay rules.
- Define districts, landmark anchors, special-node distribution and camera-safe spacing for close-follow gameplay.
- Keep this track visible in handoffs until the architecture is approved and promoted to its own runtime implementation milestone.

## Final-direction design decisions staged after packaging 0.1.48

These are documentation/design decisions only; they do not modify the validated 0.1.48 runtime/package checkpoint.

- Final board contains **more than 40 playable spaces**; current working range is `44–48`.
- Normal gameplay camera is close-follow: focus the active player at turn change and follow that token while moving.
- Full-map view is an explicit overview mode, not the permanent gameplay view.
- Four persistent player HUDs are anchored to screen corners: P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at least avatar, player name and B$; hand/Job/status data stays compact.
- The active player's HUD gets clear visual emphasis while authority remains unchanged.
- Hospital and Jail are approved as special side-branch/location concepts for the final board.
- Hospital/Jail deep mechanics are still undefined. In particular, do not invent Jail skip-turn, bail, escape-roll or escape-card rules.
- Canonical HUD/camera contract: `docs/UI_FINAL_PLAYER_HUD.md`.
- Canonical final-map design tracker: `docs/MAP_ARCHITECTURE_FINAL.md`.
- Temporary visual reference: `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`.
- The reference PNG may be removed after the real HUD/camera is implemented, validated and documented.

## What changed in 0.1.48

### Money SFX timing / duplicate fix

Money delta packets still update UI immediately, but packet-level coin audio is suppressed when a visible money-tile, READY, News or Card presentation owns the event. Money tile presentation remains the event-aligned coin cue owner. This removes the early spoiler sound and second duplicate coin cue reported during playtest.

### Correct Roll For Order face

`TurnOrderScene048` retains the validated 0.1.45 remote authority ceremony, but replaces the settled fixed `🎲` emoji with the actual `⚀..⚅` glyph matching the host-authoritative D6 value.

### Mini Game BGM isolation

`bgmController.playRound()` no longer chooses `city_silly` for board round 2. `03_City_Silly.ogg` is reserved for `playMiniGame()` and is restored away when the Mini Game overlay ends.

### Token snap-back protection

`movementVisualPolicy.ts` classifies queued movement as animate / duplicate / stale from the token's current screen position. `CareerMinigameBoardScene048` only allows the move tween when the token is still at that event's expected from-node. Old/out-of-order presentation steps cannot pull a token backwards from a newer visible position.

### Legacy reference correction

The Tiên Tri / Phép Thuật screenshots are reference content from the older game, not a request to rename current systems. Active 0.1.48 therefore bypasses the 0.1.47 visual rename experiment and restores the current visible names **TIN TỨC** and **LÁ BÀI** plus the prior Card hand layout. The useful HOST/CLIENT presentation parity regression remains retained.

## Validated artifact

GitHub Actions run: `34814789556` / run `#1441`

Validated runtime/package SHA:
`5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`

Artifact:
`mememe-playtest-0.1.48`

Artifact ID:
`10336247664`

Size:
`8,566,826 bytes`

Digest:
`sha256:d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34814789556`

Full CI passed build/typecheck, replay/lockstep, host-client/two-tab authority, all retained gameplay/presentation regressions, Remote Roll, Multiplayer Job Hub, multiplayer presentation parity, new 0.1.48 money/dice/BGM/token regression, image bounds, package verification, guide copy and artifact upload.

Later documentation-only commits may advance branch HEAD. Treat the runtime/package SHA above as the validated rollback point until a newer artifact is explicitly validated.

## Retained gameplay/result behavior

- Starting wallet remains `200 B$`.
- Every player completes one physical lap before final scoring.
- READY pays current Job salary once per crossing and increments lap.
- Mandatory Job Hub and `1–2 A / 3–4 B / 5–6 C` mapping remain unchanged.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị payout remains `30 / 20 / 10 / 0 B$`.
- Direct RPS payout remains `25 / 15 / 5 / 0 B$`.
- Four approved BGM and eight supplied SFX remain checksum-protected.
- Final B$ lock/podium/result-control chain remains unchanged.
- Original face files remain local.
- CPU remains a QA bot.
- Jail deep mechanics remain intentionally undefined.

## New-chat first priority

1. Runtime-test repeated turns for the same player and verify token never snaps backward after landing.
2. In parallel, continue `docs/MAP_ARCHITECTURE_FINAL.md` into a detailed numbered 44–48-space map architecture.
3. Verify positive/negative money landing produces exactly one correctly timed coin cue.
4. Verify Roll For Order final face and number agree on host/client and tie rerolls.
5. Verify normal board progression never starts `03_City_Silly.ogg`; an actual Mini Game must start it and restore the prior track afterward.
6. Verify labels remain TIN TỨC / LÁ BÀI.
7. Re-check Remote Roll, Job Hub, Mini Game payout, final podium and parity/resync behavior.

If token snap-back still reproduces, use the in-game bug report and trace the exact authoritative event/state/presentation sequence rather than adding another coordinate hard-snap.

If 0.1.48 is clean in runtime, recommended next runtime milestone is **0.1.49 Legacy Effect Audit**. Use the supplied old Tiên Tri / Phép Thuật cards as effect/content references for the current TIN TỨC / LÁ BÀI systems. Do not rename the current systems. Do not invent jail, skip-turn, bail or escape mechanics without Ron defining those rules.

The final HUD/camera/44–48-space board direction is a tracked future runtime lane and must not be silently mixed into the already validated 0.1.48 artifact.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.48_PROGRESS.md, docs/PLAYTEST_0.1.48.md, docs/MAP_ARCHITECTURE_FINAL.md và docs/UI_FINAL_PLAYER_HUD.md. Current validated artifact là mememe-playtest-0.1.48, run #1441, runtime SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Có 2 track song song: (A) runtime-test 0.1.48, ưu tiên token snap-back sau nhiều lượt; chỉ khi runtime-clean mới mở runtime milestone mới, hiện đề xuất 0.1.49 Legacy Effect Audit. (B) tiếp tục thiết kế architecture map final thật chi tiết trong working range 44–48 ô, gồm main loop + Hospital/Jail side branches, districts, landmarks và adjacency graph, nhưng không tự invent deep Jail/Hospital mechanics. Final camera close-follow, 4 HUD cố định ở 4 góc. Giữ tên TIN TỨC / LÁ BÀI. Không merge PR #1.`
