# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.48 - Bugfix Pass**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

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

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.48_PROGRESS.md`
4. `docs/PLAYTEST_0.1.48.md`
5. `src/scenes/CareerMinigameBoardScene048.ts`
6. `src/ui/movementVisualPolicy.ts`
7. `tests/bugfix-pass-048.ts`
8. `src/scenes/TurnOrderScene048.ts`
9. `src/scenes/TurnStakesBoardScene.ts`
10. `src/audio/bgmController.ts`
11. `src/scenes/CareerMinigameBoardScene046.ts`
12. `tests/multiplayer-presentation-parity-047.ts`

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

## Runtime test focus

1. Play at least two turns for the same player and verify no token snap-back after movement settles.
2. Land on a money tile and confirm there is no early coin cue and only one cue on landing.
3. Check several Roll For Order values/tie rerolls and confirm the settled glyph matches the authoritative number.
4. Stay on the board across the old round-2 boundary and confirm `03_City_Silly.ogg` does not start.
5. Enter a real Mini Game and confirm `03_City_Silly.ogg` starts there and restores afterward.
6. Confirm board labels still say TIN TỨC / LÁ BÀI.
7. Re-check Remote Roll, Job Hub, final Mini Game payout, podium and multiplayer presentation parity.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.48_PROGRESS.md và docs/PLAYTEST_0.1.48.md. Current validated artifact là mememe-playtest-0.1.48, run #1441, runtime SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
