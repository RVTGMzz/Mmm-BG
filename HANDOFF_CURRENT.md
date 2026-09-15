# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the user-accepted HOST-authoritative rollback baseline.

Validated artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress from 0.1.48:
- HOST authority;
- replay/checksum determinism;
- remote Roll For Order;
- multiplayer Job Hub;
- Mini Game payout ownership;
- audio ownership/BGM isolation;
- stale token guard;
- READY/lap/final-result/podium chain.

Keep current content names:
- **TIN TỨC**
- **LÁ BÀI**

Do not revive Tiên Tri / Phép Thuật.

## 2. Locked Draft D gameplay content

0.1.55/0.1.56 established the current gameplay candidate:
- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- five Mini Game spaces at M09/M17/M26/M35/M44;
- three forward-only equal-step Left/Right junctions;
- all alternatives reconnect ahead;
- no backward traps, cycles, dead ends or hidden distance shortcuts.

Anchors:
- M01 READY;
- M12 Jail Gate;
- M23 Lottery;
- M34 Hospital Gate.

Branch identities remain locked:

**AN TOÀN 🛡️**
- A1/A2/A3 = Normal / Normal / Normal.

**DRAMA 🎭**
- B1 = TIN TỨC;
- B2 = LÁ BÀI;
- B3 = TIN TỨC.

**TIỀN 💰**
- C1 = +25 B$;
- C2 = -20 B$;
- C3 = +25 B$.

Comparison route = **PHỐ CHÍNH**.
Canonical human choice is manual Left/Right through the HOST-authoritative branch intent path. AUTO parity routing remains preview/QA only.

## 3. Why 0.1.56.1 existed

Ron manually tested 0.1.56 `START_PLAYTEST.bat` on 2026-09-15 and rejected its presentation as canonical.

Confirmed problems:
- active gameplay visibly leaked old `MVP 0.1.25` copy;
- nearly the whole board was shown during ordinary turns;
- no final fixed four-corner P1/P2/P3/P4 HUD;
- Draft D topology was squeezed through the old fixed-screen `DemoBoardScene` visual shell;
- giant ordinary circles and stacked Job/Mini Game markers crowded the map;
- branch/event overlays hid too much board context.

The architectural finding was that 0.1.55 correctly migrated Draft D **data/topology** into authoritative gameplay, but did not migrate the superior preview **camera/HUD presentation architecture**.

Reference docs:
- `docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`
- `docs/UI_FINAL_PLAYER_HUD.md`
- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`

## 4. 0.1.56.1 implementation now completed

New canonical presentation wrapper:
`src/scenes/CareerMinigameBoardScene0561.ts`

It extends:
`CareerMinigameBoardScene056 -> CareerMinigameBoardScene048 -> validated authority chain`

`src/main.ts` now activates:
`CareerMinigameBoardScene0561 as ActiveBoardScene`

The presentation pass deliberately does not replace the authoritative MatchState/state-machine implementation.

Implemented:
- close active-token camera during ordinary gameplay;
- smooth camera follow of the authoritative token container;
- branch-decision framing that zooms out enough to show both immediate routes;
- return to close follow after branch choice;
- explicit `TỔNG QUAN` button and keyboard `O` full-map view;
- separate UI camera so HUD/controls remain fixed in screen space;
- P1 top-left / P2 top-right / P3 bottom-left / P4 bottom-right HUD;
- active-player HUD highlight;
- avatar, player name, B$, hand count, job, lap and card-lock status;
- smaller integrated greybox node markers;
- integrated Job/Mini Game identity instead of stacked competing circles;
- visually separated main vs branch routes;
- compact manual Left/Right branch picker that keeps junction context visible;
- route flavor shown as PHỐ CHÍNH / AN TOÀN / DRAMA / TIỀN;
- TIN TỨC/LÁ BÀI cinematic roots reduced to preserve board context;
- one current visible version source in `src/ui/canonicalPresentation0561.ts`;
- visible 0.1.56.1 header/badge no longer relies on chained old-version string replacement.

Primary files:
- `src/scenes/CareerMinigameBoardScene0561.ts`
- `src/ui/canonicalPresentation0561.ts`
- `src/ui/BranchPicker.ts`
- `src/main.ts`
- `tests/canonical-presentation-0561.ts`
- `tests/bugfix-pass-048.ts`
- `.github/workflows/ci.yml`
- `docs/PLAYTEST_0.1.56.1_CANONICAL_PRESENTATION.md`

## 5. CI result

0.1.56.1 automated candidate is **GREEN**.

Artifact:
- `mememe-playtest-0.1.56.1-canonical-presentation`
- run `#1890` / `34914153706`
- runtime/package code SHA `d3356e40ac86df1837b1f3ea6769f2e6659864ba`
- artifact ID `10375767529`
- size `8,582,289 bytes`
- SHA256 `de4ad6319db327e62269262710ec96aef96a04ee368cac807a533421e157382f`
- expires 2026-09-29

