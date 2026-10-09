# CHECKPOINT — 2026-10-09 — CH-18.24 CAU CÓ SILHOUETTE CORRECTION

Repo `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-dev`; build `0.1.70.4.78`.
Baseline last FULL green: CI #3870 for `c38080462aa9bc737e7f108266a7c460e27f5135` (.77).
This .78 slice is NOT declared green until latest CI reaches artifact + publish.

User rejected distorted CAU CÓ artwork. Do not claim the old independently invented 18 SVG parts are canon-accurate simply because code/animation CI passes. Use the actual approved source `docs/character-production/canon/cauco.webp`. Specifically: viewer-LEFT low leather bag, shoulder-draped SHORT olive jacket (not full-length), gold glasses, swept salt-pepper hair, stern male age 40–50, formal suit, long pants and loafers.

Changes: `src/content/core/character_rig_manifest_ch1822.ts` now includes explicit `geometryLock`; `src/ui/characterRigCh1822.ts` scales jacket down 0.90×0.82, scales satchel down 0.76×0.55, moves satchel to x=-49/y=110, paints it in front of torso/leg layers, and reduces coat/bag swing. `tests/character-rig-silhouette-ch1824.ts` statically enforces geometry/reference identity; browser QA `tests/runtime/character-production-board-ui.mjs` generates `runtime-ui-evidence/cau-co-rig-vs-canon-ch1824.png` beside original concept.

Critical: current SVGs remain **manually approximated vector illustrations**, NOT professionally separated layers of canon illustration; must review screenshot evidence & improve/redraw source parts further before production cut-over. Default sprite production fallback unchanged; QA mode `?cauCoRigPreview=1` only. Do not change face socket/live camera, SECRET BABY RANDOM rules, active ring position, or Cloudflare Worker.

Next: check final HEAD CI for real failed steps; inspect reference-vs-rig evidence and fix any silhouette mismatches; get human art sign-off before enabling rig by default.

---

# CHECKPOINT — 2026-10-09 — CH-18.23 CAU CÓ RIG QA GREEN

Repository: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Build: `0.1.70.4.77 — CH-18.23 CAU CÓ CANON RIG QA`  
Last fully verified **code** commit: `c38080462aa9bc737e7f108266a7c460e27f5135`  
Final full CI: **#3870 SUCCESS** — https://github.com/RVTGMzz/Mmm-BG/actions/runs/37914562321

### Release verification
- Typecheck/build, CH-18.22 separated-part rig source QA, CH-09 release gate, **full browser regression**, playtest-package validation, artifact upload, and compiled mirror publish all PASS.
- Build artifact: `mmm-playtest-0.1.70.4.77-ch18-23-cau-co-canon-rig-qa`.
- Compiled mirror commit: `822ae871eab5c2516b2681b7fdae831d4568ab46` (`Publish compiled playtest c380804`).
- Mirror GitHub Pages run **#125 SUCCESS**: https://github.com/ronvotri/MeMeMe-Web-Playtest/actions/runs/37915626750
- Live QA entry: https://ronvotri.github.io/MeMeMe-Web-Playtest/?cauCoRigPreview=1
- Normal play entry: https://ronvotri.github.io/MeMeMe-Web-Playtest/

### Fixes since previous handoff
- Previous browser QA failed on SECRET BABY crawl orientation because right/left screenshots came from **fixed timer offsets**, which could capture after motion reversed.
- `tests/runtime/character-production-board-ui.ts` now records crawl frames and direction only on real movement frames after the inherited Board update; retains independent QA previous positions so the inherited match-state coordinates cannot mask motion.
- Observed right/left movement of CAU CÓ's puppet rig is recorded separately using its own motion delta. QA waits for real observed directions and 2+ distinct crawl frames.
- `tests/runtime/character-production-board-ui.mjs` checks measured motion sign and actual sprite flip/pivot behavior.
- CI runs the Character browser test **first** after Vite starts, ahead of long full-scene screenshots, for faster failure diagnostics.
- No production art or gameplay changes in this QA-fix slice.

### Production policy / next steps
- CAU CÓ remains a **preview-only, independently articulated 18-part SVG rig**, with separately authored head/hair/glasses, jacket, torso, arms, legs, shoes and satchel.
- Motion: folded-arm stern idle with 2200ms breathing; eased idle-to-walk, independent hip/knee/shoulder/elbow pivots; coat/satchel lag.
- The illustration has improved canon detail but **is not artist-approved / production-admitted**. Must visually review enlarged and at Board 104×104 against `docs/character-production/canon/cauco.webp`; fix proportional/layer errors before default cut-over.
- `?cauCoRigPreview=1` enables test rig; absent flag keeps old production-strip fallback.
- After art sign-off, assess migrating KHÓC NHÈ, LO LẮNG, TĂNG ĐỘNG with separate rigs. SECRET BABY needs a distinct crawling-infant rig; never make it a walking toddler.
- Maintain active ring **under feet**, and preserve face socket/live camera, Secret Baby RANDOM-only/5% HOST authority/max-one constraints.
- **Do not deploy or modify Cloudflare Worker.**

---

# NEW CHAT START HERE — 2026-10-09 — CH-18.23 CAU CÓ CANON RIG DETAIL QA

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Build: `0.1.70.4.77 — CH-18.23 CAU CÓ CANON RIG QA`

## Why CH-18.22 CI failed
Run #3855 reached browser QA and failed on `SECRET BABY ring width drifted`. The previous code borrowed scaleX from an old/hidden large legacy halo, over-scaling the new 78×18 under-foot ring. `syncCharacterTokenPresentationCh189` now clamps the inherited pulse into 0.94–1.08, keeping ring visible for active turn owner below character body. Earlier source build and CH-18.22 rig source test passed. Runtime on new HEAD must be checked, not claimed green in advance.

## CH-18.23 changes
- Art source `scripts/materialize-cau-co-rig-ch1822.mjs` upgraded with more canon-accurate original vector layers. It still generates 18 **independently editable** transparent SVG layers, not extracted cutouts from the old 48px/192px strips.
- CAU CÓ canon authority: `docs/character-production/canon/cauco.webp`, male 40–50, stern face, thick brows, salt-and-pepper hair, rectangular gold glasses, moustache/beard, olive pinstripe draped suit with gold crown pin, white shirt/suspenders, crown-pattern tie, brown pleated pants/loafers, crown leather briefcase, emerald ring, gold wristwatch.
- `src/content/core/character_rig_manifest_ch1822.ts` locks these visual anchors, with `productionApproved: false`.
- `src/ui/characterRigCh1822.ts` adds smooth idle-to-move blending, stern folded-arm idle, subtle chest breathing over 2200ms, distinct shoulder/elbow and hip/knee rotations, alternating foot lifts and coat/bag lag.
- `tests/character-rig-ch1822.ts` now checks signature canon graphic details, rig blend/fold animation and bounded active ring pulse.
- Runtime QA preview stays behind `?cauCoRigPreview=1`, without flag uses prior CAU CÓ production strip. Await visual human approval for revised QA vector art before cutover.
- SECRET BABY RNG 5%/random-only, face socket/live camera, gameplay authority unchanged.
- Do not deploy Cloudflare Worker.

## Next
1. Check CI on final .77 HEAD, fix real new-run failure if any.
2. Inspect runtime screenshot `runtime-ui-evidence/cau-co-rig-ch1822-qa.png`, evaluate whether clothing proportions, foot plant, animation and ring work at board scale.
3. Improve/manual redraw layers if they still differ from canon. Do not label pilot vector art as production.
4. Only after CAU CÓ visuals are approved, migrate the remaining starter characters to separated rigs; SECRET BABY needs distinct crawl rig.

Public mirror (only after passing upload/publish):
https://ronvotri.github.io/MeMeMe-Web-Playtest/?cauCoRigPreview=1

---

# NEW CHAT START HERE — 2026-10-09 — CH-18.22 CAU CÓ PART-RIG PILOT

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Build: `0.1.70.4.76 — CH-18.22 CAU CÓ RIG PILOT`

## Objective
User rejected full-frame cutout strip animation and requested independently articulated character parts. We are migrating carefully; do not declare preview art production-approved or change canon silhouette.

## CH-18.22 implemented
- Corrected real active foot-ring bug: `syncCharacterTokenPresentationCh189` used hidden legacy halo visibility as source, making ring disappear after first update. Now active state is `player.id === currentPlayer()?.id`. Ring stays below token.
- Added `src/content/core/character_rig_manifest_ch1822.ts` with 18 independent part identifiers, canon pointer, and `productionApproved: false`.
- Added `scripts/materialize-cau-co-rig-ch1822.mjs`: hand-authored, editable SVG layers, NOT extraction or upscale of existing walk strip.
- Added `src/ui/characterRigCh1822.ts`: Phaser container hierarchy with elbow/knee pivots, head/torso, coat/bag, breathing and alternating walk phase.
- Rig is opt-in via `?cauCoRigPreview=1`. Default CAU CÓ production PNG remains fallback until visual canon review.
- Integrated into `src/scenes/CareerMinigameBoardSceneCh173.ts` with preload, all-parts-present check, production fallback, update and shutdown cleanup.
- Materializer now executes in predev, predev:playtest and prebuild.
- Added `tests/character-rig-ch1822.ts` and extended `tests/runtime/character-production-board-ui.mjs` for rig preview / pivots / flip / foot ring.
- No changes to face socket, live camera, SECRET BABY random-only/5%, gameplay authority or Cloudflare Worker.

## Honest art status
These SVG parts are a mechanically functional vector rig illustration, not pixel-perfect extracted/high-res production rig art. Needs visual approval and possibly replacement with manually authored high-quality layers matching `docs/character-production/canon/cauco.webp`. Do not auto cut over other characters.

