# MeMeMe MVP 0.1.45 Playtest Guide

## Quick start

1. Extract the playtest ZIP.
2. On Windows, double-click `START_PLAYTEST.bat`.
3. Keep the launcher terminal open while playing.
4. Do not open `index.html` directly with `file://`.

## 0.1.45 focus: Remote Roll For Order

This build upgrades the local two-tab prototype so the remote player actually rolls from their own browser tab during Roll For Order.

### Required two-tab test

1. Open tab A and choose **HOST 2 TAB**.
2. Keep the generated room code.
3. In tab A, finish Setup and press **ROLL FOR ORDER**.
4. Open tab B in the same browser profile/origin and choose **JOIN 2 TAB**.
5. Enter the same room code and choose P2, P3, or P4.
6. Tab B should enter the Roll For Order screen instead of jumping straight to the board.
7. Host should show that remote seat as connected and then begin the ceremony.
8. When the remote seat's turn arrives, only tab B should show an active D6 button for that seat.
9. Clicking D6 on tab B must not choose the result locally. Host generates the D6 and both tabs reveal the same final number.
10. If there is a tie, only the tied players reroll. A tied remote seat should again roll from its own tab.
11. Both tabs should display the same final order.
12. Client waits until host presses **VÀO TRẬN**, then both continue into the board.

## Authority checks

- Spam the remote D6 button: one active prompt must produce only one authoritative D6.
- Remote P2 must never be able to roll P1/P3/P4 prompts unless that tab owns the active seat.
- Unclaimed seats are rolled by host.
- A client trying to join after Roll For Order has already locked seats should receive a clear rejection.
- Player names on the remote Roll For Order screen should come from host Setup.
- Original face files must remain local; 0.1.45 does not add face-file transfer.

## Retained rules

- Highest D6 goes earlier.
- Only tied players reroll until relative order is resolved.
- Player ID/color/face ownership stays attached to the same player; only `playOrder` changes.
- Starting wallet remains `200 B$`.
- Every player must complete one physical lap before final scoring.
- Job Hub remains mandatory with Job D6 `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Nhiều ra ít bị pays `30 / 20 / 10 / 0 B$`.
- Direct RPS pays `25 / 15 / 5 / 0 B$`.
- Final Mini Game payout must commit before final B$ scoring.

## Final result chain retained

0.1.44 and earlier podium behavior remains unchanged:

- queued presentation clears;
- final Mini Game payout resolves if needed;
- `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$`;
- podium reveals low-to-high;
- tied ranks reveal together;
- rank 1 prefers happy face, rank 4 prefers angry, middle ranks neutral;
- result controls stay blocked until the podium reveal is finished.

## Audio

Approved BGM remains unchanged:

- `01_Menu_MeMeMe.ogg`
- `02_City_Bubble.ogg`
- `03_City_Silly.ogg`
- `04_Final_Round.ogg`

Mini Game BGM remains `03_City_Silly.ogg`.

All eight supplied SFX remain unchanged: victory, news, card, step, money loss, money gain, dice, choice.

## Known limits

- This is still browser-local BroadcastChannel QA, not production internet multiplayer.
- Production reconnect/seat reclaim is not implemented.
- Client face texture sync is still not production-ready.
- CPU remains a QA bot, not final AI.
- Thief can be `jailed`, but skipped turns, bail, and escape rules remain intentionally undefined.

## Priority regression checks

1. SOLO 1 HUMAN + 3 CPU still completes Roll For Order normally.
2. HOST + JOIN remote D6 works for a normal roll.
3. Force/observe a tie involving the remote seat and verify remote reroll.
4. Finish the full match and verify final payout/podium behavior is unchanged.
5. Re-check P1 movement snap-back fix and Job Hub token reconciliation.
6. Re-check all eight SFX and checksum-locked BGM assets.
