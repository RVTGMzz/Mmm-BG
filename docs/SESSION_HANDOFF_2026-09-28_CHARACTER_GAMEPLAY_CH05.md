# MMM — 2026-09-28 CHARACTER GAMEPLAY PASS CH-05

Canonical source branch: `mmm-mvp-0.1-core`

**AUTHORITATIVE CHARACTER ID + PERCENT-BASED PASSIVES + REPLAY + RUNTIME VISUAL PROOF: PASS**

Approved gameplay direction changed during implementation from once-per-lap cooldowns to independent percentage rolls on each eligible trigger.

Live signature passives:
- KHÓC NHÈ / ĐƯỢC DỖ: 40% when a qualifying loss >=20B$ occurs; refund +10B$.
- CAU CÓ / ĐỪNG CHỌC TUI: 50% when directly targeted by another player's Card; counter-transfer 5B$.
- LO LẮNG / LO XA: 20% at an eligible free turn start when hand is not full; draw 1 Card.
- TĂNG ĐỘNG / KHÔNG NGỒI YÊN: 45% whenever eligible for a Mini Game start; +5B$.
- SECRET BABY / BÉ CƯNG CỦA VŨ TRỤ: 60% on qualifying loss >=20B$; refund +15B$.

Authority rules:
- `characterId` is now part of authoritative MatchState/checksum and survives replay/reconnect.
- Character reaction rendering prefers MatchState characterId, with gameSession only as legacy fallback.
- all passive chance rolls consume HOST/replay RNG only after their trigger condition is eligible.
- no client Math.random().
- no once-per-lap cooldown state remains.
- passive events expose `chancePercent` + `rollPercent` for future telemetry/balance work.

Runtime proof:
- CH-05 CI gate passes.
- passive popup shows the visible probability/roll line.
- manually inspected `full-scene-passive-1280x800.png` and `full-scene-passive-960x540.png`: both fit, remain readable, and show the full chance/roll line.

Validated checkpoint:
- authoritative Character identity foundation: `fa2fcea8...`
- probability refactor: `15acba9b5da21a7c66768b7fa0d55502d019859c`
- authoritative reaction fallback: `95cf4ab57fe8fcd2c72bf1c85ba3647be090503a`
- passive runtime visual proof: `888e8e69d5b51f69e369ba7438fb4df096c47ef2`
- final validated source: `b346eb8dd789621d4d190d71daa1a4b6dce88268`
- CI #3350 / run `36409702814`: SUCCESS
- runtime evidence artifact: `10963629691`
- public mirror: `f85b29d1dfcacf11a567d5099672c8dfabd49c6a`
- Pages #73: SUCCESS

Next Character task: run a deterministic Character Balance Audit over many character-enabled matches before tuning any percentages or payout amounts.

---

