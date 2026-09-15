# MeMeMe Playtest 0.1.63.3

## Presentation Sync + Release D6 Clarity

This hotfix targets two human-reported runtime problems without changing HOST RNG, economy, branch rules, Card/News values, Job rules, Mini Game rules, or final-result logic.

### 1. Movement must visually finish before landing effects appear

Expected:
- roll D6;
- token visibly travels the rolled path;
- only after the token reaches the destination should the landing/effect presentation and visible HUD delta catch up.

Watch specifically for money tiles, TIN TỨC, LÁ BÀI and special gates. The player should no longer appear stationary while their destination effect is already visible.

### 2. Jail/Hospital release D6 is NOT movement

Expected successful Jail example:
1. player is already held in Jail from a previous turn;
2. on their next turn they roll a release D6;
3. if the face is 1/3/5, show an explicit release panel;
4. that face is discarded and must not become movement distance;
5. the internal exit corridor is presented as one return-to-gate motion, not several fake board steps;
6. after release presentation finishes, a NEW D6 appears/rolls in the same turn;
7. only this fresh D6 moves the player on the main board.

Hospital follows the same pattern with release faces 2/4/5.

A failed release stays held and ends the turn.

### 3. Camera behavior retained

0.1.63.2 movement-actor camera lock remains inherited:
- camera follows the actor whose presentation is still moving;
- long 5/6 rolls must not leave the viewport;
- `TỔNG QUAN / O` remains the intentional exception.

### 4. Branch rule retained

- odd 1/3/5 -> LEFT;
- even 2/4/6 -> RIGHT;
- HOST resolves this automatically;
- no manual branch picker.

### Manual checklist

Please test:
- several rolls of 5 and 6;
- at least one money landing;
- one TIN TỨC/LÁ BÀI landing if practical;
- Jail success and failure if encountered;
- Hospital success and failure if encountered;
- on successful release, confirm you clearly see a second fresh D6 before normal movement;
- keep watching for any token snap-back after many turns.

0.1.63.3 is not accepted until Ron validates it in runtime.
