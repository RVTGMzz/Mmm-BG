# MeMeMe — START_PLAYTEST UI Audit after 0.1.56

Status: **USER-REPORTED PRESENTATION BLOCKER / ROOT CAUSE CONFIRMED**

Date: 2026-09-15
Branch: `mememe-mvp-0.1-core`
PR: #1 remains Draft/Open. Do not merge unless Ron explicitly asks.

## Why this audit exists

Ron manually tested the 0.1.56 artifact through `START_PLAYTEST.bat` and correctly flagged that the canonical gameplay launcher looks much more temporary than the Draft D preview work.

The complaint is valid: **0.1.55/0.1.56 migrated the canonical Draft D board data and branch gameplay into the authoritative runtime, but did not migrate the Draft D camera/HUD presentation architecture into that runtime.**

Therefore 0.1.56 is functionally useful and CI-green, but its current `START_PLAYTEST.bat` presentation is **not accepted as the canonical visual shell**.

## Manual playtest symptoms

Observed from Ron's 2026-09-15 screenshots:

- Header still visibly says `CITY • MVP 0.1.25 • 200B$ ECONOMY`.
- Bottom-right badge still says `PLAYTEST 0.1.25 • ECONOMY`.
- The whole 44-space board is shown at once during ordinary gameplay.
- The gameplay camera is far away instead of following the active token.
- There is no final four-corner P1/P2/P3/P4 HUD.
- Current-player info remains in a compact bottom bar while the leaderboard sits top-right.
- 44 main spaces + branch corridors are squeezed into the old 1280×720 single-screen composition.
- Several route spaces visually crowd/overlap, especially on the right side.
- The route reads as a graph/prototype instead of a local party-board journey.
- Function-space badges are drawn on top of the old circular-space renderer and add visual clutter.
- The large centered TIN TỨC/LÁ BÀI presentation covers most of the board context.
- Old center copy such as `MeMeMe CITY / DEMO MATCH` remains visible in the board shell.

This is a **presentation integration problem**, not evidence that Draft D topology or 0.1.56 branch-content rules failed.

## Root cause confirmed in code

### 1. `START_PLAYTEST.bat` is correctly the canonical launcher

`public/START_PLAYTEST.bat` launches the normal root URL through `serve-playtest.ps1`. It is not accidentally opening the Draft D preview.

### 2. `main.ts` does activate the 0.1.56 scene

`src/main.ts` imports:

`CareerMinigameBoardScene056 as ActiveBoardScene`

So the screenshots are genuinely from the current standard runtime path.

### 3. 0.1.56 is only a thin wrapper on the old presentation chain

`CareerMinigameBoardScene056` extends `CareerMinigameBoardScene048` and currently only updates visible build copy.

That preserves the important 0.1.48 authority/bugfix chain, but it also means the visual shell still comes from the inherited pre-Draft-D scene architecture.

### 4. The authoritative scene still ultimately uses `DemoBoardScene`

`DemoBoardScene` is an old fixed-screen renderer. It:

- draws every board edge directly into the scene;
- draws every board node as a large 34px circle;
- assumes the board can be read in one 1280×720 view;
- has no world-camera / fixed-UI-camera split;
- has no active-token camera follow;
- contains old prototype header/center/HUD surfaces.

Putting the new 44-space Draft D graph into this renderer naturally creates the crowded screenshot Ron saw.

### 5. `PresentationParityBoardScene` improved the old shell but did not replace it

It hides the original giant center HUD and adds:

- compact bottom turn/action bar;
- top-right score table;
- presentation queue;
- token halos;
- event presentation.

This was useful for earlier MVP testing, but it is **not** the locked final HUD/camera contract.

### 6. The correct camera/HUD architecture already exists in the Draft D preview

`FinalMapPreviewScene052` already demonstrated the desired foundation:

- larger world (`2200×1250`);
- bounded world camera;
- separate fixed UI camera;
- four fixed corner HUDs;
- close active-player focus;
- explicit overview/full-map mode;
- irregular Draft D route spacing;
- district/landmark context.

The mistake was treating that work as preview-only for too long instead of extracting/reusing its presentation architecture in the canonical authoritative runtime.

### 7. The `0.1.25` header is also a real label-cascade bug

The build label chain mutates text by looking for exact previous version strings.

Example:

- `PartyMechanicsBoardScene` turns `0.1.23` into `0.1.25`.
- `TurnStakesBoardScene` later looks for `0.1.24`, so its replacement no longer matches.
- downstream wrappers then also fail to find the version string they expect.

