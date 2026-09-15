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

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, camera movement-actor lock, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.64

**0.1.64 — Expanded Board + Release Corridor + Audio Rebalance**

Latest human feedback after 0.1.63.4:
1. round spaces were still visually clustered, especially `TÙ/J1/J2/J3` and `BV/H1/H2/H3`; Ron requested roughly 2x map spacing and 1.5x round spaces;
2. successful Jail/Hospital release should leave the token standing at the hold location, then a fresh movement D6 should start movement through the three internal penalty spaces;
3. `J1/J2/J3` and `H1/H2/H3` should all be negative-money spaces;
4. Card SFX should be 20% softer and movement-step SFX 30% stronger;
5. camera behavior from 0.1.63.2+ is already human-confirmed good and must remain untouched unless new evidence appears.

Manual status: **PENDING RON ACCEPTANCE**.

## 3. Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene064 as ActiveBoardScene`

Inheritance:
`064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

## 4. Expanded board / tile spacing

Authoritative board data remains `src/content/city/board_city_mvp.json` with the same canonical board id, node ids, edges, branch identities and one-lap topology.

0.1.64 changes authored coordinates so the board footprint is now approximately:
- width **2340 px**;
- height **1020 px**.

Round-space presentation is enlarged **1.5x** from the 0.1.63 radii:
- normal: `27 -> 40.5`;
- feature: `31 -> 46.5`;
- anchor: `33 -> 49.5`;
- Jail/Hospital hold: `36 -> 54`.

The 0.1.64 geometry regression measures every pair of round spaces after this scale and requires at least **12 px** clear edge-to-edge separation. Current minimum is **15.0 px**.

The special clusters are explicitly spread apart:
- `TÙ / J1 / J2 / J3`;
- `BV / H1 / H2 / H3`.

Overview is reframed for the larger world at zoom `0.46`. Close gameplay keeps the inherited camera behavior rather than changing camera authority/follow logic.

Implementation:
- `src/content/city/board_city_mvp.json`
- `src/scenes/CareerMinigameBoardScene064.ts`
- `tests/expanded-board-release-audio-064.ts`

## 5. Jail/Hospital release-in-place rule

0.1.64 intentionally supersedes the 0.1.57–0.1.63 automatic release-corridor traversal.

Release/recovery D6 remains a release check only.

Failure:
- player remains held;
- turn ends.

Success:
1. clear `specialHold`;
2. token **stays on the current hold node** (`TÙ` node 100 or `BV` node 110);
3. discard the release D6 with `turn.lastRoll = null`;
4. return to `PRE_ROLL_ACTION` in the **same turn**;
5. require a **fresh movement D6**;
6. the new movement D6 walks the actual corridor edges.

Authoritative fresh-movement corridors:
- Jail: `100 -> J1(101) -> J2(102) -> J3(103) -> 12`;
- Hospital: `110 -> H1(111) -> H2(112) -> H3(113) -> 34`.

Core helpers:
- `specialReleasePath057()` now returns no automatic release movement;
- `specialCorridorPath064()` exposes the real fresh-D6 corridor.

Locked regression example uses deterministic faces `1,1,1`:
- first `1`: enter Jail;
- next-turn release `1`: succeeds, hold clears, token remains at TÙ, money remains 200 B$;
- fresh movement `1`: token moves to J1;
- only on landing J1 does money become 180 B$.

## 6. Six internal penalty spaces

The corridor nodes are now real money spaces:
- `J1 = -20 B$`;
- `J2 = -20 B$`;
- `J3 = -20 B$`;
- `H1 = -20 B$`;
- `H2 = -20 B$`;
- `H3 = -20 B$`.

They use normal landing semantics. Passing over a corridor space does not charge it; landing on it resolves the `-20 B$` effect.

0.1.63.4 visible-wallet synchronization remains inherited, so the player-visible order is still:

`ROLL -> MOVE -> ARRIVE -> EFFECT -> HUD B$ UPDATE`.

0.1.64 restores visible step animation through these corridors for the fresh movement D6, even though 0.1.63.3 historically collapsed the old automatic release path.

## 7. Audio rebalance

Runtime gain in `src/audio/sfxController.ts`:
- `card_draw = 0.80`;
- `card_play = 0.80`;
- `step = 1.30`.

Card audio is therefore 20% softer than the previous mix. Step audio is 30% stronger. The SFX source files themselves are unchanged.

Because `HTMLMediaElement.volume` caps at `1.0`, the >1.0 step gain is routed through a WebAudio `GainNode` so `1.30` is real rather than silently clamped.

## 8. Camera status — human confirmed good

Ron explicitly confirmed the camera fix is good before 0.1.64.

Retain 0.1.63.2 behavior unchanged:
- active presentation actor has priority over already-advanced authoritative turn state;
- rolls 5/6 remain centered on the moving token;
- idle camera returns to current turn player;
- `TỔNG QUAN / O` remains the intentional exception;
- expanded edge handling remains inherited.

The 0.1.64 regression explicitly requires the 0.1.63.2 camera resolver and exact-center behavior to remain present.

## 9. Other retained gameplay

0.1.63.4 Job mid-roll continuation remains:
`roll 5 -> Job on step 2 -> resolve Job -> continue remaining 3 pips`.

Branch rule remains HOST-authoritative:
- `1 / 3 / 5` -> **TRÁI**;
- `2 / 4 / 6` -> **PHẢI**.

No live manual branch picker and no second RNG stream.

Retained without value changes:
- main Draft D economy outside the six new corridor penalties;
- TIN TỨC/LÁ BÀI content values;
- Job definitions;
- Mini Game payout ownership/tables;
- Lottery x20;
- READY finish lock;
- finished-player B$ immunity;
- final result/podium chain.

## 10. Deterministic baseline after intentional 0.1.64 gameplay change

Release-in-place plus real corridor movement intentionally changes deterministic routes, command counts and economy outcomes. Historical sentinel files remain preserved:
- `tests/outlier-replay-062.ts`;
- `tests/outlier-replay-0634.ts`.

The active sentinel is now `tests/outlier-replay-064.ts`.

32-match deterministic batch, seeds `611100..611131`:
- turns avg **61.8**, min 46, p50 60, p90 74, max **92**;
- commands avg **97.6**, min 74, p50 96, p90 114, max **145**;
- final table B$ avg **1336.2**, min 930, p50 1346, p90 1565, max 1810;
- final spread avg **161.6**, min 48, p50 142, p90 253, max **367**;
- movement rolls avg **58.2**;
- release rolls avg **7.4**;
- Cards avg **9.2**;
- News avg **7.4**;
- Mini Games avg **6.1**;
- Mini payout avg **277.3 B$**;
- Jobs selected avg **3.8**;
- Lottery count avg **1.2**;
- Lottery payout avg **84.4 B$**;
- deterministic harness checksum **`2fca6e9d`**;
- max-turn seed `611102`;
- max-spread seed `611113`.

Active exact sentinel `611102`:
- checksum `1dd42c7c`;
- 92 turns;
- 145 authoritative commands / 128 submitted / 17 HOST auto;
- final table 1565 B$, spread 137;
- movement 76, release 22, Cards 14, News 8;
- Mini Games 12, payout 565 B$;
- Jobs 4;
- Lottery 1 / 40 B$;
- finish IDs `[3,2,1,0]`;
- per-seat final B$ `[375,333,470,387]`;
- finish places `[4,3,2,1]`.

Active exact sentinel `611113`:
- checksum `856548f4`;
- 51 turns;
- 79 authoritative commands / 67 submitted / 12 HOST auto;
- final table 1112 B$, spread 367;
- movement 50, release 3, Cards 9, News 7;
- Mini Games 2, payout 100 B$;
- Jobs 3;
- Lottery 2 / 140 B$;
- finish IDs `[3,0,2,1]`;
- per-seat final B$ `[264,457,301,90]`;
- finish places `[2,4,3,1]`.

These are regression sentinels, not balance targets.

## 11. 0.1.64 green code candidate

Original 0.1.64 candidate before the Card-target UI hotfix:
- HEAD `5d8f83b8ed3a009679e64bec62321d9743bdfd00`;
- push run `#2340` / `34990342825`;
- artifact `mememe-playtest-0.1.64-expanded-board-release-audio`;
- artifact ID `10405701132`;
- size `8,594,977 bytes`;
- SHA256 `e88e4fe9c4dc7e6976d13896757d89f03665dbba96ebe7ab87f7ecb46070edb8`;
- expires 2026-09-29.

