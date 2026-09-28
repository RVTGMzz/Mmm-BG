# MMM — 2026-09-28 — 0.1.71.3 M35 CẮT TOP XÚC XẮC

## Status
**SOURCE + CORE LOGIC + FULL CI + BROWSER VISUAL GATE + PUBLIC PAGES: PASS**

- gameplay source: `6a0d7108b7cb9cdbde9f9859f0d23cac3b27de6d`
- final validated/runtime source: `e62d0de4928f3f117518cc4b350cd585c4b60a69`
- CI #3332 / run `36396119982`: **SUCCESS**, all gates green
- runtime evidence artifact: `10958555873`
- public mirror: `1bfed8711f0e72212cecc082d893fc51d18a3b82`
- Pages #66: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## Gameplay upgrade
M35 — **TOP 2 HOẶC VỀ KHÔNG** now uses **CẮT TOP XÚC XẮC** for 3+ eligible players.

### CẮT TOP XÚC XẮC
1. every active contestant rolls a deterministic D6;
2. the two highest scores occupy the two Top slots;
3. any player below the cutoff is eliminated immediately;
4. if a score tie crosses the Top-2 cutoff, only that tied group rerolls for the remaining slot(s);
5. players already clearly above the cutoff keep their Top slot and never reroll;
6. once exactly two finalists are known, the existing OẲN TÙ XÌ final decides rank 1/2.

The mechanic is intentionally luck-forward. There is no hidden strategy input and no Player-ID tiebreak.

## Cutoff fairness examples
- `6 / 5 / 4 / 2` → 6 and 5 advance directly.
- `6 / 5 / 5 / 2` → 6 locks one seat; the two 5s reroll for the second.
- `5 / 5 / 5 / 2` → the 2 is eliminated; the three 5s reroll for two seats.
- `4 / 4 / 4 / 4` → all four reroll; nobody is arbitrarily eliminated.

Core resolver:
- `resolveCutTopDiceRound()` in `src/core/minigames.ts`.

## Economy / authority guard
M35 keeps the tuned payout profile:
- #1 +30 B$
- #2 +20 B$
- #3 0 B$
- #4 0 B$

Total payout remains 50 B$. Wallet mutation remains owned by HOST-system `resolve_minigame`.

## Runtime presentation
The first implementation rendered four D6 results as four separate rows and could trigger unnecessary scrolling. Runtime screenshot review caught that before final acceptance.

Final presentation:
- contestant rolls are compacted into one wrapped line;
- Top holders and eliminated players are shown immediately underneath;
- normal 4-player results fit without mandatory scroll;
- tie-at-cutoff result uses the clear heading `HÒA Ở RANH TOP • ĐỔ LẠI`.

Browser runtime fixture:
- `surface=topdice`
- 1280×800
- 960×540

Both final screenshots were manually reviewed and show full-contrast, readable content inside the canonical Mini Game shell.

## Current 3+ arena identities
- M09 PHỐ ĐÔNG NGƯỜI → `majority_minority`
- M17 KÈO ALL-IN → `three_doors`
- M26 CÒN THỞ CÒN TIỀN → `solo_buoy`
- M35 TOP 2 HOẶC VỀ KHÔNG → `cut_top_dice`
- M44 NƯỚC RÚT CUỐI VÒNG → `majority_minority`

Exactly two eligible players still fall back to `rps`.

## Preserve
Do not:
- use Player ID or seat order to break a dice tie;
- change M35 payout as part of mechanic iteration;
- introduce client `Math.random()`;
- reintroduce legacy Mini Game presentation writers;
- remove the common RPS final for exactly two finalists.

## Next safe gameplay direction
M44 is now the last arena still sharing the original majority/minority mechanic besides M09. It can receive the next distinct mechanic while retaining its 25/15/5/5 payout profile.