Result: the runtime can actually be 0.1.56 while still displaying `0.1.25`.

Build/version UI must stop depending on chained string replacement.

## Required fix before deeper gameplay work

Open a small blocking milestone **0.1.56.1 — Canonical Presentation Consolidation** before implementing 0.1.57 gameplay authority.

This is not a rollback. It keeps the authoritative 0.1.56 gameplay state and replaces the temporary presentation shell.

### A. Canonical board camera

- Normal turns use a close camera centered near the active token.
- Camera smoothly follows authoritative movement steps.
- Typical frame shows local route context, not the whole map.
- At a branch junction, zoom out only enough to show both choices and nearby spaces.
- After route selection, return to close follow.
- Jail/Hospital later receive dedicated framing when 0.1.57 authoritative holding state lands.
- Full board remains an explicit `OVERVIEW` action only.

### B. Fixed four-corner HUD

Canonical layout:

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right

Each HUD shows at minimum:

- avatar;
- name;
- B$;
- compact hand/job/status information when useful.

Active player receives clear highlight. HUD is screen-space and never moves/zooms with the board camera.

### C. Reuse, do not duplicate, the preview camera foundation

Extract the useful presentation ideas from `FinalMapPreviewScene052` into reusable canonical presentation code instead of maintaining two unrelated renderers.

The authoritative gameplay state remains owned by the current host/match/session stack. Camera/HUD may read that state but must not create a second gameplay model.

### D. Board readability pass

- Stop drawing every ordinary space as a giant 34px circle.
- Use smaller temporary markers appropriate for the close camera.
- Keep branch corridors visibly separated.
- Preserve spacing and asymmetry from Draft D.
- Function-space identity should be integrated into the tile marker rather than stacking multiple competing circles/icons.
- Keep final-art work separate; this milestone needs a clean greybox, not final art.

### E. Event/Card presentation safe framing

The current large center panel obscures too much route context.

Rework presentation so:

- event detail is still readable;
- board/token context remains partially visible;
- player HUDs are not covered;
- input prompt is visually attached to the event surface;
- mobile/landscape safe areas remain viable.

This does not change TIN TỨC/LÁ BÀI rules or authority.

### F. Replace brittle build-label mutation

Introduce one current build/version source for visible runtime labels.

Do not rely on wrappers searching for exact prior strings such as `0.1.24`, `0.1.25`, `0.1.48`.

Acceptance:

- standard runtime clearly identifies the actual build;
- no old MVP version survives accidentally in visible UI;
- tests verify the source rather than a chain of text rewrites.

## 0.1.56.1 acceptance gate

Before moving to 0.1.57, Ron should manually confirm `START_PLAYTEST.bat` now feels like the primary/best build rather than a debug shell.

Required checks:

1. Standard gameplay no longer starts in full-map view.
2. Camera follows the active token smoothly.
3. Four player HUDs remain fixed in screen corners.
4. Branch choice briefly frames both paths, then returns to close follow.
5. Explicit Overview shows the complete board and can return to gameplay view.
6. 44-space Draft D board no longer appears cramped/overlapped during normal turns.
7. TIN TỨC/LÁ BÀI presentation does not swallow the whole playfield.
8. Visible build label is current and not `0.1.25`.
9. Roll For Order, Job, Mini Game, route choice, money, READY, replay/checksum, multiplayer parity and final result remain unchanged.
10. 0.1.48 authority/bugfix regressions stay green.

## Roadmap impact

Do **not** discard the approved gameplay roadmap.

Updated order:

- 0.1.54 sandbox AUTO/MANUAL — done
- 0.1.55 canonical Draft D topology — CI green
- 0.1.56 branch identity — CI green, presentation rejected as canonical shell
- **0.1.56.1 canonical presentation consolidation — immediate blocker**
- 0.1.57 authoritative Jail/Hospital/Lottery + holding-state Mini Game eligibility
- 0.1.58 TIN TỨC/LÁ BÀI depth
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains parallel and feeds 0.1.58.

## Important non-goals for 0.1.56.1

Do not mix in:

- authoritative Jail/Hospital/Lottery logic;
- new TIN TỨC/LÁ BÀI effect families;
- new Mini Game types;
- final economy rebalance;
- final map art.

The point is to make **the existing canonical gameplay readable and presentable before piling more systems on top of it**.

## Source-of-truth UI references

Read together:

- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
- `docs/UI_FINAL_PLAYER_HUD.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`
- `src/scenes/FinalMapPreviewScene052.ts` for proven preview techniques

The PNG is composition/mood reference only. AI text/numbering is not authoritative.
