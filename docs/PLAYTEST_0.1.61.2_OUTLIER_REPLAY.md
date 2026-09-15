# MeMeMe 0.1.61.2 — Outlier Replay Pack

This is a QA/package patch only. The playable runtime and copied playtest-report schema remain **0.1.61**.

## Why this exists

The 0.1.61.1 deterministic 32-match baseline identified two useful sentinel seeds:

- `611124` — longest match in the baseline, 77 observed turns.
- `611121` — largest final B$ spread in the baseline, 292 B$.

0.1.61.2 replays each sentinel twice through the same HOST-authoritative full-match simulator and locks a detailed fingerprint. This gives future pacing/economy changes a pair of known stress cases instead of relying only on aggregate averages.

## Locked sentinel fingerprints

### Seed 611124 — longest match

- checksum `adf6c230`;
- turns 77;
- commands/submitted commands 119;
- final table money 1042 B$;
- final spread 151 B$;
- movement/release rolls 68 / 14;
- Cards 11;
- News 5;
- Mini Games 7, payout 290 B$;
- Jobs selected 4;
- Lottery 0, payout 0 B$;
- finish order `P2 > P4 > P1 > P3`;
- final money `P1 229 / P2 246 / P3 359 / P4 208 B$`.

### Seed 611121 — largest money spread

- checksum `a19c5b1d`;
- turns 64;
- commands/submitted commands 97;
- final table money 1389 B$;
- final spread 292 B$;
- movement/release rolls 62 / 6;
- Cards 7;
- News 6;
- Mini Games 3, payout 105 B$;
- Jobs selected 4;
- Lottery 2, payout 160 B$;
- finish order `P2 > P3 > P4 > P1`;
- final money `P1 362 / P2 205 / P3 325 / P4 497 B$`.

## CI contract

`tests/outlier-replay-0612.ts` verifies:

- identical seed produces identical authoritative playtest report;
- identical seed produces identical submitted-command and Mini Game-resolution counts;
- all four players finish through the existing one-lap finish system;
- both checksums remain exact;
- turn/command counts remain exact;
- table total/spread remain exact;
- movement/release/Card/News/Mini/Job/Lottery counts remain exact;
- Mini/Lottery payout totals remain exact;
- finish order and per-seat final B$ remain exact;
- neither replay approaches the simulation safety ceiling.

CI writes the detailed fingerprints to:

`OUTLIER_REPLAY_0.1.61.2.txt`

The artifact also keeps the 32-match baseline file:

`SIMULATION_BASELINE_0.1.61.1.txt`

## Important interpretation rule

These sentinels are regression evidence, not design targets.

Do not tune the game merely to make `611124` shorter or `611121` less swingy. If real human feedback later selects a pacing/economy change, rerun the same seeds, compare before/after fingerprints, and then update these expectations deliberately.

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
