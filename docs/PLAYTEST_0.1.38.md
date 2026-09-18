# MeMeMe MVP 0.1.38 Playtest Guide

## Primary target: Choice SFX coverage

Confirm the supplied choice cue plays once when you intentionally confirm these actions:

1. Local Lobby mode / Host / Join buttons.
2. Setup → `ROLL FOR ORDER`.
3. `VÀO TRẬN` after Roll For Order.
4. Job Dice confirmation.
5. Route / Branch selection.
6. Card selection or `GIỮ LẠI`.
7. Target selection.
8. Tactical Choice / Kèo Hai Cửa selection or `QUAY LẠI`.
9. Human Mini Game SẤP/NGỬA and BÚA/BAO/KÉO selection.
10. Settings open/close and BGM toggle.

Normal dice rolls must still use the dedicated dice cue rather than the choice cue.

## Visible rule copy

Check Local Lobby and Setup before the match:

- build label should read `0.1.38`;
- there must be no visible `demo 3 vòng` instruction;
- the game should communicate the current rule that all players complete at least one lap before final B$ scoring.

## Retained high-priority regression

- P1 must not snap backward after movement + Card/News/state packets.
- Job Hub must not leave the human token visually one node behind.
- Mini Game payout must update wallet exactly once.
- Nhiều ra ít bị pays `30 / 20 / 10 / 0 B$`.
- Direct RPS pays `25 / 15 / 5 / 0 B$`.
- Mini Game BGM must be `03_City_Silly.ogg` and return to previous BGM afterward.
- Result screen must wait for a pending final Mini Game payout.
- Victory SFX must play only when the real final result overlay appears.
- Snapshot/resync must not replay stale movement/presentation.

## Audio smoke test

Retain all eight supplied event SFX:

- victory
- news
- card
- step
- money loss
- money gain
- dice
- choice

Do not re-encode or substitute the four approved BGM files.

Do not infer or add jail skipped-turn, bail, or escape mechanics in this build.
