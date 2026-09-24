# Mmm-BG — HANDOFF CURRENT

## September 24 approved Character concept art authority

Ron uploaded the approved concept sheets to a shared Google Drive folder so the repo does not accumulate repeated large binary revisions.

Canonical Drive folder:
`https://drive.google.com/drive/folders/1NGZQXRXWSiKGVNjjDawJzvnboFcfZHoN?usp=drive_link`

Canonical manifest:
`docs/art/character-concepts/README.md`

Approved current files:
- `khocnhe.webp`
- `cauco.webp`
- `lolang.webp`
- `tangdong.webp`
- `embe.webp`

These five WebP references total under 1 MB, but the binary art remains in Drive. Git stores only the manifest/spec links. Treat Drive art + `docs/VISUAL_STYLE_BIBLE_V0.1.md` as the visual authority for upcoming Character Select, face-composite, pose and Secret reveal work. Do not silently regenerate a different Character design.

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
Branch: `mmm-mvp-0.1-core`  
Legacy PR #1: **Draft/Open**. Do not merge or mark Ready unless Ron explicitly asks.

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

## Previous presentation checkpoint

**0.1.70.4.22 — Presentation Single Owner + Safe Reactions**

Status: **SOURCE + PUBLIC PAGES DEPLOYED / CI PASS / RUNTIME RETEST REQUIRED**

Current validated **source/CI/Public Pages** HEAD:
`b86d9b5283658953b2b17fee52173acae858e21f`

Validated source checkpoint:
- MMM MVP CI **#3212**
- run `35832680818`
- source head `81341ad5c12604ba878f13b5b7a599e1897ecc7a`
- conclusion: **SUCCESS**
- typecheck/build and the new .22 gate passed
- follow-up Job Hub Enter/Space code commit `f1b94158ed273d7347795a72c29e9af0bd8fbc63`: MMM MVP CI **#3213** (`35832935529`) **SUCCESS**, including Job input and .22 presentation gates
- published mirror `05dc1532f7ef9dda39392f0ca9a44dc3204b1f21`: Pages **#17** (`35833039190`) **SUCCESS**

Do **not** call Runtime PASS until Ron retests the exact overlay/reaction cases in browser.

## September 23 keyboard-only Job Hub acceptance

Ron clarified the requirement: *no mouse is needed to finish Job selection*, not merely an extra Enter/Space shortcut. The default **visible keyboard focus is the DICE button**, so Enter/Space immediately requests the authoritative Job D6. Arrow keys and Tab/Shift+Tab move the visible in-game focus between the three offered Job cards and the dice; Enter/Space on a card opens full details, and Enter/Space/Escape/Backspace on details closes them and restores card focus. Arrow Down from any card returns directly to dice. A/B/C and 1/2/3 remain quick shortcuts to the card details. Pointer input still works. Spectators may inspect details but cannot focus/activate the dice.

Source: `src/ui/JobChoicePicker.ts`, pure navigation policy `src/ui/jobHubFocus070423.ts`, regression `tests/job-minigame-input-070410.ts`.

- Source commit: `a91fbb10ffaaa9710393f541e6b1017b0459ec01`.
- MMM MVP CI **#3215** (run `35840449469`): **SUCCESS**.
- Public compiled mirror: `636c4662b72c8adecae7f5d26f7b0421fe99a7a2`.
- Pages **#19** (run `35840548534`): **SUCCESS**.
- **Runtime human acceptance still required**: without touching the mouse, open Job Hub, press Enter for the default dice; on a separate fresh Job Hub use Up to highlight B, Left/Right to browse A/B/C, Enter to open detail, Escape or Enter to close it, Down to return to dice, then Enter to roll. Also check Tab, Shift+Tab, Space, spectator state and mouse fallback.
- Preserve the original Host-owned Job D6, CPU autoplay and online ownership. PR #1 stays Draft/Open.

## September 23 visual follow-up: Mini Game duel + single-ring Lap Shuffle

Ron re-sent three runtime screenshots: (1) the OẲN TÙ XÌ duel layout had names/result crowded against card rims and undimmed corner HUD, (2) a long News/Card narrative could appear to the left of the canonical card, and (3) post-shuffle circles had mismatched double category-colour rims.

**Validated source:** `e1a965e2869d29461c834d1f07255bd3498ec5a3`
**MMM MVP CI #3214:** run `35836401072`, SUCCESS.
**Public mirror:** `a24b90417b018198651f61bb0e1e8d75fb36412b`.
**GitHub Pages #18:** run `35836498719`, SUCCESS.

