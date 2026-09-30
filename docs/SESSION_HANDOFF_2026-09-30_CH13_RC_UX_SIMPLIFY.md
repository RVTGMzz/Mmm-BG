# SESSION HANDOFF — 2026-09-30 — CH-13 RC UX SIMPLIFY

**CH-13 SOURCE + CI + RUNTIME GATE + PACKAGE + PUBLIC PAGES: PASS**

Canonical repo / branch:
- `RVTGMzz/Mmm-BG`
- `mmm-mvp-0.1-core`

Current public build:
- version: `0.1.70.4.33`
- phase: `RELEASE CANDIDATE • RC UX SIMPLIFY + VERIFIED AUTHORITY`
- validated source HEAD: `46c411ef7ced227c16955ea9e8f4ea96739594a8`
- CI #3379 / run `36622100043`: **SUCCESS**
- runtime evidence artifact: `11058648007`
- RC package artifact: `11058622902`
- compiled public mirror: `8617f61536e75db039cf69e918ccfc741c3137cd`
- Pages #80 / run `36623115256`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## Ron's CH-13 screenshot feedback now implemented

1. **Character Select font**
   - unified to a Vietnamese-safe `system-ui / Segoe UI / Arial` stack;
   - removed mixed rounded-font/fallback behavior and the 950-weight oddity.

2. **Card / News presentation**
   - rarity badge such as `N` is no longer rendered;
   - Board runtime version chrome `MMM CITY • ...` is hidden;
   - impact sticker was recentered;
   - short Card/News body copy is vertically balanced inside the owned text viewport;
   - canonical single-owner Card/News architecture remains intact.

3. **Job detail**
   - detail popup was shortened;
   - the long prose/special paragraph was removed from this view;
   - keep only the useful salary block and concise controls.

4. **Mini Game rules / runtime density**
   - rules are shown once at Mini Game start through `showRulesIntro()`;
   - gameplay phase hides repeated description/payout chrome and keeps the play surface compact;
   - do not restore the old always-visible rule wall.

5. **Mini Game result timing**
   - final ranking/result read time was doubled from the previous `2600/5000ms` policy to `5200/10000ms`;
   - this is intentional because Ron reported the old summary was too fast to read.

6. **BA CỬA simultaneous elimination**
   - ranking is **not** based on selection speed;
   - ranking is **not** based on Player ID / seat order;
   - if multiple players are eliminated in the same Three Doors round, only that eliminated group uses OẲN TÙ XÌ to order themselves;
   - the rule intro explicitly says: `Không tính thời gian chọn.`

## CH-13 test/runtime follow-up already completed

After the first CH-13 publish, several historical runtime fixtures needed alignment with the new rules-intro flow. These fixes are already committed and validated:
- `ffbd66ad...` — compact Job gate aligned to salary-only detail;
- `aba53ad2...` — M35 runtime proof waits past the new rules intro;
- `ee35ac1a...` — M35 reveal frame frozen for deterministic visual proof;
- `fcf89774...` — Mini Game runtime fixtures accelerated after rules intro;
- `46c411ef...` — CH-13 rules body resolved through the canonical scroll owner.

**Do not revert these fixture changes merely to satisfy older screenshots.** They exist because Mini Game now has a deliberate rules-intro phase.

## What is NOT pending in code

- no known uncommitted CH-13 source remains;
- no CI failure remains;
- no package/publish step remains;
- no public mirror publish remains;
- no gameplay/economy/Character/online-authority change is currently pending.

## What IS still pending

Only **human / real-device acceptance** of `0.1.70.4.33` remains.

Priority re-test surfaces:
- Character Select typography;
- Card / News alignment when cards animate/reveal in both directions;
- confirm rarity `N` is gone;
- compact Job detail;
- first Mini Game rules screen;
- gameplay screen after the rules screen disappears;
- doubled result/ranking dwell time;
- BA CỬA when 2+ players are eliminated in the same round;
- 1280×800 Steam Deck and 960×540 stress view.

If Ron provides new screenshots, fix the **shared owner/layout rule**, not only the exact content shown in one screenshot.

## Hard constraints to preserve

- PR #1 stays Draft/Open; never merge unless Ron explicitly asks.
- no client `Math.random()`;
- HOST/replay remains authority for gameplay RNG and money mutation;
- keep Character probabilities 40/50/20/45/60 unless new playtest evidence justifies rebalance;
- keep current economy/pacing unless new full-match evidence justifies change;
- preserve canonical single-owner UI and readable fixed fonts;
- do not shrink text just to make content fit;
- do not reintroduce rarity badge `N`, runtime version chrome, long Job prose, or always-visible Mini Game rule copy.

---

