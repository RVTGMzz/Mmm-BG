# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Keep visible names **TIN TỨC / LÁ BÀI**. Never regress HOST authority, deterministic replay, multiplayer ownership, stale-token protection, camera movement-actor lock, or READY/final-result flow.

## Current candidate

**MVP 0.1.65 — Job HUD + Rounded UI + Debug Footer Cleanup**

Human feedback:
- player/CPU info cards must show real occupation + salary instead of vague employment copy;
- square-corner rectangular gameplay UI should be rounded;
- red debug/playtest footer at the bottom should be hidden.

Manual status: **PENDING RON ACCEPTANCE**.

0.1.65 is presentation-only. Gameplay, RNG, economy, routing and camera stay on the 0.1.64 baseline.

## Runtime

`CareerMinigameBoardScene065 as ActiveBoardScene`

Inheritance:
`065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## Career HUD

`src/ui/playerHud065.ts` derives the displayed career directly from authoritative player state and `jobs_mvp.json`.

Employed example:
- `💼 🩺 Bác sĩ Lv.2`
- `💰 Lương: 110 B$/vòng`

Unemployed:
- `💼 Chưa có nghề`
- `💰 Lương: 0 B$/vòng`

HUD follows Job selection, promotion, demotion, firing and Job loss automatically.

## Rounded UI

`CareerMinigameBoardScene065` now rounds both kinds of square gameplay UI:

### Rectangle panels/buttons
- scans Rectangle-based gameplay overlays/buttons recursively;
- inserts rounded Graphics visuals;
- retains the original Rectangle as the interactive hitbox;
- mirrors hover/click fill and stroke state every frame;
- full-screen dim overlays intentionally remain edge-to-edge.

### Text-background badges
Phaser Text background rectangles are also replaced visually with rounded backings. This covers square badges such as Overview/turn-status/build labels that are not Rectangle objects.

The original Text object remains intact while its built-in square background becomes transparent.

### Player cards
All four player/CPU cards use dedicated rounded backings.

## Debug footer removed

The active gameplay scene hides always-visible red footer/debug copy beginning with `PLAYTEST` or containing `LOCAL MATCH TELEMETRY`.

The actual local match report remains available from the result/report UI.

## Card target dice hotfix retained

While `cardPickerOpen=true`, direct dice is hidden and non-clickable throughout:
- Card hand picker;
- target picker;
- tactical choice.

It only returns after Card UI closes and normal roll policy allows it.

## 0.1.64 gameplay retained

Board:
- ~2340 x 1020 authored footprint;
- round spaces remain 1.5x;
- minimum measured clearance remains 15.0 px.

Jail/Hospital:
- successful release clears hold but token stays on TÙ/BV;
- release D6 is discarded;
- fresh D6 required same turn;
- fresh D6 traverses the real J/H corridor.

Penalties:
- J1/J2/J3/H1/H2/H3 = `-20 B$` on landing only.

Visible money order:
`ROLL -> MOVE -> ARRIVE -> EFFECT -> HUD UPDATE`.

Audio:
- Card draw/play `0.80`;
- Step `1.30`.

## Camera retained and human-confirmed

Ron explicitly confirmed the camera fix is good.

0.1.63.2 remains regression-locked:
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

0.1.65 is presentation-only, therefore 0.1.64 gameplay fingerprints remain active unchanged.

- 32-match deterministic checksum `2fca6e9d`;
- seed `611102` checksum `1dd42c7c`;
- seed `611113` checksum `856548f4`.

Run #2378 passed those exact values after the final rounded Text-background polish.

## Final green code candidate before docs-inclusive run

- HEAD `aa7ee7ebfd7e45eebfc7925f9aee7ac65c0e77bd`;
- push run `#2378` / `34998498203`;
- artifact `mememe-playtest-0.1.65-job-hud-rounded-ui`;
- artifact ID `10408766808`;
- size `8,595,842 bytes`;
- SHA256 `2a7197a2f9df1c1722cd11a6c09f00642768cbe4f232536b05e66f1818258dd8`;
- **66/66 meaningful CI steps PASS**.

## Manual check

Use `docs/PLAYTEST_0.1.65_JOB_HUD_ROUNDED_UI.md`.

Verify:
- actual Job title + level + salary appear in every player/CPU card;
- unemployed shows salary 0;
- Job changes update HUD immediately;
- player cards, popup/button Rectangles and Text-background badges are rounded;
- UI remains clickable and hover colors work;
- red debug/playtest footer is gone;
- Card target modal never shows direct dice behind it;
- camera remains good on rolls 5/6;
- 0.1.64 Jail/Hospital corridor and Job continuation remain correct.

Do not call 0.1.65 accepted until Ron validates runtime behavior.

Do not merge PR #1.
