# MVP 0.1.43 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

## Scope

0.1.43 is presentation-only podium reveal polish. It does not change gameplay RNG, match-end rules, money, winner IDs, authoritative ranking, Mini Game rewards, Job rules, movement, authority, replay, snapshots, or approved BGM/SFX assets.

## Deterministic reveal cadence

New runtime scene: `src/scenes/CareerMinigameBoardScene043.ts`.

The authoritative 0.1.41 podium now builds each player into an independent presentation container. 0.1.42 still owns reaction faces and winner spotlight. 0.1.43 only controls when each slot becomes visible.

Fixed displayed-rank order:

- rank 4 first;
- rank 3 second;
- rank 2 third;
- rank 1 last.

Equal displayed ranks use the same `podiumRevealDelayForRank(rank)` value, so tied players reveal simultaneously.

The slot starts at alpha 0 with a fixed 14px vertical offset, then uses a fixed `Back.easeOut` tween. No random coordinates, `Math.random`, gameplay RNG or result recomputation is used.

## Timing helper

`src/ui/podiumReveal.ts` owns the fixed delay constants and rank-to-delay mapping. The first reveal begins around the point where the existing 0.1.39 B$ lock beat starts clearing; the winner beat follows last while the original result input blocker is still covering the transition window.

## Retained behavior

- 0.1.42 face reactions and tied-winner spotlight remain intact.
- 0.1.41 authoritative result and competition-ranking rules remain intact.
- 0.1.40 lap-native HUD/shell/log cleanup remains intact.
- 0.1.39 final B$ lock transition remains intact.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị pays `30 / 20 / 10 / 0 B$`.
- Direct RPS pays `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files remain untouched.
- Eight supplied SFX remain checksum-verified.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Regression

`tests/podium-reveal-043.ts` checks that:

- rank 4 reveals before 3, before 2, before 1;
- equal ranks map to the same reveal beat;
- 0.1.43 extends 0.1.42 and keeps inherited reaction/spotlight decoration;
- 0.1.41 provides independent slot containers inside the authoritative podium root;
- fixed scene-clock timing and tween easing are used;
- no gameplay/system command is submitted;
- no wallet mutation or presentation randomness is introduced;
- `src/main.ts`, Lobby and Setup identify 0.1.43.

The 0.1.42 regression is version-agnostic so later podium wrappers can inherit its behavior without false failures.

## Validated artifact

GitHub Actions run: `34805635514` / run `#1273`

Validated runtime/package SHA:
`ef63cd6deeddbd59a8c7eaaf2e6e1840aa518314`

Artifact:
`mememe-playtest-0.1.43`

Artifact ID:
`10332634348`

Artifact size:
`8,560,703 bytes`

Digest:
`sha256:28b19183809fa5174eb89f63a66b613c26ce1d30b92256734d6f9ff999ddac27`

Full CI passed through package validation and artifact upload, including authoritative podium, 0.1.42 reaction/spotlight, and the new deterministic low-to-high reveal regression.
