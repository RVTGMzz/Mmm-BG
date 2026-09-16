# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the last explicitly user-accepted HOST-authoritative rollback baseline.

Validated rollback artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, stale-token protection, movement-actor camera lock, Jail/Hospital release semantics, or final-result/podium/rematch flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.68.2

**0.1.68.2 — Canonical Mobile UI Contract Implementation**

Manual status: **PENDING RON ACCEPTANCE**.

Canonical full-match flow remains:
`Menu → Setup → Chọn luật → Roll For Order → Trận → Podium → Rematch`

This is presentation/readability work only. It deliberately adds no new gameplay RNG, economy rule, match-state mutation path, target-lap system or alternate authority path.

## 3. Runtime chain

Current runtime:
`CareerMinigameBoardScene0682 as ActiveBoardScene`

Inheritance:
`0682 -> 0681 -> 068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.68.2 must remain authority-free:
- no `Math.random`;
- no direct MatchState mutation;
- no new `submitIntent` path.

## 4. One visible build identity

Source of truth:
`src/buildInfo.ts`

Current visible version:
`0.1.68.2`

Menu, Setup, Roll For Order and board read visible build copy from `MEMEME_BUILD`. Do not reintroduce scene-local visible version strings.

## 5. Mandatory canonical UI / UX design contract

Permanent project rule:
`docs/CANONICAL_UI_UX_RULES.md`

Guards:
- `tests/canonical-ui-ux-contract.ts`
- `tests/canonical-ui-0682.ts`

All current and future MeMeMe screens, HUDs, modals, popups, cards and touch/keyboard/controller flows must obey this contract unless Ron explicitly approves an exception.

Core rules:
- mobile readability is the baseline;
- summary first, detail on demand;
- persistent HUD targets at most three meaningful readable lines;
- idle player HUD is compact;
- active-turn player HUD expands and may reveal one extra contextual line;
- active state must not rely on colour alone;
- Job Hub uses compact cards plus optional detail views;
- blocking modal owns attention and suppresses unrelated loose narration;
- text must remain inside its owner surface;
- floating bubbles/tooltips must respect viewport safe bounds;
- remove/shorten/move detail before shrinking font;
- touch, keyboard and controller must reach equivalent core actions/details;
- presentation work must not create gameplay RNG or authority.

## 6. 0.1.68.2 active / idle player HUD

`CareerMinigameBoardScene0682` implements the first canonical player-card behavior:
- idle scale `0.90`, quieter alpha and typography;
- active-turn scale `1.08`, stronger typography and animated turn transition;
- idle employed card keeps Job title/level concise;
- active employed card adds salary context;
- idle unemployed card hides useless `Chưa có nghề / Lương 0 / empty counters` copy;
- active unemployed card can show one meaningful status line.

This is presentation-only and does not alter turn ownership or game state.

## 7. Job Hub summary-first / detail-on-demand

`src/ui/JobChoicePicker.ts` now keeps the default A/B/C cards concise:
- A/B/C marker;
- authoritative D6 range;
- Job icon/art placeholder;
- Job name;
- Lv1/Lv2/Lv3 salary summary;
- one risk/identity tag.

Detailed progression, risk odds and flavour move into a deliberate detail surface.

Open detail with:
- touch/click on a Job card;
- keyboard A/B/C or 1/2/3;
- controller/Steam Deck D-pad focus + A confirm.

Close detail with:
- close button;
- outside touch/click;
- Esc;
- controller B.

Controller B is wired as a UI-only `mememe-ui-back` event. Detail interaction does not roll D6 or choose a Job. The host remains authoritative.

## 8. Modal ownership and overflow containment

0.1.68.2 strengthens modal ownership above the 068/0681 guards:
- canonical presentation or Job Hub modal owns the visual foreground;
- unrelated loose top-level board narration is suppressed while the modal is active;
- HUD is preserved where appropriate;
- visibility is restored after modal close;
- no presentation wrapper owns gameplay outcomes.

Human runtime confirmation is still required because CI cannot prove pixel-perfect overlap.

## 9. Reaction bubble safe lanes

`src/ui/ReactionSequencer.ts` now uses constrained outer lanes:
- width `272`;
- height `88`;
- logical safe margin `18`;
- final position uses `Phaser.Math.Clamp`;
- quote copy is limited to two lines.

Goal: stop reaction bubbles from leaving the viewport, running under the mobile control rail or fighting the dominant center modal.

## 10. Pregame / match length retained

Canonical entry flow:
1. Menu / Local Lobby;
2. Face Setup;
3. **CHỌN LUẬT CHƠI**;
4. choose `1 / 2 / 3 LƯỢT`, corresponding to `1 / 2 / 3 VÒNG / NGƯỜI`;
5. authoritative Roll For Order;
6. canonical board runtime.

This reuses authoritative `targetLaps`; there is no second match-length system.

## 11. Mobile / Steam Deck retained

- logical game remains 1280×720 with Phaser FIT;
- dynamic mobile viewport uses `100dvh / 100dvw`;
- scale refreshes on resize/orientation/`visualViewport`/fullscreen changes;
- fullscreen shortcut stays icon-only under Settings: `⛶` / `↙`;
- browser/Steam Deck gamepad navigation remains installed;
- controller B now supports UI back/close for canonical detail surfaces.

Landscape fullscreen remains the preferred mobile test mode.

## 12. Endgame / rematch retained

Inherited and regression-tested:
- final result transition;
- podium ranking/ties;
- winner reactions/spotlight;
- low-to-high reveal cadence;
- result controls unlock only after reveal;
- `CHƠI LẠI 🔁` starts a clean match;
- `VỀ LOBBY` returns correctly.

## 13. Green functional checkpoint

Exact functional source SHA:
`9a7cad5e4498dc0c8bf679edb6dabaf1ddeb0308`

Main push CI:
- run `#2585` / `35068448867`;
- **FULL SUITE SUCCESS**;
- compile/typecheck, replay, lockstep, authority, CPU autoplay, multiplayer Job Hub, Podium/Rematch, deterministic long-match simulation, all historical regressions, canonical UI contract, 0.1.68.2 runtime guard, package validation and artifact upload all PASS.