## Next work
1. Check latest CI on final HEAD, fix only real failing step.
2. View QA demo via `https://ronvotri.github.io/MeMeMe-Web-Playtest/?cauCoRigPreview=1` once published.
3. Verify idle, steps, elbow/knee articulation, cape/bag sway, ring, 104px readability. Collect design feedback.
4. Improve the authored layer art against the canon before making CAU CÓ rig production.
5. Then plan LO LẮNG / TĂNG ĐỘNG; SECRET BABY needs separate crawl rig.
6. Do not deploy Cloudflare Worker.

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.20 CHARACTER ANIMATION REPAIR

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.74 — CH-18.20 CHARACTER ANIMATION REPAIR`

## Trigger
Runtime screenshot/feedback showed:
- CAU CÓ visibly broken;
- LO LẮNG / TĂNG ĐỘNG not fully clean-separated;
- SECRET BABY not yet reliably testable in the user's runtime at that moment.

## Root cause found
- CAU CÓ deployed PNG was genuinely corrupt: valid PNG signature + 1536×192 IHDR, but broken IDAT CRC. Permissive decode showed only partial heads plus a horizontal corruption line.
- Old CH-18.16 gate only checked signature/dimensions/bytes/hash, so stable corrupt bytes could pass.
- LO LẮNG / TĂNG ĐỘNG were valid but retained weak semi-transparent fringe alpha.

## CH-18.20 changes
- Rebuilt CAU CÓ from its pinned canon instead of repairing corrupt bytes.
- New CAU CÓ direct binary asset:
  `public/assets/characters/ch181/walk-cau-co-production-x4.png`
  - 1536×192 / 8 frames × 192×192
  - 239,574 bytes
  - SHA-256 `a93b1b7b642f9a4da6f32f8ad7e52a80f9cbb9e828f1bebeb0544dd5012a9504`
- Deleted obsolete `walk-cau-co-production-00..03.b64` source chunks.
- Removed CAU CÓ chunk materialization from `scripts/materialize-character-art-ch181.mjs`.
- LO LẮNG alpha-clean:
  - 85,924 bytes
  - SHA-256 `dc679a55d7a0e6e28e3923e3023f2129ce43b9eda499bc134b75fd8a5a249566`
- TĂNG ĐỘNG alpha-clean:
  - 277,818 bytes
  - SHA-256 `b5503376f678f6128eeb75f22ec88278a52be72a86b8ebe8fc27fc3ddcf81352`
- QA at 104×104 board scale: all three maintain readable silhouette and a shared approximate baseline at Y=180.
- Added `tests/character-animation-cleanup-ch1820.ts`:
  - validates every PNG chunk CRC;
  - inflates actual RGBA data;
  - checks all 8 frame cells remain separated from cell edges;
  - checks vertical occupancy / baseline;
  - ensures the corrupt CAU CÓ base64 pipeline does not return.

## Contracts unchanged
- 8-frame movement cadence and left/right flip unchanged.
- CH-18.13 idle breathing unchanged.
- Active ring remains 78×18 at Y=31 beneath Character.
- Face socket/live camera contract unchanged.
- SECRET BABY unchanged in CH-18.20.
- Cloudflare Worker remains frozen / not deployed.

## Next action
1. Check newest CI on the final CH-18.20 HEAD and fix only real newest-run failures.
2. Re-test CAU CÓ, LO LẮNG, TĂNG ĐỘNG on public playtest.
3. Then test corrected SECRET BABY crawl in runtime.
4. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.19 SECRET BABY REPO-STANDARD PRODUCTION CRAWL

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.73 — CH-18.19 SECRET BABY PRODUCTION CRAWL`

## Verified baseline before this slice
- CH-18.18 final build `0.1.70.4.72` was fully GREEN.
- CI #3783 passed Character gates, release branding, browser regression, artifact upload and public playtest publish.
- Production Characters before this slice: KHÓC NHÈ / CAU CÓ / LO LẮNG / TĂNG ĐỘNG.
- SECRET BABY was still fallback-only.

## Important correction
- The first CH-18.19 SECRET BABY attempt drifted away from the actual repo-standard art.
- Ron caught it before acceptance.
- That entire attempt was rolled back to the exact green CH-18.18 tree.
- Corrected CH-18.19 uses the art already present in the repo/build as primary visual authority:
  - `public/assets/characters/ch181/portrait-atlas-secret-baby.webp`
  - row 4 of `public/assets/characters/ch181/walk-atlas.webp`
- Existing concept manifest still maps Secret Baby to Drive `embe.webp`, but movement silhouette must match the repo-standard assets above.

## Corrected CH-18.19 production crawl
- New runtime asset:
  `public/assets/characters/ch181/walk-secret-baby-production-x4.png`
- 1536×192, 8 frames × 192×192, transparent.
- 363,723 bytes.
- SHA-256 `5b00136a4077703e9ebe3d7116f243e1330aadba04fd9b4acf94035ca4125a0c`.
- Occupied frame box is normalized close to the old repo row: roughly 176×164 with bottom baseline.
- Canon: infant, bald, small crown, gold pacifier, red trailing cape, short limbs, very low crawl body, bossy narrowed-eye expression.
- Forbidden: toddler/child body, upright starter walk, adult hair, oversized staff/weapon, invented jewelry/harness/accessories, or raising the body so it no longer reads as a crawling infant.
- Runtime route: `SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819`.
- `secret-baby` is now `runtime-production-strip`.

## Gameplay/presentation contracts unchanged
- Secret Baby remains `randomOnly: true`.
- `directSelectable: false`.
- 5% HOST-authoritative RANDOM eligibility.
- Max one Secret Baby per RANDOM batch.
- Existing 8-frame driver/left-right flip retained; those frames are crawl phases.
- CH-18.13 idle breathing remains.
- Active ring remains 78×18 at local Y=31 below the Character.
- Face socket/live camera contract unchanged.
- Cloudflare Worker remains frozen / not deployed.

## Next action
1. Check newest CI on the final CH-18.19 HEAD and only repair real newest-run failures.
2. Playtest all five Character production sources together at Board scale.
3. Pay special attention to SECRET BABY crawl height, ring clearance, flip direction, idle-to-crawl reset and whether the low silhouette remains readable at 104×104.
4. Do not change RANDOM-only rules while doing visual QA.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.18 TĂNG ĐỘNG PRODUCTION WALK

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.72 — CH-18.18 TĂNG ĐỘNG PRODUCTION WALK`

## Verified CI before this slice
- Final CH-18.17 CI #3766 on HEAD `83f1774ab905f8a6dadeb462242c91d2df699cda` completed **SUCCESS**.
- CH-18.9 production selector PASS.
- CH-18.12 source admission PASS.
- CH-18.16 CAU CÓ production walk PASS.
- CH-18.17 LO LẮNG production walk PASS.
- CH-09 release branding PASS.
- Transform-safe browser regression PASS.
- Artifact upload PASS.
- Compiled GitHub public playtest mirror publish PASS.

## CH-18.18 changes
- Pinned approved TĂNG ĐỘNG concept directly in repo:
  `docs/character-production/canon/tangdong.webp`
- Source authority:
  - female 18–24;
  - 1122×1402;
  - 240,936 bytes;
  - SHA-256 `8bd94dc4cb712fe00dceec59ca68deb77069e79b04d6ee4f7d5aeb4c8c84dd5f`.
- Added `src/content/core/character_visual_canon_ch1818.ts`.
- Locked visual identity: messy brown twin buns, colorful sunglasses on head, pink/white headphones, oversized yellow/pink/teal sticker-heavy sporty jacket, white crop top, black athletic shorts with white trim, chunky multicolor sneakers, teal sticker-covered backpack, bunny charms/keychains, handheld game device and restless leaning/bouncing body language.
- Added genuine high-resolution production walk:
  `public/assets/characters/ch181/walk-tang-dong-production-x4.png`
  - 1536×192
  - 8 frames × 192×192
  - transparent background
  - 310,854 bytes
  - SHA-256 `98a4ab0c84ff399ed4c846e2adafe80892125ddc7373a03d1414b5de546538c9`
  - common foot baseline
  - no active ring baked into the art
- `starter-hyper / TĂNG ĐỘNG` is now `runtime-production-strip`.
- Board runtime route: `HYPER_PRODUCTION_WALK_KEY_CH1818`.
- Existing 8-frame cadence, left/right flip, CH-18.13 idle breathing, active ring 78×18 at Y=31 and ring-below-body layering remain unchanged.
- Production roster: KHÓC NHÈ / CAU CÓ / LO LẮNG / TĂNG ĐỘNG.
- SECRET BABY remains fallback-only.
- Face socket/live camera contract unchanged.
- Cloudflare Worker remains frozen.

## Next action
1. Check newest CI run on final CH-18.18 HEAD. Only fix a real newest-run failure.
2. Playtest TĂNG ĐỘNG at Board scale for foot sliding, jacket/backpack silhouette readability, left/right flip and idle-to-walk reset.
3. If clean, continue SECRET BABY only after recovering/confirming the exact infant canon source. Do not invent age/gender/body silhouette or upscale the 48px fallback.
4. Keep face socket/live camera contract unchanged.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.17 LO LẮNG PRODUCTION WALK

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.71 — CH-18.17 LO LẮNG PRODUCTION WALK`

## CI cleanup before CH-18.17
- CH-18.16 initially exposed three stale/test metadata issues, not runtime regressions:
  1. materialized CAU CÓ strip is 32,472 bytes, not 32,474;
  2. correct CAU CÓ strip SHA-256 is `e6aac908cf41d99e6e806b4c8aa206a052fac4f67142277b1205780fc760544b`;
  3. CH-18.9 / CH-18.12 source tests still asserted the old one-character ternary routing.
- Those gates were updated to the new production selector.
- On source CI #3748, CH-18.9 PASS, CH-18.12 PASS, CH-18.16 PASS, and CH-09 release branding PASS before the long runtime-browser stage.
- Cloudflare Worker was not deployed or modified.

## CH-18.17 changes
- Pinned approved LO LẮNG concept authority directly in repo:
  `docs/character-production/canon/lolang.webp`
- Source authority:
  - male 28–35;
  - 1122×1402;
  - 212,632 bytes;
  - SHA-256 `e1a6ccd8e7586584949b34fb9a227ba2cdfc4f91bb0c88bcce880a2eb8ada964`.
- Added `src/content/core/character_visual_canon_ch1817.ts` with the LO LẮNG visual lock.
- Locked visual identity: messy brown hair, large dark glasses, dark teal/forest-green planner-core top, white collar/cuffs, wide cream-beige trousers, green/cream sneakers, overloaded organizer bags, planners/checklists/pens/phone/water bottle/keychain, worried/constantly-checking body language.
- Added genuine high-resolution production walk:
  `public/assets/characters/ch181/walk-lo-lang-production-x4.png`
  - 1536×192
  - 8 frames × 192×192
  - transparent background
  - 36,742 bytes
  - SHA-256 `c112d1ced88c11d41bd59a71cb2bd1683655803e827912c5079cd103f3da0497`
