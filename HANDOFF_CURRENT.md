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

## 2. Draft D / branch content remains locked

- 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- five Mini Game spaces M09/M17/M26/M35/M44;
- M01 READY, M12 Jail Gate, M23 Lottery, M34 Hospital Gate;
- three forward-only equal-step Left/Right junctions;
- no backward traps, cycles, dead ends or hidden shortcuts.

Branch identity:
- **AN TOÀN 🛡️** = A1/A2/A3 Normal;
- **DRAMA 🎭** = B1 TIN TỨC / B2 LÁ BÀI / B3 TIN TỨC;
- **TIỀN 💰** = C1 +25 / C2 -20 / C3 +25 B$;
- comparison route = **PHỐ CHÍNH**.

Canonical human branch choice remains manual Left/Right through HOST authority. AUTO parity is preview/QA only.

## 3. 0.1.56.1 presentation status

0.1.56.1 consolidated the canonical presentation architecture:
- close active-token camera;
- separate fixed UI camera;
- P1 TL / P2 TR / P3 BL / P4 BR HUD;
- explicit Overview only;
- branch decision framing then return to close follow;
- smaller Draft D markers;
- integrated Job/Mini Game tile identity;
- compact manual branch picker;
- reduced TIN TỨC/LÁ BÀI cinematic footprint;
- one visible build source instead of chained legacy string replacement.

It was CI-green, but Ron did **not** manually accept the 0.1.56.1 presentation before asking to continue building. Therefore do not retroactively call 0.1.56.1 user-accepted.

## 4. 0.1.57 — Authoritative Special Locations

Ron explicitly asked to continue building while away, so 0.1.57 was implemented on top of the 0.1.56.1 presentation architecture.

Canonical launcher now activates:
`CareerMinigameBoardScene057 as ActiveBoardScene`

Inheritance stays:
`057 -> 0561 -> 056 -> 048 -> validated authority chain`

### Jail

Landing on `M12 / SPECIAL_JAIL_GATE`:
- player enters authoritative Jail holding state;
- token/state moves to hold node 100;
- next turn normal `roll` is the release check;
- success faces = **1 / 3 / 5**;
- failure = remain held, turn ends;
- success path = `JAIL -> J1 -> J2 -> J3 -> M13` (`100 -> 101 -> 102 -> 103 -> 12`);
- release D6 is discarded after success;
- `lastRoll` becomes null;
- player returns to `PRE_ROLL_ACTION` in the **same turn**;
- player must roll a fresh movement D6.

### Hospital

Landing on `M34 / SPECIAL_HOSPITAL_GATE`:
- authoritative Hospital hold node = 110;
- success faces = **2 / 4 / 5**;
- failure = remain held, turn ends;
- success path = `HOSPITAL -> H1 -> H2 -> H3 -> M35` (`110 -> 111 -> 112 -> 113 -> 34`);
- recovery D6 is discarded;
- same player returns to `PRE_ROLL_ACTION` in the same turn for a fresh movement D6.

### Lottery

`M23 / SPECIAL_LOTTERY`:
- separate authoritative deterministic D6;
- reward = `D6 × 20 B$`;
- possible payout = 20/40/60/80/100/120 B$;
- payout RNG lives in replay/HOST authority, never presentation RNG.

### Mini Game eligibility

Holding state is now authoritative and checksum-critical.

- Jail/Hospital players are excluded;
- 2+ eligible = normal Mini Game;
- 1 eligible = existing Mini Game overlay auto-ranks that player #1 and host-system payout remains authoritative;
- 0 eligible = `minigame_skipped`, no payout.

Held players cannot use Lá Bài before resolving their release/recovery roll. CPU seats also prioritize release instead of attempting cards.

## 5. 0.1.57 implementation files

Core:
- `src/core/specialLocations057.ts`
- `src/core/types.ts`
- `src/core/checksum.ts`
- `src/core/turnPhase.ts`
- `src/core/replay.ts`
- `src/core/testBot.ts`

Runtime/presentation:
- `src/scenes/CareerMinigameBoardScene057.ts`
- `src/main.ts`
- `src/ui/canonicalPresentation0561.ts` (presentation architecture retained, visible build advanced to 0.1.57)

Tests/docs/CI:
- `tests/special-locations-057.ts`
- `tests/bugfix-pass-048.ts`
- `tests/canonical-presentation-0561.ts`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/PLAYTEST_0.1.57_SPECIAL_LOCATIONS.md`

## 6. 0.1.57 CI result

0.1.57 automated candidate is **GREEN**.

Artifact from implementation HEAD before this handoff update:
- `mememe-playtest-0.1.57-special-locations`
- run `#1925` / `34915676300`
- runtime/package SHA `7bdd543bcfeaa06fb7eaec48a39e9fa3ab90e335`
- artifact ID `10376680418`
- size `8,583,854 bytes`
- SHA256 `21df727b3b8cd227cd88882f24af9a015c2c6fb9ed051b81db5d6a893ced1374`
- expires 2026-09-29

All gates passed, including:
- typecheck/build;
- replay + lockstep + HOST authority;
- two-tab sync + bot stress;
- presentation/event flow;
- board/economy/party/tactical rules;
- Roll For Order;
- Job Hub;
- Mini Game host-system payout ownership;
- multiplayer presentation parity;
- inherited 0.1.48 audio/dice/stale-token bugfix gate;
- 0.1.50–0.1.56 Draft D regressions;
- 0.1.56.1 canonical presentation architecture gate;
- new 0.1.57 special-location authority gate;
- package validation + artifact upload.

`tests/special-locations-057.ts` uses real deterministic HostAuthority/replay, not mocked outcomes. It proves successful and failed Jail/Hospital releases, same-turn fresh D6 behavior, Lottery ×20 payout, Mini Game exclusion and checksum participation.

## 7. Status declaration

### 0.1.57 automated implementation

**CI GREEN / PACKAGED CANDIDATE**

### Manual runtime acceptance

**PENDING**

Ron has not manually runtime-tested 0.1.57 yet. Do not call it user-accepted solely because CI is green.

### 0.1.48

Still the user-validated rollback baseline.

## 8. Manual checklist

Use:
`docs/PLAYTEST_0.1.57_SPECIAL_LOCATIONS.md`

Priorities:
1. Jail 1/3/5 success, other faces fail.
2. Jail success visibly exits J1/J2/J3 to M13, then requires a fresh movement D6.
3. Hospital 2/4/5 success, other faces fail.
4. Hospital success exits H1/H2/H3 to M35, then fresh D6.
5. Failed release keeps player held and ends turn.
6. Lottery shown D6 matches reward ×20.
7. Held players never enter Mini Games.
8. One eligible auto-wins; zero eligible skips payout.
9. Check token snap-back after many turns.
10. Recheck Roll For Order, Job Hub, branch choices, audio/BGM, READY/lap and final podium.

## 9. Roadmap

- 0.1.54 AUTO/MANUAL preview sandbox — done
- 0.1.55 Draft D canonical topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, manual acceptance not recorded
- **0.1.57 special-location authority — CI green, manual runtime acceptance pending**
- 0.1.58 TIN TỨC / LÁ BÀI depth — next development milestone
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains parallel input for 0.1.58.

Do not merge PR #1.
