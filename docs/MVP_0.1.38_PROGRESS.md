# MVP 0.1.38 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

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

`tests/choice-sfx-038.ts` locks choice SFX coverage on the primary confirmation surfaces and asserts Setup/Lobby do not reintroduce obsolete three-round copy.

## Validated artifact

GitHub Actions run: `34801348509` / run `#1107`

Validated runtime/package SHA:
`f1e5ffc7f3f3cb4ed5e7ee6f12819215c0bd8265`

Artifact:
`mememe-playtest-0.1.38`

Artifact ID:
`10331532723`

Size:
`8,557,943 bytes`

Digest:
`sha256:04ffc83d71c54a22f27b846ba4fa2a62c70e545536c0c6d69bc7b653becf1947`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34801348509`

Full CI passed through artifact upload, including build/typecheck, deterministic replay, lockstep, host/client resync, authority, two-tab core, demo shell/rematch, CPU autoplay, presentation/board regressions, Settings/audio, economy/stakes/tactical/function tiles/direct dice, Job/Mini Game payout, Mini Game host-system ownership, the new choice-SFX/copy regression, image bounds, package verification, guide copy, and artifact upload.
