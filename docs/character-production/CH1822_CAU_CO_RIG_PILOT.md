# CH-18.22: CAU CÓ part-based rig pilot

The user requested joint animation instead of background-removed frame strips. This slice builds a new **18-piece independent vector puppet**, with upper and lower arms, legs and shoes, separate head/hair/glasses, torso, draped jacket and satchel. Each part is individually generated as SVG so an artist can revise it without repainting eight whole walk frames.

Source: `scripts/materialize-cau-co-rig-ch1822.mjs`. Generated assets: `public/assets/characters/ch1822/cau-co/*.svg`. Motion: `src/ui/characterRigCh1822.ts`.

The rig has nested shoulder/elbow and hip/knee pivots, idle breathing (2200ms), alternating gait and counter-swing arms. Scale is 104/192 so foot ring remains separate at local Y=31, below both rig and production sprites. Facing is maintained by root X reflection.

**QA-only**: request `?cauCoRigPreview=1` on the playtest URL. Otherwise CAU CÓ still renders `walk-cau-co-production-x4.png`. Canon authority is `docs/character-production/canon/cauco.webp`. The hand-illustrated SVG layers are a functional motion pilot, NOT accepted final character artwork and must be visually compared/revised for full fidelity. Never label rig art as production until approved.

A genuine ring bug was also corrected: `legacyHalo.visible` becomes false after being hidden intentionally. It must not be used to decide the next frame's active ring visibility. The turn's current player owns the visible foot ring.

Gameplay authority, Secret Baby RANDOM rules, face socket/live camera and Cloudflare Worker unchanged.