What is now implemented:
- `src/ui/MiniGameOverlay.ts`: the fullscreen Mini Game root is a named, depth-1500 modal above HUD depth 1000. OẲN TÙ XÌ has smaller 226x190 cards, names in a separate row, a dedicated bottom result/replay rail, and Vietnamese-safe type.
- `src/ui/miniGameLayout070423.ts` defines a pure, geometry-tested layout for both cards, player labels and the result footer.
- The .22 final modal guard now recognizes the real `minigame-modal` as the top owner, so prior presentation text cannot leak over a Mini Game.
- `src/scenes/CareerMinigameBoardScene07044.ts`: Lap Shuffle repaints each existing depth-4 canonical circle and depth-5 label in place. It does NOT stack a second radius-34 disc over the original category-coloured rim; original radius, coordinates, path geometry and locked nodes are retained. Fallback circle is only used if an original circle truly does not exist.
- The long News/Card narration issue had already received the **0.1.70.4.22** source-level fix (duplicate toast producers disabled, geometry-safe named reactions, exact event ownership and POST_UPDATE modal guard). This patch does not claim an additional unverified runtime fix for that screenshot.

Automated regression:
- `tests/job-minigame-depth-059.ts`: pure duel geometry and full-screen modal depth.
- `tests/roguelike-lap-shuffle-071.ts`: base-circle in-place recolouring, label update, and circular fallback.
- `tests/presentation-owner-rootfix-070422.ts`: Mini Game is a named high-priority modal owner.

**All automated gates pass; real-browser visual acceptance is still pending.**

Fresh browser acceptance:
1. Hard-refresh the Pages playtest and run RPS with both tie and winner. Both names must clear card tops, no replay text may cover the upper rims, and HUD must sit behind the dimmer.
2. In Job Hub, Enter and Space must roll exactly once when permitted; A/B/C and Escape still inspect/close detail. Spectator/waiting cannot roll.
3. Play several different TIN TỨC / LÁ BÀI with long and transfer descriptions. There must be no separate sentence floating to the left or behind the canonical modal. Rapidly skip events to catch stale reactions.
4. Complete a lap. Check that all mutable shuffled circles have ONE border, no older category ring, correct new colour and icon. Confirm locked nodes preserve identity.
5. Repeat visuals on landscape mobile and after reconnect if available.

Retain production Worker .20 and online authority untouched. PR #1 remains Draft/Open; do not merge. Do not resume 0.1.71 until runtime acceptance.

## September 23 follow-up: Job Hub keyboard hotfix

The user's Job Hub dice button accepted clicks but the hub's keyboard handler only handled A/B/C/1/2/3 and Escape. The separate Mini Game keyboard test did not cover the Job dice button.

Source: `src/ui/JobChoicePicker.ts`.
- Job dice button and Enter/Space now call the same guarded `submitRoll()` action.
- Repeated keys, spectators/waiting turns, and an open Job detail cannot trigger a roll.
- The key suppresses browser default only when an authorized roll is available.
- Existing A/B/C/1/2/3 detail shortcuts and Escape-to-close stay intact.
- Regression in `tests/job-minigame-input-070410.ts`.
- CI #3213 and public Pages #17: SUCCESS.

**Runtime retest required:** press Enter and Space separately in a fresh Job Hub; verify only one authoritative roll each time. Confirm keyboard does nothing in a spectator's waiting panel and while Job detail is open. The keyboard hotfix does not claim to fix the user's broader layout or decorative border feedback.

## Why the recurring overlay bug kept returning

This was not one bad TIN TỨC/LÁ BÀI item.

Root causes found in `docs/PRESENTATION_OWNERSHIP_AUDIT_070422.md`:

1. **Two independent visual feedback producers existed.**
   - `showEventToast()` had already been disabled.
   - `showDeltaToast()` was still alive and could draw another label for the same state packet.
   - .22 disables both legacy toast producers before inherited `super.create()`, while retaining log telemetry.

2. **Old reaction safe-area tests checked vertical spacing but missed horizontal collision.**
   - historical bubble: 328px wide centered at x=188
   - right edge = 352
   - widest canonical modal begins at x=258
   - so the reaction physically intruded 94px into the main modal.

3. **Delayed reaction callbacks were not tied tightly enough to their originating event.**
   - a stale reaction timer could survive event transition and appear over the next Card/News.
   - .22 binds delayed reaction render/dismiss to the exact `PresentationEventModel`.

