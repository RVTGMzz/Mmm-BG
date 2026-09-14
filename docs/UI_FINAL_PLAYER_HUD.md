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

Do not permanently fill the corner panels with long effect text. Detailed effects belong in event/card/news presentation or an inspect/tooltip surface.

Unused seats are hidden rather than showing an empty player frame.

## 2. Active-turn emphasis

The player whose turn is currently active must be identifiable at a glance without reading text.

Recommended presentation:

- brighter border/glow or halo;
- subtle scale/pulse treatment;
- compact active-turn marker;
- other player HUDs remain fully readable but visually quieter.

The emphasis is presentation-only. It must not modify authoritative turn state.

CPU seats use the same HUD contract and may add a small CPU marker. Remote players use the same seat/corner mapping as HOST so seat identity never jumps between corners.

## 3. Board camera direction

Normal gameplay **does not keep the entire board visible**.

The final camera direction is inspired by digital party-board games:

1. At turn change, camera transitions toward the active player's token.
2. During movement, camera follows the active token smoothly.
3. During landing, framing stays close enough to read the destination tile and nearby route context.
4. When a player is sent to a special side branch, camera follows that move and frames the branch as a distinct location.
5. HUD remains fixed in the four screen corners throughout all camera movement.

A full-board view is a deliberate overview mode, not the default gameplay camera. It may be used for:

- board intro / establishing shot;
- explicit map overview command;
- route inspection where needed;
- debug / editor / QA views.

Do not make players stare at the entire board for every normal turn.

## 4. Final board topology direction

The final board must contain **more than 40 playable spaces**.

Current design band: **44–48 spaces**. The exact final count is not locked yet.

The board should read as a journey through distinct city areas rather than a perfectly uniform circle. Preferred topology:

- one readable primary loop/path network;
- **Hospital** as a distinct side branch/location;
- **Jail** as a distinct side branch/location;
- branch entrances and exits must be visually obvious at close camera scale;
- major districts/landmarks should help orientation when the whole map is not visible.

Hospital/Jail presence and topology are approved as final-board concepts, but their deep gameplay rules are still separate design work.

**Do not invent Jail skip-turn, bail, escape-roll, escape-card, or similar mechanics until those rules are explicitly defined.**

## 5. Close-camera readability rules

Because the player normally sees only part of the board, every local camera frame should answer three questions quickly:

- Where is my token?
- What tile am I on / approaching?
- Where can the route continue?

Therefore:

- tile identity should rely on strong icon/color/category language;
- avoid baking long rules text directly into board art;
- event details should appear in UI presentation layers;
- important branch nodes should read differently from ordinary spaces;
- district landmarks should remain recognizable at gameplay zoom;
- board background should support the path rather than compete with it.

## 6. Multiplayer / presentation contract

Seat-to-corner mapping is stable:

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

Snapshot/resync must update HUD from authoritative state without replaying stale visual movement.

## 7. Landscape-first / safe-area contract

MeMeMe remains landscape-first.

Corner HUDs should use safe-area-aware margins and proportional/anchored layout rather than assuming a single fixed display size. The current desktop playtest resolution can guide composition, but final HUD coordinates should not become a hard dependency on one resolution.

On smaller screens, reduce decorative chrome before shrinking avatar/name/B$ below comfortable readability.

## 8. Reference lifecycle

Reference file:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Lifecycle:

1. concept reference while HUD/camera work is designed;
2. implement real screen-space HUD and board camera;
3. validate multiplayer/state parity and close-camera readability;
4. capture a runtime screenshot if a visual reference is still useful;
5. remove the temporary concept PNG when it no longer provides unique design value.

This document remains the textual source of truth even if the concept image is later deleted.

## 9. Current milestone boundary

This document records a **final-direction UI/camera decision** only.

It does **not** change the validated MVP 0.1.48 runtime checkpoint and does not authorize merging PR #1.

Until 0.1.48 runtime feedback is closed, especially repeated-turn token snap-back verification, do not silently fold this HUD/camera concept into the validated 0.1.48 artifact.
