# CURRENT CHECKPOINT — 2026-10-06 — CH-18.10 PERSISTENT HQ ATLAS

Current build: `0.1.70.4.64`.
CH-18.9 is green on source CI #3676 and GitHub Pages #114. CH-18.10 converts the x4 walk remaster from scene-time canvas work into a real shipped SVG atlas asset: 1536×960, 40 isolated 192×192 cells. The board loads/slices this HQ source directly and only downsamples for display.

The active indicator is tightened to 78×18 at local Y=31 and remains behind the Character, so it reads as a foot ring rather than a torso circle. P badge, 8-frame cadence, left/right flip, static/live KHÓC NHÈ face socket, gameplay authority and RNG remain unchanged.

Drive audit also recovered `mmm-ch181-khoc-nhe-production.png`, which contains a genuinely higher-resolution 8-frame KHÓC NHÈ walk strip. This is the correct production-source pattern for future redraw/re-export; do not invent age/gender/sockets for the other Characters.

Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.9 HQ CHARACTER TOKENS

Current build: `0.1.70.4.63`.
Ron reported the 48px walk source visibly breaking up after board enlargement and the inherited active halo drawing around the torso. CH-18.9 fixes both presentation defects without changing gameplay.

The board now remasters each 48×48 walk cell independently into a 192×192 runtime frame (8×5 => 1536×960 atlas) with high-quality smoothing, then downsamples the HQ source at display time. The Character container is normalized back to scale 1 after the inherited 0.82 placeholder-token scale. The old centered circular halo is hidden; active-turn feedback is a dedicated 84×24 ellipse at the Character foot point, below sprite/composite layers.

This is an HQ remaster of the existing source, not a claim of newly redrawn detail. 8-frame walk, left/right flip, static/live KHÓC NHÈ face socket, Host/RNG/B$/movement authority stay unchanged. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.8 LIVE FACE SOCKET

Current build: `0.1.70.4.62`.
CH-18.7 is green on source CI #3671 and GitHub Pages #112. CH-18.8 reuses the already opt-in Online Group Media camera stream inside the existing KHÓC NHÈ CH-02F/G face socket. It never requests a second camera permission.

Fallback order is locked: live camera stream when CAMERA ON → saved neutral non-circular face source → default Character art. Live frames are center-cropped to a square, fitted through CH-02F, alpha-masked with the CH-02G irregular socket and overdrawn by Character foreground. Refresh is presentation-only at about 15 fps. No AI emotion classifier is claimed here; facial expression moves naturally because the actual camera video is inside the Character.

Only KHÓC NHÈ neutral is enabled until the remaining real layered assets/socket measurements exist. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.7 KHÓC NHÈ BOARD FACE-SOCKET PROOF

Current build: `0.1.70.4.61`.
CH-18.6 is green on source CI #3670 and GitHub Pages #111. Repo-history audit recovered the intended CH-02G acceptance path, so CH-18.7 promotes only the already-approved KHÓC NHÈ neutral layered proof onto the live board.

Behavior: no player face => default Character art. If KHÓC NHÈ is selected and neutral `compositeSourceDataUrl` exists, the board composes body-back → non-circular player head fitted through CH-02F socket → irregular alpha mask → foreground. The personalized proof uses a static layered Character with procedural bob/flip during movement; all other Characters keep default art until their real layered exports exist. Do not guess sockets or fake live-camera expression tracking.

Presentation-only. No Host/RNG/B$/movement/passive changes. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.6 BOARD TOKEN QUALITY + FACE-SOCKET RECOVERY

Current build: `0.1.70.4.60`.
Repo audit confirms the older CH-02D/F/G face contract already exists: no player face keeps the default Character; uploaded/camera captures retain a non-circular composite source; final Character composition is body-back → player head → irregular/soft mask/socket → foreground.
Only KHÓC NHÈ neutral currently has real layered proof assets in the repo. The other final layered pose exports remain pending. Current camera code captures 1 or 3 still expressions; continuous live-camera expression tracking is not yet shipped.

