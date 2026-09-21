# MeMeMe 0.1.70.4.19 — Runtime Reliability + Release Guard

This checkpoint freezes known-good runtime contracts as regression guards. It does **not** prevent future UI/gameplay changes. When Ron intentionally approves a new design, update the corresponding guard together with the implementation.

## Automated gates

- deterministic/typecheck/build pipeline remains green;
- online reconnect handshake runs before queued gameplay intents flush;
- a client controls only its reclaimed seat;
- shell state is requested again after transport reconnect;
- CPU seats remain autonomous through the normal Host authority path;
- group media keeps authenticated signaling and peer self-heal;
- avatar setup remains player-owned and uses the four-choice launcher;
- active HUD stays clamped inside the 1280×720 logical safe area;
- token P1–P4 badge remains visible during movement;
- Card/News text keeps the adaptive .18 fitter;
- reaction bubbles stay in HUD-safe lanes;
- controller navigation remains disabled for this checkpoint;
- compiled mirror publish must preserve `.github/workflows/pages.yml`;
- compiled mirror must contain `index.html`, manifest, JS, CSS, BGM and required SFX before push;
- canonical Pages URL is `https://ronvotri.github.io/MeMeMe-Web-Playtest/`.

## Real-device runtime acceptance

CI is not Runtime PASS. Test these on the public Pages build.

### A. Desktop/local presentation
1. Start a local match with one human + CPUs.
2. Confirm active-player HUD zoom never clips at any of the four corners.
3. Trigger several different TIN TỨC and LÁ BÀI entries, including long titles/body copy.
4. Confirm no duplicated text/frame, no text escaping the card, and reaction bubbles do not cover player HUD.
5. Watch multiple movement sequences and confirm the small P1–P4 token badge never disappears.
6. Open Job Hub, preview multiple jobs, roll for a job, and confirm the Job preview/result flow remains readable.

### B. Online two-device flow
1. Device A creates a room; device B joins.
2. Each device edits only its own avatar.
3. Host starts only after real players are Ready.
4. Complete Roll For Order.
5. Confirm each human can act only on their own turn.
6. Confirm CPU seats autoplay without Host clicking for them.
7. Confirm no black `CHỜ HOST` overlay remains over an active client turn.

### C. Reconnect
1. During an active match, reload device B.
2. Confirm it reclaims the same seat.
3. Confirm avatar/profile and active match state restore.
4. Confirm it does not return to a stale lobby or report that the player is already in the room.
5. When B's turn arrives, confirm B can roll/act normally.

### D. Group media
1. Enable camera on A and B.
2. Confirm A sees B and B sees A, not only themselves.
3. Toggle camera/mic off and on once on each device.
4. Confirm the group panel recovers without reloading the match.

## Exit rule

Call **0.1.70.4.19 Runtime PASS** only after the relevant real-device checks above are confirmed by Ron. Until then, CI/package/public deploy may be PASS while runtime remains pending.

After Runtime PASS, 0.1.70.4.x can be treated as the stable baseline and development may proceed to 0.1.71. The baseline can still be changed later by intentionally updating the corresponding implementation + regression guard.
