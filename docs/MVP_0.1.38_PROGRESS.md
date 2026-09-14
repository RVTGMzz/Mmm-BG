# MVP 0.1.38 Progress

Status: **ACTIVE / CI VALIDATION IN PROGRESS**

## Scope

0.1.38 is presentation polish only. It does not change gameplay RNG, board rules, Job rules, Mini Game rewards, one-lap scoring, money authority, networking authority, or approved BGM assets.

## Choice SFX coverage

The supplied `choice.ogg` / `ui_confirm` cue now covers the main confirmation surfaces that were still silent:

- Route / Branch picker.
- Card hand picker, including keeping the card.
- Target picker.
- Tactical Choice / Kèo Hai Cửa picker.
- Setup → Roll For Order confirmation.
- Settings open/close and BGM toggle.

Already-covered confirmations remain unchanged:

- Local Lobby buttons.
- Job Dice confirmation.
- Mini Game human choices.
- Enter-match confirmation after Roll For Order.

The dice action itself continues to use `dice.ogg`, not `choice.ogg`.

## Legacy visible copy cleanup

Setup and Local Lobby no longer advertise the obsolete `MVP 0.1.31` / `demo 3 vòng` rule.

Current visible rule is the authoritative one-lap rule:

- each player completes at least one physical lap;
- only after all players are complete may the B$ result finalize;
- a pending Mini Game payout must resolve before final score.

The old compatibility shell fields may remain serialized internally but are not the active end rule.

## Retained 0.1.37 / 0.1.36 behavior

- Mini Game payout remains host-system owned and applies once only.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Eight supplied SFX remain packaged and checksum-verified.
- Roll For Order still animates every participant including CPU.
- P1 movement/Job token fixes remain unchanged.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Regression

New `tests/choice-sfx-038.ts` locks choice SFX coverage on the primary confirmation surfaces and asserts Setup/Lobby do not reintroduce obsolete three-round copy.

Final artifact metadata will be added after full CI/package validation is green.
