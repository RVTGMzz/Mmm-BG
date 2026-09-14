# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.47 - Multiplayer Presentation Parity + Tiên Tri / Phép Thuật (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.47`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.47_PROGRESS.md`
3. `docs/PLAYTEST_0.1.47.md`
4. `src/scenes/CareerMinigameBoardScene047.ts`
5. `src/ui/legacyDeckPresentation.ts`
6. `tests/multiplayer-presentation-parity-047.ts`
7. `src/ui/CardHandPicker.ts`
8. `src/scenes/PresentationParityBoardScene.ts`
9. `src/scenes/CareerMinigameBoardScene046.ts`
10. `tests/job-hub-multiplayer-046.ts`
11. `src/scenes/CareerMinigameBoardScene045.ts`
12. `tests/remote-roll-order-045.ts`

## What changed in 0.1.47

### Old deck language restored at presentation layer

- Visible `Tin Tức` becomes **TIÊN TRI**.
- Tiên Tri uses portrait/vertical presentation inspired by the old reference deck.
- Visible `Lá Bài / Thẻ Bài` becomes **PHÉP THUẬT**.
- Phép Thuật uses landscape/horizontal presentation.
- `CardHandPicker` now displays the player's hand using horizontal Phép Thuật cards.
- User-supplied reference images are visual direction only; they are not committed as runtime assets.

### Protocol stays compatible

The display rename is deliberately separated from gameplay terminology.

- `news`, `card_draw`, `card_play`, `play_card` and other technical event/command names remain unchanged.
- Replay, checksum and host-authority streams require no migration.
- `legacyDeckPresentation.ts` maps technical event kind to visible family/form and builds a deterministic presentation fingerprint.

### Multiplayer presentation parity

`tests/multiplayer-presentation-parity-047.ts` builds the same authoritative event stream under HOST and CLIENT modes and requires the same visible fingerprint.

It also protects:

- Tiên Tri -> portrait;
- Phép Thuật -> landscape;
- stale presentation not replayed on snapshot;
- only fresh eventSeq values enqueued for normal network state;
- no new gameplay/system intent or RNG in 0.1.47 wrapper;
- complete inheritance of validated 0.1.46 behavior.

## Retained multiplayer/gameplay

- 0.1.45 Remote Roll For Order remains host-authoritative.
- 0.1.46 Multiplayer Job Hub remains host-authoritative and spectator-safe.
- Job mapping remains `1-2 A / 3-4 B / 5-6 C`.
- Starting wallet remains `200 B$`.
- Every player completes one physical lap before final scoring.
- READY pays current Job salary once per crossing and increments lap.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct RPS payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Movement presentation/snapshot/rematch rules remain unchanged.
- Final podium/result-input chain remains unchanged.
- Original face files remain local.
- CPU remains a QA bot.
- Jail deep mechanics remain intentionally undefined.

## Validated artifact

GitHub Actions run: `34811037552` / run `#1403`

Validated runtime/package SHA:
`2c8b853f39b45e2fedd53130caf8115a4f07e9aa`

Artifact:
`mememe-playtest-0.1.47`

Artifact ID:
`10334662721`

Size:
`8,565,661 bytes`

Digest:
`sha256:c7b48367b32d181d8fbf8de162136302d25752ad90c90c5d0fa28f51643ba510`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34811037552`

Full CI passed build/typecheck, replay/lockstep, host-client/two-tab authority, all existing gameplay/presentation regressions, Remote Roll authority, Job Hub multiplayer, new Tiên Tri/Phép Thuật parity regression, image bounds, package verification, guide copy and artifact upload.

## CI notes

- Run #1399 failed only because the older Job Hub regression hardcoded the current packaged scene version. The invariant checks remain intact and the test is now version-agnostic.
- Run #1401 proved the new 0.1.47 runtime/parity regression green, but package verification found the playtest quickstart had lost its direct `file://` launch warning.
- The warning was restored. Run #1403 is the official green checkpoint.

## Runtime test focus

1. In HOST + JOIN, observe Tiên Tri on both tabs and verify identical content with portrait form.
2. Observe draw/use Phép Thuật on both tabs and verify identical spell, target and effect with landscape form.
3. Confirm a spectator peer sees the same presentation while another seat acts.
4. Force snapshot/resync and ensure old presentation does not replay.
5. Re-check Remote Roll, Job Hub, final Mini Game payout, podium, P1 movement, all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.47_PROGRESS.md và docs/PLAYTEST_0.1.47.md. Current validated artifact là mememe-playtest-0.1.47, run #1403, runtime SHA 2c8b853f39b45e2fedd53130caf8115a4f07e9aa. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
