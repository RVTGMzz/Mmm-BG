# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current candidate

**MVP 0.1.68 — Vertical Slice Stabilization**

Manual status: **PENDING RON ACCEPTANCE**.

Canonical flow:
`Menu → Setup → Chọn luật → Roll For Order → Trận → Podium → Rematch`

Runtime:
`CareerMinigameBoardScene068 as ActiveBoardScene`

Inheritance:
`068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

The last explicitly user-accepted HOST-authoritative rollback baseline remains 0.1.48. Never regress authority, replay/checksum determinism, stale-token protection, movement-actor camera lock, Jail/Hospital release semantics, Mini Game payout ownership, or final-result/podium flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 0.1.68 changes

- `src/buildInfo.ts` is the one visible build identity source for Menu / Setup / Roll For Order / board.
- Setup has a dedicated **CHỌN LUẬT CHƠI** step with authoritative 1 / 2 / 3 target laps.
- `CareerMinigameBoardScene068` adds a presentation-only Job modal isolation guard so legacy Job/result/salary text does not bleed through the canonical popup.
- Mobile fullscreen shortcut is icon-only below Settings: `⛶` / `↙`.
- Steam Deck/browser gamepad navigation and dynamic mobile viewport handling remain.
- Podium / Rematch / Lobby endgame path remains inherited and regression-tested.
- `tests/vertical-slice-068.ts` protects version identity, entry flow, 1/2/3-lap semantics, Job modal isolation, endgame controls, mobile/Steam Deck wiring, CPU stress and long-match simulation coverage.

## Green functional checkpoint before handoff docs

Source SHA:
`7aed259ce1c7fc28478095b3a2f8eb1ba3201acc`

Main push CI:
- run `#2531` / `35058626805`;
- **FULL SUITE SUCCESS**.

Artifact:
- `mememe-playtest-0.1.68-vertical-slice`;
- ID `10431816769`;
- size `8,599,672 bytes`;
- SHA256 `0be10364a286b3d454df488d3efca76385487ae840356e771d2300134211944e`;
- expires `2026-09-30T05:13:57Z`.

## Public web checkpoint

Publisher for source `7aed259...`:
- run `#24` / `35058626777`;
- **SUCCESS**.

Public mirror commit:
`6127238874f9ec390cada84647df23e366726bbf`

Bundle:
- `assets/index-CJFcCihn.js`
- `assets/index-DdQGOELg.css`

Pages:
- run `#17` / `35058735057`;
- **SUCCESS**.

URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

The handoff-doc commits follow the functional checkpoint above. Before calling the docs-inclusive branch HEAD final, verify exact-HEAD CI/publisher again.

## Manual acceptance priorities

1. Job popup has no legacy text bleeding outside/behind it.
2. Menu → Setup → rules → Roll For Order → match → Podium → Rematch completes normally.
3. Test 1 / 2 / 3 target laps.
4. Reproduce several Jail/Hospital releases and Job interactions with CPU seats.
5. Mobile landscape/fullscreen: canvas + DOM stay aligned and fullscreen icon does not cover HUD.
6. Steam Deck/gamepad UI remains usable.
7. Long match has no freeze, double-roll, UI ghost or token snap-back.
8. `CHƠI LẠI` is clean and `VỀ LOBBY` returns correctly.

Do **not** call 0.1.68 user-accepted until Ron manually validates it.

Full details: `HANDOFF_CURRENT.md` and `docs/PLAYTEST_0.1.68_VERTICAL_SLICE.md`.

Do not merge PR #1.
