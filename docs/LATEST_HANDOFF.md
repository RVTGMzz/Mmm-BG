# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Root checkpoint: `HANDOFF_CURRENT.md`

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit**

Status: **ACTIVE / FIRST INVENTORY BUILT / NO NEW PLAYABLE ARTIFACT YET**

## Runtime checkpoint

MVP 0.1.48 is **PASS** by Ron's explicit runtime acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- size `8,566,826 bytes`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 is not yet a validated playable checkpoint.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
3. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
4. `docs/MAP_ARCHITECTURE_FINAL.md`
5. `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
6. `docs/UI_FINAL_PLAYER_HUD.md`
7. `docs/GAME_DESIGN_CURRENT.md`
8. `docs/LEGACY_RULES_REFERENCE.md`
9. `docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`

## Track A — 0.1.49 Legacy Effect Audit

First-pass effect-family inventory is built in:
`docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

The inventory only uses legacy concepts actually retained in the repo. No missing old card text was invented.

Current names remain locked:
- **TIN TỨC**
- **LÁ BÀI**

Current first-pass direction:
- authoritative movement effects → adapt to LÁ BÀI;
- held cards → keep as LÁ BÀI delivery model;
- before-roll/special timing → data-driven timing metadata;
- timed global effects → TIN TỨC candidate once timed-status authority exists;
- Jail/Hospital release, skip-turn, off-turn reaction and board-node status placement → defer;
- pet/shop mechanics → outside this milestone;
- odd/even route selection → map track.

## Track B — final map architecture

Draft A is now concrete.

Canonical spec:
`docs/MAP_ARCHITECTURE_FINAL.md`

Canonical data draft:
`docs/MAP_ARCHITECTURE_48_DRAFT_A.json`

Draft A selects:
- **48 total playable nodes**;
- **40-node main loop**;
- **4 Hospital nodes**;
- **4 Jail nodes**;
- five working districts;
- canonical lap crossing `M40 -> M01`.

Hospital topology:
`M12 -> H1 -> H2 -> H3 -> H4 -> M13`

Jail topology:
`M28 -> J1 -> J2 -> J3 -> J4 -> M29`

The normal main edges remain until entry semantics are designed, so branch paths are topology-only. Do not infer optional/mandatory entry or any punishment/escape/recovery rules.

## Final HUD / camera locks

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at least avatar, player name and B$.
- Active player is clearly highlighted.
- Normal gameplay camera zooms/follows active player.
- Full-map is an explicit overview, not permanent play view.
- Canonical UI contract: `docs/UI_FINAL_PLAYER_HUD.md`.

## Retained gameplay invariants

- Remote Roll For Order host-authoritative.
- Multiplayer Job Hub host-authoritative and spectator-safe.
- Job D6 mapping `1–2 A / 3–4 B / 5–6 C`.
- Starting wallet `200 B$`.
- One physical lap before final scoring.
- READY pays current Job salary once per crossing and increments lap.
- Mini Game payout host-system owned and one-shot.
- Nhiều ra ít bị payout `30 / 20 / 10 / 0 B$`.
- Direct RPS payout `25 / 15 / 5 / 0 B$`.
- Four approved BGM and eight supplied SFX remain checksum-protected.
- Final podium/result-input chain unchanged.
- Original face files remain local.
- CPU remains a QA bot.

## Next priority

1. Ron reviews/approves the KEEP/ADAPT families in the 0.1.49 inventory.
2. Ron reviews/approves Draft A target of **48 nodes = 40 + 4 + 4**.
3. If approved, continue map work into spatial layout and landmark framing without changing stable node IDs.
4. Keep Hospital/Jail deep rules undefined until explicitly designed.
5. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. 0.1.48 đã PASS runtime; latest validated playable artifact vẫn là mememe-playtest-0.1.48, run #1441, runtime SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Current milestone 0.1.49 đã có first effect inventory ở docs/LEGACY_EFFECT_INVENTORY_0.1.49.md. Map Draft A đã chọn 48 playable nodes = 40 main + 4 Hospital + 4 Jail; spec ở docs/MAP_ARCHITECTURE_FINAL.md và data draft ở docs/MAP_ARCHITECTURE_48_DRAFT_A.json. Giữ TIN TỨC / LÁ BÀI, Hospital/Jail topology-only, camera close-follow, 4 HUD cố định 4 góc. Không merge PR #1.`