CH-18.6 fixes the shippable board issue now: Character render is 96px, exact 2x from the current 48px walk atlas, NEAREST-filtered, foot-anchored, and the P badge is moved clear of the silhouette.

Presentation-only. No Host/RNG/B$/movement/passive changes. Cloudflare Worker remains frozen.

---
# CURRENT CHECKPOINT — 2026-10-05 — CH-18.5 HOLD PORTRAITS

Current build: `0.1.70.4.59`.
CH-18.4 is green on source CI #3667 and GitHub Pages #109. The persistent Jail/Hospital hold banner now shows the active player's uploaded face first or the selected Character portrait as fallback: Jail=ANGRY, Hospital=PANIC. Existing escape rules and authoritative turn flow are unchanged.

Presentation-only. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.4 SPECIAL CONTEXT PORTRAITS

Current build: `0.1.70.4.58`.
CH-18.3 is green on source CI #3666 and GitHub Pages #108. CH-18.4 routes explicit production portrait emotions into contextual landing beats: passive=PASSIVE, hospital fail=PANIC, jail fail=ANGRY, release success=HAPPY, Mini Game entry=SHOCKED. Mini Game ranking also shows the winner's uploaded face first or canonical Character HAPPY portrait as fallback.

Presentation-only. No rule/economy/RNG/Host changes. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.3 PODIUM PORTRAITS

Current build: `0.1.70.4.57`.
CH-18.2 is green on source CI #3665 and GitHub Pages #107. Final podium now preserves uploaded player faces first, then falls back to the selected Character production portrait using the existing rank-driven expression (happy / neutral / angry). Ranking, B$, tie rules and reveal cadence remain untouched.

Presentation-only. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.2 CONTEXT PORTRAITS

Current build: `0.1.70.4.56`.
CH-18.1 is green on source CI #3663 and GitHub Pages #106. CH-18.2 wires the approved Character portrait atlas into live reaction surfaces. Uploaded player faces remain first priority; when absent, Card/News/landing/reaction bubbles use the selected Character's canonical production portrait for neutral/happy/angry instead of initials or emoji. Secret Baby remains concealed before RANDOM reveal.

Presentation-only. No Host/RNG/B$/passive/movement authority changes. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.1 CHARACTER PRODUCTION RUNTIME

Current build: `0.1.70.4.55`.

Five approved character designs are now treated as locked production canon. CH-18.1 integrates real portrait art into Character Select and an 8-frame per-character walk atlas into the active Board token presentation. Secret Baby remains RANDOM-only and is not referenced by normal Character Select. This is presentation-only; no gameplay authority/RNG/economy changes.

GitHub Pages dev playtest may update. Cloudflare Worker remains frozen.

---

# CURRENT CHECKPOINT — 2026-10-05 — CH-18.1 CHARACTER PRODUCTION

Build `0.1.70.4.55` begins the approved Character art cut-over. Character Select now renders production portraits for the four visible starters from a compact runtime atlas derived from the approved sheets. The existing player-face composite proof remains intact, and Secret Baby stays concealed from normal Character Select.

Locked demographics/art authority:
- KHÓC NHÈ — female 55–65.
- CAU CÓ — male 40–50.
- LO LẮNG — male 28–35.
- TĂNG ĐỘNG — female 18–24.
- Secret Baby — infant, RANDOM-only.

Next Character production slice: movement sprite integration + contextual portrait reactions. Do not redesign the cast.

---

# CURRENT CHECKPOINT — 2026-10-04 — CH-17.14 MODE ENTRY HARDENING

Current build: `0.1.70.4.54`.
Ron reported the outer MINI GAME panel felt non-functional. The entry is now hardened so the whole BOARD GAME / MINI GAME card is clickable and keyboard-confirmable, while the CTA button remains a separate explicit target. Runtime coverage now enters Mini Game through the card, returns, enters through the CTA, then starts the selected canonical Mini Game overlay.

