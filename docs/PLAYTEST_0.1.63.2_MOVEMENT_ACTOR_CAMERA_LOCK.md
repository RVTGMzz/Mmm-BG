# MeMeMe MVP 0.1.63.2 — Movement Actor Camera Lock

This is a presentation-only camera hotfix on top of 0.1.63.1.

## What changed

Human runtime feedback showed that a token could still leave the viewport after rolling 5–6 even though 0.1.63.1 centered the authoritative current-turn player.

Root cause:
- authoritative turn state may advance to the next player before the queued visual `move_step` animation finishes;
- 0.1.63.1 followed `currentPlayer()` instead of the actor whose presentation was still animating.

0.1.63.2 fixes camera targeting priority:
1. while a presentation model is active, center the camera on that model's `actorId`;
2. therefore all `move_step` animation stays centered on the token actually moving;
3. landing presentation stays framed on that same player;
4. only after presentation becomes idle does camera return to the authoritative current-turn player;
5. `TỔNG QUAN / O` remains the intentional exception.

No gameplay, authority, RNG, economy, branch, Job, Mini Game, Jail/Hospital, Lottery, Card or News rules are changed.

## Manual checks

Please test especially:
- roll 5 and 6 several times and verify the moving token never leaves the screen;
- when the turn has already advanced internally, camera must still remain on the token finishing its movement animation;
- after movement/landing presentation ends, camera should switch to the next current player cleanly;
- edge/corner spaces should still be able to sit at screen center;
- `TỔNG QUAN / O` should still enter and leave overview correctly;
- watch for any token snap-back after many turns.

If possible, finish a full match and copy the Playtest Report from the result screen.
