# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.25 — Economy Pressure & Recovery (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.25`**.

Read first:
1. `docs/MVP_0.1.25_PROGRESS.md`
2. `docs/PLAYTEST_0.1.25.md`
3. `tests/economy-scale-025.ts`
4. `src/core/matchState.ts`
5. `src/content/city/board_city_mvp.json`
6. `src/content/core/cards_mvp.json`
7. `src/content/core/news_mvp_demo.json`
8. `tests/party-mechanics-024.ts`
9. `tests/content-depth-022.ts`
10. `src/scenes/PartyMechanicsBoardScene.ts`
11. `src/ui/SettingsPanel.ts`
12. `src/audio/bgmController.ts`
13. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## What 0.1.25 changed

### New-match wallet

All new matches now default to **200 B$**.

The 200 B$ default is locked in replay/economy regression. Existing serialized matches retain their stored values.

### Fixed-value economy rescale

Money tiles:
- +25 B$
- -20 B$
- +50 B$
- +15 B$

News:
- positive self News: +30 B$
- negative self News: -40 B$
- all-player loss News: -20 B$ each
- Cân Bằng B$ remains normalize-to-current-table-average

### Phao Cứu Sinh retune

`ACT_016` is now:
- +60 B$ when caster is tied for lowest current B$;
- +15 B$ otherwise.

### Relative Cards intentionally unchanged

- standard steal remains 10 B$;
- Thuế Top 1 remains 18%;
- SR all-opponent loss remains 30%;
- SSR money swap remains full swap.

### READY recovery anchor

Passing READY intentionally remains **+100 B$**.

The random/fixed economy swings were reduced, while READY stays large and predictable so completing a lap provides a real recovery path in the 200 B$ economy.

## Probability invariants

Card total weight remains 1000:
- N 600
- R 300
- SR 90
- SSR 10

News total weight remains 1000:
- positive self 600
- negative self 300
- group loss 50
- normalize-to-average 50

No new gameplay RNG calls or command types were added.

## Checksum promotion

Starting-money hotfix first moved the golden checksum to `5ed7922e`.

0.1.25 fixed-value economy rescale intentionally promotes it again:

`5ed7922e` → `46bb4e20`

Replay and authority agree on the promoted checksum.

## Regression

New command:

`npm run test:economy`

It locks:
- default 200 B$ opening wallet;
- all four money tile values;
- News +30 / -40 / -20 scale;
- Phao Cứu Sinh +60/+15;
- 10 B$ steal, 18% rich tax and 30% group-loss mechanics remain unchanged.

All earlier replay, lockstep, host/client, authority, two-tab, CPU stress, presentation, flow, board-flow, board-feel, settings/audio, content, reaction/route, party-mechanics, image and package checks remain enabled.

## Existing behavior retained

- Thuế Top 1 / Cân Bằng B$ / money swap and other Party Mechanics;
- effect-specific Card reactions;
- odd/even automatic route banner;
- node-by-node movement;
- graphical authoritative dice;
- compact board-first HUD;
- Card/News/Reaction timing policy and final-result deferral;
- Settings gear with BGM volume / BGM mute / FX mute;
- early Menu BGM preload / first-gesture unlock;
- approved BGM assets unchanged;
- face crop/zoom/rotate + runtime compression;
- CPU remains QA-only.

## Current artifact status

Validated gameplay/artifact run before final handoff-doc commit:

`34763514820` / run `#623`

Head SHA:

`304ce3511fe37b33f45c0b656419679f32dd8e45`

Artifact:

`mememe-playtest-0.1.25`

Artifact digest:

`sha256:7580c4f7c10a764d8463eed41b508799a20710e3626a2bcc043fcfddc08f3ad4`

Artifact size: ~8.50 MB.

CI passed through artifact upload, including **200B economy scale** and CPU autoplay.

## Recommended next work

Do a combined real playtest on 0.1.25 before another major rules expansion. Focus on:
1. does 200 B$ feel tense rather than starved;
2. are +30/-40 News swings noticeable but not match-ending;
3. does READY +100 feel exciting rather than excessive;
4. is Phao +60 useful without creating an instant first-place jump;
5. do percentage Cards now feel too strong or appropriately rare;
6. presentation/reaction queues still never backlog into endgame;
7. movement, Settings and BGM behavior remain stable.

Use Ron's next real-play feedback to choose 0.1.26. Avoid adding more economy knobs blindly before that.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute/re-encode approved BGM.
- Do not fake/bypass browser autoplay policy.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put Settings/BGM/SFX/image preferences into gameplay-critical MatchState.
- Presentation eventLog stays checksum-excluded.
- Snapshot resync must not replay stale presentation events.
- Result/ranking must not cover unresolved final-turn presentation.
- Route feedback remains non-blocking and host-authoritative.
- Automatic Card mechanics must not add client-authored random outcomes.
- Dice presentation must display the authoritative result.
- Original face files must not be silently uploaded/persisted.
- CPU remains a QA bot, not final gameplay AI.
