# CURRENT CHECKPOINT — 2026-10-04 — CH-16.1 QUICK MINI GAME + LANDING FIX

**ACTIVE DEV + FULL CI + GITHUB PAGES: PASS. CLOUDFLARE WORKER: FROZEN / NOT REDEPLOYED.**

Current authority:
- repo: `RVTGMzz/Mmm-BG`
- active development branch: `mmm-mvp-0.1-dev`
- frozen Cloudflare production checkpoint branch: `mmm-mvp-0.1-core`
- build: `0.1.70.4.39`
- phase: `RELEASE CANDIDATE • CH-16.1 QUICK MINI GAME + LANDING FIX`
- validated source/test HEAD: `99568a66ca0b8fef631ec47c7d599ad0620445f3`
- full CI #3495 / run `37174659272`: **SUCCESS**
- compiled GitHub playtest mirror: `7181d56262876fb3b20dcf6a318ea6a8bfb9456f`
- GitHub Pages #91 / run `37175044361`: **SUCCESS**
- test URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-16.1 shipped in this checkpoint
1. **Landing B$ surprise timing**
   - authoritative money/economy is unchanged;
   - visible HUD money is held on its presentation snapshot while movement is still resolving;
   - inherited compact-HUD redraws immediately restore the visible snapshot, preventing future landing B$ from flashing before the token arrives;
   - deterministic landing-money regression PASS.

2. **Mini Game rules readability**
   - manual rules use a dedicated body area plus a separate footer lane;
   - `ENTER / SPACE / A: TIẾP` no longer shares the reward line;
   - browser runtime covers both M17 rules and the M09 rules screen that reproduced Ron's screenshot;
   - runtime overlap gate PASS.

3. **Outer game mode menu**
   - normal boot: Splash → `BOARD GAME` / `MINI GAME`;
   - Board Game opens the existing Quick/Local/Online lobby;
   - invite URL `?room=CODE` still bypasses the outer menu and lands directly in Board lobby, preserving CH-15 invite behavior;
   - Board lobby has `← MENU` back to the outer selector.

4. **Standalone Mini Game Quick Play**
   - exposes all five canonical Mini Games;
   - modes: 1 human + 3 CPU, 2 human + 2 CPU, 4-player hotseat, 4 CPU autoplay;
   - reuses the real `startMiniGameOverlay` gameplay implementation rather than duplicating Mini Game rules;
   - result screen offers Play Again / Change Mini Game / Main Menu;
   - deterministic; no client `Math.random()`.

5. **CI efficiency**
   - dev workflow uses same-branch concurrency with `cancel-in-progress: true` so stale commits do not keep burning CI or publish over newer builds.

## Release / backend policy
- Continue routine work only on `mmm-mvp-0.1-dev`.
- GitHub Pages test build should continue updating from the dev branch.
- Keep the currently deployed Cloudflare Worker online for optional ONLINE testing.
- **Do NOT deploy/update Cloudflare Worker or move routine dev work back to `mmm-mvp-0.1-core` unless Ron explicitly asks.**
- PR #1 remains Draft/Open and must not be merged unless Ron explicitly asks.

## Next development target
- Continue CH-16C: properly synchronize human Mini Game choices for Local/Online through Host authority.
- Do not solve CH-16C by merely making remote seats locally interactive: Mini Game choices/results must be host-synchronized to avoid desync.
- Physical two-device acceptance remains human-owned and is not PASS until Ron tests it.

---

# NEXT CHAT PROMPT — 2026-09-30 AFTER CH-15 PUBLIC ONLINE

Continue MMM from repo `RVTGMzz/Mmm-BG`, branch `mmm-mvp-0.1-dev`. Do not resume routine work on `mmm-mvp-0.1-core`; that branch is the frozen Cloudflare production checkpoint.

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/SESSION_HANDOFF_2026-09-30_CH15_PUBLIC_ONLINE.md`
4. Ron's newest screenshots / two-device online feedback.

Current authority:
- build `0.1.70.4.38`
- phase `RELEASE CANDIDATE • CH-15 PUBLIC ONLINE`
- validated source/test HEAD `6ec56ccd0cc92ca72131ed5f3a7a275bc9334fcc`
- full CI #3422 / run `36743533044`: SUCCESS
- runtime evidence artifact `11110879402`
- package artifact `11111004466`
- Fast Publish #2 / run `36743533077`: SUCCESS
- public mirror `5a44add638a3877e39f74ed2847248f8b742680d`
- Pages #88 / run `36744538810`: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

CH-15 is public and automated/live-Worker accepted:
- Worker health probe is visible in ONLINE menu;
- create/join/Ready/Start use existing Worker + Durable Object authority;
- COPY LINK creates `?room=CODE`; invite links prefill the room field;
- host/client reconnect credentials are saved per tab in sessionStorage;
- reload shows `TIẾP TỤC PHÒNG` and restores the same room/seat;
- explicit leave/dead-room return clears stale resume state;
- live two-device smoke, repeated reconnect/ghost-seat stress and half-open socket replacement all PASS;
- browser online-entry/resume gate PASS.

Physical two-device acceptance is still pending. Do not claim real-device online PASS until Ron tests it.

Locked prior behavior:
- CH-14.2 Job Hub compact copy, participant-aware rules, CPU-only rules skip, hidden passive percentages, horizontal Mini Game result flow;
- CH-14.1 spotlight/input/Card-News/rounded UI fixes;
- CH-14 Match Recap;
- no client Math.random();
- HOST/replay gameplay RNG/B$ authority;
- Character probabilities 40/50/20/45/60;
- current economy and Mini Game payouts;
- PR #1 stays Draft/Open.

Next action:
- prioritize Ron's newest real two-device online test;
- if online fails, capture exact room state / seat / action / reconnect moment and fix the shared authority/session rule;
- do not rewrite Worker/reconnect architecture for presentation bugs;
- do not merge PR #1 unless Ron explicitly asks.

Public link must be included at the end of every completed build/fix report:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

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
