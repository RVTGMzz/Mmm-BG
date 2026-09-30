# MMM — 2026-09-30 CH-14.2 MINI GAME FLOW

**SOURCE + AUTHORITY GATES + BROWSER RUNTIME + PACKAGE + PUBLIC PAGES: PASS.**

Canonical authority:
- repo / branch: `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-core`
- build: `0.1.70.4.36`
- phase: `RELEASE CANDIDATE • CH-14.2 MINI GAME FLOW`
- validated source/test HEAD: `818e592eaa7092791103997bae637102503c7674`
- CI #3408 / run `36731988615`: **SUCCESS**
- runtime evidence artifact: `11105935846`
- package artifact: `11105856035`
- compiled public mirror: `6a4780c42f24f712726cbe61b28ffa1e69b69e19`
- Pages #83 / run `36733257627`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-14.2 behavior now live

1. **Job Hub compact copy**
   - removed the redundant `Đổ xúc xắc để chọn nghề` subtitle completely;
   - the D6 button remains the single clear action;
   - historical source/runtime gates now protect the absence of that line.

2. **Mini Game rules are participant-aware**
   - if at least one human seat participates, the rules screen remains until explicit `Enter / Space / A` or pointer confirmation;
   - if every participant is CPU, the rules screen is skipped and gameplay begins immediately;
   - browser runtime uses real keyboard input to advance the human rules gate instead of internally faking the transition.

3. **Character passive percentages are hidden presentation stats**
   - passive chance/roll values remain in authoritative event data for replay/debug/balance;
   - presentation no longer exposes `Tỷ lệ ...%`, `roll ...%` or any percentage copy;
   - no Character probability values were changed.

4. **Mini Game round information uses a horizontal result flow**
   - left side: player / choice / roll / current state;
   - right side: outcome;
   - shared horizontal owner is used by BA CỬA, PHAO ĐƠN, CẮT TOP XÚC XẮC and ĐUA 3 CHẶNG / overtime result moments;
   - goal is to keep decision state and outcome visible together instead of stacking a long vertical report that requires scrolling.

## Browser/runtime acceptance

Runtime evidence was checked after CI #3408:
- Job Hub 1280×800: removed subtitle is absent and the modal remains balanced;
- human Three Doors rules: rules remain visible with `ENTER / SPACE / A: TIẾP`;
- CPU-only Three Doors: skips rules and reaches the horizontal round result immediately;
- passive presentation: no `%` or roll/chance value is visible;
- Three Doors result: player choices appear on the left and result on the right;
- Phao Đơn choice surface remains contained with the CH-14.1 rounded-corner language;
- Cắt Top runtime surface exposes player D6 rows on the left and Top result on the right;
- full-scene canonical UI, Character Select, Match Recap, Settings Space and mobile landscape browser gates all PASS.

Relevant browser log:
- `[full-scene-ui] PASS canonical bodies survive normal super.create + inherited update chain`
- `[character-select-ui] PASS ...`
- `[match-recap-ui] PASS ...`
- `[settings-space-ui] PASS Space remains gameplay input while Enter keeps Settings keyboard access`
- `[mobile-landscape-entry] PASS ...`

## Regression / fixture hardening completed

The CH-14.2 pass also updated historical gates that intentionally expected the removed Job Hub subtitle or the pre-CH-14.2 rules call signature. M35 wording remained semantically unchanged and its test was made case-insensitive.

Browser fixtures were hardened so:
- human Mini Game rules are advanced by Playwright keyboard input;
- nested rules body lookup follows the real scroll-owner hierarchy;
- horizontal-flow left rows have stable names for runtime inspection;
- CPU-only flow is captured only after its reveal tween settles, preventing false alpha failures.

## Hard constraints preserved

- no gameplay RNG/economy/payout changes;
- no client `Math.random()`;
- HOST/replay authority unchanged;
- Worker/reconnect authority untouched;
- Character probabilities remain 40/50/20/45/60;
- M17/M26/M35/M44 payouts unchanged;
- CH-13, CH-14 and CH-14.1 behavior remains intact;
- PR #1 remains Draft/Open and must not be merged unless Ron explicitly asks.

## Remaining human acceptance

Physical Steam Deck acceptance is still human-owned. Recommended quick route:
1. open Job Hub and confirm the redundant instruction is gone;
2. enter a Mini Game with P1 involved and confirm rules wait for A/Space;
3. observe a CPU-only Mini Game and confirm no rules pause;
4. trigger a Character passive and confirm no hidden percentages appear;
5. inspect BA CỬA / PHAO ĐƠN / CẮT TOP / ĐUA 3 CHẶNG result screens for left-state/right-result readability.


## Main CH-14.2 commit chain

- `81d87a07` — feat: CH-14.2 refine Mini Game flow and hidden stats
- `5e902b89` — test: align Job Hub gate with CH-14.2 compact copy
- `69d3ab66` — fix: retain M35 reroll copy in horizontal flow
- `7c19a748` — test: keep M35 reroll copy case-insensitive
- `a05799ce` — test: align UI interaction gate with compact Job Hub
- `47362f94` — test: lock removed Job Hub subtitle in final modal gate
- `a6d0c82e` — test: align CH-13 rules gate with participant-aware intro
- `fb6ee405` — test: lock removed Job Hub subtitle in browser gate
- `5614ddf0` — test: align Mini Game runtime fixtures with CH-14.2 flow
- `2e0c7709` — test: drive CH-14.2 rules gate through real browser input
- `40013123` — test: resolve nested rules body in CH-14.2 browser transition
- `818e592e` — test: settle CPU-only Mini Game flow before runtime capture
