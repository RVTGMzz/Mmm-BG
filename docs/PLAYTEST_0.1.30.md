# MeMeMe Playtest 0.1.30

## Focus

This build changes the turn input flow without changing dice authority or gameplay RNG.

Please verify:

1. On your turn, a large die appears automatically near the board center.
2. There is no red `ĐỔ XÚC XẮC` button in the bottom HUD.
3. You can still use a Card before rolling.
4. Clicking the die immediately hides the idle die and starts the normal authoritative roll animation.
5. The animated result is the same roll used for movement.
6. The die stays hidden while CPU is playing.
7. The die stays hidden during movement, Card/News presentation and after match end.
8. In 2-tab mode, only the client that controls the current seat can see/click the die.
9. Mini Game and Job foundation markers from 0.1.29 are still present.
10. NPC rare-slip behavior and longer CPU chat remain intact.

## Current Mini Game / Job status

The board has one Mini Game foundation space and one Job foundation space. They are wired into replay, presentation and host authority, but still auto-pass with no reward/penalty until final rules are explicitly locked.

## Report useful issues

If the direct die is wrong, include:
- screenshot;
- game mode;
- whose turn it was;
- whether a Card/presentation was open;
- Bug Report JSON when possible.
