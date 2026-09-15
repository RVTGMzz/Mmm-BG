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
`CareerMinigameBoardScene060 as ActiveBoardScene`

Inheritance remains unbroken:
`060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.60 therefore retains:
- 0.1.56.1 close active-token camera + fixed four-corner HUD;
- canonical manual branch framing and explicit Overview;
- 0.1.57 Jail/Hospital/Lottery authority;
- 0.1.58 TIN TỨC/LÁ BÀI relocation depth;
- 0.1.59 Job depth + five Mini Game arena identities;
- 0.1.48 stale-token protection.

0.1.56.1 through 0.1.60 have no manual runtime acceptance recorded. Do not retroactively call any of them user-accepted.

## 4. Locked special-location rules inherited from 0.1.57

### Jail
- hold node 100;
- release 1 / 3 / 5;
- failure = stay held, turn ends;
- success exit path `100 -> 101 -> 102 -> 103 -> 12`;
- release D6 is discarded;
- successful player then rolls a fresh movement D6 in the same turn.

### Hospital
- hold node 110;
- release exactly 2 / 4 / 5;
- failure = stay held, turn ends;
- success path `110 -> 111 -> 112 -> 113 -> 34`;
- recovery D6 is discarded;
- then a fresh movement D6 in the same turn.

### Lottery
- M23 rolls a separate authoritative D6;
- reward remains `D6 × 20 B$`.

Holding state remains replay/checksum critical.

## 5. 0.1.60 — one-lap finish lock

0.1.60 turns M01 READY into a real finish line for the current one-lap playtest.

When a player crosses M01 and reaches the target `lapsCompleted = 1`:
- the authoritative movement stops immediately on READY;
- any unused pips on that movement D6 are discarded;
- Job salary for crossing READY is paid first, exactly once;
- `ready_pass` records `finishLocked = true`;
- the player is retired from later turns while unfinished players remain;
- presentation shows `VỀ ĐÍCH / B$ ĐÃ KHÓA`.

This removes the old pacing/economy exploit where an early finisher could continue around a second lap while waiting for the last player.

`advanceMatchTurn` now skips finished players. If everyone is already finished, it falls back to a stable next seat only so final state serialization remains well-defined while the shell transitions to results.

## 6. 0.1.60 — final B$ score lock

A player who has completed the target lap keeps a frozen final score while the remaining racers finish.

Finished players are excluded from:
- Card target pools;
- random/richest target selection;
- all-opponent Card effects;
- swap-money Cards;
- Jail/Hospital relocation Cards;
- global News money effects;
- special News relocation;
- normalize-to-average calculations;
- Mini Game eligibility.

The authoritative effect layer rejects a finished Card target even if UI validation is bypassed.

Held players are still excluded from Mini Games exactly as before. 0.1.60 therefore layers finish retirement over the existing 0.1.57 eligibility rule.

## 7. 0.1.60 — economy tuning

The goal is lower variance and less table-wide inflation without rewriting the established board economy.

### Explicitly unchanged
- starting money = **200 B$**;
- main board money spaces = four `-20` and four `+25`;
- TIỀN branch = `+25 / -20 / +25`;
- all Job salary curves;
- Lottery = D6 × 20;
- Card rarity weights = N600 / R300 / SR90 / SSR10;
- News category weights remain total 1000 and unchanged by category;
- no new RNG stream.

### Card tune
- `Kèo Hai Cửa` safe choice: **+20 B$**;
- `Thuế Top 1`: **15%**;
- SR all-opponent loss Cards: **20%**;
- `Phao Cứu Sinh`: **+50 B$** if poorest among active racers, otherwise **+15 B$**;
- 10 B$ steal Cards unchanged;
- SSR swap remains rare and unchanged in rarity weight.

### News tune
- positive self News: **+25 B$**;
- negative self News: **-30 B$**;
- common group gain/loss: **+10 / -10 B$**;
- rare group loss: **-15 B$**.

Weights are unchanged. The direct weighted money expectation remains approximately **+4.3 B$/draw**, close to the previous scale, while single-event swings are smaller.

## 8. 0.1.60 — Mini Game payout tuning

The 0.1.59 arena identities and HOST-system single-commit ranking flow remain unchanged.

Canonical 3+/4-player payouts are now:

| Space | Arena | 0.1.60 payout |
| --- | --- | --- |
| M09 | PHỐ ĐÔNG NGƯỜI | 25 / 15 / 10 / 0 |
| M17 | KÈO ALL-IN | 35 / 10 / 5 / 0 |
| M26 | CÒN THỞ CÒN TIỀN | 20 / 15 / 10 / 5 |
| M35 | TOP 2 HOẶC VỀ KHÔNG | 30 / 20 / 0 / 0 |
| M44 | NƯỚC RÚT CUỐI VÒNG | 25 / 15 / 5 / 5 |

Guardrails:
- every canonical 3+/4-player arena distributes exactly **50 B$ total**;
- every canonical direct 1v1 arena distributes exactly **30 B$ total**;
- arena identities stay distinct;
- old generic/default reward type remains backwards-compatible for legacy fixtures only.

## 9. 0.1.60 — presentation pacing

Automatic notices are tighter without shortening human-controlled reading:
- all-CPU auto notices cap around **820 ms**;
- global auto notices use roughly **5–8 seconds**;
- passive CPU/multiplayer notices use roughly **3.5–5 seconds**;
- passive skip floor is **2.5 seconds**.

Solo events that directly affect the one human player remain manual/acknowledgeable once text is readable.

`CareerMinigameBoardScene060` is presentation-only. It adds finish-lock feedback but no client RNG and no gameplay intent submission.

## 10. 0.1.60 implementation files

Core/content:
- `src/core/pacingEconomy060.ts`
- `src/core/matchState.ts`
- `src/core/replay.ts`
- `src/core/cards.ts`
- `src/core/news.ts`
- `src/core/specialLocations057.ts`
- `src/core/miniGameSlots059.ts`
- `src/content/core/cards_mvp.json`
- `src/content/core/news_mvp_demo.json`

Runtime/presentation:
- `src/ui/presentationFlowPolicy.ts`
- `src/scenes/CareerMinigameBoardScene060.ts`
- `src/main.ts`
- `src/ui/canonicalPresentation0561.ts`.

Tests/docs/CI:
- `tests/pacing-economy-060.ts`
- updated economy/content/party/tactical/board-flow regression gates;
- updated 0.1.48/0.1.58/0.1.59 inheritance gates;
- `package.json`
- `.github/workflows/ci.yml`
- `docs/PLAYTEST_0.1.60_PACING_ECONOMY.md`.

## 11. 0.1.60 automated result

The code candidate is **CI GREEN / PACKAGED**.

Code-candidate artifact before this handoff documentation update:
- `mememe-playtest-0.1.60-pacing-economy`
- run `#2066` / `34923325355`
- runtime/package SHA `124ac2cde988ea4fa5f113c450115eaa46111e32`
- artifact ID `10378873290`
- size `8,587,489 bytes`
- SHA256 `90f1727caabe6bfc5de5bb6f0a5ebbd76f6024da7ee2a021f8ae18d370b0501a`
- expires 2026-09-29.

