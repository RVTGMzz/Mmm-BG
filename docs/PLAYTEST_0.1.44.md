# MeMeMe MVP 0.1.44 Playtest Guide

## Focus

0.1.44 keeps result controls blocked until the 0.1.43 podium cascade has completely finished. It changes presentation/input timing only. Gameplay state, B$, winner IDs, ranking, authority, RNG, Mini Game rewards and audio assets are unchanged.

## Final result sequence

1. queued movement/Card/News/reaction presentation clears;
2. any final Mini Game payout commits through host-system authority;
3. `4/4 HOÀN THÀNH → KHÓA BẢNG B$` runs;
4. podium reveals displayed rank `4 → 3 → 2 → 1`;
5. only after the final rank-1 tween plus a small deterministic pad may result controls accept clicks.

A transparent presentation blocker sits above result controls and below the existing 0.1.39 lock overlay. It is removed by `podiumRevealCompleteMs()` and is reset on rematch/shutdown.

## What to test

- Finish a match and click CHƠI LẠI / VỀ LOBBY rapidly during the podium cascade. Nothing should happen until the winner reveal completes.
- After the winner reveal completes, the buttons should work normally.
- Rematch and verify the gate arms again for the new match.
- Observe a tie and confirm tied podium entries still reveal together.
- Confirm exact final B$, winner IDs and competition ranks are unchanged.
- Finish with the final required lap on Mini Game and confirm payout still lands before the result chain.

## Retained invariants

- Every player completes one physical lap before scoring.
- Mini Game payout remains host-system owned and single-commit.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain unchanged.
- Presentation RNG must not perturb gameplay RNG.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.
