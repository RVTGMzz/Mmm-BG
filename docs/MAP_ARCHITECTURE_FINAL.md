# MeMeMe — Final Map Architecture Track

Status: **ACTIVE DESIGN TRACK / DOCUMENTATION ONLY**

This document keeps the final-board architecture work visible while MVP 0.1.48 remains the active runtime gate.

## Runtime gate vs design track

- **Runtime gate first:** MVP 0.1.48 must still be playtested for the repeated-turn token snap-back bug before opening a new runtime milestone.
- **Design work may continue in parallel:** the final 44–48-space map architecture can be designed and documented without changing the validated 0.1.48 runtime/package.
- Do not silently mix final-map implementation into 0.1.48.
- Do not merge PR #1 unless Ron explicitly asks.

## Locked final-board direction

- Final board has **more than 40 playable spaces**.
- Current working target is **44–48 spaces**.
- Normal gameplay uses a **close-follow camera** centered on the active player/token.
- The full map is an explicit overview, not the permanent gameplay view.
- Four player HUDs remain fixed in screen space, one in each corner.
- Hospital and Jail are approved as **distinct side-branch/location concepts**.
- Hospital/Jail deep gameplay rules are **not defined yet** and must not be invented implicitly.
- Current content/system names remain **TIN TỨC** and **LÁ BÀI**.

## Detailed architecture work to complete

The next design pass should explicitly decide and document:

1. **Exact total node count** within the 44–48 working range.
2. **Main-loop node count** versus side-branch node count.
3. **Hospital branch topology**: entrance, internal nodes, exit/rejoin point.
4. **Jail branch topology**: entrance, internal nodes, exit/rejoin point.
5. **Branch entry/rejoin graph** without defining punishment/escape mechanics yet.
6. **District segmentation** so close camera views still communicate where the player is on the board.
7. **Landmark placement** for orientation while the whole map is off-screen.
8. **Special-node distribution** across the loop so pacing does not cluster too heavily in one area.
9. **READY / lap-flow compatibility** with the existing rule that each player completes one physical lap before final scoring.
10. **Camera-safe spacing** between nodes, branches, landmarks and screen-edge HUDs.
11. **Overview/minimap needs** for player orientation.
12. **Data-driven graph representation** so topology is not tied to final art coordinates.

## Recommended design outputs

Before runtime implementation, produce:

- a numbered node map (`01..44–48`);
- a graph/adjacency table;
- district labels and landmark anchors;
- branch-entry and branch-rejoin nodes;
- a node-type distribution table;
- camera framing notes for each district/branch;
- a clean architecture diagram separate from final art.

## Explicit non-decisions

Do **not** infer any of the following until Ron defines them:

- Jail skip-turn count;
- bail price;
- escape dice condition;
- escape card;
- Hospital fees;
- Hospital turn loss;
- healing/status-removal mechanics;
- whether branch entry is mandatory or optional;
- shortcuts or route-choice rewards.

These can be designed later, but topology must not silently turn them into gameplay rules.

## Flow position

1. Keep MVP 0.1.48 as the validated runtime checkpoint.
2. Runtime-playtest repeated turns and resolve/confirm token snap-back.
3. In parallel, continue this **44–48-space Final Map Architecture Track** in documentation.
4. If 0.1.48 is runtime-clean, open the next runtime milestone normally (currently recommended: 0.1.49 Legacy Effect Audit).
5. Final-map architecture remains an explicit tracked design lane until its graph/spec is approved, then it can receive its own runtime implementation milestone.

## Related references

- `docs/UI_FINAL_PLAYER_HUD.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`
- `docs/GAME_DESIGN_CURRENT.md`
- `HANDOFF_CURRENT.md`
- `docs/LATEST_HANDOFF.md`
