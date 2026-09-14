# MeMeMe MVP 0.1.41 Playtest Guide

## Quick start

1. Extract the playtest ZIP.
2. On Windows, double-click `START_PLAYTEST.bat`.
3. Keep the launcher terminal open while playing.
4. The browser should open the local playtest URL automatically.

Do not open `index.html` directly with `file://`.

## 0.1.41 focus

This build upgrades the final result from a text ranking into a four-seat authoritative podium.

Please verify at match end:

- `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` still appears first;
- the podium appears only after queued presentation and any final Mini Game payout have finished;
- all four players appear on the podium;
- each player shows the exact final B$ from the match result;
- player names match the authoritative match state;
- neutral face stickers appear when available; missing faces fall back to P1/P2/P3/P4;
- equal B$ receives the same displayed rank/medal and the same podium height;
- result/rematch controls remain usable after the reveal;
- victory SFX is not duplicated.

## Tie examples

- `300 / 300 / 250 / 200` should display `🥇 / 🥇 / 🥉 / 4️⃣`.
- `300 / 250 / 250 / 200` should display `🥇 / 🥈 / 🥈 / 4️⃣`.
- If all four B$ values are equal, all four are rank 1 for presentation and the authoritative result remains a four-way tie.

The podium does not alter the winner IDs or money values.

## End rule

- Every player must pass READY at least once.
- Crossing READY pays the current Job salary exactly once for that crossing.
- If the final required lap ends on a Mini Game, its host-system payout must commit before final B$ scoring.
- Highest B$ wins after all required laps are complete; equal B$ shares the win.
- Legacy `rounds` / `turnLimit` shell fields remain compatibility metadata only.

## Mini Game economy

- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì: `25 / 15 / 5 / 0 B$`.
- RPS 1v1 animation still plays for CPU vs CPU.
- Mini Game payout remains host-system authoritative and single-commit.

## Audio

Approved BGM remains unchanged:

- `01_Menu_MeMeMe.ogg`
- `02_City_Bubble.ogg`
- `03_City_Silly.ogg`
- `04_Final_Round.ogg`

Mini Game BGM remains `03_City_Silly.ogg`.

Supplied event SFX remain unchanged: victory, news, card, step, money loss, money gain, dice and choice.

## Retained fixes

- P1 token must not snap backward during ordinary movement + Card/News state updates.
- Job Hub reconciles the human token to the authoritative Job node.
- Snapshot/rematch may still hard-snap token visuals.
- Roll For Order keeps stable player identity/face/color and rerolls tied seats only.
- Final result waits for queued presentation and pending final Mini Game payout.
- 0.1.40 keeps inherited shell/HUD/log copy lap-native.
- 0.1.39 final B$ lock transition remains the gate before result reveal.

## Known limits

- CPU is a QA bot, not final gameplay AI.
- Two-tab Roll For Order is still organized from host/local setup rather than remote roll buttons.
- Thief may have `jailed` status, but skipped turns, bail and escape rules are intentionally undefined.
- No production internet multiplayer/reconnect/seat-reclaim yet.
- Client face texture sync is not production-ready.

## Priority runtime checks

1. Finish a normal 1 HUMAN + 3 CPU match and inspect all four podium entries.
2. Create or encounter a tie and verify shared medals/heights.
3. Finish a match where the last required lap lands on Mini Game and verify payout lands before the podium reveal.
4. Rematch and verify the podium can be rebuilt cleanly for the new result.
5. Recheck P1 movement + Card/News and Job Hub token alignment.
