# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit**

Status: **ACTIVE / FIRST INVENTORY BUILT / NO NEW PLAYABLE ARTIFACT YET**

## Runtime checkpoint

**MVP 0.1.48 is PASS** by Ron's explicit playtest acceptance on **2026-09-14**.

Acceptance record:
`docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`

Latest validated playable artifact remains:
- Artifact: `mememe-playtest-0.1.48`
- GitHub Actions run: `#1441` / `34814789556`
- Runtime/package SHA: `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- Artifact ID: `10336247664`
- Size: `8,566,826 bytes`
- SHA256: `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 is not yet a validated playable checkpoint because it has no new packaged artifact.

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
4. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
5. `docs/MAP_ARCHITECTURE_FINAL.md`
6. `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
7. `docs/UI_FINAL_PLAYER_HUD.md`
8. `docs/GAME_DESIGN_CURRENT.md`
9. `docs/LEGACY_RULES_REFERENCE.md`
10. `docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`

## Track A — 0.1.49 Legacy Effect Audit

The first structured effect-family inventory is now built:
`docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

It is intentionally based only on retained legacy evidence. The repo does not currently contain a card-by-card transcription of the old Tiên Tri / Phép Thuật screenshots, so no missing card text/effects were invented.

Current names remain locked:
- **TIN TỨC**
- **LÁ BÀI**

First-pass direction:
- movement effects → adapt into LÁ BÀI with host-authoritative node movement;
- held cards → keep as LÁ BÀI delivery model;
- before-roll/special timing → represent as data metadata;
- timed global effects → strong TIN TỨC candidate once duration/status authority exists;
- Jail/Hospital release, skip-turn, off-turn reaction and board-status placement → defer;
- pet/shop mechanics → outside 0.1.49;
- odd/even branch routing → map track, not card/news.

Before runtime implementation, Ron should approve which KEEP/ADAPT families belong in the first concrete content pass.

## Track B — final map architecture

Draft A is now concrete and tracked in:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`

Draft A selects:
- **48 total playable nodes**;
- **40-node main loop** (`M01..M40`);
- **4-node Hospital detour** (`H1..H4`);
- **4-node Jail detour** (`J1..J4`);
- five working districts;
- one canonical READY/lap crossing edge `M40 -> M01`.

Hospital topology:
`M12 -> H1 -> H2 -> H3 -> H4 -> M13`

Jail topology:
`M28 -> J1 -> J2 -> J3 -> J4 -> M29`

The direct main edges `M12 -> M13` and `M28 -> M29` remain in the design graph until branch-entry rules are explicitly approved. Branches therefore remain topology-only and do not silently imply optional/mandatory entry, punishment, fees, bail, escape, skipped turns or recovery rules.

Draft A deliberately uses side detours between adjacent main nodes so it does not silently skip READY or Job Hub.

## Final HUD / camera direction locked

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- each occupied HUD shows at minimum avatar, player name and B$;
- active player receives clear visual emphasis;
- normal board camera zooms/follows active player;
- full-map view is an explicit overview, not the permanent gameplay view.

Canonical contract:
`docs/UI_FINAL_PLAYER_HUD.md`

Temporary visual reference:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

The reference PNG may be removed after the real HUD/camera implementation is validated and documented.

## Hospital / Jail hard constraint

Hospital and Jail are approved **location / side-branch concepts** only.

Do not invent:
- forced skipped turns;
- bail;
- escape roll;
- escape card;
- Hospital fees;
- Hospital recovery/punishment behavior;
- branch entry semantics.

## Retained gameplay invariants from 0.1.48

- Remote Roll For Order remains host-authoritative.
- Multiplayer Job Hub remains host-authoritative and spectator-safe.
- Job mapping remains `1–2 A / 3–4 B / 5–6 C`.
- Starting wallet remains `200 B$`.
- Every player completes one physical lap before final scoring.
- READY pays current Job salary once per crossing and increments lap.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị payout remains `30 / 20 / 10 / 0 B$`.
- Direct RPS payout remains `25 / 15 / 5 / 0 B$`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Final podium/result-input chain remains unchanged.
- Original face files remain local.
- CPU remains a QA bot.

## Next priority

1. Review the first 0.1.49 effect inventory and approve which KEEP/ADAPT families move toward concrete content/runtime work.
2. Review Draft A map choice of **48 total nodes** and the `40 + 4 + 4` topology.
3. If 48 is approved, proceed from architecture into spatial layout/landmark placement while preserving the data-driven node IDs.
4. Do not implement Hospital/Jail gameplay until their entry/state rules are explicitly defined.
5. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. 0.1.48 đã PASS runtime theo xác nhận của Ron ngày 2026-09-14; latest validated playable artifact vẫn là mememe-playtest-0.1.48, run #1441, runtime SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Current milestone 0.1.49 đã có first legacy effect inventory ở docs/LEGACY_EFFECT_INVENTORY_0.1.49.md, giữ tên TIN TỨC / LÁ BÀI. Song song map Draft A đã chọn 48 nodes = 40 main + 4 Hospital + 4 Jail, data ở docs/MAP_ARCHITECTURE_48_DRAFT_A.json và spec ở docs/MAP_ARCHITECTURE_FINAL.md. Hospital/Jail topology only, chưa có deep rules. Final camera close-follow, 4 HUD cố định 4 góc. Không merge PR #1.`
