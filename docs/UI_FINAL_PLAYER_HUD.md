# MeMeMe — Final Player HUD + Board Camera Contract

Status: **DESIGN LOCKED / REQUIRED FOR CANONICAL START_PLAYTEST PRESENTATION**

Branch: `mememe-mvp-0.1-core`

Visual reference:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Related runtime audit:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

> The PNG is a visual composition reference, not an authoritative rules or numbering source. Runtime screenshots replace it only after the real canonical HUD/camera is accepted.

## 1. Final HUD layout

The standard four-player match keeps one persistent player HUD in each screen corner:

- P1 — top-left;
- P2 — top-right;
- P3 — bottom-left;
- P4 — bottom-right.

HUD is **screen-space UI**. It never moves, pans, scales, or rotates with the board camera.

Each occupied seat shows at minimum:
- player avatar;
- player name;
- current B$ balance.

Compact secondary information may include:
- hand count;
- current Job icon/name;
- lap completion marker;
- Jail/Hospital/status badges when those states are authoritative;
- short temporary effect badges.

Do not permanently fill corner panels with long effect text. Detailed effects belong in event/card presentation or inspect/tooltip surfaces.

Unused seats are hidden rather than showing an empty player frame.

## 2. Active-turn emphasis

The active player must be identifiable at a glance.

Recommended presentation:
- brighter border/glow or halo;
- subtle scale/pulse treatment;
- compact active-turn marker;
- other player HUDs remain readable but quieter.

Presentation must not modify authoritative turn state.

CPU and remote players use the same seat/corner mapping so identity never jumps between corners.

## 3. Canonical board camera

Normal gameplay **does not keep the entire board visible**.

1. At turn change, camera transitions toward the active player's token.
2. During movement, camera follows the authoritative token smoothly.
3. During landing, framing remains close enough to read the destination tile and nearby route context.
4. At a Draft D branch junction, camera eases outward just enough to show both route choices and their first nearby spaces.
5. After route choice, camera returns to close follow.
6. When authoritative Jail/Hospital state lands in 0.1.57, camera may pan to that holding location while HUD remains fixed.
7. A full-board view is an explicit Overview action, never the default gameplay camera.

Current target is the same close party-board feeling already demonstrated in the Draft D preview work, especially `FinalMapPreviewScene052`.

## 4. Canonical Draft D topology

Current standard board direction:

- **44 main-loop spaces** `M01..M44`;
- three forward-only Left/Right decision junctions;
- five Mini Game spaces at `M09 / M17 / M26 / M35 / M44`;
- `M01 READY`;
- `M12 JAIL_GATE`;
- `M23 LOTTERY`;
- `M34 HOSPITAL_GATE`;
- one inner Jail holding location;
- one inner Hospital holding location.

Jail exit:
`JAIL -> J1 -> J2 -> J3 -> M13`

Hospital exit:
`HOSPITAL -> H1 -> H2 -> H3 -> M35`

The six exit spaces are outside the 44 main-loop count.

Canonical topology sources:
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/GAME_DESIGN_CURRENT.md`

Do not revert this document to the older Draft B singleton/no-exit concept.

## 5. Close-camera readability rules

Because players normally see only part of the board, every local camera frame should answer:
- Where is my token?
- What tile am I on / approaching?
- Where does the route continue?
- If I am at a junction, what are the two meaningful options?

Therefore:
- tile identity relies on clear icon/category language;
- avoid baking long rules text directly into board art;
- event details appear in presentation layers;
- district landmarks remain recognizable at gameplay zoom;
- board background supports the path rather than competing with it;
- branch corridors must remain visually separated;
- temporary greybox markers may stay simple, but ordinary spaces must not crowd each other.

## 6. Branch-choice framing

Canonical gameplay rule remains manual Left/Right choice for the active human, HOST-authoritative.

Presentation behavior:
- pause movement at the junction;
- ease camera outward slightly;
- show both routes and nearby context;
- show route flavor/copy without covering the paths;
- after choice, return to close follow and continue movement.

Current branch identities:
- AN TOÀN 🛡️;
- DRAMA 🎭;
- TIỀN 💰;
- comparison path = PHỐ CHÍNH.

## 7. Event/Card presentation

TIN TỨC and LÁ BÀI overlays must remain readable without turning the entire board into a hidden background.

Target:
- preserve some token/route context around the surface;
- never cover all four corner HUDs;
- keep continue/choice controls visually attached to the event surface;
- use landscape-safe dimensions;
- presentation stays separate from authoritative resolution.

## 8. Multiplayer / presentation contract

Seat mapping:

```text
P1 / seat 0 -> top-left
P2 / seat 1 -> top-right
P3 / seat 2 -> bottom-left
P4 / seat 3 -> bottom-right
```

HOST and CLIENT must show the same authoritative player identity, name, B$, hand count, Job/status data and current-turn ownership.

Camera movement and HUD animation are presentation-only. They must not affect:
- deterministic gameplay;
- RNG;
- replay;
- checksum;
- host authority;
- match state.

Snapshot/resync updates HUD and token/location state without replaying stale visual movement.

## 9. Landscape-first / safe-area contract

MeMeMe remains landscape-first.

Corner HUDs should use safe-area-aware margins and proportional/anchored layout rather than assuming one fixed display size.

On smaller screens, reduce decorative chrome before shrinking avatar/name/B$ below comfortable readability.

## 10. Current implementation status after 0.1.56 test

Design is locked, but `START_PLAYTEST.bat` does **not yet satisfy this contract**.

Ron manually confirmed the current canonical build still uses the older fixed-screen presentation shell:
- full board visible by default;
- old compact bottom HUD/top-right leaderboard;
- old 0.1.25 build copy can leak through;
- Draft D spaces become crowded in the old viewport.

This is now the immediate presentation blocker documented in:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

The next UI implementation pass should reuse the proven preview camera/HUD ideas while preserving the current authoritative runtime.

## 11. Reference lifecycle

Reference file:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Lifecycle:
1. concept reference while HUD/camera work is implemented;
2. implement real screen-space HUD and close board camera in canonical `START_PLAYTEST.bat`;
3. validate multiplayer/state parity and close-camera readability;
4. capture accepted runtime screenshots;
5. remove temporary concept PNG only when it no longer provides unique design value.

This document remains the textual source-of-truth even if the concept image is later retired.

## 12. Safety boundary

This HUD/camera work must not rewrite gameplay authority.

0.1.48 remains the user-validated rollback baseline. 0.1.55/0.1.56 gameplay additions are newer CI-green candidates. Do not merge PR #1 unless Ron explicitly asks.
