# MeMeMe MVP 0.1.34 — One-Lap Clarity + Ready Celebration

Status: ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN

## Goal

Polish the one-lap scoring rule introduced in 0.1.33 without adding any new gameplay rules.

## Changes

### 1. Lap-native stakes HUD

The B$ / turn HUD no longer derives a temporary `Vòng 1/3`, `2/3`, `3/3` display from turn count.

It now reads the authoritative lap state directly:

- `HOÀN THÀNH 1 VÒNG • X/4`
- each leaderboard row shows `🏁0/1` before the required lap is complete;
- each completed player shows `🏁✓`.

This removes an old presentation layer that still thought the match was based on fixed rounds.

### 2. First-lap completion celebration

When a player crosses READY and changes from `< 1` completed lap to `>= 1` completed lap, the board shows a temporary banner:

`🏁 <PLAYER> HOÀN THÀNH 1 VÒNG!`

The banner also shows the table progress, for example `2/4 người đã đủ vòng`.

The banner is presentation-only and does not consume gameplay RNG or modify authoritative game state.

Snapshot/resync does not replay the banner.

### 3. Build-label robustness

The current scene now upgrades older 0.1.30 / 0.1.31 / 0.1.33 inherited labels directly to 0.1.34 so the visible playtest badge cannot silently remain on an older milestone.

## Rules intentionally unchanged

- match scoring waits until every player has completed at least one board lap;
- highest B$ then wins; tied B$ remains shared win;
- salary still pays at READY based on Job + level;
- unemployed still receives `0 B$` salary;
- Job Hub remains mandatory;
- Mini Game payout remains undefined / neutral;
- jail deep rules remain undefined;
- Roll For Order remains unchanged;
- stable token-sync fix from 0.1.33 remains in place;
- presentation RNG must not perturb gameplay RNG;
- approved BGM remains checksum-locked;
- PR #1 must not be merged without explicit instruction.

## Validated artifact

GitHub Actions run: `34772895816` / run `#956`

Validated runtime head SHA:
`f6431f8523bdb10cd438e84ca103a7a7d449009d`

Artifact:
`mememe-playtest-0.1.34`

Artifact ID:
`10321679066`

Size:
`8,518,701 bytes`

Digest:
`sha256:3aa3513b6ea14757026b520340aa52cca46f16b7886830a2956a52d4accd1f29`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34772895816`

Full CI passed through artifact upload, including build/typecheck, replay, lockstep, host/client resync, authority, two-tab core, one-lap demo shell/rematch, CPU autoplay, presentation/board regressions, Settings/audio, economy/tactical/function-tile/direct-dice/Job-MiniGame tests and package validation.

## Validation focus

1. Confirm compact HUD shows `HOÀN THÀNH 1 VÒNG • X/4` throughout the match.
2. Confirm every B$ leaderboard row shows a lap marker.
3. Confirm crossing READY the first time changes the row from `🏁0/1` to `🏁✓`.
4. Confirm the lap-complete banner appears once for that required first lap.
5. Confirm snapshot/resync does not replay a stale lap-complete banner.
6. Confirm token movement still never snaps backward during Card/News presentation.
7. Confirm scoring still waits for all players to finish one lap.
