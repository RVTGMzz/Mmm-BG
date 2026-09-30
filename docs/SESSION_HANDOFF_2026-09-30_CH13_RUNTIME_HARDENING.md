# MMM - 2026-09-30 CH-13 POST-RUNTIME HARDENING

**TEST + RUNTIME EVIDENCE: PASS / PUBLIC BUILD UNCHANGED**

Canonical repo / branch:
- `RVTGMzz/Mmm-BG`
- `mmm-mvp-0.1-core`

Authority:
- public build: `0.1.70.4.33`
- production source that generated the public build: `46c411ef7ced227c16955ea9e8f4ea96739594a8`
- validated post-CH13 runtime-test HEAD: `0472e46a0c37ab4b6db930a38f4bab57006e77c9`
- CI #3382 / run `36662586775`: **SUCCESS**
- runtime evidence artifact: `11075216491`
- RC package artifact: `11074898703`
- compiled public mirror: `8617f61536e75db039cf69e918ccfc741c3137cd`
- Pages #80 / run `36623115256`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## Why this follow-up exists

CH-13 source was already complete. This pass did not add another feature. It hardened the exact acceptance surface that was still weak in automation: the transition from the one-time Mini Game rules screen into the compact gameplay screen.

The previous full-scene gate proved the rules screen itself, but it did not separately prove that:
- the rules body was actually removed before gameplay;
- repeated subtitle/rule chrome stayed hidden;
- BA CỬA exposed the expected 3 choices after the rules intro;
- the same transition still held under the 960x540 stress viewport.

## Commits in this hardening pass

- `de0d38328a0b03c2f435624c77c101e78dab1e18` - add `rulesplay` runtime mode and assert rules-to-gameplay cleanup.
- `1c6f1eecfa6e2cff81ae1cb59791efcd51e2dcc6` - wait for rules fade completion before freezing screenshot evidence.
- `0472e46a0c37ab4b6db930a38f4bab57006e77c9` - replace the strict alpha wait with a one-shot 240ms game-clock settle so the screenshot is fully opaque without creating a runtime waitlock.

## What the new runtime gate proves

At BA CỬA gameplay after the intro:
- `vf07-minigame-choice-prompt` exists and remains readable;
- exactly 3 `vf07-minigame-choice-box-*` objects exist;
- `vf07-minigame-result-body` from the rules screen no longer exists;
- the repeated subtitle is hidden;
- screenshots are retained at 1280x800 and 960x540.

The final evidence was manually inspected:
- rules screen at 960x540 is fully opaque, readable, fixed-font, and scrollable instead of shrinking;
- gameplay screen at 960x540 cleanly shows CỬA A / B / C with no stale rules wall;
- Card and News remain inside their canonical owner at 960x540 with no rarity `N` restored.

## Scope safety

This pass changed runtime test fixtures only. It did **not** change:
- gameplay rules or payout;
- economy or pacing;
- Character probabilities/passives;
- HOST/replay RNG authority;
- online room/reconnect ownership;
- Card/News production layout;
- Job production layout;
- public compiled output.

The public mirror therefore remains the already-published CH-13 build `8617f615...`, Pages #80.

PR #1 was rechecked and remains **Draft/Open**.

## What remains pending

Only human / real-device acceptance of public `0.1.70.4.33`.

Priority device checks remain:
- Character Select Vietnamese typography;
- Card / News alignment during actual reveal/animation;
- compact Job detail;
- Mini Game rules screen and the immediate gameplay screen after it;
- doubled result/ranking dwell time;
- BA CỬA when 2+ players are eliminated in the same round;
- Steam Deck 1280x800 and 960x540 stress behavior.

If new screenshots reveal a regression, fix the shared owner/layout rule rather than special-casing the reported content.

## Preserve

- PR #1 stays Draft/Open unless Ron explicitly asks to merge.
- no client `Math.random()`;
- HOST/replay remains authority for gameplay RNG and money mutation;
- Character probabilities remain 40/50/20/45/60 unless new playtest evidence supports rebalance;
- keep current economy/pacing;
- preserve canonical single-owner UI;
- fixed readable fonts; never shrink text only to fit;
- do not restore rarity `N`, runtime version chrome, long Job prose, or always-visible Mini Game rules.
