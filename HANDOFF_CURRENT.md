# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the only user-accepted HOST-authoritative rollback baseline.

Validated artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token protection, camera movement-actor lock, or READY/lap/final-result/podium flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.65

**0.1.65 — Job HUD + Rounded UI + Debug Footer Cleanup**

Latest human feedback after the 0.1.64 Card-target hotfix:
1. player/CPU cards should show the actual occupation and salary instead of vague `Có việc / Chưa việc` copy;
2. square-corner rectangular gameplay UI should be rounded for a softer visual language;
3. the red debug/playtest coordinate/footer line at the bottom of gameplay should be hidden.

Manual status: **PENDING RON ACCEPTANCE**.

This is intentionally a **presentation-only build**. It does not change gameplay, RNG, authority, economy, board routing or camera behavior.

## 3. Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene065 as ActiveBoardScene`

Inheritance:
`065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

## 4. Player / CPU career HUD

Implementation:
- `src/ui/playerHud065.ts`
- `src/scenes/CareerMinigameBoardScene065.ts`
- `tests/job-hud-rounded-ui-065.ts`

Player cards now derive career data directly from authoritative `PlayerState` plus `jobs_mvp.json`.

Employed display includes:
- actual Job title;
- current Job level;
- salary for the current level using `jobSalary()`.

Example:
- `💼 🩺 Bác sĩ Lv.2`
- `💰 Lương: 110 B$/vòng`

Unemployed display:
- `💼 Chưa có nghề`
- `💰 Lương: 0 B$/vòng`

The HUD refreshes from authoritative state every frame, so receiving a Job, promotion, demotion, firing, or losing an illegal Job is reflected without a separate UI-only career state.

The prior vague copy `💼 Có việc / 💼 Chưa việc` is no longer used by the active HUD.

## 5. Rounded UI presentation

Player HUD cards now use rounded `Graphics` backings with radius 18 instead of the inherited square Rectangle visual.

For rectangle-based gameplay UI created by overlays/pickers:
- visible UI Rectangles are detected recursively;
- a rounded `Graphics` visual is inserted alongside the original object;
- the original Rectangle remains alive as a near-transparent input hitbox;
- existing pointer handlers therefore keep working;
- fill/stroke state is mirrored every frame so hover/click color changes remain visible;
- full-screen dim overlays intentionally remain edge-to-edge rather than receiving rounded corners.

This covers the main Rectangle-based gameplay panels/buttons including Card/target UI without rewriting their interaction logic.

No board circles are changed by this build.

## 6. Debug/footer cleanup

The always-visible red gameplay footer/debug label is hidden.

The 0.1.65 scene recursively hides Text that:
- starts with `PLAYTEST `; or
- contains `LOCAL MATCH TELEMETRY`.

This is presentation cleanup only. The local playtest report feature itself remains available from the result/report UI.

The build header is updated to:
`CITY • MVP 0.1.65 • JOB HUD + ROUNDED UI`.

## 7. Card target dice hotfix retained

The post-0.1.64 hotfix remains active:
- `cardPickerOpen=true` hard-blocks the direct dice;
- applies throughout Card hand selection, target selection and tactical choice;
- pointerdown validation also respects the same flag;
- the dice returns only after Card UI closes and ordinary roll policy allows it.

Regression remains in `tests/direct-dice-030.ts`.

## 8. 0.1.64 gameplay retained unchanged

0.1.65 must preserve all 0.1.64 gameplay exactly.

### Expanded board
- authored board footprint remains approximately `2340 x 1020`;
- round spaces remain 1.5x the 0.1.63 radii;
- geometry regression requires >=12 px clearance; current closest gap remains 15.0 px;
- TÙ/J1/J2/J3 and BV/H1/H2/H3 stay separated.

### Jail/Hospital release
Success:
1. clear hold;
2. stay on TÙ node 100 or BV node 110;
3. discard release D6;
4. remain same turn at `PRE_ROLL_ACTION`;
5. fresh D6 is required;
6. fresh D6 traverses the real internal corridor.

Corridors:
- Jail: `100 -> 101 -> 102 -> 103 -> 12`;
- Hospital: `110 -> 111 -> 112 -> 113 -> 34`.

### Internal penalties
- J1/J2/J3 = `-20 B$` each;
- H1/H2/H3 = `-20 B$` each;
- penalty applies on landing, not when merely passing over.

Visible money order remains:
`ROLL -> MOVE -> ARRIVE -> EFFECT -> HUD B$ UPDATE`.

### Audio
- Card draw/play gain = `0.80`;
- Step gain = `1.30`.

## 9. Camera — human confirmed good

Ron explicitly confirmed the current camera behavior is good.

Keep 0.1.63.2 movement-actor camera lock unchanged:
- actor still visually moving wins over already-advanced authoritative turn state;
- long rolls remain centered;
- idle camera returns to current turn player;
- `TỔNG QUAN / O` is the deliberate exception.

0.1.65 does not alter camera code.

## 10. Job continuation + branch rules retained

Job mid-roll continuation remains:
`roll 5 -> Job on step 2 -> resolve Job -> continue remaining 3 pips`.

HOST branch routing remains:
- 1 / 3 / 5 -> LEFT;
- 2 / 4 / 6 -> RIGHT.

No live manual picker and no second RNG stream.

## 11. Deterministic gameplay baseline remains 0.1.64

Because 0.1.65 is presentation-only, active gameplay fingerprints are deliberately **not rebased**.

32-match batch seeds `611100..611131` remains:
- turns avg 61.8, max 92;
- commands avg 97.6, max 145;
- final table B$ avg 1336.2;
- spread avg 161.6, max 367;
- deterministic harness checksum `2fca6e9d`.

Active exact sentinel `611102` remains:
- checksum `1dd42c7c`;
- 92 turns;
- 145 authoritative commands;
- finish IDs `[3,2,1,0]`.

Active exact sentinel `611113` remains:
- checksum `856548f4`;
- 51 turns;
- spread 367 B$;
- finish IDs `[3,0,2,1]`.

Run #2370 passed both unchanged, proving the 0.1.65 candidate did not drift authoritative gameplay.

## 12. 0.1.65 green code candidate before docs update

Code candidate is **FULL CI GREEN / PACKAGED**:
- HEAD `10dfe800eafd633b80779d79cd1e06edce584ad5`;
- push run `#2370` / `34997984350`;
- artifact `mememe-playtest-0.1.65-job-hud-rounded-ui`;
- artifact ID `10408202631`;
- size `8,595,544 bytes`;
- SHA256 `84774febd816be36dbca3142d971dee86ef70a7f0e6101ee105c0672d5fe9c8e`;
- expires 2026-09-29;
- **66/66 meaningful CI steps PASS**.

