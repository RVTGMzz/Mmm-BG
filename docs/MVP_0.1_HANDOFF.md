# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.7 — Turn Phase State Machine + Safe Action Windows**

Mục tiêu milestone: bỏ các boolean rời kiểu `rolling/actionBusy` khỏi BoardScene và thay bằng state machine có transition hợp lệ rõ ràng. Đây là lớp nền để gameplay phức tạp hơn nhưng vẫn kiểm soát được lúc nào người chơi được roll, dùng Lá Bài hoặc chọn ngã rẽ.

## Đã triển khai

### Core board
- Vite + TypeScript + Phaser.
- Landscape 1280×720.
- City graph data-driven 20 node.
- 4 player + TurnManager + D6 + tween movement.
- 1 ngã rẽ thật tại node 4.
- READY lap reward + money tiles.
- Lá Bài + Tin Tức đều có runtime flow.

### Face runtime + personality PoC
- Setup 4 người, tên riêng + 3 expression: `neutral`, `happy`, `angry`.
- Face xử lý local trong browser, chưa upload server.
- Reaction personality vẫn là assignment PoC theo ghế để test engine, chưa phải taxonomy/UX final.

### Lá Bài source-backed
Runtime deck vẫn chỉ dùng đúng 4 Lá Bài hiện có dữ liệu thật trong spreadsheet:

- `ACT_001 — Trượt Tay` — N — weight 600.
- `ACT_006 — Khóa Mõm` — R — weight 300.
- `ACT_010 — Triệu Hồi Hắc Ín` — SR — weight 90.
- `ACT_012 — Chuyển Sinh Đổi Vận` — SSR — weight 10.

Không tự điền Card_ID còn trống.

### Card Inventory + Use Timing
Giữ nguyên 0.1.5:

`Đáp ô Lá Bài → weighted draw → card vào hand → trong cửa sổ pre-roll mở tay bài → chọn card → chọn target nếu cần → resolve effect → card bị tiêu hao → overlay/reaction chạy non-blocking.`

PoC rule constants vẫn là:
- hand limit: `3` card;
- tối đa `1` card/lượt.

Đây **không phải luật final**.

### Branching Board Graph
Giữ nguyên 0.1.6:

- board dùng `nodes + edges`;
- player lưu `nodeId`;
- graph được validate trước khi scene chạy;
- ngã rẽ node 4:
  - `PHỐ CHÍNH`: 4 → 5 → 6 → 7
  - `HẺM TẮT`: 4 → 18 → 19 → 7
- mode mặc định `manual` bật `BranchPicker`;
- mode `odd_even` chỉ là config test legacy, chưa phải luật final.

### Turn Phase State Machine 0.1.7
File mới: `src/core/turnPhase.ts`.

Core flow:

`TURN_START → PRE_ROLL_ACTION → ROLLING → MOVING → RESOLVING_TILE → TURN_END → TURN_START`

Có 2 phase tương tác chen vào khi cần:

- `PRE_ROLL_ACTION ↔ CARD_ACTION`
- `MOVING ↔ BRANCH_CHOICE`

State machine có bảng transition hợp lệ. Transition sai sẽ throw error thay vì âm thầm làm game rơi vào state mơ hồ.

Mỗi transition tăng `revision`. HUD hiện phase + revision để QA và chuẩn bị cho snapshot/network sync sau này.

### Safe Action Windows
Action hiện được gate bằng phase:

- `roll` chỉ hợp lệ ở `PRE_ROLL_ACTION`;
- `use_card` chỉ hợp lệ ở `PRE_ROLL_ACTION`;
- route choice chỉ tồn tại trong `BRANCH_CHOICE`.

Khi card picker/target picker đang mở, phase là `CARD_ACTION`, vì vậy spam SPACE hoặc nút roll không thể chen một lượt mới vào giữa thao tác.

Khi đang move/chọn branch/resolve tile/end turn, cả roll và dùng card đều bị khóa bởi state machine.

`BoardScene` không còn dùng `rolling` hoặc `actionBusy` làm nguồn kiểm soát turn flow.

### HUD QA 0.1.7
HUD hiện:
- current player;
- current phase;
- phase revision;
- nút Roll đổi trạng thái theo phase;
- nút Lá Bài chỉ active đúng cửa sổ được phép.

Đây là QA presentation, không phải UI final.

### Tin Tức + Reaction
Giữ nguyên:
- `news_mvp_demo.json` chỉ là demo runtime, chưa phải content Tin Tức được duyệt;
- reaction text chỉ là writing PoC;
- reaction sequence dùng delay/overlap và không block turn;
- SFX hiện mới là `sfxId`, chưa có audio playback.

## File chính

- `src/core/turnPhase.ts` — phase schema, transition table, safe action windows, revision snapshot.
- `src/core/turn.ts` — thứ tự player hiện tại.
- `src/core/board.ts` — graph lookup/validation/parity helper.
- `src/core/types.ts` — board graph + PlayerState.
- `src/core/rules.ts` — PoC branch/card constants.
- `src/ui/BranchPicker.ts` — manual route choice.
- `src/ui/CardHandPicker.ts` — chọn Lá Bài đang giữ.
- `src/ui/TargetPicker.ts` — chọn target khi play card.
- `src/scenes/BoardScene.ts` — orchestration theo TurnPhaseMachine.

## Chưa triển khai

- match state serializable tập trung;
- deterministic/seeded RNG;
- action/event log để replay hoặc network sync;
- luật hand limit/card-per-turn final;
- discard/replace UX khi tay đầy;
- rarity-first pool khi mỗi rarity có nhiều card;
- Tin Tức content final;
- personality setup UX/final taxonomy;
- audio asset + SFX playback;
- camera capture;
- face detection/background removal;
- nhiều branch / board topology final;
- Job / Pet / Minigame;
- multiplayer online;
- town-building;
- win condition final.

## Milestone kế tiếp đề xuất

**MVP 0.1.8 — Serializable Match State + Seeded RNG**

Mục tiêu:
1. gom gameplay state có thể serialize vào một `MatchState` thuần data;
2. tách Phaser objects khỏi state nguồn;
3. dùng seeded RNG cho dice/card/news/spectator selection;
4. ghi action/event log tối thiểu theo `turn + phase revision`;
5. chứng minh cùng seed + cùng action sequence cho cùng kết quả;
6. chuẩn bị nền cho save/replay và multiplayer sync mà chưa cần networking thật.

## Nguyên tắc MVP

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅
3. Lá Bài data-driven + weighted draw + effect state. ✅
4. Tin Tức data-driven. ✅ PoC demo content.
5. Auto-reaction không block turn. ✅ PoC.
6. Card inventory + chủ động use timing. ✅ PoC.
7. Board graph + branch choice. ✅ PoC.
8. Turn phase state machine + safe action windows. ✅ PoC.
