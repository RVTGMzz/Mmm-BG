# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.2 — Dynamic Card Face Slots**

Vertical slice hiện đã chứng minh 3 lớp đầu tiên của MeMeMe:

1. Roll → Move → Trigger.
2. Face runtime cho 4 người.
3. Lá Bài ghép mặt Caster/Target theo data và resolve effect ngay.

## Đã triển khai

### Core board
- Vite + TypeScript + Phaser.
- Canvas landscape 1280×720, scale FIT.
- City board data-driven 18 node.
- 4 player, mỗi người bắt đầu 1000B$.
- D6 + TurnManager.
- Tween di chuyển từng node.
- Qua READY nhận +100B$.
- Money tile cộng/trừ B$.
- Tin Tức đang là placeholder.
- HUD turn / dice / money / position / event log.

### Face onboarding — MVP 0.1.1
- Setup 4 người trước khi vào board.
- Nhập tên riêng từng player.
- 3 expression slots: `neutral`, `happy`, `angry`.
- Neutral bắt buộc; expression thiếu fallback về neutral.
- Ảnh được xử lý local bằng Canvas và center-crop thành sticker 256×256.
- Face chỉ nằm trong memory của phiên chơi, không upload server ở MVP.
- Token trên board dùng mặt thật.
- Expression runtime thay đổi theo sự kiện rồi trở về neutral.

### Dynamic Card — MVP 0.1.2
- Runtime model mới tại `src/core/cards.ts`.
- Prototype data tại `src/content/core/card_prototype.json`.
- Card đầu tiên dùng dữ liệu thật đã duyệt: `ACT_001 — Trượt Tay`.
- Khi người chơi đáp xuống ô Lá Bài:
  - chọn ngẫu nhiên 1 người chơi khác làm target;
  - áp dụng effect ngay: lấy tối đa 10B$ từ target;
  - caster dùng mặt `happy`, target dùng mặt `angry`;
  - overlay card tự ghép đúng 2 mặt + 2 tên;
  - face slot có `role`, `expression`, `x`, `y`, `size`, `rotation` trong data;
  - overlay tự biến mất và **không khóa lượt kế tiếp**.
- Renderer nằm tại `src/ui/CardOverlay.ts`.

## Chạy local

```bash
npm install
npm run dev
```

Kiểm tra build:

```bash
npm run build
```

CI GitHub Actions cũng chạy `npm run build` cho branch/PR.

## Data hiện tại

Board:

`src/content/city/board_city_mvp.json`

Card authoring snapshot:

`data/cards/mvp_cards.json`

Runtime enriched prototype:

`src/content/core/card_prototype.json`

Việc tách authoring data và runtime presentation metadata là chủ ý. `faceSlots` là metadata dành cho renderer, không tự sửa ngược vào spreadsheet gốc khi chưa chốt schema production.

## Chưa triển khai

- deck Lá Bài thật / weighted draw N-R-SR-SSR;
- chọn target bằng UI;
- các effect khác ngoài `steal_money`;
- Tin Tức runtime;
- Reaction / Personality / SFX;
- camera capture;
- ngã rẽ chẵn-lẻ;
- Job / Pet / Minigame;
- multiplayer online;
- town-building.

## Milestone kế tiếp đề xuất

**MVP 0.1.3 — Card Deck + Target Picker**

Mục tiêu:
- đưa 4 lá đã có dữ liệu thật vào runtime (`ACT_001`, `ACT_006`, `ACT_010`, `ACT_012`);
- weighted draw theo rarity/drop weight;
- card cần target sẽ mở target picker nhanh;
- implement các effect state đầu tiên;
- giữ nguyên nguyên tắc effect resolve tách khỏi presentation.

Sau đó mới nối **Tin Tức + Auto Reaction** để hoàn thiện vertical slice.

## Nguyên tắc bất biến

Không mở rộng chiều sâu gameplay cho tới khi 4 thứ chạy mượt:

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅ bản PoC đã có.
3. Card/News data-driven. 🟡 Card đã có prototype, News chưa.
4. Auto-reaction không block turn. ⏳
