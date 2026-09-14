# MVP 0.1.49 — Legacy Effect Audit

Status: **ACTIVE / DESIGN + CONTENT AUDIT / NO NEW PLAYABLE ARTIFACT YET**

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

Audit the useful effects from the legacy Tiên Tri / Phép Thuật card set and translate the good ideas into the current MeMeMe systems.

Current system names are locked:

- **TIN TỨC**
- **LÁ BÀI**

The legacy names are reference terminology only and must not replace the current names.

## Audit method

For every legacy effect/reference card:

1. Identify the core gameplay idea, not the old visual wording.
2. Classify it as suitable for `TIN TỨC`, `LÁ BÀI`, both, or reject.
3. Identify target scope: self / one player / all players / board / economy / movement / hand / status.
4. Identify authority requirements for multiplayer.
5. Identify deterministic/replay requirements.
6. Estimate impact level and suitable rarity band (`N / R / SR / SSR`) without equating rarity 1:1 with damage.
7. Rewrite the effect in current MeMeMe vocabulary.
8. Flag anything that depends on an undefined system instead of silently inventing rules.

## Hard constraints

- Keep **TIN TỨC / LÁ BÀI** names.
- Do not add old screenshots as runtime assets merely because they are being audited.
- Do not invent Jail mechanics such as skip-turn, bail, escape roll or escape card.
- Do not invent Hospital punishment/recovery mechanics yet.
- Do not alter host authority, replay determinism, RNG ownership or checksum behavior without a separate explicit implementation decision.
- Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Parallel design track

`docs/MAP_ARCHITECTURE_FINAL.md` remains active in parallel.

The final-map track must continue toward a detailed `44–48`-space architecture with:

- exact playable node count;
- numbered main loop;
- Hospital/Jail side branches;
- branch entry and rejoin topology;
- districts and landmarks;
- special-node distribution;
- close-follow camera-safe spacing;
- final adjacency graph.

This design work may proceed during 0.1.49 because it is documentation/design work. Do not silently mix it into runtime until its own implementation milestone is approved.

## HUD / camera locks retained

- Four persistent HUDs: P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at minimum avatar, player name and B$.
- Active player receives clear visual emphasis.
- Normal board camera follows/zooms to the active player.
- Full-map view is an explicit overview, not the permanent normal gameplay view.

Canonical UI contract: `docs/UI_FINAL_PLAYER_HUD.md`.

## First deliverable

Produce a structured legacy-effect inventory before implementing effects in runtime. Each candidate should record:

- legacy reference/effect summary;
- proposed current system (`TIN TỨC` or `LÁ BÀI`);
- target scope;
- current-language rewrite;
- impact/rarity recommendation;
- dependencies;
- multiplayer/replay notes;
- decision: keep / adapt / reject / defer.

Only after that audit is approved should implementation scope be frozen.
