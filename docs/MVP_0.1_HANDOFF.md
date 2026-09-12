# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.1 — Face Onboarding**

Mục tiêu hiện tại là chứng minh USP quan trọng nhất của MeMeMe: người chơi đưa mặt thật vào game và khuôn mặt đó xuất hiện trực tiếp trên token/runtime presentation.

## Đã triển khai

### Core board
- Vite + TypeScript + Phaser scaffold.
- Canvas landscape 1280×720, scale FIT cho desktop/mobile.
- City test board data-driven gồm 18 node.
- 4 player + turn manager.
- Xúc xắc D6.
- Di chuyển từng node có tween.
- Đi qua READY nhận +100B$ để kiểm thử lap trigger.
- Ô tiền cộng/trừ B$.
- Ô `Tin Tức` và `Lá Bài` có trigger placeholder.
- HUD turn / dice / tiền / vị trí / event log.
- Click hoặc SPACE để roll.

### Face onboarding 0.1.1
- Có scene setup riêng trước khi vào bàn cờ.
- 4 người chơi nhập tên độc lập.
- Mỗi người có 3 slot biểu cảm:
  - 😐 `neutral`
  - 😆 `happy`
  - 😡 `angry`
- Ảnh `neutral` bắt buộc để vào game.
- `happy` / `angry` có thể thiếu; runtime fallback về `neutral` để test nhanh.
- Ảnh được đọc và xử lý hoàn toàn trong browser ở MVP, chưa upload server.
- Ảnh được center-crop thành PNG sticker 256×256.
- Sticker treatment: viền đen + viền kem/trắng, phù hợp hướng visual MeMeMe.
- Runtime session giữ tên + face assets của 4 player.
- Board preload face texture từ data URL khi chuyển scene.
- Token trên board dùng mặt thật thay cho chấm màu.
- Biểu cảm runtime đã được test ở mức logic:
  - nhận tiền / card → happy
  - mất tiền / news → angry
  - sau một khoảng ngắn quay về neutral
- Badge màu P1/P2/P3/P4 vẫn giữ để dễ phân biệt khi token đứng chồng.

## File chính

- `src/core/session.ts` — runtime PlayerProfile + FaceAsset.
- `src/systems/faces.ts` — xử lý ảnh thành sticker.
- `src/scenes/SetupScene.ts` — UI nhập tên + chọn biểu cảm.
- `src/scenes/BoardScene.ts` — render face token và đổi expression runtime.
- `src/content/city/board_city_mvp.json` — board test data-driven.

## Privacy hiện tại

MVP **không gửi ảnh mặt lên server**. File được người chơi chọn, xử lý bằng Canvas trong browser và giữ dưới dạng data URL trong bộ nhớ phiên hiện tại.

Đây là lựa chọn cố ý cho PoC, vừa đơn giản vừa tránh thiết kế backend/consent quá sớm.

## Chạy local

```bash
npm install
npm run dev
```

Kiểm tra build:

```bash
npm run build
```

## Chưa triển khai

- camera capture trực tiếp;
- face detection / auto background removal;
- chỉnh crop bằng tay;
- dynamic face slots trên artwork Lá Bài;
- deck Lá Bài thật từ `data/cards`;
- deck Tin Tức thật;
- Reaction / Personality / SFX;
- ngã rẽ chẵn-lẻ;
- Job / Pet / Minigame;
- multiplayer online;
- town-building.

## Milestone kế tiếp

**MVP 0.1.2 — Dynamic Card Face Slots**

Mục tiêu:

`Player A dùng card lên Player B → mở card overlay → lấy đúng mặt/cảm xúc của A + B → ghép runtime vào 2 face slots → hiện tên A/B → đóng overlay → turn flow tiếp tục.`

PoC đầu tiên chỉ cần 1 lá bài mẫu có 2 face slots. Khi pipeline này chạy ổn mới nối toàn bộ card data.

## Nguyên tắc

Không mở rộng chiều sâu gameplay cho tới khi 4 thứ chạy mượt:

1. Roll → Move → Trigger. ✅
2. Face runtime. 🟡 đã có bản đầu, cần test thực tế.
3. Card/News data-driven.
4. Auto-reaction không block turn.
