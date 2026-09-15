# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the only user-accepted HOST-authoritative rollback baseline.

Validated artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress:
- HOST authority;
- replay/checksum determinism;
- remote Roll For Order;
- multiplayer Job Hub;
- Mini Game payout ownership;
- audio/BGM ownership;
- stale-token guard;
- READY/lap/final-result/podium chain.

Keep current names **TIN TỨC / LÁ BÀI**. Do not revive Tiên Tri / Phép Thuật.

## 2. Locked Draft D foundation

- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- five Mini Game spaces M09/M17/M26/M35/M44;
- M01 READY, M12 Jail Gate, M23 Lottery, M34 Hospital Gate;
- three forward-only equal-step Left/Right junctions;
- no backward traps, cycles, dead ends or hidden shortcuts.

Branch identity remains:
- **AN TOÀN 🛡️** = A1/A2/A3 Normal;
- **DRAMA 🎭** = B1 TIN TỨC / B2 LÁ BÀI / B3 TIN TỨC;
- **TIỀN 💰** = C1 +25 / C2 -20 / C3 +25 B$;
- comparison route = **PHỐ CHÍNH**.

Canonical human branch choice remains manual Left/Right through HOST authority. AUTO parity remains preview/QA only.

## 3. Current runtime chain

Current launcher activates:
`CareerMinigameBoardScene059 as ActiveBoardScene`

Inheritance remains unbroken:
`059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

Therefore 0.1.59 keeps:
- 0.1.56.1 close active-token camera + fixed four-corner HUD;
- canonical manual branch framing and explicit Overview;
- 0.1.57 Jail/Hospital/Lottery/Mini Game eligibility;
- 0.1.58 TIN TỨC/LÁ BÀI special relocation depth;
- 0.1.48 stale-token protection.

0.1.56.1, 0.1.57, 0.1.58 and 0.1.59 have no manual runtime acceptance recorded. Ron explicitly asked development to keep advancing, so do not retroactively mark them user-accepted.

## 4. Locked special-location rules inherited from 0.1.57

### Jail
- hold node 100;
- release 1 / 3 / 5;
- failure = stay held, turn ends;
- success exit path `100 -> 101 -> 102 -> 103 -> 12`;
- release D6 is discarded;
- successful player returns to `PRE_ROLL_ACTION` in the same turn and rolls a fresh movement D6.

### Hospital
- hold node 110;
- release exactly 2 / 4 / 5;
- failure = stay held, turn ends;
- success path `110 -> 111 -> 112 -> 113 -> 34`;
- recovery D6 is discarded;
- then a fresh movement D6 in the same turn.

### Lottery
- M23 rolls a separate authoritative D6;
- reward = `D6 × 20 B$`.

### Mini Game eligibility
- Jail/Hospital players excluded;
- 2+ eligible = normal Mini Game;
- 1 eligible = automatic rank #1;
- 0 eligible = skip/no payout.

Holding state remains replay/checksum critical.

## 5. 0.1.59 — Job depth

The existing 10-Job system and HOST-owned Job D6 are retained.

The Job Hub picker now exposes real strategy information before the authoritative D6:
- Lv.1 / Lv.2 / Lv.3 salary curve;
- growth profile: TĂNG ĐỀU / TĂNG MẠNH / BÙNG NỔ;
- risk profile: ỔN ĐỊNH / CÂN BẰNG / BIẾN ĐỘNG / PHI PHÁP;
- promotion chance;
- demotion chance;
- fired-on-demotion chance for legal Jobs;
- arrest chance for the criminal Job.

The A/B/C assignment contract is unchanged:
- D6 1–2 -> A;
- D6 3–4 -> B;
- D6 5–6 -> C;
- HOST generates the authoritative Job die.

### Criminal Job arrest is now real

The old placeholder `jobStatus = jailed` outcome was replaced with the canonical 0.1.57 Jail authority:
- getting caught immediately loses the illegal Job;
- player becomes unemployed;
- `specialHold = jail`;
- authoritative `nodeId = 100`;
- next turn must use the normal Jail release rule 1 / 3 / 5;
- Mini Game exclusion and checksum behavior therefore reuse the existing special-location system.

`CareerMinigameBoardScene059` only reconciles the arrest visually after authoritative state arrives. It does not mutate gameplay state or add client RNG.

## 6. 0.1.59 — five canonical Mini Game arenas

The underlying deterministic Mini Game engine remains unchanged:
- 3+ eligible players = **NHIỀU RA ÍT BỊ**;
- 2 eligible players = **OẲN TÙ XÌ**;
- existing hidden-choice/ranking flow remains;
- payout still commits once through the existing HOST-system `resolve_minigame` path.

Each canonical Mini Game space now has its own visible arena identity and reward profile:

| Space | Arena | Identity | 3+/4-player payout |
| --- | --- | --- | --- |
| M09 | PHỐ ĐÔNG NGƯỜI | CÂN BẰNG | 30 / 20 / 10 / 0 |
| M17 | KÈO ALL-IN | HẠNG 1 ĂN DÀY | 40 / 15 / 5 / 0 |
| M26 | CÒN THỞ CÒN TIỀN | CỨU VỚT | 25 / 20 / 10 / 5 |
| M35 | TOP 2 HOẶC VỀ KHÔNG | CẮT TOP | 35 / 25 / 0 / 0 |
| M44 | NƯỚC RÚT CUỐI VÒNG | CHUNG KẾT | 30 / 15 / 10 / 5 |

Direct 1v1 profiles are also arena-specific.

Economy guardrail for 0.1.59:
- every 3+/4-player profile distributes exactly **60 B$ total**;
- every direct 1v1 profile distributes exactly **40 B$ total**;
- global economy/pacing tuning remains reserved for 0.1.60.

Legacy/default reward type remains backwards-compatible at 30/20/10/0 and RPS 25/15/5/0 for older fixtures.

## 7. 0.1.59 implementation files

Core/content:
- `src/core/jobs.ts`
- `src/core/minigameRewards.ts`
- `src/core/miniGameSlots059.ts`
- existing `src/content/core/jobs_mvp.json` retained as authoritative Job data.

Runtime/presentation:
- `src/ui/JobChoicePicker.ts`
- `src/ui/MiniGameOverlay.ts`
- `src/scenes/CareerMinigameBoardScene059.ts`
- `src/main.ts`
- `src/ui/canonicalPresentation0561.ts` (architecture retained, visible build advanced to 0.1.59).

Tests/docs/CI:
- `tests/job-minigame-depth-059.ts`
- `tests/job-minigame-031.ts`
- `tests/news-card-depth-058.ts`
- `tests/bugfix-pass-048.ts`
- `tests/canonical-presentation-0561.ts`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/PLAYTEST_0.1.59_JOB_MINIGAME_DEPTH.md`

