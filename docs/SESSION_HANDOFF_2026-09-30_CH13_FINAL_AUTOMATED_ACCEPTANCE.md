# CH-13 Final Automated Acceptance — 2026-09-30

## Result

**PASS for automated/browser runtime evidence.**

Validated checkpoint:
- source/test commit: `a83c499bd62a850839533206188a77538e23c15b`
- CI #3383 / run `36670769258`: SUCCESS
- runtime UI evidence artifact: `11078141883`
- RC package artifact: `11078137006`
- public compiled mirror: unchanged at `8617f61536e75db039cf69e918ccfc741c3137cd`
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## New acceptance proof

A dedicated Character Select browser fixture was added:
- `tests/runtime/character-select-ui.ts`
- `tests/runtime/character-select-ui.html`
- `tests/runtime/character-select-ui.mjs`

The CI browser stage now runs this fixture alongside the existing scroll/full-scene/mobile runtime checks.

The fixture:
1. boots the live `SetupScene` in 1P + 3CPU mode;
2. enters the real Character Select through the normal Continue button;
3. asserts exactly five visible choices: four starters + RANDOM;
4. checks the Character Select root keeps the Vietnamese-safe system font stack and does not regress to Arial Rounded;
5. rejects panel or card overflow;
6. rejects typography shrinking below the current readable floor;
7. captures `character-select-1280x800.png` and `character-select-960x540.png`.

Both screenshots were manually inspected after CI. The five-card layout is contained and readable at both target sizes.

## Existing CH-13 evidence re-reviewed

From the same runtime artifact:
- Card 1280x800 / 960x540: contained, rarity N absent, impact and footer aligned.
- News 1280x800 / 960x540: contained and readable.
- Job detail 1280x800 / 960x540: compact salary-only view remains stable.
- Mini Game rules 1280x800 / 960x540: one-time rules screen readable.
- Rules -> BA CỬA gameplay 1280x800 / 960x540: rules body removed; exactly three choices remain.
- PHỔ ĐÔNG NGƯỜI result 1280x800 / 960x540: compact result layout remains contained.
- Ranking evidence remains readable.

## Safety

This pass is test/evidence-only:
- no gameplay RNG changes;
- no money/economy changes;
- no Character probability changes;
- no Mini Game payout changes;
- no online Worker/reconnect changes;
- no compiled public gameplay output changes.

## Remaining acceptance

Physical Steam Deck / real-device play remains the only unresolved CH-13 acceptance item.

Do not label physical Runtime PASS until Ron verifies the public build on-device. Any future screenshot regression should be fixed at the shared owner/layout rule and guarded by a regression test rather than patched only for one content string.
