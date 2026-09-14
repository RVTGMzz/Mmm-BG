# MeMeMe — Final Map Architecture Track

Status: **ACTIVE DESIGN TRACK / DRAFT A SELECTED / DOCUMENTATION ONLY**

This is the canonical final-board architecture tracker. MVP 0.1.48 has already passed runtime acceptance. The current runtime/content milestone is 0.1.49 Legacy Effect Audit, while this map track continues in parallel.

Do not merge PR #1 unless Ron explicitly asks.

## Locked final-board direction

- Final board has **more than 40 playable spaces**.
- **Draft A selects 48 total playable spaces**.
- Normal gameplay uses a **close-follow camera** centered on the active player/token.
- The full map is an explicit overview, not the permanent gameplay view.
- Four player HUDs remain fixed in screen space, one in each corner.
- Hospital and Jail are distinct side-branch/location concepts.
- Hospital/Jail deep gameplay rules remain undefined and must not be inferred from topology.
- Current content/system names remain **TIN TỨC** and **LÁ BÀI**.

Canonical data draft:
`docs/MAP_ARCHITECTURE_48_DRAFT_A.json`

## Draft A count

- **48 total playable nodes**
- **40 main-loop nodes**: `M01..M40`
- **4 Hospital branch nodes**: `H1..H4`
- **4 Jail branch nodes**: `J1..J4`

The main loop remains continuous and READY-compatible. Branches are modeled as detours between adjacent main-loop nodes so they do not silently skip mandatory systems such as READY or Job Hub.

## Main-loop districts

Working district labels are architectural anchors, not final localization copy.

| District | Main nodes | Working identity | Key orientation anchor |
| --- | --- | --- | --- |
| D1 | M01–M08 | Trung tâm / READY | READY plaza / opening city landmark |
| D2 | M09–M16 | Sự nghiệp & Dịch vụ | Job Hub + Hospital side branch |
| D3 | M17–M24 | Giải trí & Xã hội | Mini Game landmark |
| D4 | M25–M32 | Drama & Dân sự | Jail side branch + Mini Game landmark |
| D5 | M33–M40 | Đêm thành phố / Hồi vòng | return-to-READY skyline/landmark |

The purpose of districts is orientation under a zoomed camera. A player should recognize their area from nearby landmark art without needing permanent full-map view.

## Numbered main-loop architecture

| Node | Type / feature | Notes |
| --- | --- | --- |
| M01 | READY | Start and lap crossing anchor |
| M02 | Normal | breathing node |
| M03 | Money + | economy positive |
| M04 | LÁ BÀI | card node |
| M05 | Normal | breathing node |
| M06 | TIN TỨC | news node |
| M07 | Money - | economy negative |
| M08 | Normal | district transition |
| M09 | LÁ BÀI | card node |
| M10 | Normal | approach to Job Hub |
| M11 | Job Hub | retain mandatory Job Hub role from validated runtime |
| M12 | Hospital branch anchor | topology anchor only; entry rule TBD |
| M13 | Hospital branch rejoin | topology rejoin only |
| M14 | TIN TỨC | news node |
| M15 | Money + | economy positive |
| M16 | LÁ BÀI | district exit |
| M17 | Normal | district entry |
| M18 | Money - | economy negative |
| M19 | TIN TỨC | news node |
| M20 | Normal | breathing node |
| M21 | Mini Game | retained special-system landmark |
| M22 | LÁ BÀI | card node |
| M23 | Money + | economy positive |
| M24 | Normal | district transition |
| M25 | TIN TỨC | news node |
| M26 | Normal | breathing node |
| M27 | LÁ BÀI | card node |
| M28 | Jail branch anchor | topology anchor only; entry rule TBD |
| M29 | Jail branch rejoin | topology rejoin only |
| M30 | Money - | economy negative |
| M31 | Mini Game | second distributed Mini Game anchor |
| M32 | Normal | district transition |
| M33 | TIN TỨC | news node |
| M34 | Money + | economy positive |
| M35 | LÁ BÀI | card node |
| M36 | Normal | breathing node |
| M37 | Money - | economy negative |
| M38 | TIN TỨC | news node |
| M39 | LÁ BÀI | late-loop card node |
| M40 | Normal | READY approach |

