# MVP 0.1.24 — Party Mechanics

Status: **ACTIVE / BUILDING**

## Goal

Add the first genuinely new deterministic gameplay mechanics on top of the stabilized 0.1.23 presentation/route flow.

## New Card mechanic: Thuế Top 1

`ACT_015`

- rarity: R
- weight: 75
- automatically resolves the opponent with the highest current B$;
- ties resolve by lower player/seat ID;
- transfers 18% of that opponent's current B$ to the caster;
- no target picker;
- no extra RNG call.

The resolver uses `pickRichestOtherTarget()` in `src/core/cards.ts`.

## New Card mechanic: Phao Cứu Sinh

`ACT_016`

- rarity: SR
- weight: 30
- if caster is tied for lowest current B$: +140B$;
- otherwise: +20B$;
- self-targeted and deterministic;
- intended as a comeback mechanic instead of another attack clone.

## New News mechanic: Cân Bằng B$

`NEWS_DEMO_009`

- rarity: SR
- weight: 50
- sets the landing player's B$ to the floor of the current table average;
- can therefore help a trailing player or reduce a leading player;
- reaction-neutral for now so dialogue never claims the outcome is always positive or always negative.

## Probability totals

Card totals stay at 1000:
- N 600
- R 300
- SR 90
- SSR 10

News totals stay at 1000:
- +60 self: 600
- -80 self: 300
- -40 all players: 50
- normalize-to-average self: 50

## Regression

New command:

`npm run test:party`

Locks:
- richest-opponent deterministic tie-break;
- exact 18% transfer math;
- comeback full/base branch;
- average News raises a low player to average;
- average News lowers a high player to average.

Existing replay/authority/lockstep/content/presentation/image/package tests remain active.

## Invariants

- no new gameplay RNG calls;
- no new command type;
- no target picker for automatic mechanics;
- host/replay remain the source of truth;
- no approved BGM changes;
- do not merge PR #1 or mark Ready without Ron explicitly asking.
