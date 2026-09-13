# MeMeMe MVP 0.1.30 — Direct Turn Dice

Status: IMPLEMENTED / FINAL CI PENDING

## Goal

Remove the extra bottom Roll button step. When it is the local human player's turn, the dice itself becomes the primary roll control on the board.

## Direct dice flow

For a locally controlled human seat:
1. match reaches `PRE_ROLL_ACTION`;
2. a large clickable die appears in the board center;
3. the player may still use a Card first;
4. clicking the die calls the existing authoritative `handleRoll()` path;
5. the idle die disappears immediately;
6. the existing authoritative dice-roll animation resolves to the real result;
7. movement continues node-by-node exactly as before.

The idle die never generates or previews a random result. Its visible pip face is fixed presentation art only.

## Bottom HUD

The old red `ĐỔ XÚC XẮC` button is hidden and disabled.

The compact bottom strip is tightened and retains:
- current-turn / round information;
- Card button and hand count.

## CPU / network behavior

The direct die only appears when all conditions are true:
- match shell is active;
- phase is `PRE_ROLL_ACTION`;
- this client can control the current player;
- the current seat is not CPU.

Therefore:
- CPU seats continue autoplay without a clickable die;
- remote clients cannot roll another seat's turn;
- dice disappears during ROLLING / MOVING / presentation blocks;
- host authority and replay command flow are unchanged.

## Retained

- 0.1.29 Mini Game + Job tile foundation;
- 0.1.28 rare CPU quirk and 2.5x NPC chat;
- Tactical Choice;
- 200 B$ economy;
- Turn Stakes leaderboard;
- Settings / BGM / SFX;
- face editor privacy behavior;
- node-by-node movement and parity routing.

## Regression

`npm run test:direct-dice`

Locks that the direct dice:
- appears for the local human during PRE_ROLL_ACTION;
- never appears for CPU seats;
- disappears during ROLLING and MOVING;
- never appears for a non-controlling client;
- never appears before match start or after match end.

No gameplay checksum change is expected because this milestone only changes presentation/input routing into the existing host-authoritative Roll command.

## Next

The next gameplay milestone can make Mini Game and Job playable once their exact rules are explicitly locked. Do not invent final rewards, penalties or Job mechanics from the 0.1.29 foundation alone.

## Hard constraints

- Dice display must never invent the authoritative roll result.
- No presentation RNG may perturb gameplay RNG.
- CPU remains QA-only.
- Do not merge PR #1 or mark it Ready without Ron explicitly asking.
