# MMM — 2026-09-30 CH-15 PUBLIC ONLINE

**SOURCE + LIVE WORKER + BROWSER RUNTIME + PACKAGE + PUBLIC PAGES: PASS.**

Canonical authority:
- repo / branch: `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-dev`
- build: `0.1.70.4.38`
- phase: `RELEASE CANDIDATE • CH-15 PUBLIC ONLINE`
- validated source/test HEAD: `6ec56ccd0cc92ca72131ed5f3a7a275bc9334fcc`
- full CI #3422 / run `36743533044`: **SUCCESS**
- runtime evidence artifact: `11110879402`
- package artifact: `11111004466`
- Fast Publish #2 / run `36743533077`: **SUCCESS**
- compiled public mirror: `5a44add638a3877e39f74ed2847248f8b742680d`
- Pages #88 / run `36744538810`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-15 online behavior now live

1. **Public ONLINE entry**
   - ONLINE remains a first-class option in the main lobby.
   - menu probes the production Worker `/health` before Create/Join.
   - UI shows server-ready / unavailable state and supports retry.
   - failed health probes re-enable Create/Join buttons instead of leaving them stuck disabled.

2. **Create / Join / Ready / Start**
   - host creates a room through the existing Worker + Durable Object stack.
   - remote players join by room code and receive the lowest free P2–P4 seat.
   - host + remote players Ready before Start.
   - CPU Fill remains available for empty seats.
   - post-Start room authority, seat ownership and reconnect behavior remain the existing locked online authority.

3. **Invite link**
   - Online Room now exposes both `COPY MÃ` and `COPY LINK`.
   - invite URL uses `?room=ROOMCODE`.
   - opening that link pre-fills the ONLINE room field automatically.

4. **Reload / resume**
   - host token and client reconnect token are stored in tab-scoped `sessionStorage`.
   - after reload in the same tab, lobby shows `↩ TIẾP TỤC PHÒNG <CODE>`.
   - resume restores the same room / seat credentials instead of creating a new seat.
   - explicit leave / dead-room return clears stale resume state, avoiding ghost resume buttons.

5. **Existing online authority preserved**
   - no Worker/Durable Object gameplay authority rewrite.
   - no reconnect-token semantics changed.
   - no client RNG or B$ authority changes.
   - no lobby-after-Start resurrection.
   - avatar/seat ownership remains per-player.

## Online validation

Full CI #3422 passed all online/runtime gates:
- `0.1.70.4.19 live two-device reconnect + media relay smoke`: PASS
- `CH-08 live repeated reconnect ownership and ghost-seat stress`: PASS
- `0.1.70.4.21 live half-open socket replacement stress`: PASS
- `CH-15 public online entry and resume`: PASS
- `Transform-safe scroll viewport runtime gate`: PASS
- runtime UI evidence upload: PASS
- package `0.1.70.4.37`: PASS
- compiled mirror publish: PASS

Browser CH-15 acceptance covers:
- invite link room prefill;
- production Worker health-ready state;
- saved Host resume button;
- resume back into Online Room;
- COPY LINK presence.

## Fast public release lane

`.github/workflows/fast-public-online.yml` exists as a lightweight public release lane.
- first attempt failed only because `setup-node cache:npm` expected a lockfile that this repo does not have;
- fixed by removing npm cache and using `npm install --no-audit --no-fund`;
- Fast Publish #2 passed and published `.37`.
- Full CI #3422 later also passed and re-published the same canonical source build.

Do not confuse Fast Publish with authority validation: canonical validated source is still full CI #3422.

## Earlier CH-14.2 behavior remains locked

- Job Hub does not render `Đổ xúc xắc để chọn nghề`.
- human-involved Mini Games hold rules until Enter / Space / A / pointer confirmation.
- CPU-only Mini Games skip rules.
- Character passive percentages remain hidden presentation stats.
- BA CỬA / PHAO ĐƠN / CẮT TOP / ĐUA 3 CHẶNG use horizontal left-state/right-result presentation.
- CH-14.1 spotlight ownership, Space/Settings isolation, Card/News header fix and rounded Mini Game UI remain locked.
- CH-14 Match Recap remains live.

## Hard constraints

- PR #1 remains Draft/Open; never merge unless Ron explicitly asks.
- no client `Math.random()`.
- HOST/replay authority remains authoritative for gameplay RNG and B$.
- Character passive probabilities remain 40/50/20/45/60.
- Mini Game payouts/economy/pacing unchanged.
- Worker/reconnect authority must not be rewritten for presentation-only issues.

## Next human acceptance

Automated/browser/live-Worker acceptance is PASS. Physical two-device online acceptance is still human-owned.

Recommended real-device path:
1. device A → ONLINE → TẠO ONLINE;
2. COPY LINK or COPY MÃ;
3. device B → open invite / VÀO;
4. both Ready → Host Start;
5. verify P1/P2 each control only their own actions;
6. reload device B once and confirm same seat reconnect;
7. play through at least one Card/News, Job and Mini Game;
8. confirm no ghost lobby after Start and no duplicated seat.

If Ron sends screenshots/logs, fix only real regression at the shared online/session/layout owner level and add a regression gate.

---

# MMM — 2026-09-30 CH-14.2 MINI GAME FLOW

**SOURCE + AUTHORITY GATES + BROWSER RUNTIME + PACKAGE + PUBLIC PAGES: PASS.**

Canonical authority:
- repo / branch: `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-dev`
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

---

# MMM — 2026-09-30 CH-14.1 RUNTIME POLISH

**SOURCE + AUTHORITY GATES + BROWSER RUNTIME + PACKAGE + PUBLIC PAGES: PASS.**

Canonical authority:
- repo / branch: `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-dev`
- build: `0.1.70.4.35`
- phase: `RELEASE CANDIDATE • CH-14.1 RUNTIME POLISH`
- validated production/test HEAD: `93cf43e71fcde4bf4ca287b821ba47853341d300`
- CI #3396 / run `36699807175`: **SUCCESS**
- runtime evidence artifact: `11089534356`
- package artifact: `11089349661`
- compiled public mirror: `97c32a881c22da2a73827804986b32ca48d62efd`
- Pages #82 / run `36700549046`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-14.1 fixes

1. **Active-player spotlight no longer advances early**
   - visual highlight follows the current presentation actor while that action chain is still playing;
   - only falls back to authoritative next-turn player after presentation is done;
   - shared `resolveCameraActor0632` is now used for token halo and compact/mobile HUD ownership.

2. **Space no longer opens Settings from stale DOM focus**
   - Settings trigger releases stale focus;
   - when Settings is closed, Space browser-default click on a focused Settings control is suppressed without stopping key propagation;
   - Phaser/gameplay still receives Space as interact/confirm;
   - browser runtime proof: `[settings-space-ui] PASS Space remains gameplay input while Enter keeps Settings keyboard access`.

3. **Card + News shared header fixed**
   - shared kicker is vertically centered inside the colored header band;
   - canonical Card/News roots are excluded from historical 0.1.63 cinematic child inflation;
   - this removes the exact runtime drift `-123 × 1.14 = -140.22` that pushed the header copy back toward the top stroke;
   - applies generically to both `card-presentation-card` and `news-presentation-card`.

4. **Mini Game UI rounded-corner pass**
   - all internal Mini Game surfaces now use shared rounded Graphics helpers/tokens;
   - shell radius 30, regular surface radius 24, chip radius 16;
   - choice cards, privacy rail, result paper/badge, majority rows/result, RPS cards, ranking paper/ribbon and dynamic resized shells all keep rounded geometry;
   - the only raw Rectangle intentionally left in `MiniGameOverlay` is the fullscreen dark backdrop.

## Runtime / visual acceptance

Browser gate completed successfully:
- full-scene Card / News / Job / Job wait / Job detail / ranking / majority / rules / rulesplay / passive: PASS;
- Character Select 1280×800 + 960×540: PASS;
- Match Recap 1280×800 + 960×540: PASS;
- Settings Space regression: PASS;
- mobile landscape entry: PASS.

Manual artifact inspection:
- Card 1280×800 and 960×540: header label centered, no top-stroke collision;
- News 1280×800: same shared header alignment;
- Three Doors choice screen: shell, header, three cards and privacy rail visibly rounded;
- majority result: rows, result panel and outer shell visibly rounded;
- ranking: podium paper/ribbon and outer shell visibly rounded;
- no observed overflow/crop regression in inspected evidence.

