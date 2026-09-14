# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated rollback baseline

MVP 0.1.48 remains the user-accepted HOST-authoritative rollback baseline. Newer 0.1.55/0.1.56 builds are CI-green candidates but have not yet been user runtime-accepted.

0.1.48 artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Do not regress HOST authority, replay/checksum, Job, Mini Game payout ownership, audio, movement, multiplayer parity or final-result invariants from 0.1.48.

## Current canonical gameplay candidate

### MVP 0.1.56 — Branch Identity

Status: **CI GREEN / USER PLAYTEST PENDING**

Ron explicitly asked to continue building while he was preparing to sleep, so 0.1.56 was completed without waiting for a 0.1.55 runtime test. Do **not** claim 0.1.56 is user-validated yet.

Read first:
- `docs/MVP_0.1.56_BRANCH_IDENTITY.md`
- `docs/PLAYTEST_0.1.56_BRANCH_IDENTITY.md`
- `docs/GAME_DESIGN_CURRENT.md`
- `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/MAP_BRANCHING_RULE_D2.md`

Runtime/content changes:
- `src/content/city/board_city_mvp.json` keeps the canonical Draft D topology and gives A/B/C corridors distinct content identities.
- `src/core/branchIdentity056.ts` defines player-facing flavor metadata.
- `src/ui/BranchPicker.ts` shows flavor, first tile, corridor summary and risk instead of technical node/parity copy.
- `src/scenes/CareerMinigameBoardScene056.ts` is a presentation/content wrapper that **extends 0.1.48** rather than replacing its validated bugfix layer.
- `src/main.ts` activates the 0.1.56 wrapper for standard `START_PLAYTEST.bat` gameplay.
- `tests/branch-identity-056.ts` protects the exact SAFE/DRAMA/MONEY content and unchanged equal-step topology.
- historical regression tests were adapted only where they encoded old labels/scene names too literally; 0.1.48 behavior remains guarded through inheritance.

### 0.1.56 CI artifact

- artifact: `mememe-playtest-0.1.56-branch-identity`
- run `#1846` / `34908302700`
- runtime/package head SHA `dfa391e50666802dfc91ae2e3c585da39837bac1`
- artifact ID `10373547363`
- size `8,578,336 bytes`
- SHA256 `8f3f47d169118766edd47b5f8e8e64665ee0547db9b969b960db09a5191f8d44`

All CI gates passed, including build/typecheck, replay, lockstep, HOST authority, two-tab sync, bot stress, presentation, board/economy, Job/Mini Game, multiplayer parity, the inherited 0.1.48 bugfix gate, all 0.1.50–0.1.55 regressions, the new 0.1.56 branch-identity gate, package validation and artifact upload.

## Canonical Draft D topology — retained

- 44 main-loop spaces `M01..M44`.
- Asymmetric city-party layout.
- Three real Left/Right decision junctions.
- Human canonical gameplay uses HOST-authoritative branch choice.
- Both choices always progress forward, use equal split-to-merge distance, and merge ahead.
- No branch cycle, backward trap or dead end.

Junctions:
- after M04: left `A1`, right `M05`, merge M08
- after M17: left `M18`, right `B1`, merge M21
- after M35: left `C1`, right `M36`, merge M39