Main-loop edge order is `M01 -> M02 -> ... -> M40 -> M01`.

## Hospital branch topology

Topology only:

`M12 -> H1 -> H2 -> H3 -> H4 -> M13`

The ordinary main-loop edge `M12 -> M13` remains in the design graph until the actual branch-entry rule is approved.

This means the branch is a **detour between adjacent main nodes**, not a shortcut that bypasses Job Hub or a large section of the board.

Undefined on purpose:
- what sends a player into Hospital;
- whether entry is mandatory or optional;
- fees;
- turn loss;
- recovery/status effects;
- how long a player remains there.

## Jail branch topology

Topology only:

`M28 -> J1 -> J2 -> J3 -> J4 -> M29`

The ordinary main-loop edge `M28 -> M29` remains in the design graph until the actual branch-entry rule is approved.

Undefined on purpose:
- what sends a player into Jail;
- whether entry is mandatory or optional;
- bail;
- escape roll;
- escape card;
- skipped turns;
- length of stay.

## Main-loop node distribution

Draft A deliberately spreads high-attention nodes across the loop instead of clustering them.

- READY: 1
- Job Hub: 1
- Mini Game: 2
- LÁ BÀI: 7
- TIN TỨC: 6
- Money positive: 4
- Money negative: 4
- Normal/breathing/branch-anchor/rejoin nodes: 15

Total main-loop nodes: **40**.

Hospital/Jail add **8** location nodes for a total of **48 playable nodes**.

The exact payload values for money nodes are not frozen here. This document defines architecture and distribution, not economy balancing.

## READY / lap compatibility

The validated runtime invariant remains:
- each player completes one physical lap before final scoring;
- READY crossing increments lap and pays the current Job salary once.

Draft A preserves a single canonical lap edge:

`M40 -> M01`

Hospital and Jail branches rejoin before the next main node, so taking a branch does not create a second READY crossing or silently skip the main loop.

## Camera-safe layout requirements

Final art coordinates are not defined yet, but runtime implementation must respect these layout rules:

1. The active token and its next 1–2 path nodes should fit comfortably inside the close-follow gameplay frame.
2. Important landmarks should sit near the visual center/background of a district, not under the four HUD corner safe zones.
3. Hospital/Jail branches should visually peel away from the main route but remain readable under the same zoom scale.
4. Branch internals need enough spacing that multiple tokens do not visually merge into one marker.
5. District transitions should have a clear environmental change or landmark cue.
6. Full-map overview may zoom out to show the complete topology, but normal play must not depend on it being permanently visible.

Canonical HUD safe zones come from:
`docs/UI_FINAL_PLAYER_HUD.md`.

## Data-driven rule

Topology must remain independent from final art coordinates.

The JSON design artifact stores:
- stable node IDs;
- route identity;
- district identity;
- node type / feature role;
- adjacency;
- topology-only branch edges;
- explicit `TBD` branch-rule markers.

Future runtime implementation should derive visual coordinates separately rather than changing node identity when art moves.

## Draft A approval questions still open

1. Does Ron approve **48** as the final target count rather than 44–47?
2. Are 4 internal spaces per Hospital/Jail branch visually enough once close-follow camera is applied?
3. Should both Mini Game anchors remain, or should one be replaced by another special landmark later?
4. Are the five working districts the right thematic split for final art?
5. What rule actually redirects a player into Hospital/Jail?
6. Do branch internals count as ordinary movement distance, forced scripted movement, or a future location-state system? This remains explicitly undefined.

## Runtime boundary

Nothing in this Draft A JSON or architecture document changes the current playable runtime.

Do not copy the branch edges directly into `src/content/city/board_city_mvp.json` until:
- Draft A is approved;
- Hospital/Jail entry semantics are defined;
- the map receives its own runtime implementation milestone;
- host authority, replay and lap-flow regressions are added.

## Related references

- `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
- `docs/UI_FINAL_PLAYER_HUD.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`
- `docs/GAME_DESIGN_CURRENT.md`
- `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
- `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
- `HANDOFF_CURRENT.md`
- `docs/LATEST_HANDOFF.md`