## 8. 0.1.59 automated result

The code candidate is **CI GREEN / PACKAGED**.

Code-candidate artifact before this handoff documentation update:
- `mememe-playtest-0.1.59-job-five-mini-depth`
- run `#2008` / `34921701114`
- runtime/package SHA `90d178ad96b99941214d42683612bb7b49a14e95`
- artifact ID `10378621170`
- size `8,587,029 bytes`
- SHA256 `8f76f276a584823cd3b538e4aef2eb8f406f8dcdc709b2b097290ac42ef7f3ef`
- expires 2026-09-29.

All full-suite gates passed, including:
- typecheck/build;
- deterministic replay + lockstep + HOST authority;
- two-tab sync + bot stress;
- Job D6/career foundation;
- Mini Game host-system single-commit payout ownership;
- multiplayer Job Hub + presentation parity;
- 0.1.48 stale-token/audio/dice gate;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 canonical presentation gate;
- 0.1.57 special-location authority;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- new 0.1.59 Job + five-arena depth gate;
- package validation and artifact upload.

During implementation, two historical assertions were intentionally updated rather than weakened:
- the 0.1.31 Job test previously expected the old placeholder `jobStatus = jailed`; it now checks the stronger canonical `specialHold=jail`, node 100 and Job loss contract;
- the 0.1.58 test previously required scene058 to be the launcher; it now proves scene059 inherits scene058 so the 0.1.58 behavior remains protected under later wrappers.

## 9. Status declaration

### 0.1.59 automated implementation
**CI GREEN / PACKAGED CANDIDATE**

### Manual runtime acceptance
**PENDING**

### Rollback baseline
**0.1.48 remains the only user-validated rollback baseline.**

Do not call 0.1.59 user-accepted from CI alone.

## 10. Manual checklist

Use:
`docs/PLAYTEST_0.1.59_JOB_MINIGAME_DEPTH.md`

Highest-value checks:
1. Job Hub cards show salary/risk information clearly without becoming visually cramped.
2. D6 still maps A/B/C exactly 1–2 / 3–4 / 5–6.
3. Promotion/demotion/fired outcomes still match state and READY salary.
4. Criminal Job arrest loses the Job and visibly sends the token to Jail.
5. Arrested player uses the unchanged 1/3/5 Jail release + fresh movement D6.
6. M09/M17/M26/M35/M44 show their correct arena names and payout tables.
7. Mini Game ranking shown on screen matches the authoritative B$ payout exactly once.
8. Jail/Hospital Mini Game exclusion still works.
9. Long-run token movement, especially after arrest and Mini Game, never snaps backward.
10. Recheck Roll For Order, multiplayer Job Hub, branches, TIN TỨC/LÁ BÀI relocation, Lottery, READY/lap, BGM and final podium.

## 11. Roadmap

- 0.1.54 AUTO/MANUAL preview sandbox — done
- 0.1.55 Draft D canonical topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, no manual acceptance recorded
- 0.1.57 special-location authority — CI green, manual acceptance pending
- 0.1.58 TIN TỨC / LÁ BÀI depth — CI green, manual acceptance pending
- **0.1.59 Job + five-space Mini Game depth — CI green, manual acceptance pending**
- 0.1.60 pacing/economy — next development milestone

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
