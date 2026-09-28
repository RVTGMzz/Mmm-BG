# MMM — 2026-09-28 — 0.1.71.2 M26 PHAO ĐƠN Mini Game

## Status
**SOURCE + CORE LOGIC + FULL CI + BROWSER VISUAL GATE + PUBLIC PAGES: PASS**

- gameplay source: `a185d89760601b93a2ae7e75378cf1b58d282584`
- validated/runtime test HEAD: `f3d9bbefca5d42072170b13b4675e49cb3f3c3f3`
- CI #3329 / run `36391540666`: **SUCCESS**, all gates green
- runtime evidence artifact: `10956448915`
- public mirror: `8a9cef685e515d9d8e83042de8afd0ab7a5f2a01`
- Pages #64: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## Gameplay upgrade
M26 — **CÒN THỞ CÒN TIỀN** now uses a distinct 3+ player mechanic: **PHAO ĐƠN**.

### PHAO ĐƠN
1. each active player secretly chooses **Phao 1 / Phao 2 / Phao 3**;
2. a buoy floats only when exactly one player chose it;
3. players standing alone on a buoy survive;
4. players sharing a crowded buoy are eliminated;
5. if nobody survives, replay;
6. if nobody is eliminated, replay;
7. when exactly two players remain, the existing OẲN TÙ XÌ final decides rank 1/2.

This mechanic uses no arena random roll. The strategic information is the simultaneous hidden choice itself.

## Economy / authority guard
M26 retains the tuned payout profile:
- #1 +20 B$
- #2 +15 B$
- #3 +10 B$
- #4 +5 B$

Total payout stays 50 B$. Wallet mutation remains owned by the existing HOST-system `resolve_minigame` path.

## Data-driven arena modes
Current 3+ player modes:
- M09 PHỐ ĐÔNG NGƯỜI → `majority_minority`
- M17 KÈO ALL-IN → `three_doors`
- M26 CÒN THỞ CÒN TIỀN → `solo_buoy`
- M35 TOP 2 HOẶC VỀ KHÔNG → `majority_minority`
- M44 NƯỚC RÚT CUỐI VÒNG → `majority_minority`

Any arena with exactly two eligible players still falls back to `rps`.

## Validation
New core gate:
- `tests/minigame-solo-buoy-0712.ts`

It verifies:
- two unique buoys survive;
- one unique buoy can create an immediate finalist/winner state;
- 2+2 crowding replays;
- 1/1/1 all-unique with three players replays;
- exact M26 payout profile;
- HOST payout acceptance;
- no `Math.random()`.

The earlier M17 gate was also upgraded to assert the full per-arena mode map instead of incorrectly assuming every non-M17 arena remains majority/minority.

Browser runtime fixture:
- `surface=buoys`
- 1280×800
- 960×540

Both screenshots were manually reviewed after CI. PHAO 1/2/3 stay inside the canonical Mini Game shell with readable text and retained privacy-rail spacing.

## Preserve
Do not:
- change M26 payouts as part of mechanic iteration;
- turn PHAO ĐƠN into a client-RNG feature;
- reintroduce legacy Mini Game layout writers;
- activate Character passives in this feature;
- remove the common RPS final for exactly two players.

## Next safe gameplay direction
M35 can receive the next distinct mechanic while retaining its 30/20/0/0 payout profile. Keep each arena mechanic data-driven and add both core and browser-runtime gates before public acceptance.
