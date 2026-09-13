# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.27 — Tactical Choice (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.27`**.

Read first:
1. `docs/MVP_0.1.27_PROGRESS.md`
2. `docs/PLAYTEST_0.1.27.md`
3. `src/core/cards.ts`
4. `src/core/authority.ts`
5. `src/core/replay.ts`
6. `src/content/core/cards_mvp.json`
7. `src/ui/TacticalChoicePicker.ts`
8. `src/scenes/TacticalChoiceBoardScene.ts`
9. `tests/tactical-choice-027.ts`
10. `src/scenes/TurnStakesBoardScene.ts`
11. `src/ui/moneyStakes.ts`
12. `tests/economy-scale-025.ts`
13. `src/ui/SettingsPanel.ts`
14. `src/audio/bgmController.ts`
15. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## What 0.1.27 changed

### First explicit Card choice

`ACT_008` is now **Kèo Hai Cửa**.

It remains R rarity / weight 75, so total Card rarity probabilities stay unchanged.

When used, the player chooses one of two deterministic outcomes:
- **ĂN CHẮC**: +25 B$ to the caster;
- **ÉP TOP 1**: transfer 15% of the current richest other player's B$ to the caster.

The richest-opponent tie-break remains lower seat/player ID.

### Human UI

A dedicated tactical choice panel opens only for `tactical_choice` Cards.

It shows before committing:
- exact Safe payout;
- current richest target;
- target's current B$;
- exact floored Pressure payout.

`QUAY LẠI` cancels without consuming the Card.

### Host authority / replay

No new command type was added.

The existing `play_card` command now carries `choice = safe|pressure` only for tactical Cards.

Host validates the choice before stamping the command. Replay requires the same choice and rejects invalid streams rather than silently defaulting.

Neither branch consumes gameplay RNG.

### CPU QA behavior

CPU remains QA-only.

For Kèo Hai Cửa it compares:
- guaranteed +25 B$;
- current 15% richest-opponent value.

CPU selects Pressure only when Pressure > Safe; otherwise it selects Safe. This evaluation consumes no MatchState RNG.

## Probability invariants

Total Card weight remains 1000:
- N 600
- R 300
- SR 90
- SSR 10

Within R, one former duplicate block Card was replaced by Kèo Hai Cửa without changing its ID or 75 weight.

No News probabilities changed.

## Gameplay retained

Starting wallet remains **200 B$**.

Money tiles:
- +25 B$
- -20 B$
- +50 B$
- +15 B$

News:
- +30 B$ self
- -40 B$ self
- -20 B$ all players
- normalize-to-average unchanged

Phao Cứu Sinh:
- +60 B$ when tied for lowest
- +15 B$ otherwise

READY remains **+100 B$**.

Turn Stakes from 0.1.26 remains:
- live B$ leaderboard;
- crown/lifebuoy markers;
- current-turn rank copy;
- non-blocking wallet delta labels;
- leader-change pulse;
- snapshot resync suppresses stale wallet FX.

All movement, route parity, presentation timing, reaction queue, Settings, BGM/SFX and face-editor behavior remain intact.

## Regression

New command:

`npm run test:tactical`

It locks:
- Kèo Hai Cửa identity and 25/15% values;
- Safe resolution;
- Pressure resolution;
- richest tie-break;
- invalid-choice failure;
- CPU deterministic choice;
- CPU tactical evaluation does not consume gameplay RNG;
- R rarity total remains 300.

All previous replay, lockstep, host/client, authority, two-tab, CPU stress, presentation, flow, board-flow, board-feel, settings/audio, content, reaction/route, party, economy, Turn Stakes, image and package tests remain enabled.

Golden replay checksum stays unchanged from 0.1.25/0.1.26 because ACT_008 kept the same ID/weight and the golden fixture does not play it.

## Current artifact status

Validated GitHub Actions run:

`34765167348` / run `#685`

Head SHA:

`90fd71c842704ed48bd97fa501f4569750ebe5af`

Artifact:

`mememe-playtest-0.1.27`

Artifact digest:

`sha256:a5e9d5f60f5604c205899d9d4e9b36c74cd2ff19ea0fc1088442cc6965d76432`

Artifact size: ~8.51 MB.

GitHub run URL:

`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34765167348`

CI passed through artifact upload, including **Tactical Choice rules** and CPU autoplay.

## Recommended next work

Do a real playtest on 0.1.27 and focus on:
1. whether the choice panel feels quick rather than interruptive;
2. whether +25 B$ vs 15% Top-1 creates a meaningful decision at 200 B$ economy;
3. whether the displayed Pressure preview matches the actual resolved target/value;
4. whether cancelling preserves the Card cleanly;
5. whether CPU tactical choice looks sensible in autoplay;
6. whether Card presentation/reactions still remain readable after a tactical resolution;
7. whether the next strategic layer should be another Card choice or a board-space choice.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute/re-encode approved BGM.
- Do not fake/bypass browser autoplay policy.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put Settings/BGM/SFX/image preferences into gameplay-critical MatchState.
- Presentation eventLog stays checksum-excluded.
- Snapshot resync must not replay stale presentation events or wallet FX.
- Result/ranking must not cover unresolved final-turn presentation.
- Route feedback remains non-blocking and host-authoritative.
- Tactical Card choices are player-authored decisions, never random client-authored outcomes.
- Automatic Card mechanics must not add client-authored random outcomes.
- Dice presentation must display the authoritative result.
- Original face files must not be silently uploaded/persisted.
- CPU remains a QA bot, not final gameplay AI.
