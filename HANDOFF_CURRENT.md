# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. Safety / rollback baseline

MVP **0.1.48** remains the last explicitly user-accepted HOST-authoritative rollback baseline.
Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, stale-token protection, movement-actor camera lock, Jail/Hospital release flow, or final-result/podium/rematch flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.70

**0.1.70 — Career Traits / Đặc tính nghề nghiệp**

Manual status: **PENDING RON ACCEPTANCE**.

Canonical flow:
`Splash logo → Lobby → Setup → Chọn độ dài → Roll For Order → Trận → Podium → Rematch`

0.1.70 adds authoritative Career Trait rules while retaining the accepted authority architecture. Career Trait decisions are resolved by HOST/replay core. UI only presents the rule/result and must not own gameplay RNG.

Build identity:
- version `0.1.70`;
- phase `CAREER TRAITS`;
- artifact name `mememe-playtest-0.1.70-career-traits`.

## 3. Runtime chain

Current board runtime remains:
`CareerMinigameBoardScene069 as ActiveBoardScene`

Inheritance:
`069 -> 0682 -> 0681 -> 068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.70 Career Traits are authoritative core rules layered beneath the existing canonical presentation wrapper. Do not create a second scene/runtime path just to carry the 0.1.70 version number.

## 4. Canonical Career Trait release rules

Source of truth:
`src/core/careerTraits070.ts`

Canonical default release faces:
- Đồn / Jail: `1 / 3 / 5`;
- Bệnh viện / Hospital: `2 / 4 / 6`.

Career overrides currently enforced by authority:
- 👮 **Cảnh sát / Nghiệp vụ** at Jail: `1 / 3 / 4 / 5`;
- 🩺 **Bác sĩ / Trực cấp cứu** at Hospital: `2 / 4 / 5 / 6`;
- 🦹 **Trộm cắp / Tiền án** at Jail: only `1 / 5`;
- 🤸 **Cascader / Chấn thương nghề** at Hospital: only `2 / 6`.

The canonical Job pool is now **12 Jobs**. Every Job has a registered Career Trait identity. Only traits with a `releaseFaces` override change the Jail/Hospital release table in 0.1.70.

## 5. Hold-source trait persistence

A criminal Job can be cleared immediately when the player is arrested. 0.1.70 therefore stores:
`specialHoldSourceJobId`

This keeps the Job that caused the hold available for the duration of that hold. It is required so `JOB_THIEF` still uses the restrictive `1 / 5` Jail release rule after arrest clears the active illegal Job.

Do not remove this field from authoritative state, replay or checksum coverage without deliberately redesigning the rule.

## 6. Authority / determinism contract

Career Trait release authority uses:
- `careerReleaseFaces070(...)`;
- `careerReleaseSucceeds070(...)`;
- authoritative player/hold state;
- deterministic D6 result already owned by HOST/replay core.

Do not reintroduce the historical direct runtime call to `specialReleaseSucceeds057(location, result)` for current 0.1.70 authority.

Career Trait policy must contain no `Math.random` and no client-owned result path.

Regression guard:
`tests/career-traits-070.ts`

It locks:
- default Jail/Hospital release tables;
- Police/Doctor/Thief/Cascader overrides;
- 12-Job pool and trait registry coverage;
- Thief hold-source persistence;
- replay integration and deterministic policy.

## 7. Deterministic simulation baseline for 0.1.70

32 deterministic full matches remain seeded `611100..611131`.

Current batch summary:
- turns: avg `63`, max `92`;
- final money spread: max `399`;
- longest-match outlier: seed `611102`;
- largest-spread outlier: seed `611112`.

Locked sentinel fingerprints in `tests/outlier-replay-064.ts`:

### Seed 611102 — longest match
- checksum `56c6487d`;
- turns `92`;
- commands `145`;
- submitted `128`;
- money total `1570`;
- spread `177`;
- movement `76`;
- release rolls `22`;
- cards `14`;
- news `8`;
- Mini Games `12`, payout `565`;
- Jobs selected `4`;
- Lottery `1 / 40B$`;
- finish IDs `3,2,1,0`;
- final money `365,323,500,382`.

### Seed 611112 — largest money spread
- checksum `a5aa724b`;
- turns `76`;
- commands `124`;
- submitted `110`;
- money total `1885`;
- spread `399`;
- movement `68`;
- release rolls `15`;
- cards `14`;
- news `8`;
- Mini Games `10`, payout `380`;
- Jobs selected `3`;
- Lottery `2 / 180B$`;
- finish IDs `1,2,0,3`;
- final money `432,341,372,740`.

Historical 0.1.63.4 fingerprints remain historical and must not be rewritten to masquerade as current 0.1.70 results.

## 8. Inherited 0.1.69 presentation contract

0.1.70 retains the 0.1.69 first-impression layer and the permanent canonical UI/UX rules.

Official logo:
`public/assets/mememe-logo.webp`

Splash:
`src/scenes/SplashScene069.ts`

Permanent rules:
`docs/CANONICAL_UI_UX_RULES.md`

Keep:
- mobile-first readability;
- summary first, detail on demand;
- idle HUD compact, active HUD expanded;
- Job text owned by the player-card surface;
- strict modal ownership;
- viewport-safe reaction bubbles;
- touch/keyboard/controller parity;
- soft rounded surfaces by default;
- presentation wrappers authority-safe.

Historical 0.1.68 and 0.1.68.2 tests are now version-forward guards. They may validate newer canonical wrappers and must not hard-lock the active build back to 0.1.69.

## 9. Green functional checkpoint

Functional/gameplay source checkpoint:
`9ded1e70eb6cda0f8902dabcf0be526ccd72f670`

This checkpoint passed the complete suite through:
- deterministic simulation + new 0.1.70 outlier sentinels;
- 0.1.68 inherited vertical slice;
- canonical UI/UX contract;
- 0.1.68.2 HUD/detail/safe-bubble guard;
- 0.1.69 first-impression guard;
- **0.1.70 Career Traits authoritative release guard**;
- face transform bounds;
- external package validation;
- 0.1.70 playtest guide packaging.

Last code/workflow commit before these handoff docs:
`174c918318369d36b9fe9c6689d80bdbaf7f86c4`

It is a workflow-only descendant of `9ded1e70...` and makes Steam Deck artifact uploads quota-tolerant without changing the compiled game.

Exact-head validation for `174c918...`:
- push CI run `#2830` / `35190952684`: **SUCCESS**;
- PR CI run `#2831` / `35190956263`: **SUCCESS**;
- Steam Deck Web Playtest run `#218` / `35190953379`: **SUCCESS**;
- publisher run `#174` / `35190953319`: **SUCCESS**.

