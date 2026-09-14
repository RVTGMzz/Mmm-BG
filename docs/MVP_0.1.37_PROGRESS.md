# MVP 0.1.37 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.37 is a networking/correctness cleanup on top of the completed 0.1.36 Event Audio + Mini Game payout build.

No board rule, reward amount, RNG rule, Job rule, lap rule or audio asset is changed.

## Mini Game payout ownership

0.1.36 already had the correct authoritative payout path inside `MiniGameOverlay`:

1. overlay produces deterministic `gameType` + complete ranking;
2. host presentation calls `TwoTabHostSession.submitSystemIntent('resolve_minigame', ...)`;
3. host validates source event/ranking;
4. replay applies reward table exactly once;
5. B$ updates enter checksum/state/snapshot normally.

However, `CareerMinigameBoardScene` also retained an older completion callback that attempted a second `resolve_minigame` through the normal player/seat intent path.

`TwoTabHostSession` correctly rejects that path because Mini Game resolution is host-system owned, so money was protected from double payout. The redundant submission still created unnecessary rejected receipts and muddied the ownership model.

### 0.1.37 fix

New runtime scene wrapper: `src/scenes/CareerMinigameBoardScene037.ts`.

It preserves every normal player intent but suppresses only the obsolete scene-level `resolve_minigame` player intent. The authoritative host-system submission in `MiniGameOverlay` remains untouched.

Expected result:

- one Mini Game source event;
- one accepted host-system resolution command;
- no redundant seat/player resolution submission;
- no double reward;
- normal two-tab state broadcast still carries the authoritative B$ result to clients.

## Regression test

New test: `tests/minigame-authority-037.ts`.

It locks three invariants:

- `submitLocalIntent('resolve_minigame')` is rejected;
- `submitSystemIntent('resolve_minigame')` applies the configured payout exactly once;
- repeating the same source event is rejected and cannot change B$ again.

## Retained 0.1.36 rules

- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct RPS payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM: approved `03_City_Silly.ogg`.
- Eight event SFX retained.
- Four approved BGM files remain checksum-locked and are not re-encoded/substituted.
- Match scoring still waits until all players complete one physical lap and any pending Mini Game payout is committed.
- Token movement/state sync fixes remain unchanged.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

Final artifact metadata will be added after full 0.1.37 CI/package validation is green.
