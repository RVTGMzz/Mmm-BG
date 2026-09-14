# MVP 0.1.44 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.44 is presentation/input-timing polish only. It does not change gameplay RNG, match-end rules, money, winner IDs, authoritative ranking, Mini Game rewards, Job rules, movement, authority, replay, snapshots, or approved BGM/SFX assets.

## Result input reveal gate

New runtime scene: `src/scenes/CareerMinigameBoardScene044.ts`.

0.1.39 already blocks result controls during the B$ lock beat. 0.1.43 extends podium presentation slightly beyond the tail of that original blocker. 0.1.44 closes that small timing gap with a transparent interactive blocker that remains until `podiumRevealCompleteMs()`.

The blocker:

- arms only after a real ended-state result overlay exists;
- sits above result controls and below the 0.1.39 lock blocker;
- captures clicks during the full podium cascade;
- releases after the final rank-1 tween plus a fixed small pad;
- resets on rematch/non-ended state and scene shutdown.

## Deterministic completion helper

`src/ui/podiumReveal.ts` now exports `podiumRevealCompleteMs()`, derived only from fixed reveal constants. No `Math.random`, gameplay RNG or result recomputation is involved.

## Retained behavior

- 0.1.43 low-to-high reveal remains `4 → 3 → 2 → 1`; equal ranks reveal together.
- 0.1.42 face reactions and tied-winner spotlight remain intact.
- 0.1.41 authoritative result and competition ranking remain intact.
- 0.1.40 lap-native HUD/shell/log cleanup remains intact.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị pays `30 / 20 / 10 / 0 B$`.
- Direct RPS pays `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files remain untouched.
- Eight supplied SFX remain checksum-verified.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Regression

New `tests/podium-result-gate-044.ts` checks that:

- unlock time extends beyond the final winner tween;
- the gate arms only for a real ended result overlay;
- the blocker captures input and is layered correctly;
- release uses the deterministic completion helper;
- rematch/shutdown cleanup remains present;
- no gameplay/system command, wallet mutation or randomness is introduced;
- `src/main.ts`, Lobby and Setup identify 0.1.44.

Final artifact metadata will be added only after full CI/package validation is green.
