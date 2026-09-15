# MeMeMe 0.1.61.2 — Outlier Replay Pack

This is a QA/package patch only. The playable runtime and copied playtest-report schema remain **0.1.61**.

## Why this exists

The 0.1.61.1 deterministic 32-match baseline identified two useful sentinel seeds:

- `611124` — longest match in the baseline, 77 observed turns.
- `611121` — largest final B$ spread in the baseline, 292 B$.

0.1.61.2 replays each sentinel twice through the same HOST-authoritative full-match simulator and records a compact fingerprint. This gives future pacing/economy changes a pair of known stress cases instead of relying only on aggregate averages.

## CI contract

`tests/outlier-replay-0612.ts` verifies:

- identical seed produces identical authoritative playtest report;
- identical seed produces identical submitted-command and Mini Game-resolution counts;
- all four players finish exactly through the existing one-lap finish system;
- seed `611124` remains at 77 turns while gameplay is intentionally unchanged;
- seed `611121` remains at 292 B$ final spread while gameplay is intentionally unchanged;
- neither replay approaches the simulation safety ceiling.

CI writes the detailed fingerprints to:

`OUTLIER_REPLAY_0.1.61.2.txt`

The artifact also keeps the 32-match baseline file:

`SIMULATION_BASELINE_0.1.61.1.txt`

## Important interpretation rule

These sentinels are regression evidence, not design targets.

Do not tune the game merely to make `611124` shorter or `611121` less swingy. If real human feedback later selects a pacing/economy change, rerun the same seeds, compare before/after fingerprints, and then update the sentinel expectations deliberately.

## Human playtest still has priority

A real 0.1.61 match report plus subjective feedback is still required before selecting gameplay scope for 0.1.62.

After a real match:

1. Finish the match through podium.
2. Open `BÁO CÁO PLAYTEST`.
3. Press `COPY REPORT` and paste the complete block.
4. Say whether the match felt fast / right / slow.
5. Say whether final B$ felt too compressed / right / too swingy.
6. Identify the slowest, strongest or weakest event.
7. Continue watching long-run token snap-back and host/client result ordering.

Do not merge PR #1 unless Ron explicitly requests it.
