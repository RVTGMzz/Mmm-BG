# Mmm-BG — Latest Handoff

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
Branch: `mmm-mvp-0.1-core`  
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
- branch: `mmm-mvp-0.1-core`
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