## Regression history during this pass

- CH-04D and CH-11 historical tests originally expected raw Mini Game Rectangles; gates were aligned to the intentional rounded Graphics owner rather than reverting the new UI.
- Runtime Graphics bounds were exposed to the browser gate so rounded surfaces are tested rather than assumed.
- A real browser failure revealed the old 0.1.63 cinematic inflation still touching canonical Card/News. That writer is now explicitly bypassed for the canonical roots.

## Hard constraints preserved

- no gameplay RNG/economy/payout changes;
- no client `Math.random()`;
- HOST/replay authority remains unchanged;
- Worker/reconnect authority untouched;
- Character probabilities remain 40/50/20/45/60;
- CH-13/CH-14 behavior remains intact;
- PR #1 remains Draft/Open and must not be merged unless Ron explicitly asks.

## Remaining human check

Physical Steam Deck acceptance is still human-owned. Recommended quick pass:
P1 roll/move → confirm spotlight stays P1 through animation/Card/News → press Space with Settings closed → play one Mini Game → inspect rounded surfaces → open Settings only with Start/Esc.

---

# MMM — 2026-09-30 CH-14 MATCH RECAP

**CH-14 SOURCE + ALL CI GATES + BROWSER RUNTIME + PACKAGE + PUBLIC PAGES: PASS.**

Canonical authority:
- repo / branch: `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-dev`
- build: `0.1.70.4.34`
- phase: `RELEASE CANDIDATE • CH-14 MATCH RECAP`
- validated source HEAD: `3e3cbef1002c51376ad661c8a5ebe06a7d835996`
- CI #3389 / run `36683250579`, attempt 2: **SUCCESS**
- runtime evidence artifact: `11083448053`
- package artifact: `11083408087`
- compiled public mirror: `846dd16e24eae571661cc901188e5c50ae27e2a0`
- Pages #81 / run `36684224672`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-14 behavior now live

- Final Podium keeps its existing authority and buttons.
- A new `✨ XEM TỔNG KẾT` action opens a presentation-only recap after the match.
- Recap reads the existing authoritative `MatchState.eventLog`; it does not mutate match state, B$, ranking, RNG, economy or online authority.
- P1–P4 tabs show final B$, match delta, Character, Job, Mini Game results, Cards used/targeted, News exposure, Jail/Hospital visits, Character passive activations, Lottery and salary totals.
- Each player receives one playful presentation-only award such as `ĐẠI GIA`, `VUA MINI GAME`, `KHÁCH QUEN BỆNH VIỆN`, etc. Awards never affect gameplay.
- The right column selects up to eight meaningful moments from the authoritative event log and preserves chronological order.
- Steam Deck/controller owner recognizes the recap modal; keyboard left/right and close controls are also wired.

## Runtime / visual acceptance

Browser evidence was checked at both target sizes:
- 1280×800 Steam Deck target: PASS;
- 960×540 stress target: PASS;
- four player tabs remain contained;
- player stats remain inside the left panel;
- timeline remains inside the right panel;
- no font shrinking hack, no overflow, no crop observed.

CH-14 runtime fixture is now part of the normal browser regression gate.

## CI cleanup completed during CH-14

Historical RC gates CH-09, CH-10 and CH-11 had hard-coded `.33` version checks. They are now version-forward for the canonical `0.1.70.4.x` line instead of breaking every legitimate RC bump. Their actual branding, authority and UI assertions remain intact.

A CH-08 live reconnect stress attempt timed out once at cycle 3 client→host, while the live smoke immediately before it passed. A rerun passed CH-08 cleanly, so Worker/reconnect authority was not changed.

The first #3389 attempt pushed the compiled mirror successfully and then GitHub marked the publish step cancelled after `git push`. Mirror commit `846dd16...` and Pages #81 both succeeded. CI #3389 attempt 2 then completed fully with **SUCCESS**.

## Hard constraints preserved

- PR #1 remains Draft/Open; never merge unless Ron explicitly asks.
- no client `Math.random()` added;
- HOST/replay remains authority for gameplay RNG and money mutation;
- Character probabilities stay 40/50/20/45/60;
- Mini Game payouts and economy/pacing are unchanged;
- CH-13 Card/News single-owner, compact Job detail, one-time Mini Game rules, result dwell and BA CỬA tie-ranking behavior remain locked.

## What remains

- Real-device / human acceptance of CH-14 is still pending. Do not claim physical Steam Deck PASS until Ron actually tests the public build.
- Priority human path: finish one match → Podium → XEM TỔNG KẾT → inspect all P1–P4 tabs → close recap → Rematch/Lobby.
- If screenshots expose a layout problem, fix the shared recap owner/layout rule rather than one exact text string.

---

# MMM - 2026-09-30 CH-13 FINAL AUTOMATED ACCEPTANCE

**AUTOMATED / BROWSER RUNTIME VISUAL ACCEPTANCE: PASS. PHYSICAL STEAM DECK ACCEPTANCE: STILL PENDING.**

Canonical record:
- `docs/SESSION_HANDOFF_2026-09-30_CH13_FINAL_AUTOMATED_ACCEPTANCE.md`
- validated automated-acceptance HEAD: `a83c499bd62a850839533206188a77538e23c15b`
- CI #3383 / run `36670769258`: **SUCCESS**
- runtime evidence artifact: `11078141883`
- RC package artifact: `11078137006`
- compiled public mirror remains `8617f61536e75db039cf69e918ccfc741c3137cd`
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

What this final automated pass adds:
- Character Select now has a real browser runtime gate at both 1280x800 and 960x540.
- The gate opens the live SetupScene Character Select, verifies exactly four starter cards + RANDOM, and rejects panel/card overflow.
- It locks the Vietnamese-safe `system-ui / Segoe UI / Arial` stack and rejects the retired rounded-font fallback.
- Runtime screenshots were manually reviewed after CI; the five-card row stays contained and readable at both target sizes.
- Existing CH-13 Card/News, compact Job, one-time Mini Game rules, rules-to-gameplay transition, majority result and ranking evidence remain visually clean in the same artifact.

No production gameplay, economy, Character probability, online authority, RNG, payout or compiled public output changed.

What remains:
- only human / physical-device acceptance on Steam Deck or another real device;
- do not call physical Runtime PASS until Ron actually plays it;
- do not reopen CH-13 code without new real-device evidence.

---

# MMM - 2026-09-30 CH-13 POST-RUNTIME HARDENING

**RUNTIME ACCEPTANCE HARDENING: PASS. PUBLIC BUILD REMAINS 0.1.70.4.33.**

Canonical hardening record:
- `docs/SESSION_HANDOFF_2026-09-30_CH13_RUNTIME_HARDENING.md`
- validated runtime-test HEAD: `0472e46a0c37ab4b6db930a38f4bab57006e77c9`
- CI #3382 / run `36662586775`: **SUCCESS**
- runtime evidence artifact: `11075216491`
- RC package artifact: `11074898703`
- compiled public mirror remains `8617f61536e75db039cf69e918ccfc741c3137cd`
- Pages remains #80 / run `36623115256`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

New runtime proof now locks the CH-13 transition from the one-time Mini Game rules screen into compact BA CỬA gameplay:
- exactly 3 choice cards appear;
- the old rules body is destroyed before gameplay;
- repeated subtitle/rule chrome stays hidden;
- evidence exists at 1280x800 and 960x540;
- the rules screenshot is captured only after its fade settles, so evidence no longer freezes at low alpha.

No production gameplay, economy, Character, online authority, RNG, payout, or public compiled output changed in this hardening pass.

---

# MMM — 2026-09-30 CH-13 RC UX SIMPLIFY HANDOFF

**CH-13 SOURCE + CI + RUNTIME GATE + PACKAGE + PUBLIC PAGES: PASS**

Canonical repo / branch:
- `RVTGMzz/Mmm-BG`
- `mmm-mvp-0.1-dev`

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

# MMM — 2026-09-29 UI DENSITY + MINI GAME HEADER RHYTHM CH-12

**RUNTIME UI FIX + BROWSER VISUAL + PUBLIC PAGES: PASS**

Build: `0.1.70.4.32`

