# MeMeMe MVP 0.1.27 — Tactical Choice

Status: ACTIVE / PLAYTEST PACKAGED

## Goal

Move beyond presentation polish and add a small but real player decision without adding a new command type, new RNG stream or permanent map UI.

## Kèo Hai Cửa

`ACT_008` changed from a third duplicate 1-turn Card lock into the R-rarity tactical Card **Kèo Hai Cửa**, while keeping:
- the same Card ID;
- the same R rarity;
- the same 75 drop weight;
- total R weight at 300;
- total Card weight at 1000.

Choices:
- `safe`: +25 B$ to caster;
- `pressure`: transfer 15% of the current richest other player's B$ to caster.

Richest-opponent ties use the existing deterministic lower-seat-ID rule.

## Authority / replay

`play_card` remains the only command type used.

For `tactical_choice` Cards:
- client sends `choice = safe|pressure`;
- host validates the value before stamping the command;
- replay requires the same value and fails invalid streams;
- the Card event stores the selected tactical choice for presentation/debugging.

No additional gameplay RNG is consumed by resolving either option.

## Human UI

Added `src/ui/TacticalChoicePicker.ts`.

The panel appears only after selecting a tactical Card and shows:
- guaranteed Safe amount;
- current Pressure target;
- exact current floored 15% value;
- cancel/back without consuming the Card.

`src/scenes/TacticalChoiceBoardScene.ts` wraps the 0.1.26 board and replaces the Card action entry point without changing validated movement/leaderboard/presentation code.

## CPU QA behavior

The test bot evaluates the two deterministic payouts:
- if Pressure > Safe, choose Pressure;
- otherwise choose Safe.

The evaluation itself consumes no MatchState RNG.

## Regression

New command:

`npm run test:tactical`

It locks:
- ACT_008 identity and 25/15% values;
- Safe resolution;
- Pressure resolution;
- richest tie-break;
- invalid-choice failure;
- CPU deterministic option selection;
- CPU tactical evaluation does not consume gameplay RNG;
- R rarity total stays 300.

Full CI passed, including replay, lockstep, host/client, authority, two-tab, CPU autoplay, presentation/flow, economy, Turn Stakes, Tactical Choice, image and package validation.

Golden replay checksum did **not** require promotion: the Card kept the same ID/weight and the golden fixture does not play ACT_008.

## Artifact

Validated GitHub Actions run:
- run ID: `34765167348`
- run number: `#685`
- head SHA: `90fd71c842704ed48bd97fa501f4569750ebe5af`

Artifact:
- `mememe-playtest-0.1.27`
- size: ~8.51 MB
- digest: `sha256:a5e9d5f60f5604c205899d9d4e9b36c74cd2ff19ea0fc1088442cc6965d76432`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34765167348`

## Retained

- 200 B$ opening wallet;
- 0.1.25 economy scale;
- READY +100 B$;
- 0.1.26 live leaderboard / money deltas;
- automatic odd/even routes;
- node-by-node movement;
- presentation timing / reaction queue rules;
- Settings/BGM/SFX;
- face editor/compression;
- PR #1 remains unmerged.
