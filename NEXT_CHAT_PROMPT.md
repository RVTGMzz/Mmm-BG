# NEXT CHAT PROMPT — 2026-09-30 AFTER CH-13

Continue MMM from repo `RVTGMzz/Mmm-BG`, branch `mmm-mvp-0.1-core`.

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/SESSION_HANDOFF_2026-09-30_CH13_RC_UX_SIMPLIFY.md`
4. `docs/SESSION_HANDOFF_2026-09-30_CH13_RUNTIME_HARDENING.md`
5. Ron's newest screenshots / device feedback.

Current authority:
- build `0.1.70.4.33`
- public-build source `46c411ef7ced227c16955ea9e8f4ea96739594a8`
- validated automated-acceptance HEAD `a83c499bd62a850839533206188a77538e23c15b`
- CI #3383 / run `36670769258`: SUCCESS
- runtime evidence artifact `11078141883`
- package artifact `11078137006`
- public mirror `8617f61536e75db039cf69e918ccfc741c3137cd`
- Pages #80 / run `36623115256`: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

CH-13 source/CI, rules-to-gameplay hardening, and final automated/browser visual acceptance are complete. Character Select now has 1280x800 + 960x540 runtime screenshots. Do not redo these from scratch. Physical Steam Deck acceptance is still pending.

Locked CH-13 behavior:
- Character Select uses Vietnamese-safe system font stack.
- Card/News rarity badge `N` is removed.
- Board runtime version label is hidden.
- Card/News short copy is vertically balanced.
- Job detail is compact and salary-only; long special prose is removed.
- Mini Game rules show once at the beginning, then gameplay UI stays compact.
- final result/ranking dwell is 2x the previous timing.
- BA CỬA same-round eliminated players rank via internal RPS only; never selection time, Player ID or seat order.

Historical runtime fixture alignment after CH-13 is intentional:
`ffbd66ad` → `aba53ad2` → `ee35ac1a` → `fcf89774` → `46c411ef`.

Post-CH13 runtime hardening is also intentional:
`de0d3832` → `1c6f1eec` → `0472e46a`.
It proves the one-time rules screen is removed before compact BA CỬA gameplay and captures both 1280x800 and 960x540 evidence.

Next action:
- treat `a83c499b...` + CI #3383 as the automated/browser acceptance checkpoint;
- work from Ron's newest real-device screenshots or full-match observations;
- if there is no new device evidence, prioritize human/device acceptance of the public .33 build rather than adding features;
- do not claim physical Runtime PASS until Ron actually tests it.

Public link must be included at the end of each completed build/fix report:
https://ronvotri.github.io/MeMeMe-Web-Playtest/
