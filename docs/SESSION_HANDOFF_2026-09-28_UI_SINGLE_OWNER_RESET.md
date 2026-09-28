# MMM — 2026-09-28 — CANONICAL UI SINGLE-OWNER RESET

## Authority
- Source repo: `RVTGMzz/Mmm-BG`
- Branch: `mmm-mvp-0.1-core`
- Source account: `lengochung28191@gmail.com`
- Public mirror: `ronvotri/MeMeMe-Web-Playtest`
- Public URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/
- PR #1 remains Draft/Open.
- Gameplay/network authority was not redesigned in this pass.

## Why this reset exists
The September UI failures were not one typography bug. The live board scene inherits roughly 35 historical scene wrappers, and many older wrappers still contained presentation polish/guard/reflow logic that ran every frame.

Previous browser tests rendered the individual UI producers in isolation. Their fixture did not call the normal `super.create()` and overrode `update() {}`, so a component could pass while the actual played scene was still rewritten by inherited layers.

See:
- `docs/UI_ROOT_CAUSE_AUDIT_2026-09-28.md`

## Canonical ownership cut-over
Runtime source:
- `1b19b9a7ecfc59b86070db6587e29823fd0c0f74`

Core implementation:
- `src/ui/canonicalUiOwner071.ts`
- active scene `CareerMinigameBoardScene07044` exposes `canonicalUiOwner071 = true`.

Historical wrappers remain in the inheritance chain when they retain authority/flow fixes, but their presentation writers now no-op under the canonical owner.

Presentation mutation retired from the live path:
- 065 generic UI-tree rounded proxy writer;
- 066 Mini Game text reflow;
- 067 Job presentation fixer;
- 068 canonical-modal legacy text guard;
- 0681 second HUD/readability/modal-declutter writer;
- 0682 third HUD/strict loose-text ownership writer;
- 069 competing HUD labels + Job Hub/result polish;
- 0701 legacy Mini Game ranking reflow;
- 07044 per-frame Card/News ownership scan;
- 07044 per-frame final modal text scavenger;
- 07044 POST_UPDATE final ownership scavenger.

Retained:
- Host/RNG/network/reconnect/replay behavior;
- CPU fresh-roll-after-release authority watchdog;
- release flow repair;
- canonical direct Card/News renderer;
- canonical Job renderer;
- MiniGameOverlay;
- stable HUD/token/camera/safe-area chrome;
- Character reactions;
- Lap Shuffle visual mirror.

## New full-scene browser regression
New files:
- `tests/ui-single-owner-071.ts`
- `tests/runtime/full-scene-ui.html`
- `tests/runtime/full-scene-ui.ts`
- `tests/runtime/full-scene-ui.mjs`

Unlike the old isolated surface fixture, the new browser fixture:
- extends the same active `CareerMinigameBoardScene07044`;
- calls normal `super.create()`;
- does not replace `update()`;
- leaves the inherited update chain alive;
- renders Card, News, Job and Mini Game ranking;
- waits while inherited updates continue;
- verifies the canonical body is still active, visible, opaque, nonblank and at the intended readable font size;
- captures full-scene screenshots.

The ranking case uses CPU seats only inside the fixture so the Mini Game can resolve automatically; unrelated board CPU autoplay is disabled in the fixture without disabling scene updates.

## Validation
Source CI:
- MMM MVP CI #3314
- run: `36362271301`
- result: **SUCCESS**
- all 137 workflow steps completed without failure.

New architecture gate:
- `[ui-single-owner-071] PASS legacy presentation writers no-op under the live canonical owner`

New full-scene gate:
- `[full-scene-ui] PASS canonical bodies survive normal super.create + inherited update chain`

Scroll viewport pixel gates also passed on WebGL and Canvas under:
- nested transforms;
- non-uniform scaling;
- rotation;
- bottom scrolling;
- camera scroll + zoom.

All reported text-pixel checks had:
- `outside: 0`
- intact left-glyph pixels.

Runtime evidence artifact:
- artifact id `10946560222`
- name `runtime-ui-evidence`
- digest `sha256:7dd620536f02931505a44e529ed44eff7d490641235a9ff7cb5335e504939458`

## Public release
Compiled mirror:
- `22cdc87e5a8f051c702fc512423f2816518042b4`
- message: `Publish compiled playtest 1b19b9a`

Pages:
- Publish playtest Pages #58
- run: `36362462484`
- result: **SUCCESS**

## Acceptance status
### Architecture / automated browser: PASS
For the first time the UI regression test runs the real active scene with inherited updates alive.

### Ron real-device visual acceptance: STILL REQUIRED
Do not claim the month-long UI issue is finished until Ron checks the updated public build against the same failure cases.

Priority device checklist:
1. Job result body is present and readable.
2. Card body is present.
3. News body is complete.
4. Mini Game ranking begins with medal / `Hạng`, with no left-edge clipping.
5. Long copy scrolls and stays inside the paper.
6. Short copy does not live in a huge empty panel.
7. Roll For Order helper/status copy is readable and does not overlap.
8. No loose legacy text reappears after waiting several frames.

If a device-only visual issue remains, fix the canonical producer itself. **Do not reactivate or add another inherited polish/guard/scavenger layer.**
