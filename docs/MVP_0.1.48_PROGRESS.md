# MVP 0.1.48 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

## Scope

0.1.48 is a focused runtime bugfix pass based on direct playtest feedback. It does not add new gameplay rules.

## Fixed / changed

### Money SFX ownership

`TurnStakesBoardScene` now inspects fresh authoritative events before playing packet-level coin audio.

Presentation-owned economy events suppress the immediate packet coin cue:

- money `tile_land`;
- `ready_pass`;
- `news`;
- `card_play`.

The visible landing/event presentation remains the audio owner for those moments. Economy updates without a presentation owner, such as Mini Game payout, may still use the packet-level coin cue.

Goal: no result-spoiling coin sound before movement finishes, and no duplicate coin sound on landing.

### Roll For Order D6 face

New wrapper: `src/scenes/TurnOrderScene048.ts`.

The authoritative protocol remains unchanged. The only visual fix is the settled D6 frame: instead of fixed Unicode emoji `🎲`, it now uses the correct `⚀..⚅` glyph corresponding to the host-authoritative result.

### Mini Game BGM isolation

`bgmController.playRound()` no longer maps board round 2 to `city_silly`.

`03_City_Silly.ogg` is reserved for `playMiniGame()` only. The Mini Game overlay still restores its previous track on exit.

### Token snap-back guard

New pure helper: `src/ui/movementVisualPolicy.ts`.

New runtime wrapper: `src/scenes/CareerMinigameBoardScene048.ts`.

Before a queued `move_step` tween runs, the presentation checks the token's current screen position against that event's expected from/to node coordinates:

- at from-node -> animate;
- already at to-node -> duplicate, ignore;
- elsewhere -> stale/out-of-order, ignore.

This prevents a delayed presentation event from dragging a token back to an earlier node after the authoritative state and visible token have already advanced.

No authoritative node state, gameplay RNG, replay command or checksum data is changed.

### Corrected legacy-card interpretation

The supplied Tiên Tri / Phép Thuật images were reference material from the older game for effect/content analysis, not a request to rename current systems.

The active 0.1.48 runtime therefore bypasses the 0.1.47 visual rename wrapper and returns to the validated 0.1.46 gameplay/UI chain:

- **TIN TỨC** remains the current board/news system name;
- **LÁ BÀI** remains the current card system name;
- `CardHandPicker` is restored to the pre-0.1.47 wording/layout;
- 0.1.47 HOST/CLIENT presentation parity remains retained as a version-agnostic regression.

Reference images remain external visual/content references and are not persisted as runtime assets in this milestone.

## Regression

New `tests/bugfix-pass-048.ts` validates:

- valid move step animates;
- duplicate destination is ignored;
- stale/out-of-order move step is ignored;
- small screen-position drift around from-node is tolerated;
- board rounds never select `city_silly`;
- Mini Game path still selects `city_silly`;
- packet money cue is suppressed for presentation-owned economy events;
- money landing presentation retains the event-aligned coin cue;
- Roll For Order final visual uses the real D6 face;
- active runtime uses 0.1.48 board + Turn Order wrappers;
- 0.1.48 bypasses the misunderstood 0.1.47 rename without touching gameplay authority;
- visible Card vocabulary is restored.

## Retained invariants

- Remote Roll For Order remains host-authoritative.
- Multiplayer Job Hub remains host-authoritative.
- Mandatory Job Hub stop and Job D6 `1–2 A / 3–4 B / 5–6 C` remain unchanged.
- Starting wallet remains `200 B$`.
- One-lap scoring and READY salary remain unchanged.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị remains `30 / 20 / 10 / 0 B$`.
- Direct RPS remains `25 / 15 / 5 / 0 B$`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Final result/podium chain remains unchanged.
- Original face files remain local.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Validated checkpoint

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

Full CI passed build/typecheck, deterministic replay/lockstep, host-client/two-tab authority, all retained gameplay/presentation regressions, Remote Roll, Multiplayer Job Hub, presentation parity, the new 0.1.48 bugfix regression, image bounds, package verification, guide copy and artifact upload.
