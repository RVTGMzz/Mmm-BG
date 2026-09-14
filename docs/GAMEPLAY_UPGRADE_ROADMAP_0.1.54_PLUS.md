# MeMeMe Gameplay Upgrade Roadmap — 0.1.54+

Status: **approved working roadmap**.

This roadmap defines the transition from the Draft D sandbox into the standard `START_PLAYTEST.bat` gameplay flow.

## 0.1.54 — Close the sandbox loop

Purpose: make Draft D fast to QA without pretending it is the main game.

- `START_DRAFT_D_PREVIEW.bat` remains a sandbox launcher.
- Preview branch mode defaults to **AUTO**.
- AUTO branch uses deterministic RNG derived from the preview seed.
- Same seed reproduces the same branch-choice sequence.
- A fixed HUD toggle switches **AUTO / MANUAL**.
- MANUAL preserves the real `RẼ TRÁI / RẼ PHẢI` chooser.
- `START_DRAFT_D_FULL_MAP.bat` remains topology review only.
- `START_FINAL_MAP_PREVIEW.bat` is legacy and must not ship in tester packages.
- `START_PLAYTEST.bat` remains the standard gameplay launcher and the final integration target.

No authoritative gameplay migration happens in 0.1.54.

## 0.1.55 — Integrate Draft D into standard gameplay

Purpose: move the approved map/topology into the real HOST-authoritative match flow behind `START_PLAYTEST.bat`.

Required invariants:

- keep the 0.1.48 HOST-authoritative baseline;
- preserve replay/checksum determinism;
- preserve multiplayer spectator parity;
- preserve Roll For Order, Job Hub, Mini Game, salary, payout, audio and final-result logic;
- use Draft D 44-space topology and three forward-only decision junctions;
- real players choose **RẼ TRÁI / RẼ PHẢI**;
- route choice is an authoritative player intent resolved by HOST;
- no branch may create backward movement, cycles, dead ends or endless wandering.

Success gate:

`Roll For Order -> Job -> Draft D movement -> branch choice -> TIN TỨC/LÁ BÀI/Mini Game -> Jail/Hospital/Lottery -> READY lap -> final result`

must work without regressing 0.1.48 invariants.

## Jail / Hospital release rule — now locked

When a detained/hospitalized player starts their turn:

1. roll the release D6;
2. Jail releases on `1 / 3 / 5`;
3. Hospital releases on exactly `2 / 4 / 5`;
4. failed release ends that player's turn and they retry next turn;
5. successful release moves through the visible 3-space exit path;
6. after release, the player **continues the same turn with a fresh movement D6 roll**.

The release die itself is **not** reused as movement distance.

This rule is chosen to avoid punishing the player with an extra dead turn after they already succeeded at escaping/recovering.

## 0.1.56 — Give branches gameplay identity

Purpose: make left/right choices meaningful without creating an objectively best route.

Working direction:

- safe / lower-variance exposure;
- drama / higher event exposure;
- money / economy exposure;
- route identity should come from node content distribution, not hidden distance advantage;
- current baseline keeps equal movement length between split and merge.

## 0.1.57 — Complete Jail / Hospital / Lottery integration

- HOST-authoritative holding state;
- locked release-face rules;
- fresh movement roll after successful release;
- Lottery = `D6 × 20 B$`;
- TIN TỨC / LÁ BÀI can send valid targets to Jail/Hospital through explicit effects.

## 0.1.58 — Upgrade TIN TỨC / LÁ BÀI interaction

Build from `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`.

Target effect families include:

- money gain/loss/steal/transfer;
- move self/target;
- send target to Jail/Hospital;
- protection / reaction / counterplay where already supported by authoritative timing;
- global TIN TỨC events;
- held LÁ BÀI targeted play.

Do not revive old Tiên Tri / Phép Thuật labels.

## 0.1.59 — Function-space depth

- Job Hub identity and career consequences;
- Mini Game pacing and payouts;
- district/branch identity tied to Job, economy, events and party mechanics;
- keep Mini Game payout host-system owned and one-shot.

## 0.1.60 — Match pacing + economy playtest

Measure with the real integrated board before tuning:

- average turns per lap;
- real match duration;
- Jail/Hospital downtime;
- branch-choice frequency;
- TIN TỨC / LÁ BÀI frequency;
- Mini Game interruption frequency;
- B$ inflation/deflation;
- catch-up behavior.

Do not rebalance the economy from empty-map theory alone.

## Presentation comes after gameplay integration

Polish after the integrated loop is stable:

- close party-game camera;
- branch preview/highlight before choice;
- dice animation;
- token reactions;
- four-corner HUD polish;
- event/card presentation;
- final map art/landmarks.

The combined visual reference remains:

`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Its AI text/numbering is non-authoritative.
