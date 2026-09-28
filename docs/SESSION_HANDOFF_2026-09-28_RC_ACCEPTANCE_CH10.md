# MMM — 2026-09-28 RELEASE CANDIDATE ACCEPTANCE CH-10

**RC ACCEPTED FOR HUMAN / DEVICE PLAYTEST**

CH-10 adds a single acceptance matrix over the already-validated systems rather than another gameplay feature.

Acceptance matrix locks:
- RC build identity and MMM visible branding;
- one public tester launcher + package/audio checksum guard;
- Steam Deck controller owner and legacy owner exclusion;
- CSS-only 16:10 FIT presentation, no stretch/crop;
- Character authoritative percentages 40/50/20/45/60;
- CH-06 probability/economy audit presence;
- full-match two-lap integration and 1/2/3-lap economy audit;
- deterministic 3-lap repeat;
- logical socket ownership + CH-08 repeated live reconnect stress;
- invalid token, active-device and post-Start join guards;
- CH-09 presentation feedback policy;
- public PLAYTEST guide contains reconnect and Character odds;
- all prerequisite CH-05 through CH-09 + Pages release guard remain wired in CI.

Validated checkpoint:
- CH-10 source: `511d5942474e6a7d4e02215659ebb36d70318453`
- CI #3366 / run `36443146292`: SUCCESS
- runtime evidence artifact: `10979770298`
- RC package artifact: `10980020090`
- compiled public gameplay remains `adac960abc6c43847032107160bf4622992cdd2c`
- current public Pages #76: SUCCESS
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/

Decision:
- no more feature additions before human/device acceptance unless a real blocker is found;
- next work should come from actual Steam Deck / desktop playtest observations;
- preserve current Character percentages, economy, online authority and single-owner presentation until playtest evidence justifies a change.

---

