# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoint

MVP 0.1.48 is **PASS** by Ron's explicit runtime acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

No newer runtime artifact is validated yet.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel with final-map design.

Current system names stay locked:
- **TIN TỨC**
- **LÁ BÀI**

Legacy inventory:
`docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

## Final map — Draft B current

Current topology source:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`

Working structure:
- **44 main-loop spaces** `M01..M44`;
- exactly one `HOSPITAL` singleton;
- exactly one `JAIL` singleton;
- canonical lap crossing `M44 -> M01`.

### Four locked corners
- `M01` = READY
- `M12` = JAIL_GATE
- `M23` = LOTTERY
- `M34` = HOSPITAL_GATE

Landing on JAIL_GATE sends the player to `JAIL`.

Landing on HOSPITAL_GATE sends the player to `HOSPITAL`.

TIN TỨC / LÁ BÀI / another approved HOST-authoritative effect may also send a player directly to either special location.

### Jail release — approved
- Start turn in `JAIL` -> roll D6.
- `1 / 3 / 5` = released.
- Any other value = remain in Jail and retry next turn.
- Whether a successful release roll also gives normal movement that same turn is still TBD.

### Hospital release — approved
- Start turn in `HOSPITAL` -> roll D6.
- `2 / 4 / 5` = released.
- Any other value = remain in Hospital and retry next turn.
- Approved set is exactly `2 / 4 / 5`; do not convert it to an even-number rule.
- Whether a successful release roll also gives normal movement that same turn is still TBD.

### Lottery — approved
- Land on `M23 LOTTERY` -> HOST rolls one D6.
- Reward = `D6 × 20 B$`.
- Payouts: `20 / 40 / 60 / 80 / 100 / 120 B$`.
- Current expected payout = `70 B$` before later economy balancing.

Draft A's `H1..H4` / `J1..J4` chains are superseded and must never be restored as current topology.

## HUD / camera locks retained

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- avatar + name + B$ minimum;
- active player highlighted;
- HUD fixed in screen space;
- normal camera close-follows active player;
- camera may frame Jail/Hospital singleton locations;
- full map is explicit overview only.

Canonical UI contract:
`docs/UI_FINAL_PLAYER_HUD.md`

## Retained gameplay invariants from 0.1.48

- Remote Roll For Order host-authoritative.
- Multiplayer Job Hub host-authoritative and spectator-safe.
- Job mapping `1–2 A / 3–4 B / 5–6 C`.
- Starting wallet `200 B$`.
- Each player completes one physical lap before final scoring.
- READY pays current Job salary once per crossing and increments lap.
- Mini Game payout host-system-owned and one-shot.
- Nhiều ra ít bị payout `30 / 20 / 10 / 0 B$`.
- Direct RPS payout `25 / 15 / 5 / 0 B$`.
- Four approved BGM and eight supplied SFX remain checksum-protected.
- Final podium/result-input chain unchanged.
- CPU remains a QA bot.

## Next priority

1. Rebuild the remaining 44-space content/pacing around the four locked corner anchors.
2. Rebalance Mini Game / TIN TỨC / LÁ BÀI / money / Job Hub positions.
3. Rebuild spatial layout/landmarks around singleton Jail/Hospital.
4. Continue 0.1.49 effect audit in parallel.
5. Decide later what a player does immediately after a successful Jail/Hospital release roll.
6. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 đã PASS runtime; latest validated artifact vẫn là mememe-playtest-0.1.48 run #1441 SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Current map source là Draft B: 44 main spaces. Four corners locked: M01 READY, M12 JAIL_GATE -> JAIL, M23 LOTTERY = D6 x20 B$, M34 HOSPITAL_GATE -> HOSPITAL. JAIL release faces 1/3/5; HOSPITAL release faces exactly 2/4/5; failed release waits until next turn. Whether successful release also moves normally that turn is TBD. TIN TỨC/LÁ BÀI/approved effects can also send players directly to JAIL/HOSPITAL. Old H1..H4/J1..J4 is superseded. HUD 4 corners + close-follow camera retained. Do not merge PR #1.`
