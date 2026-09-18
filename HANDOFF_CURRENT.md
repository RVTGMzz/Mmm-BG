# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

**Do not merge PR #1 or mark it Ready unless Ron explicitly asks.**

## Current milestone

**MVP 0.1.70.1 — Release Flow Repair + UI Density / Copy Overflow Hardening**

Status: **PUBLIC TEST BUILD DEPLOYED / PENDING FULL HUMAN ACCEPTANCE**

Do not resume 0.1.71 yet.

Ron has explicitly reported that the previous **kẹt/freeze issue is fixed** in runtime. This is meaningful partial acceptance, but it is not yet a full four-case Jail/Hospital Runtime PASS.

Last explicitly accepted rollback baseline remains **0.1.48** until Ron closes 0.1.70.1.

## Canonical release contract

Successful release:

`release-check D6 -> success -> clear hold -> same turn PRE_ROLL_ACTION + lastRoll=null -> NEW movement D6 -> move -> resolve landing`

Failure:

`release-check D6 -> fail -> remain held -> end turn normally`

Requirements:
- release D6 is never reused as movement;
- successful release stays in the same turn;
- authority owes exactly one fresh movement D6;
- presentation cannot erase/veto that obligation;
- human input still waits for presentation-safe control;
- CPU and human share the same authoritative state transition.

Authority:
- `src/core/releaseFlow0701.ts`
- `src/core/cpuReleaseResume066.ts`
- human presentation safety remains in `src/scenes/DirectDiceBoardScene.ts`

## Latest 0.1.70.1 UI feedback hardening

Ron runtime feedback after the release-flow repair:
1. Job result was losing readable text instead of expanding.
2. Card/News copy could still escape the modal.
3. ACTOR / TARGET was too technical.
4. Short text could still appear outside its owner.
5. Legacy background/footer copy was visible under the board.
6. Visible wording should use **người chơi khác**, not **đối thủ**.
7. Positive report: the previous stuck/freeze bug was fixed.

Implemented:
- Job result no longer hides body copy containing `trúng`;
- Job result uses multi-line owned content area instead of `maxLines(1)`;
- canonical Card/News modal guard no longer trusts arbitrary high-depth containers;
- only canonical modal content, real reaction bubbles and continue hint may coexist;
- ACTOR/TARGET chips removed from active cinematic UI;
- targeted money Card action renders natural copy such as `Player A đưa 10 B$ cho Player B`;
- stale `SPACE roll • C cards...` world footer is hidden;
- shared `friendlyVisibleCopy0701` policy maps opponent/technical target wording to natural Vietnamese;
- Card Hand, Tactical Choice, Card Overlay, News Overlay and presentation model share the same visible-copy policy;
- old Card/News overlay truncation paths were removed/hardened;
- visible dev copy such as `deterministic / host / resolve / Card overlay` was removed from those player-facing surfaces;
- dead `addPlayerChip()` ACTOR/TARGET API was removed to prevent regression.

Regression sentinel:
- `tests/ui-copy-overflow-0701.ts`
- npm: `test:ui-copy-overflow-0701`
- CI step: **0.1.70.1 readable modal copy and overflow regression**

## Runtime source / validation

Latest runtime source commit:
`8c367837ab4400ed492462fe5c1f12cc35c0fe7d`

Exact-source validation:
- push CI **#2940** / id `35301210770`: **SUCCESS**
- PR CI **#2941** / id `35301213879`: **SUCCESS**
- source Steam Deck web build **#273** / id `35301210772`: **SUCCESS**
- publisher **#229** / id `35301210778`: **SUCCESS**
- exact-SHA guard: PASS
- current-branch-HEAD guard: PASS
- 0.1.66 unified-flow gate: PASS
- 0.1.68.2 modal ownership gate: PASS
- 0.1.69 first-impression gate: PASS
- 0.1.70.1 release-flow gate: PASS
- new UI copy/overflow regression gate: PASS
- package validation: PASS

## Public mirror / Pages

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Compiled mirror commit:
`e7b40a6caf2b874a4031f54d8a58cd065f8178a4`

Mirror message:
`Publish compiled MeMeMe web playtest 8c36783`

Public Pages:
- run **#34**
- id `35301305057`
- build/deploy **SUCCESS**

Test URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

## Human runtime status

Known from Ron:
- previous freeze/stuck symptom: **FIXED**
- latest UI feedback has been patched and redeployed.

Still do **not** call full Runtime PASS until Ron confirms the remaining release matrix sufficiently:
- Human Jail success -> fresh D6 -> movement
- Human Hospital success -> fresh D6 -> movement
- CPU Jail success -> fresh D6 -> movement
- CPU Hospital success -> fresh D6 -> movement

Also verify latest UI visually:
- Job result keeps all useful text readable;
- Card/News text stays inside its owner;
- no ACTOR/TARGET technical chips;
- money transfer copy is natural;
- no stale footer/background text;
- visible copy says `người chơi khác`, not `đối thủ`.

## Retained authority / UI contracts

Active runtime:
- `TurnOrderScene0701 as TurnOrderScene`
- `CareerMinigameBoardScene0701 as ActiveBoardScene`

Career release faces remain:
- baseline Jail: `1/3/5`
- baseline Hospital: `2/4/6`
- Police Jail: `1/3/4/5`
- Doctor Hospital: `2/4/5/6`
- Thief Jail: `1/5`
- Cascader Hospital: `2/6`

Keep `specialHoldSourceJobId` authoritative.
Keep visible vocabulary **TIN TỨC / LÁ BÀI**.
Permanent UI contract: `docs/CANONICAL_UI_UX_RULES.md`.

## Next-session read order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `NEXT_CHAT_PROMPT.md`
4. Ron's newest runtime feedback
5. `src/ui/friendlyVisibleCopy0701.ts`
6. `tests/ui-copy-overflow-0701.ts`
7. `src/scenes/CareerMinigameBoardScene069.ts`
8. `src/scenes/CareerMinigameBoardScene0682.ts`
9. `src/core/releaseFlow0701.ts`
10. `src/scenes/DirectDiceBoardScene.ts`

If Ron finds another UI/runtime failure, continue hardening 0.1.70.1.
Do not start 0.1.71 until Ron explicitly accepts the release candidate.

**Do not merge PR #1.**
