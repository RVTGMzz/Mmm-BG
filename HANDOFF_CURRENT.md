# Mmm-BG — HANDOFF CURRENT

Repository: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-core`  
Legacy PR #1: **Draft/Open**. Do not merge or mark Ready unless Ron explicitly asks.

## Current checkpoint

**0.1.70.4.22 — Presentation Single Owner + Safe Reactions**

Status: **SOURCE + PUBLIC PAGES DEPLOYED / CI PASS / RUNTIME RETEST REQUIRED**

Current validated runtime source HEAD:
`e1a965e2869d29461c834d1f07255bd3498ec5a3`

Validated source checkpoint:
- MMM MVP CI **#3212**
- run `35832680818`
- source head `81341ad5c12604ba878f13b5b7a599e1897ecc7a`
- conclusion: **SUCCESS**
- typecheck/build and the new .22 gate passed
- follow-up Job Hub Enter/Space code commit `f1b94158ed273d7347795a72c29e9af0bd8fbc63`: MMM MVP CI **#3213** (`35832935529`) **SUCCESS**, including Job input and .22 presentation gates
- published mirror `05dc1532f7ef9dda39392f0ca9a44dc3204b1f21`: Pages **#17** (`35833039190`) **SUCCESS**

Do **not** call Runtime PASS until Ron retests the exact overlay/reaction cases in browser.

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
