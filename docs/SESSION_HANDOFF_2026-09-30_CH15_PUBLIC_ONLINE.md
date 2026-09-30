# MMM — 2026-09-30 CH-15 PUBLIC ONLINE

**SOURCE + LIVE WORKER + BROWSER RUNTIME + PACKAGE + PUBLIC PAGES: PASS.**

Canonical authority:
- repo / branch: `RVTGMzz/Mmm-BG` / `mmm-mvp-0.1-core`
- build: `0.1.70.4.37`
- phase: `RELEASE CANDIDATE • CH-15 PUBLIC ONLINE`
- validated source/test HEAD: `6ec56ccd0cc92ca72131ed5f3a7a275bc9334fcc`
- full CI #3422 / run `36743533044`: **SUCCESS**
- runtime evidence artifact: `11110879402`
- package artifact: `11111004466`
- Fast Publish #2 / run `36743533077`: **SUCCESS**
- compiled public mirror: `5a44add638a3877e39f74ed2847248f8b742680d`
- Pages #88 / run `36744538810`: **SUCCESS**
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-15 online behavior now live

1. **Public ONLINE entry**
   - ONLINE remains a first-class option in the main lobby.
   - menu probes the production Worker `/health` before Create/Join.
   - UI shows server-ready / unavailable state and supports retry.
   - failed health probes re-enable Create/Join buttons instead of leaving them stuck disabled.

2. **Create / Join / Ready / Start**
   - host creates a room through the existing Worker + Durable Object stack.
   - remote players join by room code and receive the lowest free P2–P4 seat.
   - host + remote players Ready before Start.
   - CPU Fill remains available for empty seats.
   - post-Start room authority, seat ownership and reconnect behavior remain the existing locked online authority.

3. **Invite link**
   - Online Room now exposes both `COPY MÃ` and `COPY LINK`.
   - invite URL uses `?room=ROOMCODE`.
   - opening that link pre-fills the ONLINE room field automatically.

4. **Reload / resume**
   - host token and client reconnect token are stored in tab-scoped `sessionStorage`.
   - after reload in the same tab, lobby shows `↩ TIẾP TỤC PHÒNG <CODE>`.
   - resume restores the same room / seat credentials instead of creating a new seat.
   - explicit leave / dead-room return clears stale resume state, avoiding ghost resume buttons.

5. **Existing online authority preserved**
   - no Worker/Durable Object gameplay authority rewrite.
   - no reconnect-token semantics changed.
   - no client RNG or B$ authority changes.
   - no lobby-after-Start resurrection.
   - avatar/seat ownership remains per-player.

## Online validation

Full CI #3422 passed all online/runtime gates:
- `0.1.70.4.19 live two-device reconnect + media relay smoke`: PASS
- `CH-08 live repeated reconnect ownership and ghost-seat stress`: PASS
- `0.1.70.4.21 live half-open socket replacement stress`: PASS
- `CH-15 public online entry and resume`: PASS
- `Transform-safe scroll viewport runtime gate`: PASS
- runtime UI evidence upload: PASS
- package `0.1.70.4.37`: PASS
- compiled mirror publish: PASS

Browser CH-15 acceptance covers:
- invite link room prefill;
- production Worker health-ready state;
- saved Host resume button;
- resume back into Online Room;
- COPY LINK presence.

## Fast public release lane

`.github/workflows/fast-public-online.yml` exists as a lightweight public release lane.
- first attempt failed only because `setup-node cache:npm` expected a lockfile that this repo does not have;
- fixed by removing npm cache and using `npm install --no-audit --no-fund`;
- Fast Publish #2 passed and published `.37`.
- Full CI #3422 later also passed and re-published the same canonical source build.

Do not confuse Fast Publish with authority validation: canonical validated source is still full CI #3422.

## Earlier CH-14.2 behavior remains locked

- Job Hub does not render `Đổ xúc xắc để chọn nghề`.
- human-involved Mini Games hold rules until Enter / Space / A / pointer confirmation.
- CPU-only Mini Games skip rules.
- Character passive percentages remain hidden presentation stats.
- BA CỬA / PHAO ĐƠN / CẮT TOP / ĐUA 3 CHẶNG use horizontal left-state/right-result presentation.
- CH-14.1 spotlight ownership, Space/Settings isolation, Card/News header fix and rounded Mini Game UI remain locked.
- CH-14 Match Recap remains live.

## Hard constraints

- PR #1 remains Draft/Open; never merge unless Ron explicitly asks.
- no client `Math.random()`.
- HOST/replay authority remains authoritative for gameplay RNG and B$.
- Character passive probabilities remain 40/50/20/45/60.
- Mini Game payouts/economy/pacing unchanged.
- Worker/reconnect authority must not be rewritten for presentation-only issues.

## Next human acceptance

Automated/browser/live-Worker acceptance is PASS. Physical two-device online acceptance is still human-owned.

Recommended real-device path:
1. device A → ONLINE → TẠO ONLINE;
2. COPY LINK or COPY MÃ;
3. device B → open invite / VÀO;
4. both Ready → Host Start;
5. verify P1/P2 each control only their own actions;
6. reload device B once and confirm same seat reconnect;
7. play through at least one Card/News, Job and Mini Game;
8. confirm no ghost lobby after Start and no duplicated seat.

If Ron sends screenshots/logs, fix only real regression at the shared online/session/layout owner level and add a regression gate.


## Main CH-15 commit chain

- `438c3fe7` — feat: persist online room resume credentials
- `c89f9af5` — feat: add online Worker health probe
- `05d2d73c` — feat: expose public online health invite and resume flow
- `61920a4c` — feat: add online invite link and clear stale resume state
- `6df019ea` — style: polish CH-15 online status and resume controls
- `68fcfdc1` — test: add CH-15 public online resume contract
- `7e321b78` — fix: re-enable online actions after health probe failure
- `e22fbf88` — test: add CH-15 online browser entry acceptance
- `5a996189` — chore: bump CH-15 public online build
- additional package/CI/playtest commits register CH-15 source/browser gates
- `9f77c209` — ci: add one-shot fast CH-15 public release lane
- `6ec56ccd` — fix: unblock fast CH-15 publish without lockfile; canonical validated HEAD

## Public authority

Public compiled mirror:
`5a44add638a3877e39f74ed2847248f8b742680d`

Pages:
- #88 / `36744538810`: SUCCESS

Public URL:
https://ronvotri.github.io/MeMeMe-Web-Playtest/
