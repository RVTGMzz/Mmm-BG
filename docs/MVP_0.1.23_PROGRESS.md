# MVP 0.1.23 — Reaction & Route Personality

Status: **ACTIVE / BUILDING**

## Goal

Make the existing content feel more authored without changing gameplay rules: Card reactions should match the actual effect being used, and automatic odd/even branch routing should be visible without introducing another blocking prompt.

## Effect-specific Card reactions

New content file:

`src/content/core/card_reactions_023.json`

Card play presentation now maps the Card effect type to a dedicated reaction script:
- `steal_money` → `CARD_STEAL_023`
- `block_cards` → `CARD_BLOCK_023`
- `percent_loss_all_others` → `CARD_GROUP_CURSE_023`
- `swap_money` → `CARD_SWAP_023`

The mapping lives in `src/ui/presentationModel.ts`, not MatchState/replay logic.

Reaction selection remains deterministic by speaker seat. No presentation RNG or gameplay RNG is added.

## Route feedback

New helper:

`src/ui/routeFeedback.ts`

When the existing parity rule automatically chooses a branch, the active board wrapper now shows a compact non-blocking banner for about one second, for example:

`↗ PHỐ CHÍNH • Player 1`
`Xúc xắc 5 • LẺ → tự động rẽ`

or:

`↘ HẺM TẮT • Player 1`
`Xúc xắc 4 • CHẴN → tự động rẽ`

The banner does not pause movement, does not require acknowledgement, and does not create a gameplay event. The host still submits the same authoritative `choose_branch` intent as before.

## Existing behavior retained

- Card/News/Tile presentation timing remains 3s/6s/10s policy from 0.1.19;
- movement still visits every intermediate node;
- pip dice remains authoritative;
- BGM/FX remain inside Settings;
- Menu BGM startup optimization remains;
- 11 Card / 8 News pool and named City tiles from 0.1.22 remain;
- result overlay still waits for unresolved presentation;
- CPU remains test-only.

## Regression

New command:

`npm run test:reaction-route`

It locks:
- each Card effect class maps to its intended 0.1.23 reaction event;
- reaction speaker roles remain deterministic;
- odd roll copy resolves to `LẺ`;
- even roll copy resolves to `CHẴN`;
- route labels remain explicit and automatic.

## Invariants

- no gameplay RNG changes;
- no MatchState/checksum schema changes;
- no extra branch choice prompt;
- route feedback never blocks the turn;
- no approved BGM changes;
- no PR merge / Ready state without Ron explicitly asking.