- `starter-anxious / LO LẮNG` is now `runtime-production-strip`.
- Board routing now selects `ANXIOUS_PRODUCTION_WALK_KEY_CH1817`.
- Existing 8-frame cadence, left/right flip, CH-18.13 idle breathing, active ring 78×18 at Y=31 and ring-below-body layer contract all remain unchanged.
- KHÓC NHÈ / CAU CÓ / LO LẮNG are production.
- TĂNG ĐỘNG / SECRET BABY remain fallback-only.
- Face socket/live camera contract unchanged.
- Cloudflare Worker remains frozen.

## Next action
1. Check newest CI run on final CH-18.17 HEAD; repair only a real newest-run failure.
2. Visually playtest LO LẮNG at Board scale for foot sliding, bag silhouette readability, idle-to-walk transition and left/right flip.
3. If clean, continue next genuine production strip: **TĂNG ĐỘNG**, preserving female 18–24 canon exactly.
4. SECRET BABY remains fallback-only until its own genuine infant strip exists.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.16 CAU CÓ PRODUCTION WALK

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.70 — CH-18.16 CAU CÓ PRODUCTION WALK`

## Verified CI before this slice
- Source CI **#3724** on HEAD `ddf96d21e2503c203c4b32b4dfe3838d461f18ce` completed **SUCCESS**.
- CH-18.14 canon/layer gate PASS.
- CH-18.15 exact source pin PASS.
- CH-09 release branding gate PASS.
- Runtime browser regression PASS.
- Artifact upload PASS.
- Compiled GitHub playtest mirror publish PASS.

## CH-18.16 changes
- Built an actual CAU CÓ runtime walk strip instead of another presentation/concept sheet.
- Production output is **1536×192**, exactly 8 frames × 192×192 with transparent background.
- The source frames were authored from a high-resolution CAU CÓ candidate visually matched against the pinned canon authority; this is not an upscale of the legacy 48px row.
- Frame normalization keeps the feet on a common baseline and removes the cyan/active ring from the art. Runtime ring remains separate.
- Encoded source is stored as four repo chunks:
  - `scripts/assets/ch181/walk-cau-co-production-00.b64`
  - `...01.b64`
  - `...02.b64`
  - `...03.b64`
- `scripts/materialize-character-art-ch181.mjs` now reconstructs:
  `public/assets/characters/ch181/walk-cau-co-production-x4.png`
- Runtime strip metadata:
  - 1536×192
  - 32,474 bytes
  - SHA-256 `6e79eb57e286c8182261abccd5d244d5b498e8ed5f86bfdec682b772f6fcd1df`
- `starter-grumpy / CAU CÓ` is now `runtime-production-strip` with `productionAssetPath: assets/characters/ch181/walk-cau-co-production-x4.png`.
- Board preload/runtime routing now selects `GRUMPY_PRODUCTION_WALK_KEY_CH1816` for CAU CÓ.
- Existing movement cadence remains 8 frames; left/right flip unchanged.
- CH-18.13 idle breathing remains active while standing.
- Active ring remains a separate 78×18 object at local Y=31 below Character art.
- Face socket/live camera contract unchanged.
- LO LẮNG / TĂNG ĐỘNG / SECRET BABY remain fallback-only.
- Cloudflare Worker remains frozen.

## Canon source remains authoritative
`docs/character-production/canon/cauco.webp` is still the visual authority for CAU CÓ. Do not replace the strip with a redesign that changes age, gender, glasses, formal tailored outfit, draped olive jacket, moustache/beard, satchel or upright/angular silhouette.

## Next action
1. Check the newest CI run on the final CH-18.16 HEAD. Only fix a real failure from that newest run.
2. Playtest CAU CÓ walk + idle transition at actual Board scale, especially foot sliding, coat/satchel readability, active ring clearance and left/right flip.
3. If visual QA is acceptable, continue next genuine Character production strip: **LO LẮNG**, preserving male 28–35 canon. Do not upscale fallback 48px.
4. Keep TĂNG ĐỘNG / SECRET BABY fallback-only until their own genuine strips exist.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.15 CAU CÓ SOURCE PIN

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.69 — CH-18.15 CAU CÓ SOURCE PIN`

## CI checkpoint before this slice
- CH-18.14 source CI was rerun on the actual HEAD `ca3240328f9bdbd98f28395636ef9d867a1ef923`.
- Run **#3710 attempt 2 = SUCCESS**.
- CH-18.14 canon/layer gate passed.
- Previously failing CH-09 release branding gate passed.
- Runtime browser regression, artifact upload and compiled GitHub playtest publish all passed.

## CH-18.15 changes
- Approved CAU CÓ concept source is now pinned directly in the repo at:
  `docs/character-production/canon/cauco.webp`
- Source is byte-identical to approved Drive file `cauco.webp` / ID `1dZ6Ruav4nnaDy371hrBwTGR-hNkMnUnf`.
- Pinned source metadata:
  - 1122×1402
  - 168,340 bytes
  - SHA-256 `f75435579c1647b07b1a88b3ced312c624c761c54a8ec87c335f5f6093db637e`
- Added CI test `tests/character-canon-source-ch1815.ts` to verify the exact authority bytes and ensure CAU CÓ still has no production runtime route.
- Refined visual anchors directly from the source image: swept-back salt-and-pepper hair, gold rectangular glasses, moustache + short chin beard, white rolled-cuff shirt, brown leather suspenders, crown-pattern tie, olive pinstripe jacket draped over shoulders, crown lapel pin, red pocket square, high-waisted brown trousers, burgundy-brown loafers with gold chain hardware, crown-pattern shoulder satchel, gold/black watch, green gemstone ring.
- Forbidden drift remains explicit: tank top, shorts, sandals/flip-flops, casual beach-uncle silhouette, removing glasses/tie/jacket identity, or changing age/gender.
- CAU CÓ remains `awaiting-genuine-strip`; no `productionAssetPath`.
- Do not use the pinned concept image as a runtime sprite. It is source authority / QA input only.
- Idle breathing CH-18.13 and ring/layer contract CH-18.14 remain unchanged.
- Cloudflare Worker remains frozen.

## Next action
1. Check newest CI run for final CH-18.15 HEAD. Only fix a real newest-run failure.
2. Build/recover a genuine high-resolution CAU CÓ 8-frame walk strip using the pinned repo authority image as the visual source.
3. Reject any candidate that loses the formal outfit/accessories or changes silhouette.
4. Validate 192×192 frame isolation, foot anchor, ring clearance and idle-to-walk transition before runtime cut-over.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.14 CAU CÓ CANON LOCK

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.68 — CH-18.14 CAU CÓ CANON LOCK`

## CI checkpoint before CH-18.14
- Newest verified failing run before this slice was source CI **#3691**.
- Exact failure: release-cleanup expected `.65` because `src/buildInfo.ts` was stale while PLAYTEST had already moved to `.66`.
- That stale build-identity bug was corrected in CH-18.13.
- On CI **#3700**, CH-18.12 production-source admission **PASS**, CH-18.13 idle-breath/canon guard **PASS**, and the previously failing `CH-09 release-candidate branding and package cleanup` step **PASS**. New CH-18.14 pushes may cancel the remainder of #3700 due workflow concurrency; do not treat that cancellation as a regression.

## CH-18.14 changes
- Added `src/content/core/character_visual_canon_ch1814.ts` as an authoring/QA canon lock for **CAU CÓ**.
- CAU CÓ remains male 40–50, sharp-tailored, upright-angular, formal/controlled, matching approved concept authority `cauco.webp`.
- Required visual anchors include salt-and-pepper swept-back hair, thin gold rectangular glasses, moustache + short chin facial hair, white long-sleeve shirt, brown crown-pattern tie, brown suspenders, dark olive pinstripe jacket draped over shoulders, high-waisted brown trousers, dark loafers with gold hardware, structured brown leather work bag, formal jewelry/watch and green statement ring.
- Explicitly forbidden drift: tank top, shorts, sandals/flip-flops, casual beach-uncle silhouette, bald/receding redesign, removing glasses/tie/jacket identity, or changing age/gender.
- CAU CÓ still has `status: awaiting-genuine-strip` and no `productionAssetPath`. Do not cut over until a genuine high-resolution 8-frame strip matches the concept.
- Drive audit after this lock found no hidden/recent CAU CÓ production strip. Recent Character production files still include KHÓC NHÈ production assets plus legacy/fallback atlases only.
- Fixed live-face layer order: foot ring stays at container index 0; walk/static/live Character body is inserted above it. The ring must never overlay Character body.
- CH-18.13 idle breathing remains active and presentation-only.
- Face socket/live camera ownership remains unchanged; only KHÓC NHÈ neutral has a true layered socket proof.
- Cloudflare Worker remains frozen.

## Next action
1. Check newest CI run for HEAD after CH-18.14. Only repair a real failing step from the newest run.
2. Visually validate idle breathing + ring order on board.
3. Continue CAU CÓ production only from the approved concept; reject any generated strip that changes outfit/age/gender/silhouette.
4. Do not promote a 48px remaster/upscale to production.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.13 CHARACTER IDLE BREATH

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.67 — CH-18.13 CHARACTER IDLE BREATH`

## What changed
- Confirmed newest real CI before this slice: source run **#3691 FAILURE** on HEAD `c7ae09b...`.
- Exact failure was `CH-09 release-candidate branding and package cleanup`: `MEMEME_BUILD.version` was still `.65`, so the dynamic PLAYTEST gate expected `.65` while `public/PLAYTEST.txt` was already `.66`.
- Build identity is now advanced/synchronized to `.67` for CH-18.13; artifact identity follows the canonical `MEMEME_BUILD.artifactName`.
- Re-audited CAU CÓ from repo authority. Canon remains **male 40–50**, `sharp-tailored`, `upright-angular`, chỉnh tề/sắc cạnh, with grumpy short/sharp reactions. The repo manifest points to approved concept `cauco.webp`.
- Several attempted generated CAU CÓ walk concepts visibly changed the outfit/silhouette and were rejected. **None were admitted to repo/runtime.**
- CAU CÓ remains `awaiting-genuine-strip` with no `productionAssetPath`; CH-18.10 fallback remains until a genuine high-res strip matches the approved concept.
- Added presentation-only idle breathing to board Characters: ~2.2 s cycle, tiny vertical rise + scale change, then reset before the existing 8-frame movement cadence.
- Idle breathing also applies to KHÓC NHÈ static/live face composite so personalized Characters do not freeze when standing.
- Active ring remains fixed below feet: **78×18 at local Y=31**.
- No gameplay movement authority, RNG, B$, passive, face socket or live-camera ownership changes.
- Cloudflare Worker remains frozen.

