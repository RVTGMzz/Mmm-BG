# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.39 - Final B$ Lock + Result Clarity (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.39`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.39_PROGRESS.md`
3. `docs/PLAYTEST_0.1.39.md`
4. `docs/MVP_0.1.38_PROGRESS.md`
5. `src/scenes/CareerMinigameBoardScene039.ts`
6. `src/scenes/CareerMinigameBoardScene037.ts`
7. `src/scenes/CareerMinigameBoardScene.ts`
8. `src/ui/MiniGameOverlay.ts`
9. `src/core/twoTabSession.ts`
10. `src/core/authority.ts`
11. `tests/final-result-transition-039.ts`
12. `tests/choice-sfx-038.ts`
13. `tests/minigame-authority-037.ts`

## What changed in 0.1.39

### Final B$ lock transition

The existing authoritative result overlay remains the only source of winner/ranking truth. 0.1.39 adds a short presentation beat only after that overlay is actually eligible to render:

- queued movement/Card/News/reaction/Mini Game presentation must clear first;
- pending Mini Game payout must already be committed;
- the real result overlay is briefly hidden;
- `4/4 HOÀN THÀNH` and `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` are shown;
- a temporary blocker prevents clicks on hidden result buttons;
- the transition fades away and the authoritative result overlay fades in.

The transition does not recompute B$, rank, winner, lap state or payout. It submits no player/system command and introduces no random generation.

Victory SFX remains tied to the real result overlay and is not duplicated by the transition.

### New regression

`tests/final-result-transition-039.ts` locks the ended-only, queue-gated, presentation-only behavior and verifies `src/main.ts` runs the 0.1.39 scene.

## Retained 0.1.38 polish

- Choice SFX covers Route/Branch, Card hand, Target, Tactical Choice, Setup and Settings interactions.
- Existing choice feedback remains on Lobby, Job Dice, Mini Game human choices and Enter Match.
- Dice continues to use the dedicated dice cue.
- Local Lobby and Setup show current one-lap copy rather than obsolete `demo 3 vòng` instructions.

## Retained Mini Game / audio behavior

- Mini Game payout is committed only through host-system authority and may apply once per source event.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM is approved checksum-locked `03_City_Silly.ogg`.
- No fifth BGM and `track 1.MP3` is not used.
- Eight supplied SFX remain packaged/checksum-verified: victory, news, card, step, money loss, money gain, dice, choice.
- Four approved BGM assets must not be re-encoded/substituted.

## Retained movement / scoring rules

- Normal state packets do not own token coordinates during ordinary movement presentation.
- Snapshot resync and rematch command #0 may hard-snap to authoritative nodes.
- Human Job Hub has explicit token reconciliation to prevent one-node-behind visual state.
- Every player must complete at least one physical board lap before final B$ scoring.
- Crossing READY pays current Job salary and increments lap exactly once.
- If the last required lap lands on a Mini Game, final result waits for its payout.

## Core invariants / deferred mechanics

- Roll For Order: highest D6 acts first; only tied seats reroll.
- Stable player ID, face, color and ownership do not move when play order changes.
- Starting wallet `200 B$`.
- Mandatory Job Hub, three unique A/B/C offers, Job D6 mapping `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Snapshot resync must not replay stale presentation.
- Original face files remain local and must not be silently uploaded/persisted.
- CPU remains a QA bot.
- Thief may become `jailed`, but skipped-turn / bail / escape mechanics remain intentionally undefined.

## Validated artifact

GitHub Actions run: `34801911635` / run `#1139`

Validated runtime/package SHA:
`86764fa9aeda89067cb1abd29703985f5c993c04`

Artifact:
`mememe-playtest-0.1.39`

Artifact ID:
`10330908906`

Size:
`8,558,543 bytes`

Digest:
`sha256:2c7332429a1432bfb278bc2fef7e306f4cd87bb566ff9884f875fff2dd2ba2d1`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34801911635`

Full CI passed through artifact upload, including Mini Game host-system ownership, Choice-SFX/copy regression and final-result transition regression.

## Runtime test focus

1. Finish a match and confirm all final presentation clears before the 4/4 lock banner.
2. If final landing is Mini Game, confirm B$ payout commits before the lock banner/result.
3. Confirm result buttons are blocked while visually hidden.
4. Confirm displayed winner/rank/B$ are unchanged by the transition.
5. Rematch and confirm one transition occurs again for the next completed match.
6. Re-check P1 movement snap-back fix and Job Hub token reconcile.
7. Re-check all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.39_PROGRESS.md và docs/PLAYTEST_0.1.39.md. Current validated artifact là mememe-playtest-0.1.39, run #1139, runtime SHA 86764fa9aeda89067cb1abd29703985f5c993c04. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
