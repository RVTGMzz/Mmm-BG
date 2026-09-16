# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. Safety / rollback baseline

MVP **0.1.48** remains the last explicitly user-accepted HOST-authoritative rollback baseline.
Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, stale-token protection, movement-actor camera lock, Jail/Hospital release semantics, or final-result/podium/rematch flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.69

**0.1.69 — First Impression Polish**

Manual status: **PENDING RON ACCEPTANCE**.

Canonical flow:
`Splash logo → Lobby → Setup → Chọn độ dài → Roll For Order → Trận → Podium → Rematch`

This milestone is presentation/first-impression work only. It adds no gameplay RNG, no direct authoritative MatchState mutation and no alternate client authority path.

## 3. Runtime chain

Current board runtime:
`CareerMinigameBoardScene069 as ActiveBoardScene`

Inheritance:
`069 -> 0682 -> 0681 -> 068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.69 must remain authority-free:
- no `Math.random`;
- no new `submitIntent` path;
- no direct gameplay-result ownership.

## 4. Official logo and splash

Official logo asset:
`public/assets/mememe-logo.webp`

Entry scene:
`src/scenes/SplashScene069.ts`

The game now opens on the official MeMeMe logo, fades it in, then waits for deliberate player input before entering the Lobby. Do not replace this with a text-only title without explicit approval.

## 5. First-run UI simplification

0.1.69 removes dense tiny explanatory copy from the first-run flow.

Lobby:
- concise `CHỌN CÁCH CHƠI` hierarchy;
- `CHƠI NHANH`, Host and Join remain available;
- prototype-status paragraphs are removed from the main visual hierarchy.

Setup:
- concise face setup;
- short instruction: `Chạm ảnh để chọn mặt • Có thể bỏ qua`;
- technical implementation/privacy notes are not persistent visual copy.

Match length:
- title is `CHỌN ĐỘ DÀI`;
- `1 / 2 / 3 LƯỢT` still maps to authoritative `1 / 2 / 3 VÒNG / NGƯỜI`;
- cards use short labels `NHANH / CÂN BẰNG / DÀI`;
- no second target-lap system exists.

## 6. Player HUD ownership

0.1.69 fixes the recurring Job-label leak by changing ownership rather than nudging coordinates.

`CareerMinigameBoardScene069`:
- disables inherited loose `ui.meta` Job copy;
- owns a dedicated Job label inside the player-card surface;
- idle cards stay compact and show only immediately useful information;
- active-turn card scales to `1.14` and may reveal one extra contextual line;
- Job text must never render above or outside the player card.

This is presentation-only. Turn ownership still comes from authoritative match state.

## 7. Job result cleanup

0.1.69 Job result presentation:
- uses one Job icon/art symbol only;
- primary result is compact: `🎲 n → NHẬN VIỆC`;
- Job/salary context stays inside the result surface;
- inherited long Job narration is suppressed while the blocking result owns attention;
- no long flavour paragraph may leak behind the modal.

Detailed Job information remains available through the deliberate Job-detail interaction introduced in 0.1.68.2.

## 8. Permanent canonical UI / UX contract

Canonical rules:
`docs/CANONICAL_UI_UX_RULES.md`

Guards:
- `tests/canonical-ui-ux-contract.ts`
- `tests/canonical-ui-0682.ts`
- `tests/first-impression-069.ts`

Permanent rules include:
- mobile readability is the baseline;
- summary first, detail on demand;
- idle HUD compact, active HUD expanded;
- blocking modal owns attention;
- text stays inside the surface that owns it;
- remove/shorten/move detail before shrinking font;
- touch/keyboard/controller parity;
- **soft rounded surfaces are the default shape language**;
- harsh square corners require a deliberate exception;
- presentation wrappers remain authority-safe.

Future UI must not regress to dense tiny prototype copy or loose text overlays.

## 9. Historical regression guard rebasing

Historical tests that incorrectly required an old wrapper to remain the active runtime were rebased to accept the 0.1.69 wrapper.

Gameplay safeguards were retained, including:
- parity routing;
- camera center/movement-actor lock;
- release D6 semantics;
- resumed Job movement;
- expanded-board geometry;
- rounded-proxy cleanup;
- gamepad/web/fullscreen behavior;
- 1/2/3 target laps;
- CPU release fresh-roll watchdog;
- replay/checksum/authority invariants.

Do not restore old `X as ActiveBoardScene` assertions merely to make historical tests look unchanged.

## 10. Green functional checkpoint

Exact functional source SHA:
`7da14cf1c2e4590e14ba79054c6e4f31fb34411b`

Main push CI:
- run `#2623` / `35077862286`;
- **FULL SUITE SUCCESS**;
- compile/typecheck, replay, lockstep, authority, CPU autoplay, multiplayer Job Hub, all historical regressions, canonical UI contract, inherited 0.1.68.2 contract, 0.1.69 first-impression gate, face-transform bounds, package validation and artifact upload all PASS.

Artifact:
- `mememe-playtest-0.1.69-first-impression-polish`;
- artifact ID `10439171510`;
- size `8,609,982 bytes`;
- SHA256 `c2a14310193c87af3a64c276d80157744478fb48f87954b54a7c568b1e097551`;
- expires `2026-09-30T09:11:07Z`.

## 11. Public web deployment

Publisher for source `7da14cf...`:
- `Publish compiled web mirror` run `#70` / `35077862302`;
- **SUCCESS**.

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Public commit:
`81a76127b8b23a9213dbb53a9ac77efb5e7464e3`

Commit message:
`Publish compiled MeMeMe web playtest 7da14cf`

Compiled bundle:
- JS `assets/index-Bo9INSZJ.js`;
- CSS `assets/index-vZir17UH.css`.

GitHub Pages:
- run `#21` / `35078035999`;
- **SUCCESS**.

Public URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Publisher exact-SHA CI gating, current-branch-HEAD gating and concurrency protection are mandatory. Do not weaken them.

## 12. Manual acceptance priorities

0.1.69 still needs human visual validation, especially on mobile.

Priority checks:
1. Splash shows the official logo cleanly and requires deliberate input before Lobby.
2. Lobby / Setup / match-length screens use larger readable copy and no dense prototype paragraphs.
3. Soft rounded corners look consistent.
4. Player Job title stays inside its card for P1/P2/P3/P4.
5. Idle card is compact; active-turn card enlarges clearly without overlapping nearby UI.
6. Job result shows one icon only and compact `🎲 n → NHẬN VIỆC` copy.
7. No Job narration leaks behind/outside the result modal.
8. Job Hub detail remains touch/keyboard/controller friendly.
9. News/Card/reaction bubbles stay inside owner surfaces and viewport-safe lanes.
10. Full flow completes through Podium/Rematch for 1/2/3 target laps.
11. Mobile fullscreen and Steam Deck controls remain usable.
12. Keep watching the historical long-run token snap-back issue.

Do **not** call 0.1.69 user-accepted until Ron manually validates the shipped runtime.

## 13. Next step

Test the live 0.1.69 build. Fix visual/runtime regressions as 0.1.69.x hotfixes before starting new gameplay depth.

Do not merge PR #1.