## 10. Artifact storage quota

GitHub Actions artifact storage quota is currently exhausted. A valid build must not be marked broken only because `actions/upload-artifact` cannot create another ZIP.

`.github/workflows/pages-playtest.yml` now treats standalone/mirror artifact uploads as best-effort and only runs Pages deployment when the Pages artifact is actually available.

Main CI artifact upload is also non-blocking.

Therefore, **do not promise a fresh 0.1.70 Actions artifact ID/hash until quota is available and a real artifact is verified**.

This quota condition does not alter source correctness or the canonical public mirror publisher.

## 11. Public web deployment

Public mirror repo:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Current compiled public commit:
`7d3b33f40cad4519a329422336f6972ab492788a`

Commit message:
`Publish compiled MeMeMe web playtest 9ded1e70eb6cda0f8902dabcf0be526ccd72f670`

The later source commit `174c918...` changes workflow YAML only, so publisher run #174 correctly had no new game bundle to commit.

Public URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Publisher exact-SHA CI gating, current-branch-HEAD gating and concurrency protection remain mandatory. Do not weaken them.

## 12. 0.1.70 manual acceptance

Playtest guide:
`docs/PLAYTEST_0.1.70_CAREER_TRAITS.md`

Priority runtime checks:
1. Baseline Jail release succeeds only on `1/3/5` and baseline Hospital only on `2/4/6`.
2. Police at Jail additionally releases on `4`.
3. Doctor at Hospital additionally releases on `5`.
4. Cascader at Hospital must fail on `4` and release only on `2/6`.
5. Thief arrested by career check loses the active illegal Job but the hold remembers `JOB_THIEF`; Jail release must be only `1/5`.
6. Successful release closes the hold flow and provides a fresh movement D6 in the same turn without freezing.
7. Failed release advances the turn normally.
8. HOST, CPU and human paths use the same authoritative release result.
9. Job Hub stays compact and trait details remain detail-on-demand.
10. Full flow still reaches Podium/Rematch for 1/2/3 target laps.
11. Continue watching the historical long-run token snap-back issue.

CI PASS means **candidate**, not human Runtime PASS. Do **not** call 0.1.70 user-accepted until Ron manually validates the shipped runtime, especially Doctor, Thief and one baseline hold release flow.

## 13. Next step

Runtime-playtest the live **0.1.70 Career Traits candidate** using `docs/PLAYTEST_0.1.70_CAREER_TRAITS.md`.

If runtime feedback is clean, preserve this checkpoint and move to the next scoped milestone. If not, fix as 0.1.70.x without weakening authority or the canonical UI/UX contract.

Do not merge PR #1.
