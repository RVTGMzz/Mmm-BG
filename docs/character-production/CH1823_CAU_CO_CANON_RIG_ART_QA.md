# CH-18.23 — CAU CÓ Canon Rig Art QA

**Build:** `0.1.70.4.77`. **Branch:** `mmm-mvp-0.1-dev`.

## Source authority
`docs/character-production/canon/cauco.webp`. The character must stay a **40–50 year old man**, stern and fussy rather than a friendly generic chibi. Visual anchors: voluminous brushed-back salt-and-pepper hair, dark arched eyebrows, rectangular gold glasses, moustache and chin beard, draped pinstriped olive jacket with golden crown pin, white shirt, brown leather suspenders, brown gold-crown patterned tie, brown formal trousers, gold-buckled polished loafers, brown crown-patterned briefcase, watch, green-gem ring.

## Technical animation
18 separately drawn SVG part assets produced by `scripts/materialize-cau-co-rig-ch1822.mjs`, with nested joints in `src/ui/characterRigCh1822.ts`. Idle uses mild 2.2s chest breathing and folded-arm pose. Movement blends in/out over about 145ms and includes counter-swing arm joints, independent hips and knees, slight lifting steps, head follow-through and briefcase/coat drag. The root stays scaled from 192-source to 104-board units.

## Known CI correction
Browser QA of .76 failed on under-foot active-ring width because the new ring inherited scale of an old larger halo. Width/height now remain within a controlled 0.94–1.08 pulse of 78×18. No gameplay or face-camera changes.

## Admission policy
- This **remains an illustration/pivot pilot**, not identical layered original concept source and **not production approved**. Do not silently replace production art.
- Only with `?cauCoRigPreview=1` can it replace CAU CÓ for visual testing. Default is the existing approved strip fallback.
- Compare the generated SVG shapes against `cauco.webp` at both enlarged view and 104×104 on Board, and inspect screenshot artifact before any art sign-off.
- Preserve under-foot ring, face socket/live camera, SECRET BABY RANDOM-only rules and frozen Cloudflare Worker.
