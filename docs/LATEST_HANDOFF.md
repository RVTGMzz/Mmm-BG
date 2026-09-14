# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Root checkpoint: `HANDOFF_CURRENT.md`

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit**

Status: **ACTIVE / DESIGN + CONTENT AUDIT / NO NEW PLAYABLE ARTIFACT YET**

## 0.1.48 runtime gate

**PASS** by Ron's explicit playtest acceptance on **2026-09-14**.

Acceptance record:
`docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`

Latest validated playable artifact remains:

- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- size `8,566,826 bytes`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 does not become the validated playable checkpoint until it gets its own package and explicit validation.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
3. `docs/MAP_ARCHITECTURE_FINAL.md`
4. `docs/UI_FINAL_PLAYER_HUD.md`
5. `docs/GAME_DESIGN_CURRENT.md`
6. `docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`
7. `docs/MVP_0.1.48_PROGRESS.md`
8. `docs/PLAYTEST_0.1.48.md`

## Active Track A — 0.1.49 Legacy Effect Audit

Audit legacy Tiên Tri / Phép Thuật effects as inspiration only.

Locked current names:

- **TIN TỨC**
- **LÁ BÀI**

For each legacy effect, classify and record:

- gameplay idea;
- destination system;
- target scope;
- current wording;
- impact/rarity recommendation;
- dependencies;
- multiplayer authority notes;
- replay/determinism notes;
- keep/adapt/reject/defer decision.

Do not silently restore old naming or old assets.

## Active Track B — Final map architecture

Canonical tracker:
`docs/MAP_ARCHITECTURE_FINAL.md`

Continue in parallel toward a detailed **44–48-space** final architecture:

- exact node count;
- numbered main loop;
- Hospital/Jail side branches;
- branch entry/rejoin topology;
- districts;
- landmark anchors;
- special-node distribution;
- close-follow camera-safe spacing;
- final adjacency graph.

Hospital/Jail are approved location concepts, but deep mechanics remain undefined.

Do not invent skip-turn, bail, escape-roll, escape-card, or Hospital punishment/recovery rules.

## Final HUD / camera locks

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at least avatar, player name and B$.
- Active player is clearly highlighted.
- Normal gameplay camera zooms/follows the active player.
- Full-map is an explicit overview, not the permanent play view.
- Canonical contract: `docs/UI_FINAL_PLAYER_HUD.md`.
- Temporary reference: `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`.

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

## New-chat priority

1. Continue `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md` into a structured inventory of old effects.
2. In parallel, continue `docs/MAP_ARCHITECTURE_FINAL.md` toward the exact 44–48-space numbered graph.
3. Keep current names `TIN TỨC / LÁ BÀI`.
4. Do not invent Jail/Hospital deep mechanics.
5. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. 0.1.48 đã PASS runtime theo xác nhận của Ron ngày 2026-09-14; acceptance record ở docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md. Latest validated playable artifact vẫn là mememe-playtest-0.1.48, run #1441, runtime SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Current milestone là 0.1.49 Legacy Effect Audit, giữ tên TIN TỨC / LÁ BÀI. Song song tiếp tục MAP_ARCHITECTURE_FINAL 44–48 ô, Hospital/Jail side branches, districts, landmarks, adjacency graph. Final camera close-follow và 4 HUD cố định ở 4 góc. Không tự invent Jail/Hospital mechanics. Không merge PR #1.`
