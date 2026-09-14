# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.37 - Mini Game Authority Cleanup (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.37`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.37_PROGRESS.md`
3. `docs/PLAYTEST_0.1.37.md`
4. `docs/MVP_0.1.36_PROGRESS.md`
5. `src/scenes/CareerMinigameBoardScene037.ts`
6. `src/scenes/CareerMinigameBoardScene.ts`
7. `src/ui/MiniGameOverlay.ts`
8. `src/core/twoTabSession.ts`
9. `src/core/authority.ts`
10. `src/core/replay.ts`
11. `tests/minigame-authority-037.ts`
12. `tests/job-minigame-031.ts`

## What changed in 0.1.37

### Single authoritative Mini Game payout path

`MiniGameOverlay` already commits the final deterministic ranking through the host-only system path:

`TwoTabHostSession.submitSystemIntent('resolve_minigame', ...)`

The inherited 0.1.36 board scene also retained a second, obsolete player/seat submission after the overlay finished. The host correctly rejected that second path, so rewards did not duplicate, but it produced needless rejected receipts and made ownership ambiguous.

0.1.37 runs `CareerMinigameBoardScene037`, which preserves every normal player intent while suppressing only that obsolete duplicate `resolve_minigame` player submission.

Result:

- one source Mini Game event;
- one accepted host-system reward commit;
- no seat/player reward commit;
- duplicate source event cannot pay twice;
- clients receive authoritative B$ through normal host state sync.

### New regression

`tests/minigame-authority-037.ts` verifies:

- player/local Mini Game resolution is rejected;
- host-system resolution pays exactly once;
- a repeated resolution for the same source event is rejected without changing B$.

## Retained 0.1.36 features

- Event SFX: victory, news, card, step, money loss, money gain, dice, choice.
- Roll For Order presents each player's D6, including CPU seats; tied players reroll only.
- Mini Game BGM is exactly approved `03_City_Silly.ogg`.
- No fifth BGM and `track 1.MP3` is not used.
- Four approved BGM files stay checksum-locked and must not be re-encoded or substituted.
- Mini Game rewards are authoritative and replay/checksum-safe.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- Oẳn Tù Xì 1v1 presentation still runs for CPU vs CPU.

## Retained movement / score rules

- Normal state packets do not own token coordinates during ordinary movement presentation.
- Snapshot resync and rematch command #0 may hard-snap to authoritative nodes.
- Human Job Hub has explicit token reconciliation to avoid the visual one-node-behind bug.
- Every player must complete one physical board lap before final B$ scoring.
- Old 3-round / 12-turn metadata does not end the match.
- If the final required lap lands on a Mini Game, final result waits for Mini Game payout before scoring.
- Crossing READY still pays current Job salary and increments lap count.

## Job / game rules retained

- Roll For Order: highest D6 acts first; only tied seats reroll.
- Stable player ID, face, color and ownership stay attached to the same player.
- Mandatory Job Hub stop.
- Three unique Job offers A/B/C.
- Authoritative Job D6 mapping: `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Starting wallet `200 B$`.
- Career promotion / steady / demotion / fired retained.
- Thief may become `jailed`, but skipped-turn / bail / escape mechanics remain intentionally undefined.
- CPU remains a QA bot, not final AI.

## Determinism / authority invariants

- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- `playOrder`, Job state/pending offers, `lapsCompleted` and wallet state remain authoritative/checksum-relevant where applicable.
- Snapshot resync must not replay stale presentation.
- Result/ranking waits until final presentation and pending Mini Game economy resolve.
- Dice presentation always displays the authoritative result.
- Original face files remain local and must not be silently uploaded/persisted.

## Validated artifact

GitHub Actions run: `34798951707` / run `#1073`

Validated runtime head SHA:
`be7dc3246a4ded76f3913cca5d61b9ee3f2f4acb`

Artifact:
`mememe-playtest-0.1.37`

Artifact ID:
`10330458664`

Size:
`8,558,316 bytes`

Digest:
`sha256:da51a8277f3280ecc32954dabf0a1739327226874b2a181484cc864d5b5dd712`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34798951707`

Full CI passed through artifact upload, including the new Mini Game host-system payout ownership regression.

## Runtime test focus

1. Run a full Mini Game and confirm B$ changes exactly once.
2. In HOST + JOIN, let a joined seat participate and confirm the host still owns payout.
3. Confirm no duplicate money jump after the Mini Game overlay closes.
4. Confirm P1 still does not snap backward after movement + Card/News.
5. Confirm Job Hub still reconciles the human token correctly.
6. Confirm final score waits for pending Mini Game payout if the last required lap ends there.
7. Re-check all eight SFX contexts and `03_City_Silly.ogg` Mini Game BGM.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.37_PROGRESS.md và docs/PLAYTEST_0.1.37.md. Current validated artifact là mememe-playtest-0.1.37, run #1073, runtime SHA be7dc3246a4ded76f3913cca5d61b9ee3f2f4acb. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