## Locked CAU CÓ canon
- Male, 40–50.
- Style: chỉnh tề, sắc cạnh, màu gọn; **sharp-tailored**.
- Silhouette: **upright-angular**, hơi khó gần.
- Body language: khoanh tay/chống nạnh, nhíu mày/liếc ngang, chỉ tay/quay phắt khi bị nhắm tới.
- Do not replace him with tank-top/shorts/casual uncle variants.
- Do not cut over runtime until a genuine high-resolution 8-frame strip matches the approved concept.

## Idle animation contract
- Standing Character must not be perfectly static.
- Breathing is subtle presentation-only motion, not extra gameplay movement.
- Foot anchor/ring must visually stay planted.
- Movement always resets idle transform before walk cadence.
- 8-frame walk + left/right flip remain unchanged.

## Recommended next action
1. Follow the newest source CI run after CH-18.13; if red, inspect the exact failed step/log only.
2. Visually test idle breathing on KHÓC NHÈ and fallback Characters for foot sliding or excessive squash/stretch.
3. Continue CAU CÓ production only from the approved concept authority; reject any strip that changes age/outfit/silhouette.
4. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.12 PRODUCTION SOURCE LOCK

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.66 — CH-18.12 PRODUCTION SOURCE LOCK`

## What changed
- Re-audited the five approved high-resolution Character concept sheets.
- Only **KHÓC NHÈ** currently has a genuine high-resolution 8-frame runtime walk strip.
- No equivalent production walk export was found for **CAU CÓ / LO LẮNG / TĂNG ĐỘNG / SECRET BABY**, so all four deliberately remain on the CH-18.10 fallback.
- Added `src/content/core/character_walk_production_sources_ch1812.ts` as the production admission list.
- Added `tests/character-production-source-ch1812.ts` so a fallback/upscaled 48px row cannot silently be labeled production.
- Added `docs/character-production/CH1812_SOURCE_AUDIT.md` with the source audit and next production rule.
- No gameplay authority, RNG, B$, movement cadence, face socket or camera behavior changed.
- Cloudflare Worker remains frozen.

## Locked production rules
- Runtime production walk target: **8 frames × 192×192 native frame** (or genuinely higher source before export).
- Never upscale the legacy 48px row and call it production.
- Active ring remains **78×18 at local Y=31**, below the Character.
- CAU CÓ stays male 40–50; LO LẮNG male 28–35; TĂNG ĐỘNG female 18–24; SECRET BABY infant/RANDOM-only.
- Do not invent face sockets. Only KHÓC NHÈ neutral currently has the real layered face-socket proof.
- Face fallback remains live camera → saved face → default Character.

## CI note
At the start of CH-18.12 the branch HEAD was the requested handoff commit `dea58d2c139f7d467f3316f2a6fc3bc2120fc905`. The GitHub connector exposed no commit status or PR-triggered workflow run for that push, so there was **no verified current red run to repair**; no speculative CI fix was made. Follow only the newest run after the CH-18.12 commits and fetch its exact failed step/log if it is red.

## Recommended next action
1. Follow the newest source CI + Pages run for CH-18.12.
2. Author/recover the next genuine high-resolution 8-frame strip from the approved **CAU CÓ** concept sheet.
3. Visually validate silhouette, foot anchor, frame isolation and badge/ring clearance before runtime cut-over.
4. Keep the same movement and face/live-camera contracts.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# NEW CHAT START HERE — 2026-10-06 — CH-18.11 PRODUCTION WALK HANDOFF

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-dev`  
Current build: `0.1.70.4.65 — CH-18.11 KHÓC NHÈ PRODUCTION WALK`

## What just happened
- Ron rejected the visibly broken/upscaled 48px board sprites and asked for animation assets at ~4x native size plus the active ring strictly under the feet.
- CH-18.9 moved the board token to ~104px display, normalized inherited token scale, hid the torso halo, and added a dedicated under-foot ellipse.
- CH-18.10 shipped a persistent 1536×960 x4 fallback atlas (192×192 per frame, 8 frames × 5 rows) so runtime no longer rebuilds it every board entry.
- Ron correctly pointed out that enlarging a 48px source cannot create real detail.
- CH-18.11 therefore replaces **KHÓC NHÈ** with a genuine production-source 8-frame transparent PNG strip: `public/assets/characters/ch181/walk-khoc-nhe-production-x4.png`, 1536×192, 192×192 per frame.
- CAU CÓ / LO LẮNG / TĂNG ĐỘNG / SECRET BABY still use the CH-18.10 x4 remaster fallback until equivalent high-resolution production strips exist. **Do not fabricate their silhouettes, demographics or sockets.**

## CI state at handoff
- Last fully green checkpoint before CH-18.11: source CI **#3679 SUCCESS**, GitHub Pages **#115 SUCCESS**.
- Source run **#3680** failed only because the older CH-18.9 gate still required the direct expression `CHARACTER_HQ_ATLAS_KEY_CH189, row * 8` after KHÓC NHÈ switched to a dedicated production texture.
- This handoff commit updates that stale gate and synchronizes `public/PLAYTEST.txt` to build `.65`.
- In the new chat, **follow only the newest CI run**. Do not call cancelled runs failures. If the newest run is red, fetch the exact failed step/log before changing code.

## Locked Character canon
- KHÓC NHÈ — female 55–65.
- CAU CÓ — male 40–50.
- LO LẮNG — male 28–35.
- TĂNG ĐỘNG — female 18–24.
- SECRET BABY — infant, RANDOM-only.
Use the approved concept sheets referenced by `src/content/core/character_art_manifest_v01.ts`. Do not redesign or teen/female-normalize the cast.

## Board Character visual contract
- Production target frame: **192×192 native** (or genuinely higher source), then downsample to board display. Never scale a tiny 48px source up and describe it as production quality.
- Current board display: ~104px Character.
- Active ring: **78×18 at local Y=31**, layer **below** Character; it must read as a foot ring, never surround/cover the torso.
- P1–P4 badge stays outside the silhouette.
- 8-frame walk cadence and left/right flip remain.
- Gameplay movement authority must not change.

## Face / camera contract already in repo
- No face supplied → default Character art.
- Uploaded/captured face → non-circular face source through CH-02F socket/mask.
- CAMERA ON → reuse opt-in Online Group Media stream; live face in the same socket.
- Fallback order: live camera → saved face → default Character.
- Final composition order: body-back → player face → irregular/soft alpha mask → Character foreground/hair/glasses/etc.
- Do **not** replace this with a generic hard oval/circle.
- Real layered face-socket proof currently exists only for **KHÓC NHÈ neutral**. Do not invent sockets for the other Characters.

## Recommended next action
1. Confirm newest CI + Pages are green after this handoff commit.
2. Test KHÓC NHÈ production strip visually on the live board: sharpness, frame isolation, foot anchor, ring under feet, badge clearance.
3. For the remaining four Characters, first recover/create genuine high-resolution 8-frame production strips from their approved source art; only then swap each row away from the x4 fallback.
4. Keep the same runtime contract so face socket/live camera and gameplay authority do not regress.
5. Do not deploy/update Cloudflare Worker unless Ron explicitly asks.

Public playtest:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

---

# CURRENT CHECKPOINT — 2026-10-06 — CH-18.11 KHÓC NHÈ PRODUCTION WALK

Current build: `0.1.70.4.65`.
CH-18.10 is green on source CI #3679 and GitHub Pages #115. Ron correctly flagged that a 4x remaster of a 48px sprite cannot recover real detail. CH-18.11 therefore replaces KHÓC NHÈ's board walk row with a genuine 8-frame 1536×192 transparent strip extracted from the approved high-resolution production sheet `mmm-ch181-khoc-nhe-production.png`.

Only KHÓC NHÈ is cut over because it is the only Character for which the matching production walk sheet is currently available. CAU CÓ / LO LẮNG / TĂNG ĐỘNG / Secret Baby keep the persistent CH-18.10 HQ-remaster fallback until equivalent production strips exist; do not fabricate their silhouettes or demographics.

The under-foot active ring (78×18 at Y=31), badge placement, 8-frame cadence, left/right flip, uploaded/live face socket, gameplay authority, RNG and economy remain unchanged. Cloudflare Worker remains frozen.

---

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

**SOURCE PUSHED • CI/PAGES VALIDATION FOLLOWS THIS CHECKPOINT • CLOUDFLARE WORKER STILL FROZEN / NOT REDEPLOYED**

Current authority:
- repo: `RVTGMzz/Mmm-BG`
- active development branch: `mmm-mvp-0.1-dev`
- frozen Cloudflare checkpoint branch: `mmm-mvp-0.1-core`
- build: `0.1.70.4.53`
- phase: `RELEASE CANDIDATE • CH-17.13 PRESENTATION FEEDBACK REFRESH`
- prior fully validated checkpoint: `0.1.70.4.52` / CI #3648 **SUCCESS**
- test URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-17.13 shipped
- refreshed the in-match dice popup into a cream/butter toy card while preserving dice timing/SFX;
- refreshed landing / ready-bonus presentation into the CH-17 paper-card language;
- refreshed the generic cinematic fallback used outside canonical Card/News owned renderers;
- refreshed manual continue / skip prompt into a toy chip;
- refreshed floating B$ feedback into mint/peach chips;
- refreshed direct-money action line and rarity badge chrome;
- kept reaction lanes, presentation queue, economy, RNG and authoritative event flow unchanged.

## Locked constraints
- no client gameplay `Math.random()`;
- no presentation-owned B$ mutation;
- HOST/replay authority stays authoritative;
- no Cloudflare Worker deploy/update;
- PR #1 remains Draft/Open unless Ron explicitly asks to merge.

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

# MMM — 2026-09-28 RELEASE CANDIDATE ACCEPTANCE CH-10

**RC ACCEPTED FOR HUMAN / DEVICE PLAYTEST**

CH-10 adds a single acceptance matrix over the already-validated systems rather than another gameplay feature.

