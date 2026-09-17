# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 Draft/Open. **Do not merge unless Ron explicitly asks.**

## Current milestone

**MVP 0.1.70.1 — Release Flow Repair + UI Density Pass**

Status: **RELEASE CANDIDATE PUBLISHED / PENDING HUMAN ACCEPTANCE**

0.1.71 remains parked until Ron validates the Jail/Hospital release flow.

## Release contract

Successful release:

`release-check D6 -> success -> clear hold -> same turn PRE_ROLL_ACTION + lastRoll=null -> NEW movement D6 -> move`

Never reuse the release face as movement.

Authority:
`src/core/releaseFlow0701.ts`
`pendingFreshMovementRollAfterRelease0701(...)`

Presentation may hide/delay human controls but must not erase the owed roll.

## Blocker resolved

`src/core/cpuReleaseResume066.ts`

The historical general helper no longer returns early when `presentationBlocking` is true. It now agrees with the 0.1.70.1 authority contract.

Human input safety is still owned by `DirectDiceBoardScene` / `shouldShowDirectTurnDice(...)`, which continues to honor `presentationBlocking`.

Runtime-affecting fix commit:
`f07ad68298bb6737e92a73dcb9a9f075160229c6`

## CI / publish

For `f07ad682...`:
- push CI #2924 / `35287713667`: **SUCCESS**
- PR CI #2925 / `35287716025`: **SUCCESS**
- 0.1.66 gate: **PASS**
- 0.1.70.1 gate: **PASS**
- package validation: **PASS**
- publisher #221 / `35287713683`: **SUCCESS**

Publisher rebuilt the exact source and reported the public mirror already matched the compiled build.

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Current mirror commit:
`5299576ee1c1555d1ec6cd6775aa3b224b831347`

Public Pages run #32 / `35261101327`:
- build **SUCCESS**
- deploy **SUCCESS**

Test URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

## Manual acceptance required

Do **not** call Runtime PASS until Ron tests:
- Human Jail success -> fresh D6 -> movement
- Human Hospital success -> fresh D6 -> movement
- CPU Jail success -> fresh D6 -> movement
- CPU Hospital success -> fresh D6 -> movement

Also keep an eye on failed-release turn ending, Career Trait faces, modal auto-close, Mini Game ranking density, Roll For Order layout, and CPU compact-card cleanup.

Last explicitly accepted rollback baseline remains **0.1.48**.
Visible vocabulary stays **TIN TỨC / LÁ BÀI**.

Full details: `HANDOFF_CURRENT.md`.

**Do not merge PR #1.**
