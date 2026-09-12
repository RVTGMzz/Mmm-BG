# MeMeMe MVP 0.1 — Core Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Đã triển khai

Milestone đầu tiên cố tình nhỏ: chứng minh vòng lặp board game trước khi nhét hệ Face/Reaction vào.

- Vite + TypeScript + Phaser scaffold.
- Canvas landscape 1280×720, scale FIT cho desktop/mobile.
- City test board data-driven gồm 18 node.
- 4 player token, mỗi người bắt đầu 1000B$.
- Xúc xắc D6.
- Turn manager 4 người.
- Di chuyển từng node có tween.
- Đi qua READY nhận +100B$ để kiểm thử lap trigger.
- Ô tiền cộng/trừ B$.
- Ô `Tin Tức` và `Lá Bài` đã có trigger placeholder.
- HUD turn / dice / tiền / vị trí / event log.
- Click hoặc SPACE để roll.

## Chạy local

```bash
npm install
npm run dev
```

Kiểm tra build:

```bash
npm run build
```

## Data hiện tại

Board nằm tại:

`src/content/city/board_city_mvp.json`

Điều này là chủ ý: map City là content, không phải hard-code vào core engine.

## Chưa triển khai trong milestone này

- nhập tên người chơi;
- upload/chụp 3 biểu cảm;
- cắt/mask mặt thành sticker;
- dynamic face slots trên card;
- deck Lá Bài thật từ `data/cards`;
- deck Tin Tức thật;
- Reaction / Personality / SFX;
- ngã rẽ chẵn-lẻ;
- Job / Pet / Minigame;
- multiplayer online;
- town-building.

## Milestone kế tiếp đề xuất

**MVP 0.1.1 — Face Onboarding**

Flow:

`Setup 4 Players → nhập tên → chọn ảnh Normal / Happy / Angry-Sad → lưu runtime session → render khuôn mặt thành token sticker trên board.`

Sau khi Face Onboarding ổn mới nối Dynamic Card Composition, vì đây là USP quan trọng nhất của MeMeMe.

## Nguyên tắc

Không mở rộng chiều sâu gameplay cho tới khi 4 thứ chạy mượt:

1. Roll → Move → Trigger.
2. Face runtime.
3. Card/News data-driven.
4. Auto-reaction không block turn.
