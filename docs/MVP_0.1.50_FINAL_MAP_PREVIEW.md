# MeMeMe — MVP 0.1.50 Final Map Preview

Status: **RUNTIME PREVIEW CANDIDATE / CI GREEN / USER PLAYTEST PENDING**

## Purpose

Get Draft C onto a real runnable screen quickly without replacing the validated 0.1.48 authoritative gameplay runtime.

This milestone is a **separate local preview scene** for map feel, camera, HUD placement and special-location flow.

## Runtime entry

New scene:
- `src/scenes/FinalMapPreviewScene050.ts`

New board graph:
- `src/content/city/board_city_final_050.json`

Direct preview query:
- `?finalmap=1`

Windows launcher:
- `START_FINAL_MAP_PREVIEW.bat`

Normal `START_PLAYTEST.bat` still opens the existing 0.1.48 gameplay chain.

## Implemented in preview

- 44 main-loop spaces.
- M01 READY.
- M12 Jail Gate.
- M23 Lottery.
- M34 Hospital Gate.
- one inner Jail / Police Station.
- Jail exit route exactly `J1 -> J2 -> J3 -> M13`.
- one inner Hospital.
- Hospital exit route exactly `H1 -> H2 -> H3 -> M35`.
- four fixed corner HUDs.
- active-player HUD emphasis.
- camera pan/follow between active players.
- explicit Overview button.
- four player tokens.
- Money +/- preview nodes.
- TIN TỨC / LÁ BÀI / Job / Mini Game preview feedback.
- Lottery rolls a second D6 and awards `D6 × 20 B$`.
- Jail release succeeds on `1 / 3 / 5`.
- Hospital release succeeds on exactly `2 / 4 / 5`.

## Important temporary behavior

After a successful Jail/Hospital release roll, the preview animates the token through the three exit-route spaces and rejoins the main loop.

This is **presentation-only preview behavior** so Ron can see/test the three-space branch. It does **not** lock the final post-release timing rule.

Still TBD for authoritative implementation:
- use successful release die as movement or not;
- end turn immediately after release or continue;
- exact authoritative event sequence for exit-route movement.

## Safety boundary

The validated file `src/content/city/board_city_mvp.json` is unchanged.

The 0.1.48 active gameplay scene remains available and retains its existing HOST-authoritative/replay/checksum behavior.

0.1.50 preview is not yet multiplayer-authoritative and must not be treated as final gameplay implementation.

## Tests

New pure helper:
- `src/core/finalMapPreview050.ts`

New test:
- `tests/final-map-preview-050.ts`

Coverage:
- graph validates;
- exactly 44 main-loop edges;
- exactly 3 Jail exit spaces;
- exactly 3 Hospital exit spaces;
- four anchor IDs/content IDs;
- Jail release faces `1/3/5`;
- Hospital release faces `2/4/5`;
- Lottery payout `roll × 20`.

CI also keeps the full 0.1.48 regression suite active.

## Packaging

CI artifact name:
- `mememe-playtest-0.1.50-final-map-preview`

Package guide:
- `docs/PLAYTEST_0.1.50_FINAL_MAP_PREVIEW.md`

The package includes both launchers:
- `START_PLAYTEST.bat`
- `START_FINAL_MAP_PREVIEW.bat`

## Next gate

Ron playtests the preview and reports:
1. route length/feel;
2. HUD overlap;
3. camera comfort;
4. special-corner readability;
5. Jail/Hospital branch readability;
6. Lottery feel;
7. preferred final post-release timing.

Only after that should the Draft C map be integrated into the HOST-authoritative runtime.
