# MMM — 2026-09-28 ONLINE STRESS / RECONNECT CH-08

**LIVE RECONNECT OWNERSHIP + GHOST-SEAT STRESS: PASS**

CH-08 live Worker stress coverage:
- same P2 identity reconnects repeatedly across 5 cycles;
- seatId and reconnectToken remain stable;
- invalid reconnect token is rejected;
- a different active device cannot steal the live identity;
- new identities cannot join after Start;
- the superseded socket may remain physically open briefly under Cloudflare hibernation, but it is removed from the logical relay authority and cannot leak gameplay actions;
- the newest socket keeps bidirectional relay with host;
- roster remains single-owner with no duplicate/ghost P2 record.

Important invariant learned:
- physical WebSocket close timing is not the authority boundary;
- `logicalSockets070421` / newest logical endpoint ownership is the real gameplay safety invariant.

Regression repair during CH-08:
- stale online transport test expected the old explicit `target.channel !== sender.channel` filter;
- test was updated to the current logical-socket channel isolation architecture without changing Worker behavior.

Validated checkpoint:
- CH-08 stress source: `218c809608502262073129c5e55068a23a90a9c3`
- logical reconnect invariant correction: `c9936fffd59004d1878056a8db6931bbfd022dee`
- final CI #3360 / run `36434401039`: SUCCESS
- online gates, browser runtime, package, Pages guard and compiled mirror publish all SUCCESS.

Next roadmap block: Final Polish / Juice Pass. Preserve current authority, Character percentages, economy and canonical single-owner UI.

---

