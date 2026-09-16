# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current candidate

**MVP 0.1.68.2 — Canonical Mobile UI Contract Implementation**

Manual status: **PENDING RON ACCEPTANCE**.

Canonical flow:
`Menu → Setup → Chọn luật → Roll For Order → Trận → Podium → Rematch`

Runtime:
`CareerMinigameBoardScene0682 as ActiveBoardScene`

Inheritance:
`0682 -> 0681 -> 068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

The last explicitly user-accepted HOST-authoritative rollback baseline remains 0.1.48. Never regress authority, replay/checksum determinism, stale-token protection, movement-actor camera lock, Jail/Hospital release semantics, Mini Game payout ownership or final-result/podium/rematch flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## Permanent UI / UX contract

Canonical rules:
`docs/CANONICAL_UI_UX_RULES.md`

Required principles include mobile-first readability, summary-first/detail-on-demand, compact idle HUD, expanded active HUD, strict modal ownership, viewport-safe bubbles, and touch/keyboard/controller parity.

Guards:
- `tests/canonical-ui-ux-contract.ts`
- `tests/canonical-ui-0682.ts`

Future UI must obey this contract unless Ron explicitly approves an exception.

## 0.1.68.2 changes

- active runtime moved to `CareerMinigameBoardScene0682`;
- idle player cards use compact scale/readability;
- current-turn player card expands and reveals one extra useful context line;
- Job Hub default cards show only D6 range, icon, name, salary summary and risk/identity tag;
- Job details open deliberately by touch/click, keyboard A/B/C or 1/2/3, and controller focus + A;
- detail closes by button, outside touch/click, Esc or controller B;
- controller B emits UI-only `mememe-ui-back`;
- blocking modal suppresses unrelated loose board narration;
- reaction bubbles use safe outer lanes, viewport clamping and two-line quote limits;
- gameplay RNG, authority and match-length rules are unchanged.

## Green functional checkpoint

Exact source SHA:
`9a7cad5e4498dc0c8bf679edb6dabaf1ddeb0308`

Main push CI:
- run `#2585` / `35068448867`;
- **FULL SUITE SUCCESS**.

Artifact:
- `mememe-playtest-0.1.68.2-canonical-mobile-ui`;
- ID `10434649932`;
- size `8,602,665 bytes`;
- SHA256 `fffa38f26a241532150112c1c86b8e19bd0f5e4fb7fd50f392256e5b313fa718`;
- expires `2026-09-30T07:26:25Z`.

## Public web checkpoint

Publisher:
- run `#51` / `35068448837`;
- **SUCCESS**.

Public mirror commit:
`c7a7639d46f1e1b82321e2bab9fd2be02cc7f433`

Bundle:
- `assets/index-CBHNVIRa.js`
- `assets/index-DdQGOELg.css`

Pages:
- run `#19` / `35068584696`;
- **SUCCESS**.

URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

## Manual acceptance priorities

1. Idle player cards compact and readable.
2. Current-turn card visibly expands and shows useful extra context.
3. Job Hub compact cards remain readable on phone.
4. Job detail opens/closes correctly with touch, keyboard and controller.
5. Job/News/Card blocking presentation has no legacy text leaking outside/behind it.
6. Reaction bubbles stay inside safe viewport lanes.
7. Menu → Setup → rules → Roll → match → Podium → Rematch completes normally.
8. Test 1 / 2 / 3 target laps.
9. Repeat Job and Jail/Hospital release interactions with CPU seats.
10. Mobile fullscreen / DOM alignment and Steam Deck controls remain healthy.
11. Keep watching the historical long-run token snap-back issue.

Do **not** call 0.1.68.2 user-accepted until Ron manually validates it.

Full details: `HANDOFF_CURRENT.md` and `docs/PLAYTEST_0.1.68.2_CANONICAL_MOBILE_UI.md`.

Do not merge PR #1.
