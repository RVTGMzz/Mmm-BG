# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.38 - Choice SFX + One-Lap Copy Polish (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.38`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.38_PROGRESS.md`
3. `docs/PLAYTEST_0.1.38.md`
4. `docs/MVP_0.1.37_PROGRESS.md`
5. `src/scenes/CareerMinigameBoardScene037.ts`
6. `src/scenes/CareerMinigameBoardScene.ts`
7. `src/ui/MiniGameOverlay.ts`
8. `src/audio/sfxController.ts`
9. `src/core/twoTabSession.ts`
10. `src/core/authority.ts`
11. `tests/choice-sfx-038.ts`
12. `tests/minigame-authority-037.ts`

## What changed in 0.1.38

### Choice SFX coverage

The supplied `choice.ogg` / `ui_confirm` cue now covers the primary confirmation surfaces that were still silent:

- Route / Branch picker.
- Card hand picker, including `GIỮ LẠI`.
- Target picker.
- Tactical Choice / Kèo Hai Cửa, including cancel/back.
- Setup → Roll For Order.
- Settings open/close and BGM toggle.

Existing choice feedback remains on Local Lobby actions, Job Dice, Mini Game human choices and Enter Match after Roll For Order.

Normal dice continues to use `dice.ogg`, not the choice cue.

### Visible rule copy cleanup

Setup and Local Lobby now identify the current 0.1.38 build and no longer advertise obsolete `MVP 0.1.31` / `demo 3 vòng` copy.

The visible rule matches the authoritative match rule:

- every player completes at least one physical board lap;
- final B$ scoring waits until all players meet that target;
- if the final lap lands on a Mini Game, pending payout resolves before result finalization.

### New regression

`tests/choice-sfx-038.ts` locks choice feedback coverage and prevents obsolete Setup/Lobby three-round copy from returning.

## Retained 0.1.37 Mini Game authority fix

Mini Game payout remains a single host-system path:

- overlay produces deterministic game type and complete ranking;
- host commits through `submitSystemIntent('resolve_minigame')`;
- obsolete player/seat submission is suppressed;
- same source event cannot pay twice;
- clients receive authoritative B$ through normal state sync.

## Retained audio / Mini Game behavior

- Eight supplied SFX: victory, news, card, step, money loss, money gain, dice, choice.
- Mini Game BGM is approved `03_City_Silly.ogg`.
- No fifth BGM; `track 1.MP3` is not used.
- Four approved BGM files remain checksum-locked and must not be re-encoded/substituted.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- CPU vs CPU RPS still receives full duel presentation.

## Retained movement / score rules

- Normal state packets do not own token coordinates during ordinary movement presentation.
- Snapshot resync and rematch command #0 may hard-snap to authoritative nodes.
- Human Job Hub has explicit token reconciliation to avoid the visual one-node-behind bug.
- Crossing READY pays salary and increments lap exactly once.
- Every player must complete one lap before final B$ scoring.
- Result waits for pending presentation and Mini Game economy.

## Determinism / authority invariants

- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Gameplay-critical wallet, lap, playOrder and Job state remain authoritative/checksum-safe.
- Snapshot resync must not replay stale presentation.
- Dice presentation always displays authoritative gameplay dice results.
- Original face files remain local and must not be silently uploaded/persisted.
- CPU remains a QA bot, not final AI.
- Jail skipped-turn / bail / escape mechanics remain intentionally undefined.

## Validated artifact

GitHub Actions run: `34801348509` / run `#1107`

Validated runtime/package SHA:
`f1e5ffc7f3f3cb4ed5e7ee6f12819215c0bd8265`

Artifact:
`mememe-playtest-0.1.38`

Artifact ID:
`10331532723`

Size:
`8,557,943 bytes`

Digest:
`sha256:04ffc83d71c54a22f27b846ba4fa2a62c70e545536c0c6d69bc7b653becf1947`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34801348509`

Full CI passed through artifact upload, including the 0.1.37 Mini Game host-system ownership regression and new 0.1.38 Choice-SFX/one-lap-copy regression.

## Runtime test focus

1. Exercise Route/Card/Target/Tactical/Setup/Settings and confirm choice SFX plays once per intentional confirmation.
2. Confirm normal dice and Roll For Order still use the dedicated dice cue.
3. Confirm Local Lobby and Setup display 0.1.38 and no obsolete three-round instruction.
4. Confirm Mini Game reward changes B$ exactly once.
5. Confirm P1 has no movement snap-back and Job Hub token reconcile remains correct.
6. Confirm final score waits for pending Mini Game payout when applicable.
7. Re-check all eight SFX and `03_City_Silly.ogg` in runtime.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.38_PROGRESS.md và docs/PLAYTEST_0.1.38.md. Current validated artifact là mememe-playtest-0.1.38, run #1107, runtime SHA f1e5ffc7f3f3cb4ed5e7ee6f12819215c0bd8265. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
