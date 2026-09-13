# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.26 — Turn Stakes & Money Drama (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.26`**.

Read first:
1. `docs/MVP_0.1.26_PROGRESS.md`
2. `docs/PLAYTEST_0.1.26.md`
3. `src/ui/moneyStakes.ts`
4. `src/scenes/TurnStakesBoardScene.ts`
5. `tests/money-stakes-026.ts`
6. `docs/MVP_0.1.25_PROGRESS.md`
7. `tests/economy-scale-025.ts`
8. `src/core/matchState.ts`
9. `src/content/city/board_city_mvp.json`
10. `src/content/core/cards_mvp.json`
11. `src/content/core/news_mvp_demo.json`
12. `src/scenes/PartyMechanicsBoardScene.ts`
13. `src/ui/SettingsPanel.ts`
14. `src/audio/bgmController.ts`
15. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## What 0.1.26 changed

### Live money leaderboard

The compact B$ panel is now a live standings panel:
- sorted by current B$ descending;
- deterministic lower seat ID tiebreak;
- leader gets `👑`;
- trailer gets `🛟`;
- when all players are tied, nobody gets a fake crown/lifebuoy.

The current-turn line now includes:
- player name;
- current B$;
- current rank / tied state.

### Wallet delta feedback

Authoritative state transitions are compared presentation-side.

When a player's B$ changes, a small transient `+/- B$` label appears beside that player's leaderboard row and fades automatically.

This feedback:
- is non-blocking;
- does not add RNG;
- does not enter MatchState;
- is suppressed for snapshot resync so stale wallet changes are not replayed.

### Leader change feedback

When the visible leader changes, the leaderboard pulses slightly. No modal and no extra acknowledgement are introduced.

## Gameplay retained from 0.1.25

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

Relative Card mechanics remain unchanged:
- steal 10 B$;
- Thuế Top 1 18%;
- SR all-opponent loss 30%;
- SSR full wallet swap.

## Regression

New command:

`npm run test:stakes`

It locks:
- deterministic money ordering;
- lower-seat tiebreak;
- crown/trailer markers;
- no markers when the whole table is tied;
- compact leaderboard row state;
- exact wallet delta comparison.

All earlier replay, lockstep, host/client, authority, two-tab, CPU stress, presentation, flow, board-flow, board-feel, settings/audio, content, reaction/route, party-mechanics, 200B economy, image and package checks remain enabled.

## Current artifact status

Validated GitHub Actions run:

`34764306363` / run `#647`

Head SHA:

`6df36cde0f7c41e525ce80a261844977aebe45a8`

Artifact:

`mememe-playtest-0.1.26`

Artifact digest:

`sha256:208c864fb351d21f97813a5b22049faf9856f94f547ccf6fcf348bab4d4c2a35`

Artifact size: ~8.50 MB.

GitHub run URL:

`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34764306363`

CI passed through artifact upload, including **Turn stakes money leaderboard** and CPU autoplay.

## Recommended next work

Do a real playtest on 0.1.26 and focus on:
1. whether the live leaderboard improves tension without becoming distracting;
2. whether crown/lifebuoy changes are readable at a glance;
3. whether wallet delta labels are visible but not noisy;
4. whether 200 B$ economy still feels tense rather than starved;
5. whether READY +100 remains exciting rather than excessive;
6. whether presentation/reaction queues remain clean through endgame;
7. whether the next milestone should add deeper strategic choice rather than more HUD polish.

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
- Automatic Card mechanics must not add client-authored random outcomes.
- Dice presentation must display the authoritative result.
- Original face files must not be silently uploaded/persisted.
- CPU remains a QA bot, not final gameplay AI.
