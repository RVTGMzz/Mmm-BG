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

## Map source-of-truth — Draft B

Current files:
1. `HANDOFF_CURRENT.md`
2. `docs/MAP_ARCHITECTURE_FINAL.md`
3. `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
4. `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`
5. `docs/GAME_DESIGN_CURRENT.md`
6. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
7. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
8. `docs/UI_FINAL_PLAYER_HUD.md`

Working Draft B:
- **44 spaces on the main loop** `M01..M44`;
- `HOSPITAL` = one singleton special location;
- `JAIL` = one singleton special location;
- lap crossing = `M44 -> M01`.

### Four locked corner anchors
- `M01` READY
- `M12` JAIL_GATE -> `JAIL`
- `M23` LOTTERY -> D6 × 20 B$
- `M34` HOSPITAL_GATE -> `HOSPITAL`

Lottery payouts: `20 / 40 / 60 / 80 / 100 / 120 B$`.

### Approved release rules
JAIL:
- roll D6 on the detained player's turn;
- `1 / 3 / 5` releases;
- failure stays in Jail and retries next turn.

HOSPITAL:
- roll D6 on the hospitalized player's turn;
- exactly `2 / 4 / 5` releases;
- failure stays in Hospital and retries next turn.

Still TBD: whether a successful release roll also supplies normal movement on the same turn.

TIN TỨC, LÁ BÀI, or another approved HOST-authoritative effect may also send a player directly to Jail/Hospital.

Old Draft A assumptions are superseded:
- no `H1..H4`;
- no `J1..J4`;
- no Hospital/Jail movement chain.

## HUD / camera retained

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right;
- avatar + name + B$ minimum;
- active HUD emphasized;
- HUD stays fixed in screen space;
- camera close-follows active token;
- special-location camera may frame singleton Jail/Hospital;
- full map is explicit overview only.

## Next priority

1. Rebuild 44-space content pacing around four locked corner anchors.
2. Rebalance Mini Game / TIN TỨC / LÁ BÀI / money / Job Hub.
3. Rebuild spatial/landmark plan with singleton Hospital/Jail.
4. Continue 0.1.49 legacy-effect audit in parallel.
5. Decide post-release same-turn movement later.
6. Do not merge PR #1.
