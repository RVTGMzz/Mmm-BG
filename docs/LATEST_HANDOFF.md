# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep **TIN TỨC / LÁ BÀI** names.

## Current automated candidate

**MVP 0.1.59 — Job + Five-Space Mini Game Depth**

Automated status: **CI GREEN / PACKAGED**
Manual runtime status: **PENDING RON ACCEPTANCE**

Code-candidate artifact before this documentation update:
- `mememe-playtest-0.1.59-job-five-mini-depth`
- run `#2008` / `34921701114`
- runtime/package SHA `90d178ad96b99941214d42683612bb7b49a14e95`
- artifact ID `10378621170`
- size `8,587,029 bytes`
- SHA256 `8f76f276a584823cd3b538e4aef2eb8f406f8dcdc709b2b097290ac42ef7f3ef`
- expires 2026-09-29.

## Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene059 as ActiveBoardScene`

Inheritance:
`059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.59 therefore retains 0.1.58 TIN TỨC/LÁ BÀI relocation, 0.1.57 special-location authority, canonical close-camera/four-corner HUD presentation, and the 0.1.48 stale-token guard.

0.1.56.1 through 0.1.59 are CI-green candidates without recorded manual user acceptance. Do not call them user-accepted.

## Job depth

The 10-Job system remains authoritative and the assignment die remains HOST-generated:
- 1–2 = A;
- 3–4 = B;
- 5–6 = C.

The Job Hub now shows before rolling:
- Lv.1/Lv.2/Lv.3 salary;
- salary growth profile;
- stable/balanced/volatile/criminal risk profile;
- promotion and demotion percentages;
- firing risk for legal Jobs;
- arrest risk for the criminal Job.

### Criminal Job arrest

The old placeholder jail state is gone. If the criminal Job is caught:
- the Job is lost;
- player becomes unemployed;
- `specialHold = jail`;
- authoritative node becomes Jail hold node 100;
- the normal 0.1.57 release rule applies next turn: 1/3/5 succeeds, failure ends the turn, success exits the corridor and requires a fresh movement D6.

The scene only animates the resulting authoritative arrest relocation. It does not mutate gameplay or roll client RNG.

## Five Mini Game arenas

The core Mini Game tournament is unchanged:
- 3+ eligible = NHIỀU RA ÍT BỊ;
- 2 eligible = OẲN TÙ XÌ;
- Jail/Hospital eligibility stays unchanged;
- payout remains a HOST-system single commit.

Arena identities and 3+/4-player payout profiles:
- **M09 PHỐ ĐÔNG NGƯỜI / CÂN BẰNG** = 30/20/10/0;
- **M17 KÈO ALL-IN / HẠNG 1 ĂN DÀY** = 40/15/5/0;
- **M26 CÒN THỞ CÒN TIỀN / CỨU VỚT** = 25/20/10/5;
- **M35 TOP 2 HOẶC VỀ KHÔNG / CẮT TOP** = 35/25/0/0;
- **M44 NƯỚC RÚT CUỐI VÒNG / CHUNG KẾT** = 30/15/10/5.

Every 3+/4-player profile still distributes exactly **60 B$ total**. Every direct 1v1 profile distributes exactly **40 B$ total**. This deliberately avoids doing the global economy tuning reserved for 0.1.60.

## CI status

Run #2008 is fully green. It passed:
- build/typecheck;
- replay/lockstep/HOST authority;
- two-tab + bot stress;
- Job D6/career tests;
- Mini Game host-system payout ownership;
- multiplayer Job Hub and presentation parity;
- 0.1.48 stale-token/audio/dice gate;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 presentation gate;
- 0.1.57 special-location gate;
- 0.1.58 TIN TỨC/LÁ BÀI depth gate;
- new 0.1.59 Job + five-arena gate;
- package validation and artifact upload.

Historical tests were updated only where they hard-coded superseded launcher/placeholder assumptions. Their underlying authority and determinism checks remain active.

## Manual test guide

`docs/PLAYTEST_0.1.59_JOB_MINIGAME_DEPTH.md`

Priority checks:
- Job profile readability;
- A/B/C authoritative Job die;
- promotion/demotion/firing and salary behavior;
- criminal arrest visibly loses the Job and reaches Jail;
- normal 1/3/5 Jail release remains exact;
- all five Mini Game arena labels and reward tables;
- ranking/payout agreement and single HOST commit;
- held-player Mini Game exclusion;
- long-run token snap-back regression;
- multiplayer Job Hub, branches, TIN TỨC/LÁ BÀI, Lottery, READY/lap, BGM and podium.

## Roadmap

- 0.1.54 sandbox — done
- 0.1.55 canonical Draft D topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, no manual acceptance recorded
- 0.1.57 special-location authority — CI green, manual acceptance pending
- 0.1.58 TIN TỨC/LÁ BÀI depth — CI green, manual acceptance pending
- **0.1.59 Job + five-space Mini Game depth — CI green, manual acceptance pending**
- 0.1.60 pacing/economy — next

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
