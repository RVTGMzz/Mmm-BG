# MVP 0.1.41 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.41 is a presentation-only final podium pass. It does not change gameplay RNG, match-end rules, money, ranking source, Mini Game rewards, Job rules, movement, authority, replay, snapshots, or approved BGM/SFX assets.

## Authoritative final podium

New runtime scene: `src/scenes/CareerMinigameBoardScene041.ts`.

The podium replaces the old text-heavy final ranking only after the real authoritative result overlay is eligible to render.

Sequence remains:

1. Every player completes the required lap.
2. Any pending final Mini Game payout commits through host-system authority.
3. PresentationParity clears queued presentation.
4. 0.1.39 shows `4/4 HOÀN THÀNH` and `KHÓA BẢNG B$ • CHỐT THỨ HẠNG`.
5. 0.1.41 reveals a four-seat podium using the authoritative result ranking.

The podium displays:

- all four players;
- authoritative player names from `MatchState`;
- authoritative final B$ values;
- the local runtime neutral face sticker when available, otherwise a P1/P2/P3/P4 fallback;
- medal/rank presentation;
- equal B$ as equal displayed rank and equal podium height.

## Tie policy

The podium uses competition ranking for display only:

- `300 / 300 / 250 / 200` → `1 / 1 / 3 / 4`;
- `300 / 250 / 250 / 200` → `1 / 2 / 2 / 4`.

This does not mutate `demoMatchResult`, winner IDs, player money, or shell result state.

## Result transition compatibility

0.1.41 inherits from 0.1.40 → 0.1.39. The podium joins `shellOverlay` and inherits the existing overlay alpha, so it remains hidden during the B$ lock beat and fades in with the real result overlay.

Victory SFX remains owned by the existing real-result hook and is not duplicated.

## Retained behavior

- 0.1.40 lap-native HUD/shell/log cleanup remains intact.
- 0.1.39 final B$ lock transition remains intact.
- Choice SFX coverage remains intact.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị pays `30 / 20 / 10 / 0 B$`.
- Direct RPS pays `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files remain untouched.
- Eight supplied SFX remain checksum-verified.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Regression

New `tests/final-podium-041.ts` checks that:

- podium ranking comes from `demoMatchResult(internals.match)`;
- displayed player names come from authoritative `MatchState`;
- first-place ties render `1,1,3,4`;
- second-place ties render `1,2,2,4`;
- same displayed rank maps to the same podium height;
- podium joins the real result overlay reveal list and inherits its alpha;
- no gameplay/system command is submitted;
- no wallet mutation or presentation randomness is introduced;
- the 0.1.39 final result gate remains in the inheritance chain;
- `src/main.ts` runs the 0.1.41 scene.

Final artifact metadata will be added only after full CI/package validation is green.
