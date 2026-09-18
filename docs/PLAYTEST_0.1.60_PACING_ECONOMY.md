# MeMeMe MVP 0.1.60 — Pacing / Economy Playtest

Status: automated candidate. Manual runtime acceptance is still required.

## What changed

0.1.60 is a one-lap pacing/economy pass built on the 0.1.59 runtime chain.

The core rule is now **READY is a real finish line**:
- when a player crosses M01 and completes the target one lap, movement stops immediately on READY;
- unused D6 pips are discarded;
- that player is retired from future turns while unfinished players remain;
- their final B$ is locked against later Card, News and Mini Game effects;
- finished players no longer join Mini Games.

This prevents early finishers from farming a second lap while waiting for the last player, and prevents late events from rewriting an already-finished score.

## Economy tune

Unchanged:
- starting money = 200 B$;
- Draft D main money spaces remain four -20 and four +25;
- TIỀN branch remains +25 / -20 / +25;
- Job salary curves remain unchanged;
- Lottery remains D6 × 20 B$;
- Jail/Hospital release rules remain unchanged;
- Card and News rarity/weight totals remain unchanged.

Tuned Card values:
- Kèo Hai Cửa safe choice: +20 B$;
- Thuế Top 1: 15%;
- SR all-opponent loss: 20%;
- Phao Cứu Sinh: +50 B$ if poorest among active racers, otherwise +15 B$.

Tuned News values:
- positive self: +25 B$;
- negative self: -30 B$;
- normal global gain/loss: +10 / -10 B$;
- rare global loss: -15 B$.

The News draw weights are unchanged, so event frequency remains familiar while the money swings are less violent.

## Mini Game economy

The five 0.1.59 arena identities remain, but canonical payout totals are reduced:
- 3+/4-player Mini Game: 50 B$ total;
- direct 1v1: 30 B$ total.

Current 3+/4-player tables:
- M09 PHỐ ĐÔNG NGƯỜI: 25 / 15 / 10 / 0;
- M17 KÈO ALL-IN: 35 / 10 / 5 / 0;
- M26 CÒN THỞ CÒN TIỀN: 20 / 15 / 10 / 5;
- M35 TOP 2 HOẶC VỀ KHÔNG: 30 / 20 / 0 / 0;
- M44 NƯỚC RÚT CUỐI VÒNG: 25 / 15 / 5 / 5.

HOST-system payout ownership and ranking rules are unchanged.

## Presentation pacing

Automatic notices are shorter:
- all-CPU notices remain very fast;
- global auto notices now cap at 8 seconds instead of 10;
- passive CPU/multiplayer notices cap at 5 seconds instead of 6.

Solo events that affect the human still require manual acknowledgement after the text is readable.

## Priority manual checks

1. Roll across M01 with more pips than needed. Token must stop exactly on READY and must not consume the remaining pips.
2. After one player finishes, confirm their turns are skipped while unfinished players continue.
3. Finished player should show a clear `VỀ ĐÍCH / B$ ĐÃ KHÓA` feedback beat.
4. After a player finishes, later global News must not change that player's B$.
5. Later steal/tax/group-loss/swap/Jail/Hospital Cards must not target the finished player.
6. Finished players must not join later Mini Games.
7. Held players are still excluded from Mini Games exactly as in 0.1.57.
8. Verify each canonical Mini Game pays its new 0.1.60 table exactly once through HOST authority.
9. Verify Job salaries still pay once when crossing READY before the score locks.
10. Verify Lottery still pays D6 × 20 B$.
11. Verify Jail release remains 1/3/5 and Hospital release remains 2/4/5, followed by a fresh movement D6 on success.
12. Long-run token movement must still never snap backward.
13. Recheck Roll For Order, multiplayer Job Hub, branches, TIN TỨC/LÁ BÀI relocation, audio/BGM and final podium.
14. Visible runtime must say **0.1.60** and names must remain **TIN TỨC / LÁ BÀI**.

## Rollback rule

0.1.48 remains the only user-validated rollback baseline until Ron manually accepts a later build.