Artifact:
- `mememe-playtest-0.1.68.2-canonical-mobile-ui`;
- artifact ID `10434649932`;
- size `8,602,665 bytes`;
- SHA256 `fffa38f26a241532150112c1c86b8e19bd0f5e4fb7fd50f392256e5b313fa718`;
- expires `2026-09-30T07:26:25Z`.

Steam Deck Web Playtest for the same source also passed.

## 14. Public web deployment

Publisher for source `9a7cad5...`:
- `Publish compiled web mirror` run `#51` / `35068448837`;
- **SUCCESS**.

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Public commit:
`c7a7639d46f1e1b82321e2bab9fd2be02cc7f433`

Commit message:
`Publish compiled MeMeMe web playtest 9a7cad5`

Compiled bundle:
- JS `assets/index-CBHNVIRa.js`;
- CSS `assets/index-DdQGOELg.css`.

GitHub Pages:
- run `#19` / `35068584696`;
- **SUCCESS**.

Public URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Publisher exact-SHA CI gating, current-branch-HEAD gating and concurrency protection are mandatory. Do not weaken them.

## 15. Manual acceptance checklist

Use `docs/PLAYTEST_0.1.68.2_CANONICAL_MOBILE_UI.md`.

Priority runtime checks:
1. idle corner cards stay compact and readable;
2. current player card expands and reveals useful extra context;
3. previous active card returns cleanly to compact state;
4. Job Hub default cards are readable without dense tiny copy;
5. touch/click/keyboard/controller opens Job detail and closing it does not affect Job authority;
6. Job result and other blocking modals have no loose legacy text bleeding outside/behind them;
7. reaction bubbles stay inside viewport safe lanes and do not fight the center modal;
8. Menu → Setup → rules → Roll → match → Podium → Rematch remains intact;
9. test 1 / 2 / 3 target laps;
10. repeat Job and Jail/Hospital release interactions with CPU seats;
11. mobile fullscreen / DOM overlays remain aligned;
12. Steam Deck controller remains usable;
13. keep watching the historical long-run token snap-back issue.

Do **not** call 0.1.68.2 user-accepted until Ron manually validates the shipped runtime.

## 16. Next development direction

If 0.1.68.2 passes human runtime acceptance, use it as the canonical UI baseline and continue content depth without violating `docs/CANONICAL_UI_UX_RULES.md`.

Do not merge PR #1.
