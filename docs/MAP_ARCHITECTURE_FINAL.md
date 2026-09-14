# MeMeMe — Final Map Architecture Track

Status: **ACTIVE DESIGN TRACK / DRAFT B CURRENT / DOCUMENTATION ONLY**

Current topology source:
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`

Do **not** merge PR #1 unless Ron explicitly asks.

## Current final-board direction

Draft B uses:

- **44 spaces on the main map loop**: `M01..M44`;
- **1 Hospital location** outside the ordinary loop: `HOSPITAL`;
- **1 Jail / Police Station location** outside the ordinary loop: `JAIL`.

Hospital and Jail are singleton locations, not multi-space branches.

## Four locked corner anchors

The 44-space loop is split into four 11-space quarters:

- `M01` = **READY**
- `M12` = **JAIL_GATE**
- `M23` = **LOTTERY**
- `M34` = **HOSPITAL_GATE**

`M44 -> M01` is the canonical lap/salary crossing.

Landing on `JAIL_GATE` sends the player to `JAIL`.

Landing on `HOSPITAL_GATE` sends the player to `HOSPITAL`.

TIN TỨC, LÁ BÀI, or another approved authoritative effect may also send a player directly to either special location.

## Jail release — approved

On that player's turn while in `JAIL`, roll one D6.

Release on:

`1 / 3 / 5`

Any other result means the player stays in Jail and tries again on their next turn.

The release chance per attempt is 50%.

Whether a successful release roll also provides normal movement that same turn is still **TBD**.

## Hospital release — approved

On that player's turn while in `HOSPITAL`, roll one D6.

Release on:

`2 / 4 / 5`

Any other result means the player stays in Hospital and tries again on their next turn.

The release chance per attempt is 50%.

The approved success set is exactly `2 / 4 / 5`; do not reinterpret it as an even-number rule.

Whether a successful release roll also provides normal movement that same turn is still **TBD**.

## Lottery — approved

Landing on `M23 LOTTERY` triggers a D6 roll.

Reward:

`D6 × 20 B$`

Possible payouts:

`20 / 40 / 60 / 80 / 100 / 120 B$`

Expected payout is `70 B$` before later economy balancing.

Lottery RNG and wallet mutation must be HOST-authoritative once implemented.

## Special-location authority

`JAIL` and `HOSPITAL`:

- are not ordinary dice spaces;
- do not consume normal lap distance;
- may be reached from their gate or an approved effect;
- must be represented in authoritative player state;
- must be snapshot/replay/checksum-safe once implemented;
- may receive dedicated camera framing while occupied.

## Draft A superseded

These old structures are invalid as final topology:

- `40 main + H1..H4 + J1..J4`;
- `M12 -> H1 -> H2 -> H3 -> H4 -> M13`;
- `M28 -> J1 -> J2 -> J3 -> J4 -> M29`.

Draft A/A1/A2/A3/A4/A5 remain historical design material only. Where they conflict with Draft B, **Draft B wins**.

## Camera / HUD locks retained

- P1 top-left;
- P2 top-right;
- P3 bottom-left;
- P4 bottom-right;
- avatar + name + B$ minimum;
- active player highlighted;
- HUD fixed in screen space;
- normal camera close-follows active player;
- camera may frame Hospital/Jail when a player is sent there;
- full map is explicit overview only.

## Next design work

1. Rebuild the remaining content distribution around the four locked corner anchors.
2. Re-audit Mini Game spacing for the 44-space loop.
3. Rebuild districts/landmarks around `M01..M44` plus singleton `JAIL` and `HOSPITAL`.
4. Decide later what happens immediately after a successful release roll.
5. Do not import the final map into runtime until its own implementation milestone is opened.
