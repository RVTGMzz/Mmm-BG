# MMM — 2026-09-28 CHARACTER BALANCE AUDIT CH-06

**PROBABILITY + CHARACTER-ENABLED FULL MATCH ECONOMY AUDIT: PASS**

CH-06 validates the approved percentage-based Character passives instead of returning to once-per-lap cooldowns.

Observed 5,000-trigger probability checks:
- KHÓC NHÈ target 40% -> observed 40.02%
- CAU CÓ target 50% -> observed 49.94%
- LO LẮNG target 20% -> observed 20.16%
- TĂNG ĐỘNG target 45% -> observed 46.48%
- SECRET BABY target 60% -> observed 58.66%

Character-enabled 2-lap simulation batch:
- 32 starter-roster matches + 24 Secret-Baby-roster matches;
- all matches finish all 4 players;
- starter direct passive amount average = 60.00B$ per 2-lap match (includes CAU CÓ transfer amount, which is zero-net economy);
- KHÓC NHÈ: 93 events / 930B$ refund total;
- CAU CÓ: 149 events / 745B$ transferred total;
- LO LẮNG: 289 successful bonus-card draws / 0 direct B$;
- TĂNG ĐỘNG: 203 events / 1015B$ bonus total;
- SECRET BABY: 92 events / 1380B$ refund total across 24 Baby matches.

Decision after audit:
- keep 40/50/20/45/60 for the first live playtest;
- LO LẮNG is a watchlist item because it is the most frequent passive, but its hand limit and zero direct B$ make premature nerfing unjustified before human playtest data;
- no percentage is tuned from one deterministic bot batch alone.

Important engineering repair during CH-06:
- a JS String.replace replacement containing the special `$\`` token duplicated `playtestTelemetry061.ts`;
- root cause was fixed by rebuilding from the last clean blob and using replacement functions so dollar signs are literal;
- final telemetry source is a single clean 8.8KB file, not duplicated content.

Validated checkpoint:
- CH-06 source/audit: `a405fe8b094e10c2b5c64a6748e4caacf7490279`
- telemetry root-cause repair: `fc64132752458e3f604fb765ac54d96082f8ec48`
- CI #3354 / run `36421942096`: SUCCESS
- runtime evidence artifact: `10969458992`
- public mirror: `72f99c965aa13ea7232e036dc7fa9b07fa925734`
- Pages #74: SUCCESS

Next roadmap block: Economy & Pacing Pass with Character-enabled match-length audits.

---

