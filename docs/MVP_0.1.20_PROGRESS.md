# MeMeMe MVP 0.1.20 — Board Readability & Turn Feel

## Mục tiêu

0.1.20 tiếp tục từ 0.1.19 nhưng không mở thêm gameplay rule mới. Mục tiêu là làm mỗi lượt dễ đọc, ít chất QA lộ ra ngoài và chuyển cảm giác từ prototype sang party-board-game rõ hơn.

## Thay đổi chính

### 1. Active-turn halo
- quân cờ của người đang tới lượt có vòng sáng vàng pulse nhẹ;
- halo nằm cùng token nên đi theo token khi di chuyển;
- không ảnh hưởng MatchState/checksum.

### 2. Compact score HUD
- ẩn score/debug panel cũ có `node`, checksum và dữ liệu QA dư thừa;
- thay bằng bảng nhỏ chỉ còn P#, tên, B$, số Lá Bài và trạng thái khóa;
- current player có marker `▶`.

### 3. Distance-aware step pacing
- token vẫn đi từng node như 0.1.19;
- thời gian mỗi bước giờ dựa trên khoảng cách pixel giữa hai node;
- cạnh ngắn đi nhanh, cạnh dài có thêm thời gian nhưng luôn nằm trong giới hạn 170–310ms;
- tránh cảm giác tất cả đoạn đường có cùng vận tốc giả tạo.

### 4. Graphical pip dice
- build active không dùng ký tự Unicode ⚀–⚅ nữa;
- xúc xắc được vẽ bằng rounded square + pip;
- animation chỉ là presentation, kết quả luôn lấy từ `dice_roll` authoritative event;
- không phát sinh RNG mới.

## Regression mới

`npm run test:board-feel`

Khóa các invariant:
- movement duration có min/max ổn định;
- status line không chứa node/checksum debug;
- current/CPU/lock marker format ổn định;
- dice face luôn clamp 1–6.

## Invariants giữ nguyên

- odd/even route tự động;
- Card/News/Reaction timing policy 3s/6s/10s từ 0.1.19;
- result screen chờ presentation cuối;
- BGM không đổi giữa Card/News/Reaction;
- snapshot không replay stale presentation;
- presentation không tiêu RNG gameplay;
- CPU vẫn là QA bot.
