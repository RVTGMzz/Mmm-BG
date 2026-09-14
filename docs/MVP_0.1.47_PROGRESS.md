# MVP 0.1.47 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.47 audits multiplayer presentation parity and restores the old deck language supplied as visual reference:

- old vertical prophecy cards become **TIÊN TRI** and replace visible **Tin Tức** terminology;
- old horizontal magic cards become **PHÉP THUẬT** and replace visible **Lá Bài / Thẻ Bài** terminology.

This is a presentation/UI change only. Technical protocol/event names remain `news`, `card_draw`, `card_play`, `play_card`, etc. Replay, checksum, host authority and saved command compatibility are intentionally untouched.

## Legacy deck presentation contract

New pure helper: `src/ui/legacyDeckPresentation.ts`.

- `news` -> family `prophecy` -> form `portrait`.
- `card_draw`, `card_play`, `card_blocked` -> family `spell` -> form `landscape`.
- visible copy is translated to Tiên Tri / Phép Thuật without renaming technical events.
- presentation fingerprint is deterministic and contains eventSeq, kind, visible copy, actors, targets, affected players, roll/money and reaction identity.

## Runtime

New wrapper: `src/scenes/CareerMinigameBoardScene047.ts`, extends validated 0.1.46.

- recursively rewrites visible board/presentation copy only;
- board `TIN TỨC` becomes `TIÊN TRI`;
- board/HUD `LÁ BÀI` becomes `PHÉP THUẬT`;
- News cinematic keeps the same authoritative model/timing/reactions but is reshaped into a portrait Tiên Tri card;
- Phép Thuật keeps the existing horizontal cinematic treatment;
- `CardHandPicker` now displays the hand as horizontal Phép Thuật cards;
- no gameplay/system intent, wallet mutation, authority change or new RNG is introduced.

## Multiplayer parity audit

New regression: `tests/multiplayer-presentation-parity-047.ts`.

It verifies:

- one authoritative event stream derives the same visible presentation fingerprint in HOST and CLIENT modes;
- Tiên Tri is portrait and Phép Thuật is landscape;
- technical `news` / `card_*` event names remain unchanged;
- snapshot resync is still excluded from presentation enqueue;
- normal network state only enqueues eventSeq values newer than the local presentation cursor;
- 0.1.47 extends the complete 0.1.46 runtime chain;
- presentation wrapper does not submit gameplay/system intents or use random presentation values;
- entry surfaces identify 0.1.47.

## Retained invariants

- Remote Roll For Order remains host-authoritative.
- Multiplayer Job Hub remains host-authoritative.
- Mandatory Job Hub rule and Job D6 `1-2 A / 3-4 B / 5-6 C` remain unchanged.
- Starting wallet remains `200 B$`.
- One-lap scoring and READY salary remain unchanged.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị remains `30 / 20 / 10 / 0 B$`.
- Direct RPS remains `25 / 15 / 5 / 0 B$`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Final result/podium chain remains unchanged.
- Original face files remain local.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

The supplied reference images are treated as visual direction only and are not persisted into the repository as runtime assets in this milestone.

Final artifact metadata will be added only after full CI/package validation is green.
