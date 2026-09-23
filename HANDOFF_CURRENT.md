# Mmm-BG — HANDOFF CURRENT

Repository: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-core`  
Legacy PR #1: **Draft/Open**. Do not merge or mark Ready unless Ron explicitly asks.

## Current checkpoint

**0.1.70.4.22 — Presentation Single Owner + Safe Reactions**

Status: **SOURCE IMPLEMENTED / LAST FULL CI SUCCESS ON FUNCTIONALLY EQUIVALENT SOURCE / HEAD CI RUNNING / RUNTIME RETEST REQUIRED**

Current branch HEAD at handoff preparation:
`81341ad5c12604ba878f13b5b7a599e1897ecc7a`

Latest completed full CI success before the final test-only assertion cleanup:
- MMM MVP CI **#3211**
- run `35830428531`
- head `15d26c2b2d11a414ad3a6d027fc02f567ff08a9d`
- conclusion: **SUCCESS**

Current HEAD validation:
- MMM MVP CI **#3212**
- run `35832680818`
- head `81341ad5c12604ba878f13b5b7a599e1897ecc7a`
- was still running when this handoff was written
- the HEAD delta after the successful run is test/assertion cleanup only, not gameplay authority

Do **not** call Runtime PASS until Ron retests the exact overlay/reaction cases in browser.

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
7. Recheck keyboard roll on Job choice flow.
8. Complete one lap and confirm every shuffled tile remains circular.
9. Retest online P1/P2 ownership/reconnect/media when convenient.

Public playtest URL remains:
`https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Production Worker remains the retained .20 Worker integration. Do not rewrite online authority while fixing presentation.

Keep visible game vocabulary:
**TIN TỨC / LÁ BÀI**

Do not merge PR #1.
