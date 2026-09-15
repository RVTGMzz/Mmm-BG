# MeMeMe Gameplay Upgrade Roadmap — 0.1.54+

Status: **approved working roadmap / updated after 0.1.56 manual UI review**.

This roadmap defines the transition from the Draft D sandbox into the standard `START_PLAYTEST.bat` gameplay flow.

## 0.1.54 — Close the sandbox loop — DONE

Purpose: make Draft D fast to QA without pretending it is the main game.

- `START_DRAFT_D_PREVIEW.bat` remains a sandbox launcher.
- Preview branch mode defaults to **AUTO**.
- AUTO branch uses deterministic RNG derived from the preview seed.
- Same seed reproduces the same branch-choice sequence.
- A fixed HUD toggle switches **AUTO / MANUAL**.
- MANUAL preserves the real `RẼ TRÁI / RẼ PHẢI` chooser.
- `START_DRAFT_D_FULL_MAP.bat` remains topology review only.
- `START_FINAL_MAP_PREVIEW.bat` is legacy and must not ship in tester packages.
- `START_PLAYTEST.bat` remains the standard gameplay launcher and the final integration target.

No authoritative gameplay migration happens in 0.1.54.

## 0.1.55 — Integrate Draft D into standard gameplay — CANDIDATE DONE

Purpose: move the approved map/topology into the real HOST-authoritative match flow behind `START_PLAYTEST.bat`.

Locked candidate invariants:

- keep the 0.1.48 HOST-authoritative baseline;
- preserve replay/checksum determinism;
- preserve multiplayer spectator parity;
- preserve Roll For Order, Job Hub, Mini Game, salary, payout, audio and final-result logic;
- use Draft D 44-space topology and three forward-only decision junctions;
- real players choose **RẼ TRÁI / RẼ PHẢI**;
- route choice is an authoritative player intent resolved by HOST;
- no branch may create backward movement, cycles, dead ends or endless wandering;
- Draft D contains **5 Mini Game spaces**, `M09 / M17 / M26 / M35 / M44`.

0.1.55 passed CI as the first canonical Draft D gameplay package. User visual acceptance is separate from CI validation.

## Jail / Hospital release rule — locked

When a detained/hospitalized player starts their turn:

1. roll the release D6;
2. Jail releases on `1 / 3 / 5`;
3. Hospital releases on exactly `2 / 4 / 5`;
4. failed release ends that player's turn and they retry next turn;
5. successful release moves through the visible 3-space exit path;
6. after release, the player **must roll a fresh movement D6** to continue the same turn.

The release die is **only a release check** and is never reused as movement distance.

## Mini Game eligibility — locked core rule

Holding locations remove a player from the current Mini Game participant pool:

- player in `JAIL` = not eligible;
- player in `HOSPITAL` = not eligible;
- `2+` eligible players = play normally;
- exactly `1` eligible player = **auto rank #1**;
- `0` eligible players = skip the Mini Game and pay nobody.

Implementation dependency: authoritative enforcement lands when 0.1.57 introduces real Jail/Hospital holding state. 0.1.59 may deepen Mini Game types and pacing, but must not change this eligibility rule.

## 0.1.56 — Give branches gameplay identity — FUNCTIONAL CI CANDIDATE

Purpose: make left/right choices meaningful without creating an objectively best route.

Locked branch identities:

- **AN TOÀN 🛡️**: `A1 / A2 / A3 = Normal / Normal / Normal`;
- **DRAMA 🎭**: `B1 / B2 / B3 = TIN TỨC / LÁ BÀI / TIN TỨC`;
- **TIỀN 💰**: `C1 / C2 / C3 = +25 / -20 / +25 B$`;
- the other route at each junction is shown as **PHỐ CHÍNH** with mixed content;
- route identity comes from node content distribution, not hidden distance advantage;
- equal movement length between split and merge remains locked for this candidate;
- branch picker shows flavor, route summary and risk instead of legacy node/parity debug copy.

0.1.56 is CI-green for gameplay/regression coverage, but Ron's manual test on 2026-09-15 exposed that `START_PLAYTEST.bat` still uses the old prototype presentation shell. Therefore 0.1.56 is **not visually accepted as the canonical build**.

