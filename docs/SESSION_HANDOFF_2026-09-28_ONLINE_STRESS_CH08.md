# MMM — 2026-09-28 ONLINE STRESS / RECONNECT CH-08

**LIVE REPEATED RECONNECT + OWNERSHIP + GHOST-SEAT STRESS: PASS**

CH-08 exercises the production Worker/DO path, not only static source contracts.

Live stress coverage:
- create room + authenticated P2 join;
- wrong reconnect token cannot reclaim the identity;
- a second active device cannot steal the same identity during reconnect grace;
- new human identities cannot join after Start;
- same P2 performs 5 authenticated reconnect cycles and always retains the original seat/token;
- a superseded physical socket may remain half-open briefly under Cloudflare hibernation, but it is no longer the logical authority and cannot relay gameplay;
- newest socket continues bidirectional host <-> P2 relay after every cycle;
- public lobby contains exactly one P2 record after stress, so no ghost/duplicate seat is created.

Important test correction during CH-08:
- legacy online-client gate still expected the pre-0.1.70.4.21 literal channel filter `target.channel !== sender.channel`;
- current Worker isolates relay through `logicalSockets070421(sender.channel)`, so the stale assertion was updated without changing Worker behavior;
- first CH-08 draft incorrectly required a client-side close event within 10s; Cloudflare hibernation can delay physical close propagation;
- final invariant is stricter and gameplay-relevant: obsolete sockets must never relay after replacement, regardless of physical close timing.

Validated checkpoint:
- CH-08 initial stress source: `218c809608502262073129c5e55068a23a90a9c3`
- stale legacy online test alignment: `837f356e4a3d092f8c1c5ec95b34904152cf8d2d`
- logical reconnect authority test: `c9936fffd59004d1878056a8db6931bbfd022dee`
- CI #3360 / run `36434401039`: SUCCESS
- CH-08 live evidence: room `MEJWMT`, cycles=5, seat=P2
- runtime evidence artifact: `10975546571`
- compiled build artifact: `10975586465`
- public compiled content unchanged from Pages #74 because CH-08 is test-only; no new mirror commit was necessary.

Roadmap next: Final Polish / Release Candidate Readiness. Preserve current gameplay/economy/Character percentages and online authority unless a release-candidate audit reveals a concrete defect.

---

