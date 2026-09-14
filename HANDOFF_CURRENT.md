# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.48 - Bugfix Pass**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN / NEW-CHAT READY**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34814789556` / run `#1441`

Validated runtime/package SHA:
`5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`

Artifact:
`mememe-playtest-0.1.48`

Artifact ID:
`10336247664`

Artifact size:
`8,566,826 bytes`

Digest:
`sha256:d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34814789556`

Important: later handoff/documentation commits may advance branch HEAD. The runtime/package checkpoint above remains the validated rollback point until a newer artifact is explicitly validated.

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.48_PROGRESS.md`
4. `docs/PLAYTEST_0.1.48.md`
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

## Final-direction design decisions staged after 0.1.48 package

These are documentation/design locks only. They do **not** alter the validated 0.1.48 runtime artifact.

- Final board has **more than 40 playable spaces**; current working band is `44–48`.
- Normal gameplay camera is close-follow: at turn change it focuses the active player and follows that token while moving.
- Full-map view is an explicit overview, not the permanent gameplay view.
- Four player HUDs stay fixed in screen space: P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at minimum avatar, player name and B$; compact hand/Job/status information may be added.
- Active player gets clear visual emphasis without changing authoritative state.
- Hospital and Jail are approved as distinct side-branch/location concepts on the final board.
- Hospital/Jail deep mechanics remain undefined and must not be invented implicitly.
- Canonical HUD/camera contract: `docs/UI_FINAL_PLAYER_HUD.md`.
- Temporary visual reference: `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`.
- The concept PNG may be removed later after the real runtime HUD is implemented, validated and documented.

## 0.1.48 bug fixes

### Money SFX

- Packet-level coin audio is suppressed when a visible Card/News/READY/money-tile presentation owns that moment.
- Money tile landing retains the event-aligned coin cue.
- Prevents the old behavior where coin audio spoiled the result before movement finished and then played again on landing.
- Mini Game payout can still use packet-level money audio because it has no money-tile landing owner.

### Roll For Order die face

- The old settled frame used fixed Unicode emoji `🎲`, whose artwork did not reflect the authoritative D6 value.
- `TurnOrderScene048` now settles with `⚀..⚅` plus the matching number.
- Remote Roll authority, tie reroll and host-generated D6 remain unchanged.

### Mini Game BGM

- `03_City_Silly.ogg` is now reserved for actual Mini Game overlay playback.
- Normal board round 2 no longer selects `city_silly`.
- Mini Game still restores the previous board track after the overlay ends.

### Token snap-back

- `movementVisualPolicy.ts` rejects duplicate/stale `move_step` presentation.
- A move step animates only when the visible token is still at that event's from-node.
- If the token is already at the destination or has advanced beyond the event, that old visual step is ignored.
- Authoritative node state, replay, RNG and checksum are untouched.

## Corrected legacy-card interpretation

The supplied vertical Tiên Tri / horizontal Phép Thuật images are reference content from the older game for feature/effect analysis. They are **not** a rename request.

Therefore active 0.1.48 bypasses the 0.1.47 visual rename wrapper:

- current board/system name remains **TIN TỨC**;
- current board/system name remains **LÁ BÀI**;
- Card hand UI is restored to the pre-0.1.47 wording/layout;
- the useful 0.1.47 HOST/CLIENT presentation-parity audit remains as a regression only;
- supplied reference images are not persisted as runtime assets.

## Retained multiplayer/gameplay

- Remote Roll For Order remains host-authoritative.
- Multiplayer Job Hub remains host-authoritative and spectator-safe.
- Job mapping remains `1-2 A / 3-4 B / 5-6 C`.
- Starting wallet remains `200 B$`.
- Every player completes one physical lap before final scoring.
- READY pays current Job salary once per crossing and increments lap.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct RPS payout: `25 / 15 / 5 / 0 B$`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Final podium/result-input chain remains unchanged.
- Original face files remain local.
- CPU remains a QA bot.
- Jail deep mechanics remain intentionally undefined.

## Next-chat priority

1. Runtime-test 0.1.48 with the same player taking at least two turns. The main question is whether the old token sequence `arrive -> snap back -> next turn continues from authoritative destination` is gone.
2. Re-check money landing audio for exactly one correctly timed cue.
3. Re-check Roll For Order settled face against the authoritative number, including tie rerolls.
4. Confirm `03_City_Silly.ogg` never starts from normal board progression and only starts in an actual Mini Game.
5. Confirm visible board/system labels remain TIN TỨC / LÁ BÀI.
6. Re-check Remote Roll, Job Hub, final Mini Game payout, podium and multiplayer presentation parity.

If token snap-back still reproduces, use the in-game bug report and trace the exact event/state/presentation sequence. Do not add another blind hard-snap workaround.

If 0.1.48 is clean in runtime, recommended next milestone is **0.1.49 Legacy Effect Audit**: analyze the supplied old Tiên Tri / Phép Thuật cards as effect inspiration for the current TIN TỨC / LÁ BÀI systems. Keep the current names. Do not invent jail/skip-turn/bail/escape rules.

The newly locked final HUD/camera/40+ board direction is a future runtime lane and must not be silently mixed into the already validated 0.1.48 package.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.48_PROGRESS.md, docs/PLAYTEST_0.1.48.md và docs/UI_FINAL_PLAYER_HUD.md. Current validated artifact là mememe-playtest-0.1.48, run #1441, runtime SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Final direction đã khóa: board >40 spaces (working 44–48), close-follow camera, 4 HUD cố định ở 4 góc, Hospital/Jail side branches nhưng deep rules chưa định nghĩa. Ưu tiên runtime feedback của 0.1.48, đặc biệt bug token snap-back sau nhiều lượt. Nếu 0.1.48 ổn thì chuẩn bị 0.1.49 Legacy Effect Audit từ bộ bài cũ, nhưng giữ tên hiện tại TIN TỨC / LÁ BÀI. Không merge PR #1.`
