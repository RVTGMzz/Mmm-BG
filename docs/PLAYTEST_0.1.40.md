# MeMeMe MVP 0.1.40 Playtest Guide

## Quick start

1. Extract the playtest ZIP.
2. On Windows, double-click `START_PLAYTEST.bat`.
3. Keep the launcher terminal open while playing.
4. The browser should open the local playtest URL automatically.

Do not open `index.html` directly with `file://`.

## 0.1.40 focus

This build is a runtime-copy cleanup pass. The active end rule is one physical lap per player, not the legacy three-round/12-turn shell metadata.

Please watch these surfaces during a full match:

- center turn HUD should show `🏁 x/4 ĐỦ VÒNG`, never `Vòng x/y`;
- waiting overlay should explain one lap per player;
- shell logs should not say the match is a fixed 3-round / 12-turn demo;
- result copy should refer to all players completing a lap and the B$ table locking;
- Lobby and Setup should both show `0.1.40`.

## End rule

- Every player must pass READY at least once.
- Crossing READY still pays the current Job salary exactly once for that crossing.
- If the final required lap ends on a Mini Game, the authoritative Mini Game reward must commit before final B$ scoring.
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
- 0.1.39 `4/4 HOÀN THÀNH → KHÓA BẢNG B$` result transition remains intact.

## Known limits

- CPU is a QA bot, not final gameplay AI.
- Two-tab Roll For Order is still organized from host/local setup rather than remote roll buttons.
- Thief may have `jailed` status, but skipped turns, bail and escape rules are intentionally undefined.
- No production internet multiplayer/reconnect/seat-reclaim yet.
- Client face texture sync is not production-ready.

## Priority runtime checks

1. Start SOLO 1 HUMAN + 3 CPU and verify all visible match progress is lap-native.
2. Open HOST + JOIN and verify both tabs receive the same lap-native shell copy.
3. Finish a normal match and verify the 0.1.39 final B$ transition still appears once.
4. Finish a match where the last required lap lands on Mini Game and verify payout lands before result reveal.
5. Recheck P1 movement + Card/News and Job Hub token alignment.
