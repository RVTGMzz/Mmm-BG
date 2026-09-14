# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 unless Ron explicitly asks.

## Runtime baseline

0.1.48 remains the user-validated HOST-authoritative rollback baseline.

`START_PLAYTEST.bat` is the canonical gameplay launcher.

## Current canonical candidate

**MVP 0.1.56 — Branch Identity**

Status: **CI GREEN / USER PLAYTEST PENDING**

Ron asked to continue 0.1.56 while preparing to sleep, so the milestone was built and CI-validated without waiting for manual runtime feedback. Do not call it user-accepted yet.

Artifact:
- `mememe-playtest-0.1.56-branch-identity`
- run #1846 / `34908302700`
- runtime/package SHA `dfa391e50666802dfc91ae2e3c585da39837bac1`
- artifact ID `10373547363`
- size `8,578,336 bytes`
- SHA256 `8f3f47d169118766edd47b5f8e8e64665ee0547db9b969b960db09a5191f8d44`

All CI gates are green, including the 0.1.48 inherited bugfix gate and the new 0.1.56 branch-identity regression.

## What 0.1.56 adds

Draft D topology from 0.1.55 is retained:
- 44 main spaces `M01..M44`;
- 3 forward-only equal-step Left/Right junctions;
- 5 Mini Game spaces `M09 / M17 / M26 / M35 / M44`;
- existing HOST authority/replay/checksum/Job/Mini Game/audio/final-result chain remains guarded.

Branch identities are now explicit:
- **AN TOÀN 🛡️**: `A1 / A2 / A3 = Normal / Normal / Normal`;
- **DRAMA 🎭**: `B1 / B2 / B3 = TIN TỨC / LÁ BÀI / TIN TỨC`;
- **TIỀN 💰**: `C1 / C2 / C3 = +25 / -20 / +25 B$`;
- the comparison route is **PHỐ CHÍNH** with mixed content.

The branch picker now shows:
- TRÁI / PHẢI direction;
- route flavor;
- first landing tile;
- corridor summary;
- risk label.

Technical Node IDs and legacy odd/even parity hints are no longer player-facing branch-choice copy.

Important: equal split-to-merge movement distance is unchanged. Relative strength of the three route flavors is provisional until 0.1.60 economy/pacing tests.

## Locked special rules

Anchors:
- M01 READY
- M12 Jail Gate
- M23 Lottery = D6 × 20 B$
- M34 Hospital Gate

Jail:
- release `1 / 3 / 5`;
- fail = stay and turn ends;
- success traverses `J1 -> J2 -> J3 -> M13`;
- then take a **fresh movement D6 in the same turn**.

Hospital:
- release exactly `2 / 4 / 5`;
- fail = stay and turn ends;
- success traverses `H1 -> H2 -> H3 -> M35`;
- then take a **fresh movement D6 in the same turn**.

The release die is only a release check and is never reused as movement distance.

Mini Game eligibility once 0.1.57 adds real holding state:
- Jail/Hospital players are excluded;
- 2+ eligible = normal Mini Game;
- exactly 1 eligible = auto rank #1;
- 0 eligible = skip / no payout.

Important: 0.1.56 still does **not** claim authoritative Jail/Hospital/Lottery state. That is the next milestone.

## User test gate

When Ron is available, run **`START_PLAYTEST.bat`** from the 0.1.56 package and mainly judge:
- branch picker readability;
- whether AN TOÀN / DRAMA / TIỀN communicate their purpose immediately;
- whether TRÁI / PHẢI remains obvious;
- branch merge behavior;
- no regressions in standard Roll For Order / Job / Mini Game / TIN TỨC / LÁ BÀI / READY / final-result flow.

Do not require Jail/Hospital holding behavior for 0.1.56 acceptance.

## Roadmap

- 0.1.54 sandbox AUTO/MANUAL — done
- 0.1.55 canonical Draft D — CI green previous candidate
- 0.1.56 branch identity — **CI green, user test pending**
- 0.1.57 authoritative Jail/Hospital/Lottery + Mini Game eligibility — **next**
- 0.1.58 TIN TỨC / LÁ BÀI depth
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

Keep **TIN TỨC / LÁ BÀI** names.
0.1.49 Legacy Effect Audit remains parallel.
Do not merge PR #1.
