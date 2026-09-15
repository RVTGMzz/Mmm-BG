# MeMeMe — Playtest 0.1.56 Branch Identity

Status: **TESTED ENOUGH TO FIND A PRESENTATION BLOCKER / NOT VISUALLY ACCEPTED**

## Launch

Use the standard gameplay launcher:

`START_PLAYTEST.bat`

This is the canonical Draft D gameplay flow, not the preview sandbox.

## 0.1.56 gameplay change

At the three route junctions, the alternate path has a clear gameplay identity:

1. **AN TOÀN 🛡️** — A1/A2/A3 are all Normal spaces.
2. **DRAMA 🎭** — B1/B2/B3 are TIN TỨC / LÁ BÀI / TIN TỨC.
3. **TIỀN 💰** — C1/C2/C3 are +25 / -20 / +25 B$.

The other option is shown as **PHỐ CHÍNH** with mixed content.

## Manual result on 2026-09-15

Ron opened this package through `START_PLAYTEST.bat` and found the gameplay presentation unacceptable as the canonical shell.

Visible issues included:
- old `0.1.25` header/badge;
- full-board default camera;
- camera too far away;
- missing final four-corner HUD;
- crowded/overlapping Draft D spaces in the old viewport;
- large event overlay hiding too much board context.

This does **not** mean branch identity rules failed. It means the 44-space authoritative gameplay is still being rendered through the older prototype presentation architecture.

Root-cause audit:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

## Next acceptance build

Do not spend time trying to visually accept this 0.1.56 artifact.

Immediate next milestone is:
**0.1.56.1 — Canonical Presentation Consolidation**

That build must bring the close Draft D camera, fixed four-corner HUD, explicit Overview, cleaner greybox board and correct build/version UI into `START_PLAYTEST.bat` while preserving the current authoritative gameplay.

## Still useful if debugging 0.1.56 rules

If this artifact is reopened only for functional investigation, check:
- Left/Right routes still merge correctly;
- AN TOÀN / DRAMA / TIỀN content is correct;
- five Mini Game spaces still exist;
- Roll For Order / Job / money / TIN TỨC / LÁ BÀI / READY / final result do not regress.

But the current visual shell is no longer an acceptance target.

## Not part of 0.1.56

- authoritative Jail/Hospital/Lottery state remains 0.1.57;
- held-player Mini Game eligibility becomes enforceable with that state;
- full TIN TỨC/LÁ BÀI depth comes in 0.1.58;
- Mini Game/Job depth comes in 0.1.59;
- final branch/economy balance comes in 0.1.60.

0.1.48 remains the user-validated rollback baseline.
