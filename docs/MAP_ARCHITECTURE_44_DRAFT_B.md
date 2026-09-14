# MeMeMe — Final Map Architecture Draft B

Status: **CURRENT DESIGN SOURCE / DOCUMENTATION ONLY / NOT RUNTIME**

Draft B corrects an earlier misunderstanding in Draft A.

## Core correction

The final board uses:

- **44 spaces on the main board loop** (`M01..M44`);
- **1 Hospital location** outside the main loop;
- **1 Jail location** outside the main loop.

Hospital and Jail are **not multi-space branches**. The old `H1..H4` and `J1..J4` chains are superseded and must not be used as the final topology.

The user reference shows Hospital and Jail as single off-board locations. Players reach them because an authoritative gameplay effect sends them there, for example from **TIN TỨC**, **LÁ BÀI**, or another approved player-targeting effect.

They are not ordinary dice-routing choices and are not traversed one space at a time.

## Main board

Working target: **44 main-loop spaces**.

Why 44:
- satisfies the locked requirement that the main map has more than 40 spaces;
- keeps the board visually richer than the current MVP board;
- avoids inflating Hospital/Jail into fake movement spaces;
- remains inside the earlier 44–48 design band;
- is still short enough to remain a practical party-board playtest target.

The exact content assignment for M41..M44 and the full pacing distribution will be re-audited in the next Draft B pacing pass before runtime implementation.

Canonical lap edge:

`M44 -> M01`

READY remains the only lap-count/salary crossing anchor.

## Off-board Hospital

Stable location ID:

`HOSPITAL`

Properties:
- one location, not four spaces;
- positioned visually outside the main loop;
- reached only when an approved authoritative effect sends a player there;
- camera may pan/follow to Hospital when a player is sent there;
- does not create a second lap path;
- does not count as ordinary dice distance.

Still undefined:
- length of stay;
- whether turns are skipped;
- fees;
- release conditions;
- recovery/status behavior;
- whether a release card exists.

Do not invent these rules yet.

## Off-board Jail

Stable location ID:

`JAIL`

Properties:
- one location, not four spaces;
- positioned visually outside the main loop;
- reached only when an approved authoritative effect sends a player there;
- camera may pan/follow to Jail when a player is sent there;
- does not create a second lap path;
- does not count as ordinary dice distance.

Still undefined:
- length of stay;
- skipped turns;
- bail;
- escape roll;
- escape card;
- release conditions.

Do not invent these rules yet.

## Effect-driven entry contract

Hospital/Jail entry belongs to effect resolution, not map routing.

Future runtime direction:
1. TIN TỨC / LÁ BÀI / approved effect resolves on HOST.
2. HOST determines the target player and special destination.
3. Authoritative player location changes to `HOSPITAL` or `JAIL`.
4. Presentation animates/pans the token to that special location.
5. Replay/snapshot/checksum must reflect the authoritative special-location state.

No client-side random routing or visual-only teleport may decide this.

## Camera / HUD

Existing UI direction remains locked:
- P1 top-left;
- P2 top-right;
- P3 bottom-left;
- P4 bottom-right;
- avatar + name + B$ minimum;
- HUD fixed in screen space;
- normal board camera close-follows the active player;
- when a player is sent to Hospital/Jail, camera frames that single special location;
- full map remains an explicit overview mode.

## Draft A status

The following Draft A assumptions are **SUPERSEDED**:
- `40 main + 4 Hospital + 4 Jail`;
- Hospital path `M12 -> H1 -> H2 -> H3 -> H4 -> M13`;
- Jail path `M28 -> J1 -> J2 -> J3 -> J4 -> M29`;
- any design treating Hospital/Jail internals as ordinary movement distance.

Draft A/A1/A2/A3/A4/A5 files may remain in Git history as design history, but they are not current topology authority where they conflict with Draft B.

## Next Draft B work

1. Rebuild the 44-space main-loop content/pacing distribution.
2. Add four new main spaces `M41..M44` without overloading late-lap events.
3. Rebalance Mini Game spacing for the 44-space loop.
4. Rebuild spatial/landmark positions around two singleton off-board locations.
5. Preserve current names **TIN TỨC / LÁ BÀI**.
6. Keep deep Jail/Hospital stay/exit mechanics undefined until explicitly approved.

Do not import Draft B into runtime until a dedicated final-map implementation milestone is opened.