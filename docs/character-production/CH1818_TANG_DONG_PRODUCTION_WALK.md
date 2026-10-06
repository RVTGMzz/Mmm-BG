# CH-18.18 — TĂNG ĐỘNG production walk

Build: `0.1.70.4.72 — CH-18.18 TĂNG ĐỘNG PRODUCTION WALK`

## Canon authority

Approved concept:
`docs/character-production/canon/tangdong.webp`

Source metadata:
- Drive file: `tangdong.webp`
- Drive ID: `1zjtCwUM3oh2_wsa9M7Ys7Msif9i2XYv5`
- 1122×1402
- 240,936 bytes
- SHA-256: `8bd94dc4cb712fe00dceec59ca68deb77069e79b04d6ee4f7d5aeb4c8c84dd5f`

Locked canon:
- female 18–24;
- messy brown double/twin buns;
- colorful sunglasses on top of the head;
- pink/white headphones;
- oversized yellow/pink/teal sticker-heavy sporty jacket;
- white cropped top;
- black athletic shorts with white trim;
- chunky multicolor sneakers;
- teal sticker-covered backpack;
- bunny charms/keychains, handheld game device and playful accessories;
- dynamic leaning/bouncing body language.

Forbidden drift:
- changing age or gender presentation;
- officewear/formal redesign;
- removing the twin-bun silhouette;
- muting the jacket colors;
- removing chunky colorful sneakers;
- removing the backpack/charm/gadget-heavy silhouette;
- calm static posing that loses the restless energy.

## Production walk

Runtime asset:
`public/assets/characters/ch181/walk-tang-dong-production-x4.png`

- 1536×192
- 8 frames × 192×192
- transparent background
- 310,854 bytes
- SHA-256 `98a4ab0c84ff399ed4c846e2adafe80892125ddc7373a03d1414b5de546538c9`
- common foot baseline
- no active ring baked into the sprite

The source was generated at higher visual resolution and normalized downward into the 192px runtime frames. It is not an upscale/remaster of the legacy 48px fallback row.

## Runtime contract

- `starter-hyper` is now `runtime-production-strip`.
- Runtime route: `HYPER_PRODUCTION_WALK_KEY_CH1818`.
- Existing 8-frame cadence remains.
- Existing left/right flip remains.
- CH-18.13 idle breathing remains active when standing.
- Active ring remains 78×18 at local Y=31 below the Character.
- Face socket/live camera contract remains unchanged.

Production roster after this slice:
- KHÓC NHÈ — production
- CAU CÓ — production
- LO LẮNG — production
- TĂNG ĐỘNG — production
- SECRET BABY — fallback-only until a genuine infant high-resolution strip exists

Cloudflare Worker remains frozen.
