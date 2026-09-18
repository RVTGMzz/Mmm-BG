# MeMeMe — Final Map Architecture Draft D

Status: **CURRENT / CANONICAL DRAFT D TOPOLOGY + 0.1.56 BRANCH IDENTITY**

Draft D follows Ron's playtest feedback: keep the map readable, avoid a single circular rail, add meaningful route decisions, space nodes out, and keep the gameplay camera close to the active player.

## Design goals locked from playtest

- Keep the readable 44-space main-loop foundation.
- Stop presenting the board as a neat oval/circle.
- Use an **asymmetric, winding city-party route** with visible changes of direction.
- Increase center-to-center spacing between route spaces so tokens/icons breathe.
- Avoid long uninterrupted rows of tightly packed spaces.
- Add **3 real route-decision branches** so the board does not feel like a single rail.
- Keep Jail and Hospital as approved special holding/exit branches.
- Default gameplay camera must be close to the active player.
- Full-board view is explicit review/overview, not the normal turn camera.
- Keep fixed four-corner player HUDs, compact enough that board/action dominates.

## Main-loop invariants retained

- 44 authoritative main-loop IDs `M01..M44`.
- `M01` READY.
- `M12` JAIL_GATE.
- `M23` LOTTERY, payout `D6 × 20 B$`.
- `M34` HOSPITAL_GATE.
- READY remains the lap crossing.
- TIN TỨC / LÁ BÀI naming remains locked.
- Draft D contains **5 Mini Game spaces** at `M09 / M17 / M26 / M35 / M44`.

The five Mini Game positions are distributed roughly every 8–9 main-loop spaces so the system has enough presence to gain more depth later without clustering into one district.

## Special branches retained

### Jail

`M12 -> JAIL`

Release roll succeeds on:
`1 / 3 / 5`

Exit geometry remains exactly:
`JAIL -> J1 -> J2 -> J3 -> M13`

Release rule:
- release D6 is **only** an escape check;
- failure ends the turn;
- success traverses the 3 visible exit spaces;
- after a successful release the player must roll a **fresh movement D6** to continue the same turn.

### Hospital

`M34 -> HOSPITAL`

Release roll succeeds on exactly:
`2 / 4 / 5`

Exit geometry remains exactly:
`HOSPITAL -> H1 -> H2 -> H3 -> M35`

Release rule:
- release D6 is **only** a recovery check;
- failure ends the turn;
- success traverses the 3 visible exit spaces;
- after a successful release the player must roll a **fresh movement D6** to continue the same turn.

## Mini Game holding-state rule

- A player currently in Jail or Hospital is **not eligible** for a Mini Game.
- 2+ eligible players: play normally.
- Exactly 1 eligible player: auto rank #1.
- 0 eligible players: skip with no payout.
- Authoritative enforcement depends on the 0.1.57 holding-state milestone.

## Three route-decision branches

Draft D introduces three normal map route decisions in addition to Jail/Hospital.

### Branch A — AN TOÀN 🛡️
- decision after `M04`;
- right/main path reaches `M08` through `M05 -> M06 -> M07`;
- left/alternate path reaches `M08` through `A1 -> A2 -> A3`;
- `A1 / A2 / A3` are all Normal;
- purpose: lowest immediate volatility, no direct money/TIN TỨC/LÁ BÀI landing inside the corridor.

### Branch B — DRAMA 🎭
- decision after `M17`;
- left/main path reaches `M21` through `M18 -> M19 -> M20`;
- right/alternate path reaches `M21` through `B1 -> B2 -> B3`;
- `B1 = TIN TỨC`, `B2 = LÁ BÀI`, `B3 = TIN TỨC`;
- purpose: high content interaction and board-state volatility.

### Branch C — TIỀN 💰
- decision after `M35`;
- right/main path reaches `M39` through `M36 -> M37 -> M38`;
- left/alternate path reaches `M39` through `C1 -> C2 -> C3`;
- `C1 = +25 B$`, `C2 = -20 B$`, `C3 = +25 B$`;
- purpose: every possible stop in the corridor directly touches the wallet.

Each alternate route has the **same step count** as the corresponding PHỐ CHÍNH segment. 0.1.56 deliberately creates identity through content exposure, not hidden shortcut distance.

## Route-choice presentation

At a junction, the player-facing picker must show:
- TRÁI / PHẢI direction;
- **PHỐ CHÍNH** or the alternate flavor name;
- first landing tile type;
- short corridor summary;
- a risk label.

Technical node IDs and legacy odd/even parity hints are not player-facing copy in 0.1.56.

## Spatial rule

Target route spacing:
- ordinary adjacent spaces should read clearly apart;
- avoid more than 4–6 spaces reading as one long straight row;
- use bends, diagonals and district landmarks to break rhythm;
- branch corridors need visible separation from the main route so the choice is obvious when camera zooms out slightly.

Coordinates remain design/runtime coordinates, not final art pixels.

## Board silhouette

Draft D must **not** read as a circle or oval.

Preferred silhouette:
- broad lower route;
- right-side climb;
- middle route cutting back through the city;
- upper route bending across districts;
- interior descents/rejoins;
- three optional branch corridors visible as genuine alternatives.

The board forms one lap logically, but visually should feel like travelling through a city rather than orbiting a ring.

## Route-choice interaction

Canonical gameplay rule:
- active human chooses **RẼ TRÁI / RẼ PHẢI** at a junction;
- the choice is HOST-authoritative;
- both paths move forward and rejoin ahead;
- no backward trap, dead end, or branch cycle.

QA sandbox rule:
- AUTO branch is allowed by default for repetitive preview testing;
- MANUAL remains available for targeted route review;
- preview automation never changes canonical player-facing rules.

## Visual references

Canonical combined map/HUD visual reference remains:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Approved lessons:
- use clear branching and irregularity without copying extreme party-board density;
- use close, action-first framing for normal turns;
- keep MeMeMe's own bright city identity.

## Supersession

Draft D supersedes Draft C for:
- route silhouette;
- ordinary route spacing;
- normal route branching;
- default camera distance;
- HUD compactness;
- branch content identity from 0.1.56 onward.

Draft C remains historical support for the four anchor identities and early Jail/Hospital visual concept. Current gameplay rules live in `docs/GAME_DESIGN_CURRENT.md`.

## Runtime roadmap

- 0.1.54 sandbox: complete.
- 0.1.55 canonical Draft D topology in `START_PLAYTEST.bat`: complete candidate.
- **0.1.56 branch identity:** AN TOÀN / DRAMA / TIỀN.
- 0.1.57: authoritative Jail/Hospital/Lottery + holding-state Mini Game eligibility.
- 0.1.58: TIN TỨC / LÁ BÀI depth.
- 0.1.59: Job / Mini Game depth.
- 0.1.60: pacing + economy balance.

0.1.48 remains the rollback validated authoritative baseline until the newer integrated candidate is user-validated.
Do not merge PR #1 unless Ron explicitly asks.
