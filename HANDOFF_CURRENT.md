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

Human feedback:
1. player/CPU cards must show the actual occupation and salary instead of vague `Có việc / Chưa việc` copy;
2. square-corner rectangular gameplay UI should be rounded for a softer visual language;
3. the red debug/playtest footer at the bottom of gameplay should be hidden.

Manual status: **PENDING RON ACCEPTANCE**.

0.1.65 is intentionally **presentation-only**. It does not alter gameplay, RNG, authority, economy, board routing or camera behavior.

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

Player cards derive career information directly from authoritative `PlayerState` plus `jobs_mvp.json`.

Employed example:
- `💼 🩺 Bác sĩ Lv.2`
- `💰 Lương: 110 B$/vòng`

Unemployed:
- `💼 Chưa có nghề`
- `💰 Lương: 0 B$/vòng`

Salary is resolved through `jobSalary()` for the current authoritative Job level. The HUD refreshes from state, so Job selection, promotion, demotion, firing or Job loss is reflected without a separate UI-only career state.

The active HUD no longer uses the vague `💼 Có việc / 💼 Chưa việc` copy.

## 5. Rounded UI presentation

0.1.65 rounds both major classes of rectangular gameplay UI.

### Rectangle-based panels/buttons
- visible UI `Phaser.GameObjects.Rectangle` objects are detected recursively;
- a rounded `Graphics` visual is inserted alongside the original object;
- the original Rectangle remains alive as a near-transparent input hitbox;
- pointer handlers and click behavior are preserved;
- fill/stroke state is mirrored each frame, so hover/click colors remain visible;
- full-screen dim overlays intentionally remain edge-to-edge.

### Text-background badges
Phaser Text backgrounds are square by default, so 0.1.65 also handles UI Text objects with `backgroundColor`, including badges such as Overview/turn-status/build labels:
- the built-in square background is made transparent;
- a rounded Graphics backing is inserted behind the Text;
- position, size, scale, angle, visibility and alpha are mirrored each frame;
- the Text itself and its input behavior remain unchanged.

### Player cards
All four player/CPU cards use dedicated rounded Graphics backings with radius 18.

No board circles are modified by 0.1.65.

## 6. Debug/footer cleanup

The always-visible red gameplay footer/debug label is hidden.

The active scene recursively hides Text that:
- starts with `PLAYTEST `; or
- contains `LOCAL MATCH TELEMETRY`.

This removes the red bottom-screen debug strip only. The local playtest report remains available from the result/report UI.

Build header:
`CITY • MVP 0.1.65 • JOB HUD + ROUNDED UI`.

## 7. Card target dice hotfix retained

The post-0.1.64 hotfix remains active:
- `cardPickerOpen=true` hard-blocks direct dice visibility and clicking;
- applies throughout Card hand selection, target selection and tactical choice;
- dice returns only after Card UI closes and ordinary roll policy permits rolling.

Regression remains in `tests/direct-dice-030.ts`.

## 8. 0.1.64 gameplay retained unchanged

### Expanded board
- authored footprint remains approximately `2340 x 1020`;
- round spaces remain 1.5x the 0.1.63 radii;
- geometry regression requires >=12 px clearance; current minimum remains 15.0 px;
- TÙ/J1/J2/J3 and BV/H1/H2/H3 stay separated.

### Jail/Hospital release
Success:
1. clear hold;
2. stay on TÙ node 100 or BV node 110;
3. discard release D6;
4. remain same turn at `PRE_ROLL_ACTION`;
5. require a fresh movement D6;
6. fresh D6 traverses the real internal corridor.

Corridors:
- Jail: `100 -> 101 -> 102 -> 103 -> 12`;
- Hospital: `110 -> 111 -> 112 -> 113 -> 34`.

### Internal penalties
- J1/J2/J3 = `-20 B$` each;
- H1/H2/H3 = `-20 B$` each;
- penalty resolves on landing only.

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

32-match deterministic checksum remains `2fca6e9d`.

Active exact sentinels remain unchanged:
- seed `611102` -> checksum `1dd42c7c`, 92 turns, 145 authoritative commands, finish IDs `[3,2,1,0]`;
- seed `611113` -> checksum `856548f4`, 51 turns, spread 367 B$, finish IDs `[3,0,2,1]`.

Run #2378 passed these exact fingerprints unchanged, proving the finished 0.1.65 presentation code did not alter authoritative gameplay.

## 12. 0.1.65 final code candidate before docs-inclusive run

Latest code candidate is **FULL CI GREEN / PACKAGED**:
- HEAD `aa7ee7ebfd7e45eebfc7925f9aee7ac65c0e77bd`;
- push run `#2378` / `34998498203`;
- artifact `mememe-playtest-0.1.65-job-hud-rounded-ui`;
- artifact ID `10408766808`;
- size `8,595,842 bytes`;
- SHA256 `2a7197a2f9df1c1722cd11a6c09f00642768cbe4f232536b05e66f1818258dd8`;
- expires 2026-09-29;
- **66/66 meaningful CI steps PASS**.

The final polish after the first green 0.1.65 candidate added rounded backings for Text-background UI so labels such as `TỔNG QUAN` / turn-state badges do not remain square-cornered while the rest of the interface is rounded.

## 13. Manual test checklist

Use `docs/PLAYTEST_0.1.65_JOB_HUD_ROUNDED_UI.md` from the artifact.

Verify especially:
1. unemployed HUD shows `Chưa có nghề` and `Lương: 0 B$/vòng`;
2. after getting a Job, HUD shows the real Job name, level and correct salary;
3. promotion/demotion updates displayed salary correctly;
4. player/CPU info cards have rounded corners;
5. Rectangle-based Card/target/popup/button UI has rounded corners and remains clickable;
6. Text-background badges such as Overview/turn status also have rounded corners;
7. hover states still work on target cards/buttons;
8. red PLAYTEST/debug footer is gone;
9. Card target selection still never shows the direct dice behind the modal;
10. confirmed-good camera remains centered on rolls 5/6;
11. 0.1.64 release corridor and Job continuation remain correct;
12. continue watching for long-run token snap-back.

Do **not** call 0.1.65 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input only.

Do not merge PR #1.
