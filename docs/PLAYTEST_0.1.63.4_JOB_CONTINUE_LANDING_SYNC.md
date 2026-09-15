# MeMeMe MVP 0.1.63.4 — Job Continue + Landing Effect Sync

Build này tập trung đúng hai feedback runtime mới nhất. Camera center-lock từ 0.1.63.2 được giữ nguyên vì đã được xác nhận hoạt động tốt.

## 1. Job Hub không còn nuốt phần bước còn lại

Test tình huống dễ nhìn nhất:

1. Đổ một D6 đủ lớn, ví dụ **5**.
2. Token đi **2 bước** và chạm ô **JOB**.
3. Hoàn tất Job Hub / nhận Job.
4. Token phải tiếp tục **3 bước còn lại** của chính viên D6 ban đầu.
5. Không được dừng lượt ngay tại ô JOB nếu vẫn còn pip chưa dùng.

Nếu phần bước còn lại gặp ngã rẽ, luật HOST vẫn giữ nguyên:
- 1 / 3 / 5 → TRÁI;
- 2 / 4 / 6 → PHẢI.

Job chỉ là một điểm tạm dừng để xử lý, không phải ô chặn kết thúc movement.

## 2. B$ chỉ đổi khi hiệu ứng thực sự tới màn hình

Khi token đang chạy tới một ô tiền như **-20 B$**:

- trong lúc token còn di chuyển, HUD phải giữ số tiền cũ;
- khi token tới đúng ô đích và panel đáp ô / hiệu ứng tiền bắt đầu xuất hiện, HUD mới cập nhật **-20 B$**;
- không được nhìn thấy kết quả tiền trước khi nhân vật tới ô.

Quy tắc tương tự áp dụng cho các hiệu ứng tiền có presentation riêng như READY salary, Card và TIN TỨC: authoritative state có thể tính trước ở HOST, nhưng số B$ hiển thị chỉ commit theo nhịp presentation.

## 3. Regression cần giữ

- Camera phải tiếp tục bám token đang di chuyển, kể cả roll 5/6.
- `TỔNG QUAN / O` vẫn hoạt động.
- Ra Đồn/Bệnh viện vẫn dùng D6 thoát riêng; thành công xong mới có D6 movement mới.
- Không thay economy values, Job pool, Card/News values, Mini Game payout hay Lottery.
- Không có RNG mới ngoài các D6/authority đã tồn tại.

Nếu gặp lỗi, ghi lại tình huống theo dạng: roll bao nhiêu → chạm ô nào ở bước thứ mấy → sau popup xảy ra gì. Screenshot hoặc report cuối trận đều hữu ích.
