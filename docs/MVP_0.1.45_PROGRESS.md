# MVP 0.1.45 Progress

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

## Scope

0.1.45 moves Roll For Order from host/local-only ceremony into the existing two-tab local prototype. It does not change gameplay RNG, match rules, money, Jobs, Mini Game rewards, board movement, final scoring, approved BGM/SFX assets, or Jail behavior.

## Remote Roll For Order

New pregame authority transport: `src/core/turnOrderSession.ts`.

HOST and JOIN use a dedicated BroadcastChannel before `DemoBoardScene` starts.

Flow:

1. HOST completes Setup and opens Roll For Order.
2. JOIN chooses P2/P3/P4 and enters the same ceremony instead of skipping directly to the board.
3. Host syncs player names only. Face files are not synced/persisted.
4. The host waits for at least one remote seat, then locks ceremony seat claims.
5. For each D6 prompt, the tab that owns the seat gets the roll button.
6. Remote client sends only `promptId + seat identity`; it never sends a D6 value.
7. Host validates the active prompt/seat, generates the D6, then broadcasts the authoritative result.
8. Both tabs animate the same final D6 and play the normal dice SFX.
9. Tie groups are announced by the host and only tied seats reroll.
10. Host broadcasts the final play order. Client configures the same `playOrder` before entering the match.
11. HOST alone releases everyone into `DemoBoardScene` with `start_match`.

## Authority boundaries

- Remote client cannot choose its D6 result.
- Duplicate/stale remote roll clicks do not consume another host D6.
- A remote seat cannot roll another player's prompt.
- Unclaimed seats remain host-controlled.
- Seat claims are locked once the ceremony begins; late remote joins are rejected clearly.
- The ceremony uses a pregame random source owned by host and does not consume gameplay RNG state.

## Retained behavior

- Roll For Order rule remains high D6 first; only tied players reroll.
- Player ID, face/color ownership and identity remain stable; only `playOrder` changes.
- 0.1.44 result input gate and the 0.1.43/0.1.42/0.1.41 podium chain remain unchanged.
- One-lap scoring remains unchanged.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain unchanged.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.

## Regression

`tests/remote-roll-order-045.ts` validates:

- P2 remote seat claim;
- host-to-client profile-name sync;
- remote click produces a host-generated D6;
- duplicate remote click does not consume another D6;
- remote P2 cannot roll host-owned P1;
- host-owned prompts use the same host D6 source;
- tie-group, final-order and start-match broadcast;
- late seat claims are rejected after lock;
- JOIN enters TurnOrderScene before DemoBoardScene;
- 0.1.45 keeps 0.1.44 board behavior in the inheritance chain.

The first 0.1.45 CI attempt (#1335) failed only because the new static regression searched for the literal `session.announceTie(...)` while the real scene uses `hostSession?.announceTie(...)`. Dynamic protocol checks had already passed. The assertion was corrected; runtime architecture was not relaxed.

## Validated artifact

GitHub Actions run: `34807583109` / run `#1337`

Validated runtime/package SHA:
`4842257bafbdffbdf4fab929d49582aa7b52671d`

Artifact:
`mememe-playtest-0.1.45`

Artifact ID:
`10333851442`

Artifact size:
`8,565,566 bytes`

Digest:
`sha256:747411d7d031fea47ab36edfc367894d22ed35abf05b858498129631560eb67f`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34807583109`

Full CI passed through build/typecheck, all existing gameplay/network/presentation regressions, new Remote Roll For Order authority regression, package verification, guide copy, and artifact upload.
