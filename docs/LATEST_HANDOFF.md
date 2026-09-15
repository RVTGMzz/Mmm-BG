# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Keep visible names **TIN TỨC / LÁ BÀI**. Never regress HOST authority, deterministic replay, multiplayer ownership, stale-token protection, camera movement-actor lock, or READY/final-result flow.

## Current candidate

**MVP 0.1.64 — Expanded Board + Release Corridor + Audio Rebalance**

Human feedback driving this build:
- board spaces were still too clustered, especially TÙ/J1/J2/J3 and BV/H1/H2/H3;
- requested roughly 2x map spacing and 1.5x round spaces;
- successful Jail/Hospital release should leave the token standing at TÙ/BV, then a fresh movement D6 should traverse the three internal spaces;
- J1/J2/J3 and H1/H2/H3 should all be `-20 B$` landing spaces;
- Card SFX should be 20% softer, Step SFX 30% stronger;
- camera is already confirmed good and must be preserved.

Manual status: **PENDING RON ACCEPTANCE**.

## Runtime

`CareerMinigameBoardScene064 as ActiveBoardScene`

Inheritance:
`064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## Board spacing

Board coordinates are expanded without changing canonical IDs/topology.

Current authored footprint:
- width `2340 px`;
- height `1020 px`.

Round spaces are `1.5x` the 0.1.63 radii.

Automated geometry check measures every round-space pair after scaling and requires at least 12 px clearance. Current minimum is **15.0 px**, so the previous overlapping/chained clusters are no longer allowed by CI.

Overview is reframed at zoom `0.46` for the larger board.

## Jail / Hospital release-in-place

Release D6 remains release-only.

Success now does:
1. clear the hold;
2. keep token standing on `TÙ` node 100 or `BV` node 110;
3. set `lastRoll = null`;
4. remain in the same turn at `PRE_ROLL_ACTION`;
5. require a fresh movement D6;
6. fresh D6 walks the actual internal corridor.

Corridors:
- Jail: `100 -> J1 -> J2 -> J3 -> node 12`;
- Hospital: `110 -> H1 -> H2 -> H3 -> node 34`.

Failed release remains held and ends the turn.

## Internal penalties

The six internal spaces are now real landing money tiles:
- J1/J2/J3 = `-20 B$` each;
- H1/H2/H3 = `-20 B$` each.

Passing over them does not charge. Landing on one resolves the penalty.

Locked deterministic example:
`enter Jail -> release success -> still at TÙ -> fresh D6=1 -> J1 -> then -20 B$`.

Visible money still follows:
`ROLL -> MOVE -> ARRIVE -> EFFECT -> HUD UPDATE`.

## Audio

Runtime gains:
- Card draw/play = `0.80`;
- Step = `1.30`.

The step boost uses WebAudio gain so it is not silently clamped by media-element volume.

## Camera retained and human-confirmed

Ron already confirmed the camera fix is good.

0.1.63.2 behavior remains inherited and regression-locked:
- camera follows the actor still visually moving;
- long rolls remain centered;
- idle camera returns to current player;
- Overview/O remains the exception.

## Job + branch rules retained

0.1.63.4 Job continuation remains:
`roll 5 -> Job at step 2 -> resolve -> continue 3 pips`.

HOST parity routing remains:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT.

No manual picker and no second RNG stream.

## Deterministic QA

0.1.64 intentionally changes route/economy outcomes, so historical 0.1.63.4 sentinels are preserved but no longer active for current gameplay.

32-match batch seeds `611100..611131`:
- turns avg 61.8, p50 60, p90 74, max 92;
- commands avg 97.6, p50 96, p90 114, max 145;
- final table B$ avg 1336.2;
- spread avg 161.6, p50 142, p90 253, max 367;
- movement rolls avg 58.2;
- release rolls avg 7.4;
- Cards avg 9.2;
- News avg 7.4;
- Mini Games avg 6.1;
- Jobs selected avg 3.8;
- Lottery count avg 1.2;
- deterministic harness checksum `2fca6e9d`.

Active exact sentinels:
- seed `611102` -> checksum `1dd42c7c`, 92 turns, 145 commands, finish IDs `[3,2,1,0]`;
- seed `611113` -> checksum `856548f4`, 51 turns, spread 367 B$, finish IDs `[3,0,2,1]`.

## Green code candidate before docs update

- HEAD `5d8f83b8ed3a009679e64bec62321d9743bdfd00`;
- push run `#2340` / `34990342825`;
- artifact `mememe-playtest-0.1.64-expanded-board-release-audio`;
- artifact ID `10405701132`;
- size `8,594,977 bytes`;
- SHA256 `e88e4fe9c4dc7e6976d13896757d89f03665dbba96ebe7ab87f7ecb46070edb8`;
- **65/65 meaningful CI steps PASS**.

## Manual check

Use `docs/PLAYTEST_0.1.64_EXPANDED_BOARD_RELEASE_AUDIO.md`.

Verify especially:
- board feels spacious and enlarged spaces do not touch;
- TÙ/J1/J2/J3 and BV/H1/H2/H3 are clearly separated;
- successful release stays at TÙ/BV until fresh movement D6;
- fresh D6 visibly walks the internal corridor;
- corridor `-20 B$` occurs only on landing/arrival;
- Card SFX is 20% softer and Step SFX 30% stronger;
- confirmed-good camera remains intact;
- Job continuation remains correct.

Do not call 0.1.64 accepted until Ron validates runtime behavior.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
