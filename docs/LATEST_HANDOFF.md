# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep **TIN TỨC / LÁ BÀI** names. Do not revive Tiên Tri / Phép Thuật.

## Current automated candidate

**MVP 0.1.57 — Authoritative Special Locations**

Automated status: **CI GREEN / PACKAGED**
Manual runtime status: **PENDING RON ACCEPTANCE**

Implementation artifact before this documentation-only handoff update:
- `mememe-playtest-0.1.57-special-locations`
- run `#1925` / `34915676300`
- runtime/package SHA `7bdd543bcfeaa06fb7eaec48a39e9fa3ab90e335`
- artifact ID `10376680418`
- size `8,583,854 bytes`
- SHA256 `21df727b3b8cd227cd88882f24af9a015c2c6fb9ed051b81db5d6a893ced1374`
- expires 2026-09-29

All regression gates passed, including the inherited 0.1.48 stale-token/audio/dice contract, Draft D 0.1.50–0.1.56 gates, 0.1.56.1 canonical presentation architecture, and the new 0.1.57 authority test.

## Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene057 as ActiveBoardScene`

Inheritance:
`057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.57 keeps the 0.1.56.1 close-camera/four-corner-HUD presentation architecture. 0.1.56.1 itself was not manually accepted before Ron asked development to continue, so do not retroactively mark it accepted.

## Locked 0.1.57 behavior

### Jail
- M12 gate -> authoritative Jail hold node 100;
- release on 1/3/5;
- failure = stay held + turn ends;
- success = `100 -> 101 -> 102 -> 103 -> 12` = `JAIL -> J1 -> J2 -> J3 -> M13`;
- release die is discarded;
- success returns same player to `PRE_ROLL_ACTION` in the same turn;
- player must roll a fresh movement D6.

### Hospital
- M34 gate -> authoritative Hospital hold node 110;
- release exactly on 2/4/5;
- failure = stay held + turn ends;
- success = `110 -> 111 -> 112 -> 113 -> 34` = `HOSPITAL -> H1 -> H2 -> H3 -> M35`;
- recovery die is discarded;
- then fresh movement D6 in the same turn.

### Lottery
- M23 rolls a separate authoritative deterministic D6;
- reward = `D6 × 20 B$` = 20/40/60/80/100/120.

### Mini Game eligibility
- held Jail/Hospital players excluded;
- 2+ eligible = normal Mini Game;
- 1 eligible = automatic rank #1 via existing overlay/host-system payout path;
- 0 eligible = skip/no payout.

Holding state participates in checksum/replay. Held players cannot play Lá Bài before release, and CPU seats prioritize the release roll.

## Draft D content still locked

- 44 main spaces M01..M44;
- five Mini Games M09/M17/M26/M35/M44;
- M01 READY / M12 Jail Gate / M23 Lottery / M34 Hospital Gate;
- three forward-only equal-step branch decisions;
- AN TOÀN = Normal/Normal/Normal;
- DRAMA = TIN TỨC/LÁ BÀI/TIN TỨC;
- TIỀN = +25/-20/+25 B$;
- comparison route = PHỐ CHÍNH;
- manual Left/Right is canonical human routing.

## Manual test guide

`docs/PLAYTEST_0.1.57_SPECIAL_LOCATIONS.md`

Highest-value manual checks:
- Jail/Hospital success/failure faces;
- visible exit corridor followed by a truly fresh D6;
- Lottery D6 ×20 copy/payout agreement;
- Mini Game exclusion while held;
- token snap-back after many turns;
- Roll For Order, Job Hub, branching, audio/BGM, READY/lap and podium regression feel.

Do not call 0.1.57 user-accepted from CI alone.

## Roadmap

- 0.1.54 sandbox — done
- 0.1.55 canonical Draft D topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation architecture — CI green, no manual acceptance recorded
- **0.1.57 special-location authority — CI green, manual acceptance pending**
- 0.1.58 TIN TỨC / LÁ BÀI depth — next
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains parallel input for 0.1.58.

Do not merge PR #1.
