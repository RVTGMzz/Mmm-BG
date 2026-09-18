# MeMeMe MVP 0.1.39 Playtest Guide

## Primary target: final result clarity

Play until the last unfinished player completes the required first lap.

Expected sequence:

1. Any final movement / Card / News / reaction / Mini Game presentation finishes first.
2. If the last landing is a Mini Game, its authoritative B$ payout commits first.
3. The final result transition appears: `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG`.
4. Result buttons cannot be clicked while the short transition is covering the result.
5. The transition fades out and the normal authoritative ranking/result overlay fades in.
6. Victory SFX plays once for the real result, not repeatedly.

## Important negative checks

- The transition must NOT appear at 3/4 completed laps.
- It must NOT appear while a presentation queue is still blocking.
- It must NOT change any B$ amount.
- It must NOT change winner/ranking order.
- It must NOT replay after snapshot/resync.
- It must reset correctly after rematch and be allowed to appear once for the next finished match.

## Retained checks

- Choice SFX still plays on Route/Card/Target/Tactical/Setup/Settings confirmations.
- Dice still uses the dedicated dice SFX.
- Mini Game B$ changes exactly once.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains `03_City_Silly.ogg` and returns to the previous track afterward.
- P1 must not snap backward after movement + Card/News.
- Human Job Hub token must stay on the correct authoritative node.
- Local Lobby and Setup should show build `0.1.39` and no obsolete `demo 3 vòng` instruction.

Do not infer or add jail skipped-turn, bail, or escape mechanics in this build.
