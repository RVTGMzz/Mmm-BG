# MVP 0.1.49 — Legacy Effect Audit

Status: **ACTIVE / FIRST INVENTORY BUILT / NO NEW PLAYABLE ARTIFACT YET**

Branch: `mememe-mvp-0.1-core`

## Entry gate

MVP 0.1.48 is runtime PASS by Ron's explicit playtest acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 does not become the validated playable checkpoint until it receives its own packaged artifact and explicit validation.

## Goal

Audit useful effect ideas from legacy Tiên Tri / Phép Thuật and translate only sound concepts into current MeMeMe systems.

Current names stay locked:
- **TIN TỨC**
- **LÁ BÀI**

Legacy names are reference terminology only.

## First deliverable — BUILT

Canonical first-pass inventory:
`docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

The retained repo does not contain a card-by-card transcription of the old screenshots, so the first pass is an effect-family audit based only on evidence preserved in `docs/LEGACY_RULES_REFERENCE.md` plus Ron's newly confirmed current rules.

## Current effect directions

### Carry forward / adapt
- authoritative movement effects → **LÁ BÀI**;
- held-card delivery model → **LÁ BÀI**;
- explicit timing metadata such as `before_roll` → **LÁ BÀI**;
- timed global board events → **TIN TỨC**, once an authoritative duration/status layer exists;
- approved effects may send a target directly to singleton `JAIL` or `HOSPITAL`.

### Current Jail / Hospital dependency is now partially defined
The locations are no longer undefined multi-space branches.

Current map authority is Draft B:
- 44 main-loop spaces;
- `M12` JAIL_GATE -> `JAIL`;
- `M34` HOSPITAL_GATE -> `HOSPITAL`;
- TIN TỨC / LÁ BÀI / approved effects may also send players there.

Approved release rolls:
- `JAIL`: D6 `1 / 3 / 5` releases; failure retries next turn.
- `HOSPITAL`: D6 exactly `2 / 4 / 5` releases; failure retries next turn.

Still undefined:
- whether the successful release roll also acts as normal movement that turn;
- alternate release cards/effects;
- bail / Hospital fees / recovery behavior unless separately approved.

Therefore ordinary Jail/Hospital relocation effects can now be designed against stable destination IDs, while release-card effects should remain deferred until alternate-release semantics are explicitly chosen.

### Defer
- off-turn reaction/passive cards;
- board-node status placement;
- alternate Jail/Hospital release cards/effects;
- any effect whose timing requires the still-TBD post-release movement rule.

### Outside 0.1.49
- pet board entities;
- magic-shop draw/trade flow;
- legacy odd/even route selection unless reintroduced in a later map milestone.

## Draft B map relationship

Canonical map tracker:
`docs/MAP_ARCHITECTURE_FINAL.md`

Canonical Draft B sources:
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`

The old Draft A `H1..H4 / J1..J4` topology is superseded and must not be used by effects.

Effects target stable singleton IDs:
- `HOSPITAL`
- `JAIL`

HOST owns target validation, relocation, release RNG and any resulting authoritative state mutation.

## Hard constraints

- Keep **TIN TỨC / LÁ BÀI** names.
- Do not add old screenshots as runtime assets merely because they are being audited.
- Do not restore H1..H4/J1..J4.
- Do not reinterpret Hospital success faces `2 / 4 / 5` as an even-number rule.
- Do not invent post-release movement, bail, fees, healing, or release-card semantics.
- Do not alter host authority, replay determinism, RNG ownership or checksum behavior without a separate implementation decision.
- Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## HUD / camera locks retained

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Occupied HUD shows at least avatar, player name and B$.
- Active player receives clear visual emphasis.
- Normal board camera follows/zooms to active player.
- Camera may frame singleton Jail/Hospital when an effect sends a player there.
- Full-map view is an explicit overview, not permanent normal gameplay.

## Next 0.1.49 decision gate

Continue from the effect inventory, now using stable Draft B special-location IDs. Before runtime implementation, freeze the first concrete KEEP/ADAPT content set and specify any effects that interact with post-release timing.