Fixed from Ron's real-device screenshots:
- Job detail: salary label and Lv1/Lv2/Lv3 values are separate readable rows; `LƯƠNG / VÒNG` is 19px and no longer compressed into the salary line.
- Job waiting/result card: pending Job offer uses a single large 🎲 and hides the redundant header chip/bag icon.
- PHỔ ĐÔNG NGƯỜI: result is now a single horizontal **TRẠNG THÁI → KẾT QUẢ** layout; no second long vertical result panel and no scroll required for the normal four-player round.
- concealed-choice screen: prompt/helper/cards were lowered to create breathing room below the header.
- Mini Game header rhythm: yellow header shortened and moved up; payout line sits in its own gap instead of touching the header edge.

Safety / architecture:
- presentation-only pass; no gameplay RNG, payout, economy, Character percentages, Worker/reconnect or HOST authority changed.
- canonical single-owner UI remains intact.
- fixed readable typography is preserved; no font-shrink-to-fit workaround.
- VF-07 regression gate was updated to guard the new horizontal majority flow rather than the retired vertical reveal implementation.

Validation:
- source checkpoint: `9fb57cc1962e0042095b361e69ba765b95c7059e`
- CI #3373 / run `36551417638`: **SUCCESS**
- runtime evidence artifact: `11024319353`
- build artifact: `11024389138`
- compiled public mirror: `91fcf2efde890b7afc63eacfe1e6ffed556ba582`
- Pages #79 / run `36552170617`: **SUCCESS**
- manually inspected at 1280×800 and 960×540: Job detail, Job waiting card, concealed choice and PHỔ ĐÔNG NGƯỜI result.

Public test:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

Next:
- treat this as the current visual checkpoint;
- only change these surfaces again if real-device evidence shows a concrete regression;
- continue release-candidate playtest from the public build above.

---

# September 28 new-chat transfer after M35

Canonical next-chat file:
- `docs/NEXT_CHAT_PROMPT_2026-09-28_AFTER_M35.md`

Current repo/gameplay checkpoint:
- repo HEAD before transfer: `850691ee69c57abd551e314486fda03b7eae4dce`
- M35 final validated: `e62d0de4928f3f117518cc4b350cd585c4b60a69`
- CI #3332 SUCCESS
- Pages #66 SUCCESS

Next gameplay target: **M44 NƯỚC RÚT CUỐI VÒNG**. M17/M26/M35 are complete and must not be redone. Preserve M44 payout 25/15/5/5, HOST payout ownership, deterministic/replay-safe logic, common 2-player RPS final, and current canonical UI ownership.

---

# September 28 M35 CẮT TOP XÚC XẮC gameplay upgrade

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_CUT_TOP_DICE_0713.md`

**GAMEPLAY + CI + BROWSER VISUAL + PUBLIC PAGES: PASS**

M35 TOP 2 HOẶC VỀ KHÔNG now uses **CẮT TOP XÚC XẮC** for 3+ players. Everyone rolls D6; the two highest scores become finalists. A tie crossing the Top-2 cutoff rerolls only the tied group, never by Player ID. Final two use OẲN TÙ XÌ. Payout remains 30/20/0/0.

- gameplay `6a0d7108b7cb9cdbde9f9859f0d23cac3b27de6d`
- final validated `e62d0de4928f3f117518cc4b350cd585c4b60a69`
- CI #3332 SUCCESS
- mirror `1bfed8711f0e72212cecc082d893fc51d18a3b82`
- Pages #66 SUCCESS

---

# September 28 M26 PHAO ĐƠN gameplay upgrade

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_SOLO_BUOY_0712.md`

**GAMEPLAY + CI + BROWSER VISUAL + PUBLIC PAGES: PASS**

M26 CÒN THỞ CÒN TIỀN now uses **PHAO ĐƠN** for 3+ players: choose Phao 1/2/3 secretly, only buoys with exactly one occupant survive; crowded buoys eliminate their occupants; no survivor/no elimination means replay; final two use OẲN TÙ XÌ. Payout stays 20/15/10/5 and wallet mutation remains HOST-owned.

- source `a185d89760601b93a2ae7e75378cf1b58d282584`
- validated runtime `f3d9bbefca5d42072170b13b4675e49cb3f3c3f3`
- CI #3329 SUCCESS
- mirror `8a9cef685e515d9d8e83042de8afd0ab7a5f2a01`
- Pages #64 SUCCESS

---

# September 28 M17 BA CỬA gameplay upgrade

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_THREE_DOORS_0711.md`

**GAMEPLAY + CI + BROWSER VISUAL + PUBLIC PAGES: PASS**

M17 KÈO ALL-IN now uses BA CỬA for 3+ players: choose A/B/C secretly, D6 maps 1–2=A / 3–4=B / 5–6=C, correct door survives, nobody/all hit means replay, final two use OẲN TÙ XÌ. Payout stays 35/10/5/0 and wallet mutation remains HOST-owned.

- source `74507ed8a067a52cf451285bc7add0a9be9741a7`
- visual gate `bad77d6b00fba46019ddfc66e35e80d4eee661b1`
- CI #3327 SUCCESS
- mirror `c283a1ddcf283953eef173c0467190cba516a2b5`
- Pages #63 SUCCESS

---

# September 28 Mini Game + Job readability pass

**AUTOMATED + BROWSER VISUAL REVIEW: PASS / REAL DEVICE ACCEPTANCE PENDING**

- Canonical UI source: `50921f723b6526cab57c2a42c9a153619b15ead0`
- Validated test HEAD: `1f05279791acfcbd8c17bdc539dcc3a4c6da6532`
- CI #3325 / run `36379190888`: **SUCCESS**, 137/137
- Runtime evidence artifact: `10952510121`
- Public mirror: `64f61208de1299afb686c5fd4b33b1512f19b5eb`
- Pages #62 / run `36379367997`: **SUCCESS**
- Public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

Scope was intentionally presentation-only. No gameplay authority, Host RNG, Worker/reconnect, Mini Game resolution or Job selection logic changed.

Mini Game:
- shell widened subtly to 960×570;
- concealed-choice prompt/helper/cards/labels enlarged without undoing the approved spacing;
- result/ranking surfaces widened; ranking rows are 24px;
- duel names/icons/verdict received a small readability lift;
- 1280×800 and 960×540 runtime screenshots reviewed.

Job:
- Hub widened to 1000×552 and cards to 264×242;
- title, card names, salaries, detail hints and dice CTA enlarged;
- Job detail widened to 820×420 with 30px title / 19px salary / 18px special copy;
- result card widened to 840px with 32px title and 23px body;
- dedicated Job Hub + Job Detail browser screenshot gates added;
- salary clipping on 960×540 was caught during visual review and fixed before publish.

Important: preserve the 2026-09-28 canonical single-owner architecture. Do not reintroduce legacy presentation wrappers or per-frame scavengers. Future visual fixes must edit the canonical producer and extend runtime evidence.

---

# September 28 mobile landscape entry no-deadlock

Newest transfer:
- `docs/SESSION_HANDOFF_2026-09-28_MOBILE_LANDSCAPE_ENTRY.md`

Validated source `1e40fb0c64b0f6a1b5563e403c4ec16e4c91193c`, CI #3317 SUCCESS, mirror `59cc3fb0e93eaef45f33d08e30fefa860268395e`, Pages #59 SUCCESS.

Portrait mobile can no longer remain trapped forever at XOAY NGANG when the browser does not support hardware orientation lock.

---

# September 28 canonical UI single-owner reset

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-28_UI_SINGLE_OWNER_RESET.md`

Runtime `1b19b9a7ecfc59b86070db6587e29823fd0c0f74`, CI #3314 SUCCESS (137/137), mirror `22cdc87e5a8f051c702fc512423f2816518042b4`, Pages #58 SUCCESS.

The active scene now disables historical presentation reflow/guard/scavenger writers through a canonical ownership cut-over. A new full-scene Playwright gate uses normal `super.create()` and inherited `update()`; Card/News/Job/Mini Game ranking bodies survive that full chain. Real-device acceptance is still pending.

---

# September 27 runtime UI regression checkpoint

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-27_RUNTIME_UI_REGRESSION.md`

Ron supplied 9 real-device screenshots after Pages #55. Runtime visual acceptance is **FAIL** despite CI #3304 green. Job/Card bodies can disappear, News body can be almost completely clipped, Mini Game ranking loses the left edge, and several screens still use tiny secondary text with excessive empty space.

Next session must repair the shared scroll viewport coordinate-space/mask design generically before any more cosmetic tuning. Keep fixed readable fonts and vertical scrolling for long copy; use compact/adaptive height for short copy.

---

# 0.1.70.4.29 fixed type + scroll containment

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-27_SCROLLABLE_UI_070429.md`

