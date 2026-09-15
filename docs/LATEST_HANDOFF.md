# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Keep visible names **TIN TỨC / LÁ BÀI**. Never regress HOST authority, deterministic replay, multiplayer ownership, stale-token protection, or READY/final-result flow.

## Current candidate

**MVP 0.1.63.3 — Presentation Sync + Release D6 Clarity**

Ron reported:
- destination effect/points could appear before the token visually reached the destination;
- CPU Jail release could look as if the successful release face was reused as normal movement.

Manual status: **PENDING RON ACCEPTANCE**.

## Runtime

`CareerMinigameBoardScene0633 as ActiveBoardScene`

Inheritance:
`0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## Root cause and fixes

### Movement/effect timing
Authoritative state legitimately arrives before queued visual movement completes. Two presentation paths exposed that future state too early:
- legacy Playtest state-delta toast;
- canonical HUD reading authoritative money/card values during dice/move presentation.

0.1.63.3 suppresses the early delta toast and holds canonical HUD refresh while `dice_roll`/`move_step` is still presenting.

Expected visible order:
`ROLL -> MOVE -> ARRIVE -> LANDING/EFFECT + HUD DELTA`

### Jail/Hospital release
Core authority was already correct and remains unchanged:
- release D6 only tests release;
- successful release clears the hold and sets `lastRoll = null`;
- phase returns to `PRE_ROLL_ACTION` in the same turn;
- a fresh D6 is required for normal movement.

0.1.63.3 now makes that explicit onscreen:
- `special_release` gets a visible panel saying the face is **CHỈ dùng để thoát** and a **D6 MỚI** follows;
- internal exit corridor nodes remain authoritative but no longer look like several normal board steps;
- one smooth return-to-gate motion represents release;
- same-turn direct-dice pending state is re-armed only after release presentation finishes, allowing exactly the fresh movement roll the core already requires.

Existing 0.1.57 fresh-D6 test remains green.

## Camera retained

0.1.63.2 movement-actor camera lock remains inherited:
- camera follows the actor still being visually animated even if turn state already advanced;
- rolls 5/6 should remain in frame;
- Overview/O stays the exception.

## Gameplay retained

No change to RNG/economy/content weights.

Branch rule remains:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT;
- HOST automatic, no manual picker.

0.1.62 deterministic gameplay sentinels remain:
- seed `611119`, checksum `9d83fad4`;
- seed `611113`, checksum `1074ba94`.

## Green code candidate before docs update

- HEAD `c8bd64b97df2e9293d8087400e981cc0e309e121`;
- push run `#2262` / `34967807791`;
- artifact `mememe-playtest-0.1.63.3-presentation-release-sync`;
- artifact ID `10395618561`;
- size `8,592,557 bytes`;
- SHA256 `21ae8582ae7de69a3f513ea2180ccb38cfc809300e388066bb084a58ba9984ad`;
- **63/63 meaningful CI steps PASS**.

## Manual check

Use `docs/PLAYTEST_0.1.63.3_PRESENTATION_RELEASE_SYNC.md`.

Verify especially:
- money/TIN TỨC/LÁ BÀI effect waits for visual arrival;
- long rolls stay camera-centered;
- successful Jail/Hospital release visibly uses one release-only D6, then a second fresh D6 before normal movement;
- failed release ends the turn while held;
- continue watching for long-run token snap-back.

Do not call 0.1.63.3 accepted until Ron confirms runtime behavior.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