Character art production direction is unchanged and uses the five approved Drive concept sheets referenced by `src/content/core/character_art_manifest_v01.ts`. Do not replace those designs with generic new characters.

Keep Cloudflare Worker frozen; GitHub Pages dev playtest may update.

---

# CURRENT CHECKPOINT — 2026-10-04 — CH-17.13 PRESENTATION FEEDBACK REFRESH

Continue MeMeMe from `RVTGMzz/Mmm-BG` on `mmm-mvp-0.1-dev`.

Current build: `0.1.70.4.53`.
Prior validated build: `0.1.70.4.52`, CI #3648 SUCCESS.
CH-17.13 refreshes dice, landing/ready-bonus, generic cinematic fallback, continue/skip chip, floating B$, action line and rarity badge presentation only.

Keep these rules locked:
- GitHub Pages dev playtest may update.
- Cloudflare Worker remains frozen; do not redeploy/update it unless Ron explicitly asks.
- No client gameplay RNG or presentation-owned B$ mutation.
- PR #1 stays Draft/Open.
- Physical two-device online acceptance remains human-owned.

Public test:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# CURRENT CHECKPOINT — 2026-10-04 — CH-17 VISUAL OVERHAUL COMPLETE THROUGH CH-17.10

**GITHUB PLAYTEST LIVE • CLOUDFLARE WORKER STILL FROZEN / NOT REDEPLOYED**

Current authority:
- repo: `RVTGMzz/Mmm-BG`
- active development branch: `mmm-mvp-0.1-dev`
- frozen Cloudflare checkpoint branch: `mmm-mvp-0.1-core`
- build: `0.1.70.4.49`
- phase: `RELEASE CANDIDATE • CH-17.10 GROUP MEDIA REFRESH`
- latest fully validated source/test HEAD: `e5b6e4b6b7afaf892fea7ab7785c5c86bbf5c4ba`
- full CI #3619 / run `37197127116`: **SUCCESS**
- compiled GitHub playtest mirror: `6b8bc1f1b6dc6b97da7790dd016004fc0b7e94b2`
- GitHub Pages #101 / run `37197566079`: **SUCCESS**
- test URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-17 visual baseline — LOCK THIS DIRECTION
Ron supplied cozy/chibi mobile-town references. MMM now uses its own original cozy toy-town presentation language rather than the old prototype white/black wireframe look:
- warm pastel illustrated backdrops;
- thick cocoa outlines;
- cream/peach/mint/lavender paper panels;
- chunky glossy toy buttons;
- sticker/bubble icon treatments;
- rounded cards with layered depth/highlights;
- Vietnamese-safe high-contrast typography;
- presentation-only unless a later task explicitly changes gameplay.

## Completed CH-17 passes
- CH-17 pass 1: Main Menu, Board Lobby, Mini Game Select, Setup, Character Select, Rule Select.
- CH-17.2: Roll For Order — sticker player cards, active highlight, status/ranking preview, toy dice CTA.
- CH-17.3: in-match 4-corner HUD, money/job lanes, active-turn ribbon, turn/dice chrome.
- CH-17.4: News, Card, Job Hub/result, Mini Game shell/header.
- CH-17.5: Board path ribbon/shadow, rounded toy tiles/gloss, Match Recap paper-card.
- CH-17.6: finish transition, final Podium, XEM TỔNG KẾT trigger.
- CH-17.7: CHƠI LẠI / VỀ LOBBY controls + lap completion banner.
- CH-17.8: Splash, Settings, BGM HUD, Online Room.
- CH-17.9: Face Editor, Setup face-entry buttons, Camera Capture.
- CH-17.10: Online Group Media video/avatar strip + Camera/Mic controls.

## Validation / CI
- CH-17.2 through CH-17.10 source gates are registered in CI.
- Runtime browser suite includes CH-17 menu/settings visual assertions and remains PASS.
- CI job timeout was raised from 10 to 20 minutes because the full browser regression suite + Playwright install legitimately exceeded 10 minutes; no gameplay behavior was changed.
- External playtest package, compiled mirror publish, and GitHub Pages deployment are PASS.

