# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 unless Ron explicitly asks.

## Runtime baseline

0.1.48 remains the validated HOST-authoritative rollback baseline until 0.1.55 is user-playtested and accepted.

`START_PLAYTEST.bat` is the canonical gameplay launcher.

## Current canonical candidate

**MVP 0.1.55 — Draft D Canonical Integration**

Status: **CI GREEN / USER PLAYTEST PENDING**

Artifact:
- `mememe-playtest-0.1.55-draft-d-canonical`
- run #1808 / `34906952458`
- runtime/package SHA `3bd6d1b91058957dedabeed450ad2a7f83aad7e7`
- artifact ID `10373250775`
- size `8,578,183 bytes`
- SHA256 `8c09e81fc85a78cef3f0718085662f0a3e0cf710575be8221c2ad11531b44d8e`

All CI gates are green.

## What 0.1.55 integrates

- `START_PLAYTEST.bat` now uses Draft D canonical board data.
- 44 main spaces `M01..M44`.
- 3 real Left/Right junctions, forward-only and equal-step to merge.
- 5 Mini Game spaces: `M09 / M17 / M26 / M35 / M44`.
- Five distinct `MINIGAME_SLOT_01..05` content IDs currently share the same MVP Mini Game rules so 0.1.59 can later deepen them independently.
- Existing HOST authority, replay/checksum, Job, Mini Game payout ownership, multiplayer parity, audio and final-result regressions all pass.

Junctions:
- M04 -> A1 or M05 -> merge M08
- M17 -> M18 or B1 -> merge M21
- M35 -> C1 or M36 -> merge M39

## Locked special rules

Anchors:
- M01 READY
- M12 Jail Gate
- M23 Lottery = D6 × 20 B$
- M34 Hospital Gate

Jail:
- release `1 / 3 / 5`
- fail = stay and turn ends
- exit `J1 -> J2 -> J3 -> M13`

Hospital:
- release exactly `2 / 4 / 5`
- fail = stay and turn ends
- exit `H1 -> H2 -> H3 -> M35`

For both:
- release D6 is only a release check;
- success traverses three exit spaces;
- then player takes a **fresh movement D6 in the same turn**.

Mini Game eligibility once holding state lands in 0.1.57:
- Jail/Hospital players are excluded;
- 2+ eligible = normal Mini Game;
- exactly 1 eligible = auto rank #1;
- 0 eligible = skip / no payout.

Important: 0.1.55 contains the topology and special-location geometry, but full HOST-authoritative Jail/Hospital/Lottery state is still scheduled for **0.1.57**.

## User test gate

Run **`START_PLAYTEST.bat`** from the 0.1.55 package and verify the standard flow on Draft D:
- Roll For Order / Job;
- Left/Right branch choice and merge;
- five Mini Game positions;
- TIN TỨC / LÁ BÀI / money;
- READY lap/salary;
- final result.

Do not use Jail/Hospital holding behavior as the 0.1.55 gate.

## Roadmap

- 0.1.54 sandbox AUTO/MANUAL — done
- 0.1.55 canonical Draft D — CI green, user test next
- 0.1.56 branch identity
- 0.1.57 authoritative Jail/Hospital/Lottery + Mini Game eligibility
- 0.1.58 TIN TỨC / LÁ BÀI depth
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

Keep **TIN TỨC / LÁ BÀI** names.
0.1.49 Legacy Effect Audit remains parallel.
Do not merge PR #1.