4. **The final modal guard had permissive depth/emoji/text heuristics.**
   - .22 only allows the exact continue hint plus explicitly named canonical reaction containers.
   - final ownership is rechecked in Phaser `POST_UPDATE`, after inherited wrappers.

## .22 source changes

### New geometry policy
`src/ui/presentationLanes070422.ts`

- pure deterministic geometry helper
- 1280x720 canonical UI viewport
- 212x116 reaction bubbles
- left/right side rails fully outside the largest Card/News modal
- reserves active top/bottom HUD areas
- reserves viewport margins
- if the viewport cannot fit a legal rail, the secondary reaction is hidden instead of covering the main event

### Canonical presentation
`src/ui/MatchPresentationLayer.ts`

- reaction callback receives its originating model
- stale event reaction cannot render after model changes
- canonical reaction container name:
  `presentation-reaction-bubble-070422`
- no `Math.random()`
- no gameplay authority/RNG changes

### Legacy producer cleanup
`src/scenes/PresentationParityBoardScene.ts`

Before inherited create:
- `legacyToast.showEventToast = () => undefined`
- `legacyToast.showDeltaToast = () => undefined`

The event log remains available. Only duplicate on-screen legacy UI is retired.

### Final-frame ownership
`src/scenes/CareerMinigameBoardScene07044.ts`

- final modal ownership guard also runs at `POST_UPDATE`
- entire legacy Card/News overlay containers are retired when a canonical modal owns the screen
- arbitrary depth-910 or emoji/text content is no longer whitelisted
- exact continue hint is allowed
- only named canonical safe-rail reactions are allowed

## Regression gates

Primary new gate:
`tests/presentation-owner-rootfix-070422.ts`

It checks:
- old 328px geometry is demonstrably invalid
- P1/P2/P3/P4 reaction rectangles fully fit outside the modal and HUD
- fallback reactions fit
- small viewport returns `null`, not an overlapping panel
- both legacy toast producers are disabled before inherited create
- reaction timers require exact model identity
- final whitelist is object/owner based
- final POST_UPDATE ownership guard exists

Retained tests were updated so they no longer bless the old x188 / 328px geometry:
- `tests/presentation-layout-lock-070414.ts`
- `tests/presentation-spacing-070415.ts`
- `tests/presentation-semantic-footer-070416.ts`
- `tests/presentation-adaptive-safearea-070418.ts`
- `tests/runtime-release-guard-070419.ts`

## Other retained current work

### Visual Foundation
Canonical docs:
- `docs/VISUAL_STYLE_BIBLE_V0.1.md`
- `docs/VISUAL_FOUNDATION_PASS_0.1.md`

Implemented:
- VF-01 shared tokens
- VF-02 button family
- Vietnamese-safe system UI typography

Next visual stage after runtime UI stability:
- **VF-03 panel/modal shell**
- then player HUD
- then one canonical TIN TỨC
- then one canonical Job
- only then propagate across the game

Do not reskin everything at once.

### Roguelike Lap Shuffle 0.1
Implemented and deterministic:
- first player reaching Start for a lap triggers one global reshuffle for that lap
- locked: Start, Job, Police/Jail gate+hold+3 exits, Hospital gate+hold+3 exits
- mutable: News, Card, money, Mini Game, Lottery, normal spaces
- HOST serializable RNG only
- checksum/replay/reconnect covered
- circular-tile visual hotfix already landed
- still needs runtime acceptance after a full lap

## Runtime tests for the next chat

Priority 1, reproduce the exact recurring presentation bug:
1. Trigger several different TIN TỨC and LÁ BÀI, not only previously reported items.
2. Confirm there is only one main modal owner.
3. Confirm no old delta/event toast leaks behind/left of the card.
4. Confirm P1/P2/P3/P4 reaction bubbles remain in side rails and never cross the main modal or HUD.
5. Rapidly skip several Card/News events. An old event reaction must never appear on the next event.

Priority 2:
6. Recheck Job Hub / nhận việc layout.
7. Recheck Enter/Space Job Hub roll on keyboard, A/B/C details, Escape close, and spectator/waiting protection.
8. Complete one lap and confirm every shuffled tile remains circular.
9. Retest online P1/P2 ownership/reconnect/media when convenient.

Public playtest URL remains:
`https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Production Worker remains the retained .20 Worker integration. Do not rewrite online authority while fixing presentation.

Keep visible game vocabulary:
**TIN TỨC / LÁ BÀI**

Do not merge PR #1.
