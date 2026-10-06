# CH-18.19 — SECRET BABY repo-standard production crawl

Build: `0.1.70.4.73 — CH-18.19 SECRET BABY PRODUCTION CRAWL`

## Why this slice was redone

The first CH-18.19 attempt was rejected because it drifted away from the actual repo-standard Secret Baby silhouette. That attempt was fully rolled back to the green CH-18.18 tree before rebuilding.

For this corrected slice, the primary visual authority is the art already shipped in the repo/build:
- `public/assets/characters/ch181/portrait-atlas-secret-baby.webp`
- row 4 of `public/assets/characters/ch181/walk-atlas.webp`

The approved Drive concept `embe.webp` remains secondary reference through the existing Character art manifest, but movement silhouette must match the repo-standard crawl art above.

## Locked visual identity

SECRET BABY / EM BÉ BÁ ĐẠO:
- infant;
- bald head;
- very low crawl silhouette;
- short infant limbs;
- small gold crown;
- gold pacifier;
- red cape trailing behind the body;
- tiny rounded body;
- narrowed, bossy expression.

Forbidden drift:
- toddler/child proportions;
- upright starter-style walk;
- adult hair;
- oversized staff/weapon;
- invented necklace/harness/accessories absent from the repo standard;
- raising the baby so high that it reads like an adult Character token.

## Production crawl

Runtime asset:
`public/assets/characters/ch181/walk-secret-baby-production-x4.png`

- 1536×192
- 8 frames × 192×192
- transparent background
- 363,723 bytes
- SHA-256 `5b00136a4077703e9ebe3d7116f243e1330aadba04fd9b4acf94035ca4125a0c`
- normalized to the same approximate per-frame occupied box as the existing repo crawl row: about 176×164, baseline at the bottom of each 192px cell
- no active ring baked into the asset

The eight frames are genuine high-resolution crawl poses derived from the approved repo-standard appearance. They are not an upscale of the legacy 48px fallback row.

## Runtime contract

- `secret-baby` is now `runtime-production-strip`.
- Runtime key: `SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819`.
- Existing 8-frame movement driver is reused; for Secret Baby those indices represent crawl phases.
- Existing left/right flip remains.
- CH-18.13 idle breathing remains presentation-only.
- Active ring remains 78×18 at local Y=31 below Character art.
- Face socket/live camera contract remains unchanged.

## Secret gameplay contract remains locked

- `randomOnly: true`
- `directSelectable: false`
- 5% HOST-authoritative RANDOM eligibility
- max one Secret Baby per RANDOM batch
- never exposed as a normal Character Select choice

After CH-18.19, all five Character slots have genuine production movement sources.

Cloudflare Worker remains frozen.