Validated source `d13beed6cbb880487c50cd239359d4a4d91311fc`, CI #3304 SUCCESS, public mirror `6c31a5af7d3c20ffb1b604590a8e9c6b244b5a96`, Pages #55 SUCCESS.

Ron explicitly rejected font shrinking as the overflow solution. Long Card/News, Job and Mini Game copy now stays at a fixed readable scale inside a hard clipped viewport and can be dragged/scrolled vertically. Legacy Mini Game reflow wrappers no longer touch canonical VF-07 text.

---

# September 27 CH-04 Character reaction checkpoint

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-27_CHARACTER_CH04.md`

Validated gameplay source:
- `0ec100f50c12e5e60f13ffa7ff74756fa71bc88b`
- CI #3292 SUCCESS
- mirror `19a7e87d79e5343fc45137704e1bee65d13b17a6`
- Pages #51 SUCCESS

CH-04A/B make the resolved Character own contextual presentation reactions across Card/News plus Job, Mini Game entry, salary and Lap Shuffle. No passive gameplay is active. Next safe build is CH-04C Jail/Hospital and result-moment reactions; keep CH-05 blocked on explicit balance approval.

---

# MMM — 2026-09-27 CURRENT HANDOFF

Canonical new-chat transfer:
- `docs/SESSION_HANDOFF_2026-09-27_UI_STEAMDECK.md`

Latest validated gameplay/UI build before this documentation-only handoff:
- source `d3f3c4f0ca04df03dc92ab5b222690e3568a96a8`
- CI #3278: **SUCCESS**
- public mirror `0fb399d83e52230fc9eadb960c62b0ac9c737987`
- Pages #45: **SUCCESS**

Next implementation priority: **Steam Deck fullscreen/viewport pass** from Ron's 2026-09-27 runtime photo. Card/News, Mini Game/ranking and Job changes are documented in the canonical transfer. Runtime visual acceptance remains pending.

---

# Mmm-BG — Latest Handoff

## September 25 session transfer — READY FOR NEW CHAT

Canonical transfer file:
- `docs/SESSION_HANDOFF_2026-09-25_VF06.md`

Validated runtime source remains:
- `e9a1fb44c8b628e93c91b824f7c31ed0cbb11f6f`
- CI #3244 / run `36096638993`: **SUCCESS**
- public mirror `731a97eca5a89e40844d02623cd9936aad4c4862`
- Pages #33 / run `36096743757`: **SUCCESS**

New-chat priority: read Ron's newest runtime feedback first; VF-06 Job Hub still needs device/visual acceptance. Card/News containment must remain root-level and generic. CH-02G face-fit acceptance remains parallel/pending.

## September 25 VF-06 JOB HUB sample

The canonical Job Hub now shares the MeMeMe toy-like visual family:
- cream/cocoa shell;
- butter header;
- large Job icons;
- distinct A/B/C card accents;
- one concise salary row;
- large icon separate from the Job name in detail view;
- existing input/authority flow preserved.

Validation:
- validated VF-06 HEAD: `e9a1fb44c8b628e93c91b824f7c31ed0cbb11f6f`
- MMM MVP CI #3244 / run `36096638993`: **SUCCESS**
- retained Job layout / authority / keyboard / Steam Deck gates: **SUCCESS**
- VF-06 gate: **SUCCESS**
- compiled public mirror: `731a97eca5a89e40844d02623cd9936aad4c4862`
- GitHub Pages #33 / run `36096743757`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Runtime visual acceptance remains pending.

## September 25 VF-05.1 LÁ BÀI sample

The first canonical Card sample now follows the same MeMeMe material family as VF-05 News while keeping a more kinetic sticker/cutout personality.

- cream/cocoa frame;
- lavender header;
- soft lavender body inset;
- butter impact sticker well;
- coral/aqua accent tabs;
- same canonical owner, safe reaction lanes and bounded text contract;
- presentation-only change.

Validation:
- VF-05.1 source: `39c1e0baa03fbb918b40c69af4881ed7f9a0a45f`
- MMM MVP CI #3240 / run `36095722761`: **SUCCESS**
- VF-05 News + VF-05.1 Card gates: **SUCCESS**
- Card/News containment and presentation-owner gates still pass in the same run
- compiled public mirror: `042e9c05f042b61d2e6922e0c9b31ba5a5939d0b`
- GitHub Pages #32 / run `36095790022`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Runtime acceptance remains required before broad propagation.

## September 24 Card/News content containment root fix

Runtime screenshots from Ron exposed the same long-standing class of failure on both **Kéo Hai Cửa** and **Hoàn Tiền Bất Ngờ**: description/result copy was being drawn outside the canonical modal while the modal body looked empty.

Root cause and fix:
- an inherited producer could combine description + arrow-summary into one loose Text object, bypassing the older whole-string semantic guard;
- the new semantic ownership helper compares line-by-line and suppresses only loose Text whose meaningful lines all belong to the active Card/News;
- canonical modal Text/Graphics are now created off the Scene Display List and rendered only through the single owner container;
- the owner root is scroll-factor locked;
- title/body use hard max-line + fixed-size adaptive bounds;
- runtime logic is content-agnostic and does not special-case the reported card/news titles.

Validated source: `8a1ca0b37c10c44d9cfb8b92607233728408761a`  
CI #3239: **SUCCESS**  
Mirror: `e95b7caf9d190387d3327ebf66a6971499390974`  
Pages #31: **SUCCESS**

## September 24 CH-02G KHÓC NHÈ neutral layered runtime proof

The Character system is now beyond schema-only work: **KHÓC NHÈ / neutral** has a real layered runtime proof in Character Select.

Runtime assets:
- `public/assets/characters/starter-crybaby/neutral/body-back.webp`
- `public/assets/characters/starter-crybaby/neutral/face-mask.webp`
- `public/assets/characters/starter-crybaby/neutral/foreground.webp`

Current behavior:
- selecting KHÓC NHÈ with a captured face uses the retained non-circular face source;
- the face is clipped by the Character mask, then the Character foreground/hair/props render above it;
- other starter Characters still use the CH-02D face-only fallback;
- RANDOM stays concealed and Secret Baby art is not preloaded into normal Character Select;
- this proof is intentionally 128×192, not the final 1024×1536 production export;
- the measured proof socket lives under `runtimeProof`; final `faceSocket` remains unset and the Character remains `layer-export-pending`.

Validation:
- CH-02F source `d73f637ccf67c2d71d0d12e87e780cdbea8da12a`: CI #3235 / run `35975065152` **SUCCESS**
- CH-02G source `0983a95fdf328e7ef68376226457c9fb63b5ef5c`: CI #3236 / run `35978534196` **SUCCESS**
- CH-02A through CH-02G gates: **SUCCESS**
- compiled public mirror: `c40aea0cd65af24ff18d3bfe90a459d80e8a0166`
- GitHub Pages #30 / run `35978666671`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`
- runtime/device visual acceptance is still required before promoting the proof socket or generating the remaining poses.

Next step: Ron should visually test KHÓC NHÈ with real face images on desktop/Steam Deck/mobile landscape. Fix fit/crop first. Only after the neutral proof is accepted should the full neutral production export and then the other six poses be authored.

## September 24 CH-02B Random Character + Secret Baby

Ron approved the RANDOM (?) hunt mechanic and Secret Baby direction.

Canonical source/design:
- `src/content/core/character_secret_baby_v01.ts`
- `src/core/characterRandomSelectionCh02b.ts`
- `docs/CHARACTER_RANDOM_SECRET_BABY_CH02B.md`
- `tests/character-random-secret-baby-ch02b.ts`

Locked rules:
- Secret working archetype: **EM BÉ BÁ ĐẠO** 👶🍼, crawling + pacifier + unexpectedly bossy attitude;
- Secret Baby is **RANDOM-only** and absent from the normal starter roster;
- direct selection helper rejects the Secret ID;
- each RANDOM player contributes one independent **5% Secret eligibility roll**;
- 2–4 RANDOM players resolve together as one concealed batch;
- at most **one Secret Baby** can exist in the RANDOM batch even if multiple 5% rolls hit;
- normal Character tokens are filled from the starter roster, avoiding duplicates when capacity permits;
- the resulting tokens are shuffled before seat assignment, so the player whose eligibility roll hit is not necessarily the player who receives the Secret;
- reveal timing is `match_start`; the intended UX is face-down ? cards → spread/shuffle → assignment → flip/reveal;
- resolver uses serializable authoritative RNG only; no `Math.random()`;
- CH-02B does **not** activate Secret or starter passives yet.

