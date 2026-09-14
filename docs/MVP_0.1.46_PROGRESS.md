# MVP 0.1.46 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

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

The 0.1.45 Remote Roll regression was also made version-agnostic so it continues protecting Remote Roll authority without hardcoding the current Lobby/Setup/runtime build number.

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

## CI validation

First 0.1.46 CI run `#1365` failed only because the old 0.1.45 regression still required Lobby/Setup to display literal `0.1.45`. All gameplay and networking tests before that point were green. The test was corrected to own only its Remote Roll invariants.

Validated run: `#1367` / GitHub Actions run `34809081463`.

Validated runtime/package SHA:
`6d59583f8e1896fb2b0cbb12e438cc85b0b6fb7a`

Artifact:
`mememe-playtest-0.1.46`

Artifact ID:
`10334430551`

Artifact size:
`8,565,865 bytes`

Digest:
`sha256:2b7b66df3863721f12fd07ff56dc7a43ed55a5d4850af554b02f86f5f04a0bf4`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34809081463`

Full CI passed build/typecheck, deterministic replay, lockstep, two-tab authority, Remote Roll, the new Job Hub multiplayer regression, image bounds, package verifier, guide copy and artifact upload.