All automated gates passed:
- typecheck/build;
- replay;
- lockstep;
- HOST authority;
- two-tab session/sync;
- bot stress;
- presentation/event flow;
- board/economy/party/tactical rules;
- Roll For Order;
- Job Hub;
- Mini Game payout ownership;
- multiplayer presentation parity;
- 0.1.48 audio/dice/stale-token bugfix gate;
- 0.1.50–0.1.56 Draft D regression gates;
- new 0.1.56.1 presentation contract gate;
- package validation;
- artifact upload.

CI #1889 initially stopped at `test:bugfix-pass` because that static test still required the literal old launcher string `CareerMinigameBoardScene056 as ActiveBoardScene`.

That gate was corrected, not weakened:
- the real `movementStepDisposition` duplicate/stale/animate assertions remain unchanged;
- it now verifies `0561 -> 056 -> 048` inheritance;
- 0561 is still checked for no `Math.random`;
- main runtime must activate 0561;
- run #1890 then passed the entire suite.

## 6. Current status declaration

### 0.1.56.1 automated implementation

**CI GREEN / PACKAGED CANDIDATE**

### 0.1.56.1 visual acceptance

**NOT YET USER-ACCEPTED**

Do not call this presentation canonical/accepted until Ron manually runs the packaged `START_PLAYTEST.bat` and approves the real runtime presentation.

A green CI run proves the regression contract, not visual quality.

### 0.1.48

Still the only user-validated rollback baseline for authoritative runtime behavior.

## 7. Manual acceptance checklist

Use:
`docs/PLAYTEST_0.1.56.1_CANONICAL_PRESENTATION.md`

Critical runtime checks:
1. Normal turn starts close to the active token, not full-map.
2. Token/camera does not snap backward after many turns.
3. P1/P2/P3/P4 HUDs remain fixed in four corners.
4. Branch choice shows both immediate routes and manual Left/Right flavor.
5. Camera returns close after route choice.
6. Overview is explicit only and returns cleanly to the turn.
7. Board markers/branches are locally readable at gameplay zoom.
8. TIN TỨC/LÁ BÀI remain readable without swallowing all route context.
9. Visible current build says **0.1.56.1**, with no 0.1.25 leakage.
10. Roll For Order, Job Hub, Mini Games, money, audio, READY/lap and final result feel unchanged.

## 8. Next milestone only after Ron accepts 0.1.56.1

**0.1.57 — authoritative Jail / Hospital / Lottery + Mini Game eligibility**

Locked future rules:

Jail:
- release 1 / 3 / 5;
- fail = stay, turn ends;
- success = `JAIL -> J1 -> J2 -> J3 -> M13`;
- release D6 is only escape check;
- on success, roll a fresh movement D6 in the same turn.

Hospital:
- release exactly 2 / 4 / 5;
- fail = stay, turn ends;
- success = `HOSPITAL -> H1 -> H2 -> H3 -> M35`;
- release D6 is only recovery check;
- on success, roll a fresh movement D6 in the same turn.

Lottery:
- M23;
- reward = `D6 × 20 B$` = 20/40/60/80/100/120.

Mini Game eligibility once holding state is authoritative:
- Jail/Hospital player excluded;
- 2+ eligible = normal Mini Game;
- 1 eligible = auto rank #1;
- 0 eligible = skip/no payout.

Roadmap:
- 0.1.54 preview AUTO/MANUAL sandbox — done
- 0.1.55 Draft D canonical topology — CI green
- 0.1.56 branch identity — CI green
- **0.1.56.1 canonical presentation consolidation — CI green, manual acceptance pending**
- 0.1.57 special-location authority — blocked on manual acceptance
- 0.1.58 TIN TỨC / LÁ BÀI depth
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains parallel input for 0.1.58.

Do not merge PR #1.