Secret passive concept:
- working name: **BÉ CƯNG CỦA VŨ TRỤ**;
- should feel materially stronger/special than starter passives;
- current direction is bounded protection/mitigation from a meaningful negative event;
- exact cadence/numbers remain pending balance;
- `live: false` remains locked.

Starter presentation also corrected and locked:
- KHÓC NHÈ: female, 55–65;
- CAU CÓ: male, 40–50;
- LO LẮNG: male, 28–35;
- TĂNG ĐỘNG: female, 18–24.

**Validated source:** `20ea08e6244563cafdd221e2437b8bbcf03d072e`.
**MMM MVP CI #3228:** run `35955486677`, **SUCCESS**.
Both CH-02A and new CH-02B regression gates passed.

The public compiled mirror did not change because CH-02B is currently typed pregame/design logic not yet imported into the live Character Select runtime.

Next CH-02 work:
1. wire the visible RANDOM (?) option into Character Select;
2. keep Secret assignment private to Host until the reveal beat;
3. implement the multi-RANDOM spread/shuffle/reveal presentation;
4. add Secret Baby art/reveal only after the runtime concealment contract is safe;
5. still do not activate passive gameplay until its authoritative balance milestone.

## September 24 compact Visual Style Bible lock

Ron reconfirmed that all new UI/Character work must stay visually aligned with the earlier game UI reference set rather than drifting into a new style.

Canonical document remains:
- `docs/VISUAL_STYLE_BIBLE_V0.1.md`

A compact reference-lock section is now added at the top of that file. It explicitly locks:
- Chibi / Cozy / Rounded / Toy-like / Juicy / Playful / Readable;
- warm cream + cocoa + butter/mint/coral/aqua/lavender material family;
- soft toy depth instead of flat web-app panels;
- logo expression marks as core brand DNA;
- Character art must share the same world language as HUD/cards/board;
- circular face crop is compatibility-only, not the future Character-art default;
- TIN TỨC = more editorial/paper/poster;
- LÁ BÀI = more kinetic sticker/cutout;
- Character Select = large art first, not a text-heavy stat form;
- consistency across screens outranks one-off visual flourish.

This compact lock is the checkpoint for the upcoming **KHÓC NHÈ art proof + Character Select visual proof**.

## September 24 CH-02A starter roster lock

Ron approved the first four foundational Character archetypes:

1. **KHÓC NHÈ** — age direction 55–65, expressive/fashionable/theatrical;
2. **CAU CÓ** — 40–50, sharp/tidy/angular;
3. **LO LẮNG** — 28–35, planner-core/prepared/cautious;
4. **TĂNG ĐỘNG** — 18–24, bright street/sporty/dynamic.

Canonical source:
- `src/content/core/characters_starter_v01.ts`
- `docs/CHARACTER_STARTER_ROSTER_V0.1.md`
- `tests/character-starter-roster-ch02.ts`

Locked design principles:
- archetype and final personal character name are separate;
- personal names, gender presentation and final art are still pending art review;
- age/style are presentation only and must never mechanically imply a passive;
- each Character has its own unique reaction profile ID, pose set ID and one **concept-only** passive;
- every starter passive remains `live: false`; there is still no passive gameplay resolver;
- first art proof should be **KHÓC NHÈ** because its wide emotional range makes face-composite problems easiest to spot.

Current passive concepts:
- KHÓC NHÈ: **ĐƯỢC DỖ** — consolation-style benefit after a meaningful setback;
- CAU CÓ: **ĐỪNG CHỌC TUI** — counter/reaction direction when directly targeted;
- LO LẮNG: **LO XA** — preparation/risk-awareness direction;
- TĂNG ĐỘNG: **KHÔNG NGỒI YÊN** — movement/Mini Game/action-streak direction.

**Validated source commit:** `797c965e2cdfc97b282ca15c4d01460247a1426f`.
**MMM MVP CI #3227:** run `35939124535`, **SUCCESS**.
The new CH-02A roster contract step passed. Public compiled mirror did not change because this milestone adds typed source/design data that is not yet imported into the runtime bundle.

Next Character step: create the first **KHÓC NHÈ art proof + Character Select visual proof**, then bind the existing non-circular captured face source into that Character preview before enforcing mandatory selection.

## September 24 Character face-source follow-up — CH-01.1

The current round avatar remains visually unchanged, but face capture now also preserves a **512×512 non-circular transformed composite source** for future Character head/face sockets.

Implementation:
- `src/systems/faces.ts`: `FACE_COMPOSITE_SOURCE_SIZE = 512`, `drawFaceCompositeSource()`, `encodeFaceCompositeSource()`;
- the source uses the same user framing/rotation/style but **does not apply the circular clip**, so hair/head pixels outside the old avatar circle survive;
- `FaceImageEditorResult` returns both the existing circular `dataUrl` and `compositeSourceDataUrl`;
- `FaceAsset.compositeSourceDataUrl?` is optional for compatibility;
- all current Setup image/camera paths retain both derivatives;
- current HUD/avatar still uses the old circular sticker, so this is groundwork rather than a visible reskin;
- editor copy now asks the user to keep forehead/hair/chin in frame for future Character compositing;
- `tests/image-transform.ts` locks the existing 320px avatar target and new 512px composite source target.

**Validated source commit:** `bfa7c9cb28688928c3d4d56c32c41ee60e837d05`.
**MMM MVP CI #3226:** run `35938294090`, **SUCCESS**.
**Compiled public mirror:** `b660aa8324a26f41c2a99907555484e767568b1e`.
**GitHub Pages #27:** run `35938377240`, **SUCCESS**.

No passive, Host authority, RNG, reconnect, Worker or event ownership behavior changed. Next Character milestone should be the **first real starter Character + Character Select proof**, then preview the captured face on that Character before making selection mandatory.

## September 24 Character System foundation — CH-01

Ron re-confirmed the older Character idea and expanded it into a locked direction: final MeMeMe players are not just circular avatars. Every participant will eventually choose a Character before Ready/Start. The human player owns seat/name/face input; the Character owns body/silhouette/costume, pose set, reaction profile and passive IDs.

Key decisions now canonical:
- varied cast across age/gender presentation, silhouette and personality; demographics never mechanically imply a passive;
- the real player face is composited into the selected Character rather than being the whole avatar;
- circular face crop is no longer the future default for Character art; use head/hair-aware source + normalized face socket;
- current three captures neutral/happy/angry remain practical input, while Character poses may use richer emotions with deterministic fallback;
- future TIN TỨC/LÁ BÀI pipeline: Player → Character → context/emotion → pose → face composite → event surface;
- Character reactions migrate from seat-default personality to Character reaction profiles;
- passives will be data-driven and HOST-authoritative when implemented. CH-01 does not activate any passive gameplay or add RNG/state mutation.

New canonical spec:
- `docs/CHARACTER_SYSTEM_SPEC_V0.1.md`
- `src/core/characterSystem.ts`

CH-01 source foundation:
- `PlayerProfile.characterId?: string` is transitional/optional until Character Select exists;
- `gameSession.setCharacter/getCharacterId/hasCharacterSelections`;
- normalized face-socket schema;
- Character pose/emotion/portrait/passive schema;
- deterministic richer-emotion → neutral/happy/angry capture fallback;
- no final roster invented yet.

**Validated source commit:** `6fb9b7129512439ec32909726da7e5a3197c1fe2`.
**MMM MVP CI #3225:** run `35937980934`, **SUCCESS**.
**Compiled public mirror:** `5e23515240745c7b84301277fe82669ab2729074`.
**GitHub Pages #26:** run `35938077099`, **SUCCESS**.

This is a source/schema milestone, not a visual Runtime PASS. Existing Setup remains intentionally unchanged. Next Character work should preserve the non-circular source needed for future compositing, then design the first actual starter Character + Character Select proof before making selection mandatory. Do not activate passives or mass-reskin TIN TỨC/LÁ BÀI yet.

Repository: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
PR #1: **Draft/Open**. Do not merge or mark Ready unless Ron explicitly asks.

## September 24 VF-04.1 + VF-05 first News visual sample

