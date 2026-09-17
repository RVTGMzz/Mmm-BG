# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

**Do not merge PR #1 or mark it Ready unless Ron explicitly asks.**

## Current milestone

**MVP 0.1.70.1 — Release Flow Repair + UI Density Pass**

Status: **IN DEVELOPMENT / PENDING HUMAN ACCEPTANCE**

Last explicitly user-accepted rollback baseline remains **0.1.48**.

Do not resume 0.1.71 until 0.1.70.1 release flow is manually validated.

Source HEAD before this handoff:
`ab47514ae85a3f4e89431e64dec3b9f0ab48ce9d`

## Runtime problem being fixed

Ron repeatedly reproduced a freeze after a successful Jail/Hospital release:
- successful release face;
- **ĐƯỢC THẢ! / XUẤT VIỆN!** appears;
- game can stall instead of receiving the fresh movement D6.

Historical clue from Ron:
- early builds did not freeze like this;
- later rule changed from effectively moving with the release die to requiring a **new movement D6 after release**.

Treat this as a release-flow regression, not only a modal/tween bug.

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
- UI may delay control visibility until presentation is safe.

Failure:

`release D6 -> fail -> remain held -> end turn normally`

## Current runtime

`src/main.ts` now launches:
- `TurnOrderScene0701 as TurnOrderScene`
- `CareerMinigameBoardScene0701 as ActiveBoardScene`

Presentation chain:

`0701 -> 069 -> 0682 -> 0681 -> 068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## Authoritative release detector

Source:
`src/core/releaseFlow0701.ts`

Function:
`pendingFreshMovementRollAfterRelease0701(match)`

It returns the successful release event seq when:
- turn phase is `PRE_ROLL_ACTION`;
- `lastRoll === null`;
- current actor has no `specialHold`;
- same actor has a successful `special_release` event in current turn.

It intentionally ignores presentation state.

## Exact current CI blocker

PR CI:
- run **#2917**
- id `35286379481`
- source HEAD `ab47514ae85a3f4e89431e64dec3b9f0ab48ce9d`

Build/typecheck PASS.

All gates through **0.1.65.1** PASS, including:
- replay / lockstep / HOST authority;
- bot special-release checks;
- 0.1.57 fresh-D6 special-location authority;
- 0.1.63.3 release/presentation synchronization;
- 0.1.64 sentinel;
- 0.1.65 / 0.1.65.1 UI guards.

Current failure:
`0.1.66 unified flow match length and Mini Game readability`

Regression:
`tests/unified-flow-match-length-066.ts`

Failing assertion:
`pendingFreshRollAfterRelease066(releaseResume, true, 0)`

Expected `1`, actual `undefined`.

Reason:
`src/core/cpuReleaseResume066.ts` still has this historical early return in the general helper:

`if (presentationBlocking) return undefined;`

CPU helper already ignores presentation blocking and delegates to the 0.1.70.1 authoritative detector.

### Immediate next action

Make the compatibility path agree with the 0.1.70.1 authority contract:
- authority reports the owed fresh movement D6 regardless of modal visibility;
- actual human input visibility remains presentation-safe in `DirectDiceBoardScene`;
- do not add another watchdog or second authority path.

Then rerun full CI. Do not weaken the guard merely to make CI green.

## Career Traits retained from 0.1.70

Source:
`src/core/careerTraits070.ts`

Release faces:
- baseline Jail: `1/3/5`
- baseline Hospital: `2/4/6`
- Police Jail: `1/3/4/5`
- Doctor Hospital: `2/4/5/6`
- Thief Jail: `1/5`
- Cascader Hospital: `2/6`

The Job pool remains 12 Jobs.

Keep `specialHoldSourceJobId` authoritative so Thief's restrictive release trait persists after arrest clears the active illegal Job.

## 0.1.70.1 UI work already in source

- rounded/denser Roll For Order via `TurnOrderScene0701`;
- larger order dice/results and less dead lower space;
- denser rounded Mini Game ranking;
- old bottom-center `compactCard` hidden on CPU turns;
- `compactCard` visible only on interactive human turns;
- special-release modal has a bounded feedback window in `CareerMinigameBoardScene0701`.

Permanent UI contract:
`docs/CANONICAL_UI_UX_RULES.md`

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## Publish status

The prior published 0.1.70 hotfix still failed release runtime testing.

**0.1.70.1 is not yet a final published test candidate at this handoff.**

Do not give Ron a new test link until:
1. exact branch HEAD full CI PASS;
2. 0.1.70.1 gate PASS;
3. publisher PASS;
4. public mirror matches exact compiled source;
5. Pages deployment SUCCESS.

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Public URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

## Manual acceptance after publish

Ron must test:
- human Jail success -> fresh D6 -> movement;
- human Hospital success -> fresh D6 -> movement;
- CPU Jail success -> fresh D6 -> movement;
- CPU Hospital success -> fresh D6 -> movement.

Also verify:
- failed release ends turn normally;
- release D6 is never reused;
- Career Trait faces remain correct;
- modal self-closes and never freezes;
- no narration/card text leaks outside modal;
- Roll For Order density/rounding looks balanced;
- Mini Game ranking is readable and not mostly blank;
- bottom-center gray card box is gone on CPU turns.

Only Ron's runtime confirmation may close the release bug.

## Next-session read order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `NEXT_CHAT_PROMPT.md`
4. `src/core/releaseFlow0701.ts`
5. `src/core/cpuReleaseResume066.ts`
6. `tests/unified-flow-match-length-066.ts`
7. `src/scenes/DirectDiceBoardScene.ts`
8. `src/scenes/CareerMinigameBoardScene0701.ts`
9. `src/scenes/TurnOrderScene0701.ts`
10. `src/main.ts`

Then fix the exact 0.1.66 compatibility mismatch, run full CI, publish only after green, and ask Ron to test the four release cases.

**Do not merge PR #1.**
