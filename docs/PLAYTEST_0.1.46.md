# MeMeMe MVP 0.1.46 Playtest

## Focus

**Job Hub Multiplayer Polish** extends the validated 0.1.45 two-tab flow without changing Job rules or gameplay authority.

### Expected multiplayer flow

1. HOST and JOIN complete Remote Roll For Order from 0.1.45.
2. When a remote-owned seat reaches Job Hub, both tabs should display the same three authoritative Job offers A/B/C.
3. Only the tab that controls the current seat may press **ĐỔ XÚC XẮC JOB**.
4. The other tab remains in spectator mode and shows that it is waiting for the current player.
5. The remote client sends only the existing empty `choose_job` intent. It never chooses the D6 value, Job ID, or offer index.
6. Host gameplay authority consumes the existing gameplay RNG, produces the Job D6, and applies `1–2 → A`, `3–4 → B`, `5–6 → C`.
7. The authoritative `job_dice_roll` event is broadcast to every tab and drives the same dice presentation.
8. The authoritative `job_selected` event shows the assigned Job and Lv.1 salary.

## Manual 2-tab checks

- HOST sees the same three offers as the remote player.
- HOST cannot click the remote player's Job Dice button.
- Remote owner can click exactly once and cannot directly select A/B/C.
- Both tabs finish the dice animation on the same D6 value.
- Both tabs show the same assigned Job and salary.
- The Job Hub overlay clears after the authoritative resolution and the turn advances.
- A later Job Hub visit still works after earlier overlays have closed.

## Authority checks

- Client-supplied `jobId`, `result`, or `offerIndex` values must be ignored.
- `choose_job` command data remains empty.
- The host authoritative state emits `job_dice_roll` followed by `job_selected`.
- Mandatory Job Hub stop remains unchanged.
- Job assignment still consumes exactly one authoritative Job D6 RNG call after the three-offer draw.

## Retained invariants

- Starting wallet `200 B$`.
- One physical lap per player before final scoring.
- READY salary and lap accounting unchanged.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- `03_City_Silly.ogg` remains the checksum-locked Mini Game BGM.
- Four approved BGM files and eight supplied SFX remain unchanged.
- Remote Roll For Order 0.1.45 remains host-authoritative.
- Final podium/result-input chain from 0.1.41–0.1.44 remains unchanged.
- Original face files stay local.
- Jail deep mechanics remain undefined.
- PR #1 must remain unmerged.

## Known limits

This remains a same-browser-profile/origin BroadcastChannel QA prototype, not production internet multiplayer. Reconnect/seat reclaim and face texture transfer are not implemented.
