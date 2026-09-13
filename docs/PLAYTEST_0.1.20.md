# MeMeMe Playtest 0.1.20 — Board Readability & Turn Feel

## Test nhanh

Khuyên dùng `1 người + 3 CPU` trước, sau đó thử `HOTSEAT` nếu có thời gian.

### 1. HUD
- giữa bàn không được xuất hiện lại panel điều khiển lớn cũ;
- góc phải chỉ còn status gọn: P#, tên, B$, Lá Bài, khóa nếu có;
- không được thấy `node` hoặc checksum trong score panel mới.

### 2. Người đang tới lượt
- token hiện tại có halo vàng pulse nhẹ;
- khi đổi lượt, halo chuyển đúng người;
- halo đi cùng token, không đứng lại trên ô cũ.

### 3. Xúc xắc
- chỉ xuất hiện lúc roll;
- là mặt xúc xắc pip, không còn ký tự Unicode;
- lắc vài nhịp rồi chốt đúng số authoritative;
- sau đó biến mất trước/đầu chuỗi di chuyển.

### 4. Di chuyển
- quân cờ phải tiếp tục đi từng ô;
- cạnh ngắn nhìn nhanh hơn cạnh dài một chút;
- không được teleport tới đích;
- mỗi node vẫn có bounce/squash nhỏ khi đặt chân.

### 5. Flow giữ nguyên
- CPU-only notification tự đóng theo policy 0.1.19;
- event liên quan trực tiếp P1 trong 1P+3CPU chờ người chơi khi cần;
- Card/News/Reaction không đổi BGM nền;
- odd/even route tự chọn;
- kết quả cuối trận chỉ hiện sau presentation cuối.

## Báo lỗi nên ghi

Nếu có vấn đề, ghi ngắn theo mẫu:

`mode → lượt/player → roll → vấn đề nhìn thấy`

Ví dụ:

`1P+3CPU → P1 lượt 5 → roll 6 → halo đứng lại ô cũ khi token chạy`