Ron clarified that the **gold border is intentional active-turn state** and should NOT be removed. The player's colour remains permanent identity. VF-04.1 now paints:
- P1 red / P2 blue / P3 yellow-orange / P4 green for each avatar, upper identity stripe and INNER HUD ring;
- golden OUTER ring only on the authoritative active player's HUD, with a clear 4px cream gutter between the gold and player-colour rings;
- a small gold turn marker that pops for 220ms on real turn changes, without tweening HUD position or scale. Earlier measured 268x104 four-corner clamps and screen-space camera ownership remain intact.
- `hudFramePaletteVf041` + extended `tests/visual-foundation-hud-vf04.ts` lock the two simultaneous signals for all 4 seats.

VF-05's **first reference News presentation** is also implemented in the existing .22 canonical modal, not in a duplicate overlay:
- `src/ui/visualFoundationNewsVf05.ts`: pastel mint header, warm cream rounded paper, cocoa outline, sticker icon well and quiet reading panel at the exact previous 720x300 geometry.
- `CareerMinigameBoardScene07044.rebuildCanonicalCinematicText070414` applies it only to `model.kind === 'news'`; all Card-family dark materials remain unchanged until separately reviewed.
- 30px dark title, 18px body where content fits, adaptive fallback 14px for long News, reduced developer metadata. No extra toast, scene container, gameplay/input owner, RNG or network actions.
- `tests/visual-foundation-news-vf05.ts` verifies material + unchanged modal/HUD/reaction bounds for all P1–P4. Existing .22 presentation ownership and Lap Shuffle tests are retained.
- `tests/canonical-ui-ux-contract.ts` now accurately checks already-shipped Steam Deck browser Gamepad support rather than the obsolete 'Controller support is deferred' assertion.

**Validated source commit:** `b86d9b5283658953b2b17fee52173acae858e21f`.
**Source CI #3224:** run `35902453594`, SUCCESS.
**Compiled public mirror:** `7e1ad18f1c1d593f595a26da2d7e0c896043ecdd`.
**GitHub Pages #25:** run `35902579777`, SUCCESS.

**RUNTIME DEVICE RETEST REQUIRED**. Desktop/phone landscape/Steam Deck: make P2 active (blue inner ring, gold outer ring) and rotate through P1–P4; confirm gold moves with turn and no card is misidentified. Inspect various short/long News events, P1–P4 reaction rail geometry, rapid skip to catch stray legacy text. The .22 recurring leak is NOT considered visually accepted until Ron's browser screenshots confirm. Test a full Lap Shuffle and Steam Deck play later; do not silently close previous pending runtime issues. PR #1 remains Draft/Open. Do not start 0.1.71.

Next visual step after runtime feedback: refine the News reference if needed; apply the same Foundation to a **single** LÁ BÀI sample (not the entire card catalogue at once), then VF-06 Job. Keep design tokens and modal ownership centralized.

## September 24 Visual Foundation checkpoint: VF-03 + VF-04

**Latest validated source:** `f4c55e2e53ce90b40196cf603efaf86cd37f127d`
**MMM MVP CI #3222:** run `35896619775` **SUCCESS** (all existing regression gates and new VF-04).
**Public compiled mirror:** `bbf37689cad6f122b8bccb5ec15046cfcb3ed591`.
**GitHub Pages #24:** run `35896759597` **SUCCESS**.

Completed in source:
- VF-01 palette / radius / spacing / typography tokens and VF-02 reusable button family remain live.
- VF-03 `5d8d2e3`: shared soft-panel/modals in `src/ui/visualFoundationV01.ts` and `src/visualFoundationV01.css`, first production application to the Avatar Choice modal. One header/body/footer, focus trap, Escape/B dismissal, focus restored to opener, Steam Deck modal-focus priority. Source CI #3220 and public Pages #23 SUCCESS.
- VF-04 `f4c55e2`: new shared `src/ui/visualFoundationHudVf04.ts` paints the **actual** 268x104 four-corner player HUD in one reusable style: warm cream, soft cocoa cast shadow, existing P1-P4 colours, original player photo, sticker frame and a visible active-turn golden rim/marker. Idle text: avatar, name, money and compact career only. Active: stronger type plus optional salary, hand/lock context.
- VF-04 wired in inherited `CareerMinigameBoardScene065`; latest active `CareerMinigameBoardScene07044` now clamps against the **real 268x104 art bounds** in both desktop and phone-landscape viewports. This fixes the long-standing old 252x92 hitbox / larger 268x104 skin geometry mismatch. Preserve old logical anchors, camera, 1.18 active / 0.96 idle mobile scale, P1-P4 token badges, online seat ownership.
- New `tests/visual-foundation-hud-vf04.ts` checks player copy, long names/jobs and every corner at several scales. `tests/visual-foundation-v01.ts` covers VF-03 first modal and the VF-04 plan.

**NOT Runtime PASS:** Ron plans device tests later. On phone landscape and Steam Deck, visually inspect P1–P4 corners with long names, turn transitions, reaction side rails, blocking TIN TỨC / LÁ BÀI, Avatar Choice and Job Hub. Automated geometry and source tests do not verify actual font glyph rasterization or every animation frame. Prior News/Card text leakage and Lap Shuffle visual issues remain independently pending Ron's real-browser acceptance.

**Next visual work after runtime screenshots:** VF-05, one canonical TIN TỨC / LÁ BÀI event surface using the reusable VF-03 owner and established .22 safe-lane reaction policy; VF-06 one canonical Job sample. Do not reskin every screen with isolated one-off changes. No gameplay RNG, economy, Host authority or Worker updates. PR #1 stays Draft/Open; do not merge.

## September 23 Steam Deck Gamepad .24/.25 checkpoint

Validated latest source: `6f9507e1cff75914b56bf0f4a75ac6e7de27abb8`. MMM MVP CI **#3219**, run `35862236340`: **SUCCESS**. Public mirror: `473fcf21a0a7797d7525309eac00a210e061c281`. GitHub Pages **#22**, run `35862360068`: **SUCCESS**.

Steam Deck web-playtest input is now actually installed in `src/main.ts`, not the abandoned unsafe `gamepadUiNavigation0651.ts`. The single global browser Gamepad dispatcher (`src/ui/steamDeckController070424.ts`) owns normal scene/DOM/controller events; Job Hub receives scene-level events but retains its own default dice focus and single guarded Host D6; Mini Game keeps exclusive existing gamepad polling to prevent double-confirm. Standard A confirm, B back, D-pad/left stick spatial navigation, X overview, Y LÁ BÀI when allowed, Start settings. The active card, branch and target dialogs, Roll For Order, browser DOM setup/lobby, spectator and final podium input gates are routed. Do not override authority/replay or CPU ownership.

New .25 follow-up on top of original validated .24 source `dbe6c4d700ac07b939d624a292117d93c54c512d`:
- When an HTML SELECT (notably CHẾ ĐỘ) has focus, A enters an explicit edit mode; ↑/↓ change option, A saves, B cancels and restores previous option. Left/right still permit quick steps outside edit mode.
- Disconnect/scene change while editing cancels uncommitted selection, and disabled options are skipped by a pure tested function.
- Settings now contain the on-device controller legend and Steam+X text-entry hint. Its panel is scrollable on a small viewport; the connect hint is transient instead of covering P4 HUD.
- New files/coverage: `src/ui/steamDeckPadPolicy070424.ts`, `tests/steam-deck-controller-070424.ts`, and `docs/STEAM_DECK_WEB_070425.md`.
- **AUTOMATED PASS / PHYSICAL STEAM DECK BROWSER RETEST REQUIRED**. This is a web playtest, not a native .exe, Flatpak or SteamOS app.

Physical acceptance route: use Deck browser with Steam Input Gamepad layout, press A at splash; CHƠI NHANH → use A to edit mode, ↑/↓ and A to select 1P+3CPU; Roll For Order A; board A movement D6, Y cards, X overview; in Job Hub initial A rolls by default, arrows inspect 3 professions, A opens detail and A/B closes; branch/target selection with D-pad and A; Mini Game D-pad and A; final result gamepad controls only after podium reveal. Test Start settings and text input via Steam+X; if browser does not expose Gamepad API, troubleshoot Steam Input layout. Also test online P2 spectator/room ownership. Do not claim Runtime PASS until Ron plays the device.

PR #1 remains Draft/Open; do not merge or move to Ready. Keep prior .22 News/Card overlay and Lap Shuffle visual runtime acceptance open independently.

