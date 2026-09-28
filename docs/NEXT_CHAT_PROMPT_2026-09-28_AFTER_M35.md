# MMM — NEXT CHAT START HERE — 2026-09-28 — AFTER M35 CẮT TOP XÚC XẮC

## Authority
- source repo: `RVTGMzz/Mmm-BG`
- branch: `mmm-mvp-0.1-core`
- source GitHub account: `lengochung28191@gmail.com`
- public compiled mirror: `ronvotri/MeMeMe-Web-Playtest`
- public test: https://ronvotri.github.io/MeMeMe-Web-Playtest/
- keep PR #1 Draft/Open; do not merge unless Ron explicitly asks.

## Current canonical checkpoint
Repository HEAD before this documentation-only transfer:
- `850691ee69c57abd551e314486fda03b7eae4dce`
- message: `[skip ci] docs: checkpoint M35 Cut Top Dice gameplay upgrade`

Latest validated gameplay/runtime:
- M35 gameplay: `6a0d7108b7cb9cdbde9f9859f0d23cac3b27de6d`
- final validated runtime/UI: `e62d0de4928f3f117518cc4b350cd585c4b60a69`
- CI #3332 / run `36396119982`: **SUCCESS**
- runtime evidence artifact: `10958555873`
- public mirror: `1bfed8711f0e72212cecc082d893fc51d18a3b82`
- Pages #66: **SUCCESS**

## Mini Game state now

### M09 — PHỐ ĐÔNG NGƯỜI
- mode: `majority_minority`
- visible game: **NHIỀU RA ÍT BỊ**
- payout: `25 / 15 / 10 / 0`
- keep as the simple baseline arena for now.

### M17 — KÈO ALL-IN
- mode: `three_doors`
- visible game: **BA CỬA**
- choose A/B/C secretly;
- D6 1–2=A / 3–4=B / 5–6=C;
- matching door survives;
- nobody/all hit => replay;
- final 2 => OẲN TÙ XÌ;
- payout: `35 / 10 / 5 / 0`.
- canonical handoff:
  `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_THREE_DOORS_0711.md`

### M26 — CÒN THỞ CÒN TIỀN
- mode: `solo_buoy`
- visible game: **PHAO ĐƠN**
- choose Phao 1/2/3 secretly;
- only a buoy with exactly one occupant survives;
- crowded buoy occupants are eliminated;
- nobody survives / nobody eliminated => replay;
- final 2 => OẲN TÙ XÌ;
- payout: `20 / 15 / 10 / 5`.
- canonical handoff:
  `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_SOLO_BUOY_0712.md`

### M35 — TOP 2 HOẶC VỀ KHÔNG
- mode: `cut_top_dice`
- visible game: **CẮT TOP XÚC XẮC**
- all contestants roll D6;
- two highest scores take the two Top slots;
- only a tie crossing the Top-2 cutoff rerolls;
- players clearly above cutoff keep their slot;
- never break ties by Player ID/seat order;
- final 2 => OẲN TÙ XÌ;
- payout: `30 / 20 / 0 / 0`.
- canonical handoff:
  `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_CUT_TOP_DICE_0713.md`

### M44 — NƯỚC RÚT CUỐI VÒNG
- currently still `majority_minority`;
- payout must remain `25 / 15 / 5 / 5` during the mechanic pass;
- **this is the next gameplay target**.

## Next chat objective

Continue gameplay development with **M44 as the last arena needing its own 3+ player mechanic**.

Do not immediately invent economy changes. First design a distinct M44 rule that feels like a final-round / end-of-lap moment, then implement it data-driven under the existing Mini Game system.

Required constraints:
1. preserve M44 payout `25 / 15 / 5 / 5` for this mechanic pass;
2. exactly 2 eligible players still use the common OẲN TÙ XÌ final unless Ron explicitly changes that rule;
3. no client `Math.random()`;
4. gameplay ranking logic must be deterministic/replay-safe;
5. wallet mutation stays exclusively in HOST-system `resolve_minigame`;
6. add a pure core test for the mechanic;
7. add/extend browser runtime evidence at 1280×800 and 960×540;
8. manually inspect runtime screenshots before calling it accepted;
9. preserve Jail/Hospital Mini Game eligibility rules;
10. do not reactivate Character passives as part of this work.

## UI architecture guardrail

The September UI regression is considered stabilized at the current checkpoint.

Do not:
- reintroduce legacy presentation wrappers;
- add per-frame UI scavengers;
- create a second owner for Card/News/Job/Mini Game surfaces;
- shrink text just to force long content inside a box.

Continue using the canonical single-owner producers and the fixed-readable-font + scroll containment contract where needed.

## Important visual/runtime checkpoint before gameplay variety
The 2026-09-28 Job + Mini Game readability pass is already accepted provisionally by Ron:
- UI source `50921f723b6526cab57c2a42c9a153619b15ead0`
- validated test HEAD `1f05279791acfcbd8c17bdc539dcc3a4c6da6532`
- CI #3325 SUCCESS
- do not broadly retune those surfaces while implementing M44.

## Suggested files to read first
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_CUT_TOP_DICE_0713.md`
4. `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_SOLO_BUOY_0712.md`
5. `docs/SESSION_HANDOFF_2026-09-28_MINIGAME_THREE_DOORS_0711.md`
6. `src/core/miniGameSlots059.ts`
7. `src/core/minigames.ts`
8. `src/ui/MiniGameOverlay.ts`
9. current Mini Game tests/runtime fixtures.

## Copy-paste prompt for the next chat

> Tiếp tục MMM từ `HANDOFF_CURRENT.md` trên branch `mmm-mvp-0.1-core` của repo `RVTGMzz/Mmm-BG`. Đọc `docs/NEXT_CHAT_PROMPT_2026-09-28_AFTER_M35.md` và ba handoff Mini Game 0711/0712/0713. M17 BA CỬA, M26 PHAO ĐƠN và M35 CẮT TOP XÚC XẮC đã hoàn thành, không làm lại. UI/Job/Mini Game readability hiện tạm chốt, không broad-retune. Bước gameplay kế tiếp là thiết kế và build cơ chế riêng cho M44 NƯỚC RÚT CUỐI VÒNG, giữ payout 25/15/5/5, giữ HOST payout authority, deterministic/replay-safe, 2 người vẫn OẲN TÙ XÌ. Làm một mạch source → test → CI → browser runtime screenshot 1280×800 + 960×540 → tự soi → publish public nếu xanh.
