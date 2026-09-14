# MVP 0.1.46 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.46 polishes Job Hub for the two-tab local multiplayer prototype. It does not change Job rules, gameplay RNG semantics, money, movement, one-lap scoring, Mini Game rewards, final result rules, approved BGM/SFX assets, or Jail mechanics.

## Multiplayer Job Hub

New runtime wrapper: `src/scenes/CareerMinigameBoardScene046.ts`.

New/extended Job Hub UI: `src/ui/JobChoicePicker.ts`.

Behavior:

- controlling peer keeps the existing interactive Job Hub flow;
- non-controlling network peers now see the same authoritative three-job A/B/C offer as spectators;
- spectator overlay cannot submit gameplay input;
- client still sends only `choose_job` with no chosen Job/result data;
- host authority alone consumes gameplay RNG and resolves Job D6;
- existing `job_dice_roll` authoritative event drives the shared dice animation on host/client;
- existing `job_selected` event carries Job title and Lv.1 salary to both peers;
- spectator overlay closes when the authoritative state exits `JOB_CHOICE`.

## Authority boundary

No new gameplay protocol is introduced. 0.1.46 deliberately reuses the existing validated `choose_job` client intent and TwoTab seat ownership rules.

A malicious/buggy client may attach fields such as `jobId`, `result`, or `offerIndex`, but `buildJobChoiceData()` still returns empty command data. The replay layer generates the D6 from host authoritative gameplay RNG and maps it through the fixed `1–2 A / 3–4 B / 5–6 C` rule.

## Regression

New `tests/job-hub-multiplayer-046.ts` validates:

- remote P2 owns the current seat;
- remote P2 reaches mandatory Job Hub and receives exactly three offers;
- forged client Job/result fields are discarded;
- host authoritative D6 selects the expected A/B/C Job;
- host/client states contain the same Job D6 and assigned Job;
- shared presentation ends on the authoritative Job D6;
- Job result presentation includes the assigned Job and Lv.1 salary;
- non-controller peers use spectator-only Job Hub UI;
- Job picker does not call `Math.random` or `rollD6`;
- runtime/Lobby/Setup identify 0.1.46.

## Retained behavior

- 0.1.45 Remote Roll For Order remains host-authoritative.
- Mandatory Job Hub stop remains unchanged.
- Starting wallet remains `200 B$`.
- One-lap scoring and READY salary remain unchanged.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị remains `30 / 20 / 10 / 0 B$`.
- Direct RPS remains `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain untouched.
- Final podium/result-input chain remains unchanged.
- Original face files remain local.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

Final artifact metadata will be added only after full CI/package validation is green.
