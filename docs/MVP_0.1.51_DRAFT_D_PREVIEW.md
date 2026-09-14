# MeMeMe — MVP 0.1.51 Draft D Preview

Status: **RUNTIME PREVIEW CANDIDATE / CI IN PROGRESS / USER PLAYTEST PENDING**

## Why this milestone exists

0.1.50 proved the 44-space final-map concept can run, but Ron's playtest found four presentation problems:
- route felt too linear;
- silhouette felt too round/oval;
- spaces were too tightly packed;
- normal camera was too far away.

0.1.51 addresses those issues without replacing the validated HOST-authoritative 0.1.48 gameplay runtime.

## New Draft D runtime files

- `src/content/city/board_city_final_051.json`
- `src/core/finalMapPreview051.ts`
- `src/scenes/FinalMapPreviewScene051.ts`
- `tests/final-map-preview-051.ts`
- `public/START_DRAFT_D_PREVIEW.bat`

Direct query:
`?finalmap=2`

## Draft D changes

- 44 main spaces remain.
- Board coordinates rebuilt into an asymmetric winding-city silhouette.
- Main-space spacing increased.
- Ordinary spaces use rectangular markers instead of every tile being circular.
- Alternate branch nodes use diamond markers.
- Three normal route choices added:
  - after M04: main M05/M06/M07 vs A1/A2/A3, rejoin M08;
  - after M17: main M18/M19/M20 vs B1/B2/B3, rejoin M21;
  - after M35: main M36/M37/M38 vs C1/C2/C3, rejoin M39.
- Each alternative route uses the same number of movement steps as its main counterpart for this preview.
- Branch choice is manual local preview UI.

## Camera / HUD changes

- normal follow zoom target: `1.38`;
- route-choice framing zoom target: `1.10`;
- overview zoom target: `0.55`;
- HUD cards reduced substantially from 0.1.50;
- four fixed corner HUD positions retained;
- neutral face image is used in HUD when Setup has one loaded;
- active HUD remains emphasized.

## Retained special rules

- M01 READY.
- M12 Jail Gate.
- M23 Lottery: D6 × 20 B$.
- M34 Hospital Gate.
- Jail release: 1/3/5.
- Hospital release: exactly 2/4/5.
- Jail exit geometry: J1/J2/J3 → M13.
- Hospital exit geometry: H1/H2/H3 → M35.

## Preview-only boundaries

- 0.1.51 route choice is not yet HOST-authoritative.
- No final shortcut/risk/reward meaning is assigned to alternate branches yet.
- Jail/Hospital post-release timing is still presentation-only preview behavior.
- Blockout environment is not final map art.
- `src/content/city/board_city_mvp.json` remains untouched.

## Playtest gate

Ron should compare 0.1.51 against 0.1.50 and judge:
1. less-linear feeling;
2. spacing;
3. branch readability;
4. close camera comfort;
5. HUD readability/obstruction;
6. overview usefulness;
7. tile-shape direction.

Only after this feedback should Draft D become the base for authoritative map integration.