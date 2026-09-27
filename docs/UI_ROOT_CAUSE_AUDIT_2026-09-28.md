# MMM — UI ROOT CAUSE AUDIT — 2026-09-28

## Conclusion

The long-running UI regressions are not primarily a typography or coordinate-tuning problem.

The active board scene is an **accreted inheritance stack** where many historical hotfix scenes still execute every frame and mutate the same live Phaser objects. New fixes are repeatedly applied on top of old writers instead of replacing them.

This architecture makes local fixes unstable and explains why:
- a source patch can be correct in isolation;
- CI and isolated browser screenshots can pass;
- the actual played scene can still be changed again by inherited update/polish/guard code.

Do not continue adding cosmetic hotfix layers to the current chain.

## 1. Active scene has approximately 35 inheritance layers

`src/main.ts` boots:
- `CareerMinigameBoardScene07044`

The actual inheritance path is:

`07044 -> 0701 -> 069 -> 0682 -> 0681 -> 068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> 046 -> 045 -> 044 -> 043 -> 042 -> 041 -> 040 -> 039 -> 037 -> CareerMinigameBoardScene`.

This is not a version archive. These classes remain live because every subclass calls inherited behavior.

## 2. Many layers rewrite presentation every frame

Examples from the live chain:

- `065.update()`: `syncCareerHud065()`, `polishUiTree065()`, rounded text/rect sync.
- `066.update()`: `polishPresentation066()`.
- `067.update()`: `polishJobPresentation067()`.
- `068.update()`: `guardCanonicalModal068()`.
- `0681.update()`: `syncReadableHud0681()`, `syncModalDeclutter0681()`.
- `0682.update()`: `syncStrictModalOwnership0682()`.
- `069.update()`: HUD, card visibility, Job Hub and Job result polish.
- `0701.update()`: release repair, compact card sync, Mini Game ranking polish.
- `07044.update()`: legacy overlay retirement, cinematic ownership, mobile layout, HUD safe area, final modal ownership.

Older layers also run camera, money-label and special-location corrections.

The source comments themselves repeatedly say things such as:
- run after inherited presentation/HUD writers;
- prevent legacy text from being recreated on the next frame;
- final presentation pass because an earlier wrapper may recreate loose narration.

That means the code already acknowledges a writer-vs-writer race.

## 3. “Single owner” is currently implemented by suppression, not by removing old owners

There are several presentation systems still present:
- `MatchPresentationLayer`;
- canonical Card/News builders in `07044`;
- canonical Job builder in `07044`;
- `MiniGameOverlay`;
- inherited legacy Job/Card/News text;
- HUD/presentation cleanup guards in 067/068/0681/0682/069/0701/07044.

Many newer fixes hide, destroy, restore or re-hide objects produced by older layers.

This is why the same symptoms recur:
- loose text returns;
- a canonical body disappears after being created;
- a layout is correct for one frame and wrong after update;
- a fix for one modal affects another.

## 4. CI gave false confidence because most visual gates are structural

A large part of the UI regression suite reads TypeScript source and asserts that certain strings/patterns exist.

Those tests prove that a patch is present, but they do not prove what the final rendered frame looks like after the complete inheritance/update chain executes.

Historical failures often resulted in updating an old source assertion to accept the newest implementation. This kept CI green without creating a full-scene visual oracle.

## 5. Even the new Playwright browser gate bypasses the actual failure environment

`tests/runtime/modal-surfaces.ts` looks stronger because it uses real Phaser rendering.

However its `SurfaceScene`:
- extends `CareerMinigameBoardScene07044`;
- does **not** call `super.create()`;
- directly invokes individual private/canonical producers;
- explicitly defines `update() {}`.

The file even documents that this is done to invoke producers “without unrelated board authority.”

That means the browser fixture deliberately disables the inherited update chain that is the primary suspect.

So:
- Card fixture validates the Card producer alone;
- News fixture validates the News producer alone;
- Job fixture validates the Job producer alone;
- Mini Game fixture validates `startMiniGameOverlay` alone.

It is not a full match / full active scene visual test.

This explains how WebGL + Canvas pixel tests can pass while Ron's played game still fails.

## 6. The September 27 scroll-mask bug was real, but it was only one layer

Replacing manual world-coordinate GeometryMask with local Text crop in `0294a946...` is a reasonable component-level fix.

It does not solve the larger ownership problem because the live scene still inherits all presentation writers listed above.

The same applies to the density fixes in `f0f1814...`: they improve the isolated producers but do not remove competing runtime mutation.

## 7. Why stronger models did not solve it

The limiting factor was not model intelligence.

Each session was given a local symptom and a codebase whose historical structure encourages a new wrapper/hotfix. The rational local action was:
1. patch the latest writer;
2. add another regression assertion;
3. keep every older behavior for safety.

That process steadily increased the number of live UI writers.

A stronger model can produce a better patch and still lose to a later inherited writer during the next frame.

## 8. Required architectural reset

### Phase A — Freeze visual feature work
Do not add:
- another versioned presentation wrapper;
- another hide/restore guard;
- another title-specific Card/News rule;
- another source-string “visual acceptance” test.

Gameplay/network/authority can remain frozen and preserved.

### Phase B — Establish one canonical UI owner
Create a new consolidated active board presentation scene/module.

Preferred migration boundary:
- keep the validated gameplay/authority behavior;
- explicitly port required non-visual fixes;
- do not inherit presentation hotfix layers 067/068/0681/0682/069/0701/07044 as live writers.

Card/News, Job, Mini Game, HUD and reactions each get exactly one render owner.

### Phase C — Separate update domains
The frame loop should have explicit categories:
1. authority/game state sync;
2. camera/token sync;
3. one presentation coordinator;
4. no historical presentation rewrite passes.

No component may “repair” another component after render.

### Phase D — Build a real full-scene visual regression
Playwright must launch the same scene/path as the public game, call normal `super.create()` and normal `update()`, and trigger events through the real presentation/event pipeline.

Required screenshot cases:
- long + short News;
- long + short Card;
- Job offer/result;
- Mini Game result/ranking;
- Roll For Order;
- reaction lanes;
- 1280x800 Steam Deck viewport.

The test must fail on:
- text outside paper bounds;
- missing body;
- clipped first glyph;
- overlap;
- unreadably small helper copy;
- large empty-space ratio for short content.

Isolated producer tests may remain as unit tests, but they cannot be called runtime acceptance.

## 9. Recommended first implementation step

Do not touch typography first.

First create an **ownership inventory** for every object written by 065 through 07044 and classify each writer as:
- KEEP authority;
- KEEP canonical presentation;
- DELETE/disable legacy presentation;
- MIGRATE once.

Then cut the inheritance-based presentation writers out of the live path.

Only after the live frame has one owner should spacing/font/scroll work resume.

## Status

This audit changes documentation only. Runtime source is not modified.

Current source before audit:
- branch head documentation: `1477b0acb22085a5f95cd3d18cf00de1a2c9c5e0`
- runtime implementation: `f0f1814b736da53fac95e78b6161a899a452d998`

Ron reports the UI problem remains unresolved. Treat real-device acceptance as FAIL until a full-scene architecture reset is validated.
