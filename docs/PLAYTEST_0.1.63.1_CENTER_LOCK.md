# MeMeMe 0.1.63.1 — Active Player Center Lock

Presentation-only hotfix based on direct human playtest feedback.

## What changed

- The player whose turn is active must stay at the exact center of the gameplay camera while moving.
- Camera no longer trails behind the token with low lerp.
- Camera bounds are expanded so edge-of-board spaces can still be centered.
- `TỔNG QUAN` / `O` remains the only intentional exception to active-player center lock.

## Inherited unchanged

- 0.1.63 larger event/chat UI.
- 0.1.63 smaller player tokens.
- 0.1.63 larger round spaces.
- 0.1.62 HOST branch rule: odd = LEFT, even = RIGHT.
- Economy, Job, Mini Game, Jail/Hospital, Lottery, TIN TỨC / LÁ BÀI and finish rules.
- No new gameplay RNG or client gameplay intent.

## Manual checks

1. Roll a long movement result and watch the token through every step.
2. Confirm the active token stays centered instead of running toward or outside the viewport edge.
3. Confirm camera motion still feels smooth because it follows the token's tweened position.
4. Test movement near every board edge and corner.
5. Press `TỔNG QUAN` / `O`, then return to the turn and confirm center lock resumes immediately.
6. Keep watching for long-run token snap-back.