Acceptance matrix locks:
- RC build identity and MMM visible branding;
- one public tester launcher + package/audio checksum guard;
- Steam Deck controller owner and legacy owner exclusion;
- CSS-only 16:10 FIT presentation, no stretch/crop;
- Character authoritative percentages 40/50/20/45/60;
- CH-06 probability/economy audit presence;
- full-match two-lap integration and 1/2/3-lap economy audit;
- deterministic 3-lap repeat;
- logical socket ownership + CH-08 repeated live reconnect stress;
- invalid token, active-device and post-Start join guards;
- CH-09 presentation feedback policy;
- public PLAYTEST guide contains reconnect and Character odds;
- all prerequisite CH-05 through CH-09 + Pages release guard remain wired in CI.

Validated checkpoint:
- CH-10 source: `511d5942474e6a7d4e02215659ebb36d70318453`
- CI #3366 / run `36443146292`: SUCCESS
- runtime evidence artifact: `10979770298`
- RC package artifact: `10980020090`
- compiled public gameplay remains `adac960abc6c43847032107160bf4622992cdd2c`
- current public Pages #76: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

Decision:
- no more feature additions before human/device acceptance unless a real blocker is found;
- next work should come from actual Steam Deck / desktop playtest observations;
- preserve current Character percentages, economy, online authority and single-owner presentation until playtest evidence justifies a change.

---

# MMM — 2026-09-28 FINAL FEEDBACK POLISH CH-09

**FEEDBACK POLISH + RUNTIME VISUAL + PUBLIC PAGES: PASS**

CH-09 deliberately adds feel without reopening layout ownership:
- Character passive landing uses a dedicated `character_passive` SFX cue with WebAudio fallback synth;
- Character passive landing uses a stronger 16-particle burst;
- passive B$ refund/bonus now gets the same floating-money feedback as money tiles;
- passive activation receives a very subtle camera pulse;
- dice settle receives a small deterministic presentation punch; natural 6 gets a slightly stronger burst/pulse;
- landing feedback mapping is centralized in `presentationFeedbackCh09.ts` instead of growing scattered conditional logic.

Safety:
- no gameplay RNG changed;
- no Character/economy values changed;
- no canonical modal bounds changed;
- no client Math.random() introduced;
- existing Card/News/Job/Mini Game single-owner presentation architecture preserved.

Validation:
- CH-09 feedback policy gate: PASS;
- CH-09 release-candidate branding/package cleanup: PASS;
- all Character CH-05/06, economy CH-07, online CH-08 and historical regressions: PASS;
- browser runtime gate: PASS;
- package/release guard: PASS;
- compiled mirror publish: PASS;
- manually inspected passive popup at 1280x800 and 960x540: centered, readable, no HUD overlap, full probability/roll copy visible.

Validated checkpoint:
- source: `7b261691eebe909d41a8d8d8a9fb0016984612c6`
- CI #3365 / run `36441756418`: SUCCESS
- runtime evidence artifact: `10978942109`
- RC package artifact: `10979242037`
- public mirror: `adac960abc6c43847032107160bf4622992cdd2c`
- Pages #76 / run `36442442674`: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

Next roadmap block: Release Candidate Acceptance. No new feature work unless acceptance finds a real blocker.

---

# MMM — 2026-09-28 ONLINE STRESS / RECONNECT CH-08

**LIVE RECONNECT OWNERSHIP + GHOST-SEAT STRESS: PASS**

CH-08 live Worker stress coverage:
- same P2 identity reconnects repeatedly across 5 cycles;
- seatId and reconnectToken remain stable;
- invalid reconnect token is rejected;
- a different active device cannot steal the live identity;
- new identities cannot join after Start;
- the superseded socket may remain physically open briefly under Cloudflare hibernation, but it is removed from the logical relay authority and cannot leak gameplay actions;
- the newest socket keeps bidirectional relay with host;
- roster remains single-owner with no duplicate/ghost P2 record.

Important invariant learned:
- physical WebSocket close timing is not the authority boundary;
- `logicalSockets070421` / newest logical endpoint ownership is the real gameplay safety invariant.

Regression repair during CH-08:
- stale online transport test expected the old explicit `target.channel !== sender.channel` filter;
- test was updated to the current logical-socket channel isolation architecture without changing Worker behavior.

Validated checkpoint:
- CH-08 stress source: `218c809608502262073129c5e55068a23a90a9c3`
- logical reconnect invariant correction: `c9936fffd59004d1878056a8db6931bbfd022dee`
- final CI #3360 / run `36434401039`: SUCCESS
- online gates, browser runtime, package, Pages guard and compiled mirror publish all SUCCESS.

Next roadmap block: Final Polish / Juice Pass. Preserve current authority, Character percentages, economy and canonical single-owner UI.

---

# MMM — 2026-09-28 ONLINE STRESS / RECONNECT CH-08

**LIVE REPEATED RECONNECT + OWNERSHIP + GHOST-SEAT STRESS: PASS**

CH-08 exercises the production Worker/DO path, not only static source contracts.

Live stress coverage:
- create room + authenticated P2 join;
- wrong reconnect token cannot reclaim the identity;
- a second active device cannot steal the same identity during reconnect grace;
- new human identities cannot join after Start;
- same P2 performs 5 authenticated reconnect cycles and always retains the original seat/token;
- a superseded physical socket may remain half-open briefly under Cloudflare hibernation, but it is no longer the logical authority and cannot relay gameplay;
- newest socket continues bidirectional host <-> P2 relay after every cycle;
- public lobby contains exactly one P2 record after stress, so no ghost/duplicate seat is created.

Important test correction during CH-08:
- legacy online-client gate still expected the pre-0.1.70.4.21 literal channel filter `target.channel !== sender.channel`;
- current Worker isolates relay through `logicalSockets070421(sender.channel)`, so the stale assertion was updated without changing Worker behavior;
- first CH-08 draft incorrectly required a client-side close event within 10s; Cloudflare hibernation can delay physical close propagation;
- final invariant is stricter and gameplay-relevant: obsolete sockets must never relay after replacement, regardless of physical close timing.

Validated checkpoint:
- CH-08 initial stress source: `218c809608502262073129c5e55068a23a90a9c3`
- stale legacy online test alignment: `837f356e4a3d092f8c1c5ec95b34904152cf8d2d`
- logical reconnect authority test: `c9936fffd59004d1878056a8db6931bbfd022dee`
- CI #3360 / run `36434401039`: SUCCESS
- CH-08 live evidence: room `MEJWMT`, cycles=5, seat=P2
- runtime evidence artifact: `10975546571`
- compiled build artifact: `10975586465`
- public compiled content unchanged from Pages #74 because CH-08 is test-only; no new mirror commit was necessary.

Roadmap next: Final Polish / Release Candidate Readiness. Preserve current gameplay/economy/Character percentages and online authority unless a release-candidate audit reveals a concrete defect.

---

# MMM — 2026-09-28 CHARACTER-ENABLED ECONOMY & PACING CH-07

**1 / 2 / 3 LAP ECONOMY + PACING AUDIT: PASS**

CH-07 ran 60 deterministic Character-enabled matches using the starter roster:
- 20 matches at 1 lap;
- 20 matches at 2 laps;
- 20 matches at 3 laps.

Observed normalized metrics:
- 1 lap: turns/lap 60.30; commands/lap 96.20; inflation/lap 456.10B$; spread/lap 159.90B$; passive direct amount/lap 28.00B$.
- 2 laps: turns/lap 59.10; commands/lap 93.10; inflation/lap 516.00B$; spread/lap 109.45B$; passive direct amount/lap 32.38B$.
- 3 laps: turns/lap 56.43; commands/lap 88.37; inflation/lap 442.37B$; spread/lap 98.57B$; passive direct amount/lap 27.00B$.

Decision:
- keep current economy values unchanged;
- no evidence of nonlinear inflation, runaway command growth, or widening per-lap money spread as target laps increase;
- 1/2/3-lap match length remains deterministic and bounded;
- Character passives do not create a pacing/economy runaway in this bot audit.

Validated checkpoint:
- CH-07 source: `55ae7d817883349f2c242ad9ecb7d95b7a4b2605`
- CI #3355 / run `36422869034`: SUCCESS
- runtime evidence artifact: `10970348631`
- compiled build artifact: `10970079665`
- compiled public mirror content did not require a new commit because CH-07 changes tests/telemetry only; previous Pages #74 remains the current gameplay build.

Next roadmap block: Online Stress / Reconnect audit. Preserve current Character percentages and economy while exercising reconnect ownership, repeated reloads, stale sockets, seat reclaim and relay continuity.

---

# MMM — 2026-09-28 ECONOMY & PACING AUDIT CH-07

**CHARACTER-ENABLED 1/2/3-LAP ECONOMY + PACING: PASS**

CH-07 ran 60 deterministic full matches with the live starter Character roster:
- 20 × 1 lap;
- 20 × 2 laps;
- 20 × 3 laps.

Normalized results:
- 1 lap: turns 60.3/lap, commands 96.2/lap, final total 1256.1B$, inflation 456.1B$/lap, spread 159.9B$/lap, passive amount 28.0B$/lap, cards 11.5/lap, Mini Games 4.8/lap, Lottery 1.3/lap.
- 2 laps: turns 59.1/lap, commands 93.1/lap, final total 1832.0B$, inflation 516.0B$/lap, spread 109.45B$/lap, passive amount 32.38B$/lap, cards 10.5/lap, Mini Games 5.15/lap, Lottery 1.25/lap.
- 3 laps: turns 56.43/lap, commands 88.37/lap, final total 2127.1B$, inflation 442.37B$/lap, spread 98.57B$/lap, passive amount 27.0B$/lap, cards 10.2/lap, Mini Games 4.63/lap, Lottery 1.2/lap.

Decision:
- no economy nerf/buff in CH-07;
- inflation is positive but approximately linear rather than runaway;
- spread per lap decreases in longer matches instead of exploding;
- pacing per lap stays stable/slightly tighter across 1→2→3 laps;
- keep current 200B$ start, Job salary, Lottery, Mini Game payouts, Card/News values, and Character percentages for live human playtest.

Validated checkpoint:
- CH-07 source/audit: `55ae7d817883349f2c242ad9ecb7d95b7a4b2605`
- CI #3355 / run `36422869034`: SUCCESS
- runtime evidence artifact: `10970348631`
- compiled output was unchanged by this test-only pass, so the public mirror remained the already-green Pages #74 build `72f99c965aa13ea7232e036dc7fa9b07fa925734`.

