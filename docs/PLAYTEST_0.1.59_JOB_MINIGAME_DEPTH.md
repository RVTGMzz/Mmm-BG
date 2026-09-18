# MeMeMe MVP 0.1.59 — Job + Five-Space Mini Game Depth

Status: **AUTOMATED CANDIDATE — MANUAL RUNTIME ACCEPTANCE REQUIRED**

0.1.48 remains the only Ron/user-validated rollback baseline.

## What changed

### Job depth

The existing 10-Job system remains HOST-authoritative. 0.1.59 makes the career tradeoffs visible in the Job Hub UI:
- Lv.1 / Lv.2 / Lv.3 salary curve;
- salary growth profile;
- promotion chance;
- demotion chance;
- fired-on-demotion risk for legal Jobs;
- arrest risk for the illegal Job.

The criminal Job no longer has a placeholder "future Jail" outcome. If caught:
- the illegal Job is lost immediately;
- authoritative state moves to canonical Jail hold node 100;
- `specialHold = jail`;
- the next turn uses the existing 0.1.57 release rule: 1 / 3 / 5 succeeds;
- failed release stays in Jail and ends the turn;
- successful release exits the Jail corridor and then requires a fresh movement D6 in the same turn.

### Five canonical Mini Game arenas

The underlying game engine remains the proven hidden-choice tournament:
- 3+ eligible players: **NHIỀU RA ÍT BỊ**;
- 2 eligible players: **OẲN TÙ XÌ**;
- Jail/Hospital eligibility rules remain from 0.1.57.

Each canonical Mini Game space now has its own stake identity:

| Space | Arena | Identity | 3+/4-player payout |
| --- | --- | --- | --- |
| M09 | PHỐ ĐÔNG NGƯỜI | CÂN BẰNG | 30 / 20 / 10 / 0 |
| M17 | KÈO ALL-IN | HẠNG 1 ĂN DÀY | 40 / 15 / 5 / 0 |
| M26 | CÒN THỞ CÒN TIỀN | CỨU VỚT | 25 / 20 / 10 / 5 |
| M35 | TOP 2 HOẶC VỀ KHÔNG | CẮT TOP | 35 / 25 / 0 / 0 |
| M44 | NƯỚC RÚT CUỐI VÒNG | CHUNG KẾT | 30 / 15 / 10 / 5 |

Economy guardrail for this milestone:
- every 3+/4-player profile distributes exactly **60 B$ total**;
- every direct 1v1 profile distributes exactly **40 B$ total**;
- global economy/pacing tuning is intentionally deferred to 0.1.60.

Mini Game ranking is still resolved by the existing overlay and payout is still committed through the existing HOST-system `resolve_minigame` authority path. No client-side gameplay RNG was added.

## Manual checklist

1. Enter Job Hub unemployed and confirm the A/B/C cards clearly show salary progression and risk profile before rolling.
2. Verify Job selection is still D6-authoritative: 1–2 = A, 3–4 = B, 5–6 = C.
3. Revisit Job Hub while employed and confirm promotion / steady / demotion / fired presentation still matches the resulting career state.
4. With the criminal Job, eventually trigger arrest. Confirm the Job disappears and the token visibly moves to the canonical Jail hold.
5. On the arrested player’s next turn, verify Jail release remains exactly 1 / 3 / 5. Failure ends the turn; success exits the corridor and requires a fresh movement D6.
6. Trigger Mini Game at M09 and confirm **PHỐ ĐÔNG NGƯỜI / CÂN BẰNG** with 30/20/10/0 stakes.
7. Trigger M17 and confirm **KÈO ALL-IN / HẠNG 1 ĂN DÀY** with 40/15/5/0 stakes.
8. Trigger M26 and confirm **CÒN THỞ CÒN TIỀN / CỨU VỚT** with 25/20/10/5 stakes.
9. Trigger M35 and confirm **TOP 2 HOẶC VỀ KHÔNG / CẮT TOP** with 35/25/0/0 stakes.
10. Trigger M44 and confirm **NƯỚC RÚT CUỐI VÒNG / CHUNG KẾT** with 30/15/10/5 stakes.
11. For direct 1v1 Mini Games, verify the arena-specific two-player reward copy and that the total payout remains 40 B$.
12. Confirm players held in Jail/Hospital are still excluded. One eligible player auto-wins; zero eligible players skip payout.
13. Check that the ranking shown by the overlay exactly matches the B$ changes after HOST payout.
14. In multiplayer/two-tab play, confirm only the controlling Job player can roll while spectators see the same Job offers.
15. Stress several turns and recheck the 0.1.48 token snap-back bug does not return, especially after Job arrest and Mini Game completion.
16. Recheck Roll For Order, TIN TỨC/LÁ BÀI relocations, Lottery, READY salary/lap, BGM ownership and final podium.

## Acceptance rule

CI green means **packaged candidate**, not user-accepted runtime PASS. Do not replace 0.1.48 as the validated rollback baseline until Ron explicitly accepts a manual runtime test.
