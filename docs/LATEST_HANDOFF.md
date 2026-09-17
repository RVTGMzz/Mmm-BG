# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 Draft/Open. **Do not merge unless Ron explicitly asks.**

## Current milestone

**MVP 0.1.70.1 — Release Flow Repair + UI Density Pass**

Status: **IN DEVELOPMENT / PENDING HUMAN ACCEPTANCE**

0.1.71 is parked until the Jail/Hospital release freeze is manually fixed.

## Canonical release rule

A successful Jail/Hospital release roll is only an escape check:

`release D6 -> success -> clear hold -> same turn PRE_ROLL_ACTION + lastRoll=null -> NEW movement D6 -> move`

Never reuse the release face as movement steps.

Authoritative detector:
`src/core/releaseFlow0701.ts`
`pendingFreshMovementRollAfterRelease0701(...)`

Presentation may delay controls but must not erase/veto the owed roll.

## Runtime

Active board:
`CareerMinigameBoardScene0701 as ActiveBoardScene`

Active Roll For Order:
`TurnOrderScene0701 as TurnOrderScene`

Main chain:
`0701 -> 069 -> 0682 -> ... -> 057 -> 0561 -> 056 -> 048`

0.1.70 Career Traits remain authoritative:
- Jail baseline `1/3/5`
- Hospital baseline `2/4/6`
- Police Jail `1/3/4/5`
- Doctor Hospital `2/4/5/6`
- Thief Jail `1/5`
- Cascader Hospital `2/6`

Keep `specialHoldSourceJobId`.

## Current exact blocker

Source HEAD before handoff-doc commit:
`ab47514ae85a3f4e89431e64dec3b9f0ab48ce9d`

PR CI:
- run **#2917**
- id `35286379481`

Build/typecheck PASS.
All gates through **0.1.65.1** PASS.

Current failure:
`0.1.66 unified flow match length and Mini Game readability`

Regression:
`tests/unified-flow-match-length-066.ts`

Failing assertion:
`pendingFreshRollAfterRelease066(releaseResume, true, 0)`

Expected `1`, actual `undefined`.

Reason:
`src/core/cpuReleaseResume066.ts` still contains:
`if (presentationBlocking) return undefined;`

in the historical general helper.

CPU helper already ignores presentation blocking and delegates to 0.1.70.1 authority.

Immediate next step:
- make compatibility detection presentation-independent;
- keep actual human control visibility presentation-safe in `DirectDiceBoardScene`;
- do not add another watchdog or authority path;
- rerun full CI.

## UI work already present

0.1.70.1 includes:
- rounded/denser Roll For Order;
- larger/readable order dice/results;
- denser rounded Mini Game ranking;
- old bottom-center `compactCard` hidden on CPU turns;
- `compactCard` visible only for interactive human turns;
- bounded special-release feedback modal.

Permanent UI contract:
`docs/CANONICAL_UI_UX_RULES.md`

## Publish status

**Do not publish a final 0.1.70.1 test link yet.**

Required:
1. exact HEAD full CI PASS;
2. 0.1.70.1 gate PASS;
3. publisher PASS;
4. public mirror exact compiled source;
5. Pages SUCCESS.

Then Ron manually tests:
- human Jail;
- human Hospital;
- CPU Jail;
- CPU Hospital;

all with successful release followed by a **fresh movement D6**.

Last explicitly accepted rollback baseline remains **0.1.48**.
Visible vocabulary stays **TIN TỨC / LÁ BÀI**.

Full details: `HANDOFF_CURRENT.md`.

**Do not merge PR #1.**
