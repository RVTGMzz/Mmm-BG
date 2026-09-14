# MeMeMe — Playtest 0.1.51 Draft D Preview

Status: **BRANCHING MAP / CLOSE CAMERA PREVIEW**

## Cách mở

Windows:
1. Giải nén build.
2. Double-click `START_DRAFT_D_PREVIEW.bat`.
3. Giữ cửa sổ PowerShell mở trong lúc test.

So sánh:
- `START_FINAL_MAP_PREVIEW.bat` = bản 0.1.50 cũ, tuyến tính hơn.
- `START_DRAFT_D_PREVIEW.bat` = Draft D 0.1.51 mới.
- `START_PLAYTEST.bat` = gameplay 0.1.48 đã PASS trước đó.

## Mục tiêu test lần này

Draft D tập trung vào feedback sau bản 0.1.50:
- map bớt tuyến tính;
- không còn cảm giác oval/tròn đều;
- khoảng cách ô thoáng hơn;
- thêm 3 ngã rẽ thật;
- camera gần active player hơn;
- HUD 4 góc nhỏ gọn hơn;
- full map chỉ xem khi bấm TỔNG QUAN.

## 3 ngã rẽ

Có 3 junction làm việc:
- sau M04;
- sau M17;
- sau M35.

Tại junction, game tạm zoom ra và hiện hai lựa chọn:
- `PHỐ CHÍNH`
- `LỐI RẼ A/B/C`

Trong preview này, hai đường có cùng số bước để ưu tiên test cảm giác điều hướng. Chưa khóa luật shortcut/risk/reward final.

## Những luật vẫn giữ

- 44 ô main.
- M01 READY.
- M12 Jail Gate.
- M23 Lottery: D6 × 20 B$.
- M34 Hospital Gate.
- Jail: 1/3/5 thoát.
- Hospital: đúng 2/4/5 thoát.
- Jail exit: J1 → J2 → J3 → M13.
- Hospital exit: H1 → H2 → H3 → M35.

## Cần Ron để ý

1. Camera 1.38× có đủ gần chưa hay còn muốn gần hơn?
2. Khi tới junction, zoom ra có đủ nhìn hai đường không?
3. 3 ngã rẽ có làm map bớt cảm giác “đường ray” chưa?
4. Khoảng cách các ô đã thoáng hơn chưa?
5. Ô chữ nhật + branch diamond có thú vị hơn toàn bộ ô tròn không?
6. HUD nhỏ lại có dễ đọc không?
7. Overview có đủ để định hướng toàn map không?
8. Có junction nào đặt ở vị trí khó hiểu hoặc quá gần event lớn không?

## Giới hạn của preview

- Đây vẫn chưa phải final HOST-authoritative map implementation.
- Route choice hiện là local preview interaction.
- Chưa khóa lợi/hại riêng của từng đường rẽ.
- Post-release Jail/Hospital timing vẫn là preview animation, chưa phải rule final.
- Art/background là runtime blockout, không phải final city art.

Nếu gặp lỗi, chụp ảnh hoặc quay clip, đặc biệt khi:
- chọn nhánh;
- camera chuyển zoom;
- token chạy qua rejoin;
- HUD che đường;
- overview quay về active player.