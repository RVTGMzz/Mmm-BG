# CH-18.20 — Character animation repair

Build: `0.1.70.4.74 — CH-18.20 CHARACTER ANIMATION REPAIR`

## Why this repair exists

Runtime feedback exposed two separate asset problems:

1. **CAU CÓ was not merely visually rough.** The deployed PNG had a valid PNG signature and dimensions, but its IDAT stream had a bad CRC. When decoded permissively, it contained only partial heads plus horizontal corruption. The old CH-18.16 checks only validated the header, dimensions, byte length and SHA-256, so a corrupt-but-stable PNG could still pass.
2. **LO LẮNG and TĂNG ĐỘNG were valid images but still had weak semi-transparent edge pixels**, making the Character cutout look not fully separated from the background at board scale.

## Rebuilt / cleaned assets

- CAU CÓ: `public/assets/characters/ch181/walk-cau-co-production-x4.png`
  - direct binary asset; old four-base64-chunk materialization path removed
  - 1536×192, RGBA
  - 239,574 bytes
  - SHA-256 `a93b1b7b642f9a4da6f32f8ad7e52a80f9cbb9e828f1bebeb0544dd5012a9504`
  - genuine 8-pose walk rebuilt against `docs/character-production/canon/cauco.webp`
  - shared baseline at Y=180

- LO LẮNG: `public/assets/characters/ch181/walk-lo-lang-production-x4.png`
  - alpha cleanup only; design/silhouette not changed
  - 85,924 bytes
  - SHA-256 `dc679a55d7a0e6e28e3923e3023f2129ce43b9eda499bc134b75fd8a5a249566`

- TĂNG ĐỘNG: `public/assets/characters/ch181/walk-tang-dong-production-x4.png`
  - alpha cleanup only; design/silhouette not changed
  - 277,818 bytes
  - SHA-256 `b5503376f678f6128eeb75f22ec88278a52be72a86b8ebe8fc27fc3ddcf81352`

SECRET BABY is not modified in this slice.

## New CI gate

`tests/character-animation-cleanup-ch1820.ts` now:
- validates CRC for every PNG chunk, including IDAT;
- inflates the actual RGBA pixels;
- checks all 8 frames stay separated inside their 192px cells;
- checks top/bottom occupied bounds and stable baseline;
- asserts the obsolete CAU CÓ base64 chunk source is gone.

This specifically prevents the failure mode that escaped CH-18.16.

## Runtime contracts unchanged

- 8-frame movement cadence unchanged.
- Left/right flip unchanged.
- Idle breathing unchanged.
- Active ring remains 78×18 at local Y=31 below Character art.
- Face socket/live camera contract unchanged.
- Secret Baby RANDOM-only rules unchanged.
- Cloudflare Worker remains frozen.
