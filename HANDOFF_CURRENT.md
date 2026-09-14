# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit**

Status: **ACTIVE / DESIGN + CONTENT AUDIT / NO NEW PLAYABLE ARTIFACT YET**

## Runtime gate status

**MVP 0.1.48 is PASS.**

Ron explicitly accepted the 0.1.48 runtime gate on **2026-09-14**.

Acceptance record:
`docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`

The latest validated playable artifact is still 0.1.48 until 0.1.49 gets its own package and validation.

### Latest validated playable checkpoint

- Artifact: `mememe-playtest-0.1.48`
- GitHub Actions run: `#1441` / `34814789556`
- Runtime/package SHA: `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- Artifact ID: `10336247664`
- Size: `8,566,826 bytes`
- SHA256: `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Later documentation commits may advance branch HEAD. The runtime/package SHA above remains the playable rollback/source-of-truth checkpoint until a newer artifact is explicitly validated.

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
4. `docs/MAP_ARCHITECTURE_FINAL.md`
5. `docs/UI_FINAL_PLAYER_HUD.md`
6. `docs/GAME_DESIGN_CURRENT.md`
7. `docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`
8. `docs/MVP_0.1.48_PROGRESS.md`
9. `docs/PLAYTEST_0.1.48.md`

## Active flow

Two tracks remain active in parallel.

### Track A — MVP 0.1.49 Legacy Effect Audit

Audit the old Tiên Tri / Phép Thuật reference set for reusable gameplay ideas, then adapt useful effects into the current MeMeMe systems.

Current names are locked:

- **TIN TỨC**
- **LÁ BÀI**

The old Tiên Tri / Phép Thuật names are reference terminology only.

For each legacy effect, record:

- core gameplay idea;
- destination system: `TIN TỨC`, `LÁ BÀI`, both, reject or defer;
- target scope;
- proposed current-language wording;
- impact / rarity recommendation;
- dependencies;
- multiplayer authority notes;
- deterministic/replay notes;
- decision: keep / adapt / reject / defer.

Do not implement effects that rely on undefined systems until those systems are explicitly designed.

### Track B — final 44–48-space map architecture

Canonical tracker:
`docs/MAP_ARCHITECTURE_FINAL.md`

Continue this design lane in parallel with 0.1.49.

Required final architecture work:

- choose exact playable node count in the `44–48` range;
- define numbered main loop;
- define Hospital and Jail side branches;
- define branch entry/rejoin topology;
- define districts and landmark anchors;
- distribute special nodes;
- ensure close-follow camera-safe spacing;
- produce final adjacency graph before runtime implementation.

This track must remain in handoffs until approved and promoted to its own runtime implementation milestone.

## Final UI / camera direction already locked

- Four persistent HUDs are fixed in screen space:
  - P1 top-left
  - P2 top-right
  - P3 bottom-left
  - P4 bottom-right
- Each occupied HUD shows at minimum avatar, player name and B$.
- Active player gets clear visual emphasis.
- Normal board camera zooms/follows the active player rather than showing the full board permanently.
- Full-map view is an explicit overview mode.
- Canonical UI contract: `docs/UI_FINAL_PLAYER_HUD.md`.
- Temporary visual reference: `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`.
- The concept PNG may be removed after the real HUD/camera is implemented, validated and documented.

## Hospital / Jail constraint

Hospital and Jail are approved **location / side-branch concepts** only.

Do **not** invent deep rules such as:

- forced skip-turn;
- bail;
- escape roll;
- escape card;
- Hospital recovery/punishment rules.

Those mechanics remain undefined until Ron designs or approves them.

## Retained gameplay invariants from validated runtime

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

## 0.1.48 closure note

0.1.48 fixed/covered:

- money SFX ownership/timing;
- Roll For Order D6 face presentation;
- Mini Game BGM isolation;
- token snap-back protection;
- restored current visible names `TIN TỨC / LÁ BÀI` after the legacy-reference misunderstanding.

Ron has accepted 0.1.48 as runtime PASS. Do not reopen the snap-back gate unless new reproducible feedback appears.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. 0.1.48 đã được Ron cho PASS runtime ngày 2026-09-14; acceptance record ở docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md. Latest validated playable artifact vẫn là mememe-playtest-0.1.48, run #1441, runtime SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c cho tới khi có artifact mới. Current milestone là 0.1.49 Legacy Effect Audit: phân tích bộ Tiên Tri / Phép Thuật cũ để adapt effect vào TIN TỨC / LÁ BÀI, giữ nguyên tên hiện tại và không tự invent Jail/Hospital mechanics. Song song tiếp tục docs/MAP_ARCHITECTURE_FINAL.md thành architecture final 44–48 ô với main loop, Hospital/Jail side branches, districts, landmarks và adjacency graph. Final camera close-follow, 4 HUD cố định ở 4 góc. Không merge PR #1.`
