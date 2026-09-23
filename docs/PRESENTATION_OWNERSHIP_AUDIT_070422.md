# Presentation Ownership Audit 0.1.70.4.22

Status: **SOURCE PATCHED / CI VALIDATION / RUNTIME RETEST REQUIRED**

This audit addresses the recurring left-side narration/reaction overlap across arbitrary TIN TỨC and LÁ BÀI, not just the cards in the playtest screenshots.

## Why earlier fixes kept regressing

The visible problem was not a single bad card or a single missing clamp. Three independent producers/races remained live below multiple inherited presentation wrappers:

1. **Two visual pipelines for the same state packet.** `PlaytestDemoBoardScene.presentStateDeltas()` still called `showDeltaToast()`. The canonical `MatchPresentationLayer` displayed Card/News at the same time. `PresentationParityBoardScene` had disabled the old `showEventToast()` but missed the *other* delta-toast producer, so new events could create another label regardless of prior Text-hiding patches.

2. **Reaction geometry was validated in only one dimension.** The old 328px reaction at x188 reached x352, but the largest canonical Card/News panel began at x258. This means a 94px horizontal intrusion even though the old top/bottom safe-area tests passed. Depth910 deliberately drew that balloon above the cinematic at depth900. No content-specific text fix could solve the geometry.

3. **Delayed reactions were not tied to the event that created them.** The timer callback only required that some `currentModel` existed. If an event was skipped or ended and a new one started, the stale reaction could appear during an unrelated card. The last .21 guard relied on permissive text/emoji/depth whitelists, so an unrelated label might also survive.

The long chain of `068 -> 0681 -> 0682 -> 069 -> 0701 -> 07044` inherited wrappers hides/restores Text at several different times. Adding more content-specific exclusions was masking symptoms.

## .22 fixes at their source

- Disable **both** legacy toast renderers before the inherited source registers network-state callbacks, while preserving log telemetry and authoritative state.
- Use `src/ui/presentationLanes070422.ts`: a single pure safe-area policy with 212x116 reaction bubbles. Reserve the entire central modal including a 20px gap; also reserve both top/bottom active-HUD regions and the viewport margins.
- Bind every delayed reaction callback and its dismissal to its original `PresentationEventModel`. Old-event callbacks cannot render over the next News/Card.
- Every canonical reaction has an explicit `presentation-reaction-bubble-070422` owner name; unregistered depth910/emoji/Text labels are not permitted.
- Apply the final modal guard again during Phaser `POST_UPDATE`, after inherited scene updates. Retire entire legacy Card/News overlay containers when the real modal is present instead of trying to hide just their Text children.
- If a particular viewport cannot fit a legal reaction rail, suppress that secondary bubble rather than covering the main event.

## Regression checks

`tests/presentation-owner-rootfix-070422.ts` tests actual full panel boundaries for P1–P4 across 12 reaction indices and fallback speakers. It deliberately proves that the historical 328px bubble fails the width check. The test checks that duplicate producers are off, late callbacks have exact event ownership, the last-frame guard is installed and the whitelist is based on object identity.

The retained .14/.15/.16/.18/.19 checks were updated to require the current safe-lane geometry rather than continually accepting the original flawed x188/328px placement.

## Non-goals and safety

No `submitIntent`, host-authority, RNG, reconnect, WebRTC or Lap Shuffle rules were changed. This is a presentation-only correction. Job Hub, avatar and movement controls are not redesigned in this patch.

## Runtime acceptance before PASS

1. Trigger various TIN TỨC and LÁ BÀI, including long titles and money-transfer effects. No standalone event/delta toast may float behind or beside the canonical modal.
2. Verify reaction balloons for P1, P2, P3 and P4 stay inside the side rails and do not collide with the event card or corner HUD.
3. Quickly skip multiple Card/News events using Enter/Space/click. An old event's reaction must never appear in the next event.
4. Verify Job result/details, token badges, CPU turns and normal text return when the blocking card closes.
5. Retest after one Lap Shuffle and with two online devices. The same presentation ownership rules apply to arbitrary newly selected tile content.

**CI PASS does not mean Runtime PASS.** Validate the above on the public build and preserve PR #1 as Draft/Open.
