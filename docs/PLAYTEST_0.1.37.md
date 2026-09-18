# MeMeMe MVP 0.1.37 Playtest Guide

## Primary target: Mini Game payout ownership

Run at least one Mini Game in each practical mode you can reach.

Expected behavior:

1. Mini Game plays normally and reaches a complete ranking.
2. Reward screen shows the configured B$ values.
3. Wallet/leaderboard updates exactly once after the result.
4. There must be no second money jump a moment later.
5. Turn flow continues after the payout.
6. If the final required lap finishes on the Mini Game tile, final match result waits for this payout before scoring.

### Reward tables

- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì: `25 / 15 / 5 / 0 B$`.

The current 4-player Nhiều ra ít bị flow still switches to RPS for the last 1v1, but the overall tournament remains a Nhiều ra ít bị payout table.

## Two-tab check

With HOST + JOIN running:

- a client-controlled seat may participate in the Mini Game presentation;
- payout ownership still belongs to the host system;
- the client should receive the resulting authoritative B$ state;
- no client/seat `resolve_minigame` receipt should be needed for the payout;
- snapshot/state parity must remain stable after the reward.

## Retained 0.1.36 audio smoke test

Confirm these still play in the correct context:

- victory at real match result;
- news on News;
- card on Card draw/receive;
- step on every movement step;
- money loss/gain on authoritative wallet deltas;
- dice on normal dice and Roll For Order;
- choice on UI/picker confirmation.

Mini Game BGM must be `03_City_Silly.ogg` and must return to the previous board BGM afterward.

## Retained movement / Job checks

- P1 must not snap backward after Card/News/state packets.
- Job Hub must not leave the human token visually one node behind.
- Snapshot/rematch may still hard-snap to the authoritative node.
- Job D6 remains `1–2 → A`, `3–4 → B`, `5–6 → C`.

## End rule

The match still ends only after all players complete at least one full physical lap. Old 3-round / 12-turn metadata does not end the game.

Do not add or infer jail skipped-turn/bail/escape rules in this build.
