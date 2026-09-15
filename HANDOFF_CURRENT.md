# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the only user-accepted HOST-authoritative rollback baseline.

Validated artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress:
- HOST authority;
- replay/checksum determinism;
- remote Roll For Order;
- multiplayer Job Hub;
- Mini Game payout ownership;
- audio/BGM ownership;
- stale-token guard;
- READY/lap/final-result/podium chain.

Keep current names **TIN TỨC / LÁ BÀI**. Do not revive Tiên Tri / Phép Thuật.

## 2. Locked Draft D foundation

- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- five Mini Game spaces M09/M17/M26/M35/M44;
- M01 READY, M12 Jail Gate, M23 Lottery, M34 Hospital Gate;
- three forward-only equal-step Left/Right junctions;
- no backward traps, cycles, dead ends or hidden shortcuts.

Branch identity remains:
- **AN TOÀN 🛡️** = A1/A2/A3 Normal;
- **DRAMA 🎭** = B1 TIN TỨC / B2 LÁ BÀI / B3 TIN TỨC;
- **TIỀN 💰** = C1 +25 / C2 -20 / C3 +25 B$;
- comparison route = **PHỐ CHÍNH**.

Canonical human branch choice remains manual Left/Right through HOST authority. AUTO parity remains preview/QA only.

## 3. Presentation / authority inheritance

0.1.56.1 introduced the close-camera + fixed four-corner HUD architecture. It was CI-green but was not manually accepted before Ron asked development to continue.

0.1.57 added authoritative Jail / Hospital / Lottery / Mini Game eligibility. It is CI-green but also has no manual runtime acceptance recorded.

Current launcher now activates:
`CareerMinigameBoardScene058 as ActiveBoardScene`

Inheritance stays unbroken:
`058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

Therefore 0.1.58 keeps:
- close active-token camera;
- separate fixed UI camera;
- P1 TL / P2 TR / P3 BL / P4 BR HUD;
- explicit Overview;
- canonical manual branch framing;
- 0.1.57 special-location authority;
- 0.1.48 stale-token protection.

## 4. 0.1.57 special-location rules remain locked

### Jail
- hold node 100;
- release 1 / 3 / 5;
- failure = stay held, turn ends;
- success exit path `100 -> 101 -> 102 -> 103 -> 12`;
- release D6 is discarded;
- successful player returns to `PRE_ROLL_ACTION` in the same turn and rolls a fresh movement D6.

### Hospital
- hold node 110;
- release exactly 2 / 4 / 5;
- failure = stay held, turn ends;
- success path `110 -> 111 -> 112 -> 113 -> 34`;
- recovery D6 is discarded;
- then a fresh movement D6 in the same turn.

### Lottery
- M23 rolls a separate authoritative D6;
- reward = `D6 × 20 B$` = 20/40/60/80/100/120.

### Mini Game eligibility
- Jail/Hospital players excluded;
- 2+ eligible = normal Mini Game;
- 1 eligible = automatic rank #1;
- 0 eligible = skip/no payout.

Holding state remains checksum/replay critical. Held players cannot play Lá Bài before release.

## 5. 0.1.58 — TIN TỨC / LÁ BÀI Depth

Ron explicitly asked to keep building, so 0.1.58 was implemented without waiting for manual acceptance of prior candidates.

### LÁ BÀI depth

New held cards:
- **ACT_017 — Mời Lên Phường**: choose one free opponent and send them directly to Jail.
- **ACT_018 — Giường Bệnh Đã Đặt**: choose one free opponent and send them directly to Hospital.

Rules:
- both are before-roll targeted cards;
- target must be another player who is not already held;
- effect mutates authoritative `nodeId + specialHold` through normal HOST replay;
- card is consumed once only after successful resolve;
- target later follows the unchanged 0.1.57 release rules;
- no bail, alternate release die or hidden shortcut was introduced.

Card pool remains total weight 1000:
- N 600;
- R 300;
- SR 90;
- SSR 10.

### TIN TỨC depth

News pool now adds immediate authoritative variety:
- whole-table +15 B$ event;
- whole-table -15 B$ event;
- two weighted Jail relocation variants;
- one Hospital relocation variant.

Special News target a deterministic free opponent selected from a stable player list via content variant offset. No client RNG or second random stream was added.

News pool remains total weight 1000:
- positive self = 450;
- negative self = 210;
- immediate whole-table money = 160;
- special relocation = 120;
- normalize-to-average = 60.

### Presentation reconciliation

`CareerMinigameBoardScene058.ts` is presentation-only.

When a new authoritative `card_play` or `news` event proves another player changed into Jail/Hospital, the scene reconciles that target token to the authoritative destination. It does not submit gameplay intents or mutate gameplay state.

For News relocation, visual reconciliation waits for the current player's queued landing movement to complete first. Before moving the target token, it rechecks the latest authoritative node/hold so a stale delayed callback cannot drag an already-released player backward.

## 6. Explicit 0.1.58 deferrals

Not implemented yet:
- off-turn reaction/passive cards;
- counter windows;
- timed global statuses lasting N turns;
- alternate Jail/Hospital release cards;
- board-node traps/status placement.

These require an explicit authoritative timing/status layer. Do not fake them in presentation.

## 7. 0.1.58 implementation files

Core/content:
- `src/core/cards.ts`
- `src/core/news.ts`
- `src/core/testBot.ts`
- `src/content/core/cards_mvp.json`
- `src/content/core/news_mvp_demo.json`

Runtime/presentation:
- `src/scenes/TacticalChoiceBoardScene.ts`
- `src/scenes/CareerMinigameBoardScene058.ts`
- `src/main.ts`
- `src/ui/canonicalPresentation0561.ts` (architecture retained, visible build advanced to 0.1.58)

Tests/docs/CI:
- `tests/news-card-depth-058.ts`
- `tests/test-bot-autoplay.ts`
- `tests/content-depth-022.ts`
- `tests/economy-scale-025.ts`
- `tests/canonical-presentation-0561.ts`
- `tests/bugfix-pass-048.ts`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/PLAYTEST_0.1.58_NEWS_CARD_DEPTH.md`

