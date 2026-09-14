# MVP 0.1.40 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.40 is presentation/runtime copy cleanup only. It does not change gameplay RNG, match-end rules, money, Mini Game rewards, Job rules, movement, authority, replay, snapshots, or approved BGM/SFX assets.

## Lap-native inherited shell guard

New runtime scene: `src/scenes/CareerMinigameBoardScene040.ts`.

The old `DemoBoardScene` shell still serializes `rounds` / `turnLimit` for compatibility with old shell/network structures, but these values no longer control the end condition. 0.1.40 prevents those compatibility fields from leaking back into visible runtime rules.

The new wrapper normalizes:

- inherited center HUD `Vòng x/y` → authoritative `🏁 x/4 ĐỦ VÒNG` progress;
- inherited phase/debug line → lap progress + checksum;
- old static `MATCH SHELL • 3 VÒNG` copy;
- old helper `demo 3 vòng` copy;
- waiting shell text that described 3 rounds / 12 turns;
- result-shell text that described ending after N rounds;
- shell logs such as `Demo bắt đầu • 3 vòng • 12 lượt`;
- old `Demo match đã kết thúc` wording.

The wrapper derives visible progress from `demoMatchLapProgress(match)` only.

## Compatibility policy

`rounds` and `turnLimit` are deliberately **not removed** from serialized shell state in this patch. They remain compatibility/debug metadata only. The authoritative end rule remains:

1. every player physically completes at least one lap;
2. a pending final Mini Game payout must resolve;
3. only then may the B$ table finalize.

## Entry screens

Local Lobby and Setup advance to 0.1.40 and explicitly describe lap-native runtime copy.

## Retained behavior

- 0.1.39 final B$ lock transition remains presentation-only.
- 0.1.38 choice SFX coverage remains intact.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị pays `30 / 20 / 10 / 0 B$`.
- Direct RPS pays `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files remain untouched and must not be re-encoded/substituted.
- Eight supplied SFX remain unchanged.
- P1 movement/Job token fixes remain unchanged.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Regression

New `tests/legacy-shell-copy-040.ts` checks that:

- visible progress derives from `demoMatchLapProgress`;
- HUD, shell overlay and shell log paths are all wrapped;
- the wrapper submits no gameplay/system intents;
- the wrapper adds no randomness;
- `src/main.ts` runs the 0.1.40 scene;
- Lobby and Setup identify 0.1.40;
- entry screens do not reintroduce `demo 3 vòng`.

Final artifact metadata will be added only after full CI/package validation is green.
