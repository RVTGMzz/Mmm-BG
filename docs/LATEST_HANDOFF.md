# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoint

0.1.48 is runtime **PASS** by Ron's explicit acceptance on 2026-09-14.

Latest validated playable artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active.

Current names:
- **TIN TỨC**
- **LÁ BÀI**

## Map source-of-truth changed to Draft B

Ron corrected the final-map interpretation: the reference has **one Hospital** and **one Jail** outside the main route, not four internal spaces for each.

Current files:
1. `HANDOFF_CURRENT.md`
2. `docs/MAP_ARCHITECTURE_FINAL.md`
3. `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
4. `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`
5. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
6. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
7. `docs/UI_FINAL_PLAYER_HUD.md`

Working Draft B:
- **44 spaces on the main loop** `M01..M44`;
- `HOSPITAL` = one singleton off-board location;
- `JAIL` = one singleton off-board location;
- lap crossing = `M44 -> M01`.

Hospital/Jail do not consume ordinary dice movement. A player is sent there by authoritative TIN TỨC, LÁ BÀI, or another approved effect.

Old Draft A assumptions are superseded:
- no `H1..H4`;
- no `J1..J4`;
- no Hospital/Jail detour chain.

Draft A through A5 may remain as historical design notes, but they are not authority where they conflict with Draft B.

## Still TBD

Do not invent:
- Hospital/Jail stay duration;
- skipped turns;
- Hospital fee/recovery;
- Jail bail;
- escape roll/card;
- release conditions.

## HUD / camera retained

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right;
- avatar + name + B$ minimum;
- active HUD emphasized;
- HUD stays fixed in screen space;
- camera close-follows active token;
- special-location effect can pan camera to Hospital/Jail;
- full map is explicit overview only.

## Next priority

1. Rebuild 44-main-space content pacing from Draft B.
2. Rebalance Mini Game positions for 44 spaces.
3. Rebuild spatial/landmark plan with singleton Hospital/Jail.
4. Continue 0.1.49 legacy-effect audit in parallel.
5. Keep TIN TỨC / LÁ BÀI.
6. Do not merge PR #1.
