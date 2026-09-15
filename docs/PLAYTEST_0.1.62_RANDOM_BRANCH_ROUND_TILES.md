# MeMeMe Playtest 0.1.62 — Random Branch + Round Tile Readability

## Vì sao có build này

Build 0.1.62 đi trực tiếp từ feedback playtest người thật:

- camera gameplay cần zoom gần hơn;
- các ô di chuyển/ô thường hình chữ nhật khó nhìn, cần đổi sang ô tròn lớn hơn;
- ngã rẽ không được cho người chơi tự chọn vì làm mất tính hên xui;
- luật chốt: **xí ngầu lẻ → rẽ TRÁI, xí ngầu chẵn → rẽ PHẢI**.

## Thay đổi chính

### 1. Ngã rẽ do xí ngầu quyết định

- 1 / 3 / 5 → **TRÁI**
- 2 / 4 / 6 → **PHẢI**
- người chơi không bấm chọn hướng;
- HOST dùng chính kết quả D6 di chuyển, không tung thêm RNG;
- HOST vẫn ghi `choose_branch` vào command log để replay/checksum/multiplayer giữ deterministic và tương thích lịch sử.

### 2. Camera gần hơn

- active-token follow zoom: **2.15x** (trước đó 1.75x);
- nút **TỔNG QUAN** / phím **O** vẫn giữ full-board framing 0.88x.

### 3. Ô di chuyển tròn và lớn hơn

- runtime 0.1.62 thay thân ô chữ nhật canonical bằng hình tròn;
- ô thường radius 23px;
- ô feature radius 27px;
- ô anchor radius 29px;
- ô giữ Jail/Hospital radius 32px;
- màu, label và logic ô không đổi.

## Không đổi trong build này

- economy / payout / Card / News value;
- Job rules;
- Mini Game rules;
- Jail / Hospital / Lottery rules;
- READY one-lap finish lock;
- TIN TỨC / LÁ BÀI terminology;
- audio/BGM ownership;
- stale-token guard từ 0.1.48.

## Cần anh test gì

1. Chơi bằng `START_PLAYTEST.bat`.
2. Đến ngã rẽ, kiểm tra **không còn màn chọn hướng**.
3. Nhìn mặt xí ngầu rồi đối chiếu:
   - lẻ có đi trái không;
   - chẵn có đi phải không.
4. Xem camera 2.15x có quá gần / vừa / vẫn xa.
5. Xem ô tròn mới có dễ đọc và dễ nhận biết đường đi hơn không.
6. Nếu gặp token snap-back sau nhiều lượt, ghi lại lượt/người chơi nếu nhớ được.
7. Chơi hết ván và gửi `📊 BÁO CÁO PLAYTEST → COPY REPORT` cùng cảm nhận nhanh.

## QA note

0.1.48 vẫn là rollback baseline duy nhất đã được người dùng xác nhận. 0.1.62 là build gameplay/presentation mới cần manual acceptance. PR #1 vẫn Draft/Open và không được merge trong quy trình này.
