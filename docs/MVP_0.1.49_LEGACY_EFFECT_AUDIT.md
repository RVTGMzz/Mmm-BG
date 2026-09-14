# MVP 0.1.49 — Legacy Effect Audit

Status: **ACTIVE / FIRST INVENTORY BUILT / NO NEW PLAYABLE ARTIFACT YET**

Branch: `mememe-mvp-0.1-core`

## Entry gate

MVP 0.1.48 is considered **runtime PASS by Ron's explicit playtest acceptance on 2026-09-14**.

The latest validated playable artifact remains:

- Artifact: `mememe-playtest-0.1.48`
- Run: `#1441` / `34814789556`
- Runtime/package SHA: `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- SHA256: `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 does not become the validated playable checkpoint until it receives its own packaged artifact and explicit validation.

## Goal

Audit useful effect ideas from the legacy Tiên Tri / Phép Thuật systems and translate only the sound concepts into the current MeMeMe systems.

Current names are locked:
- **TIN TỨC**
- **LÁ BÀI**

Legacy names are reference terminology only.

## First deliverable — BUILT

Canonical first-pass inventory:
`docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

The retained repo does not contain a card-by-card transcription of the old screenshots, so the first pass is deliberately an **effect-family audit** based only on evidence preserved in `docs/LEGACY_RULES_REFERENCE.md`.

Current audit families include:
- player relocation;
- held-until-use cards;
- timed global news/status effects;
- before-roll timing metadata;
- future reaction/passive timing;
- board-node status placement;
- Jail/Hospital release references;
- legacy pet/shop mechanics classified outside this milestone;
- legacy odd/even branch routing moved to the map-design track.

No missing old card text was invented.

## First-pass decisions

### Carry forward / adapt
- authoritative movement effects → **LÁ BÀI**;
- held-card delivery model → **LÁ BÀI**;
- explicit timing metadata such as `before_roll` → **LÁ BÀI**;
- timed global board events → **TIN TỨC**, once an authoritative duration/status layer exists.

### Defer
- Jail-release effects;
- Hospital-release effects;
- skip-turn effects;
- off-turn reaction/passive cards;
- board-node status placement.

These remain blocked until their dependent systems are explicitly designed.

### Outside 0.1.49
- pet board entities;
- magic-shop draw/trade flow;
- odd/even route selection.

They are retained as historical design references for later system/map milestones.

## Audit method for future concrete cards

For every real legacy card/reference effect later supplied:

1. Identify the core gameplay idea, not old wording/art.
2. Classify it as suitable for `TIN TỨC`, `LÁ BÀI`, both, outside scope, or defer.
3. Identify target scope.
4. Identify host-authority requirements.
5. Identify deterministic/replay requirements.
6. Estimate impact level and possible rarity band (`N / R / SR / SSR`) without equating rarity 1:1 with damage.
7. Rewrite in current MeMeMe vocabulary.
8. Flag undefined dependencies instead of inventing rules.

## Hard constraints

- Keep **TIN TỨC / LÁ BÀI** names.
- Do not add old screenshots as runtime assets merely because they are being audited.
- Do not invent Jail mechanics such as skipped turns, bail, escape roll or escape card.
- Do not invent Hospital punishment/recovery mechanics.
- Do not alter host authority, replay determinism, RNG ownership or checksum behavior without a separate explicit implementation decision.
- Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Parallel map track — Draft A built

Canonical tracker:
`docs/MAP_ARCHITECTURE_FINAL.md`

Canonical data draft:
`docs/MAP_ARCHITECTURE_48_DRAFT_A.json`

Draft A currently selects:
- **48 total playable nodes**;
- **40-node main loop**;
- **4-node Hospital detour**;
- **4-node Jail detour**;
- five working districts;
- close-follow camera-safe architecture;
- READY-compatible canonical lap edge.

Hospital/Jail branch topology is documented, but entry rules and deep mechanics remain `TBD`.

This map work remains documentation/design only and must not be silently copied into runtime until its own implementation milestone is approved.

## HUD / camera locks retained

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Occupied HUD shows at least avatar, player name and B$.
- Active player receives clear visual emphasis.
- Normal board camera follows/zooms to active player.
- Full-map view is an explicit overview, not permanent normal gameplay.

Canonical UI contract:
`docs/UI_FINAL_PLAYER_HUD.md`.

## Next 0.1.49 decision gate

Before any runtime implementation, Ron should review the inventory direction and decide which **ADAPT/KEEP** families are actually wanted for the first concrete MeMeMe content pass.

If concrete old card screenshots/text are supplied later, extend the inventory with one row/entry per real card instead of guessing missing effects.
