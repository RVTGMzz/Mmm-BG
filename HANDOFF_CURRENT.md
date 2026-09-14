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

## Final-map correction — Draft B is current

Ron corrected the earlier map interpretation on 2026-09-14.

The final map reference has **one Hospital** and **one Jail** outside the main board. They are not four-node side branches.

Current topology source:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`

Draft B working structure:
- **44 main-loop spaces** `M01..M44`;
- **1 off-board Hospital location** `HOSPITAL`;
- **1 off-board Jail location** `JAIL`;
- canonical lap crossing `M44 -> M01`.

The main board itself therefore satisfies the requirement of more than 40 spaces.

Hospital/Jail are **not ordinary dice spaces**. A player is sent directly there by an approved authoritative effect such as TIN TỨC, LÁ BÀI, or another approved player-targeting effect.

Do not use the old Draft A chains:
- `H1..H4`;
- `J1..J4`;
- Hospital/Jail detour movement.

Draft A through A5 are historical design material only where they conflict with Draft B.

## Hospital / Jail rules still undefined

Entry source is now conceptually known: effect-driven.

Still do **not** invent:
- stay duration;
- forced skipped turns;
- Hospital fees/recovery;
- Jail bail;
- escape roll;
- escape card;
- release conditions.

Those need explicit approval later.

## HUD / camera locks retained

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- avatar + name + B$ minimum;
- active player highlighted;
- HUD fixed in screen space;
- normal camera close-follows active player;
- if an effect sends a player to Hospital/Jail, camera frames that singleton location;
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

1. Rebuild Draft B content/pacing for the **44-space main loop**.
2. Re-audit Mini Game positions for 44 spaces instead of carrying the old 40-space M18/M38 split blindly.
3. Rebuild spatial layout/landmarks with one Hospital and one Jail outside the loop.
4. Continue 0.1.49 effect audit in parallel.
5. Keep TIN TỨC / LÁ BÀI names.
6. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 đã PASS runtime; latest validated artifact vẫn là mememe-playtest-0.1.48 run #1441 SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Current map source đã chuyển sang Draft B: 44 ô main M01..M44 + đúng 1 HOSPITAL + đúng 1 JAIL nằm ngoài vòng chính. Hospital/Jail không phải branch nhiều ô và không đi bằng dice; player bị TIN TỨC/LÁ BÀI/effect authoritative gửi thẳng tới. Draft A H1..H4/J1..J4 đã superseded. Deep stay/exit rules vẫn TBD. HUD 4 góc và camera close-follow giữ nguyên. Tiếp tục 0.1.49 song song. Không merge PR #1.`
