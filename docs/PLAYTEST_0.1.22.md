# MeMeMe Playtest 0.1.22 — Content Depth

## What changed

This build focuses on visible gameplay variety rather than new HUD.

- Card pool: **11**
- News pool: **8**
- alternate News reaction sets added
- every City MVP node now has a distinct name/copy
- Settings/audio startup from 0.1.21 retained
- board movement, dice, reaction timing and BGM behavior from 0.1.20/0.1.19 retained

## What to test

### 1. Card variety
Play several rounds or use 4 CPU AUTOPLAY and confirm you see different Card names instead of the same 4 repeating constantly.

Current balance bands intentionally remain:
- N 60%
- R 30%
- SR 9%
- SSR 1%

### 2. News variety
Confirm News no longer repeats only the original three titles. New News should still resolve into the same broad money outcomes for this milestone.

### 3. Reaction timing
New News variants may trigger alternate dialogue. Confirm:
- dialogue still belongs to the News that just happened;
- bubbles stay left/right;
- no late reaction backlog;
- no reaction appears over results after the match ends.

### 4. Tile identity
Watch landing notices. Normal/card/news/money nodes should have City-flavored names such as:
- HẺM CÀ PHÊ
- NGÃ TƯ ĐÔNG NGHẸT
- QUÁN VỈA HÈ
- CÔNG VIÊN
- HẺM TẮT

The name/copy should match the node you actually landed on.

### 5. Regression checks
Please also confirm old accepted behavior remains:
- token moves tile-by-tile;
- dice appears only during roll;
- odd/even branch routing remains automatic;
- player-related notice in 1P+3CPU waits when required;
- CPU/multiplayer notices still obey 3s/6s/10s timing rules;
- Card/News does not steal the round BGM;
- Settings gear still controls BGM volume/mute and FX.

## Reporting

If something is wrong, note:
- build `0.1.22`;
- mode used (1P+3CPU / 2P+2CPU / hotseat / 4CPU / host-client);
- Card/News/tile name involved;
- what happened before the bug;
- screenshot if visual.

The in-game BUG REPORT exporter remains available for deterministic state debugging.