Root-cause audit:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

Relative balance between the three flavors is intentionally provisional until 0.1.60 real-match economy tuning.

## 0.1.56.1 — Canonical Presentation Consolidation — IMMEDIATE BLOCKER

Purpose: make `START_PLAYTEST.bat` look and behave like the primary/best gameplay build before adding deeper systems.

Required work:

- preserve all 0.1.56 authoritative gameplay/state logic;
- replace the old fixed/full-board presentation with a close active-player camera;
- reuse/extract the proven Draft D preview camera techniques instead of duplicating gameplay state;
- fixed screen-space four-corner HUD: P1 TL / P2 TR / P3 BL / P4 BR;
- active player clearly highlighted;
- branch junction briefly frames both routes, then returns to close follow;
- explicit Overview/full-map mode only;
- make the 44-space greybox readable without giant overlapping circles;
- integrate Mini Game/Job identity cleanly into tile presentation;
- resize/reframe TIN TỨC/LÁ BÀI surfaces so board context and HUD are not swallowed;
- replace chained version-label text mutation with one authoritative visible build source;
- visible runtime must not incorrectly show `0.1.25` when running 0.1.56+;
- keep replay/checksum, HOST authority, multiplayer parity, movement guard, Job, Mini Game payout ownership, audio and final-result invariants green.

Manual acceptance is required before calling the presentation shell canonical.

Design sources:
- `docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`
- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
- `docs/UI_FINAL_PLAYER_HUD.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`
- `src/scenes/FinalMapPreviewScene052.ts` as implementation reference only

Do not mix 0.1.57 special-location gameplay into this pass.

## 0.1.57 — Complete Jail / Hospital / Lottery integration — AFTER 0.1.56.1

- HOST-authoritative holding state;
- locked release-face rules;
- release die only checks escape/recovery;
- successful release traverses the visible 3-space exit route and opens a fresh movement roll in the same turn;
- Lottery = `D6 × 20 B$`;
- TIN TỨC / LÁ BÀI can send valid targets to Jail/Hospital through explicit effects;
- Mini Game participant list excludes Jail/Hospital players;
- one eligible participant auto-wins rank #1; zero eligible participants skip with no payout.

## 0.1.58 — Upgrade TIN TỨC / LÁ BÀI interaction

Build from `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`.

Target effect families include:

- money gain/loss/steal/transfer;
- move self/target;
- send target to Jail/Hospital;
- protection / reaction / counterplay where already supported by authoritative timing;
- global TIN TỨC events;
- held LÁ BÀI targeted play.

Do not revive old Tiên Tri / Phép Thuật labels.

## 0.1.59 — Function-space depth

- Job Hub identity and career consequences;
- deepen the **5-space Mini Game system** with more game types/variety;
- Mini Game pacing and payouts;
- district/branch identity tied to Job, economy, events and party mechanics;
- keep Mini Game payout host-system owned and one-shot;
- preserve the locked Jail/Hospital eligibility rule.

## 0.1.60 — Match pacing + economy playtest

Measure with the real integrated board before tuning:

- average turns per lap;
- real match duration;
- Jail/Hospital downtime;
- branch-choice frequency;
- TIN TỨC / LÁ BÀI frequency;
- frequency of the **5 Mini Game spaces** in real play;
- B$ inflation/deflation;
- catch-up behavior.

Do not rebalance the economy from empty-map theory alone.

## Presentation lesson from 0.1.56

The earlier plan said presentation polish could wait until after gameplay integration. Manual testing showed that this went too far: the new 44-space authoritative board was being judged through an old fixed-screen prototype shell.

Going forward:

- presentation may remain greybox;
- final art may wait;
- **camera/HUD/readability cannot wait** when topology changes materially;
- canonical `START_PLAYTEST.bat` must always be the best integrated experience;
- preview launchers are QA tools, not the place where superior camera/HUD behavior lives permanently.

The combined visual reference remains:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Its AI text/numbering is non-authoritative.
