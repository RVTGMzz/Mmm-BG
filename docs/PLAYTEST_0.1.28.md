# MeMeMe Playtest 0.1.28

## Test focus

This build keeps the 0.1.27 Tactical Choice gameplay and adds NPC personality/timing polish.

Please focus on:

1. CPU side chat now stays visible noticeably longer without covering the board center.
2. Rare CPU quirk chat appears only occasionally, not every few turns.
3. When the quirk lands on `Kèo Hai Cửa`, CPU may make the worse of the two choices and then react as if it slipped.
4. Reaction / Card / News queues must still clear before end-of-match ranking appears.
5. Human-controlled reaction timing should not feel 2.5× slower. The multiplier is for CPU/NPC speakers only.
6. BGM, Settings, node-by-node movement, dice and leaderboard should behave exactly as before.

## Current demo economy

- starting wallet: 200 B$
- READY: +100 B$
- money tiles: +25 / -20 / +50 / +15 B$
- News: +30 self / -40 self / -20 all / normalize-to-average
- Kèo Hai Cửa: safe +25 B$ or pressure 15% from richest other

## Coming next

0.1.29 is planned as the technical foundation for **Mini Game** and **Job** tiles. 0.1.30 is planned to put the first playable Mini Game and first playable Job into the loop after the foundation passes replay/authority tests.

## Reporting

If something feels wrong, include:
- screenshot;
- what happened immediately before it;
- game mode used;
- Bug Report JSON when possible.
