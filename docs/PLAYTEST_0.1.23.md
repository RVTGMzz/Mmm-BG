# MeMeMe Playtest 0.1.23

## Focus of this build

This build keeps 0.1.22 gameplay/content and adds two presentation improvements:

1. Card banter now changes by Card effect type.
2. Automatic odd/even branch routing shows a compact route banner instead of silently switching paths.

## What to test

### 1. Card reaction personality

Use or observe several Card types:
- steal money Card;
- block Card;
- group 30% loss Card;
- full-money swap Card.

Expected:
- each effect has noticeably different dialogue;
- speaker order still makes sense;
- no old reaction spam backlog appears;
- CPU-only reactions still auto-close under the existing timing rules;
- human-related notices still follow the existing manual/auto policy.

### 2. Route banner

Reach the branch near the upper-right part of the City board.

Expected:
- odd roll shows `LẺ` and `PHỐ CHÍNH`;
- even roll shows `CHẴN` and `HẺM TẮT`;
- banner appears near the top-center for roughly one second;
- banner does not require a click;
- movement continues naturally after the route is selected;
- no manual branch picker appears.

### 3. Regression checks

Please also verify:
- token still walks node-by-node;
- dice result matches the route parity;
- Card/News/Tile notifications do not pile up at endgame;
- ranking waits until final presentation finishes;
- Settings still contains BGM volume / BGM mute / FX mute;
- Menu BGM still starts promptly after the first allowed gesture;
- gameplay BGM is not replaced by News/Card events.

## Report a bug

Use the in-game `BUG REPORT` button when possible and include:
- what you did immediately before the issue;
- which player/CPU was active;
- dice result if branch routing was involved;
- Card name if reaction dialogue was involved.
