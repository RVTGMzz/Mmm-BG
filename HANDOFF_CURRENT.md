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

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.63.3

**0.1.63.3 — Presentation Sync + Release D6 Clarity**

Direct human runtime feedback after 0.1.63.2 exposed two related problems:
1. destination money/effect could already appear while the token was still visually delayed at its previous position;
2. a CPU leaving Jail could visually look as if the successful release face was immediately reused as normal movement.

Root cause analysis:
- authoritative state is intentionally resolved before queued presentation catches up;
- the old Playtest layer still emitted an immediate money/card delta toast from the new authoritative state;
- canonical HUD also read authoritative money/card values while dice/movement animation was still playing;
- Jail/Hospital release already used the correct core rule, but its authoritative exit corridor generated several `move_step` events that visually looked like normal movement;
- DirectDiceBoardScene also keyed `rollPendingTurn` only by turn number, while a successful release intentionally stays in the same turn, so the human fresh D6 needed an explicit same-turn re-arm after release presentation.

Manual status: **PENDING RON ACCEPTANCE**.

## 3. Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene0633 as ActiveBoardScene`

Inheritance:
`0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.63.3 does not change gameplay RNG, economy, Card/News values, branch rules, Job rules or Mini Game rules.

## 4. Landing/effect presentation synchronization

Implementation:
- `src/scenes/CareerMinigameBoardScene0633.ts`
- `tests/presentation-release-sync-0633.ts`

The legacy immediate state-delta toast is suppressed in the active runtime.

Canonical HUD refresh is held while presentation is still blocking on:
- `dice_roll`;
- `move_step`.

The authoritative state still updates immediately underneath. Only the visible HUD waits until the token has visually completed movement, so the intended order is now:

`ROLL -> TOKEN MOVES -> ARRIVES -> LANDING/EFFECT + VISIBLE HUD DELTA`

This prevents the player from appearing stationary while the destination effect is already visible.

## 5. Jail/Hospital release rule and presentation

The authoritative core rule was already correct before this patch and remains unchanged.

Successful Jail/Hospital release still does:
1. roll release/recovery D6;
2. test release condition;
3. traverse the internal exit path;
4. clear `specialHold`;
5. explicitly set `turn.lastRoll = null`;
6. return to `PRE_ROLL_ACTION` in the **same turn**;
7. require a **fresh D6** before normal board movement.

Therefore the release face can never authoritatively become movement distance.

Existing 0.1.57 regression still proves this. Example seed 1 for Jail:
- first D6 = 1 enters Jail;
- next-turn release D6 = 1 succeeds;
- release ends at node 12 with `lastRoll = null`, same turn, `PRE_ROLL_ACTION`;
- next D6 = 4 is the separate fresh movement roll.

0.1.63.3 makes that core rule visually explicit:
- `special_release` now receives a visible panel;
- success copy says the shown face is **CHỈ dùng để thoát** and a **D6 MỚI** will decide movement;
- internal corridor nodes stay in authoritative replay/state but are no longer presented as several ordinary board steps;
- visually, the held token returns to the rejoin gate in one smooth motion;
- after release presentation finishes, the same-turn direct dice pending marker is cleared so the fresh movement D6 can appear/click exactly once.

Hospital follows the same pattern with its own release faces.

## 6. Camera fix retained from 0.1.63.2

The movement-actor camera lock remains inherited:
- active presentation actor has priority over already-advanced `currentPlayer()`;
- long rolls 5/6 stay framed on the token actually moving;
- camera returns to authoritative current player only when presentation is idle;
- `TỔNG QUAN / O` remains the intentional exception;
- expanded edge bounds remain inherited.

## 7. Presentation polish retained

From 0.1.63/0.1.63.1:
- landing/event content scale **1.18x**;
- Card/News cinematic content scale **1.14x**;
- token scale **0.82x**;
- round tile radii normal/feature/anchor/hold = **27/31/33/36**;
- close gameplay zoom **2.15x**;
- Overview **0.88x**.

Visible labels now identify 0.1.63.3:
- `CITY • MVP 0.1.63.3 • PRESENTATION SYNC + RELEASE D6`
- `PLAYTEST 0.1.63.3 • ĐI TỚI Ô RỒI MỚI ĂN HIỆU ỨNG`

## 8. Gameplay retained from 0.1.62

Branch rule remains HOST-authoritative:
- `1 / 3 / 5` -> **TRÁI**;
- `2 / 4 / 6` -> **PHẢI**.

No manual branch picker and no second RNG stream.

Draft D remains 44 main spaces, five Mini Game spaces and three equal-step forward-only junctions.

No changes to economy, TIN TỨC/LÁ BÀI values, Job, Mini Game payout ownership, Lottery, READY finish lock or finished-player B$ immunity.

## 9. Deterministic QA retained

0.1.61 local Playtest Match Report remains inherited/local-only.

Because 0.1.63.3 is presentation/state-pacing only, the 0.1.62 gameplay baseline and sentinels remain valid:
- seed `611119`, checksum `9d83fad4`;
- seed `611113`, checksum `1074ba94`.

## 10. 0.1.63.3 code candidate

Code candidate before this documentation update is **FULL CI GREEN / PACKAGED**:
- HEAD `c8bd64b97df2e9293d8087400e981cc0e309e121`;
- push run `#2262` / `34967807791`;
- artifact `mememe-playtest-0.1.63.3-presentation-release-sync`;
- artifact ID `10395618561`;
- size `8,592,557 bytes`;
- SHA256 `21ae8582ae7de69a3f513ea2180ccb38cfc809300e388066bb084a58ba9984ad`;
- expires 2026-09-29.

Run #2262 passed **63/63 meaningful CI steps**, including:
- build/typecheck;
- replay/lockstep/HOST authority;
- two-tab/multiplayer/CPU stress;
- 0.1.48 stale-token/audio/dice regression;
- 0.1.57 special-location fresh-D6 regression;
- 0.1.62 deterministic sentinels + HOST odd/even routing;
- 0.1.63 UI polish;
- 0.1.63.1/0.1.63.2 camera regressions;
- new 0.1.63.3 movement-before-effect + release-D6 presentation regression;
- package validation and artifact upload.

## 11. Next manual test

Use `docs/PLAYTEST_0.1.63.3_PRESENTATION_RELEASE_SYNC.md` from the artifact.

Ron should specifically verify:
1. on a money/TIN TỨC/LÁ BÀI landing, the token visibly arrives before the destination effect/HUD delta appears;
2. rolls 5/6 remain centered on the moving token;
3. successful Jail release clearly shows the first D6 as release-only;
4. successful release then shows/requires a second fresh D6 before any normal board movement;
5. the release corridor no longer looks like the release face was reused as several normal steps;
6. failed release stays held and ends the turn;
7. keep watching for long-run token snap-back.

Do **not** call 0.1.63.3 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