Anchors:
- `M01 READY`
- `M12 JAIL_GATE`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE`

## 0.1.56 branch identity — LOCKED CANDIDATE

### Branch A — AN TOÀN 🛡️

`M04 -> A1 -> A2 -> A3 -> M08`

- A1 = Normal
- A2 = Normal
- A3 = Normal
- no direct B$ swing, TIN TỨC or LÁ BÀI inside the corridor
- lowest immediate volatility

### Branch B — DRAMA 🎭

`M17 -> B1 -> B2 -> B3 -> M21`

- B1 = TIN TỨC
- B2 = LÁ BÀI
- B3 = TIN TỨC
- highest event/card density and volatility

### Branch C — TIỀN 💰

`M35 -> C1 -> C2 -> C3 -> M39`

- C1 = +25 B$
- C2 = -20 B$
- C3 = +25 B$
- every possible stop in the corridor directly affects the wallet

At each junction the other option is labeled **PHỐ CHÍNH** and keeps mixed content. All split-to-merge route lengths remain equal. 0.1.56 creates identity through content exposure, not hidden shortcut distance.

Relative strength of AN TOÀN / DRAMA / TIỀN is **not final balance**. Tune that in 0.1.60 after real match playtests.

## Branch picker UX — 0.1.56

The player-facing chooser now shows:
- TRÁI / PHẢI direction;
- PHỐ CHÍNH or AN TOÀN / DRAMA / TIỀN;
- first landing tile type;
- short corridor content summary;
- risk label.

Do not restore technical `Node 200` copy or legacy odd/even parity hints in canonical player-facing UI.

## Five Mini Game spaces — LOCKED

Draft D has exactly five Mini Game spaces:
- `M09` → `MINIGAME_SLOT_01`
- `M17` → `MINIGAME_SLOT_02`
- `M26` → `MINIGAME_SLOT_03`
- `M35` → `MINIGAME_SLOT_04`
- `M44` → `MINIGAME_SLOT_05`

All five IDs currently use shared MVP Mini Game rules. IDs stay separate so 0.1.59 can deepen them independently without another board migration.

## Jail / Hospital release rule — LOCKED DESIGN

Jail:
- release D6 succeeds on `1 / 3 / 5`;
- failure = stay detained and end turn;
- successful exit route = `JAIL -> J1 -> J2 -> J3 -> M13`.

Hospital:
- release D6 succeeds on exactly `2 / 4 / 5`;
- failure = stay hospitalized and end turn;
- successful exit route = `HOSPITAL -> H1 -> H2 -> H3 -> M35`.

For both locations:
- release die is **only** the release check;
- after successful release and the three visible exit spaces, player takes a **fresh movement D6** in the same turn;
- never reuse the release roll as movement distance.

### Scope boundary

0.1.56 still contains only the approved Jail/Hospital geometry/content IDs. It does **not** pretend the HOST-authoritative holding-state machine is already implemented.
Full Jail/Hospital/Lottery authority is the next milestone, 0.1.57.

## Mini Game eligibility while held — LOCKED DESIGN

When 0.1.57 introduces authoritative holding state:
- player in JAIL = not eligible for Mini Game;
- player in HOSPITAL = not eligible for Mini Game;
- `2+` eligible = play normally;
- exactly `1` eligible = that player **auto rank #1**;
- `0` eligible = skip Mini Game, no payout.

This eligibility rule is core. 0.1.59 may deepen Mini Game content without changing it.

## Lottery — LOCKED DESIGN

- `M23 LOTTERY` rolls one D6.
- reward = `D6 × 20 B$`.
- payout table = `20 / 40 / 60 / 80 / 100 / 120 B$`.
- RNG + wallet mutation become fully HOST-authoritative in 0.1.57.

## Launcher roles

- `START_PLAYTEST.bat` = canonical standard gameplay and the file Ron should use to validate 0.1.56 when awake/available.
- `START_DRAFT_D_PREVIEW.bat` = QA sandbox; 0.1.54 AUTO/MANUAL tooling remains available.
- `START_DRAFT_D_FULL_MAP.bat` = whole-topology review only.
- legacy `START_FINAL_MAP_PREVIEW.bat` stays out of clean tester packages.

Keep labels:
- **TIN TỨC**
- **LÁ BÀI**

Canonical visual reference:
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Do not treat AI numbering/text in the reference as authoritative.

## Gameplay upgrade roadmap

- 0.1.54 = sandbox AUTO/MANUAL branch mode — **DONE / CI GREEN**
- 0.1.55 = Draft D canonical `START_PLAYTEST` integration — **CI GREEN / PREVIOUS CANDIDATE**
- 0.1.56 = AN TOÀN / DRAMA / TIỀN branch identity — **CI GREEN / USER PLAYTEST PENDING**
- 0.1.57 = authoritative Jail/Hospital/Lottery + holding-state Mini Game eligibility — **NEXT**
- 0.1.58 = deepen TIN TỨC / LÁ BÀI interaction
- 0.1.59 = deepen Job / five-space Mini Game system
- 0.1.60 = real match pacing + economy tuning

0.1.49 Legacy Effect Audit remains parallel and feeds 0.1.58.

## Next user test gate

When Ron is available, run **`START_PLAYTEST.bat`** from the 0.1.56 package and focus on:
1. Branch picker readability at 1280×720 and with four HUDs.
2. AN TOÀN communicates low volatility quickly.
3. DRAMA communicates high event/card exposure.
4. TIỀN communicates direct wallet risk/reward.
5. TRÁI / PHẢI direction remains obvious despite flavor copy.
6. All three routes merge correctly and do not feel like hidden shortcuts.
7. Existing Roll For Order / Job / Mini Game / TIN TỨC / LÁ BÀI / READY / final-result flow remains intact.

Do not use Jail/Hospital holding behavior as a 0.1.56 acceptance criterion because that authoritative state belongs to 0.1.57.

## Immediate next runtime target — 0.1.57

Implement real HOST-authoritative special-location state:
- Jail/Hospital holding state;
- release checks with the locked face sets;
- successful 3-space exit traversal + fresh movement D6;
- Lottery D6×20 host-owned RNG/wallet mutation;
- Mini Game eligibility filtered from authoritative holding state;
- 1 eligible = auto #1; 0 eligible = skip/no payout;
- preserve replay/checksum/multiplayer parity.

Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 vẫn là user-validated rollback baseline. Current canonical candidate là 0.1.56 Branch Identity, CI green nhưng user playtest pending vì Ron đi ngủ/chưa test. Artifact mememe-playtest-0.1.56-branch-identity, run #1846 / 34908302700, head SHA dfa391e50666802dfc91ae2e3c585da39837bac1, artifact ID 10373547363, SHA256 8f3f47d169118766edd47b5f8e8e64665ee0547db9b969b960db09a5191f8d44. START_PLAYTEST.bat dùng Draft D 44 main spaces, 3 forward equal-step junctions, 5 Mini Game spaces M09/M17/M26/M35/M44. Branch A AN TOÀN = A1/A2/A3 Normal; Branch B DRAMA = TIN TỨC/LÁ BÀI/TIN TỨC; Branch C TIỀN = +25/-20/+25 B$; route kia tại mỗi junction là PHỐ CHÍNH. Branch picker hiện flavor + summary + risk, không còn Node/parity debug copy. Jail release 1/3/5, Hospital exactly 2/4/5, release die only checks release, success traverses 3 exit spaces then fresh movement D6 same turn. Held Jail/Hospital players cannot join Mini Games; 1 eligible auto #1, 0 eligible skip/no payout. Authoritative implementation của các special-location rules là next milestone 0.1.57. Keep TIN TỨC / LÁ BÀI. Do not merge PR #1.`
