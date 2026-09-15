# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 unless Ron explicitly asks.

## Runtime baseline

**0.1.48** remains the user-validated HOST-authoritative rollback baseline.

`START_PLAYTEST.bat` is still the canonical gameplay launcher, but Ron's 2026-09-15 manual test found that its **presentation shell is not acceptable yet**.

## Current gameplay candidate

**MVP 0.1.56 — Branch Identity**

Gameplay/CI status: **GREEN**
Presentation status: **USER-REJECTED AS CANONICAL UI / REWORK REQUIRED**

Artifact:
- `mememe-playtest-0.1.56-branch-identity`
- run #1846 / `34908302700`
- runtime/package SHA `dfa391e50666802dfc91ae2e3c585da39837bac1`
- artifact ID `10373547363`
- size `8,578,336 bytes`
- SHA256 `8f3f47d169118766edd47b5f8e8e64665ee0547db9b969b960db09a5191f8d44`

All gameplay/regression CI gates passed, including 0.1.48 bugfix inheritance, Draft D topology, five Mini Games, branch identity, replay/checksum, HOST authority, multiplayer parity, Job/Mini Game and final result.

## What 0.1.56 keeps/locks

Draft D:
- 44 main spaces `M01..M44`;
- 3 forward-only equal-step Left/Right junctions;
- 5 Mini Game spaces `M09 / M17 / M26 / M35 / M44`;
- READY = M01;
- Jail Gate = M12;
- Lottery = M23;
- Hospital Gate = M34.

Branch identities:
- **AN TOÀN 🛡️** = `A1/A2/A3 Normal`;
- **DRAMA 🎭** = `TIN TỨC / LÁ BÀI / TIN TỨC`;
- **TIỀN 💰** = `+25 / -20 / +25 B$`;
- comparison route = **PHỐ CHÍNH**;
- no hidden shortcut advantage.

Canonical human branch choice remains HOST-authoritative `RẼ TRÁI / RẼ PHẢI`.

## New blocker discovered by manual test

Ron supplied screenshots from `START_PLAYTEST.bat` and correctly noted that the standard gameplay launcher looks more temporary than the Draft D preview.

Confirmed symptoms:
- visible header/badge still leaks `MVP 0.1.25 • 200B$ ECONOMY`;
- whole board shown during ordinary turns;
- camera too far away;
- no final fixed four-corner player HUD;
- 44-space Draft D graph is squeezed into old 1280×720 composition;
- several spaces/branches visually crowd each other;
- old `MeMeMe CITY / DEMO MATCH` prototype copy remains;
- TIN TỨC/LÁ BÀI overlay hides too much of the route.

Confirmed root cause:
- `main.ts` really does activate `CareerMinigameBoardScene056`;
- 056 is only a thin wrapper extending the validated 0.1.48 chain;
- that chain still ultimately renders through the old `DemoBoardScene` fixed-screen board/UI architecture;
- `FinalMapPreviewScene052` already has the superior world-camera + fixed-UI-camera approach, but it was never migrated/extracted into authoritative `START_PLAYTEST`;
- build version copy is a brittle chain of exact-string replacements, which is why `0.1.25` can survive inside a 0.1.56 runtime.

Full audit:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

Updated HUD/camera contract:
`docs/UI_FINAL_PLAYER_HUD.md`

## Immediate next milestone

**0.1.56.1 — Canonical Presentation Consolidation**

This is now a blocker **before 0.1.57**.

Required:
- keep current authoritative gameplay untouched;
- close camera following active token;
- fixed four-corner HUD: P1 TL / P2 TR / P3 BL / P4 BR;
- branch junction framing shows both options, then returns to close follow;
- explicit Overview/full-map only;
- readable Draft D greybox without giant overlapping circles;
- TIN TỨC/LÁ BÀI surfaces stop swallowing the whole board;
- replace chained build-label mutation with one current build source;
- preserve 0.1.48+ replay/checksum/HOST/multiplayer/audio/Job/Mini Game/final-result regressions.

Ron must manually accept this presentation pass before it is called canonical.

## Locked special-location rules for later 0.1.57

Jail:
- release `1 / 3 / 5`;
- fail = stay, turn ends;
- success: `JAIL -> J1 -> J2 -> J3 -> M13`;
- release D6 is only the escape check;
- after success, roll a **fresh movement D6** in the same turn.

Hospital:
- release exactly `2 / 4 / 5`;
- fail = stay, turn ends;
- success: `HOSPITAL -> H1 -> H2 -> H3 -> M35`;
- release D6 is only the recovery check;
- after success, roll a **fresh movement D6** in the same turn.

Lottery:
- M23;
- reward = `D6 × 20 B$` = 20/40/60/80/100/120.

Mini Game eligibility once holding state is authoritative:
- Jail/Hospital player = excluded;
- 2+ eligible = normal Mini Game;
- 1 eligible = auto rank #1;
- 0 eligible = skip/no payout.

## Roadmap

- 0.1.54 sandbox AUTO/MANUAL — done
- 0.1.55 canonical Draft D gameplay — CI green
- 0.1.56 branch identity — gameplay/CI green, presentation rejected
- **0.1.56.1 canonical presentation consolidation — NEXT**
- 0.1.57 authoritative Jail/Hospital/Lottery + Mini Game eligibility
- 0.1.58 TIN TỨC / LÁ BÀI depth
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains parallel and feeds 0.1.58.

Keep **TIN TỨC / LÁ BÀI** names.
Do not revive Tiên Tri / Phép Thuật labels.
Do not merge PR #1.
