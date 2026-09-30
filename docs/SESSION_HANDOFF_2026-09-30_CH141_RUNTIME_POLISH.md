# MMM — 2026-09-30 CH-14.1 RUNTIME POLISH

**SOURCE + AUTHORITY GATES + BROWSER RUNTIME + PACKAGE + PUBLIC PAGES: PASS.**

Canonical authority:
- repo / branch: `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-core`
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


## Main CH-14.1 commit chain

- `17d4b292` — fix: CH-14.1 runtime spotlight input and rounded UI
- `6d8f232c` — fix: widen CH-14.1 rounded surface token types
- `0cc55f78` — test: align CH-04D with rounded Mini Game podium
- `a1afdfd2` — test: align CH-11 with rounded Mini Game header
- `345ec5f6` — test: measure rounded Mini Game Graphics bounds
- `428c835b` — fix: expose rounded Mini Game geometry to runtime gates
- `93cf43e7` — fix: protect canonical Card News geometry from legacy inflation