## 8. 0.1.58 CI result

0.1.58 code candidate is **GREEN**.

Artifact from code HEAD before this handoff update:
- `mememe-playtest-0.1.58-news-card-depth`
- run `#1968` / `34920448578`
- runtime/package SHA `6abccee448ceed94eed16fe5c6961e6acbbe0b64`
- artifact ID `10377598474`
- size `8,584,746 bytes`
- SHA256 `c5379ff736b6859d519e6bc02f384504b3c35d9da6623fab7dbdcfb39479b2ba`
- expires 2026-09-29

All gates passed, including:
- typecheck/build;
- replay + lockstep + HOST authority;
- two-tab sync;
- special-location-aware bot stress;
- presentation/event flow;
- board/content/economy/party/tactical rules;
- Roll For Order;
- Job Hub;
- Mini Game host-system payout ownership;
- multiplayer presentation parity;
- inherited 0.1.48 stale-token/audio/dice gate;
- Draft D 0.1.50–0.1.56 regressions;
- 0.1.56.1 presentation architecture gate;
- 0.1.57 special-location authority gate;
- new 0.1.58 News/Card authority gate;
- package validation + artifact upload.

Two old tests initially failed because they encoded pre-0.1.58 assumptions:
- bot stress expected exactly one roll per turn, but Jail/Hospital legitimately add release rolls;
- economy test expected exactly two whole-table News, while 0.1.58 intentionally adds +15/-15 immediate global News.

The tests were updated to preserve stronger invariants instead of suppressing checks: release-roll determinism/no-deadlock is now explicit, and immediate group News remain bounded to compact economy values.

## 9. Status declaration

### 0.1.58 automated implementation
**CI GREEN / PACKAGED CANDIDATE**

### Manual runtime acceptance
**PENDING**

0.1.56.1, 0.1.57 and 0.1.58 must not be retroactively called user-accepted.

### Rollback baseline
**0.1.48 remains the only user-validated rollback baseline.**

## 10. Manual checklist

Use:
`docs/PLAYTEST_0.1.58_NEWS_CARD_DEPTH.md`

Highest-value checks:
1. Mời Lên Phường only targets free opponents and visibly sends target to Jail.
2. Giường Bệnh Đã Đặt visibly sends target to Hospital.
3. Held targets cannot be selected again.
4. Jail/Hospital release rules and fresh movement D6 remain unchanged.
5. Whole-table News change each player's B$ exactly once.
6. Special News relocates the intended eligible target without snapping unrelated tokens.
7. Long-run token movement still never snaps backward.
8. Camera/HUD/branches/Roll For Order/Job Hub/Mini Games/Lottery/READY/lap/podium still behave correctly.
9. Visible runtime says **0.1.58** and names remain **TIN TỨC / LÁ BÀI**.

## 11. Roadmap

- 0.1.54 AUTO/MANUAL preview sandbox — done
- 0.1.55 Draft D canonical topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, no manual acceptance recorded
- 0.1.57 special-location authority — CI green, manual acceptance pending
- **0.1.58 TIN TỨC / LÁ BÀI depth — CI green, manual acceptance pending**
- 0.1.59 Job + five-space Mini Game depth — next development milestone
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains historical input. Its safe immediate effects have begun migrating into the current TIN TỨC / LÁ BÀI systems.

Do not merge PR #1.
