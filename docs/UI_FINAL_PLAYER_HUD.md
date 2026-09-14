# MeMeMe — Final Player HUD + Board Camera Contract

Status: **DESIGN LOCKED / FUTURE RUNTIME WORK**

Branch: `mememe-mvp-0.1-core`

Visual reference:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

> The PNG is a temporary visual reference, not a runtime asset contract. Once the real HUD is implemented, validated, and documented with runtime screenshots, the concept PNG may be removed from the active branch.

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
- Card hand count;
- current Job icon/name when useful;
- small temporary status/effect badges.

Do not permanently fill corner panels with long effect text. Detailed effects belong in card/news/event presentation or an inspect/tooltip surface.

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

## 3. Board camera direction

Normal gameplay **does not keep the entire board visible**.

1. At turn change, camera transitions toward the active player's token.
2. During movement, camera follows the active token smoothly.
3. During landing, framing stays close enough to read the destination tile and nearby route context.
4. If an authoritative effect sends a player to **HOSPITAL** or **JAIL**, camera transitions to that singleton off-board location and frames the affected token there.
5. HUD remains fixed in the four screen corners throughout camera movement.

A full-board view is a deliberate overview mode, not the default gameplay camera.

## 4. Final board topology direction

Current Draft B direction:

- **44 spaces on the main board loop** `M01..M44`;
- **one HOSPITAL location** outside the loop;
- **one JAIL location** outside the loop.

Hospital/Jail are not ordinary dice spaces and are not multi-node side branches.

A player reaches them only when an approved authoritative effect sends them there, for example through **TIN TỨC**, **LÁ BÀI**, or another approved player-targeting effect.

Canonical topology:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`

Deep Hospital/Jail stay/exit rules remain separate design work.

Do not invent skip-turn, fees, bail, escape-roll, escape-card, recovery, or release mechanics until explicitly approved.

## 5. Close-camera readability rules

Because players normally see only part of the board, every local camera frame should answer:
- Where is my token?
- What tile am I on / approaching?
- Where does the main route continue?

Therefore:
- tile identity should rely on strong icon/category language;
- avoid baking long rules text directly into board art;
- event details appear in UI presentation layers;
- district landmarks remain recognizable at gameplay zoom;
- board background supports the path rather than competing with it.

When camera is on HOSPITAL or JAIL, that location should read as one distinct place rather than several numbered spaces.

## 6. Multiplayer / presentation contract

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

If a player is sent to HOSPITAL/JAIL, HOST owns the authoritative special-location state. Camera movement is only presentation of that state.

Snapshot/resync updates HUD and token/location state without replaying stale visual movement.

## 7. Landscape-first / safe-area contract

MeMeMe remains landscape-first.

Corner HUDs should use safe-area-aware margins and proportional/anchored layout rather than assuming one fixed display size.

On smaller screens, reduce decorative chrome before shrinking avatar/name/B$ below comfortable readability.

## 8. Reference lifecycle

Reference file:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Lifecycle:
1. concept reference while HUD/camera work is designed;
2. implement real screen-space HUD and board camera;
3. validate multiplayer/state parity and close-camera readability;
4. capture runtime screenshots if useful;
5. remove temporary concept PNG when it no longer provides unique design value.

This document remains textual source-of-truth even if the concept image is later deleted.

## 9. Current milestone boundary

This document records final-direction UI/camera decisions only.

It does not change the validated MVP 0.1.48 runtime checkpoint and does not authorize merging PR #1.

The 44-space Draft B map and singleton HOSPITAL/JAIL are still design-only until their own runtime implementation milestone is explicitly opened.
