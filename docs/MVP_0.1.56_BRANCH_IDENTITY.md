# MeMeMe — MVP 0.1.56 Branch Identity

Status: **GAMEPLAY/CI IMPLEMENTED • PRESENTATION NOT USER-ACCEPTED**

0.1.56 gives the three Draft D alternate corridors a gameplay identity without adding a new rules engine. The identity is created entirely from already-authoritative tile types and money effects, so replay/checksum/host authority remain on the validated gameplay path.

The gameplay milestone passed CI, but Ron's manual `START_PLAYTEST.bat` test on 2026-09-15 exposed a separate blocker: the canonical runtime is still using the old fixed-screen prototype presentation shell. See `docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`.

Do not describe 0.1.56 as visually accepted or as the final canonical presentation.

## Locked branch identities

### Branch A — AN TOÀN 🛡️

Route:
`M04 -> A1 -> A2 -> A3 -> M08`

Content:
- A1 = Normal
- A2 = Normal
- A3 = Normal

Intent:
- lowest immediate volatility;
- no direct B$ swing;
- no TIN TỨC / LÁ BÀI landing inside the corridor;
- route distance stays equal to the main route.

### Branch B — DRAMA 🎭

Route:
`M17 -> B1 -> B2 -> B3 -> M21`

Content:
- B1 = TIN TỨC
- B2 = LÁ BÀI
- B3 = TIN TỨC

Intent:
- highest event/card density;
- encourages interaction and unpredictable board state;
- route distance stays equal to the main route.

### Branch C — TIỀN 💰

Route:
`M35 -> C1 -> C2 -> C3 -> M39`

Content:
- C1 = +25 B$
- C2 = -20 B$
- C3 = +25 B$

Intent:
- every possible stop inside the corridor directly touches the wallet;
- uses the current Draft D money scale only;
- route distance stays equal to the main route.

## Main-path comparison

The non-special option at every junction is explicitly presented as **PHỐ CHÍNH** and keeps the existing mixed pacing. The player therefore chooses between a known flavor and the mixed main route rather than choosing two visually different but mechanically equivalent corridors.

## Branch picker UX

The standard branch picker now shows:
- direction / route label;
- flavor icon and name;
- first landing tile type;
- a short route-content summary;
- a risk label.

Legacy technical copy such as `Node 200` and odd/even parity hints is removed from the player-facing branch picker.

## Architecture boundary

0.1.56 does **not** introduce:
- shortcut distance advantages;
- branch-only RNG;
- new tile-effect code;
- Jail/Hospital authoritative holding state;
- final economy tuning.

Those remain later milestones. 0.1.56 is deliberately a content-identity pass on top of the 0.1.55 canonical Draft D topology.

## Manual presentation finding after CI

The 0.1.56 artifact is useful as a functional gameplay candidate, but its current canonical launcher still inherits the old `DemoBoardScene` presentation architecture.

Observed problems:
- visible `0.1.25` header/badge leakage;
- ordinary turns show the entire board;
- no close active-token camera;
- no fixed four-corner final HUD;
- 44-space Draft D topology is cramped in the old viewport;
- event/card surfaces hide too much of the board;
- old demo/prototype copy remains visible.

Root cause and implementation plan:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

This does **not** invalidate the branch-content rules or CI results. It invalidates the claim that the current visual shell is ready.

## Roadmap

- 0.1.55 = Draft D canonical gameplay integration — CI candidate done
- 0.1.56 = branch identity — gameplay/CI done, presentation not accepted
- **0.1.56.1 = canonical presentation consolidation — immediate blocker**
- 0.1.57 = Jail/Hospital/Lottery authoritative integration
- 0.1.58 = deepen TIN TỨC / LÁ BÀI
- 0.1.59 = deepen Job / Mini Game
- 0.1.60 = pacing + economy balance

Do not merge PR #1 unless Ron explicitly asks.
