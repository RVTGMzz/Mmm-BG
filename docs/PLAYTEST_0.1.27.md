# MeMeMe MVP 0.1.27 — Playtest Guide

## Focus of this build

0.1.27 adds the first explicit tactical choice inside a Card while retaining the 200 B$ economy, Turn Stakes leaderboard, movement, reaction timing, Settings and approved BGM behavior.

## Kèo Hai Cửa

`ACT_008` is now **Kèo Hai Cửa** (R rarity, weight 75).

When a human uses it, the Card opens a dedicated choice panel:

1. **ĂN CHẮC** — receive +25 B$ immediately.
2. **ÉP TOP 1** — take 15% of the current richest other player's B$.

The pressure option displays the current target and expected B$ before the player commits.

Ties for richest opponent resolve deterministically by lower seat/player ID.

## CPU behavior

CPU remains QA-only. When it receives Kèo Hai Cửa it compares:
- guaranteed +25 B$;
- current 15% Top-1 value.

It chooses Pressure only when that value is strictly greater than 25 B$; otherwise it chooses Safe. This evaluation consumes no gameplay RNG.

## What to test

1. Draw Kèo Hai Cửa and open the hand.
2. Confirm its hand card label says `🧠 2 LỰA CHỌN`.
3. Select it and verify the two-choice panel appears before the Card is consumed.
4. Cancel with `QUAY LẠI` and confirm the Card is still in hand.
5. Use **ĂN CHẮC** and verify exactly +25 B$.
6. In another opportunity, use **ÉP TOP 1** and verify the richest other player loses 15% floored to an integer and the caster gains the same amount.
7. If two opponents tie for richest, verify the lower seat ID is selected.
8. Run 4 CPU autoplay and verify no stall occurs.
9. Confirm leaderboard wallet-delta FX and Card presentation still remain in sync.
10. Confirm Card/News/Reaction queues still clear before final ranking.

## Regression expectations

- No new gameplay RNG calls.
- No new command type.
- `play_card` carries a host-validated `choice` only for tactical Cards.
- Invalid tactical choices are rejected / fail replay rather than silently defaulting.
- R rarity total remains 300/1000 and total Card weight remains 1000.
- Existing golden replay checksum should remain unchanged because ACT_008 keeps the same ID and weight and the golden fixture does not play it.

## Run

Extract the GitHub artifact fully, then run `START_PLAYTEST.bat` on Windows. Do not open `index.html` directly through `file:///`.