The initial 0.1.65 run exposed one historical-only launcher assertion in `tests/expanded-board-release-audio-064.ts` that required `064` to be the direct ActiveBoardScene. It was corrected to require:
- launcher activates 065;
- 065 extends 064;
- every substantive 0.1.64 spacing/release/audio/camera assertion remains unchanged.

No gameplay expectation was weakened.

## 13. Manual test checklist

Use `docs/PLAYTEST_0.1.65_JOB_HUD_ROUNDED_UI.md` from the artifact.

Verify especially:
1. unemployed HUD shows `Chưa có nghề` and `Lương: 0 B$/vòng`;
2. after getting a Job, HUD shows the real Job name, level and correct salary;
3. promotion/demotion updates the displayed salary correctly;
4. player/CPU info cards have rounded corners;
5. Card hand / target picker and other Rectangle-based gameplay panels/buttons look rounded and remain clickable;
6. hover states still work on rounded target cards/buttons;
7. the red PLAYTEST/debug footer at the bottom is gone;
8. Card target selection still never shows the direct dice behind the modal;
9. confirmed-good camera remains centered on rolls 5/6;
10. 0.1.64 release corridor and Job continuation remain correct;
11. continue watching for any long-run token snap-back.

Do **not** call 0.1.65 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input only.

Do not merge PR #1.