Next roadmap block: Online Stress/Reconnect Pass.

---

# MMM — 2026-09-28 CHARACTER BALANCE AUDIT CH-06

**PROBABILITY + CHARACTER-ENABLED FULL MATCH ECONOMY AUDIT: PASS**

CH-06 validates the approved percentage-based Character passives instead of returning to once-per-lap cooldowns.

Observed 5,000-trigger probability checks:
- KHÓC NHÈ target 40% -> observed 40.02%
- CAU CÓ target 50% -> observed 49.94%
- LO LẮNG target 20% -> observed 20.16%
- TĂNG ĐỘNG target 45% -> observed 46.48%
- SECRET BABY target 60% -> observed 58.66%

Character-enabled 2-lap simulation batch:
- 32 starter-roster matches + 24 Secret-Baby-roster matches;
- all matches finish all 4 players;
- starter direct passive amount average = 60.00B$ per 2-lap match (includes CAU CÓ transfer amount, which is zero-net economy);
- KHÓC NHÈ: 93 events / 930B$ refund total;
- CAU CÓ: 149 events / 745B$ transferred total;
- LO LẮNG: 289 successful bonus-card draws / 0 direct B$;
- TĂNG ĐỘNG: 203 events / 1015B$ bonus total;
- SECRET BABY: 92 events / 1380B$ refund total across 24 Baby matches.

Decision after audit:
- keep 40/50/20/45/60 for the first live playtest;
- LO LẮNG is a watchlist item because it is the most frequent passive, but its hand limit and zero direct B$ make premature nerfing unjustified before human playtest data;
- no percentage is tuned from one deterministic bot batch alone.

Important engineering repair during CH-06:
- a JS String.replace replacement containing the special `$\`` token duplicated `playtestTelemetry061.ts`;
- root cause was fixed by rebuilding from the last clean blob and using replacement functions so dollar signs are literal;
- final telemetry source is a single clean 8.8KB file, not duplicated content.

Validated checkpoint:
- CH-06 source/audit: `a405fe8b094e10c2b5c64a6748e4caacf7490279`
- telemetry root-cause repair: `fc64132752458e3f604fb765ac54d96082f8ec48`
- CI #3354 / run `36421942096`: SUCCESS
- runtime evidence artifact: `10969458992`
- public mirror: `72f99c965aa13ea7232e036dc7fa9b07fa925734`
- Pages #74: SUCCESS

Next roadmap block: Economy & Pacing Pass with Character-enabled match-length audits.

---

# MMM — 2026-09-28 CHARACTER GAMEPLAY PASS CH-05

Canonical source branch: `mmm-mvp-0.1-dev`

**AUTHORITATIVE CHARACTER ID + PERCENT-BASED PASSIVES + REPLAY + RUNTIME VISUAL PROOF: PASS**

Approved gameplay direction changed during implementation from once-per-lap cooldowns to independent percentage rolls on each eligible trigger.

Live signature passives:
- KHÓC NHÈ / ĐƯỢC DỖ: 40% when a qualifying loss >=20B$ occurs; refund +10B$.
- CAU CÓ / ĐỪNG CHỌC TUI: 50% when directly targeted by another player's Card; counter-transfer 5B$.
- LO LẮNG / LO XA: 20% at an eligible free turn start when hand is not full; draw 1 Card.
- TĂNG ĐỘNG / KHÔNG NGỒI YÊN: 45% whenever eligible for a Mini Game start; +5B$.
- SECRET BABY / BÉ CƯNG CỦA VŨ TRỤ: 60% on qualifying loss >=20B$; refund +15B$.

Authority rules:
- `characterId` is now part of authoritative MatchState/checksum and survives replay/reconnect.
- Character reaction rendering prefers MatchState characterId, with gameSession only as legacy fallback.
- all passive chance rolls consume HOST/replay RNG only after their trigger condition is eligible.
- no client Math.random().
- no once-per-lap cooldown state remains.
- passive events expose `chancePercent` + `rollPercent` for future telemetry/balance work.

Runtime proof:
- CH-05 CI gate passes.
- passive popup shows the visible probability/roll line.
- manually inspected `full-scene-passive-1280x800.png` and `full-scene-passive-960x540.png`: both fit, remain readable, and show the full chance/roll line.

Validated checkpoint:
- authoritative Character identity foundation: `fa2fcea8...`
- probability refactor: `15acba9b5da21a7c66768b7fa0d55502d019859c`
- authoritative reaction fallback: `95cf4ab57fe8fcd2c72bf1c85ba3647be090503a`
- passive runtime visual proof: `888e8e69d5b51f69e369ba7438fb4df096c47ef2`
- final validated source: `b346eb8dd789621d4d190d71daa1a4b6dce88268`
- CI #3350 / run `36409702814`: SUCCESS
- runtime evidence artifact: `10963629691`
- public mirror: `f85b29d1dfcacf11a567d5099672c8dfabd49c6a`
- Pages #73: SUCCESS

Next Character task: run a deterministic Character Balance Audit over many character-enabled matches before tuning any percentages or payout amounts.

---

# MMM — 2026-09-28 FULL MATCH AUDIT 0715

Canonical transfer:
- `docs/SESSION_HANDOFF_2026-09-28_FULL_MATCH_AUDIT_0715.md`

**AUTHORITY + REPLAY + 2-LAP INTEGRATION + FULL CI + BROWSER RUNTIME + PUBLIC PAGES: PASS**

Full Match Audit followed the completed Mini Game variety pass instead of adding another feature blindly.

Fixes locked by this pass:
- Mini Game payout type is now derived from canonical `contentId + eligible participant count`;
- HOST rejects stale/wrong mode payouts (for example M44 cannot be paid as majority/minority);
- simulator uses the same canonical Mini Game mode source as runtime instead of generic majority/minority;
- Mini Game landing copy now uses each arena's real title/icon/description instead of stale “Nhiều ra ít bị” copy;
- replay restores match `targetLaps` from source snapshot, so 2/3-lap reconnect/replay does not depend on external setup state;
- telemetry now records Ready passes, board-shuffle count/laps, Mini Game content IDs and scoped reward types;
- historical generic M09/M17 payout fixtures were corrected to canonical slot-scoped payouts;
- deterministic outlier fingerprints were rebased only where the corrected payout changed money/checksum.

New integration gate:
- `tests/full-match-audit-0715.ts`
- 8 deterministic matches × 2 laps;
- every match finishes all 4 players;
- exactly 8 Ready passes and Lap Shuffle at [1,2];
- batch exercises all five canonical Mini Game content IDs;
- Card / News / Job / Lottery / Jail-Hospital release are exercised;
- all Mini Game reward types are slot-scoped;
- repeat seed produces identical report.

Validated checkpoint:
- authority/replay core: `7d96bdb1a83d46fb3060408965d6d1650b8214d6`
- audit gate: `1afe79697e38ee4fcb80a7756c0df76a792baaf1`
- legacy fixture correction: `f493bd8147ce4d793e47be8f4b3f3d51cf2fd9f1`
- final validated source: `e8315065e4b0b841b53235e5484b473e37937393`
- CI #3342 / run `36401376792`: SUCCESS
- runtime UI evidence artifact: `10959959934`
- public mirror: `d152603088514f0cef3cc6bf17c7f0414708bcb0`
- Pages #69: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

Current direction after this checkpoint:
- Mini Game variety pass is closed;
- Full Match Audit is closed;
- do not loosen Mini Game HOST mode validation;
- do not reintroduce generic payout types into live/system Mini Game resolution;
- preserve canonical single-owner UI;
- Character passives remain `live:false` until the Character gameplay pass deliberately defines and balances them.

---

# MMM — NEW CHAT TRANSFER AFTER M44

Canonical source branch: `mmm-mvp-0.1-dev`

## M44 ĐUA 3 CHẶNG / NƯỚC RÚT CUỐI VÒNG

**GAMEPLAY + CI + BROWSER REGRESSION + PUBLIC PAGES: PASS**

M44 now uses `final_sprint` for 3+ players:
- every contestant completes exactly 3 deterministic D6 legs;
- cumulative score decides the Top 2 Final seats;
- only a tie crossing the Top-2 cutoff enters deterministic D6 overtime;
- no Player-ID tiebreak at the cutoff;
- final two retain common OẲN TÙ XÌ;
- payout remains 25/15/5/5 and HOST payout ownership is unchanged.

Self-review fixes made before handoff:
- decoupled the M17 regression from M44's mode so each Mini Game test owns its own rule;
- added M44 test `test:minigame-final-sprint-0714` to the CI workflow;
- corrected lower-rank ordering to descending cumulative score (3rd before 4th).

Validated checkpoint:
- gameplay source: `9009a881dce3f51f622a6073b52d92eecc1445e1`
- regression decoupling: `f6f141be56dc3c15680db81e43281943105a9fdf`
- CI gate + ranking correction: `8f7d436aab2d796e39cd81129ffe76e174cabf61`
- final validated HEAD: `492bc7e9bf6c68aa737b2abe3d3f1a6c5663d4ce`
- CI #3336: SUCCESS
- public mirror: `18496ed27500bf693bd749940c1829dc98eeeca2`
- Pages #68: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

Mini Game set now has five distinct 3+ player mechanics:
1. M09 NHIỀU RA ÍT BỊ
2. M17 BA CỬA
3. M26 PHAO ĐƠN
4. M35 CẮT TOP XÚC XẮC
5. M44 ĐUA 3 CHẶNG

M17/M26/M35/M44 are complete. Do not redo them unless a runtime/device regression is reported. Preserve canonical single-owner UI architecture and deterministic/replay-safe gameplay.

---

# MMM — NEW CHAT TRANSFER AFTER M35

Canonical next-chat file:
- `docs/NEXT_CHAT_PROMPT_2026-09-28_AFTER_M35.md`

Current repo/gameplay checkpoint:
- repo HEAD before transfer: `850691ee69c57abd551e314486fda03b7eae4dce`
- M35 final validated: `e62d0de4928f3f117518cc4b350cd585c4b60a69`
- CI #3332 SUCCESS
- Pages #66 SUCCESS