## September 23 keyboard-only Job Hub acceptance

Ron clarified the requirement: *no mouse is needed to finish Job selection*, not merely an extra Enter/Space shortcut. The default **visible keyboard focus is the DICE button**, so Enter/Space immediately requests the authoritative Job D6. Arrow keys and Tab/Shift+Tab move the visible in-game focus between the three offered Job cards and the dice; Enter/Space on a card opens full details, and Enter/Space/Escape/Backspace on details closes them and restores card focus. Arrow Down from any card returns directly to dice. A/B/C and 1/2/3 remain quick shortcuts to the card details. Pointer input still works. Spectators may inspect details but cannot focus/activate the dice.

Source: `src/ui/JobChoicePicker.ts`, pure navigation policy `src/ui/jobHubFocus070423.ts`, regression `tests/job-minigame-input-070410.ts`.

- Source commit: `a91fbb10ffaaa9710393f541e6b1017b0459ec01`.
- MMM MVP CI **#3215** (run `35840449469`): **SUCCESS**.
- Public compiled mirror: `636c4662b72c8adecae7f5d26f7b0421fe99a7a2`.
- Pages **#19** (run `35840548534`): **SUCCESS**.
- **Runtime human acceptance still required**: without touching the mouse, open Job Hub, press Enter for the default dice; on a separate fresh Job Hub use Up to highlight B, Left/Right to browse A/B/C, Enter to open detail, Escape or Enter to close it, Down to return to dice, then Enter to roll. Also check Tab, Shift+Tab, Space, spectator state and mouse fallback.
- Preserve the original Host-owned Job D6, CPU autoplay and online ownership. PR #1 stays Draft/Open.

## September 23 newest validated visual checkpoint

- source: `e1a965e2869d29461c834d1f07255bd3498ec5a3`
- CI #3214 / `35836401072`: SUCCESS
- public mirror: `a24b90417b018198651f61bb0e1e8d75fb36412b`
- Pages #18 / `35836498719`: SUCCESS
- named depth-1500 fullscreen Mini Game, revised RPS duel name/card/footer geometry, pure geometry regression
- Lap Shuffle now edits existing canonical circle+label instead of painting a second circle on top of its original coloured rim
- .22 duplicate toasts/reaction modal guard retained and tested; screenshot's detached News/Card text still needs real-browser retest
- prior Job Hub Enter/Space hotfix retained
- new test files: `src/ui/miniGameLayout070423.ts`, extended `.059`, `.071`, and `.22` guards.
- browser acceptance **PENDING** for exact four screenshot issues, including mobile viewport and full-lap shuffle.

## Current checkpoint

**0.1.70.4.22 — Presentation Single Owner + Safe Reactions + Job Keyboard Hotfix**

Status: **SOURCE IMPLEMENTED / CI PASS / RUNTIME RETEST REQUIRED**

Validated source:
- head: `81341ad5c12604ba878f13b5b7a599e1897ecc7a`
- MMM MVP CI **#3212**
- run: `35832680818`
- conclusion: **SUCCESS**

Newest source/hotfix:
- `f1b94158ed273d7347795a72c29e9af0bd8fbc63`
- Job Hub now handles Enter and Space using the same guarded action as the dice click.
- Repeated keys, spectators, waiting state, and open detail must not roll.
- regression `tests/job-minigame-input-070410.ts` updated.
- MMM MVP CI **#3213** / run `35832935529`: **SUCCESS**.
- public compiled mirror `05dc1532f7ef9dda39392f0ca9a44dc3204b1f21`.
- Pages **#17** / run `35833039190`: **SUCCESS**.
- Keep both keyboard and overlay fixes at **RUNTIME RETEST REQUIRED** until Ron checks real gameplay.

Root-cause audit:
`docs/PRESENTATION_OWNERSHIP_AUDIT_070422.md`

What changed:
- both inherited legacy visual toast producers are disabled before `super.create()`;
- reaction balloons use one tested geometry policy, `src/ui/presentationLanes070422.ts`;
- old 328px side bubbles that physically intruded into the modal are no longer accepted by regression tests;
- delayed reactions are bound to the exact originating presentation model;
- canonical reaction containers are explicitly named and registered;
- final modal ownership runs again at `POST_UPDATE`;
- whole legacy Card/News containers are retired instead of hiding only selected Text children;
- arbitrary depth/emoji/text whitelisting is removed.

Primary regression:
`tests/presentation-owner-rootfix-070422.ts`

Runtime acceptance still required:
1. several different TIN TỨC and LÁ BÀI;
2. all P1–P4 reaction positions;
3. rapid skip across consecutive events;
4. no delta/event toast behind the canonical modal;
5. Job Hub/result remains readable; Enter and Space trigger its dice exactly once while A/B/C details and Escape keep working;
6. one full Lap Shuffle still keeps every shuffled tile circular.

Do not call Runtime PASS from CI alone.

## Canonical handoff files

- `HANDOFF_CURRENT.md`
- `NEXT_CHAT_PROMPT.md`
- this file

The next chat should verify the latest branch/head and then prioritize Ron's newest runtime screenshot feedback.

---

## Retained historical/current context below

## Current checkpoint

**0.1.70.4.20 — Stale Room Recycle + WebSocket Keepalive**

Production Worker is LIVE.

Worker health:
- milestone: `0.1.70.4.20`
- transport: `websocket-durable-object`
- lobbyAuthority: `true`
- socketStaleMs: `120000`
- transportKeepalive: `true`

Cloudflare Worker deploy:
- source commit: `719dda74890892be6990c50056bc73965a6746a4`
- Workers Build: SUCCESS
- Build ID: `c632b158-54f4-420f-aede-dd5cb8cbe410`
- Version ID: `68ff7a16-74d7-49d2-87de-d3ecd97eb196`

## 0.1.70.4.20 fix

- active online sockets send application-level keepalive every 20 seconds;
- a socket becomes stale after 120 seconds without real transport activity;
- hibernated pre-.20 sockets fall back to `joinedAt` so old ghost sockets can finally expire;
- stale sockets are closed and ignored by room-recycle authority;
- close/error callbacks no longer fake liveness by refreshing `lastSocketActivityAt`;
- transport keepalive is swallowed by the Worker and never leaks to gameplay/media subscribers;
- a started abandoned room can release its custom code after reconnect grace.

## Custom room 123123 — LIVE PROOF

The old stuck room `123123` was successfully reclaimed on production .20.

Probe result:
- health returned milestone `0.1.70.4.20`;
- create custom room `123123` returned HTTP `201`;
- room started fresh with Host only;
- cleanup/close returned `closed: true` and `closeReason: host_left`.

The temporary one-shot room probe workflow was removed after proof.

## Validation

Full source CI rerun after production .20 became live:
- MMM MVP CI #3181
- run: `35754944337`
- attempt: 2
- conclusion: SUCCESS

Important gates:
- typecheck/build: SUCCESS
- .19 live two-device reconnect + media relay smoke: SUCCESS
- .20 stale room recycle + WebSocket keepalive: SUCCESS
- external package validation: SUCCESS
- compiled mirror publish: SUCCESS

The live .19 smoke covers:
- create/join/ready/start;
- post-start P2 seat reclaim;
- Host -> P2 and P2 -> Host game relay;
- simulated P2 socket reload/reconnect;
- authenticated media roster relay;
- authenticated media signal relay.

Wrangler Worker dry-run also passes independently.

## Public frontend

