# MeMeMe — Latest Handoff

Branch: `mmm-mvp-0.1-core`

Legacy PR #1 remains Draft/Open on `mememe-mvp-0.1-core`.
Do not merge or mark Ready unless Ron explicitly asks.

## Current public runtime

**0.1.70.4.19 — Runtime Reliability + Release Guard**

Validated runtime source:
`3f1a96b6bd27606c1180e5b7cf4bc890288de8f9`

Public mirror:
`03e2a745389dc3af060b0d04c19ab2a2d3bd4d77`

Mirror publish title:
`Publish compiled playtest 3f1a96b`

Pages:
`https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Current compiled assets:
- JS: `./assets/index-Cim9s4_x.js`
- CSS: `./assets/index-BZCErh0i.css`

## 0.1.70.4.19 release guard

This checkpoint is a stable baseline, not a permanent freeze. Future approved UI/gameplay changes may update the implementation and the corresponding regression guard together.

Automated guards now lock:

- reconnect handshake before queued online gameplay intents flush;
- reclaimed clients control only their own seat;
- shell state resync after transport reconnect;
- CPU seats remain autonomous through Host authority;
- authenticated group-media signaling + peer self-heal remain present;
- avatar setup remains player-owned with the four-choice launcher;
- active HUD stays clamped to the logical safe area;
- P1–P4 token badges remain an invariant during movement;
- Card/News adaptive text fitting from 0.1.70.4.18 remains active;
- reaction bubbles retain HUD-safe lanes;
- controller remains intentionally unsupported;
- source CI must preserve the public mirror's `.github/workflows/pages.yml`;
- publisher validates `index.html`, manifest, referenced JS/CSS, BGM and required SFX before push;
- public Pages workflow stages every compiled root asset generically, so future public files are not silently omitted;
- canonical public URL is `https://ronvotri.github.io/MeMeMe-Web-Playtest/`.

## Validation

Source CI:
- MMM MVP CI #3159: SUCCESS
- run: `35560164806`
- live Worker smoke: SUCCESS
  - room lifecycle: create/join/ready/start
  - P2 post-start seat reclaim with same reconnect token
  - game relay Host -> P2 and P2 -> Host
  - simulated P2 reload socket reconnect on the same seat
  - authenticated media roster relay Host -> P2
  - authenticated media signal relay P2 -> Host
  - CI probe room: `ME44VO`
- typecheck/build: SUCCESS
- 0.1.70.4.17 guard: SUCCESS
- 0.1.70.4.18 adaptive safe area: SUCCESS
- 0.1.70.4.19 runtime reliability + release guard: SUCCESS
- mobile landscape/face style: SUCCESS
- external playtest package: SUCCESS
- public mirror release guard: SUCCESS
- compiled mirror publish: SUCCESS

Public Pages:
- mirror commit: `03e2a745389dc3af060b0d04c19ab2a2d3bd4d77`
- Pages workflow run: `35559863794`
- conclusion: SUCCESS

The earlier Pages staging run on `168f065...` was cancelled only because the source publisher immediately pushed the newer compiled 0.1.70.4.19 mirror; the replacement Pages run above completed successfully.

## Runtime acceptance still pending

CI/package/Pages PASS does not equal Runtime PASS.

Use:
`docs/PLAYTEST_0.1.70.4.19_RUNTIME_RELEASE_GUARD.md`

Highest-value real-device checks:

1. Desktop/local:
   - active HUD never clips;
   - several long TIN TỨC / LÁ BÀI entries do not duplicate or overflow;
   - reactions do not cover HUD;
   - P1–P4 token badge never disappears during movement;
   - Job Hub preview/result flow remains readable.

2. Online two-device:
   - each human edits only their own avatar;
   - each human acts only on their own turn;
   - CPU seats autoplay without Host clicking;
   - no stale black `CHỜ HOST` overlay.

3. Reconnect:
   - reload client during active match;
   - same seat/avatar/match state returns;
   - no stale lobby;
   - client can act normally on their next turn.

4. Group media:
   - P1/P2 see each other;
   - camera/mic toggle recovers without reloading.

Call **0.1.70.4.19 Runtime PASS** only after Ron confirms the relevant real-device checks.

After Runtime PASS, treat 0.1.70.4.x as the stable baseline and proceed to 0.1.71.

Current WebRTC remains STUN-only. Add TURN only if cross-network real-device testing proves it necessary.

Cloudflare online release remains frozen unless Ron explicitly asks to update it.

Do not merge PR #1.
