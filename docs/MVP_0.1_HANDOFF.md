# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.3 — Card Deck + Target Picker**

Mục tiêu milestone: chuyển từ 1 card prototype sang deck runtime dùng đúng 4 Lá Bài hiện có dữ liệu thật trong spreadsheet, thêm weighted draw, chọn mục tiêu và effect state.

## Đã triển khai

### Core board
- Vite + TypeScript + Phaser.
- Landscape 1280×720.
- City test board data-driven 18 node.
- 4 player + TurnManager + D6 + tween movement.
- READY lap reward, money tiles, Tin Tức placeholder.

### Face runtime
- Setup 4 người chơi.
- Nhập tên riêng từng player.
- 3 expression slots: `neutral`, `happy`, `angry`.
- Neutral bắt buộc; expression thiếu fallback về neutral.
- Ảnh center-crop 256×256 thành sticker ngay trong browser.
- Ảnh chỉ giữ trong memory phiên chơi, chưa upload server.
- Face token và expression runtime đã hoạt động.

### Dynamic Card + Deck 0.1.3
Runtime deck nằm tại `src/content/core/cards_mvp.json` và chỉ chứa 4 card có tên/logic thật trong source spreadsheet:

- `ACT_001 — Trượt Tay` — N — weight 600.
- `ACT_006 — Khóa Mõm` — R — weight 300.
- `ACT_010 — Triệu Hồi Hắc Ín` — SR — weight 90.
- `ACT_012 — Chuyển Sinh Đổi Vận` — SSR — weight 10.

Tổng weight hiện là 1000 vì MVP chỉ có đúng 1 card hoàn thiện ở mỗi rarity. `drawWeightedCard()` dùng trực tiếp các weight này. Không tự fill các Card_ID còn trống.

### Target Picker
- Card `single_other` mở Target Picker.
- Hiện 3 người chơi còn lại với face neutral, tên, B$ và trạng thái khóa.
- Người chơi phải chọn target trước khi gameplay state resolve.
- Đây là input gameplay nên được phép tạm chặn turn; card/reaction presentation sau khi resolve vẫn không block turn.

### Effect runtime
- `Trượt Tay`: lấy tối đa 10B$ từ target.
- `Khóa Mõm`: target không thể dùng Lá Bài trong lượt kế tiếp; status tự hết sau lượt đó.
- `Triệu Hồi Hắc Ín`: trừ 30% B$ hiện có của tất cả người chơi khác.
- `Chuyển Sinh Đổi Vận`: swap toàn bộ B$ giữa caster và target.

**Lưu ý về `Triệu Hồi Hắc Ín`:** source ghi “30% tổng tài sản”. MVP hiện mới tracking B$, chưa có property/job/pet asset layer, nên runtime 0.1.3 tạm áp 30% lên B$. Đây là implementation PoC, không phải thay đổi text/luật source.

### Dynamic Card presentation
- Card face slots vẫn hoàn toàn data-driven.
- Caster/Target face và tên điền runtime.
- Card all-target dùng caster face + presentation `VS TẤT CẢ`.
- Resolution summary được hiển thị trên overlay.
- Overlay tự đóng và không khóa lượt kế tiếp.

### Player status
`PlayerState` đã có `cardBlockTurns` để chứng minh status effect tồn tại qua turn.
HUD hiện icon `🔒` khi player đang bị Khóa Mõm.

## File chính

- `src/core/cards.ts` — weighted draw, target rules, card effect resolver.
- `src/core/types.ts` — PlayerState + card status.
- `src/content/core/cards_mvp.json` — 4 card runtime đã duyệt.
- `src/ui/TargetPicker.ts` — chọn mục tiêu.
- `src/ui/CardOverlay.ts` — dynamic card presentation.
- `src/scenes/BoardScene.ts` — nối deck/target/effect vào turn flow.
- `src/core/session.ts` / `src/systems/faces.ts` — face runtime.

## Chưa triển khai

- inventory/giữ Lá Bài để dùng sau;
- rarity-first pool tách riêng khi mỗi rarity có nhiều card;
- Tin Tức runtime;
- Reaction / Personality / SFX;
- camera capture;
- face detection / background removal;
- ngã rẽ chẵn-lẻ;
- Job / Pet / Minigame;
- multiplayer online;
- town-building.

## Milestone kế tiếp đề xuất

**MVP 0.1.4 — Tin Tức + Reaction Sequencer**

Ưu tiên:
1. đưa một số Tin Tức mẫu vào data runtime;
2. trigger Tin Tức từ tile;
3. thêm reaction sequencer auto `System → caster/affected → spectator`;
4. reaction có delay/overlap nhưng không block turn;
5. bắt đầu dùng personality tags tối thiểu để chứng minh câu phản ứng thay đổi theo người chơi.

## Nguyên tắc MVP

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅ PoC đầu đã chạy.
3. Lá Bài data-driven + weighted draw + effect state. ✅
4. Tin Tức data-driven.
5. Auto-reaction không block turn.
