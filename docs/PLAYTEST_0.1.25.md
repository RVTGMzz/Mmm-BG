# MeMeMe MVP 0.1.25 — Economy Pressure & Recovery

## Focus

This build keeps the 200 B$ starting wallet from the latest 0.1.24 hotfix and rescales the old 1000 B$ economy around it.

## Economy scale

Starting money:
- 200 B$

Money tiles:
- +25 B$
- -20 B$
- +50 B$
- +15 B$

News:
- positive self News: +30 B$
- negative self News: -40 B$
- group loss News: -20 B$ each
- Cân Bằng B$: unchanged, still normalizes the landing player to the current table average

Cards:
- Phao Cứu Sinh: +60 B$ when tied for lowest, otherwise +15 B$
- 10 B$ steal Cards remain unchanged
- Thuế Top 1 remains 18%
- 30% group-loss Cards remain percentage-based
- money swap remains unchanged

READY pass:
- stays +100 B$ intentionally as the strong predictable recovery anchor for completing a lap

## What to feel-test

1. 200 B$ should feel meaningfully tighter than the old 1000 B$ start.
2. A single ordinary News or money tile should matter without deciding the whole match by itself.
3. READY +100 B$ should make completing a lap exciting and give trailing players a recovery route.
4. Phao Cứu Sinh should help the bottom player without instantly catapulting them to first.
5. Thuế Top 1 / 30% loss / money swap should remain the big swing moments.
6. Check that no presentation/reaction queue regresses while economy values change.

## Invariants

- no extra gameplay RNG
- no new command types
- Card/News drop weights unchanged
- BGM assets unchanged
- presentation timing unchanged
- PR #1 stays unmerged / not Ready unless Ron explicitly asks
