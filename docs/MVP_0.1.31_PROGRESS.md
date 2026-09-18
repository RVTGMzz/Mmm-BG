# MeMeMe MVP 0.1.31 — Job Dice, Salary, Mini Games & Roll For Order

Status: ACTIVE / PLAYTEST CANDIDATE

## Gameplay added

### Roll For Order
- After face/name setup, all four players roll one D6 to determine play order.
- Higher roll goes earlier.
- Only tied players reroll until their relative order is resolved.
- Player IDs, faces, colors and CPU/human ownership stay stable; only `playOrder` changes.
- `playOrder` is gameplay-authoritative and checksum-covered.

### Mandatory Job Hub
- Job Hub remains a mandatory stop at the merge after the route split.
- Movement stops when reaching Job Hub even if the movement die still has steps remaining.
- First visit while unemployed draws three unique Jobs from the ten-Job pool.
- Jobs are not clicked/selected directly.
- Player rolls one authoritative Job D6:
  - 1–2 → Job A
  - 3–4 → Job B
  - 5–6 → Job C
- The Job roll uses gameplay RNG and is deterministic under command replay.

### Job salary and traits
- Each Job now has a salary curve for Lv.1 / Lv.2 / Lv.3.
- Salary is paid when the player passes the Ready/start gate.
- The old flat +100B$ gate reward is replaced by Job salary.
- No active Job means 0B$ salary for that gate pass.
- Each Job has a small identity/trait expressed by its salary curve and risk tuning.
- Normal careers can promote, stay steady, demote, or be fired.
- Thief is currently the dangerous career and can enter `jailed` status.
- Jail movement/turn penalties are intentionally not invented yet.

### Mini Games
- `Nhiều ra ít bị` is a multi-round elimination game.
- Minority SẤP/NGỬA side is eliminated.
- Ties replay.
- Survivors continue until two remain.
- At exactly 1v1, the game automatically switches to Rock-Paper-Scissors.
- Mini Game payout is intentionally still neutral until reward/penalty economy is designed.

## Presentation
- Job Hub shows three random Job cards with 1–2 / 3–4 / 5–6 ranges.
- Cards show Lv.1/Lv.2/Lv.3 salary and Job trait.
- Player presses one `ĐỔ XÚC XẮC JOB` button rather than selecting a card.
- `job_dice_roll` uses the existing authoritative dice presentation.
- Passing Ready is presented as `LƯƠNG QUA CỔNG`, including 0B$ when unemployed.

## Determinism / authority
- Career state (`jobId`, `jobLevel`, `jobStatus`) is now checksum-covered.
- Pending Job offers are checksum-covered.
- Optional `playOrder` is checksum-covered.
- Legacy matches with identity play order keep `playOrder` omitted to avoid needless historical checksum drift.
- `eventLog` remains presentation-only and checksum-excluded.
- No new presentation RNG calls were added to gameplay RNG.

## Current golden replay
- Seed: `123456789`
- 20 turns
- Current expected checksum: `9cb73072`
- Job assignment consumes exactly one authoritative D6 after three Job offer draws.

## Intentionally deferred
- Mini Game B$ reward/penalty.
- Full jail rules such as skipped turns, bail or escape.
- Deep mechanical passive abilities per Job beyond salary/risk identity.
- Remote multi-device Roll For Order input. Current host/local ceremony is sufficient for this playtest milestone.
