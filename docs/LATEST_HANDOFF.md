# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.24 — Party Mechanics (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.24`**.

Read first:
1. `docs/MVP_0.1.24_PROGRESS.md`
2. `docs/PLAYTEST_0.1.24.md`
3. `src/core/cards.ts`
4. `src/core/news.ts`
5. `src/content/core/cards_mvp.json`
6. `src/content/core/news_mvp_demo.json`
7. `tests/party-mechanics-024.ts`
8. `tests/content-depth-022.ts`
9. `docs/MVP_0.1.23_PROGRESS.md`
10. `src/content/core/card_reactions_023.json`
11. `src/ui/presentationModel.ts`
12. `src/ui/routeFeedback.ts`
13. `src/scenes/PresentationParityBoardScene.ts`
14. `src/ui/SettingsPanel.ts`
15. `src/audio/bgmController.ts`
16. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## What 0.1.24 changed

### ACT_015 — Thuế Top 1

A genuinely new deterministic Card mechanic:
- rarity R / weight 75;
- automatically identifies the opponent with the highest current B$;
- ties resolve by lower player/seat ID;
- transfers 18% of that opponent's current B$ to the caster;
- no target picker;
- no extra RNG call;
- no new command type.

The deterministic selector is `pickRichestOtherTarget()` in `src/core/cards.ts`.

### ACT_016 — Phao Cứu Sinh

A comeback Card instead of another attack clone:
- rarity SR / weight 30;
- if caster is tied for the lowest current B$: +140B$;
- otherwise: +20B$;
- self-targeted and deterministic.

### NEWS_DEMO_009 — Cân Bằng B$

New News outcome:
- rarity SR / weight 50;
- sets the landing player's B$ to the floored current table average;
- can help a trailing player or reduce a leading player;
- no reaction script yet because the result can be positive, negative or zero.

## Probability totals

Card pool is now 13 Cards while keeping total weight 1000:
- N 600
- R 300
- SR 90
- SSR 10

News pool is now 9 News while keeping total weight 1000:
- +60 self: 600
- -80 self: 300
- -40 all players: 50
- normalize-to-average self: 50

## Checksum promotion

0.1.24 intentionally changes gameplay state rather than only presentation/content IDs.

Golden checksum moved from:

`7ad81b89` → `2338670a`

Replay, lockstep, host/client and authority all agree on the promoted checksum.

## Regression

New command:

`npm run test:party`

It locks:
- richest-opponent deterministic tie-break;
- exact 18% transfer math;
- comeback full/base branch;
- average News raises a low player to average;
- average News lowers a high player to average.

All earlier replay, lockstep, host/client, authority, two-tab, CPU stress, presentation, flow, board-flow, board-feel, settings/audio, content, reaction/route, image and package checks remain enabled.

## Existing behavior retained

- Card reactions by effect from 0.1.23;
- odd/even route banner remains non-blocking;
- named City tile identity;
- Card/News/Reaction timing policy from 0.1.19;
- node-by-node token movement;
- pip dice showing authoritative result;
- active-turn halo and compact HUD;
- Settings gear containing BGM volume / BGM mute / FX mute;
- early Menu BGM preload and first-gesture unlock behavior;
- result/ranking deferral until final presentation finishes;
- image crop/zoom/rotate + runtime compression;
- CPU remains QA-only.

## Current artifact status

Validated GitHub Actions run:

`34758580714` / run `#581`

Artifact:

`mememe-playtest-0.1.24`

Artifact digest:

`sha256:2543d81a8d07cf415ea3d3529f3460683d8ef1cd97cb6c1e63562393d6837737`

Artifact size: ~8.50 MB.

GitHub run URL:

`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34758580714`

CI passed through artifact upload, including **Party mechanics deterministic rules** and CPU autoplay.

## Recommended next work

First do one combined real playtest on 0.1.24 before adding more features. Focus on:
1. presentation queue never backs up into endgame;
2. movement still feels natural node-by-node;
3. route banner remains readable and non-blocking;
4. Thuế Top 1 resolves the visible richest opponent correctly;
5. Phao Cứu Sinh feels useful without being absurdly strong;
6. Cân Bằng B$ creates interesting swings rather than frustration;
7. Settings/BGM startup and event audio still behave correctly;
8. no UI element again starts permanently covering the future map art.

Only after Ron's combined playtest feedback should the next gameplay/content milestone be chosen.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute or re-encode approved BGM.
- Do not fake/bypass browser autoplay policy.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put Settings/BGM/SFX/image preferences into gameplay-critical MatchState.
- Presentation eventLog remains excluded from gameplay checksum.
- Snapshot resync must not replay stale presentation events.
- Result/ranking must not cover unresolved final-turn presentation.
- Route feedback must remain non-blocking and must not replace host-authoritative `choose_branch`.
- Automatic Card mechanics must not add target prompts or client-authored random outcomes.
- Dice presentation must display the authoritative result.
- Original face files must not be silently uploaded or persisted.
- CPU remains a QA bot, not final gameplay AI.
