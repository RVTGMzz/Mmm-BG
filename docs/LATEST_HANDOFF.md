# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current candidate

**MVP 0.1.69 — First Impression Polish**

Manual status: **PENDING RON ACCEPTANCE**.

Canonical flow:
`Splash logo → Lobby → Setup → Chọn độ dài → Roll For Order → Trận → Podium → Rematch`

Runtime:
`CareerMinigameBoardScene069 as ActiveBoardScene`

Inheritance:
`069 -> 0682 -> 0681 -> 068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

The last explicitly user-accepted HOST-authoritative rollback baseline remains 0.1.48. Never regress authority, replay/checksum determinism, stale-token protection, movement-actor camera lock, Jail/Hospital release semantics, Mini Game payout ownership or final-result/podium/rematch flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## Permanent UI / UX contract

Canonical rules:
`docs/CANONICAL_UI_UX_RULES.md`

Required principles include mobile-first readability, summary-first/detail-on-demand, compact idle HUD, expanded active HUD, strict modal ownership, viewport-safe bubbles, touch/keyboard/controller parity, and **soft rounded surfaces as the default shape language**.

Guards:
- `tests/canonical-ui-ux-contract.ts`
- `tests/canonical-ui-0682.ts`
- `tests/first-impression-069.ts`

Future UI must obey this contract unless Ron explicitly approves an exception.

## 0.1.69 changes

- official logo is `public/assets/mememe-logo.webp`;
- new `SplashScene069` fades in the logo and waits for deliberate input before Lobby;
- Lobby, Setup and match-length selection remove dense prototype copy and prioritize larger readable text;
- match-length screen is now `CHỌN ĐỘ DÀI`, still backed by authoritative 1/2/3 target laps;
- player Job label is now owned inside the player card instead of inherited loose `ui.meta` text;
- current-turn card expands to `1.14`, idle cards remain compact;
- Job result is compact, one-icon presentation with `🎲 n → NHẬN VIỆC`;
- long inherited Job narration is suppressed while the blocking result owns attention;
- historical launcher assertions were rebased without weakening gameplay/authority guards;
- gameplay RNG, authority and economy rules remain unchanged.

## Green functional checkpoint

Exact functional source SHA:
`7da14cf1c2e4590e14ba79054c6e4f31fb34411b`

Main push CI:
- run `#2623` / `35077862286`;
- **FULL SUITE SUCCESS**;
- 0.1.69 gate, canonical UI contract, inherited 0.1.68.2 contract, face transform, package validation and all historical gameplay regressions PASS.

Artifact:
- `mememe-playtest-0.1.69-first-impression-polish`;
- ID `10439171510`;
- size `8,609,982 bytes`;
- SHA256 `c2a14310193c87af3a64c276d80157744478fb48f87954b54a7c568b1e097551`;
- expires `2026-09-30T09:11:07Z`.

## Public web checkpoint

Publisher:
- run `#70` / `35077862302`;
- **SUCCESS**.

Public mirror commit:
`81a76127b8b23a9213dbb53a9ac77efb5e7464e3`

Bundle:
- `assets/index-Bo9INSZJ.js`
- `assets/index-vZir17UH.css`

Pages:
- run `#21` / `35078035999`;
- **SUCCESS**.

URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

## Manual acceptance priorities

1. Official splash logo renders cleanly and deliberate tap/click enters Lobby.
2. Lobby / Setup / match-length screens are readable on mobile without dense tiny copy.
3. Rounded visual language feels consistent.
4. Job title stays inside each player HUD card.
5. Active card enlarges without overlap; idle cards remain compact.
6. Job result uses one icon and no loose narration leaks outside/behind it.
7. Job detail still works with touch, keyboard and controller.
8. News/Card/reaction surfaces respect safe bounds.
9. Full flow reaches Podium/Rematch for 1/2/3 target laps.
10. Mobile fullscreen and Steam Deck controls remain healthy.
11. Continue watching the historical long-run token snap-back issue.

Do **not** call 0.1.69 user-accepted until Ron manually validates it.

Full details: `HANDOFF_CURRENT.md`.

Do not merge PR #1.
