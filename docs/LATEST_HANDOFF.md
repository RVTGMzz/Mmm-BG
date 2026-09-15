# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep **TIN TỨC / LÁ BÀI** names.

## Current automated candidate

**MVP 0.1.60 — Pacing / Economy**

Automated status: **CI GREEN / PACKAGED**
Manual runtime status: **PENDING RON ACCEPTANCE**

Code-candidate artifact before this documentation update:
- `mememe-playtest-0.1.60-pacing-economy`
- run `#2066` / `34923325355`
- runtime/package SHA `124ac2cde988ea4fa5f113c450115eaa46111e32`
- artifact ID `10378873290`
- size `8,587,489 bytes`
- SHA256 `90f1727caabe6bfc5de5bb6f0a5ebbd76f6024da7ee2a021f8ae18d370b0501a`
- expires 2026-09-29.

## Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene060 as ActiveBoardScene`

Inheritance:
`060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.60 retains 0.1.59 Job/Mini Game depth, 0.1.58 TIN TỨC/LÁ BÀI relocation, 0.1.57 special-location authority, canonical presentation and the 0.1.48 stale-token guard.

0.1.56.1 through 0.1.60 are CI-green candidates without recorded manual user acceptance.

## Finish-line pacing

M01 READY is now a real finish line for the one-lap playtest.

When a player completes lap 1:
- movement stops immediately on READY;
- remaining movement pips are discarded;
- READY Job salary pays first;
- `finishLocked = true` is recorded;
- that player is skipped in future turns while unfinished players remain;
- presentation shows `VỀ ĐÍCH / B$ ĐÃ KHÓA`.

This removes the old second-lap farming window for early finishers.

## Final B$ lock

After finishing, a player's final B$ cannot be modified by later active-race systems.

Finished players are excluded from:
- Card targets, richest/random targets, swaps and group attacks;
- Jail/Hospital Card relocation;
- global/normalize/special News effects;
- Mini Game eligibility.

The authoritative Card layer rejects a finished target even if UI validation is bypassed.

## Economy tuning

Unchanged:
- start = 200 B$;
- Draft D main money spaces = four -20 and four +25;
- TIỀN branch = +25 / -20 / +25;
- Job salary curves;
- Lottery = D6 × 20;
- Jail/Hospital release rules;
- Card and News weight distributions.

Tuned Cards:
- Kèo Hai Cửa safe = +20 B$;
- Thuế Top 1 = 15%;
- SR group loss = 20%;
- Phao Cứu Sinh = +50 if poorest active racer, otherwise +15.

Tuned News:
- self +25 / -30;
- common global +10 / -10;
- rare global -15.

Direct weighted News money expectation stays about +4.3 B$/draw, but variance is lower.

## Five Mini Game arenas

0.1.59 identities and HOST-system single-commit payout ownership remain.

Canonical 3+/4-player tables are now:
- M09: 25/15/10/0;
- M17: 35/10/5/0;
- M26: 20/15/10/5;
- M35: 30/20/0/0;
- M44: 25/15/5/5.

Every canonical 3+/4-player table distributes **50 B$ total**. Every canonical direct 1v1 table distributes **30 B$ total**.

## Presentation pacing

Automatic notices are tighter:
- all-CPU auto max ~820 ms;
- global notices ~5–8 seconds;
- passive CPU/multiplayer notices ~3.5–5 seconds;
- passive skip floor 2.5 seconds.

Solo events that directly affect the human remain manually acknowledgeable after text reveal.

## CI status

Run #2066 is fully green. It passed:
- build/typecheck;
- replay/lockstep/HOST authority;
- two-tab + bot stress;
- board/content/party/economy/tactical/pacing gates;
- Job D6 and multiplayer Job Hub;
- Mini Game host-system payout ownership;
- final-result/podium chain;
- 0.1.48 stale-token/audio/dice gate;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 presentation;
- 0.1.57 special locations;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job/five-arena depth;
- new 0.1.60 finish-lock/economy gate;
- package validation + artifact upload.

Historical timing/party assertions were updated only where 0.1.60 intentionally superseded their old economy/pacing constants.

## Manual guide

`docs/PLAYTEST_0.1.60_PACING_ECONOMY.md`

Priority checks:
- extra pips are discarded when crossing READY;
- finishers are skipped in future turns;
- final B$ stays frozen against later Card/News/Mini Game effects;
- READY salary pays once before the lock;
- all five Mini Game payout tables match the new values;
- Lottery x20 and Jail/Hospital rules remain unchanged;
- no long-run token snap-back;
- Roll For Order, multiplayer Job Hub, branches, TIN TỨC/LÁ BÀI, BGM and podium remain intact.

## Roadmap

- 0.1.54 sandbox — done
- 0.1.55 canonical topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, manual pending
- 0.1.57 special locations — CI green, manual pending
- 0.1.58 TIN TỨC/LÁ BÀI depth — CI green, manual pending
- 0.1.59 Job + five Mini Game depth — CI green, manual pending
- **0.1.60 pacing/economy — CI green, manual pending**
- next milestone should follow 0.1.60 runtime feedback.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
