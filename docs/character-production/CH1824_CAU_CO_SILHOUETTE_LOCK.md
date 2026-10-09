# CH-18.24 — CAU CÓ silhouette contract

**Authority:** `docs/character-production/canon/cauco.webp` (original concept sheet, male 40–50). Reference image appearance takes priority over passing movement tests. The original artwork shows the character holding a **compact briefcase on the viewer's left**, and a dark olive shoulder-draped coat ending above the knees/shoes. Its signature head, salt-and-pepper sweep, stern expression, gold-rimmed glasses, crown-pattern tie, brown suspenders, high-waisted trousers and polished loafers must remain recognizable.

## Corrections made

The previous rig incorrectly placed a 48×66 source-unit bag at (+51,95), left it full-sized and painted it behind the body. That created a bulky, floating right-side prop unlike canon. Now the bag is scaled to 0.76×0.55 at (-49,110), drawn in the foreground relative to torso/legs, with a smaller motion swing. The previous 112×112 full-size shoulder cape extending to source y=167 is now scaled 0.90×0.82, ending ~y=147 before the shoes (~y=188). These values are pinned in `CAU_CO_RIG_PILOT_CH1822.geometryLock` and checked in `tests/character-rig-silhouette-ch1824.ts`.

## QA evidence

Playwright browser QA saves `runtime-ui-evidence/cau-co-rig-ch1822-qa.png` and `runtime-ui-evidence/cau-co-rig-vs-canon-ch1824.png`; the latter places the exact repo canon reference at left of the *actual Phaser rendered* rig, so body silhouette and part alignment differences can be judged visually. This is an ART REVIEW tool, not automated evidence of matching artwork.

## Gate / contracts

Rig remains QA-only `?cauCoRigPreview=1`, `productionApproved: false`. **The hand-authored SVGs still cannot claim pixel-for-pixel or canon-identical fidelity.** Further manual art redrawing / true high-res layer illustration is required before admitting production. Old approved strip stays as default; no changes to gameplay authority, SECRET BABY RANDOM-only rules, face socket/live camera, under-foot active ring or Cloudflare Worker.
