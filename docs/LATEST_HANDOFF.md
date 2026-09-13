# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.23 — Reaction & Route Personality (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.23`**.

Read first:
1. `docs/MVP_0.1.23_PROGRESS.md`
2. `docs/PLAYTEST_0.1.23.md`
3. `src/content/core/card_reactions_023.json`
4. `src/ui/presentationModel.ts`
5. `src/ui/routeFeedback.ts`
6. `src/scenes/PresentationParityBoardScene.ts`
7. `tests/reaction-route-023.ts`
8. `docs/MVP_0.1.22_PROGRESS.md`
9. `src/content/core/cards_mvp.json`
10. `src/content/core/news_mvp_demo.json`
11. `src/ui/tileIdentity.ts`
12. `src/ui/SettingsPanel.ts`
13. `src/audio/bgmController.ts`
14. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## What 0.1.23 changed

### Card reactions now match the effect

The old generic Card attack banter is no longer the only presentation path.

`src/ui/presentationModel.ts` maps the Card definition to one of four presentation-only reaction scripts:
- steal money → `CARD_STEAL_023`
- card lock → `CARD_BLOCK_023`
- 30% all-opponents loss → `CARD_GROUP_CURSE_023`
- full-money swap → `CARD_SWAP_023`

The reaction definitions live in `src/content/core/card_reactions_023.json`.

This mapping is presentation-only. MatchState, replay command flow and gameplay RNG were not changed.

### Odd/even branch choice is now visible

Automatic parity routing remains authoritative and unchanged:
- odd → main route / `PHỐ CHÍNH`
- even → branch route / `HẺM TẮT`

The active board wrapper now shows a compact top-center banner for roughly one second when the branch is chosen. It contains:
- route name;
- current player;
- dice value;
- `LẺ` or `CHẴN`;
- a note that routing was automatic.

The banner does **not** block input, does not add a new acknowledgement step and does not create a gameplay event.

## Existing behavior retained

- 11 Card / 8 News pool from 0.1.22;
- named City tile identity;
- Card/News/Reaction timing policy from 0.1.19;
- node-by-node token movement;
- pip dice showing authoritative result;
- active-turn halo and compact HUD;
- Settings gear containing BGM volume / BGM mute / FX mute;
- early Menu BGM preload and first-gesture unlock behavior;
- result/ranking deferral until final presentation finishes;
- image crop/zoom/rotate + runtime compression;
- CPU remains QA-only.

## Regression

New command:

`npm run test:reaction-route`

It verifies:
- all four Card effect classes map to the intended reaction event;
- reaction speaker roles remain deterministic;
- odd route feedback resolves to `LẺ`;
- even route feedback resolves to `CHẴN`;
- route labels stay explicit and automatic.

All prior deterministic/replay/authority/presentation/content/image/package checks remain enabled.

## Current artifact status

Validated GitHub Actions run:

`34756511376` / run `#529`

Artifact:

`mememe-playtest-0.1.23`

Artifact digest:

`sha256:ed2361fcbb87689e48817193cd4fa3dbec769e72d2547700215ba3a91726044f`

Artifact size: ~8.50 MB.

GitHub run URL:

`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34756511376`

CI passed through artifact upload, including **Card reaction personality and route feedback**.

## Recommended next work

First visually validate 0.1.23:
1. route banner is readable but does not cover future map art;
2. banner disappears quickly and never pauses movement;
3. steal / block / group-loss / swap Cards clearly feel like different interactions;
4. reaction timing still does not backlog into endgame;
5. 0.1.22 Card/News variety still feels balanced enough for the current MVP.

If accepted, the next useful milestone should add **genuinely new gameplay mechanics**, not more copies of existing effects. Good candidates:
- one or two new Card effect types;
- a new News outcome type;
- a special tile/mechanic that creates a meaningful choice while keeping authority deterministic;
- keep all new permanent preferences inside the existing Settings shell.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute or re-encode approved BGM.
- Do not fake/bypass browser autoplay policy.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put Settings/BGM/SFX/image preferences into gameplay-critical MatchState.
- Presentation eventLog remains excluded from gameplay checksum.
- Snapshot resync must not replay stale presentation events.
- Result/ranking must not cover unresolved final-turn presentation.
- Route feedback must remain non-blocking and must not replace host-authoritative `choose_branch`.
- Dice presentation must display the authoritative result.
- Original face files must not be silently uploaded or persisted.
- CPU remains a QA bot, not final gameplay AI.
