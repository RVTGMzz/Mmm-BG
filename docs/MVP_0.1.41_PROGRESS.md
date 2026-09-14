# MVP 0.1.41 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

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

The tie helper lives in `src/ui/podiumRanking.ts` so CI can test it without importing Phaser/browser runtime.

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

`tests/final-podium-041.ts` checks that:

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

## Validated artifact

GitHub Actions run: `34804272675` / run `#1209`

Validated runtime/package SHA:
`9c6bb6a4b0080d4d2599cc142bf27ec45c6fa92e`

Artifact:
`mememe-playtest-0.1.41`

Artifact ID:
`10332816906`

Artifact size:
`8,561,263 bytes`

Digest:
`sha256:86170b85522a7b888b5e3a5864a753febb6a6e8328c19b14397a2fda9e0ff82b`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34804272675`

Full CI passed through typecheck/build, deterministic/network/gameplay regressions, the new podium/tie regression, package verification and artifact upload.

The first 0.1.41 attempt failed only on a Phaser `Container.add()` TypeScript signature in the new avatar presentation code. It was corrected to array-form `add([...])`; no gameplay logic was involved.