## Gameplay/authority contracts still locked
- No client gameplay `Math.random()`.
- HOST/replay authority remains authoritative for gameplay RNG and B$.
- Character passive probability/economy contracts remain unchanged.
- Mini Game payout/economy pacing remains unchanged unless Ron explicitly asks.
- Online Worker/reconnect authority was not rewritten for CH-17 visual work.
- Physical two-real-device acceptance remains human-owned and is not implied by browser CI.
- PR #1 remains Draft/Open and MUST NOT be merged unless Ron explicitly asks.

## Release policy
- Continue development on `mmm-mvp-0.1-dev`.
- GitHub Pages test build may continue updating for Ron's testing.
- Keep currently deployed Cloudflare Worker available for ONLINE tests.
- **Do not deploy/update Cloudflare Worker unless Ron explicitly asks.**

## Recommended next action
Do not blindly redesign more UI. Ask Ron to Ctrl+F5 the GitHub Pages test build and send screenshots of any screen that still feels old, cramped, unclear, or unlike the desired cozy/chibi direction. Refine those screens surgically while preserving the CH-17 baseline above.

---

# CURRENT CHECKPOINT — 2026-10-04 — CH-17 VISUAL REFRESH

**PASS 1 LIVE ON GITHUB PAGES. CLOUDFLARE WORKER REMAINS FROZEN / NOT REDEPLOYED.**

Current authority:
- repo: `RVTGMzz/Mmm-BG`
- active development branch: `mmm-mvp-0.1-dev`
- frozen Cloudflare production checkpoint branch: `mmm-mvp-0.1-core`
- build: `0.1.70.4.40`
- phase: `RELEASE CANDIDATE • CH-17 VISUAL REFRESH`
- validated source/test HEAD: `95d71bff027db4bbcbcc10e5bf90a72815457bb5`
- full CI #3510 / run `37177351530`: **SUCCESS**
- compiled GitHub playtest mirror: `c2058d5caeed4e55612c37d71f558b83a4d992cc`
- GitHub Pages #93 / run `37177648940`: **SUCCESS**
- test URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## New locked visual direction
Reference intent from Ron: cozy/chibi mobile-town UI inspired by the supplied Piggy Town / farming-game references, while using original MMM presentation rather than copying their assets.
- warm pastel backgrounds and illustrated shape layers;
- thick cocoa outlines instead of harsh prototype-black;
- cream/peach/mint paper panels;
- chunky glossy buttons with layered depth;
- sticker/bubble icon treatment;
- playful rounded cards with clear header strips;
- high contrast Vietnamese-safe typography;
- presentation-only unless a later task explicitly changes gameplay.

## CH-17 pass 1 now applied
- GameModeMenuScene
- LocalLobbyScene / Board lobby
- MiniGameQuickScene
- SetupScene shell
- Character Select surface
- Rule / match-length select
- shared Visual Foundation buttons/inputs
- online-room panels receive the new material language
- new illustrated-shape Phaser background helper: `paintToyTownBackdropCh17`
- new CSS layer loaded last: `visualRefreshCh17.css`
- browser evidence/gate: `tests/runtime/visual-refresh-ch17-ui.mjs`
- Quick Mini Game 3+2 layout remains locked and readable.

## Next visual targets
1. In-match HUD/player corners and top bar.
2. Card / News / Job / Mini Game modal material so they match CH-17.
3. Board tile chrome, dice/turn controls and floating currency.
4. Podium / Match Recap visual pass.
5. Replace temporary emoji/icon bubbles with original MMM illustrated assets once approved/generated.

## Backend/release policy
- Continue routine work on `mmm-mvp-0.1-dev`.
- GitHub Pages test build continues to update from dev.
- Keep the currently deployed Cloudflare Worker online for optional ONLINE testing.
- Do **not** deploy/update Cloudflare Worker unless Ron explicitly asks.
- PR #1 remains Draft/Open and must not be merged unless Ron explicitly asks.

---

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
