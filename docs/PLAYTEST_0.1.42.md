# MeMeMe MVP 0.1.42 Playtest Guide

## Quick start

1. Extract the playtest ZIP.
2. On Windows, double-click `START_PLAYTEST.bat`.
3. Keep the launcher terminal open while playing.
4. The browser should open the local playtest URL automatically.

Do not open `index.html` directly with `file://`.

## 0.1.42 focus

This build keeps the 0.1.41 authoritative final podium and adds deterministic face reactions plus a winner spotlight.

At final result, verify:

- rank 1 prefers the supplied happy/đắc ý face 😆;
- ranks 2 and 3 use the neutral face 😐;
- rank 4 prefers the supplied angry/quạu face 😡;
- if a requested reaction face is missing, the existing neutral fallback still works;
- every rank-1 player gets the same crown + fixed spark spotlight;
- a first-place tie spotlights all tied winners, not only the first array entry;
- B$, ranking, winner IDs and podium height/tie behavior remain identical to 0.1.41;
- the `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$` gate still occurs before podium reveal;
- victory SFX remains one-shot.

## Tie examples

- `300 / 300 / 250 / 200` → ranks `1 / 1 / 3 / 4`; both rank-1 players use happy preference and get crowns.
- `300 / 250 / 250 / 200` → ranks `1 / 2 / 2 / 4`; only rank 1 gets spotlight.
- All four equal → all four display rank 1 and all four receive the same winner spotlight.

These are presentation rules only. They do not modify the authoritative result.

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
- 0.1.41 podium uses authoritative final B$ and competition tie ranks.
- 0.1.40 keeps inherited shell/HUD/log copy lap-native.
- 0.1.39 final B$ lock transition remains the gate before result reveal.

## Known limits

- CPU is a QA bot, not final gameplay AI.
- Two-tab Roll For Order is still organized from host/local setup rather than remote roll buttons.
- Thief may have `jailed` status, but skipped turns, bail and escape rules are intentionally undefined.
- No production internet multiplayer/reconnect/seat-reclaim yet.
- Client face texture sync is not production-ready.

## Priority runtime checks

1. Setup all three face expressions for at least one human and finish a match in rank 1 or 4.
2. Leave happy/angry missing for another player and verify neutral fallback.
3. Create/observe a first-place tie and verify every tied winner gets crown/sparks.
4. Confirm no face reaction changes B$, rank or authoritative winner state.
5. Finish with a final Mini Game and verify payout lands before lock/podium reveal.
6. Rematch and verify reactions are rebuilt correctly from the new result.
