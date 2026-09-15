# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep **TIN TỨC / LÁ BÀI** names. Do not revive Tiên Tri / Phép Thuật.

## Current automated candidate

**MVP 0.1.58 — TIN TỨC / LÁ BÀI Depth**

Automated status: **CI GREEN / PACKAGED**
Manual runtime status: **PENDING RON ACCEPTANCE**

Code-candidate artifact before the handoff documentation update:
- `mememe-playtest-0.1.58-news-card-depth`
- run `#1968` / `34920448578`
- runtime/package SHA `6abccee448ceed94eed16fe5c6961e6acbbe0b64`
- artifact ID `10377598474`
- size `8,584,746 bytes`
- SHA256 `c5379ff736b6859d519e6bc02f384504b3c35d9da6623fab7dbdcfb39479b2ba`
- expires 2026-09-29

## Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene058 as ActiveBoardScene`

Inheritance:
`058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.58 retains the close-camera/four-corner-HUD presentation, 0.1.57 special-location authority and the validated 0.1.48 stale-token guard.

Neither 0.1.56.1, 0.1.57 nor 0.1.58 has manual user acceptance recorded. Ron explicitly asked development to continue, so CI-green candidates advanced without retroactively marking previous candidates accepted.

## 0.1.58 LÁ BÀI depth

New authoritative held cards:
- **Mời Lên Phường**: choose a free opponent and send them directly to Jail.
- **Giường Bệnh Đã Đặt**: choose a free opponent and send them directly to Hospital.

The target must not already be held. The effect changes authoritative `nodeId + specialHold`, is replay/checksum deterministic, consumes the card once, and then relies on the unchanged 0.1.57 release rules.

Card pool remains weight 1000:
- N 600 / R 300 / SR 90 / SSR 10.

## 0.1.58 TIN TỨC depth

The News pool now includes:
- immediate whole-table +15 B$;
- immediate whole-table -15 B$;
- two weighted Jail relocation variants;
- one Hospital relocation variant.

Special News pick a free opponent deterministically from a stable candidate list via content variant offset. No second RNG stream or client RNG was added.

News pool remains weight 1000:
- positive self 450;
- negative self 210;
- immediate group money 160;
- special relocation 120;
- average normalization 60.

## Presentation

`CareerMinigameBoardScene058` only reconciles target-token visuals after incoming authoritative Card/News relocation state. It does not mutate gameplay or submit effect intents.

A delayed News reconciliation rechecks the current authoritative node/hold before moving the target, preventing a stale callback from dragging a newer token state backward.

## Explicit deferrals

Still deferred until there is a proper authoritative timing/status layer:
- off-turn reaction/passive cards;
- counter windows;
- timed global statuses;
- alternate Jail/Hospital release cards;
- board-node traps/status placement.

Do not implement these as presentation-only shortcuts.

## CI status

Run #1968 is fully green. It passed:
- typecheck/build;
- replay/lockstep/HOST authority;
- two-tab + multiplayer parity;
- special-location-aware bot stress;
- board/content/economy/party/tactical rules;
- Roll For Order;
- Job Hub;
- Mini Game host-system payout ownership;
- inherited 0.1.48 audio/dice/stale-token contract;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 presentation architecture;
- 0.1.57 special-location authority;
- new 0.1.58 News/Card authority test;
- package validation + artifact upload.

Old bot/economy gates were updated where they encoded assumptions invalidated by intentional 0.1.58 behavior. They now explicitly test deterministic release rolls, no deadlock, fixed total content weights and compact global B$ values instead of hard-coding the old content count.

## Manual test guide

`docs/PLAYTEST_0.1.58_NEWS_CARD_DEPTH.md`

Priority checks:
- both new special cards target only free opponents;
- target visually reaches Jail/Hospital;
- old release/fresh-D6 behavior remains exact;
- new global News applies B$ exactly once;
- special News does not snap unrelated tokens;
- long-run token movement remains stable;
- camera/HUD/branches/Roll For Order/Job Hub/Mini Games/Lottery/READY/lap/podium remain intact;
- visible build says **0.1.58** and vocabulary remains **TIN TỨC / LÁ BÀI**.

## Roadmap

- 0.1.54 sandbox — done
- 0.1.55 canonical Draft D topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, no manual acceptance recorded
- 0.1.57 special-location authority — CI green, manual acceptance pending
- **0.1.58 TIN TỨC / LÁ BÀI depth — CI green, manual acceptance pending**
- 0.1.59 Job + five-space Mini Game depth — next
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