Next gameplay target: **M44 NƯỚC RÚT CUỐI VÒNG**. M17/M26/M35 are complete and must not be redone. Preserve M44 payout 25/15/5/5, HOST payout ownership, deterministic/replay-safe logic, common 2-player RPS final, and current canonical UI ownership.

---

# MMM — 2026-09-28 M35 CẮT TOP XÚC XẮC GAMEPLAY UPGRADE

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

# MMM — 2026-09-28 M26 PHAO ĐƠN GAMEPLAY UPGRADE

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

# MMM — 2026-09-28 M17 BA CỬA GAMEPLAY UPGRADE

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

# MMM — 2026-09-28 MINI GAME + JOB READABILITY PASS

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

# MMM — 2026-09-28 MOBILE LANDSCAPE ENTRY FIX

Canonical newest transfer:
- `docs/SESSION_HANDOFF_2026-09-28_MOBILE_LANDSCAPE_ENTRY.md`

**MOBILE BOOT DEADLOCK: AUTOMATED PASS / REAL DEVICE RETEST NEEDED**

- Validated source: `1e40fb0c64b0f6a1b5563e403c4ec16e4c91193c`
- CI #3317 / run `36371325357`: SUCCESS
- Mobile runtime proof: `[mobile-landscape-entry] PASS unsupported orientation lock cannot trap mobile boot`
- Public mirror: `59cc3fb0e93eaef45f33d08e30fefa860268395e`
- Pages #59 / run `36371600248`: SUCCESS
- https://ronvotri.github.io/MeMeMe-Web-Playtest/

The rotate gate may no longer wait forever for hardware orientation. After user activation it tries fullscreen + orientation lock, then falls back to entering the game if the browser refuses to auto-rotate.

---

# MMM — 2026-09-28 CANONICAL UI SINGLE-OWNER RESET

Canonical newest transfer:
- `docs/SESSION_HANDOFF_2026-09-28_UI_SINGLE_OWNER_RESET.md`

**ARCHITECTURE + FULL-SCENE BROWSER + CI + PUBLIC PAGES: PASS / RON DEVICE ACCEPTANCE PENDING**

- Runtime source: `1b19b9a7ecfc59b86070db6587e29823fd0c0f74`
- CI #3314 / run `36362271301`: **SUCCESS**, all 137 steps
- New full-scene browser gate: **PASS**
- Runtime evidence artifact: `10946560222`
- Public mirror: `22cdc87e5a8f051c702fc512423f2816518042b4`
- Pages #58 / run `36362462484`: **SUCCESS**
- https://ronvotri.github.io/MeMeMe-Web-Playtest/

The persistent UI root cause was competing inherited presentation writers. The live scene now declares one canonical UI owner; historical presentation polish/guard/reflow writers no-op while their authority/flow fixes remain inherited. The 07044 per-frame and POST_UPDATE text scavengers are no longer in the live frame loop.

The new Playwright regression calls normal `super.create()` and keeps the inherited `update()` chain running. Card/News/Job/Mini Game ranking canonical bodies survived the real full-scene update chain.

**Do not add another presentation hotfix wrapper.** If Ron still finds a device-only visual issue, change the canonical producer and extend the full-scene test.

Real-device acceptance against the September screenshots is the next gate.

---

# MMM — 2026-09-28 ROOT CAUSE AUDIT

Read first:
- `docs/UI_ROOT_CAUSE_AUDIT_2026-09-28.md`

**Do not continue cosmetic hotfixing.** The active board uses an approximately 35-class inheritance chain with multiple presentation writers still mutating the same UI every frame. The current Playwright modal fixture disables `update()` and does not call the normal full scene `super.create()`, so it cannot reproduce the live writer-vs-writer conflict.

Ron reports the long-running UI issue is still unresolved. Real-device acceptance is FAIL. Next work must inventory and consolidate UI ownership before further typography/layout tuning.

---

# MMM — 2026-09-28 CURRENT HANDOFF

Canonical newest transfer:
- `docs/SESSION_HANDOFF_2026-09-28_LOCAL_SCROLL_VIEWPORT.md`

**SOURCE + BROWSER FIXTURES + CI + PUBLIC PAGES: PASS / REAL-DEVICE ACCEPTANCE PENDING**

- Runtime source: `f0f1814b736da53fac95e78b6161a899a452d998`.
- CI #3308 / run `36335397011`: SUCCESS.
- Public mirror: `bcfc11f6d1e08959ff6b035aada45dcebb217d9c`.
- Pages #57 / run `36335598563`: SUCCESS.
- https://ronvotri.github.io/MeMeMe-Web-Playtest/

Shared scroll viewport now uses local texture cropping instead of world-coordinate GeometryMask. Fixed readable fonts + vertical scrolling remain. Job/Card/News/Mini Game papers compact around content; helper typography is larger; Roll For Order status/helper spacing is corrected. Both WebGL and Canvas pixel checks pass under nested transforms and camera zoom/scroll. Production-producer screenshots at 1280×800 and 960×540 have been visually reviewed.

Next: Ron's actual Steam Deck/browser acceptance against the nine September 27 screenshots. CI/browser fixtures do not replace device acceptance. Preserve gameplay/Host RNG/Worker/reconnect and Character behavior. Keep PR #1 Draft/Open; do not start 0.1.71.

The September 27 FAIL checkpoint below is historical and superseded by this implementation, but its device evidence remains the acceptance checklist.

---

# MMM — 2026-09-27 CURRENT HANDOFF

Canonical newest transfer:
- `docs/SESSION_HANDOFF_2026-09-27_RUNTIME_UI_REGRESSION.md`

**RUNTIME UI STATUS: FAIL / NOT ACCEPTED**

Latest user screenshots show:
- Job result body missing with huge empty paper;
- Card body blank;
- News body mostly clipped;
- Mini Game ranking clipped at left edge;
- overall helper/body typography still too small while modal surfaces waste space.

Primary next action: repair the shared scroll viewport coordinate-space/mask architecture. Do not tweak content-specific positions. Preserve the fixed-font + scroll rule, then compact short-content modals and enlarge secondary text.

Latest validated implementation before screenshot rejection:
- source `d13beed6cbb880487c50cd239359d4a4d91311fc`
- CI #3304 SUCCESS
- mirror `6c31a5af7d3c20ffb1b604590a8e9c6b244b5a96`
- Pages #55 SUCCESS

CI green is not visual acceptance.

---

# MMM — 2026-09-27 CURRENT HANDOFF

Canonical newest transfer:
- `docs/SESSION_HANDOFF_2026-09-27_SCROLLABLE_UI_070429.md`

Latest validated UI source:
- `d13beed6cbb880487c50cd239359d4a4d91311fc`
- CI #3304: **SUCCESS**
- public mirror `6c31a5af7d3c20ffb1b604590a8e9c6b244b5a96`
- Pages #55: **SUCCESS**

Current UI rule: **fixed readable typography + hard clipping + vertical drag/scroll for overflow**. Never shrink long body copy merely to force it inside a modal. Canonical Card/News, Job result, Mini Game result and Mini Game ranking now follow this rule. Real-device visual acceptance is pending.

---

# MMM — 2026-09-27 CURRENT HANDOFF

Canonical newest transfer:
- `docs/SESSION_HANDOFF_2026-09-27_CHARACTER_CH04.md`

Latest validated gameplay build:
- source `0ec100f50c12e5e60f13ffa7ff74756fa71bc88b`
- CI #3292: **SUCCESS**
- public mirror `19a7e87d79e5343fc45137704e1bee65d13b17a6`
- Pages #51: **SUCCESS**

Current build direction: **CH-04 Character reaction identity**. CH-04A Card/News profiles and CH-04B Job/Mini Game/salary/Lap Shuffle moments are implemented and CI green. Character passives remain `live:false`. Steam Deck/Card-News/art runtime acceptance is intentionally pending while Ron continues feature development.

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

# Mmm-BG — HANDOFF CURRENT

## September 25 session transfer — READY FOR NEW CHAT

Canonical transfer file:
- `docs/SESSION_HANDOFF_2026-09-25_VF06.md`

Validated runtime source remains:
- `e9a1fb44c8b628e93c91b824f7c31ed0cbb11f6f`
- CI #3244 / run `36096638993`: **SUCCESS**
- public mirror `731a97eca5a89e40844d02623cd9936aad4c4862`
- Pages #33 / run `36096743757`: **SUCCESS**

New-chat priority: read Ron's newest runtime feedback first; VF-06 Job Hub still needs device/visual acceptance. Card/News containment must remain root-level and generic. CH-02G face-fit acceptance remains parallel/pending.

## September 25 VF-06 canonical JOB HUB visual proof

The canonical Job Hub now gets the next Visual Foundation sample while keeping the existing authoritative D6/input flow intact.

Visual direction:
- warm cream/cocoa toy-box shell shared with the rest of the game;
- butter header and concise instruction chip;
- three slot cards keep the existing A/B/C and D6 ranges but use distinct soft personality colours;
- large standalone Job icon wells replace the weaker small-icon feel;
- Job name stays separate from the icon;
- salary is compressed to one readable line: Lv1 / Lv2 / Lv3;
- detail sheet uses one large icon above the Job name, so the old duplicate small icon beside the title is removed;
- risky/crime Jobs use coral/red treatment without changing Job mechanics;
- roll CTA remains the single dominant action;
- keyboard / mouse / Steam Deck focus, detail ownership, spectator lock and authoritative roll path are unchanged.

Canonical:
- `src/ui/visualFoundationJobVf06.ts`
- `src/ui/JobChoicePicker.ts`
- `tests/visual-foundation-job-vf06.ts`

Validation:
- validated VF-06 HEAD: `e9a1fb44c8b628e93c91b824f7c31ed0cbb11f6f`
- MMM MVP CI #3244 / run `36096638993`: **SUCCESS**
- retained Job layout / authority / keyboard / Steam Deck gates: **SUCCESS**
- VF-06 gate: **SUCCESS**
- compiled public mirror: `731a97eca5a89e40844d02623cd9936aad4c4862`
- GitHub Pages #33 / run `36096743757`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Runtime/device acceptance remains required before calling VF-06 visually complete.

## September 25 VF-05.1 canonical LÁ BÀI visual proof

After the Card/News containment root fix passed, the canonical **LÁ BÀI** surface now receives its own Visual Foundation skin without changing gameplay/presentation ownership.

