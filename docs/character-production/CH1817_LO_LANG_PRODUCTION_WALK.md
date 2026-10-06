# CH-18.17 — LO LẮNG production walk

Build: `0.1.70.4.71 — CH-18.17 LO LẮNG PRODUCTION WALK`

## Canon authority

Approved concept:
`docs/character-production/canon/lolang.webp`

Source metadata:
- Drive file: `lolang.webp`
- Drive ID: `1PLBsvV5_d0fvda4K7od9dv_de7M-H8qq`
- 1122×1402
- 212,632 bytes
- SHA-256: `e1a6ccd8e7586584949b34fb9a227ba2cdfc4f91bb0c88bcce880a2eb8ada964`

Locked canon:
- male 28–35;
- messy voluminous brown hair;
- large dark rectangular glasses;
- dark teal / forest-green planner-core top over white collar/cuffs;
- wide cream-beige trousers;
- green-and-cream sneakers;
- overloaded brown organizer satchel/backpack silhouette;
- multiple planners, notebooks, checklists, pens, phone, utility items, water bottle and dangling keychain;
- worried brows / constantly-checking body language.

Do not redesign him into a formal businessman, confident hero, athletic silhouette, slim dark trousers, or a clean/minimal bag setup.

## Production walk

Runtime asset:
`public/assets/characters/ch181/walk-lo-lang-production-x4.png`

- 1536×192
- 8 frames × 192×192
- transparent background
- 36,742 bytes
- PNG8 / 32-color optimized production export
- SHA-256: `c112d1ced88c11d41bd59a71cb2bd1683655803e827912c5079cd103f3da0497`
- common foot baseline
- active ring removed from the art; runtime ring remains separate

The strip was authored from a high-resolution Character candidate matched visually against the approved concept. It is not an upscale/remaster of the legacy 48px fallback row.

## Runtime contract

- `starter-anxious` is now `runtime-production-strip`.
- Runtime route: `ANXIOUS_PRODUCTION_WALK_KEY_CH1817`.
- Movement cadence remains 8 frames / existing left-right flip.
- Standing Character still uses CH-18.13 subtle idle breathing.
- Active ring remains 78×18 at local Y=31 below Character art.
- Face socket/live camera contract unchanged.
- TĂNG ĐỘNG and SECRET BABY remain fallback-only.

## Corrected CH-18.16 CAU CÓ fingerprint

CH-18.16 source chunks decode to:
- 1536×192
- 32,472 bytes
- SHA-256 `e6aac908cf41d99e6e806b4c8aa206a052fac4f67142277b1205780fc760544b`

Earlier handoff text that said 32,474 bytes / `6e79...` was stale metadata only; CI exposed and corrected it. Runtime asset dimensions were already valid.

Cloudflare Worker remains frozen.
