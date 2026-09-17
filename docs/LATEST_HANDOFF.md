# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current candidate

**MVP 0.1.70 — Career Traits / Đặc tính nghề nghiệp**

Manual status: **PENDING RON ACCEPTANCE**.

Canonical flow:
`Splash logo → Lobby → Setup → Chọn độ dài → Roll For Order → Trận → Podium → Rematch`

Current board runtime remains:
`CareerMinigameBoardScene069 as ActiveBoardScene`

0.1.70 Career Traits live in authoritative core rules beneath the existing canonical presentation wrapper. Do not create a second scene/runtime path merely for the version number.

The last explicitly user-accepted HOST-authoritative rollback baseline remains **0.1.48**. Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, stale-token protection, movement-actor camera lock, Jail/Hospital release flow or final-result/podium/rematch flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 0.1.70 Career Traits

Source:
`src/core/careerTraits070.ts`

Canonical release rules:
- baseline Jail: `1 / 3 / 5`;
- baseline Hospital: `2 / 4 / 6`;
- 👮 Cảnh sát at Jail: `1 / 3 / 4 / 5`;
- 🩺 Bác sĩ at Hospital: `2 / 4 / 5 / 6`;
- 🦹 Trộm cắp at Jail: only `1 / 5`;
- 🤸 Cascader at Hospital: only `2 / 6`.

The Job pool is now **12 Jobs** and every canonical Job has a Career Trait identity. Release overrides are resolved by HOST/replay authority, never UI RNG.

`specialHoldSourceJobId` preserves the source Job for a special hold. This is required for `JOB_THIEF`, whose illegal Job is cleared on arrest while its restrictive Jail release trait must remain active for that hold.

Regression guard:
`tests/career-traits-070.ts`

## Deterministic 0.1.70 sentinel baseline

32-match batch: seeds `611100..611131`.

Locked outliers:
- seed `611102`, longest match: `92` turns, checksum `56c6487d`, spread `177`;
- seed `611112`, largest money spread: `399`, `76` turns, checksum `a5aa724b`.

The sentinel gate now passes with exact 0.1.70 fingerprints. Historical 0.1.63.4 fingerprints remain historical.

## Permanent UI / UX contract

Canonical rules:
`docs/CANONICAL_UI_UX_RULES.md`

0.1.70 inherits the 0.1.69 splash/first-impression layer and the 0.1.68.2 HUD/detail/safe-bubble contract.

Keep mobile-first readability, summary-first/detail-on-demand, compact idle HUD, expanded active HUD, strict modal ownership, viewport-safe bubbles, touch/keyboard/controller parity and soft rounded surfaces by default.

Official logo remains:
`public/assets/mememe-logo.webp`

Historical 0.1.68 and 0.1.68.2 tests are now version-forward guards so future canonical builds do not fail merely because the visible version advanced past 0.1.69.

## Green checkpoints

Functional/gameplay checkpoint:
`9ded1e70eb6cda0f8902dabcf0be526ccd72f670`

It passed the full suite through the **0.1.70 Career Traits** gate, face transform, package validation and playtest-guide packaging.

Last code/workflow commit before handoff-only docs:
`174c918318369d36b9fe9c6689d80bdbaf7f86c4`

Exact-head validation for `174c918...`:
- push CI `#2830` / `35190952684`: **SUCCESS**;
- PR CI `#2831` / `35190956263`: **SUCCESS**;
- Steam Deck Web Playtest `#218` / `35190953379`: **SUCCESS**;
- publisher `#174` / `35190953319`: **SUCCESS**.

## Artifact quota note

GitHub Actions artifact storage quota is currently exhausted. Artifact upload is therefore best-effort and must not make a valid build/game fail.

Do **not** promise a fresh 0.1.70 Actions artifact ID or hash until a real artifact is verified after quota becomes available.

The Steam Deck workflow is now quota-tolerant and only runs Pages deploy when the Pages artifact actually exists.

## Public web checkpoint

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Current compiled public commit:
`7d3b33f40cad4519a329422336f6972ab492788a`

It publishes the compiled game from functional source `9ded1e70...`. The later `174c918...` commit changed workflow YAML only, so no new compiled public commit was required.

URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Publisher exact-SHA CI gating, current-branch-HEAD gating and concurrency protection remain mandatory.

## Manual acceptance priorities

Playtest guide:
`docs/PLAYTEST_0.1.70_CAREER_TRAITS.md`

Validate baseline Jail/Hospital release faces, Police face `4`, Doctor face `5`, Thief hold-source persistence with only `1/5`, Cascader Hospital only `2/6`, successful-release fresh movement D6, failed-release normal turn advance, and HOST/CPU/human parity.

Also keep watching the historical long-run token snap-back issue and confirm the inherited mobile/Steam Deck UI remains usable.

CI PASS means **candidate**, not human Runtime PASS. Do **not** call 0.1.70 user-accepted until Ron manually validates the shipped runtime, especially Doctor, Thief and one baseline hold flow.

Full details: `HANDOFF_CURRENT.md`.

Do not merge PR #1.