Direction:
- same exact 720×300 canonical owner and .22 reaction-lane geometry;
- warm cream/cocoa foundation shared with TIN TỨC;
- lavender collectible-card header;
- soft lavender body paper for Vietnamese copy;
- butter impact/rarity sticker well;
- small coral/aqua sticker tabs for kinetic energy;
- dark cocoa copy instead of the previous flat dark-purple debug-panel treatment;
- title/body still use the existing adaptive fixed bounds and max-line containment;
- no new container, camera, input owner, RNG, MatchState path or gameplay authority.

Canonical:
- `src/ui/visualFoundationCardVf051.ts`
- `tests/visual-foundation-card-vf051.ts`

Validation:
- VF-05.1 source: `39c1e0baa03fbb918b40c69af4881ed7f9a0a45f`
- MMM MVP CI #3240 / run `36095722761`: **SUCCESS**
- VF-05 News + VF-05.1 Card gates: **SUCCESS**
- Card/News containment and presentation-owner gates still pass in the same run
- compiled public mirror: `042e9c05f042b61d2e6922e0c9b31ba5a5939d0b`
- GitHub Pages #32 / run `36095790022`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Next acceptance is visual/runtime review on desktop + Steam Deck/mobile landscape. Do not reskin every unrelated modal yet.

## September 24 Card/News content containment hotfix — screenshot root fix

Ron supplied two runtime screenshots that reproduce the long-standing Card/News failure:
- **Kéo Hai Cửa**: description + result escaped left of the purple Card while the canonical body area was empty;
- **Hoàn Tiền Bất Ngờ**: `+25B$ / → CPU 4 nhận 25B escaped left of the warm News sheet.

The previous guards were not sufficient because one inherited producer could emit **description + arrow-summary inside one loose Text object**. The semantic owner guard compared whole strings/individual values, so the combined block did not match and survived. The canonical rebuild also created modal Text via `this.add.text(...)` before parenting, leaving an avoidable window for camera routing of a loose child.

Root fix:
- new pure policy `src/ui/presentationTextOwnership070423.ts` compares semantic **lines**, stripping arrow/bullet prefixes;
- a detached Text is suppressed only when every meaningful line belongs to the active Card/News model, so HUD/reaction text is not caught;
- screenshot-exact Card and News strings are regression fixtures;
- canonical Card/News text/graphics are now created **off the Scene Display List** with `new Phaser.GameObjects.*` and rendered only through the single owner container;
- canonical owner root is `scrollFactor(0)`;
- title/body get hard `maxLines` plus existing fixed-size adaptive boxes;
- no card-specific IDs/titles are used by runtime logic. The fix applies to all current/future Card and News copy.

Canonical regression:
- `tests/presentation-content-containment-070423.ts`

Validation:
- validated source HEAD: `8a1ca0b37c10c44d9cfb8b92607233728408761a`
- MMM MVP CI #3239 / run `36030534270`: **SUCCESS**
- legacy layout-lock / global-owner / adaptive-safe-area / .22 owner tests: **SUCCESS**
- screenshot-specific containment regression: **SUCCESS**
- compiled public mirror: `e95b7caf9d190387d3327ebf66a6971499390974`
- GitHub Pages #31 / run `36030638473`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`

The two screenshot failures are now explicit regression fixtures, not title-specific runtime patches. Future Card/News body copy must remain container-owned and may not escape through a combined description + summary Text object.

## September 24 CH-02G KHÓC NHÈ neutral layered runtime proof

The first actual Character layer binaries are now wired into Character Select for **KHÓC NHÈ / neutral only**.

Runtime proof assets:
- `public/assets/characters/starter-crybaby/neutral/body-back.webp`
- `public/assets/characters/starter-crybaby/neutral/face-mask.webp`
- `public/assets/characters/starter-crybaby/neutral/foreground.webp`

Behavior:
- selecting KHÓC NHÈ with a captured face renders the retained non-circular player source inside the Character mask and puts the approved-style Character foreground above it;
- the previous CH-02D face-only proof remains the fallback for the other three starters;
- RANDOM remains concealed and does not preload/display Secret Baby art;
- this first asset is intentionally preview-sized 128×192 to validate the runtime stack cheaply before committing full 1024×1536 production exports;
- exact proof socket is recorded under `runtimeProof`, while the final production `faceSocket` remains unset;
- the whole Character remains `layer-export-pending`; one neutral proof is not enough to declare production art complete.

Next acceptance: real photos with different face shapes on desktop, Steam Deck and mobile landscape. If the neutral proof survives, replace the preview-sized export with the full production neutral layers before generating the other six emotions.

Validation:
- CH-02F source `d73f637ccf67c2d71d0d12e87e780cdbea8da12a`: CI #3235 / run `35975065152` **SUCCESS**
- CH-02G source `0983a95fdf328e7ef68376226457c9fb63b5ef5c`: CI #3236 / run `35978534196` **SUCCESS**
- CH-02A through CH-02G gates: **SUCCESS**
- compiled public mirror: `c40aea0cd65af24ff18d3bfe90a459d80e8a0166`
- GitHub Pages #30 / run `35978666671`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`
- runtime/device visual acceptance is still required before promoting the proof socket or generating the remaining poses.

## September 24 CH-02F KHÓC NHÈ neutral face-fit proof

The first KHÓC NHÈ neutral layering experiment is complete at proof level.

Validated direction:
- one non-circular Character socket handles round / long / square / narrow head proportions;
- source aspect ratio is preserved, so faces are not stretched into one universal oval;
- composition stays body → player head → mask/socket → foreground → FX/UI;
- prototype socket calibration is proof-only and is not promoted to runtime manifest until the exact final transparent layer binaries are committed;
- do not generate all seven emotions yet. One neutral runtime asset must pass real-device + real-photo tests first.

Canonical CH-02F:
- `src/core/characterFaceSocketFitCh02f.ts`
- `tests/character-face-socket-fit-ch02f.ts`
- `docs/CHARACTER_KHOCNHE_NEUTRAL_FACE_FIT_CH02F.md`
## September 24 CH-02E layered Character art production contract

The approved Drive concepts now have a canonical production-layer manifest without adding the concept binaries to Git.

Canonical files:
- `src/content/core/character_art_manifest_v01.ts`
- `docs/CHARACTER_ART_LAYER_PIPELINE_CH02E.md`
- `tests/character-art-layer-pipeline-ch02e.ts`

Locked export contract:
- 1024×1536 transparent master per pose;
- seven emotions per Character;
- `body-back.webp` behind the player head;
- `foreground.webp` above the player head;
- `face-mask.webp` for an irregular head-safe mask;
- no hard circular Character mask;
- socket coordinates are deliberately **not guessed** until the final layers exist;
- manifests remain `layer-export-pending` until measured;
- Secret Baby production art may exist but must not be imported by normal Character Select before reveal;
- Secret Baby pacifier belongs in foreground so it overlaps the inserted face naturally.

Next art proof: **KHÓC NHÈ / neutral** layered export only, then real-face fit validation before scaling to all poses.

Validation:
- CH-02E source: `84bf2526d67e228e81170e5f19a0361fa194ccfe`
- MMM MVP CI #3234 / run `35971193043`: **SUCCESS**
- CH-02A through CH-02E gates: **SUCCESS**
- compiled public mirror stays at `c46d96546c8bb4b094d38d20796b5ea185ca2ff7` because CH-02E adds only production-art manifest/docs/tests and does not change the runtime bundle.
- Pages #29 remains the current validated public build.

## September 24 CH-02D non-circular face-composite proof

Validation completed before CH-02E:
- CH-02D source: `7fdcaaaa6a804410f3b6b80b02b23cff9e30e755`
- MMM MVP CI #3233 / run `35970840484`: **SUCCESS**
- public mirror: `c46d96546c8bb4b094d38d20796b5ea185ca2ff7`
- Pages #29 / run `35970955572`: **SUCCESS**


CH-02D now connects captured player faces to Character Select without regressing to the old circular crop.

Implemented:
- `src/core/characterFaceCompositeCh02d.ts` chooses the deterministic capture for a Character emotion;
- non-circular `compositeSourceDataUrl` is always preferred; circular avatar is fallback only;
- selected fixed Character cards preview the player's retained non-circular head source;
- RANDOM cards remain visually concealed and do not reveal a Character body/face combination early;
- online Turn Order profile wire now syncs bounded `compositeFaces`;
- remote profiles restore the non-circular source for future Character reactions;
- no passive behavior changed;
- no approved concept sheet is bundled into runtime yet.

This is a source/transport proof. Final face-in-character art still requires production layered assets from the approved Drive concepts.

## September 24 CH-02C Character Select + concealed RANDOM reveal

Runtime wiring has started on top of the approved CH-02B contract.

Implemented:
- Setup sequential Character Select with **KHÓC NHÈ / CAU CÓ / LO LẮNG / TĂNG ĐỘNG / RANDOM (?)**;
- RANDOM UI does not reveal Secret Baby name, art or 5% rate;
- human selection is required before continuing; CPU seats default to RANDOM;
- fixed choices store a starter ID; RANDOM stores only an unresolved intent;
- online Turn Order profile wire carries fixed starter ID or `mode: random`, never a Secret assignment;
- HOST resolves the full batch through `src/core/characterPregameCh02c.ts` using a serializable RNG state and no `Math.random()`;
- dedicated `character_reveal` protocol message is the first point where RANDOM identity is sent to remote clients;
- Turn Order now owns a single reveal overlay; RANDOM cards show ? first and flip one by one;
- Secret Baby gets a stronger text reveal beat: `SECRET! EM BÉ BÁ ĐẠO`;
- approved Drive sheets remain reference-only and are not bundled directly into runtime;
- direct one-face editing now also retains `compositeSourceDataUrl`, matching the existing batch/camera paths.

Validation:
- source commit: `268e9b5d3a6d500bfdb487e4479f59a74159f151`
- MMM MVP CI #3229 / run `35967947457`: **SUCCESS**
- CH-02A / CH-02B / CH-02C gates: **SUCCESS**
- compiled public mirror: `6ab14eb2245082a8c5cfe8e16e44552b32a9bf64`
- GitHub Pages #28 / run `35968051860`: **SUCCESS**
- public URL remains `https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Runtime device acceptance is still required. Next test should verify sequential selection, RANDOM concealment, reveal timing, online Host/client ownership and Steam Deck focus.

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
Branch: `mmm-mvp-0.1-dev`  
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
