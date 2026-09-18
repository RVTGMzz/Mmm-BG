# MeMeMe MVP 0.1.43 Playtest Guide

## Focus

0.1.43 adds a deterministic final-podium reveal cadence only. Gameplay state, B$, winner IDs, ranking source, authority, RNG, Mini Game payout and audio assets are unchanged.

After the existing `4/4 HOÀN THÀNH → KHÓA BẢNG B$` beat, podium slots reveal in this order:

1. displayed rank 4;
2. displayed rank 3;
3. displayed rank 2;
4. displayed rank 1.

Equal displayed ranks share the exact same delay, so tied players appear together. The final winner beat therefore never visually breaks a tie.

## What to test

- Finish a normal SOLO match and watch the podium reveal from low rank to high rank.
- Confirm the winner/crown is the final reveal beat.
- Create or observe a tie and confirm tied players appear simultaneously.
- Confirm 0.1.42 face reactions remain: rank 1 prefers happy, rank 4 prefers angry, middle ranks neutral.
- Confirm exact B$ values and competition ranks remain unchanged.
- Finish with the last required lap on Mini Game and verify payout commits before the B$ lock and podium sequence.
- Rematch and verify the reveal runs again for the new result.

## Retained invariants

- Every player must complete one physical lap before final scoring.
- Pending final Mini Game payout resolves before result.
- Mini Game payout is host-system owned and single-commit.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain unchanged.
- Presentation RNG must not perturb gameplay RNG.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.
