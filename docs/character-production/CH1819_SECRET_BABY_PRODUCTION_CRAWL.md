# CH-18.19 — SECRET BABY production crawl

Build: `0.1.70.4.73 — CH-18.19 SECRET BABY PRODUCTION CRAWL`

## Canon authority

Approved concept:
`docs/character-production/canon/embe.webp`

Source metadata:
- Drive file: `embe.webp`
- Drive ID: `1vJIkKjMhqZSHfQ3hylYF39XxfpBYYGrv`
- 1122×1402
- 182,156 bytes
- SHA-256: `f5cd53cb3eacb8f1c9da6af5ff3dc09b5dcb562235bca51e1a8f612ef7f40713`

Locked canon:
- age presentation: infant;
- bald baby;
- crawling / one-hand-down silhouette;
- gold pacifier with crown emblem;
- small crown;
- red royal cape with white-and-black spotted fur trim;
- gold chain / crown pendant;
- white diaper / baby romper with crown motifs;
- tiny body + absurdly bossy/authoritative expression.

Forbidden drift:
- toddler / child / teen redesign;
- upright starter-style walking body;
- adult hair;
- removing pacifier;
- removing royal cape / crown / gold-chain identity;
- changing the crawl silhouette into an adult walk cycle.

## Production movement

Runtime asset:
`public/assets/characters/ch181/walk-secret-baby-production-x4.png`

- 1536×192
- 8 frames × 192×192
- transparent background
- 444,398 bytes
- SHA-256 `417f9df93ffcfca6d333ac45f03087d085aa3dc964e3e26522518b1d912e9d89`

This strip was built directly from the approved high-resolution `embe.webp` crawl pose and normalized into 8 subtle crawl/bob phases. It is **not** an upscale/remaster of the legacy 48px fallback row.

## Runtime contract

- `secret-baby` is now `runtime-production-strip`.
- Runtime route: `SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819`.
- Existing movement driver still advances 8 frame indices; for Secret Baby those frames are crawl/bob phases rather than an upright walk.
- Existing left/right flip remains.
- CH-18.13 idle breathing remains presentation-only.
- Active ring remains 78×18 at local Y=31 below Character art.
- Face socket/live camera contract unchanged.

## Secret rules preserved

Production art does not change the gameplay/selection contract:
- `randomOnly: true`
- `directSelectable: false`
- 5% RANDOM eligibility remains HOST-authoritative
- max one Secret Baby per RANDOM batch
- normal Character Select must not expose Secret Baby directly

## Production roster after CH-18.19

All five runtime Character slots now have genuine production movement sources:
- KHÓC NHÈ
- CAU CÓ
- LO LẮNG
- TĂNG ĐỘNG
- SECRET BABY

Cloudflare Worker remains frozen.
