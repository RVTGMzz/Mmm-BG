# MVP 0.1.37 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

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

Result:

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

The test is now part of CI as `npm run test:minigame-authority`.

## Retained 0.1.36 rules

- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct RPS payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM: approved `03_City_Silly.ogg`.
- Eight event SFX retained.
- Four approved BGM files remain checksum-locked and are not re-encoded/substituted.
- Match scoring still waits until all players complete one physical lap and any pending Mini Game payout is committed.
- Token movement/state sync fixes remain unchanged.
- Jail deep mechanics remain undefined.
- CPU remains a QA bot.
- PR #1 remains unmerged.

## Validated artifact

GitHub Actions run: `34798951707` / run `#1073`

Validated runtime SHA:
`be7dc3246a4ded76f3913cca5d61b9ee3f2f4acb`

Artifact:
`mememe-playtest-0.1.37`

Artifact ID:
`10330458664`

Size:
`8,558,316 bytes`

Digest:
`sha256:da51a8277f3280ecc32954dabf0a1739327226874b2a181484cc864d5b5dd712`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34798951707`

Full CI passed through build/typecheck, deterministic replay, lockstep, host/client resync, authority, two-tab core, demo shell/rematch, CPU autoplay, presentation/flow/board checks, Settings/audio, economy/tactical/function tile/direct dice/Job-MiniGame tests, the new Mini Game host-system ownership regression, package validation, guide copy and artifact upload.
