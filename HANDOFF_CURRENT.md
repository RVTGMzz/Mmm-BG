# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.47 - Multiplayer Presentation Parity + Tiên Tri / Phép Thuật**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34811037552` / run `#1403`

Validated runtime/package SHA:
`2c8b853f39b45e2fedd53130caf8115a4f07e9aa`

Artifact:
`mememe-playtest-0.1.47`

Artifact ID:
`10334662721`

Artifact size:
`8,565,661 bytes`

Digest:
`sha256:c7b48367b32d181d8fbf8de162136302d25752ad90c90c5d0fa28f51643ba510`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34811037552`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.47_PROGRESS.md`
4. `docs/PLAYTEST_0.1.47.md`
5. `src/scenes/CareerMinigameBoardScene047.ts`
6. `src/ui/legacyDeckPresentation.ts`
7. `tests/multiplayer-presentation-parity-047.ts`
8. `src/ui/CardHandPicker.ts`
9. `src/scenes/PresentationParityBoardScene.ts`
10. `src/scenes/CareerMinigameBoardScene046.ts`
11. `tests/job-hub-multiplayer-046.ts`
12. `src/scenes/CareerMinigameBoardScene045.ts`
13. `tests/remote-roll-order-045.ts`

## 0.1.47 visible deck language

- Visible old **Tin Tức** language is now **TIÊN TRI**.
- Tiên Tri uses the old vertical/portrait card silhouette.
- Visible old **Lá Bài / Thẻ Bài** language is now **PHÉP THUẬT**.
- Phép Thuật uses the old horizontal/landscape card silhouette.
- `CardHandPicker` now presents the hand as horizontal Phép Thuật cards.
- Supplied reference images are visual direction only and are not persisted as runtime assets.

## Technical compatibility

- Technical event/command names stay `news`, `card_draw`, `card_play`, `play_card`, etc.
- Replay/checksum/authority protocol is not renamed or migrated.
- `legacyDeckPresentation.ts` owns the visible taxonomy and deterministic presentation fingerprint.
- HOST and CLIENT derive the same visible fingerprint from the same authoritative event stream.
- 0.1.47 wrapper adds no gameplay/system intent, money mutation or RNG.

## Presentation parity / resync invariants

- Normal state packets enqueue only fresh presentation events with `event.seq >= beforeEventSeq`.
- Snapshot resync does not replay stale presentation.
- Queued `move_step` still owns token coordinates during movement presentation.
- Snapshot/rematch may hard-snap tokens.
- Final result still waits until presentation queue/pending Mini Game payout clears.

## Retained multiplayer

### Remote Roll For Order 0.1.45

- Remote client sends click intent only; host generates D6.
- Duplicate/stale clicks cannot consume an extra D6.
- Host owns tie-reroll, final `playOrder` and match release.

### Multiplayer Job Hub 0.1.46

- HOST/CLIENT see the same three authoritative A/B/C offers.
- Only controlling peer can press Job Dice.
- Client sends empty `choose_job`; forged Job/result data is discarded.
- Host gameplay RNG generates Job D6.
- Mapping stays `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.

## Core invariants

- Starting wallet `200 B$`.
- Every player completes one physical lap before final scoring.
- Crossing READY increments lap and pays current Job salary exactly once.
- Mini Game payout is host-system owned and single-commit.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain unchanged/checksum-protected.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Original face files remain local.
- CPU remains a QA bot.
- Final podium/result-input chain from 0.1.41-0.1.44 remains unchanged.
- Thief `jailed` exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.

## CI notes

- Run #1399 failed only because old 0.1.46 regression owned the current runtime version. It was made version-agnostic without weakening Job Hub checks.
- Run #1401 passed the new 0.1.47 parity regression but package verifier caught the missing direct `file://` launch warning.
- Warning restored; run #1403 is FULL GREEN and is the official checkpoint.

## Runtime test focus

1. HOST + JOIN: trigger a Tiên Tri and verify both tabs show the same title/effect/actor with portrait form.
2. Draw/use Phép Thuật and verify both tabs show the same spell/target/effect with landscape form.
3. Confirm spectator peer still receives identical presentation.
4. Trigger snapshot/resync and ensure already-consumed Tiên Tri/Phép Thuật does not replay.
5. Re-check Remote Roll, Job Hub, Mini Game payout, final podium, P1 movement, eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.47_PROGRESS.md và docs/PLAYTEST_0.1.47.md. Current validated artifact là mememe-playtest-0.1.47, run #1403, runtime SHA 2c8b853f39b45e2fedd53130caf8115a4f07e9aa. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
