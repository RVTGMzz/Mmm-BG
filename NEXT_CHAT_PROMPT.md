# NEXT CHAT PROMPT — 2026-09-30 AFTER CH-15 PUBLIC ONLINE

Continue MMM from repo `RVTGMzz/Mmm-BG`, branch `mmm-mvp-0.1-core`.

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/SESSION_HANDOFF_2026-09-30_CH15_PUBLIC_ONLINE.md`
4. Ron's newest screenshots / two-device online feedback.

Current authority:
- build `0.1.70.4.37`
- phase `RELEASE CANDIDATE • CH-15 PUBLIC ONLINE`
- validated source/test HEAD `6ec56ccd0cc92ca72131ed5f3a7a275bc9334fcc`
- full CI #3422 / run `36743533044`: SUCCESS
- runtime evidence artifact `11110879402`
- package artifact `11111004466`
- Fast Publish #2 / run `36743533077`: SUCCESS
- public mirror `5a44add638a3877e39f74ed2847248f8b742680d`
- Pages #88 / run `36744538810`: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

CH-15 is public and automated/live-Worker accepted:
- Worker health probe is visible in ONLINE menu;
- create/join/Ready/Start use existing Worker + Durable Object authority;
- COPY LINK creates `?room=CODE`; invite links prefill the room field;
- host/client reconnect credentials are saved per tab in sessionStorage;
- reload shows `TIẾP TỤC PHÒNG` and restores the same room/seat;
- explicit leave/dead-room return clears stale resume state;
- live two-device smoke, repeated reconnect/ghost-seat stress and half-open socket replacement all PASS;
- browser online-entry/resume gate PASS.

Physical two-device acceptance is still pending. Do not claim real-device online PASS until Ron tests it.

Locked prior behavior:
- CH-14.2 Job Hub compact copy, participant-aware rules, CPU-only rules skip, hidden passive percentages, horizontal Mini Game result flow;
- CH-14.1 spotlight/input/Card-News/rounded UI fixes;
- CH-14 Match Recap;
- no client Math.random();
- HOST/replay gameplay RNG/B$ authority;
- Character probabilities 40/50/20/45/60;
- current economy and Mini Game payouts;
- PR #1 stays Draft/Open.

Next action:
- prioritize Ron's newest real two-device online test;
- if online fails, capture exact room state / seat / action / reconnect moment and fix the shared authority/session rule;
- do not rewrite Worker/reconnect architecture for presentation bugs;
- do not merge PR #1 unless Ron explicitly asks.

Public link must be included at the end of every completed build/fix report:
https://ronvotri.github.io/MeMeMe-Web-Playtest/


## ACTIVE DEVELOPMENT RELEASE POLICY — 2026-10-04
- **REPO-ONLY until Ron explicitly says otherwise.**
- Run source build/tests/CI on `mmm-mvp-0.1-core` normally.
- Do **NOT** upload playtest build artifacts for routine commits.
- Do **NOT** checkout/push `ronvotri/MeMeMe-Web-Playtest`.
- Do **NOT** update public GitHub Pages during active development.
- Existing public build may remain online but is considered frozen/stale test material.
- Re-enable public publishing only after Ron explicitly asks to publish a new online test build.
