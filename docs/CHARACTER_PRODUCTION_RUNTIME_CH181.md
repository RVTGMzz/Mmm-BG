# CH-18.1 — Character Production Runtime

Build: `0.1.70.4.55`

## Locked canon

The runtime assets are derived from the five approved character sheets already reviewed in the project:

- KHÓC NHÈ — female, older glamour/drama archetype.
- CAU CÓ — male, middle-aged, sharp/grumpy archetype.
- LO LẮNG — male adult, glasses/planner archetype.
- TĂNG ĐỘNG — young female, sporty/street-energy archetype.
- SECRET BABY — infant/baby, RANDOM-only secret.

Do not reinterpret age, gender presentation, silhouette, hair, outfit, or signature props when extending the asset set.

## Runtime assets

- `portrait-atlas-starters.webp`: 512×256, 8 portrait-expression columns × 4 public starter rows.
- `portrait-atlas-secret-baby.webp`: 512×64, 8 portrait-expression columns × Secret Baby row.
- `walk-atlas.webp`: 384×240, 8 walk frames × 5 canonical character rows.

Row order is always:

0. starter-crybaby
1. starter-grumpy
2. starter-anxious
3. starter-hyper
4. secret-baby

## Integration

Character Select uses only the four-starter portrait atlas. The Secret Baby portrait asset is not referenced from SetupScene.

The active Board scene loads the walk atlas after character reveal and maps the authoritative `player.characterId` to the matching row. The sprite frame is presentation-only and cycles while the existing authoritative token container moves.

No gameplay RNG, movement rules, B$, passives, or Host authority are changed in CH-18.1.
