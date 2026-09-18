# MVP 0.1.36 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

MVP 0.1.36 groups three player-facing improvements without changing the locked core board rules:

1. Event-driven SFX.
2. Roll For Order dice presentation.
3. Authoritative Mini Game payout.

## Event audio

The SFX controller now owns user-supplied event assets under `public/audio/sfx/`:

- `victory.ogg`
- `news.ogg`
- `card.ogg`
- `step.ogg`
- `money_loss.ogg`
- `money_gain.ogg`
- `dice.ogg`
- `choice.ogg`

The corrected gain-money source is the later `+ money(1).MP3`, not the earlier file that duplicated the loss cue.

Presentation rules:

- movement step cue is bound to queued authoritative `move_step` presentation;
- money cues are inferred from authoritative wallet deltas;
- victory waits for the real result overlay instead of shell end alone;
- dice cue follows authoritative dice presentations;
- News/Card cues follow their event presentations;
- choice cue remains UI/picker feedback and never affects gameplay RNG.

## BGM correction

Mini Games reuse the existing approved `03_City_Silly.ogg`.

There is no fifth BGM in the runtime catalog. `track 1.MP3` is not used. The four approved BGM files stay checksum-locked and are not re-encoded or substituted.

## Roll For Order presentation

The pregame ceremony presents each player's D6 result sequentially, including CPU seats. Tied players are the only seats rerolled. The authoritative order rule itself remains unchanged and `playOrder` remains gameplay-checksummed.

## Mini Game payout

New helper: `src/core/minigameRewards.ts`.

Reward tables:

- `majority_minority`: 30 / 20 / 10 / 0 B$.
- `rps`: 25 / 15 / 5 / 0 B$.

The current 3+/4-player Mini Game flow is classified as `majority_minority` even though its last two survivors finish with RPS. Therefore its final ranking pays 30/20/10/0.

New gameplay command/intention:

`resolve_minigame`

Flow:

1. Presentation overlay produces `gameType` + complete ranking.
2. Controlling peer submits the result to host authority.
3. Host validates that every player appears exactly once and that the game type is recognized.
4. Replay applies the deterministic reward table.
5. Replay emits `minigame_reward` wallet events and `minigame_resolved`.
6. B$ changes naturally enter checksum/snapshot/state sync through player money.

The payout command itself consumes no gameplay RNG.

## End-of-match safety

`shouldEndDemoMatch()` now also checks for unresolved Mini Game presentation/economy state. If the final lap completion occurs on a Mini Game landing, final B$ scoring waits until `minigame_resolved` exists after that Mini Game event.

This prevents the result overlay from freezing standings before the Mini Game reward is added.

## Retained fixes and rules

- Normal state packets cannot steal token-coordinate ownership from queued movement presentation.
- Snapshot/rematch may still hard-snap to authoritative nodes.
- Human Job Hub has explicit token reconcile so Player 1 does not remain visually one node behind.
- Match end is still all players completing one physical lap, not the old 3-round/12-turn shell metadata.
- Salary is still paid when crossing READY.
- Jail deep mechanics remain intentionally undefined.
- CPU remains a QA bot.
- PR #1 must remain unmerged.

## CI/package work

Package verifier now requires all 8 event SFX to exist in `dist/audio/sfx/` and checks they are non-empty. Existing SHA256 verification for the four approved BGM files remains intact.

Final artifact metadata will be written here only after the 0.1.36 packaging workflow is green.