GitHub Pages:
`https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Current public compiled mirror:
`73684a5a0dcb810c1a378f081dec5dd0a0bd5604`

Pages workflow:
- run: `35811832269`
- conclusion: SUCCESS

This public build contains:
- 0.1.70.4.20 Worker-compatible frontend;
- Visual Foundation VF-01 + VF-02;
- Vietnamese typography stabilization;
- Roguelike Lap Shuffle 0.1.

## Cloudflare Git integration

Production Worker now uses:
- repository: `RVTGMzz/Mmm-BG`
- branch: `mmm-mvp-0.1-dev`
- root: `/cloudflare/mememe-online`
- deploy command: `npx wrangler deploy`

The earlier `mememe-mvp-0.1-core` branch is historical and must not be used for production Worker deploys.

Durable Object binding remains:
- `MEMEME_ROOMS` -> `mememe-online_MeMeMeRoom`

Do not delete or recreate the Durable Object binding.

## Visual direction

Canonical visual direction:
`docs/VISUAL_STYLE_BIBLE_V0.1.md`

Title:
**Visual Style Bible v0.1**

Direction locked for future presentation work:
- chibi;
- cozy;
- rounded;
- toy-like;
- pastel/candy colour;
- mobile-first oversized readable interaction;
- soft depth and sticker-like icons;
- board/world should feel like a playful diorama rather than a technical tile grid.

The supplied casual-game references are directional moodboard material only. Do not copy their proprietary characters, logos, layouts or illustrations one-for-one.

This visual direction is subordinate to the canonical UI/UX runtime-safety contract and must preserve Host authority, deterministic RNG, reconnect ownership, CPU autoplay, modal ownership and mobile safe areas.

## Active visual implementation plan

Implementation document:
`docs/VISUAL_FOUNDATION_PASS_0.1.md`

Current visual implementation status:
- VF-01 shared design tokens: IMPLEMENTED
- VF-02 canonical button family: IMPLEMENTED
- live adoption: mode select, online room, setup footer, rule-confirm flow
- regression test: `tests/visual-foundation-v01.ts`
- VF-01.1 Vietnamese typography stabilization: IMPLEMENTED
  - removed `ui-rounded / Arial Rounded MT Bold` from canonical VF font stack;
  - canonical VF surfaces now use Vietnamese-safe system UI glyph coverage;
  - lobby placeholder is reduced to secondary metadata size so it no longer crowds/clips;
  - VF-02 primary/secondary buttons have stronger toy-like highlight + depth.
- VF-03 panel/modal shell: NEXT

Canonical rollout order:
1. shared design tokens ✅;
2. button family ✅;
3. panel/modal shell;
4. player HUD;
5. one TIN TỨC canonical sample;
6. one Job canonical sample;
7. desktop + phone-landscape foundation review.

Do not reskin the entire runtime in one pass. Components are built and validated first, then propagated.

## Roguelike Lap Shuffle 0.1

Implementation document:
`docs/ROGUELIKE_LAP_SHUFFLE_0.1.md`

Status:
**IMPLEMENTED / CI PASS / RUNTIME RETEST REQUIRED**

Rule:
- first player to cross Start for lap N triggers exactly one global shuffle for lap N;
- later players reaching the same lap do not reshuffle;
- graph topology and coordinates stay fixed;
- tile content bundles move together.

Locked positions:
- Start;
- Job;
- Police/Jail gate + hold;
- Jail Exit 1/2/3;
- Hospital gate + hold;
- Hospital Exit 1/2/3.

Mutable pool includes:
- TIN TỨC;
- LÁ BÀI;
- money +/-;
- Mini Game;
- Lottery;
- ordinary spaces.

Authority:
- uses serializable HOST RNG only;
- no `Math.random()`;
- layout lives in MatchState;
- layout is checksum-covered;
- layout serializes for reconnect/snapshot;
- replay deterministically reconstructs the same shuffle.

Presentation:
- global `board_shuffle` event;
- “BÀN CỜ ĐÃ BIẾN ĐỔI!”;
- board tiles update on the presentation beat, not early;
- shuffled tiles pop/flip into their authoritative identities.

Validation:
- MMM MVP CI #3192
- run: `35811772094`
- conclusion: SUCCESS
- typecheck/build: SUCCESS
- retained outlier replay rebased intentionally for the new HOST RNG consumption;
- `test:roguelike-lap-shuffle-071`: SUCCESS
- compiled mirror publish: SUCCESS

Retained deterministic sentinels after the intentional gameplay change:
- seed 611102 checksum `70355e64`;
- seed 611112 checksum `143e052b`.

Do not call this feature Runtime PASS until real play confirms one-shuffle-per-lap, locked nodes, correct visible/effective tile identity, two-device parity and reconnect restoration.

## Lap Shuffle Circular Tile Hotfix

Status:
**CI PASS / PUBLIC DEPLOYED / RUNTIME RETEST REQUIRED**

Runtime feedback:
- after the first lap shuffle, circular board nodes gained a rounded-square plate inside them.

Root cause:
- `buildLapShuffleNode071()` rendered shuffled content as a rounded rectangle over the immutable circular node.

Fix:
- shuffled content now repaints the full node as a radius-34 circle with the canonical dark outline;
- shuffle still changes only authoritative tile content, never board geometry or locked nodes;
- regression guard rejects `fillRoundedRect/strokeRoundedRect` inside the Lap Shuffle node renderer.

Validation:
- source UI commit: `fe2c6a77ad2de895c5e85ee690a97d431fcf5f38`
- regression commit: `911e64c8e920d1e216d76f1f08244be355d57ed4`
- MMM MVP CI #3203: SUCCESS
- Lap Shuffle gate: SUCCESS
- public mirror: `414b38c45197a13f40b351680df99bde5d5d6f1a`
- Pages run `35814384565`: SUCCESS

Do not call Runtime PASS until Ron completes one lap and confirms every shuffled tile remains circular.

## 0.1.70.4.21 — Final Modal Ownership + Career Layout

Status:
**SOURCE IMPLEMENTED / CI PASS / PUBLIC DEPLOYED / RUNTIME RETEST REQUIRED**

Runtime feedback that triggered this pass:
- loose board/event narration could reappear behind a Card/News modal after later scene wrappers ran;
- Job Hub / nhận việc layout still felt crowded and visually unbalanced.

Changes:
- final active scene now runs a last-frame modal ownership guard after all inherited update layers;
- any loose non-canonical Text is hidden while a real modal is active;
- player HUD/token identity, reaction bubbles and continue hints stay protected;
- Job Hub is rebuilt as three compact rounded career cards;
- each Job card keeps one readable Lv1/Lv2/Lv3 salary line and one XEM CHI TIẾT action;
- redundant “lương khởi điểm” copy is removed;
- Job detail uses a smaller centered career sheet;
- Job result presentation is rebuilt as one centered cream/yellow card with “ĐÃ NHẬN VIỆC” instead of split left/right text;
- Job surfaces use Vietnamese-safe system UI fonts.

Regression gate:
- `tests/final-modal-career-layout-070421.ts`

Validation:
- source HEAD: `d9cb0623f8f5db8dfaae2206e456eec9fd460b4a`
- MMM MVP CI #3201
- run: `35813758452`
- conclusion: SUCCESS
- 0.1.70.4.21 final modal ownership + career layout: SUCCESS
- Roguelike Lap Shuffle gate: SUCCESS
- package validation: SUCCESS
- compiled mirror publish: SUCCESS
- public mirror: `6a87a8072de9d9f3cddf48021468d1dfe76c07a6`
- Pages run: `35813830898`
- Pages conclusion: SUCCESS

Do not call Runtime PASS until Ron rechecks the exact leak screenshot scenario and Job Hub/result flow.

## Runtime acceptance still pending

Automated/live infrastructure proof is PASS.

Do not call full 0.1.70.4.20 Runtime PASS until Ron confirms on real devices:
1. create room `123123` from the game UI;
2. second device joins;
3. each human acts only on own turn;
4. reload P2 during an active match and reclaim the same seat;
5. no stale black `CHỜ HOST` overlay;
6. P1/P2 camera tracks are mutually visible when both enable camera.

0.1.70.4.20 online acceptance is still not formally closed. By explicit user request, the Roguelike Lap Shuffle gameplay layer has already been implemented on the active playtest branch; do not interpret that as a retroactive Runtime PASS for the .20 online checkpoint.

Do not merge PR #1.

## ACTIVE DEVELOPMENT RELEASE POLICY — 2026-10-04
- **Active development branch:** `mmm-mvp-0.1-dev`.
- **Cloudflare production branch stays frozen:** `mmm-mvp-0.1-core`.
- Continue normal build/test/CI on the dev branch.
- Continue publishing the compiled playtest to `ronvotri/MeMeMe-Web-Playtest` so Ron can always test at the GitHub Pages link.
- **Do NOT deploy/update the Cloudflare Worker** during routine development.
- Keep the currently deployed Worker online and usable for optional ONLINE testing.
- Do not modify/redeploy the Worker unless Ron explicitly asks to update Cloudflare/backend.
- The Cloudflare Git integration is documented as following `mmm-mvp-0.1-core`, so routine dev commits must stay on `mmm-mvp-0.1-dev`.
- Public test link remains: https://ronvotri.github.io/MeMeMe-Web-Playtest/
