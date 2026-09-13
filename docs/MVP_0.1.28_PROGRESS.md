# MeMeMe MVP 0.1.28 — NPC Banter & Longer Side Chat

Status: ACTIVE / PLAYTEST PACKAGED

## Goal

Give CPU seats a little imperfection and personality without adding gameplay RNG or cluttering the center of the board.

## Rare CPU quirk

The QA bot now has a low-frequency deterministic quirk on Card decisions.

- schedule is derived from existing turn / seat / Card identity;
- nominal frequency is about 1 in 20 CPU Card decisions;
- no MatchState RNG call is consumed;
- quirk copy appears in the existing left/right side-chat system;
- sample copy includes `Ấy chết, bấm trượt tay 😭` and similar lines.

For `Kèo Hai Cửa`, a quirk hit can intentionally choose the opposite of the normally better deterministic option, so the mistake is occasionally real rather than cosmetic-only.

## NPC chat dwell

CPU/NPC reaction bubbles now keep their existing left/right placement but stay visible for **2.5×** their previous duration.

Human/hotseat reaction durations are unchanged.

The existing presentation queue still owns event completion, so longer NPC bubbles do not get left behind after the event has already advanced.

Dedicated 4-CPU autoplay remains a fast QA stress mode through the existing presentation timing policy.

## Retained

- Tactical Choice Card from 0.1.27;
- 200 B$ opening economy and 0.1.25 scaling;
- Turn Stakes leaderboard and wallet deltas;
- node-by-node movement and automatic odd/even routing;
- Settings, BGM/SFX, face editor/compression;
- host authority / deterministic replay / snapshot rules.

## Regression

The existing Tactical Choice regression now also locks:
- deterministic CPU quirk fixture;
- quirk does not consume gameplay RNG;
- tactical mistake can flip the normally optimal choice;
- NPC chat multiplier is exactly 2.5×;
- human chat timing remains unchanged.

## Validated artifact

GitHub Actions run:

`34766302140` / run `#717`

Head SHA:

`966cb4b8bf6ae4ca69460ecfd1ea84ae0edbedef`

Artifact:

`mememe-playtest-0.1.28`

Artifact digest:

`sha256:f9cc30d9928edf2bab1068b527e698c8bb8ee7ddb268f84809bb6230dacf21f6`

Artifact size: ~8.51 MB.

CI passed through artifact upload, including Tactical Choice + NPC Banter, replay, authority, 2-tab and CPU autoplay.

## Next planned milestones

### MVP 0.1.29 — Mini Game + Job Tile Foundation

Build the technical foundation for the two new function-tile families:
- tile types / content schema;
- board rendering identity;
- deterministic resolution entry points;
- presentation hooks;
- CPU-safe fallback behavior;
- replay / authority regression.

Do not invent a final Mini Game or Job ruleset yet if the exact design has not been explicitly locked.

### MVP 0.1.30 — First Playable Mini Game + First Job

After the foundation is stable, implement one real Mini Game and one real Job loop for end-to-end playtesting.

## Hard constraints

- No presentation RNG may perturb gameplay RNG.
- CPU remains a QA bot, not final gameplay AI.
- Side chat must stay off-center and non-invasive.
- Snapshot resync must not replay stale presentation.
- Do not merge PR #1 or mark it Ready without Ron explicitly asking.
