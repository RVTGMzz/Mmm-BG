# MVP 0.1.39 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.39 is a presentation-only final result clarity pass. It does not change gameplay RNG, match-end conditions, money, ranking, Mini Game rewards, Job rules, movement, authority, replay, snapshots, or approved audio assets.

## Final B$ lock transition

New runtime scene: `src/scenes/CareerMinigameBoardScene039.ts`.

The existing authoritative result overlay remains the source of winner/ranking truth. 0.1.39 only decorates the moment when that overlay becomes eligible to appear:

1. PresentationParity keeps the result overlay deferred while presentation is blocking.
2. Pending Mini Game payout must already be committed before the shell may end.
3. Once the real result overlay exists, 0.1.39 briefly hides it.
4. A centered banner announces `4/4 HOÀN THÀNH` and `KHÓA BẢNG B$ • CHỐT THỨ HẠNG`.
5. A temporary input blocker prevents invisible result buttons from being clicked during the short reveal beat.
6. The banner fades away and the existing authoritative result overlay fades in.

No winner or B$ value is recomputed by the transition.

## Presentation determinism

Spark positions are fixed constants. The transition does not call `Math.random`, gameplay RNG, `submitIntent`, or `submitSystemIntent`.

Victory SFX remains owned by the existing result-overlay hook and is not duplicated by 0.1.39.

## Visible build copy

Local Lobby, Setup and board labels advance to 0.1.39. The one-lap rule remains visible and the obsolete three-round end rule stays absent from those entry screens.

## Retained 0.1.38 / 0.1.37 behavior

- Choice SFX coverage remains on Route/Card/Target/Tactical/Setup/Settings and previously covered actions.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị pays `30 / 20 / 10 / 0 B$`.
- Direct RPS pays `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Eight supplied SFX remain checksum-verified.
- P1 movement/Job token fixes remain unchanged.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Regression

New `tests/final-result-transition-039.ts` checks that the final transition:

- is ended-state only;
- respects an empty/deferred result overlay;
- decorates the existing result overlay;
- includes an input blocker;
- uses authoritative lap progress;
- submits no gameplay commands;
- uses no random presentation generation;
- does not mutate wallet state;
- is the scene wired by `src/main.ts`;
- retains the PresentationParity defer gate in its inheritance chain.

Final artifact metadata will be added only after full CI/package validation is green.
