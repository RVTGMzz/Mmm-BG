# CH-18.12 — Character production source audit

Build target: `0.1.70.4.66 — CH-18.12 PRODUCTION SOURCE LOCK`

## Result

Runtime production cut-over remains intentionally limited to **KHÓC NHÈ**.

The approved high-resolution concept sheets were re-audited from the Character art authority:
- KHÓC NHÈ — female 55–65.
- CAU CÓ — male 40–50.
- LO LẮNG — male 28–35.
- TĂNG ĐỘNG — female 18–24.
- SECRET BABY — infant, RANDOM-only.

Only KHÓC NHÈ currently has a genuine high-resolution 8-frame walk strip admitted to runtime:
`public/assets/characters/ch181/walk-khoc-nhe-production-x4.png` — 1536×192, 192×192 per frame.

No equivalent production walk export was found for CAU CÓ, LO LẮNG, TĂNG ĐỘNG or SECRET BABY during the Drive audit. Those four therefore stay on the CH-18.10 fallback atlas. Their fallback rows are **not** production assets and must never be promoted by scaling/remastering the legacy 48px source.

## New source gate

`src/content/core/character_walk_production_sources_ch1812.ts` is the production admission list.

Rules:
1. A Character may be marked `runtime-production-strip` only when a genuine high-resolution 8-frame strip exists.
2. Target runtime source is 192×192 per frame, 8 frames.
3. Pending Characters carry no `productionAssetPath`.
4. Canon age, gender, silhouette and accessories come from the approved concept sheet. Do not redesign them to make animation easier.
5. Face/socket production remains independent. KHÓC NHÈ neutral is still the only layered face-socket proof; do not invent sockets for the remaining cast.
6. Active ring stays 78×18 at local Y=31 and below the Character.
7. Cloudflare Worker remains frozen.

## Next production task

Author/recover the next genuine high-resolution strip from approved source art, starting with CAU CÓ. Validate the full 8-frame silhouette and foot anchor before changing runtime routing.
