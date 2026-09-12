# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.5 — Card Inventory + Use Timing**

Mục tiêu milestone: tách hành vi `rút Lá Bài` khỏi `dùng Lá Bài`. Người chơi đáp ô Lá Bài sẽ giữ card trong tay, sau đó chủ động chọn lúc sử dụng trong lượt của mình.

## Đã triển khai

### Core board
- Vite + TypeScript + Phaser.
- Landscape 1280×720.
- City test board data-driven 18 node.
- 4 player + TurnManager + D6 + tween movement.
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

### Card Inventory 0.1.5
`PlayerState` có thêm:
- `handCardIds`
- `cardsPlayedThisTurn`

Flow mới:

`Đáp ô Lá Bài → weighted draw → card vào hand → lượt sau/chính lượt của player mở tay bài → chọn card → chọn target nếu cần → resolve effect → card bị tiêu hao → overlay/reaction chạy non-blocking.`

Ô Lá Bài **không còn auto-cast**.

Có `CardHandPicker` hiển thị các card đang giữ với rarity, impact, mô tả và target mode.

Nếu người chơi hủy ở Hand Picker hoặc chưa chọn target, card vẫn được giữ lại.

### PoC rule constants
Tạm dùng:
- hand limit: `3` card;
- tối đa `1` card được dùng trong một lượt.

Hai con số này nằm riêng tại `src/core/rules.ts` và được đánh dấu **PoC-only**. Đây **không phải luật MeMeMe đã chốt**.

Legacy prototype từng có giới hạn khác, nhưng legacy chỉ là tài liệu tham khảo nên 0.1.5 không tự coi con số legacy là luật final.

### Khóa Mõm
`Khóa Mõm` chỉ chặn **dùng** Lá Bài, không chặn việc rút card vào tay.

Target bị khóa vẫn có thể đáp ô Lá Bài và tích card. Sau khi lượt bị khóa kết thúc, status tự hết như 0.1.3/0.1.4.

### Turn timing
Trong PoC 0.1.5, player có thể bấm **LÁ BÀI** trước khi roll để chủ động dùng card trong lượt hiện tại.

Hotkey:
- `SPACE`: roll.
- `C`: mở tay bài.

Card overlay/reaction sau khi effect resolve vẫn không block gameplay state.

### Tin Tức + Reaction
Giữ nguyên 0.1.4:
- `news_mvp_demo.json` chỉ là demo runtime, chưa phải content Tin Tức được duyệt;
- reaction text chỉ là writing PoC;
- reaction sequence dùng delay/overlap và không block turn;
- SFX hiện mới là `sfxId`, chưa có audio playback.

## File chính

- `src/core/types.ts` — PlayerState có hand + usage counter.
- `src/core/rules.ts` — PoC hand limit / card-per-turn constants.
- `src/core/cards.ts` — weighted deck + effect resolver.
- `src/ui/CardHandPicker.ts` — UI chọn Lá Bài đang giữ.
- `src/ui/TargetPicker.ts` — target selection khi thật sự play card.
- `src/ui/CardOverlay.ts` — presentation sau khi effect resolve.
- `src/core/news.ts` / `src/ui/NewsOverlay.ts` — Tin Tức runtime demo.
- `src/core/reactions.ts` / `src/ui/ReactionSequencer.ts` — non-blocking auto reaction.
- `src/scenes/BoardScene.ts` — nối inventory/use timing vào turn flow.

## Chưa triển khai

- luật hand limit/card-per-turn final;
- discard/replace UX khi tay đầy;
- rarity-first pool khi mỗi rarity có nhiều card;
- Tin Tức content final;
- personality setup UX/final taxonomy;
- audio asset + SFX playback;
- camera capture;
- face detection/background removal;
- graph board / ngã rẽ;
- Job / Pet / Minigame;
- multiplayer online;
- town-building;
- win condition final.

## Milestone kế tiếp đề xuất

**MVP 0.1.6 — Branching Board Graph PoC**

Mục tiêu:
1. đổi board loop cứng sang graph node/edge data-driven;
2. thêm 1 ngã rẽ thật trên City board;
3. route decision tách khỏi renderer;
4. có thể bật rule chẵn/lẻ legacy bằng config để test, nhưng không khóa nó thành luật final;
5. token vẫn đi từng node và mọi tile/card/news system hiện tại không phải viết lại.

## Nguyên tắc MVP

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅
3. Lá Bài data-driven + weighted draw + effect state. ✅
4. Tin Tức data-driven. ✅ PoC demo content.
5. Auto-reaction không block turn. ✅ PoC.
6. Card inventory + chủ động use timing. ✅ PoC.
