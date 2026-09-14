# MVP 0.1.48 Progress

Status: **PASS / RUNTIME GATE CLOSED / PLAYTEST ACCEPTED**

Acceptance date: **2026-09-14**

Acceptance record: `docs/MVP_0.1.48_RUNTIME_ACCEPTANCE.md`

## Scope

0.1.48 was a focused runtime bugfix pass based on direct playtest feedback. It did not add new gameplay rules.

## Accepted fixes

### Money SFX ownership

Presentation-owned economy moments suppress premature packet-level coin audio while the visible landing/event presentation owns the cue.

Covered presentation-owned event types include:

- money `tile_land`;
- `ready_pass`;
- `news`;
- `card_play`.

Mini Game payout may still use packet-level money audio because it has no money-tile landing owner.

### Roll For Order D6 face

`src/scenes/TurnOrderScene048.ts` keeps the host-authoritative result and replaces the misleading fixed `🎲` settled frame with the matching `⚀..⚅` face plus numeric result.

### Mini Game BGM isolation

Normal board progression no longer selects `03_City_Silly.ogg`.

That track remains reserved for actual Mini Game presentation and restores the prior board track afterward.

### Token snap-back guard

`src/ui/movementVisualPolicy.ts` and `src/scenes/CareerMinigameBoardScene048.ts` prevent duplicate/stale queued `move_step` presentation from dragging an already-advanced token backward.

The policy remains presentation-only. Authoritative node state, gameplay RNG, replay and checksum data are unchanged.

### Legacy-card naming correction

The old Tiên Tri / Phép Thuật screenshots are references for effect/content analysis only.

Current names remain:

- **TIN TỨC**
- **LÁ BÀI**

The reference images are not runtime assets for 0.1.48.

## Regression coverage

`tests/bugfix-pass-048.ts` covers:

- valid / duplicate / stale movement-step classification;
- screen-position tolerance;
- board-vs-Mini-Game BGM selection;
- money cue ownership;
- event-aligned landing cue;
- Roll For Order final D6 face;
- 0.1.48 packaged scene wiring;
- bypass of the mistaken 0.1.47 rename;
- restored Card vocabulary.

## Retained invariants

- Remote Roll For Order remains host-authoritative.
- Multiplayer Job Hub remains host-authoritative and spectator-safe.
- Job mapping remains `1–2 A / 3–4 B / 5–6 C`.
- Starting wallet remains `200 B$`.
- One-lap scoring and READY salary remain unchanged.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị remains `30 / 20 / 10 / 0 B$`.
- Direct RPS remains `25 / 15 / 5 / 0 B$`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Final result/podium chain remains unchanged.
- Original face files remain local.
- Jail/Hospital deep mechanics remain undefined.
- PR #1 remains Draft/Open and unmerged.

## Validated playable checkpoint

GitHub Actions run: `34814789556` / run `#1441`

Runtime/package SHA:
`5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`

Artifact:
`mememe-playtest-0.1.48`

Artifact ID:
`10336247664`

Artifact size:
`8,566,826 bytes`

SHA256:
`d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Full CI passed build/typecheck, deterministic replay/lockstep, host-client/two-tab authority, retained gameplay/presentation regressions, Remote Roll, Multiplayer Job Hub, presentation parity, 0.1.48 bugfix regression, image bounds, package verification, guide copy and artifact upload.

## Runtime acceptance

Ron explicitly instructed on 2026-09-14 that the 0.1.48 runtime gate should be treated as **PASS**.

This is user playtest acceptance and permits progression to 0.1.49. It is not a claim that the assistant independently executed the browser runtime in its own environment.

Do not reopen the token snap-back gate unless new reproducible feedback appears.

## Next milestone

**MVP 0.1.49 — Legacy Effect Audit**

See:
`docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`

In parallel, continue:
`docs/MAP_ARCHITECTURE_FINAL.md`

Keep the current names `TIN TỨC / LÁ BÀI` and do not invent undefined Jail/Hospital mechanics.
