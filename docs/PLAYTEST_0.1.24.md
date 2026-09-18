# MeMeMe Playtest 0.1.24 — Party Mechanics

## What to test

This build keeps the stabilized board flow from 0.1.23 and adds three new deterministic mechanics.

### 1. Thuế Top 1 — ACT_015

When played:
- no target picker should appear;
- game should automatically choose the opponent with the most B$;
- if two opponents tie, lower seat ID wins the tie;
- 18% of that player's current B$ moves to the caster;
- Card presentation should still show the resolved target correctly.

### 2. Phao Cứu Sinh — ACT_016

When played:
- if the caster is tied for lowest B$ at that moment, they receive +140B$;
- otherwise they receive only +20B$;
- no target picker should appear.

### 3. Cân Bằng B$ — NEWS_DEMO_009

When this News appears:
- calculate the table average before the effect;
- the landing player's B$ should become the floored average;
- low players can go up;
- high players can go down;
- it intentionally has no NPC reaction script yet so dialogue cannot misdescribe the direction.

## Existing flow to recheck once

- token still walks node by node;
- odd/even route banner remains non-blocking;
- Card/News notifications do not backlog into endgame;
- Settings still owns BGM/volume/FX controls;
- Menu BGM starts promptly after first browser interaction when autoplay is blocked;
- final ranking still waits for unresolved presentation.

## Bug report priorities

Please capture if any of these happen:
- Thuế Top 1 chooses the wrong player;
- Phao Cứu Sinh gives the wrong branch amount;
- Cân Bằng B$ uses an unexpected average;
- any new Card causes a replay/authority error;
- CPU gets stuck before rolling after using a new Card;
- notification/reaction queue starts accumulating again.
