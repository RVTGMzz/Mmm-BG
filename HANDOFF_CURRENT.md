# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

**Do not merge PR #1 or mark it Ready unless Ron explicitly asks.**

## Current milestone

**MVP 0.1.70.1 — Release Flow Repair + UI Density Pass**

Status: **RELEASE CANDIDATE PUBLISHED / PENDING HUMAN ACCEPTANCE**

Last explicitly user-accepted rollback baseline remains **0.1.48**.

Do not resume 0.1.71 until Ron manually validates the 0.1.70.1 release flow.

## Canonical release contract

The release-check D6 and movement D6 are separate rolls.

Success:

`release D6 -> success -> consume release roll -> clear hold -> same turn PRE_ROLL_ACTION + lastRoll=null -> NEW movement D6 -> move -> resolve landing`

Requirements:
- never reuse release face as movement steps;
- successful release stays in the same turn;
- player remains on hold node immediately after success;
- authority owes exactly one fresh movement D6;
- modal/presentation must never own or veto that obligation;
- human and CPU share the same authoritative transition;
- UI may delay human control visibility until presentation is safe.

Failure:

`release D6 -> fail -> remain held -> end turn normally`

## 0.1.70.1 authority fix

Authoritative detector:
`src/core/releaseFlow0701.ts`
`pendingFreshMovementRollAfterRelease0701(match)`

Compatibility wrapper:
`src/core/cpuReleaseResume066.ts`

Resolved blocker:
- removed the historical authority-level `presentationBlocking` veto from `pendingFreshRollAfterRelease066(...)`;
- compatibility detection now reports the owed fresh movement D6 even while presentation is blocking;
- CPU path remains presentation-independent;
- human control remains presentation-safe in `src/scenes/DirectDiceBoardScene.ts` through `shouldShowDirectTurnDice(... presentationBlocking ...)`;
- no new watchdog or second authority source was added.

Last runtime-affecting source commit:
`f07ad68298bb6737e92a73dcb9a9f075160229c6`

## Validation

Exact-source CI for `f07ad682...`:
- push CI **#2924** / id `35287713667`: **SUCCESS**
- PR CI **#2925** / id `35287716025`: **SUCCESS**

Confirmed PASS in the full chain:
- build/typecheck;
- replay / lockstep / HOST authority;
- all prior release-flow sentinels;
- **0.1.66 unified flow match length and Mini Game readability**;
- **0.1.70.1 release flow repair + UI density**;
- package validation.

Publisher:
- **Publish compiled web mirror #221**
- id `35287713683`
- **SUCCESS**
- exact-SHA CI guard PASS;
- current-branch-HEAD guard PASS;
- exact private source build PASS.

The publisher reported:
`Public compiled mirror already matches this build.`

That is expected. From the currently deployed source checkpoint `2b88563763f326834f7950364a1c3dc2df1eb9ea` to `f07ad682...`, only handoff/test files and the historical compatibility helper changed. The runtime bundle is byte-equivalent, so the mirror correctly required no new commit.

## Public mirror / Pages

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Current compiled mirror commit:
`5299576ee1c1555d1ec6cd6775aa3b224b831347`

Mirror commit message:
`Publish compiled MeMeMe web playtest 2b88563`

Because publisher #221 rebuilt `f07ad682...` and found no diff, this mirror is the exact compiled web output for the validated candidate.

Public Pages:
- workflow **Deploy MeMeMe Web Playtest to GitHub Pages #32**
- run id `35261101327`
- build **SUCCESS**
- deploy **SUCCESS**

Public test URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

## Runtime status

**Do not call Runtime PASS yet.**

Ron must manually validate:
- Human Jail success -> fresh D6 -> movement
- Human Hospital success -> fresh D6 -> movement
- CPU Jail success -> fresh D6 -> movement
- CPU Hospital success -> fresh D6 -> movement

Also verify:
- failed release ends turn normally;
- release D6 is never reused as movement;
- Career Trait release faces remain correct;
- modal self-closes and never freezes;
- no narration/card text leaks outside modal;
- Roll For Order density/rounding looks balanced;
- Mini Game ranking is readable and not mostly blank;
- bottom-center gray card box is gone on CPU turns.

Only Ron's runtime confirmation may close the release bug.

## Runtime / presentation retained

Active runtime:
- `TurnOrderScene0701 as TurnOrderScene`
- `CareerMinigameBoardScene0701 as ActiveBoardScene`

0.1.70 Career Traits remain authoritative:
- baseline Jail: `1/3/5`
- baseline Hospital: `2/4/6`
- Police Jail: `1/3/4/5`
- Doctor Hospital: `2/4/5/6`
- Thief Jail: `1/5`
- Cascader Hospital: `2/6`

Keep `specialHoldSourceJobId` authoritative.

0.1.70.1 UI work retained:
- rounded/denser Roll For Order;
- larger order dice/results and less dead lower space;
- denser rounded Mini Game ranking;
- old bottom-center `compactCard` hidden on CPU turns;
- `compactCard` visible only on interactive human turns;
- bounded special-release feedback modal.

Permanent UI contract:
`docs/CANONICAL_UI_UX_RULES.md`

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## Next-session read order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `NEXT_CHAT_PROMPT.md`
4. Ron's newest runtime feedback
5. `src/core/releaseFlow0701.ts`
6. `src/core/cpuReleaseResume066.ts`
7. `src/scenes/DirectDiceBoardScene.ts`
8. `src/scenes/CareerMinigameBoardScene0701.ts`

If Ron reports a failure, treat his runtime result as authority and debug 0.1.70.1 without starting 0.1.71.
If Ron reports all four release cases PASS, record human acceptance before considering any later milestone.

**Do not merge PR #1.**
