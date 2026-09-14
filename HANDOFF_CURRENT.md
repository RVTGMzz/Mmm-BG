# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.38 - Choice SFX + One-Lap Copy Polish**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34801348509` / run `#1107`

Validated runtime/package SHA:
`f1e5ffc7f3f3cb4ed5e7ee6f12819215c0bd8265`

Artifact:
`mememe-playtest-0.1.38`

Artifact ID:
`10331532723`

Artifact size:
`8,557,943 bytes`

Digest:
`sha256:04ffc83d71c54a22f27b846ba4fa2a62c70e545536c0c6d69bc7b653becf1947`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34801348509`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.38_PROGRESS.md`
4. `docs/PLAYTEST_0.1.38.md`
5. `docs/MVP_0.1.37_PROGRESS.md`
6. `src/scenes/CareerMinigameBoardScene037.ts`
7. `src/scenes/CareerMinigameBoardScene.ts`
8. `src/ui/MiniGameOverlay.ts`
9. `src/audio/sfxController.ts`
10. `tests/choice-sfx-038.ts`
11. `tests/minigame-authority-037.ts`

## 0.1.38 polish

- `choice.ogg` feedback now covers Route/Branch selection, Card picker, Target picker, Tactical Choice, Setup confirmation and Settings interactions.
- Existing choice feedback remains on Local Lobby, Job Dice, Mini Game human choices and Enter Match.
- Dice actions still use the dedicated dice SFX.
- Setup and Local Lobby no longer advertise obsolete `MVP 0.1.31` / `demo 3 vòng` copy.
- Visible rule now matches authoritative gameplay: every player completes at least one lap before final B$ scoring.

## 0.1.37 authority cleanup retained

- Mini Game ranking is committed only through host-system `resolve_minigame`.
- Obsolete player/seat payout submission is suppressed.
- One Mini Game source event may pay exactly once.
- Joined clients receive authoritative B$ through normal state sync.

## Audio / Mini Game rules retained

- Eight event SFX: victory, news, card, step, money loss, money gain, dice, choice.
- Mini Game BGM is exactly approved `03_City_Silly.ogg`.
- Four approved BGM assets remain checksum-locked and must not be re-encoded/substituted.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- RPS animation still runs for CPU vs CPU.

## Movement / score rules retained

- Normal network state packets must not steal token coordinates from queued movement presentation.
- Snapshot/rematch may hard-snap tokens to authoritative nodes.
- Job Hub reconciles the human token so it does not remain visually one node behind.
- Every player must complete at least one physical lap before final scoring.
- If the last required lap ends on a Mini Game, final result waits until payout is committed.
- Crossing READY increments lap and pays current Job salary exactly once.

## Core invariants

- Starting wallet `200 B$`.
- Mandatory Job Hub with three unique A/B/C offers.
- Job D6: `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Snapshot resync must not replay stale presentation.
- Result/ranking waits for final presentation and pending Mini Game economy.
- Original face files remain local.
- CPU remains a QA bot.
- Thief `jailed` exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.

## Runtime test focus

1. Confirm choice SFX fires once on the newly covered picker/Settings actions.
2. Confirm normal dice uses dice SFX, not choice SFX.
3. Confirm Lobby/Setup show 0.1.38 and no `demo 3 vòng` copy.
4. Confirm Mini Game B$ changes exactly once.
5. Confirm P1 movement + Card/News has no snap-back.
6. Confirm Job Hub leaves the human token on the correct node.
7. Confirm final score waits for pending Mini Game payout.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.38_PROGRESS.md và docs/PLAYTEST_0.1.38.md. Current validated artifact là mememe-playtest-0.1.38, run #1107, runtime SHA f1e5ffc7f3f3cb4ed5e7ee6f12819215c0bd8265. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
