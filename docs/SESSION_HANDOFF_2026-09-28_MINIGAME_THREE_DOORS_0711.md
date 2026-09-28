# MMM — 2026-09-28 — 0.1.71.1 M17 BA CỬA Mini Game

## Status
**SOURCE + CORE LOGIC + FULL CI + BROWSER VISUAL GATE + PUBLIC PAGES: PASS**

- gameplay source: `74507ed8a067a52cf451285bc7add0a9be9741a7`
- runtime visual test HEAD: `bad77d6b00fba46019ddfc66e35e80d4eee661b1`
- CI #3327 / run `36382169904`: **SUCCESS**, all gates green
- runtime evidence artifact: `10953610573`
- public mirror: `c283a1ddcf283953eef173c0467190cba516a2b5`
- Pages #63: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## Gameplay upgrade
M17 — **KÈO ALL-IN** now has a distinct 3+ player mechanic instead of sharing NHIỀU RA ÍT BỊ with every arena.

### BA CỬA
1. each active player secretly picks **Cửa A / B / C**;
2. deterministic arena D6 resolves:
   - 1–2 = A
   - 3–4 = B
   - 5–6 = C
3. players on the winning door survive;
4. players on other doors are eliminated;
5. if nobody picked the winning door, replay;
6. if everybody picked the winning door, replay;
7. when exactly two remain, the existing OẲN TÙ XÌ final still decides rank 1/2.

The rule is implemented as a pure resolver in `src/core/minigames.ts`. No `Math.random()` was introduced.

## Economy / authority guard
M17 keeps its existing tuned payout profile:
- #1 +35 B$
- #2 +10 B$
- #3 +5 B$
- #4 0 B$

Total 3+/4-player payout remains 50 B$, so this feature changes **how players earn rank**, not economy scale.

The existing HOST-system `resolve_minigame` payout path remains the only wallet mutation owner.

## Data-driven arena identity
`MiniGameSlot059` now carries `mode3Plus`.
- M17 = `three_doors`
- M09/M26/M35/M44 remain `majority_minority`
- any 2-player Mini Game still becomes `rps`

This allows future arenas to gain distinct mechanics without branching on board-node IDs inside presentation code.

## Validation
New gate:
- `tests/minigame-three-doors-0711.ts`

Covers:
- exact D6→door mapping;
- survivor/elimination logic;
- nobody-hit/everybody-hit replay cases;
- 2-player RPS fallback;
- M17 data mapping;
- reward-type parsing;
- HOST payout acceptance;
- no presentation RNG.

Browser runtime gate also renders **surface=doors** at:
- 1280×800
- 960×540

and verifies:
- exactly three cards;
- CỬA A/B/C labels;
- no shell overflow;
- retained Mini Game spacing/readability.

## Preserve
Do not:
- reintroduce legacy UI presentation writers;
- change M17 payout in this mechanic pass;
- activate Character passives as part of Mini Game variety;
- use client `Math.random()`;
- change the 2-player RPS final.

## Next safe gameplay direction
Continue **Mini Game variety** one arena at a time, preserving total payout/economy. M26 or M35 can receive the next distinct rule after Ron has a chance to see BA CỬA in play.
