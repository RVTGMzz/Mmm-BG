# MVP 0.1.42 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

## Scope

0.1.42 is presentation-only podium reaction polish. It does not change gameplay RNG, match-end rules, money, winner IDs, authoritative ranking, Mini Game rewards, Job rules, movement, authority, replay, snapshots, or approved BGM/SFX assets.

## Podium face reactions

New runtime scene: `src/scenes/CareerMinigameBoardScene042.ts`.

0.1.41 now exposes two presentation-only podium hooks while keeping its default behavior neutral:

- `podiumFaceExpression(entry)`
- `decoratePodiumSlot(root, entry, x, faceY)`

0.1.42 overrides those hooks only.

Display mapping is deterministic and based on the already-computed displayed rank:

- rank 1 → prefer `happy` face;
- rank 2 → `neutral`;
- rank 3 → `neutral`;
- rank 4 → prefer `angry` face.

`gameSession.getFace()` already falls back to neutral when the requested happy/angry asset is missing, so reaction images remain optional.

## Winner spotlight

Every displayed rank-1 entry receives the same fixed presentation decoration:

- crown `👑`;
- left/right `✦` sparks.

No random coordinates, timing, gameplay RNG or winner recomputation is used. If two or more players tie for first, every rank-1 podium slot receives the same spotlight.

## Pure helper

`src/ui/podiumFaceReaction.ts` owns the deterministic mapping so Node CI can validate it without importing Phaser.

## Retained behavior

- 0.1.41 authoritative podium ranking and competition-tie rules remain unchanged.
- Podium B$ and names remain sourced from authoritative `MatchState` / `demoMatchResult`.
- 0.1.40 lap-native HUD/shell/log copy remains intact.
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

`tests/podium-face-reaction-042.ts` checks that:

- rank 1 maps to happy;
- ranks 2/3 map to neutral;
- rank 4 maps to angry;
- spotlight is rank-1 only, including every member of a first-place tie;
- 0.1.42 extends the authoritative 0.1.41 podium;
- fixed crown/spark decorations exist;
- 0.1.41 still consumes the overridable face/decor hooks;
- no gameplay/system command is submitted;
- no wallet mutation or presentation randomness is introduced;
- `src/main.ts` runs 0.1.42;
- Lobby and Setup identify 0.1.42.

## Validated artifact

GitHub Actions run: `34804709294` / run `#1241`

Validated runtime/package SHA:
`0b0fc74b0d1c8795f8af426371a8ccc0f0acd208`

Artifact:
`mememe-playtest-0.1.42`

Artifact ID:
`10332517930`

Artifact size:
`8,561,602 bytes`

Digest:
`sha256:c0d69e6119558892957df5cc95a3beb36bdae41f9e457800b9c88ceb1611eb65`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34804709294`

Full CI passed through typecheck/build, deterministic/network/gameplay tests, authoritative podium regression, new face-reaction/spotlight regression, image bounds, package verification and artifact upload.
