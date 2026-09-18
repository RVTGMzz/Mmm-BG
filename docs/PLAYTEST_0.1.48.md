# MeMeMe MVP 0.1.48 Playtest Guide

## Quick start

1. Extract the playtest ZIP.
2. On Windows, run `START_PLAYTEST.bat`.
3. Keep the launcher terminal open while playing.
4. Do **not** open `index.html` directly with `file://`.

## 0.1.48 focus

This build is a runtime bugfix pass based on direct playtest feedback.

### 1. Money SFX ownership

Money tile packets previously exposed the B$ change immediately and the landing presentation played the same coin cue again. That made the result audible before the token landed and then repeated the sound.

0.1.48 keeps packet-level money delta UI, but suppresses packet coin audio when a visible presentation event owns that economy moment. Money tile landing keeps the event-aligned coin cue. Mini Game payout and other economy changes without a landing owner may still use the packet cue.

Expected result:

- no coin cue before the token reaches a money tile;
- exactly one gain/loss coin cue on the landing presentation;
- no change to authoritative money state or checksum behavior.

### 2. Roll For Order final D6 face

The old settled frame used the Unicode `🎲` emoji plus a number. The emoji artwork is a fixed die picture and does not encode the authoritative value, so it could visually look like face 1 regardless of the real result.

0.1.48 keeps the same host-authoritative D6 protocol but settles on the corresponding `⚀ ⚁ ⚂ ⚃ ⚄ ⚅` glyph plus the numeric value.

### 3. Mini Game BGM isolation

`03_City_Silly.ogg` is now reserved for actual Mini Game overlay playback only.

Normal board rounds use the board BGM path and must not switch to `city_silly` merely because the old round counter reaches round 2. The Mini Game overlay still temporarily plays `03_City_Silly.ogg` and restores the previous track when the overlay ends.

### 4. Token snap-back guard

A delayed or duplicated `move_step` presentation event can no longer animate a token backwards when the token has already moved past that event's `fromNodeId`.

The new presentation policy classifies a queued move step as:

- `animate`: token is still at the event from-node;
- `duplicate`: token is already at the event destination;
- `stale`: token is at neither the expected from-node nor destination, indicating an old/out-of-order presentation step.

Only `animate` is allowed to tween. This is presentation-only and does not mutate authoritative node state.

## Corrected legacy-card interpretation

The supplied vertical **Tiên Tri** and horizontal **Phép Thuật** images are reference content from the older game for feature/effect analysis. They are **not** a request to rename the current board systems.

0.1.48 therefore restores the current visible vocabulary:

- board tile/system remains **TIN TỨC**;
- board tile/system remains **LÁ BÀI**;
- Card hand picker returns to its pre-0.1.47 wording/layout;
- the 0.1.47 HOST/CLIENT presentation parity audit remains retained as a regression.

The supplied reference images are not persisted into the repository as runtime assets in this milestone.

## Recommended manual checks

### Token movement

Play at least two turns for the same player. After every D6 roll, let the token finish all node-by-node movement. Once it stops, it must never jump back to the pre-roll position. The next turn must begin from the visible final node.

Repeat with P1 and, if possible, one CPU or remote-owned seat.

### Money tile audio

Land on a positive and negative money tile if possible. There should be no early coin cue before landing and only one coin gain/loss cue when the tile presentation resolves.

### Roll For Order

Check several results and at least one tie reroll. The final glyph and number must agree, e.g. `⚄ 5` for result 5, on both HOST and CLIENT.

### Mini Game BGM

Stay on the board long enough to cross the old round boundary. `03_City_Silly.ogg` must not start on the board. Enter a real Mini Game and confirm it starts there, then restores the previous board track after the Mini Game finishes.

### Multiplayer parity

HOST and CLIENT must still receive the same authoritative presentation stream. Snapshot/resync must not replay stale events. Remote Roll For Order and Multiplayer Job Hub remain host-authoritative.

## Retained invariants

- Starting wallet: `200 B$`.
- Every player completes one physical lap before final scoring.
- READY pays the current Job salary exactly once per crossing.
- Job Hub remains mandatory stop.
- Job D6 mapping remains `1–2 A / 3–4 B / 5–6 C`.
- Nhiều ra ít bị payout remains `30 / 20 / 10 / 0 B$`.
- Direct RPS payout remains `25 / 15 / 5 / 0 B$`.
- Mini Game payout remains host-system owned and one-shot.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Original face files remain local.
- Jail deep mechanics remain undefined.
- PR #1 remains unmerged.
