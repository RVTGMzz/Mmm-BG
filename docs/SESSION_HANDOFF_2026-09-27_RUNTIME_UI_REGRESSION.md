# MMM — SESSION HANDOFF 2026-09-27 — RUNTIME UI REGRESSION AFTER 0.1.70.4.29

## Authority
- source repo: `RVTGMzz/Mmm-BG`
- branch: `mmm-mvp-0.1-core`
- main/source GitHub account: `lengochung28191@gmail.com`
- public mirror: `ronvotri/MeMeMe-Web-Playtest`
- public URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/
- PR #1 stays Draft/Open. Do not merge or mark Ready unless Ron explicitly asks.
- Do not start 0.1.71 while these runtime UI regressions are open.

## Latest source state before this handoff
- runtime/UI implementation source: `d13beed6cbb880487c50cd239359d4a4d91311fc`
- CI #3304: **SUCCESS**
- public mirror: `6c31a5af7d3c20ffb1b604590a8e9c6b244b5a96`
- Pages #55: **SUCCESS**
- documentation checkpoint before this handoff: `59f432f50d9dba913da863654eae429eb4bdb12e`

IMPORTANT: CI green does **not** equal visual runtime acceptance. Ron's real-device screenshots taken after Pages #55 show severe visual regressions.

## Ron's latest runtime evidence
Nine screenshots were supplied in the chat on 2026-09-27. Do not ask Ron to re-explain them.

### 1. Job result modal is mostly empty
Observed twice:
- large Job result paper;
- icon is visible;
- title `ĐÃ NHẬN VIỆC` is visible;
- body copy is completely missing;
- tiny `chạm để tiếp tục` remains at the bottom;
- huge unused white/cream area.

This is not acceptable. A successful Job result must always show the resolved job name/details/salary copy at a readable size.

### 2. Mini Game ranking clips from the LEFT
Observed twice:
- `🏆 BẢNG XẾP HẠNG` header is readable;
- ranking rows begin with text such as `ạng 1 • CPU...`, meaning the beginning of the line is clipped;
- medal / first glyph / `H` in `Hạng` can disappear;
- winner voice and footer remain much smaller than the main heading;
- the paper has excessive unused vertical area.

Do not patch individual ranking strings. Fix viewport geometry/layout ownership.

### 3. Card body can be totally blank
Observed on `Ví Ai Nấy Lo` and `Trượt Tay`:
- title is visible;
- pale body viewport is visible;
- colored scroll rails are visible;
- actual canonical body text is absent;
- footer strip / reactions still render.

This strongly suggests the scroll helper's mask/viewport geometry is not aligned with the text in runtime.

### 4. News body can be almost entirely clipped
Observed on `Phí Thành Phố Đồng Loạt`:
- title is visible;
- body panel is visible;
- only a tiny tail of the body, around `0B$).`, remains near the top-left;
- most copy is missing.

This is the same family as the Card/Job failure, not a content-specific problem.

### 5. Global typography/density is still too small
Ron explicitly says the UI still feels too small while leaving large empty spaces.

Examples visible in screenshots:
- Job footer/hint is tiny;
- Mini Game winner voice/footer is tiny;
- Roll For Order helper text is tiny;
- Roll For Order leaves a very large empty lower half;
- several modal bodies use large paper surfaces but little readable content.

## Root-cause hypothesis to verify FIRST
The new shared helper `src/ui/scrollableTextViewport070429.ts` accepts manually supplied `worldX/worldY` mask coordinates while the text lives inside nested/transformed containers.

Runtime symptoms are consistent with a mask and text being in different coordinate spaces:
- full body missing;
- only a tail visible;
- left edge clipped;
- owner/paper itself remains correct.

Do not blindly tweak worldX/worldY constants per surface.

### Preferred architectural correction
Replace the manual world-coordinate contract with a viewport whose:
- text;
- interaction rectangle;
- clip mask;
- scrollbar;
- and scroll state

all derive from the **same local owner transform**.

The next session should investigate a transform-safe/local-space mask implementation. A shared helper is still desirable, but it must not require callers to manually predict global coordinates.

## UI policy Ron explicitly wants
1. Never shrink body typography merely to force long copy into a modal.
2. Use one readable font size per surface.
3. Long copy scrolls vertically.
4. Text must never render beyond the paper.
5. Short copy should NOT sit inside a giant mostly-empty modal.
6. Prefer adaptive modal/paper height for short content.
7. Secondary/helper copy must remain readable on Steam Deck.
8. Fix shared/root systems, never title-specific Card/News patches.

## Suggested next implementation order
### P0 — Repair scroll viewport geometry
- reproduce Job blank body;
- reproduce blank Card;
- reproduce clipped News;
- reproduce Mini Game ranking left crop;
- remove manual world-coordinate masking;
- add a runtime geometry regression gate that tests nested container transforms, not just source-string assertions.

### P1 — Density/readability pass
After content is visible:
- Job: compact result card height around actual content, larger footer/hint;
- Card/News: auto-height or a small/medium/scrolling body policy while preserving a fixed font size;
- Mini Game ranking: larger row/voice/footer typography and reduce unused paper height;
- Roll For Order: enlarge main status/helper text and use the lower half instead of leaving it empty.

### P2 — Real-device acceptance
Test on the public build and inspect screenshots for:
- no missing body copy;
- no left/right clipping;
- no overflow;
- readable helper text;
- no giant empty modal areas;
- drag/scroll still works without dismissing the modal.

Do not declare runtime PASS until Ron visually confirms.

## Existing UI work that must be preserved
- Steam Deck 16:10 shell keeps Phaser `FIT`, no stretch/crop.
- Card/News direct canonical producer remains the intended ownership direction.
- VF-07 Mini Game remains canonical owner.
- Character reaction CH-04 behavior/payout neutrality must not regress.
- gameplay authority, Host RNG, reconnect, Worker/replay, online ownership must stay untouched.

## New-chat prompt
Continue MMM from `HANDOFF_CURRENT.md` on branch `mmm-mvp-0.1-core` of repo `RVTGMzz/Mmm-BG`. Read `docs/SESSION_HANDOFF_2026-09-27_RUNTIME_UI_REGRESSION.md`. Ron's latest 9 runtime screenshots prove 0.1.70.4.29 is NOT visually accepted: Job body disappears, Card body disappears, News body is mostly clipped, Mini Game ranking is clipped on the left, and typography/density is still too small with excessive empty space. First fix the shared scroll viewport coordinate-space bug generically; do not patch individual content. Then do the density/readability pass. Keep fixed readable fonts + scrolling for long copy, but compact short-content modals. Run full CI, publish public mirror, then require real-device screenshot acceptance.
