# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.18.1 — Presentation Flow Fix (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.18.1`**.

Read first:
1. `docs/PLAYTEST_0.1.18.1.md`
2. `docs/MVP_0.1.18_PROGRESS.md`
3. `src/scenes/PresentationParityBoardScene.ts`
4. `src/ui/MatchPresentationLayer.ts`
5. `src/ui/presentationFlowPolicy.ts`
6. `tests/flow-fix.ts`
7. `src/ui/FaceImageEditor.ts`
8. `src/audio/sfxController.ts`
9. `src/audio/bgmController.ts`
10. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Why 0.1.18.1 exists

Real playtest of 0.1.18 exposed a presentation-flow bug:

- gameplay/CPU continued while Tile/Card/News/Reaction cinematics were still queued;
- reactions therefore appeared late and could dump in a large backlog near the result screen;
- branch selection still interrupted play with a manual picker even though the intended MVP rule is dice parity.

0.1.18.1 fixes those issues without changing gameplay checksum architecture.

## Presentation flow gate

`MatchPresentationLayer` is now blocking for recognized presentation events.

Flow:
1. authoritative event arrives;
2. its panel/FX/SFX appears;
3. reactions for that event finish in sequence;
4. UI shows `SPACE / ENTER / CLICK • TIẾP TỤC`;
5. acknowledge closes that presentation step;
6. only after the presentation queue is empty are human controls / CPU actions re-enabled.

A short unlock delay prevents the same click/SPACE used to dismiss a panel from also becoming the next gameplay input.

### Autoplay exception

Only dedicated **4 CPU AUTOPLAY** may auto-ack presentation.

Human-containing modes, including **1 human + 3 CPU**, must wait for explicit acknowledge. This rule is centralized in `src/ui/presentationFlowPolicy.ts` and regression-tested.

## Odd / even branch rule

Branch picker is no longer shown during normal play.

At a fork:
- odd roll → edge with `parity: odd`;
- even roll → edge with `parity: even`.

Current MVP fork:
- odd → `PHỐ CHÍNH` → node 5;
- even → `HẺM TẮT` → node 18.

The game still records an authoritative `choose_branch` command, so replay, checksum and host authority semantics remain intact.

CPU QA now uses the same `pickParityEdge()` rule instead of selecting a branch from turn/player indexing.

## Regression added

New command:

`npm run test:flow`

It locks:
- only seats P1/P2/P3/P4 all CPU may enable presentation auto-advance;
- 1 human + 3 CPU must remain manual-ack;
- landing + News in one authoritative batch count as two blocking presentation steps;
- log-only events do not add blocking panels;
- odd rolls choose node 5 / `PHỐ CHÍNH`;
- even rolls choose node 18 / `HẺM TẮT`.

CI now runs `test:flow` alongside replay, lockstep, host/client, authority, two-tab, demo-shell, CPU stress, presentation, image and package checks.

## Current artifact status

Latest validated artifact:

`mememe-playtest-0.1.18.1`

Run: `34749727990`

Artifact digest:

`sha256:d060bf0c8d67558c8510b8e46c3f79cd71c8f9fc8185b54d4866d04bae9e9880`

Full CI passed including:
- TypeScript + Vite build;
- deterministic replay;
- lockstep peer;
- host/client queue + resync;
- authority protocol;
- two-tab session;
- demo shell/rematch;
- 4-CPU stress;
- Tile/Card/News/Reaction presentation;
- presentation flow gate + parity routing;
- face image transform;
- package/BGM checksum validation;
- artifact upload.

## Existing 0.1.18 features retained

- Face Image Editor: drag, crop, zoom, pinch, rotate, reset, preview;
- runtime face sticker 320×320 with WebP ~0.84 when supported;
- Tile landing presentation;
- Card/News cinematic presentation;
- reaction bubbles;
- floating B$ / burst / confetti / card FX;
- synthesized SFX with separate FX mute;
- approved four-track BGM with fade transitions.

## BGM source-of-truth

Approved runtime audio remains:

```text
public/audio/bgm/01_Menu_MeMeMe.ogg
public/audio/bgm/02_City_Bubble.ogg
public/audio/bgm/03_City_Silly.ogg
public/audio/bgm/04_Final_Round.ogg
```

All four files remain checksum-locked by package validation. Do not re-encode or substitute them.

## Recommended next work

First priority is **real playtest validation of 0.1.18.1**:
1. confirm no old reaction appears after the event it belongs to;
2. confirm landing → Card/News steps advance one-by-one on acknowledge;
3. confirm the result/ranking screen never receives stale queued presentation;
4. confirm odd/even routing feels intuitive without a branch picker;
5. confirm 4 CPU AUTOPLAY still finishes unattended.

Only after this flow is accepted:
- tune FX/SFX intensity and panel readability;
- consider presentation-only personality sync;
- decide explicit privacy contract before any face sharing to client tabs;
- eventually replace synth SFX with approved audio assets.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute/re-encode approved BGM.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put image/BGM/SFX preferences into gameplay-critical MatchState.
- Presentation eventLog may sync/serialize but remains excluded from gameplay checksum.
- Original face files must not be silently uploaded or persisted.
- Snapshot resync must not replay stale presentation events.
- Human-containing modes must not silently auto-advance presentation.
- CPU remains a QA bot, not final gameplay AI.