## 12. Card target picker direct-dice hotfix

Ron reported that while choosing another player as the target of a Card, the large direct dice appeared behind the target modal.

Root cause:
- Card UI correctly kept `cardPickerOpen = true` throughout hand/target/tactical selection;
- direct-dice visibility only looked at turn phase/control/CPU/shell state;
- because the turn was still `PRE_ROLL_ACTION`, the dice could reappear behind the modal.

Fix:
- `src/ui/directDicePolicy.ts` accepts `cardPickerOpen` and hard-blocks direct dice while true;
- `src/scenes/DirectDiceBoardScene.ts` passes the flag into both visual sync and pointerdown validation;
- therefore the dice is hidden and non-clickable throughout Card hand picker, target picker and tactical-choice picker;
- after Card UI closes, dice only returns if the ordinary roll policy still allows it;
- no gameplay authority, RNG, Card effect, camera, board, economy or movement rule changes.

Regression:
- `tests/direct-dice-030.ts` now explicitly requires `PRE_ROLL_ACTION + cardPickerOpen=true -> false`.

Hotfix code candidate before this documentation update is **FULL CI GREEN / PACKAGED**:
- HEAD `13ea3d8638ca43da399bab93ef7aa54a007002eb`;
- push run `#2350` / `34992716873`;
- artifact `mememe-playtest-0.1.64-expanded-board-release-audio`;
- artifact ID `10405984035`;
- size `8,594,993 bytes`;
- SHA256 `b72a2cf064ec13c222441bd83ded3fb1b87e8f36b79b17379d4f017a046b57b5`;
- full suite **65/65 PASS**.

## 13. Next manual test

Use `docs/PLAYTEST_0.1.64_EXPANDED_BOARD_RELEASE_AUDIO.md` from the newest artifact.

Ron should verify especially:
1. open a Card that targets another player: **the direct dice must not appear anywhere behind the target modal**;
2. cancel or finish Card selection: the dice returns only if the player is genuinely roll-eligible;
3. whole board feels roughly twice as spread out and the 1.5x spaces no longer bunch together;
4. visually inspect TÙ/J1/J2/J3 and BV/H1/H2/H3;
5. successful release leaves the token standing at TÙ/BV until the fresh movement D6 is rolled;
6. fresh movement visibly walks through J/H corridor spaces;
7. landing on J1/J2/J3/H1/H2/H3 applies `-20 B$` only after visual arrival;
8. Card SFX is softer and step SFX stronger at comfortable levels;
9. confirmed-good camera remains centered during long rolls;
10. Job continuation remains correct;
11. continue watching for long-run token snap-back.

Do **not** call 0.1.64 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