All full-suite gates passed, including:
- typecheck/build;
- replay + lockstep + HOST authority;
- two-tab + bot stress;
- presentation/flow/pacing;
- content/party/economy/tactical;
- Job D6 + multiplayer Job Hub;
- Mini Game host-system payout ownership;
- final-result/podium chain;
- 0.1.48 stale-token/audio/dice gate;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 canonical presentation;
- 0.1.57 special-location authority;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job + five-arena depth;
- new 0.1.60 finish-lock/economy gate;
- package validation and artifact upload.

Two historical gates initially failed because they encoded intentionally superseded 0.1.60 values:
- board-flow required the old 3s/6s/10s automatic presentation timing;
- party-mechanics required the old 18% rich tax and +60 catch-up bonus.

They were updated to the new explicit 0.1.60 constants instead of weakening coverage.

## 12. Status declaration

### 0.1.60 automated implementation
**CI GREEN / PACKAGED CANDIDATE**

### Manual runtime acceptance
**PENDING**

### Rollback baseline
**0.1.48 remains the only user-validated rollback baseline.**

Do not call 0.1.60 user-accepted from CI alone.

## 13. Manual checklist

Use:
`docs/PLAYTEST_0.1.60_PACING_ECONOMY.md`

Highest-value checks:
1. Cross M01 with extra pips and confirm the token stops exactly on READY.
2. Confirm a finished player's later turns are skipped.
3. Confirm the finish toast clearly says B$ is locked.
4. Confirm later Card/News/Mini Game effects cannot change a finished player's B$.
5. Confirm Job salary still pays once before finish lock.
6. Confirm all five Mini Game arenas use the new payout tables exactly once through HOST authority.
7. Confirm Lottery remains D6 × 20.
8. Confirm Jail/Hospital release rules and fresh movement D6 are unchanged.
9. Confirm long-run movement never snaps backward.
10. Recheck Roll For Order, multiplayer Job Hub, branches, TIN TỨC/LÁ BÀI relocation, BGM and podium.

## 14. Roadmap

- 0.1.54 sandbox — done
- 0.1.55 canonical Draft D topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, no manual acceptance recorded
- 0.1.57 special-location authority — CI green, manual acceptance pending
- 0.1.58 TIN TỨC/LÁ BÀI depth — CI green, manual acceptance pending
- 0.1.59 Job + five-space Mini Game depth — CI green, manual acceptance pending
- **0.1.60 pacing/economy — CI green, manual acceptance pending**
- next milestone should be selected from 0.1.60 runtime feedback rather than invented in advance.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
