# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Keep visible names **TIN TỨC / LÁ BÀI**. Never regress HOST authority, deterministic replay, multiplayer ownership, stale-token protection, camera movement-actor lock, or READY/final-result flow.

## Current candidate

**MVP 0.1.65 — Job HUD + Rounded UI + Debug Footer Cleanup**

Human feedback driving this candidate:
- replace vague `Có việc / Chưa việc` inside player/CPU cards with the real occupation and salary;
- make rectangular gameplay UI use rounded corners;
- hide the red debug/playtest footer at the bottom of gameplay.

Manual status: **PENDING RON ACCEPTANCE**.

0.1.65 is presentation-only. Gameplay, RNG, economy, routing and camera must stay exactly on the 0.1.64 baseline.

## Runtime

`CareerMinigameBoardScene065 as ActiveBoardScene`

Inheritance:
`065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## Career HUD

New helper `src/ui/playerHud065.ts` derives HUD copy from authoritative player state and `jobs_mvp.json`.

Employed example:
- `💼 🩺 Bác sĩ Lv.2`
- `💰 Lương: 110 B$/vòng`

Unemployed:
- `💼 Chưa có nghề`
- `💰 Lương: 0 B$/vòng`

HUD refreshes automatically after Job selection, promotion, demotion, firing or Job loss.

## Rounded UI

`CareerMinigameBoardScene065`:
- replaces the square visual of all four player cards with rounded backings;
- scans Rectangle-based gameplay overlays/buttons recursively;
- draws rounded Graphics visuals while retaining the original Rectangle as the input hitbox;
- mirrors fill/stroke every frame so hover and click states remain visible;
- leaves full-screen dim overlays edge-to-edge intentionally.

This keeps existing interaction logic intact while softening the rectangular UI.

## Debug footer removed

The active gameplay scene hides the always-visible red footer/debug text whose copy begins with `PLAYTEST` or contains `LOCAL MATCH TELEMETRY`.

The actual local playtest report remains available from the result/report UI.

Build header now reads:
`CITY • MVP 0.1.65 • JOB HUD + ROUNDED UI`.

## Card target dice hotfix retained

The direct dice remains hidden and non-clickable for the whole Card UI flow while `cardPickerOpen=true`:
- hand picker;
- target picker;
- tactical choice.

The dice only returns when the Card UI is closed and ordinary roll policy permits it.

## 0.1.64 gameplay retained

Board:
- ~2340 x 1020 authored footprint;
- round spaces remain 1.5x;
- minimum measured clearance remains 15.0 px.

Jail/Hospital:
- successful release clears hold but token stays on TÙ/BV;
- release D6 is discarded;
- fresh D6 is required same turn;
- fresh D6 traverses the real J/H corridor.

Penalties:
- J1/J2/J3/H1/H2/H3 = `-20 B$` on landing only.

Visible money order:
`ROLL -> MOVE -> ARRIVE -> EFFECT -> HUD UPDATE`.

Audio:
- Card draw/play `0.80`;
- Step `1.30`.

## Camera retained and human-confirmed

Ron already confirmed the camera fix is good.

0.1.63.2 behavior remains regression-locked:
- camera follows the actor still visually moving;
- long rolls remain centered;
- idle camera returns to current player;
- `TỔNG QUAN / O` remains the exception.

0.1.65 does not alter camera code.

## Job + branch rules retained

Job continuation:
`roll 5 -> Job at step 2 -> resolve -> continue 3 remaining pips`.

HOST parity routing:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT.

No manual branch picker and no second RNG stream.

## Deterministic QA

0.1.65 is presentation-only, therefore 0.1.64 gameplay sentinels remain active and unchanged.

32-match baseline still has deterministic checksum `2fca6e9d`.

Exact sentinels still pass:
- seed `611102` -> checksum `1dd42c7c`;
- seed `611113` -> checksum `856548f4`.

This proves the current candidate did not alter gameplay outcomes.

## Green code candidate before docs update

- HEAD `10dfe800eafd633b80779d79cd1e06edce584ad5`;
- push run `#2370` / `34997984350`;
- artifact `mememe-playtest-0.1.65-job-hud-rounded-ui`;
- artifact ID `10408202631`;
- size `8,595,544 bytes`;
- SHA256 `84774febd816be36dbca3142d971dee86ef70a7f0e6101ee105c0672d5fe9c8e`;
- **66/66 meaningful CI steps PASS**.

An initial run only failed because the historical 0.1.64 test required 064 to be the direct launcher scene. The test now requires 065 -> 064 inheritance while keeping all substantive 0.1.64 assertions unchanged.

## Manual check

Use `docs/PLAYTEST_0.1.65_JOB_HUD_ROUNDED_UI.md`.

Verify:
- actual Job title + level + salary appear in every player/CPU info card;
- unemployed shows salary 0;
- Job changes immediately update HUD;
- main rectangular UI panels/buttons look rounded and remain clickable;
- hover colors still work;
- red debug/playtest footer is gone;
- Card target modal never shows the direct dice behind it;
- camera remains good on rolls 5/6;
- 0.1.64 Jail/Hospital corridor and Job continuation remain correct.

Do not call 0.1.65 accepted until Ron validates runtime behavior.

Do not merge PR #1.
