# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.28 — NPC Banter & Longer Side Chat (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.28`**.

Read first:
1. `docs/MVP_0.1.28_PROGRESS.md`
2. `docs/PLAYTEST_0.1.28.md`
3. `src/core/testBot.ts`
4. `src/ui/npcChatPolicy.ts`
5. `src/ui/presentationModel.ts`
6. `tests/tactical-choice-027.ts`
7. `docs/MVP_0.1.27_PROGRESS.md`
8. `src/core/cards.ts`
9. `src/core/authority.ts`
10. `src/core/replay.ts`
11. `src/content/core/cards_mvp.json`
12. `src/scenes/TacticalChoiceBoardScene.ts`
13. `src/scenes/TurnStakesBoardScene.ts`
14. `src/ui/SettingsPanel.ts`
15. `src/audio/bgmController.ts`
16. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## What 0.1.28 changed

### Rare CPU personality quirk

CPU QA seats now have a low-frequency deterministic Card-decision quirk.

- nominal schedule: about 1 in 20 CPU Card decisions;
- derived from existing turn / seat / Card identity;
- consumes zero MatchState RNG calls;
- visible through the existing left/right reaction bubbles;
- copy includes lines such as `Ấy chết, bấm trượt tay 😭`.

For **Kèo Hai Cửa**, a quirk hit can intentionally flip the normally optimal deterministic option, so the mistake can be real rather than cosmetic-only.

CPU remains a QA bot, not final gameplay AI.

### Longer NPC side chat

Reaction bubbles spoken by CPU/NPC seats now stay visible for **2.5×** their previous duration.

Human/hotseat reaction timing remains unchanged.

The longer duration is represented in the presentation model itself, so the presentation queue accounts for it and does not leave stale chat behind after advancing.

Dedicated 4-CPU autoplay still uses the existing fast stress timing policy.

## Gameplay retained

Tactical Choice from 0.1.27 remains:
- Kèo Hai Cửa Safe +25 B$;
- Pressure transfers 15% from richest other player;
- host validates explicit `safe|pressure` choice;
- no new command type or RNG.

Economy remains:
- starting wallet 200 B$;
- READY +100 B$;
- money tiles +25 / -20 / +50 / +15 B$;
- News +30 self / -40 self / -20 all / normalize-to-average;
- Phao Cứu Sinh +60 when lowest / +15 otherwise.

Turn Stakes remains:
- live B$ leaderboard;
- leader/trailer markers;
- wallet delta feedback;
- leader-change pulse.

Movement, automatic parity routes, Card/News presentation, Settings, BGM/SFX and face editor remain intact.

## Regression

`npm run test:tactical` now also locks:
- deterministic CPU quirk fixture;
- tactical quirk can select the opposite choice;
- quirk consumes zero gameplay RNG;
- NPC chat duration multiplier is exactly 2.5×;
- human reaction duration remains unchanged.

All previous replay, lockstep, host/client, authority, two-tab, CPU stress, presentation, flow, board-flow, board-feel, settings/audio, content, reaction/route, party, economy, Turn Stakes, image and package tests remain enabled.

## Validated artifact

GitHub Actions:

`34766302140` / run `#717`

Head SHA:

`966cb4b8bf6ae4ca69460ecfd1ea84ae0edbedef`

Artifact:

`mememe-playtest-0.1.28`

Artifact digest:

`sha256:f9cc30d9928edf2bab1068b527e698c8bb8ee7ddb268f84809bb6230dacf21f6`

Artifact size: ~8.51 MB.

GitHub run URL:

`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34766302140`

CI passed through artifact upload, including **Tactical Choice and NPC Banter rules** and CPU autoplay.

## Next work — 0.1.29

Build **Mini Game + Job Tile Foundation** next.

Target scope:
1. add Mini Game and Job as explicit tile/content families;
2. add board identity/rendering for both;
3. add deterministic resolution entry points and presentation events;
4. add CPU-safe fallback behavior so autoplay cannot deadlock;
5. lock replay / authority / snapshot behavior with regression tests;
6. keep final detailed Mini Game and Job rules intentionally open until explicitly confirmed.

After the foundation is green, target **0.1.30** for one playable Mini Game and one playable Job end-to-end.

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
- Tactical Card choices remain host-validated.
- Dice presentation must display the authoritative result.
- Original face files must not be silently uploaded/persisted.
- CPU remains a QA bot, not final gameplay AI.
