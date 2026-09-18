# MeMeMe 0.1.56.1 — Canonical Presentation Consolidation

Status: **AUTOMATED CANDIDATE / MANUAL VISUAL ACCEPTANCE REQUIRED**

Launcher: `START_PLAYTEST.bat`

This milestone changes presentation only. It must not change HOST authority, deterministic gameplay, replay/checksum, economy rules, Roll For Order, Job Hub, Mini Game payout ownership, READY/lap/final-result flow, audio ownership, the stale-token guard, or the 0.1.56 branch identities.

## What changed

- Standard gameplay starts in a close active-token camera instead of full-map view.
- The camera follows authoritative token movement smoothly.
- A separate fixed UI camera keeps HUD and controls in screen space.
- P1/P2/P3/P4 have persistent top-left/top-right/bottom-left/bottom-right HUDs.
- Ordinary Draft D spaces use smaller integrated greybox markers instead of giant legacy circles.
- Job/Mini Game identity is built into the marker instead of stacking competing circles.
- Human branch decisions use the manual Left/Right picker with PHỐ CHÍNH / AN TOÀN / DRAMA / TIỀN flavor.
- Branch decisions briefly frame both routes, then return to close follow.
- `TỔNG QUAN` (or keyboard `O`) is the explicit full-board view.
- TIN TỨC/LÁ BÀI cinematic surfaces are reduced so board/token context remains visible.
- Visible current-build copy comes from the 0.1.56.1 canonical presentation source instead of chained old-version string replacement.

## Manual acceptance checklist

Run `START_PLAYTEST.bat` and verify all of the following:

1. Normal gameplay does **not** begin with the full board visible.
2. The camera stays near the active token and follows each authoritative movement step without snapping backward.
3. P1 stays top-left, P2 top-right, P3 bottom-left, P4 bottom-right; HUD panels do not pan or zoom with the board.
4. At M04, M17 and M35 branch decisions, the camera eases outward enough to read both routes and the picker shows manual Left/Right route identity.
5. After choosing a branch, the camera returns to close token follow.
6. `TỔNG QUAN` shows the whole topology only when requested, then `TRỞ LẠI LƯỢT` restores close gameplay framing.
7. The 44-space Draft D board is locally readable and does not look like a pile of overlapping 34px circles.
8. TIN TỨC and LÁ BÀI remain readable while leaving board/token context and all four HUD corners visible.
9. The visible build reads **0.1.56.1** and no old **0.1.25** header/badge leaks into active gameplay.
10. Roll For Order, Job Hub, Mini Games, money changes, READY/lap completion, multiplayer parity, audio and final result still behave exactly as before this presentation pass.

## Branch identity regression check

The 0.1.56 branch content remains locked:

- **AN TOÀN 🛡️**: A1/A2/A3 are Normal/Normal/Normal.
- **DRAMA 🎭**: B1 TIN TỨC, B2 LÁ BÀI, B3 TIN TỨC.
- **TIỀN 💰**: C1 +25 B$, C2 -20 B$, C3 +25 B$.
- Comparison route remains **PHỐ CHÍNH**.
- Both alternatives remain equal-step forward routes that merge ahead.

## Acceptance language

A green CI run means the implementation candidate passed automated regression gates. It does **not** mean the presentation is user-accepted.

Only after Ron manually approves the real `START_PLAYTEST.bat` presentation should 0.1.56.1 be called canonical/accepted and the roadmap proceed to 0.1.57 special-location authority.
